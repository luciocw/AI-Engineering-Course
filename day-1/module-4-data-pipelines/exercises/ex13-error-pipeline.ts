/**
 * Exercise 13: Error Handling in Pipelines
 *
 * Implement retry, fallback, and dead-letter queue for robust pipelines.
 * Difficulty: Advanced
 * Estimated time: 30 minutes
 * Run: npx tsx exercises/ex13-error-pipeline.ts
 */

// === TODO 1: Implement retry with exponential backoff ===
// Try to execute a function up to N times, with increasing delay between attempts.
// interface RetryOptions {
//   maxRetries: number;
//   baseDelayMs: number;
//   onRetry?: (attempt: number, error: Error) => void;
// }
// async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> { ... }

// === TODO 2: Implement fallback ===
// If the primary function fails, try an alternative function.
// async function withFallback<T>(
//   primary: () => Promise<T>,
//   fallback: () => Promise<T>,
//   onFallback?: (error: Error) => void
// ): Promise<T> { ... }

// === TODO 3: Implement dead-letter queue ===
// Records that failed after all attempts go to an error queue.
// interface DeadLetter<T> {
//   item: T;
//   error: string;
//   timestamp: string;
//   attempts: number;
// }
// class DeadLetterQueue<T> {
//   private queue: DeadLetter<T>[] = [];
//   add(item: T, error: string, attempts: number): void { ... }
//   getAll(): DeadLetter<T>[] { ... }
//   size(): number { ... }
// }

// === TODO 4: Create a pipeline with error handling ===
// Simulate a pipeline that:
// 1. Reads data (can fail: corrupted file)
// 2. Validates (can fail: invalid schema)
// 3. Transforms (can fail: incompatible type)
// 4. Loads (can fail: destination unavailable)
// Use retry at each step, fallback where possible, and DLQ for total failures.

// === TODO 5: Simulate errors and test the pipeline ===
// Create data that fails at different steps and verify that the pipeline
// handles each case correctly.

console.log('\n--- Exercise 13 complete! ---');
console.log('Hint: see the solution in solutions/ex13-error-pipeline.ts');
