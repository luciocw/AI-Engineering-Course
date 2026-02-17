/**
 * Exercise 14: Error Handling in Tool Use
 *
 * Implement retries, timeouts, and graceful degradation.
 * Run: npx tsx exercises/ex14-error-handling.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === TODO 1: Tool with automatic retry ===
// Create a "get_price" tool that simulates intermittent failures.
// The handler should fail 50% of the time (Math.random() < 0.5).
// Implement retry with up to 3 attempts.

// function handleGetPrice(input: { product: string }): string {
//   if (Math.random() < 0.5) throw new Error('Service temporarily unavailable');
//   const prices: Record<string, number> = { laptop: 4500, mouse: 89, keyboard: 250 };
//   return JSON.stringify({ product: input.product, price: prices[input.product] ?? 0 });
// }

// async function withRetry<T>(fn: () => T, maxRetries = 3): Promise<T> {
//   for (let i = 0; i < maxRetries; i++) {
//     try { return fn(); }
//     catch (e) { console.log(`  Attempt ${i + 1} failed: ${e.message}`); }
//   }
//   throw new Error('All attempts failed');
// }

// === TODO 2: Tool with timeout ===
// Create a "fetch_external_data" tool that simulates slowness.
// Use Promise.race() with a 3-second timeout.

// async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
//   const timeout = new Promise<never>((_, reject) =>
//     setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
//   );
//   return Promise.race([promise, timeout]);
// }

// === TODO 3: Graceful degradation ===
// When a tool fails, return tool_result with is_error: true.
// Claude should continue the conversation and inform the user about the error.

// Hint: the tool_result field accepts is_error to signal failure.

// === TODO 4: Run the loop with complete error handling ===
// Question: "Get the price of the laptop, mouse, and keyboard"
// Some lookups will fail — Claude should handle it gracefully.

console.log('\n--- Exercise 14 complete! ---');
console.log('Hint: see the solution in solutions/ex14-error-handling.ts');
