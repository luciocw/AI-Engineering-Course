/**
 * Exercise 9: Streaming / Chunk Processing
 *
 * Process large volumes of data in batches (chunks) to simulate streaming.
 * Difficulty: Intermediate
 * Estimated time: 25 minutes
 * Run: npx tsx exercises/ex9-streaming-dados.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// === TODO 1: Implement a chunk generator function ===
// Receives an array and chunk size, returns a generator that yields smaller arrays.
// function* chunked<T>(items: T[], chunkSize: number): Generator<T[], void, unknown> {
//   for (let i = 0; i < items.length; i += chunkSize) {
//     yield items.slice(i, i + chunkSize);
//   }
// }

// === TODO 2: Create a chunk processor with callback ===
// interface ChunkResult<T> {
//   chunkIndex: number;
//   processed: number;
//   results: T[];
//   durationMs: number;
// }
//
// function processChunks<T, R>(
//   items: T[],
//   chunkSize: number,
//   processor: (chunk: T[], index: number) => R[]
// ): ChunkResult<R>[] {
//   // For each chunk, execute the processor and measure the time
// }

// === TODO 3: Create a simulated streaming pipeline ===
// Load customers.csv, process in chunks of 4:
// - Chunk 1: parse and validate
// - Chunk 2: enrich (add ageDays field)
// - Chunk 3: aggregate (sum MRR by plan)
// Use processChunks for each step

// === TODO 4: Implement simulated backpressure ===
// Create an async function that processes chunks with delay (simulating slow I/O)
// async function processWithBackpressure<T>(
//   items: T[],
//   chunkSize: number,
//   processor: (chunk: T[]) => Promise<void>,
//   delayMs: number
// ): Promise<void> { ... }

// === TODO 5: Display processing metrics ===
// - Total time
// - Average time per chunk
// - Items processed per second

console.log('\n--- Exercise 9 complete! ---');
console.log('Hint: see the solution in solutions/ex9-streaming-dados.ts');
