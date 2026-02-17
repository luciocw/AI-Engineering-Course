/**
 * Exercise 16: Cost-Aware Tool Use
 *
 * Track tokens and costs for each API call.
 * Implement a CostTracker to monitor spending in real time.
 *
 * Difficulty: Expert
 * Estimated time: 25 minutes
 * Run: npx tsx exercises/ex16-tool-cost-aware.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEPT ===
// Each API call consumes tokens (input + output).
// In tool use loops, costs can multiply rapidly.
// A CostTracker monitors:
// - Input and output tokens per call
// - Accumulated cost in dollars
// - Number of loop iterations
// - Maximum budget to stop if exceeded

// Claude Haiku prices (per 1M tokens):
// Input: $1.00 / 1M tokens
// Output: $5.00 / 1M tokens

// === TODO 1: Implement the CostTracker class ===

// class CostTracker {
//   private calls: Array<{
//     inputTokens: number;
//     outputTokens: number;
//     inputCost: number;
//     outputCost: number;
//   }> = [];
//   private maxBudget: number;
//
//   constructor(maxBudget: number = 0.10) {
//     this.maxBudget = maxBudget;
//   }
//
//   record(response: Anthropic.Message): void {
//     // Extract input_tokens and output_tokens from response.usage
//     // Calculate cost based on prices
//     // Add to the calls array
//   }
//
//   getTotalCost(): number { ... }
//   getTotalTokens(): { input: number; output: number } { ... }
//   getTotalCalls(): number { ... }
//   exceededBudget(): boolean { ... }
//   summary(): string { ... }
// }

// === TODO 2: Define simple tools for testing ===
// Use tools that generate multiple iterations in the loop.

// === TODO 3: Run the tool use loop with CostTracker ===
// After each API call, record in the tracker.
// If budget is exceeded, stop the loop.
// At the end, print the cost summary.

// async function runWithCostTracking(question: string, budget: number): Promise<void> {
//   const tracker = new CostTracker(budget);
//   const messages: Anthropic.MessageParam[] = [{ role: 'user', content: question }];
//
//   while (true) {
//     const response = await client.messages.create({ ... });
//     tracker.record(response);
//
//     if (tracker.exceededBudget()) {
//       console.log('Budget exceeded! Stopping...');
//       break;
//     }
//     // ... process tools ...
//   }
//
//   console.log(tracker.summary());
// }

console.log('\n--- Exercise 16 complete! ---');
console.log('Hint: see the solution in solutions/ex16-tool-cost-aware.ts');
