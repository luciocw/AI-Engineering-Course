/**
 * Exercise 17: Incremental ETL
 *
 * Process only new or changed data since the last run.
 * Difficulty: Expert
 * Estimated time: 35 minutes
 * Run: npx tsx exercises/ex17-etl-incremental.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// === TODO 1: Create a checkpoint system ===
// Saves the state of the last run (in memory, no file needed).
// interface Checkpoint {
//   lastRunAt: string;
//   lastProcessedId: number;
//   processedHashes: Set<string>;
// }
// class CheckpointManager {
//   private checkpoint: Checkpoint;
//   save(): void { ... }
//   load(): Checkpoint { ... }
//   isNew(record: Record<string, string>): boolean { ... }
//   isChanged(record: Record<string, string>): boolean { ... }
// }

// === TODO 2: Implement change detection ===
// Use hash (simple: JSON.stringify) to detect if a record has changed.
// function hashRecord(record: Record<string, string>): string { ... }

// === TODO 3: Create the incremental ETL ===
// - On the first run, process everything (full load)
// - On subsequent runs, process only new/changed records
// - Maintain an operations log (INSERT, UPDATE, SKIP)
// interface IncrementalResult {
//   inserts: number;
//   updates: number;
//   skipped: number;
//   records: ProcessedRecord[];
// }

// === TODO 4: Simulate multiple runs ===
// 1. First run: full load
// 2. Second run: no changes (all SKIP)
// 3. Third run: with new/changed data (INSERT + UPDATE)

// === TODO 5: Display log for each run ===

console.log('\n--- Exercise 17 complete! ---');
console.log('Hint: see the solution in solutions/ex17-etl-incremental.ts');
