/**
 * Solution 15: User Confirmation Before Execution
 *
 * Human-in-the-loop for sensitive tools.
 * Run: npx tsx solutions/ex15-user-confirmation.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Simulated file system ===

const filesDB: Record<string, string> = {
  'report.txt': 'Q1 2026 sales report...',
  'config.json': '{"theme": "dark", "lang": "en"}',
  'notes.md': '# Meeting Notes\n- Point 1\n- Point 2',
  'draft.txt': 'Temporary text to delete later',
};

// === Risk classification ===

type ToolRisk = 'safe' | 'sensitive';

const toolRisks: Record<string, ToolRisk> = {
  list_files: 'safe',
  read_file: 'safe',
  delete_file: 'sensitive',
  send_email: 'sensitive',
  rename_file: 'sensitive',
};

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'list_files',
    description: 'Lists all available files in the directory. Safe read operation.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'read_file',
    description: 'Reads the content of a file by name. Safe read operation.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Name of the file to read' },
      },
      required: ['name'],
    },
  },
  {
    name: 'delete_file',
    description:
      'Permanently deletes a file. WARNING: irreversible operation that requires confirmation.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Name of the file to delete' },
      },
      required: ['name'],
    },
  },
  {
    name: 'send_email',
    description:
      'Sends an email. Sensitive operation that requires confirmation before sending.',
    input_schema: {
      type: 'object' as const,
      properties: {
        to: { type: 'string', description: 'Recipient email address' },
        subject: { type: 'string', description: 'Email subject' },
        body: { type: 'string', description: 'Email body' },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  {
    name: 'rename_file',
    description: 'Renames a file. Sensitive operation that requires confirmation.',
    input_schema: {
      type: 'object' as const,
      properties: {
        current_name: { type: 'string', description: 'Current file name' },
        new_name: { type: 'string', description: 'New name for the file' },
      },
      required: ['current_name', 'new_name'],
    },
  },
];

// === Handlers ===

function handleListFiles(): string {
  return JSON.stringify({
    files: Object.keys(filesDB),
    total: Object.keys(filesDB).length,
  });
}

function handleReadFile(input: { name: string }): string {
  const content = filesDB[input.name];
  if (!content) return JSON.stringify({ error: `File "${input.name}" not found` });
  return JSON.stringify({ name: input.name, content, size: content.length });
}

function handleDeleteFile(input: { name: string }): string {
  if (!filesDB[input.name]) {
    return JSON.stringify({ error: `File "${input.name}" not found` });
  }
  delete filesDB[input.name];
  return JSON.stringify({ deleted: input.name, status: 'success' });
}

function handleSendEmail(input: { to: string; subject: string; body: string }): string {
  return JSON.stringify({
    status: 'sent',
    to: input.to,
    subject: input.subject,
    timestamp: new Date().toISOString(),
  });
}

function handleRenameFile(input: { current_name: string; new_name: string }): string {
  if (!filesDB[input.current_name]) {
    return JSON.stringify({ error: `File "${input.current_name}" not found` });
  }
  filesDB[input.new_name] = filesDB[input.current_name];
  delete filesDB[input.current_name];
  return JSON.stringify({ renamed: { from: input.current_name, to: input.new_name } });
}

function executeTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'list_files':
      return handleListFiles();
    case 'read_file':
      return handleReadFile(input as { name: string });
    case 'delete_file':
      return handleDeleteFile(input as { name: string });
    case 'send_email':
      return handleSendEmail(input as { to: string; subject: string; body: string });
    case 'rename_file':
      return handleRenameFile(input as { current_name: string; new_name: string });
    default:
      return `Unknown tool: ${name}`;
  }
}

// === Confirmation flow ===

// Set to track tools that have already been confirmed in this turn
const confirmedTools = new Set<string>();

function processToolCall(
  name: string,
  input: Record<string, unknown>,
  toolUseId: string
): { content: string; isError: boolean } {
  const risk = toolRisks[name] || 'sensitive';

  if (risk === 'sensitive' && !confirmedTools.has(toolUseId)) {
    // Return a confirmation request as the tool result
    const description = generateActionDescription(name, input);
    return {
      content: `CONFIRMATION_REQUIRED: ${description}. Please ask the user to confirm this action.`,
      isError: false,
    };
  }

  const result = executeTool(name, input);
  return { content: result, isError: false };
}

function generateActionDescription(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'delete_file':
      return `Permanently delete the file "${input.name}"`;
    case 'send_email':
      return `Send email to "${input.to}" with subject "${input.subject}"`;
    case 'rename_file':
      return `Rename file from "${input.current_name}" to "${input.new_name}"`;
    default:
      return `Execute ${name}`;
  }
}

// === Loop with confirmation ===

async function runWithConfirmation(questions: string[]): Promise<void> {
  const messages: Anthropic.MessageParam[] = [];

  const systemPrompt = `You are a file management assistant.
When a tool returns "CONFIRMATION_REQUIRED", you MUST:
1. Inform the user exactly what will be done
2. Ask for explicit confirmation before proceeding
3. If the user confirms, execute the tool again
4. If the user denies, cancel the operation`;

  for (const question of questions) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`User: ${question}`);
    console.log('='.repeat(50));

    messages.push({ role: 'user', content: question });

    let continueLoop = true;

    while (continueLoop) {
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        tools,
        messages,
      });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type === 'text') {
          console.log(`\nClaude: ${block.text}`);
        } else if (block.type === 'tool_use') {
          const risk = toolRisks[block.name] || 'sensitive';
          console.log(`  [Tool: ${block.name} (risk: ${risk})]`);

          const { content, isError } = processToolCall(
            block.name,
            block.input as Record<string, unknown>,
            block.id
          );

          console.log(`  [${content.startsWith('CONFIRMATION') ? 'ASKS CONFIRMATION' : 'Executed'}: ${content.slice(0, 80)}...]`);

          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content,
            is_error: isError,
          });
        }
      }

      if (response.stop_reason === 'tool_use') {
        messages.push({ role: 'assistant', content: response.content });
        messages.push({ role: 'user', content: toolResults });
      } else {
        messages.push({ role: 'assistant', content: response.content });
        continueLoop = false;
      }
    }
  }
}

// Simulate conversation with confirmation
await runWithConfirmation([
  'List the available files',
  'Read the content of the notes.md file',
  'Delete the draft.txt file',
  'Yes, you can delete draft.txt',
]);

console.log('\n\nRemaining files:', Object.keys(filesDB));
console.log('\n--- Exercise 15 complete! ---');
