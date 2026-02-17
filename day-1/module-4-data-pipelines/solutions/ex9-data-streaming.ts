/**
 * Solution 9: Streaming / Chunk Processing
 *
 * Processes large data volumes in batches (chunks) to simulate streaming.
 * Run: npx tsx solutions/ex9-streaming-dados.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// === 1: Chunk generator ===
function* chunked<T>(items: T[], chunkSize: number): Generator<T[], void, unknown> {
  for (let i = 0; i < items.length; i += chunkSize) {
    yield items.slice(i, i + chunkSize);
  }
}

// === 2: Chunk processor ===
interface ChunkResult<T> {
  chunkIndex: number;
  processed: number;
  results: T[];
  durationMs: number;
}

function processChunks<T, R>(
  items: T[],
  chunkSize: number,
  processor: (chunk: T[], index: number) => R[]
): ChunkResult<R>[] {
  const results: ChunkResult<R>[] = [];
  let chunkIndex = 0;

  for (const chunk of chunked(items, chunkSize)) {
    const start = performance.now();
    const chunkResults = processor(chunk, chunkIndex);
    const duration = performance.now() - start;

    results.push({
      chunkIndex,
      processed: chunk.length,
      results: chunkResults,
      durationMs: Math.round(duration * 100) / 100,
    });

    chunkIndex++;
  }

  return results;
}

// === 3: Streaming pipeline ===
interface RawCustomer {
  id: string;
  nome: string;
  email: string;
  plano: string;
  mrr: string;
  data_inicio: string;
  status: string;
  industria: string;
}

interface ProcessedCustomer {
  id: number;
  name: string;
  email: string;
  plan: string;
  mrr: number;
  start_date: string;
  status: string;
  industry: string;
  ageDays: number;
}

// Load data
const csvContent = readFileSync('data/samples/customers.csv', 'utf-8');
const rawRecords = parse(csvContent, { columns: true, skip_empty_lines: true }) as RawCustomer[];

console.log('=== Chunk Processing ===\n');
console.log(`Total records: ${rawRecords.length}`);

// Step 1: Parse and validate (chunks of 4)
console.log('\n--- Step 1: Parse and Validation ---');
const parseResults = processChunks(rawRecords, 4, (chunk, idx) => {
  console.log(`  Processing chunk ${idx + 1}: ${chunk.length} records`);
  return chunk
    .filter((r) => r.nome && r.email && r.plano)
    .map((r) => ({
      id: parseInt(r.id, 10),
      name: r.nome,
      email: r.email,
      plan: r.plano,
      mrr: parseInt(r.mrr, 10),
      start_date: r.data_inicio,
      status: r.status,
      industry: r.industria,
    }));
});

const allParsed = parseResults.flatMap((r) => r.results);
console.log(`  Total valid: ${allParsed.length}`);

// Step 2: Enrich (chunks of 4)
console.log('\n--- Step 2: Enrichment ---');
const enrichResults = processChunks(allParsed, 4, (chunk, idx) => {
  console.log(`  Enriching chunk ${idx + 1}: ${chunk.length} records`);
  const today = Date.now();
  return chunk.map((c) => ({
    ...c,
    ageDays: Math.floor((today - new Date(c.start_date).getTime()) / (1000 * 60 * 60 * 24)),
  }));
});

const allEnriched: ProcessedCustomer[] = enrichResults.flatMap((r) => r.results);

// Step 3: Aggregate (chunks of 4)
console.log('\n--- Step 3: Aggregation ---');
const mrrByPlan = new Map<string, number>();

const aggResults = processChunks(allEnriched, 4, (chunk, idx) => {
  console.log(`  Aggregating chunk ${idx + 1}: ${chunk.length} records`);
  for (const c of chunk) {
    if (c.status === 'ativo') {
      mrrByPlan.set(c.plan, (mrrByPlan.get(c.plan) || 0) + c.mrr);
    }
  }
  return chunk;
});

console.log('\n  MRR by plan:');
for (const [plan, mrr] of mrrByPlan.entries()) {
  console.log(`    ${plan}: $${mrr.toLocaleString('en-US')}`);
}

// === 4: Simulated backpressure ===
console.log('\n--- Step 4: Simulated Backpressure ---');

async function processWithBackpressure<T>(
  items: T[],
  chunkSize: number,
  processor: (chunk: T[]) => Promise<void>,
  delayMs: number
): Promise<{ totalMs: number; chunks: number }> {
  const start = performance.now();
  let chunkCount = 0;

  for (const chunk of chunked(items, chunkSize)) {
    await processor(chunk);
    chunkCount++;
    // Simulate backpressure with delay
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return {
    totalMs: Math.round(performance.now() - start),
    chunks: chunkCount,
  };
}

// Execute with backpressure
const bpResult = await processWithBackpressure(
  allEnriched,
  3,
  async (chunk) => {
    console.log(`  Processing batch of ${chunk.length} with backpressure...`);
  },
  50 // 50ms delay between chunks
);

console.log(`  Backpressure: ${bpResult.chunks} chunks in ${bpResult.totalMs}ms`);

// === 5: Metrics ===
console.log('\n=== Processing Metrics ===');

const allChunkResults = [...parseResults, ...enrichResults, ...aggResults];
const totalDuration = allChunkResults.reduce((sum, r) => sum + r.durationMs, 0);
const totalItems = allChunkResults.reduce((sum, r) => sum + r.processed, 0);
const avgDuration = totalDuration / allChunkResults.length;

console.log(`Total time: ${totalDuration.toFixed(2)}ms`);
console.log(`Chunks processed: ${allChunkResults.length}`);
console.log(`Average time per chunk: ${avgDuration.toFixed(2)}ms`);
console.log(`Items processed: ${totalItems}`);
console.log(`Items/second: ${totalDuration > 0 ? Math.round((totalItems / totalDuration) * 1000) : 'N/A'}`);

console.log('\n--- Exercise 9 complete! ---');
