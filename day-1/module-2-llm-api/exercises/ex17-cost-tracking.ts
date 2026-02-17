/**
 * Exercise 17: Cost Tracking
 *
 * Build a CostTracker utility class to monitor API costs
 * in real time. You've already seen costs in previous exercises (ex1, ex15) —
 * now you'll create a reusable tool for modules M3 and M4.
 *
 * Difficulty: advanced | Estimated time: 20 min
 * Run: npx tsx exercises/ex17-cost-tracking.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Types ===

type SupportedModel = 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-20250514';

type CostRecord = {
  model: SupportedModel;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
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

// === TODO 1: Create the CostTracker class ===
// The class should have:
// - priceMap: prices per model (input and output per million tokens)
//   - haiku: $0.25 input, $1.25 output
//   - sonnet: $3.00 input, $15.00 output
// - records: array of CostRecord
// - budgetLimit: number | null
//
// Methods:
// - track(model, inputTokens, outputTokens, description?): records a call
// - getCost(): returns total accumulated cost
// - getReport(): returns complete CostReport

// class CostTracker {
//   private priceMap = ...;
//   private records: CostRecord[] = [];
//   private budgetLimit: number | null = null;
//
//   track(...) { ... }
//   getCost(): number { ... }
//   getReport(): CostReport { ... }
// }

// === TODO 2: Implement the price map ===
// Haiku 4.5:  $0.25/M input, $1.25/M output
// Sonnet 4:   $3.00/M input, $15.00/M output
// The calculation is: (tokens / 1_000_000) * price

// === TODO 3: Make 5+ API calls and track costs ===
// Use the tracker to record each call.
// Vary between short and long questions.
// Example:
//   const response = await client.messages.create({ ... });
//   tracker.track('claude-haiku-4-5-20251001', response.usage.input_tokens, response.usage.output_tokens, 'description');

// === TODO 4: Generate formatted report ===
// Use getReport() and display:
// - Total calls
// - Total tokens (input + output)
// - Cost per model (table)
// - Total cost

// === TODO 5: Implement budget limit ===
// Add method setLimit(value: number)
// In the track() method, throw an Error if accumulated cost exceeds the limit.
// Test with a low limit to see the error.

// === IMPORTANT: Export the class ===
// export { CostTracker };
// This class will be reused in modules M3 and M4.

console.log('\n--- Exercise 17 complete! ---');
console.log('Hint: see the solution in solutions/ex17-cost-tracking.ts');
