/**
 * Solution 11: Chained Tools
 *
 * Claude chains 3 tools: data -> metrics -> report.
 * Run: npx tsx solutions/ex11-tool-chaining.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Simulated sales data
const salesDB: Record<
  string,
  Array<{ product: string; value: number; date: string }>
> = {
  '2026-01': [
    { product: 'Pro Plan', value: 299, date: '2026-01-05' },
    { product: 'Enterprise Plan', value: 999, date: '2026-01-12' },
    { product: 'Pro Plan', value: 299, date: '2026-01-20' },
    { product: 'Starter Plan', value: 49, date: '2026-01-25' },
  ],
  '2026-02': [
    { product: 'Enterprise Plan', value: 999, date: '2026-02-03' },
    { product: 'Pro Plan', value: 299, date: '2026-02-10' },
    { product: 'Pro Plan', value: 299, date: '2026-02-14' },
    { product: 'Enterprise Plan', value: 999, date: '2026-02-20' },
    { product: 'Starter Plan', value: 49, date: '2026-02-28' },
  ],
};

const tools: Anthropic.Tool[] = [
  {
    name: 'fetch_sales',
    description:
      'Fetches sales for a specific month. Returns an array of sales with product, value, and date.',
    input_schema: {
      type: 'object' as const,
      properties: {
        month: {
          type: 'string',
          description: 'Month in YYYY-MM format (e.g.: 2026-01)',
        },
      },
      required: ['month'],
    },
  },
  {
    name: 'calculate_metrics',
    description:
      'Calculates metrics from sales data: total, average, count by product.',
    input_schema: {
      type: 'object' as const,
      properties: {
        sales: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              product: { type: 'string' },
              value: { type: 'number' },
              date: { type: 'string' },
            },
          },
          description: 'Array of sales to calculate metrics from',
        },
        month: { type: 'string', description: 'Month identifier' },
      },
      required: ['sales', 'month'],
    },
  },
  {
    name: 'generate_report',
    description:
      'Generates a comparative report between two sets of monthly metrics.',
    input_schema: {
      type: 'object' as const,
      properties: {
        metrics_a: {
          type: 'object',
          description: 'Metrics for the first month',
        },
        metrics_b: {
          type: 'object',
          description: 'Metrics for the second month',
        },
      },
      required: ['metrics_a', 'metrics_b'],
    },
  },
];

function handleFetchSales(input: { month: string }): string {
  const sales = salesDB[input.month];
  if (!sales) return JSON.stringify({ error: `No data for ${input.month}` });
  return JSON.stringify(sales);
}

function handleCalculateMetrics(input: {
  sales: Array<{ product: string; value: number }>;
  month: string;
}): string {
  const total = input.sales.reduce((sum, v) => sum + v.value, 0);
  const average = total / input.sales.length;
  const byProduct: Record<string, { count: number; total: number }> = {};

  for (const v of input.sales) {
    if (!byProduct[v.product]) {
      byProduct[v.product] = { count: 0, total: 0 };
    }
    byProduct[v.product].count++;
    byProduct[v.product].total += v.value;
  }

  return JSON.stringify({
    month: input.month,
    totalSales: input.sales.length,
    revenue: total,
    averageTicket: Math.round(average * 100) / 100,
    byProduct,
  });
}

function handleGenerateReport(input: {
  metrics_a: { month: string; revenue: number; totalSales: number; averageTicket: number };
  metrics_b: { month: string; revenue: number; totalSales: number; averageTicket: number };
}): string {
  const a = input.metrics_a;
  const b = input.metrics_b;
  const revenueGrowth = ((b.revenue - a.revenue) / a.revenue) * 100;
  const salesGrowth = ((b.totalSales - a.totalSales) / a.totalSales) * 100;

  return JSON.stringify({
    period: `${a.month} vs ${b.month}`,
    revenueGrowth: `${revenueGrowth.toFixed(1)}%`,
    salesGrowth: `${salesGrowth.toFixed(1)}%`,
    monthA: { revenue: a.revenue, sales: a.totalSales, ticket: a.averageTicket },
    monthB: { revenue: b.revenue, sales: b.totalSales, ticket: b.averageTicket },
  });
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'fetch_sales':
      return handleFetchSales(input as { month: string });
    case 'calculate_metrics':
      return handleCalculateMetrics(
        input as {
          sales: Array<{ product: string; value: number }>;
          month: string;
        }
      );
    case 'generate_report':
      return handleGenerateReport(input as {
        metrics_a: { month: string; revenue: number; totalSales: number; averageTicket: number };
        metrics_b: { month: string; revenue: number; totalSales: number; averageTicket: number };
      });
    default:
      return `Unknown tool: ${name}`;
  }
}

async function runToolLoop(question: string): Promise<void> {
  console.log(`Question: "${question}"\n`);

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  let step = 0;
  let continueLoop = true;

  while (continueLoop) {
    step++;
    console.log(`--- Step ${step} ---`);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      tools,
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        const inputStr = JSON.stringify(block.input).slice(0, 100);
        console.log(`  [Tool: ${block.name}(${inputStr}...)]`);
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
        console.log(`  [Result: ${result.slice(0, 120)}...]`);
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
  'Compare the sales of January and February 2026. Fetch the data, calculate metrics, and generate a comparative report.'
);

console.log('\n--- Exercise 11 complete! ---');
