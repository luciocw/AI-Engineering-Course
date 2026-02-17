/**
 * Solution 6: Effective Tool Descriptions
 *
 * Comparison between bad and good descriptions.
 * Run: npx tsx solutions/ex6-effective-descriptions.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Tools with BAD descriptions ===

const badTools: Anthropic.Tool[] = [
  {
    name: 'search',
    description: 'Searches for stuff',
    input_schema: {
      type: 'object' as const,
      properties: {
        q: { type: 'string', description: 'query' },
      },
      required: ['q'],
    },
  },
  {
    name: 'calculate',
    description: 'Does calculations',
    input_schema: {
      type: 'object' as const,
      properties: {
        expr: { type: 'string', description: 'expression' },
      },
      required: ['expr'],
    },
  },
  {
    name: 'send',
    description: 'Sends a message',
    input_schema: {
      type: 'object' as const,
      properties: {
        dest: { type: 'string', description: 'destination' },
        msg: { type: 'string', description: 'message' },
      },
      required: ['dest', 'msg'],
    },
  },
];

// === Tools with GOOD descriptions ===

const goodTools: Anthropic.Tool[] = [
  {
    name: 'search_documents',
    description:
      'Searches internal company documents by keywords. ' +
      'Searches in the title and content of documents such as policies, manuals, and procedures. ' +
      'Returns a list with title, summary, and last updated date for each document found. ' +
      'Use when the user asks about company documents, policies, or procedures. ' +
      'Do NOT use for internet searches or external information.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description:
            'Keywords for the search. Examples: "vacation policy", "onboarding manual", "reimbursement procedure"',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (1-20, default: 5)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'financial_calculator',
    description:
      'Performs financial calculations such as compound interest, ROI, profit margin, and currency conversion. ' +
      'Use for questions involving numerical calculations with money or percentages. ' +
      'Do NOT use for simple math operations (addition, subtraction) — Claude can do those on its own. ' +
      'Returns the result formatted in USD with 2 decimal places.',
    input_schema: {
      type: 'object' as const,
      properties: {
        type: {
          type: 'string',
          enum: ['compound_interest', 'roi', 'profit_margin', 'currency_conversion'],
          description: 'Type of financial calculation',
        },
        values: {
          type: 'object',
          description:
            'Values for the calculation. For interest: {principal, rate, months}. For ROI: {investment, return}. For margin: {cost, selling_price}.',
        },
      },
      required: ['type', 'values'],
    },
  },
  {
    name: 'send_notification',
    description:
      'Sends a push notification to a user or team in the internal system. ' +
      'The notification appears on the recipient\'s dashboard in real time. ' +
      'Use for alerts, reminders, or announcements that need immediate attention. ' +
      'Do NOT use for sending emails (use send_email for that). ' +
      'Returns confirmation with notification ID and delivery status.',
    input_schema: {
      type: 'object' as const,
      properties: {
        recipient: {
          type: 'string',
          description: 'User ID or team name. Examples: "user_123", "sales_team"',
        },
        title: {
          type: 'string',
          description: 'Short notification title (max 100 characters)',
        },
        message: {
          type: 'string',
          description: 'Notification body with details',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'urgent'],
          description: 'Priority level (default: medium)',
        },
      },
      required: ['recipient', 'title', 'message'],
    },
  },
];

// === Simulated handlers ===

function handleSearchDocuments(input: { query: string; limit?: number }): string {
  const docs = [
    { title: 'Vacation Policy 2026', summary: 'Rules and procedures for requesting vacation', date: '2026-01-15' },
    { title: 'Employee Handbook', summary: 'Complete guide to company policies and benefits', date: '2025-12-01' },
    { title: 'Reimbursement Procedure', summary: 'How to request expense reimbursement', date: '2026-02-01' },
  ];
  const results = docs.filter(
    (d) => d.title.toLowerCase().includes(input.query.toLowerCase()) ||
           d.summary.toLowerCase().includes(input.query.toLowerCase())
  );
  return JSON.stringify(results.slice(0, input.limit || 5));
}

function handleFinancialCalculator(input: { type: string; values: Record<string, number> }): string {
  switch (input.type) {
    case 'compound_interest': {
      const { principal, rate, months } = input.values;
      const amount = principal * Math.pow(1 + rate / 100, months);
      return JSON.stringify({ amount: amount.toFixed(2), interest: (amount - principal).toFixed(2) });
    }
    case 'roi': {
      const roi = ((input.values.return - input.values.investment) / input.values.investment) * 100;
      return JSON.stringify({ roi: `${roi.toFixed(2)}%` });
    }
    case 'profit_margin': {
      const margin = ((input.values.selling_price - input.values.cost) / input.values.selling_price) * 100;
      return JSON.stringify({ margin: `${margin.toFixed(2)}%` });
    }
    default:
      return JSON.stringify({ error: 'Invalid calculation type' });
  }
}

function handleSendNotification(input: {
  recipient: string;
  title: string;
  message: string;
  priority?: string;
}): string {
  return JSON.stringify({
    id: `notif_${Date.now()}`,
    recipient: input.recipient,
    title: input.title,
    priority: input.priority || 'medium',
    status: 'delivered',
  });
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'search_documents':
      return handleSearchDocuments(input as { query: string; limit?: number });
    case 'financial_calculator':
      return handleFinancialCalculator(input as { type: string; values: Record<string, number> });
    case 'send_notification':
      return handleSendNotification(input as { recipient: string; title: string; message: string; priority?: string });
    default:
      return `Unknown tool: ${name}`;
  }
}

// === Comparative test ===

async function testDescriptions(
  tools: Anthropic.Tool[],
  label: string,
  question: string
): Promise<void> {
  console.log(`\n=== ${label} ===`);
  console.log(`Question: "${question}"\n`);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    tools,
    messages: [{ role: 'user', content: question }],
  });

  for (const block of response.content) {
    if (block.type === 'text') {
      console.log(`  Claude: ${block.text}`);
    } else if (block.type === 'tool_use') {
      console.log(`  Tool chosen: ${block.name}`);
      console.log(`  Input: ${JSON.stringify(block.input)}`);
    }
  }
}

const question = 'I need to find the document about the company vacation policy';

await testDescriptions(badTools, 'With BAD descriptions', question);
await testDescriptions(goodTools, 'With GOOD descriptions', question);

// === Full tool loop test using good tools ===

console.log('\n=== Full loop with good tools ===');

async function runToolLoop(question: string): Promise<void> {
  console.log(`\nQuestion: "${question}"\n`);

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  let continueLoop = true;

  while (continueLoop) {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: goodTools,
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [Tool: ${block.name}(${JSON.stringify(block.input)})]`);
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
        console.log(`  [Result: ${result}]`);
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
    } else {
      continueLoop = false;
    }
  }
}

await runToolLoop('Search the vacation document and calculate the ROI of a $10,000 investment that returned $15,000.');

console.log('\n--- Exercise 6 complete! ---');
