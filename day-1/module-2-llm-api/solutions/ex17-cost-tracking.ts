/**
 * Solution 17: Cost Tracking
 *
 * CostTracker utility class for monitoring API costs in real time.
 * Run: npx tsx solutions/ex17-cost-tracking.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Types ===

type SupportedModel = 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-20250514';

type CostRecord = {
  model: SupportedModel;
  inputTokens: number;
  outputTokens: number;
  costInput: number;
  costOutput: number;
  costTotal: number;
  timestamp: Date;
  description?: string;
};

type CostReport = {
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalInputCost: number;
  totalOutputCost: number;
  totalCost: number;
  byModel: Record<string, {
    calls: number;
    inputTokens: number;
    outputTokens: number;
    cost: number;
  }>;
};

type PriceEntry = { input: number; output: number };

// === CostTracker Class ===

class CostTracker {
  private priceMap: Record<SupportedModel, PriceEntry> = {
    'claude-haiku-4-5-20251001': { input: 0.25, output: 1.25 },
    'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
  };

  private records: CostRecord[] = [];
  private budgetLimit: number | null = null;

  track(
    model: SupportedModel,
    inputTokens: number,
    outputTokens: number,
    description?: string
  ): CostRecord {
    const prices = this.priceMap[model];
    if (!prices) {
      throw new Error(`Unsupported model: ${model}`);
    }

    const costInput = (inputTokens / 1_000_000) * prices.input;
    const costOutput = (outputTokens / 1_000_000) * prices.output;
    const costTotal = costInput + costOutput;

    // Check budget limit BEFORE recording
    const accumulatedCost = this.getCost();
    if (this.budgetLimit !== null && accumulatedCost + costTotal > this.budgetLimit) {
      throw new Error(
        `Budget limit exceeded! ` +
        `Accumulated: $${accumulatedCost.toFixed(6)}, ` +
        `This call: $${costTotal.toFixed(6)}, ` +
        `Limit: $${this.budgetLimit.toFixed(6)}`
      );
    }

    const record: CostRecord = {
      model,
      inputTokens,
      outputTokens,
      costInput,
      costOutput,
      costTotal,
      timestamp: new Date(),
      description,
    };

    this.records.push(record);
    return record;
  }

  getCost(): number {
    return this.records.reduce((sum, r) => sum + r.costTotal, 0);
  }

  setLimit(value: number): void {
    this.budgetLimit = value;
  }

  getReport(): CostReport {
    const byModel: CostReport['byModel'] = {};

    for (const record of this.records) {
      if (!byModel[record.model]) {
        byModel[record.model] = {
          calls: 0,
          inputTokens: 0,
          outputTokens: 0,
          cost: 0,
        };
      }
      const entry = byModel[record.model];
      entry.calls++;
      entry.inputTokens += record.inputTokens;
      entry.outputTokens += record.outputTokens;
      entry.cost += record.costTotal;
    }

    return {
      totalCalls: this.records.length,
      totalInputTokens: this.records.reduce((s, r) => s + r.inputTokens, 0),
      totalOutputTokens: this.records.reduce((s, r) => s + r.outputTokens, 0),
      totalInputCost: this.records.reduce((s, r) => s + r.costInput, 0),
      totalOutputCost: this.records.reduce((s, r) => s + r.costOutput, 0),
      totalCost: this.getCost(),
      byModel,
    };
  }

  printReport(): void {
    const report = this.getReport();

    console.log('\n=== Cost Report ===');
    console.log(`Total calls: ${report.totalCalls}`);
    console.log(`Tokens: ${report.totalInputTokens} input + ${report.totalOutputTokens} output = ${report.totalInputTokens + report.totalOutputTokens} total`);

    console.log('\n--- Cost by Model ---');
    console.log(
      'Model'.padEnd(35) +
        'Calls'.padEnd(12) +
        'Input'.padEnd(12) +
        'Output'.padEnd(12) +
        'Cost'
    );
    console.log('-'.repeat(75));

    for (const [model, data] of Object.entries(report.byModel)) {
      console.log(
        model.padEnd(35) +
          String(data.calls).padEnd(12) +
          String(data.inputTokens).padEnd(12) +
          String(data.outputTokens).padEnd(12) +
          `$${data.cost.toFixed(6)}`
      );
    }

    console.log('-'.repeat(75));
    console.log(
      'TOTAL'.padEnd(35) +
        String(report.totalCalls).padEnd(12) +
        String(report.totalInputTokens).padEnd(12) +
        String(report.totalOutputTokens).padEnd(12) +
        `$${report.totalCost.toFixed(6)}`
    );

    console.log(`\n  Input Cost:  $${report.totalInputCost.toFixed(6)}`);
    console.log(`  Output Cost: $${report.totalOutputCost.toFixed(6)}`);
    console.log(`  Total Cost:  $${report.totalCost.toFixed(6)}`);

    if (this.budgetLimit !== null) {
      const percentage = (report.totalCost / this.budgetLimit) * 100;
      console.log(`\n  Budget: $${this.budgetLimit.toFixed(6)} (${percentage.toFixed(1)}% used)`);
    }
  }
}

// Export for use in M3 and M4
export { CostTracker };
export type { SupportedModel, CostRecord, CostReport };

// === Demo ===

async function demonstrateCostTracker() {
  const tracker = new CostTracker();

  console.log('=== CostTracker: Real-Time Cost Tracking ===\n');

  // 5 varied calls
  const questions = [
    { text: 'What is machine learning? Answer in 1 sentence.', desc: 'Short question - ML' },
    { text: 'List 3 benefits of TypeScript over JavaScript.', desc: 'Short list - TS vs JS' },
    { text: 'Explain the Observer pattern in object-oriented programming.', desc: 'Explanation - Design Pattern' },
    { text: 'Write a TypeScript function that calculates the factorial of a number.', desc: 'Code - Factorial' },
    { text: 'What are the differences between REST and GraphQL? Make a brief comparison.', desc: 'Comparison - REST vs GraphQL' },
  ];

  for (const question of questions) {
    console.log(`Call: ${question.desc}...`);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: question.text }],
    });

    const record = tracker.track(
      'claude-haiku-4-5-20251001',
      response.usage.input_tokens,
      response.usage.output_tokens,
      question.desc
    );

    console.log(`  -> ${record.inputTokens} in + ${record.outputTokens} out = $${record.costTotal.toFixed(6)}`);
  }

  // Full report
  tracker.printReport();

  // Test budget limit
  console.log('\n=== Budget Limit Test ===');
  tracker.setLimit(0.001); // Very low limit to demonstrate

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: 'Write a poem about programming.' }],
    });

    tracker.track(
      'claude-haiku-4-5-20251001',
      response.usage.input_tokens,
      response.usage.output_tokens,
      'Limit test'
    );
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Limit reached (expected): ${error.message}`);
    }
  }
}

demonstrateCostTracker().then(() => {
  console.log('\n--- Exercise 17 complete! ---');
});
