/**
 * Exercise 14: Pipeline Metrics
 *
 * Instrument a pipeline with timing, counters, and error rates.
 * Difficulty: Advanced
 * Estimated time: 30 minutes
 * Run: npx tsx exercises/ex14-metricas-pipeline.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// === TODO 1: Create a PipelineMetrics class ===
// Should track:
// - Timings per step (step name -> durations[])
// - Counters (items processed, success, failure)
// - Errors (error message -> count)
//
// class PipelineMetrics {
//   private timings: Map<string, number[]>;
//   private counters: Map<string, number>;
//   private errors: Map<string, number>;
//
//   startTimer(step: string): () => void { ... }  // returns stop function
//   increment(counter: string, by?: number): void { ... }
//   recordError(step: string, error: string): void { ... }
//   getReport(): MetricsReport { ... }
// }

// === TODO 2: Create a metrics decorator/wrapper ===
// Wraps a pipeline function and automatically measures time and errors.
// function withMetrics<T, R>(
//   metrics: PipelineMetrics,
//   stepName: string,
//   fn: (input: T) => R
// ): (input: T) => R { ... }

// === TODO 3: Create the instrumented pipeline ===
// Simple ETL pipeline with metrics at each step:
// 1. Extract: reads CSV (measures I/O time)
// 2. Validate: validates with rules (counts valid/invalid)
// 3. Transform: converts types (measures CPU time)
// 4. Aggregate: calculates business metrics
// 5. Format: generates final output

// === TODO 4: Generate the metrics report ===
// interface MetricsReport {
//   totalDurationMs: number;
//   steps: { name: string; avgMs: number; p95Ms: number; calls: number }[];
//   counters: Record<string, number>;
//   errorRate: number;
//   topErrors: { error: string; count: number }[];
// }

// === TODO 5: Run the pipeline and display the metrics ===

console.log('\n--- Exercise 14 complete! ---');
console.log('Hint: see the solution in solutions/ex14-metricas-pipeline.ts');
