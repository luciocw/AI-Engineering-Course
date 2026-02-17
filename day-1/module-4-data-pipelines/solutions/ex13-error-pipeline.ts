/**
 * Solution 13: Error Handling in Pipelines
 *
 * Retry, fallback, and dead-letter queue for robust pipelines.
 * Run: npx tsx solutions/ex13-error-pipeline.ts
 */

// === 1: Retry with exponential backoff ===
interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  onRetry?: (attempt: number, error: Error) => void;
}

async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { maxRetries, baseDelayMs, onRetry } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      onRetry?.(attempt, error as Error);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Retries exhausted');
}

// === 2: Fallback ===
async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  onFallback?: (error: Error) => void
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    onFallback?.(error as Error);
    return await fallback();
  }
}

// === 3: Dead-letter queue ===
interface DeadLetter<T> {
  item: T;
  error: string;
  timestamp: string;
  attempts: number;
}

class DeadLetterQueue<T> {
  private queue: DeadLetter<T>[] = [];

  add(item: T, error: string, attempts: number): void {
    this.queue.push({
      item,
      error,
      timestamp: new Date().toISOString(),
      attempts,
    });
  }

  getAll(): DeadLetter<T>[] {
    return [...this.queue];
  }

  size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }
}

// === 4: Pipeline with error handling ===
interface PipelineRecord {
  id: number;
  name: string;
  email: string;
  value: string;
}

interface ProcessedRecord {
  id: number;
  name: string;
  email: string;
  value: number;
  processedAt: string;
}

// Simulated data (some with problems)
const rawData: PipelineRecord[] = [
  { id: 1, name: 'TechCorp', email: 'tech@corp.com', value: '999' },
  { id: 2, name: '', email: 'invalid', value: 'abc' },              // Validation failure
  { id: 3, name: 'BigData', email: 'big@data.com', value: '499' },
  { id: 4, name: 'CloudFirst', email: 'cloud@first.com', value: '-1' }, // Transform failure
  { id: 5, name: 'AILabs', email: 'ai@labs.com', value: '799' },
];

const dlq = new DeadLetterQueue<PipelineRecord>();

// Step: Validation
async function validate(record: PipelineRecord): Promise<PipelineRecord> {
  if (!record.name || record.name.length < 2) {
    throw new Error(`Invalid name: "${record.name}"`);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(record.email)) {
    throw new Error(`Invalid email: "${record.email}"`);
  }
  return record;
}

// Step: Transform
async function transform(record: PipelineRecord): Promise<ProcessedRecord> {
  const value = parseInt(record.value, 10);
  if (isNaN(value) || value <= 0) {
    throw new Error(`Invalid value: "${record.value}"`);
  }
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    value,
    processedAt: new Date().toISOString(),
  };
}

// Step: Load (simulates intermittent failure)
let loadCallCount = 0;
async function load(record: ProcessedRecord): Promise<void> {
  loadCallCount++;
  // Simulate intermittent failure (fails on 2nd call)
  if (loadCallCount === 2) {
    throw new Error('Destination temporarily unavailable');
  }
}

// Main pipeline
async function processRecord(record: PipelineRecord): Promise<ProcessedRecord | null> {
  try {
    // Validation with retry
    const validated = await withRetry(
      () => validate(record),
      {
        maxRetries: 2,
        baseDelayMs: 50,
        onRetry: (attempt) =>
          console.log(`    Retry validation #${attempt} for ${record.name || record.id}`),
      }
    );

    // Transform with fallback
    const transformed = await withFallback(
      () => transform(validated),
      async () => ({
        id: validated.id,
        name: validated.name,
        email: validated.email,
        value: 0, // Fallback: zero value
        processedAt: new Date().toISOString(),
      }),
      (error) => console.log(`    Fallback activated for ${record.name}: ${error.message}`)
    );

    // Load with retry
    await withRetry(
      () => load(transformed),
      {
        maxRetries: 3,
        baseDelayMs: 100,
        onRetry: (attempt) =>
          console.log(`    Retry load #${attempt} for ${record.name}`),
      }
    );

    return transformed;

  } catch (error) {
    dlq.add(record, (error as Error).message, 3);
    return null;
  }
}

// === 5: Execute ===
async function main() {
  console.log('=== Pipeline with Error Handling ===\n');

  const results: ProcessedRecord[] = [];
  let success = 0;
  let failure = 0;

  for (const record of rawData) {
    console.log(`Processing #${record.id}: ${record.name || '(empty)'}...`);

    const result = await processRecord(record);

    if (result) {
      results.push(result);
      success++;
      console.log(`  OK: ${result.name} -> $${result.value}`);
    } else {
      failure++;
      console.log(`  FAILED: sent to DLQ`);
    }
    console.log('');
  }

  // Report
  console.log('=== Pipeline Result ===');
  console.log(`Success: ${success}/${rawData.length}`);
  console.log(`Failures: ${failure}/${rawData.length}`);
  console.log(`Dead Letter Queue: ${dlq.size()} records`);

  if (dlq.size() > 0) {
    console.log('\n--- Dead Letter Queue ---');
    for (const dl of dlq.getAll()) {
      const item = dl.item as PipelineRecord;
      console.log(`  #${item.id} ${item.name || '(empty)'}: ${dl.error} (${dl.attempts} attempts)`);
    }
  }

  console.log('\n--- Processed Records ---');
  for (const r of results) {
    console.log(`  ${r.name}: $${r.value} (processed at ${r.processedAt})`);
  }

  console.log('\n--- Exercise 13 complete! ---');
}

main().catch(console.error);
