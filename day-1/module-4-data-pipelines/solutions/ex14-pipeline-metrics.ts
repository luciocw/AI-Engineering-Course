/**
 * Solution 14: Pipeline Metrics
 *
 * Instrumented pipeline with timing, counters, and error rates.
 * Run: npx tsx solutions/ex14-metricas-pipeline.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// === 1: PipelineMetrics class ===
interface MetricsReport {
  totalDurationMs: number;
  steps: { name: string; avgMs: number; p95Ms: number; calls: number }[];
  counters: Record<string, number>;
  errorRate: number;
  topErrors: { error: string; count: number }[];
}

class PipelineMetrics {
  private timings = new Map<string, number[]>();
  private counters = new Map<string, number>();
  private errors = new Map<string, number>();
  private startTime = performance.now();

  startTimer(step: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      const existing = this.timings.get(step) || [];
      existing.push(duration);
      this.timings.set(step, existing);
    };
  }

  increment(counter: string, by: number = 1): void {
    this.counters.set(counter, (this.counters.get(counter) || 0) + by);
  }

  recordError(step: string, error: string): void {
    const key = `${step}: ${error}`;
    this.errors.set(key, (this.errors.get(key) || 0) + 1);
    this.increment('errors');
  }

  getReport(): MetricsReport {
    const totalDurationMs = Math.round((performance.now() - this.startTime) * 100) / 100;

    const steps = [...this.timings.entries()].map(([name, durations]) => {
      const sorted = [...durations].sort((a, b) => a - b);
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const p95Index = Math.floor(sorted.length * 0.95);
      const p95 = sorted[p95Index] || sorted[sorted.length - 1];

      return {
        name,
        avgMs: Math.round(avg * 100) / 100,
        p95Ms: Math.round(p95 * 100) / 100,
        calls: durations.length,
      };
    });

    const totalProcessed = this.counters.get('processed') || 0;
    const totalErrors = this.counters.get('errors') || 0;
    const errorRate = totalProcessed > 0 ? (totalErrors / totalProcessed) * 100 : 0;

    const topErrors = [...this.errors.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }));

    return {
      totalDurationMs,
      steps,
      counters: Object.fromEntries(this.counters),
      errorRate: Math.round(errorRate * 10) / 10,
      topErrors,
    };
  }
}

// === 2: Metrics wrapper ===
function withMetrics<T, R>(
  metrics: PipelineMetrics,
  stepName: string,
  fn: (input: T) => R
): (input: T) => R {
  return (input: T): R => {
    const stop = metrics.startTimer(stepName);
    try {
      const result = fn(input);
      metrics.increment('processed');
      stop();
      return result;
    } catch (error) {
      metrics.recordError(stepName, (error as Error).message);
      stop();
      throw error;
    }
  };
}

// === 3: Instrumented pipeline ===
const metrics = new PipelineMetrics();

// Step 1: Extract
function extract(): Record<string, string>[] {
  const stop = metrics.startTimer('extract');
  const csv = readFileSync('data/samples/customers.csv', 'utf-8');
  const records = parse(csv, { columns: true, skip_empty_lines: true }) as Record<string, string>[];
  metrics.increment('extract.rows', records.length);
  stop();
  return records;
}

// Step 2: Validate
interface ValidatedRecord {
  id: string;
  name: string;
  email: string;
  plan: string;
  mrr: string;
  status: string;
  industry: string;
}

const validate = withMetrics(metrics, 'validate', (record: Record<string, string>): ValidatedRecord | null => {
  if (!record.nome || record.nome.length < 2) {
    metrics.recordError('validate', 'Invalid name');
    metrics.increment('validate.invalid');
    return null;
  }
  if (!record.email || !record.email.includes('@')) {
    metrics.recordError('validate', 'Invalid email');
    metrics.increment('validate.invalid');
    return null;
  }
  metrics.increment('validate.valid');
  return {
    id: record.id,
    name: record.nome,
    email: record.email,
    plan: record.plano,
    mrr: record.mrr,
    status: record.status,
    industry: record.industria,
  } as ValidatedRecord;
});

// Step 3: Transform
interface TransformedRecord {
  id: number;
  name: string;
  email: string;
  plan: string;
  mrr: number;
  status: string;
  industry: string;
}

const transform = withMetrics(metrics, 'transform', (record: ValidatedRecord): TransformedRecord => {
  return {
    id: parseInt(record.id, 10),
    name: record.name,
    email: record.email.toLowerCase().trim(),
    plan: record.plan,
    mrr: parseInt(record.mrr, 10),
    status: record.status,
    industry: record.industry,
  };
});

// Step 4: Aggregate
function aggregate(records: TransformedRecord[]): Record<string, unknown> {
  const stop = metrics.startTimer('aggregate');

  const active = records.filter((r) => r.status === 'ativo');
  const totalMrr = active.reduce((sum, r) => sum + r.mrr, 0);

  const byPlan: Record<string, { count: number; mrr: number }> = {};
  for (const r of active) {
    if (!byPlan[r.plan]) byPlan[r.plan] = { count: 0, mrr: 0 };
    byPlan[r.plan].count++;
    byPlan[r.plan].mrr += r.mrr;
  }

  metrics.increment('aggregate.plans', Object.keys(byPlan).length);
  stop();

  return { totalMrr, activeCustomers: active.length, byPlan };
}

// Step 5: Format
function format(aggregated: Record<string, unknown>): string {
  const stop = metrics.startTimer('format');
  const output = JSON.stringify(aggregated, null, 2);
  stop();
  return output;
}

// === 4 and 5: Execute and display metrics ===
console.log('=== Pipeline with Metrics ===\n');

// Extract
const rawRecords = extract();
console.log(`Extracted: ${rawRecords.length} records`);

// Validate
const validRecords: ValidatedRecord[] = [];
for (const record of rawRecords) {
  const validated = validate(record);
  if (validated) validRecords.push(validated);
}
console.log(`Validated: ${validRecords.length}/${rawRecords.length}`);

// Transform
const transformed = validRecords.map((r) => transform(r));
console.log(`Transformed: ${transformed.length}`);

// Aggregate
const aggregated = aggregate(transformed);
console.log(`Aggregation complete`);

// Format
const output = format(aggregated);
console.log(`\n--- Result ---`);
console.log(output);

// === Metrics Report ===
const report = metrics.getReport();

console.log('\n========================================');
console.log('       PIPELINE METRICS');
console.log('========================================');
console.log(`Total duration: ${report.totalDurationMs}ms`);
console.log(`Error rate: ${report.errorRate}%`);

console.log('\n--- Timing by Step ---');
for (const step of report.steps) {
  console.log(`  ${step.name}: avg=${step.avgMs}ms, p95=${step.p95Ms}ms, calls=${step.calls}`);
}

console.log('\n--- Counters ---');
for (const [key, value] of Object.entries(report.counters)) {
  console.log(`  ${key}: ${value}`);
}

if (report.topErrors.length > 0) {
  console.log('\n--- Top Errors ---');
  for (const e of report.topErrors) {
    console.log(`  ${e.error}: ${e.count}x`);
  }
}

console.log('\n--- Exercise 14 complete! ---');
