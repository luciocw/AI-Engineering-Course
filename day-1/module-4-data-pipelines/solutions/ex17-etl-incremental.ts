/**
 * Solution 17: Incremental ETL
 *
 * Processes only new or changed data since the last run.
 * Run: npx tsx solutions/ex17-etl-incremental.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// === 1: Checkpoint system ===
interface Checkpoint {
  lastRunAt: string;
  lastProcessedId: number;
  processedHashes: Map<string, string>; // id -> hash
}

// === 2: Record hash ===
function hashRecord(record: Record<string, string>): string {
  // Simple hash based on content
  const content = JSON.stringify(record);
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit int
  }
  return hash.toString(36);
}

class CheckpointManager {
  private checkpoint: Checkpoint = {
    lastRunAt: '',
    lastProcessedId: 0,
    processedHashes: new Map(),
  };

  save(lastId: number, records: Map<string, string>): void {
    this.checkpoint = {
      lastRunAt: new Date().toISOString(),
      lastProcessedId: lastId,
      processedHashes: new Map(records),
    };
  }

  getCheckpoint(): Checkpoint {
    return this.checkpoint;
  }

  isNew(id: string): boolean {
    return !this.checkpoint.processedHashes.has(id);
  }

  isChanged(id: string, hash: string): boolean {
    const existingHash = this.checkpoint.processedHashes.get(id);
    return existingHash !== undefined && existingHash !== hash;
  }

  hasData(): boolean {
    return this.checkpoint.processedHashes.size > 0;
  }
}

// === 3: Incremental ETL ===
type Operation = 'INSERT' | 'UPDATE' | 'SKIP';

interface IncrementalLog {
  id: string;
  operation: Operation;
  name: string;
}

interface IncrementalResult {
  inserts: number;
  updates: number;
  skipped: number;
  records: Record<string, string>[];
  log: IncrementalLog[];
}

function incrementalETL(
  data: Record<string, string>[],
  checkpoint: CheckpointManager
): IncrementalResult {
  const result: IncrementalResult = {
    inserts: 0,
    updates: 0,
    skipped: 0,
    records: [],
    log: [],
  };

  const currentHashes = new Map<string, string>();

  for (const record of data) {
    const id = record.id;
    const hash = hashRecord(record);
    currentHashes.set(id, hash);

    if (checkpoint.isNew(id)) {
      result.inserts++;
      result.records.push(record);
      result.log.push({ id, operation: 'INSERT', name: record.nome });
    } else if (checkpoint.isChanged(id, hash)) {
      result.updates++;
      result.records.push(record);
      result.log.push({ id, operation: 'UPDATE', name: record.nome });
    } else {
      result.skipped++;
      result.log.push({ id, operation: 'SKIP', name: record.nome });
    }
  }

  // Update checkpoint
  const maxId = Math.max(...data.map((r) => parseInt(r.id, 10)));
  checkpoint.save(maxId, currentHashes);

  return result;
}

// === 4: Simulate runs ===
const csvContent = readFileSync('data/samples/customers.csv', 'utf-8');
const originalData = parse(csvContent, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

const checkpoint = new CheckpointManager();

// Run 1: Full load
console.log('=== Run 1: Full Load ===\n');
const run1 = incrementalETL(originalData, checkpoint);
console.log(`Inserts: ${run1.inserts} | Updates: ${run1.updates} | Skipped: ${run1.skipped}`);
for (const log of run1.log) {
  console.log(`  [${log.operation}] #${log.id} ${log.name}`);
}

// Run 2: No changes
console.log('\n=== Run 2: No Changes ===\n');
const run2 = incrementalETL(originalData, checkpoint);
console.log(`Inserts: ${run2.inserts} | Updates: ${run2.updates} | Skipped: ${run2.skipped}`);
for (const log of run2.log.slice(0, 3)) {
  console.log(`  [${log.operation}] #${log.id} ${log.name}`);
}
console.log(`  ... (${run2.log.length - 3} more)`);

// Run 3: With changes
console.log('\n=== Run 3: With Changes ===\n');

// Simulate changes
const modifiedData = originalData.map((r) => ({ ...r })); // Copy

// Modify an existing record (UPDATE)
const idx = modifiedData.findIndex((r) => r.id === '2');
if (idx >= 0) {
  modifiedData[idx] = { ...modifiedData[idx], plano: 'Enterprise', mrr: '999' };
}

// Add a new record (INSERT)
modifiedData.push({
  id: '13',
  nome: 'NewCompany',
  email: 'new@company.com',
  plano: 'Starter',
  mrr: '49',
  data_inicio: '2026-02-15',
  status: 'ativo',
  industria: 'New',
});

const run3 = incrementalETL(modifiedData, checkpoint);
console.log(`Inserts: ${run3.inserts} | Updates: ${run3.updates} | Skipped: ${run3.skipped}`);
for (const log of run3.log.filter((l) => l.operation !== 'SKIP')) {
  console.log(`  [${log.operation}] #${log.id} ${log.name}`);
}
console.log(`  + ${run3.skipped} unchanged records (SKIP)`);

// Summary
console.log('\n=== Summary ===');
console.log(`Checkpoint: last processed at ${checkpoint.getCheckpoint().lastRunAt}`);
console.log(`Tracked records: ${checkpoint.getCheckpoint().processedHashes.size}`);

console.log('\n--- Exercise 17 complete! ---');
