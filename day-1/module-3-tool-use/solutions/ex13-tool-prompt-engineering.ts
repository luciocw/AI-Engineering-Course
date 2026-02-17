/**
 * Solution 13: Prompt Engineering for Tool Use
 *
 * System prompts and tool_choice to control tool usage.
 * Run: npx tsx solutions/ex13-tool-prompt-engineering.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Simulated data ===

const accountDB = {
  balance: 15780.50,
  holder: 'Carlos Mendes',
  account: '1234-5',
};

const statementData = [
  { date: '2026-02-15', description: 'Salary', value: 8500, type: 'credit' },
  { date: '2026-02-14', description: 'Grocery store', value: -450.30, type: 'debit' },
  { date: '2026-02-13', description: 'Netflix', value: -55.90, type: 'debit' },
  { date: '2026-02-10', description: 'Freelance', value: 2000, type: 'credit' },
  { date: '2026-02-08', description: 'Rent', value: -2800, type: 'debit' },
];

const investmentsData = [
  { name: 'Treasury Bonds', value: 25000, yield: '13.25% p.a.', type: 'fixed_income' },
  { name: 'CDB Bank X', value: 10000, yield: '110% CDI', type: 'fixed_income' },
  { name: 'Stock Fund', value: 5000, yield: '-2.3% this month', type: 'variable_income' },
];

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'check_balance',
    description:
      'Checks the current balance of the user\'s checking account. Returns balance, holder, and account number.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'check_statement',
    description:
      'Checks the latest account transactions. Returns date, description, value, and type (credit/debit).',
    input_schema: {
      type: 'object' as const,
      properties: {
        limit: {
          type: 'number',
          description: 'Number of transactions to return (default: 5)',
        },
      },
      required: [],
    },
  },
  {
    name: 'make_transfer',
    description:
      'Performs a bank transfer. IMPORTANT: Irreversible operation. Always confirm with the user first.',
    input_schema: {
      type: 'object' as const,
      properties: {
        recipient: { type: 'string', description: 'Recipient name or account' },
        amount: { type: 'number', description: 'Amount to transfer in dollars' },
        description: { type: 'string', description: 'Transfer description' },
      },
      required: ['recipient', 'amount'],
    },
  },
  {
    name: 'check_investments',
    description:
      'Checks the user\'s investment portfolio. Returns name, invested amount, yield, and type.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
];

// === System prompt that controls behavior ===

const systemPrompt = `You are a professional and prudent financial assistant.

Tool usage rules:
1. ALWAYS check the balance before suggesting transfers or investments.
2. NEVER execute make_transfer without first explicitly confirming with the user: state the amount, recipient, and ask for confirmation.
3. For questions about financial status, check BOTH the balance AND the statement for a complete answer.
4. For investment advice, check the balance and current investments first.
5. Format all monetary values in dollars ($) with 2 decimal places.
6. Be prudent: when in doubt, query more data before advising.
7. Never make up data — use ONLY information returned by the tools.`;

// === Handlers ===

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'check_balance':
      return JSON.stringify(accountDB);
    case 'check_statement': {
      const limit = (input.limit as number) || 5;
      return JSON.stringify(statementData.slice(0, limit));
    }
    case 'make_transfer':
      return JSON.stringify({
        status: 'confirmation_pending',
        recipient: input.recipient,
        amount: input.amount,
        message: 'Transfer requires user confirmation',
      });
    case 'check_investments':
      return JSON.stringify(investmentsData);
    default:
      return `Unknown tool: ${name}`;
  }
}

// === Tool use loop ===

async function runToolLoop(
  question: string,
  toolChoice?: Anthropic.MessageCreateParams['tool_choice']
): Promise<void> {
  console.log(`\nQuestion: "${question}"`);
  if (toolChoice) console.log(`tool_choice: ${JSON.stringify(toolChoice)}`);
  console.log();

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  let continueLoop = true;

  while (continueLoop) {
    const params: Anthropic.MessageCreateParams = {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages,
    };

    if (toolChoice) {
      params.tool_choice = toolChoice;
    }

    const response = await client.messages.create(params);

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [Tool: ${block.name}(${JSON.stringify(block.input)})]`);
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
        console.log(`  [Result: ${result.slice(0, 100)}...]`);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });
      // After the first iteration, use auto to avoid infinite loop
      toolChoice = undefined;
    } else {
      continueLoop = false;
    }
  }
}

// === Test 1: Behavior with system prompt ===
console.log('=== Test 1: System prompt guiding tools ===');
await runToolLoop('Is my balance good enough to invest more in fixed income?');

console.log('\n' + '='.repeat(60));

// === Test 2: tool_choice = 'any' ===
console.log('\n=== Test 2: tool_choice = any (forces tool use) ===');
await runToolLoop('How is my account?', { type: 'any' });

console.log('\n' + '='.repeat(60));

// === Test 3: tool_choice with specific tool ===
console.log('\n=== Test 3: tool_choice = specific tool ===');
await runToolLoop('I want to see my data', { type: 'tool', name: 'check_investments' });

console.log('\n--- Exercise 13 complete! ---');
