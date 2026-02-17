/**
 * Solution 8: Tools with Result Templates
 *
 * Templates format results for Claude to interpret better.
 * Run: npx tsx solutions/ex8-tools-with-templates.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Simulated data ===

const usersDB: Record<string, {
  name: string;
  email: string;
  plan: string;
  active: boolean;
  createdAt: string;
}> = {
  'joao@company.com': {
    name: 'Joao Silva',
    email: 'joao@company.com',
    plan: 'Pro',
    active: true,
    createdAt: '2025-03-15',
  },
  'maria@company.com': {
    name: 'Maria Santos',
    email: 'maria@company.com',
    plan: 'Enterprise',
    active: true,
    createdAt: '2024-11-01',
  },
};

const productsDB: Record<string, Array<{
  name: string;
  price: number;
  stock: number;
}>> = {
  electronics: [
    { name: 'Notebook Pro 15"', price: 5499, stock: 23 },
    { name: 'Wireless Mouse', price: 149, stock: 156 },
    { name: 'Mechanical Keyboard', price: 399, stock: 45 },
    { name: '27" 4K Monitor', price: 2899, stock: 12 },
  ],
  books: [
    { name: 'Clean Code', price: 89, stock: 200 },
    { name: 'Design Patterns', price: 120, stock: 85 },
  ],
};

// === Templates ===

function templateUser(user: {
  name: string;
  email: string;
  plan: string;
  active: boolean;
  createdAt: string;
}): string {
  return `
=== User Profile ===
Name: ${user.name}
Email: ${user.email}
Plan: ${user.plan}
Status: ${user.active ? 'Active' : 'Inactive'}
Member since: ${user.createdAt}
  `.trim();
}

function templateProductList(
  category: string,
  products: Array<{ name: string; price: number; stock: number }>
): string {
  const lines = products.map(
    (p) => `  - ${p.name.padEnd(25)} $ ${p.price.toFixed(2).padStart(10)}   Stock: ${String(p.stock).padStart(4)}`
  );
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const totalItems = products.reduce((sum, p) => sum + p.stock, 0);

  return `
=== Products: ${category.charAt(0).toUpperCase() + category.slice(1)} ===
${lines.join('\n')}

Summary: ${products.length} products | ${totalItems} units in stock | Total value: $${totalValue.toFixed(2)}
  `.trim();
}

function templateReport(data: {
  title: string;
  period: string;
  metrics: Record<string, number>;
  observations: string[];
}): string {
  const metricLines = Object.entries(data.metrics)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n');
  const obsLines = data.observations.map((o) => `  - ${o}`).join('\n');

  return `
=== ${data.title} ===
Period: ${data.period}

Metrics:
${metricLines}

Observations:
${obsLines}
  `.trim();
}

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'search_user',
    description:
      'Looks up the full profile of a user by email. Returns name, plan, status, and creation date.',
    input_schema: {
      type: 'object' as const,
      properties: {
        email: {
          type: 'string',
          description: 'User email. Example: joao@company.com',
        },
      },
      required: ['email'],
    },
  },
  {
    name: 'list_products',
    description:
      'Lists all products in a category with price and stock. Returns a formatted table.',
    input_schema: {
      type: 'object' as const,
      properties: {
        category: {
          type: 'string',
          description: 'Product category. Options: electronics, books',
        },
      },
      required: ['category'],
    },
  },
  {
    name: 'generate_monthly_report',
    description:
      'Generates a metrics report for a specific month. Returns metrics and observations.',
    input_schema: {
      type: 'object' as const,
      properties: {
        month: {
          type: 'string',
          description: 'Month in YYYY-MM format. Example: 2026-01',
        },
      },
      required: ['month'],
    },
  },
];

// === Handlers with templates ===

function handleSearchUser(input: { email: string }): string {
  const user = usersDB[input.email];
  if (!user) return `User with email "${input.email}" not found.`;
  return templateUser(user);
}

function handleListProducts(input: { category: string }): string {
  const products = productsDB[input.category.toLowerCase()];
  if (!products) return `Category "${input.category}" not found. Available categories: ${Object.keys(productsDB).join(', ')}`;
  return templateProductList(input.category, products);
}

function handleMonthlyReport(input: { month: string }): string {
  // Simulated metrics
  return templateReport({
    title: `Monthly Report`,
    period: input.month,
    metrics: {
      'Active users': 1250,
      'New signups': 89,
      'Revenue ($)': 45600,
      'Average ticket ($)': 365,
      'Churn rate (%)': 2.3,
    },
    observations: [
      '12% growth in new signups vs previous month',
      'Revenue above the $40,000 target',
      'Churn is stable and within expectations',
    ],
  });
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'search_user':
      return handleSearchUser(input as { email: string });
    case 'list_products':
      return handleListProducts(input as { category: string });
    case 'generate_monthly_report':
      return handleMonthlyReport(input as { month: string });
    default:
      return `Unknown tool: ${name}`;
  }
}

// === Tool use loop ===

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
      tools,
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [Tool: ${block.name}(${JSON.stringify(block.input)})]`);
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
        console.log(`  [Formatted result:]\n${result}\n`);
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

await runToolLoop(
  'Look up the profile for user joao@company.com, list the electronics products, and generate the January 2026 report.'
);

console.log('\n--- Exercise 8 complete! ---');
