/**
 * Solution 16: Cost-Aware Tool Use
 *
 * CostTracker to monitor tokens and costs in real time.
 * Run: npx tsx solutions/ex16-tool-cost-aware.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Prices per 1M tokens (Claude Haiku) ===
const PRICE_INPUT_PER_MILLION = 1.0;
const PRICE_OUTPUT_PER_MILLION = 5.0;

// === CostTracker ===

class CostTracker {
  private calls: Array<{
    iteration: number;
    inputTokens: number;
    outputTokens: number;
    costInput: number;
    costOutput: number;
    toolsCalled: string[];
  }> = [];
  private maxBudget: number;

  constructor(maxBudget: number = 0.10) {
    this.maxBudget = maxBudget;
  }

  record(response: Anthropic.Message, toolsCalled: string[] = []): void {
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const costInput = (inputTokens / 1_000_000) * PRICE_INPUT_PER_MILLION;
    const costOutput = (outputTokens / 1_000_000) * PRICE_OUTPUT_PER_MILLION;

    this.calls.push({
      iteration: this.calls.length + 1,
      inputTokens,
      outputTokens,
      costInput,
      costOutput,
      toolsCalled,
    });

    console.log(
      `  [Cost iteration ${this.calls.length}: ` +
      `${inputTokens} in + ${outputTokens} out = ` +
      `$${(costInput + costOutput).toFixed(6)} | ` +
      `Accumulated: $${this.getTotalCost().toFixed(6)}]`
    );
  }

  getTotalCost(): number {
    return this.calls.reduce((sum, c) => sum + c.costInput + c.costOutput, 0);
  }

  getTotalTokens(): { input: number; output: number } {
    return {
      input: this.calls.reduce((sum, c) => sum + c.inputTokens, 0),
      output: this.calls.reduce((sum, c) => sum + c.outputTokens, 0),
    };
  }

  getTotalCalls(): number {
    return this.calls.length;
  }

  exceededBudget(): boolean {
    return this.getTotalCost() >= this.maxBudget;
  }

  summary(): string {
    const tokens = this.getTotalTokens();
    const totalCost = this.getTotalCost();

    const lines = [
      '\n=== Cost Summary ===',
      `API calls: ${this.calls.length}`,
      `Input tokens: ${tokens.input.toLocaleString()}`,
      `Output tokens: ${tokens.output.toLocaleString()}`,
      `Total tokens: ${(tokens.input + tokens.output).toLocaleString()}`,
      `Total cost: $${totalCost.toFixed(6)}`,
      `Max budget: $${this.maxBudget.toFixed(6)}`,
      `Budget usage: ${((totalCost / this.maxBudget) * 100).toFixed(1)}%`,
      '',
      'Breakdown by iteration:',
    ];

    for (const c of this.calls) {
      lines.push(
        `  #${c.iteration}: ${c.inputTokens} in + ${c.outputTokens} out = ` +
        `$${(c.costInput + c.costOutput).toFixed(6)}` +
        (c.toolsCalled.length > 0 ? ` [tools: ${c.toolsCalled.join(', ')}]` : '')
      );
    }

    return lines.join('\n');
  }
}

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'fetch_data',
    description: 'Fetches data from a table. Returns filtered records.',
    input_schema: {
      type: 'object' as const,
      properties: {
        table: { type: 'string', description: 'Table name: users, sales, products' },
        filter: { type: 'string', description: 'Optional filter' },
      },
      required: ['table'],
    },
  },
  {
    name: 'calculate_statistics',
    description: 'Calculates statistics (average, sum, max, min) for a dataset.',
    input_schema: {
      type: 'object' as const,
      properties: {
        data: { type: 'array', items: { type: 'number' }, description: 'Array of numbers' },
        operation: { type: 'string', enum: ['average', 'sum', 'max', 'min'], description: 'Operation' },
      },
      required: ['data', 'operation'],
    },
  },
  {
    name: 'format_report',
    description: 'Formats data into a structured text report.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'Report title' },
        data: { type: 'object', description: 'Data for the report' },
      },
      required: ['title', 'data'],
    },
  },
];

// === Handlers ===

const tablesDB: Record<string, unknown[]> = {
  users: [
    { name: 'Ana', plan: 'Pro', spending: 299 },
    { name: 'Carlos', plan: 'Enterprise', spending: 999 },
    { name: 'Julia', plan: 'Starter', spending: 49 },
    { name: 'Pedro', plan: 'Pro', spending: 299 },
  ],
  sales: [
    { month: 'Jan', value: 15000 },
    { month: 'Feb', value: 18500 },
    { month: 'Mar', value: 22000 },
  ],
  products: [
    { name: 'Starter Plan', price: 49, customers: 350 },
    { name: 'Pro Plan', price: 299, customers: 120 },
    { name: 'Enterprise Plan', price: 999, customers: 45 },
  ],
};

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'fetch_data': {
      const table = tablesDB[input.table as string];
      if (!table) return JSON.stringify({ error: `Table "${input.table}" not found` });
      return JSON.stringify(table);
    }
    case 'calculate_statistics': {
      const data = input.data as number[];
      const op = input.operation as string;
      const ops: Record<string, (d: number[]) => number> = {
        average: (d) => d.reduce((a, b) => a + b, 0) / d.length,
        sum: (d) => d.reduce((a, b) => a + b, 0),
        max: (d) => Math.max(...d),
        min: (d) => Math.min(...d),
      };
      const fn = ops[op];
      if (!fn) return JSON.stringify({ error: `Operation "${op}" is invalid` });
      return JSON.stringify({ operation: op, result: fn(data) });
    }
    case 'format_report':
      return JSON.stringify({
        report: `=== ${input.title} ===\n${JSON.stringify(input.data, null, 2)}`,
      });
    default:
      return `Unknown tool: ${name}`;
  }
}

// === Tool use loop with Cost Tracking ===

async function runWithCostTracking(
  question: string,
  budget: number
): Promise<void> {
  console.log(`\nQuestion: "${question}"`);
  console.log(`Max budget: $${budget.toFixed(4)}\n`);

  const tracker = new CostTracker(budget);
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

    // Collect names of called tools
    const toolNames = response.content
      .filter((b) => b.type === 'tool_use')
      .map((b) => (b as Anthropic.ToolUseBlock).name);

    tracker.record(response, toolNames);

    if (tracker.exceededBudget()) {
      console.log('\n  *** BUDGET EXCEEDED — stopping loop ***');
      // Send partial response for Claude to finalize
      const textBlocks = response.content.filter((b) => b.type === 'text');
      if (textBlocks.length > 0) {
        console.log(`Claude: ${(textBlocks[0] as Anthropic.TextBlock).text}`);
      }
      break;
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [Tool: ${block.name}]`);
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
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

  console.log(tracker.summary());
}

// === Tests ===

await runWithCostTracking(
  'Fetch the sales data, calculate the average of the values, and format a report with the result.',
  0.05
);

console.log('\n--- Exercise 16 complete! ---');
