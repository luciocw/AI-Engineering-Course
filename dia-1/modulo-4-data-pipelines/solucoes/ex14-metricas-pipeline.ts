/**
 * Solucao 14: Metricas de Pipeline
 *
 * Pipeline instrumentado com timing, contadores e taxas de erro.
 * Execute: npx tsx solucoes/ex14-metricas-pipeline.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// === 1: Classe PipelineMetrics ===
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

// === 2: Wrapper de metricas ===
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

// === 3: Pipeline instrumentado ===
const metrics = new PipelineMetrics();

// Etapa 1: Extract
function extract(): Record<string, string>[] {
  const stop = metrics.startTimer('extract');
  const csv = readFileSync('data/samples/customers.csv', 'utf-8');
  const records = parse(csv, { columns: true, skip_empty_lines: true }) as Record<string, string>[];
  metrics.increment('extract.rows', records.length);
  stop();
  return records;
}

// Etapa 2: Validate
interface ValidatedRecord {
  id: string;
  nome: string;
  email: string;
  plano: string;
  mrr: string;
  status: string;
  industria: string;
}

const validate = withMetrics(metrics, 'validate', (record: Record<string, string>): ValidatedRecord | null => {
  if (!record.nome || record.nome.length < 2) {
    metrics.recordError('validate', 'Nome invalido');
    metrics.increment('validate.invalidos');
    return null;
  }
  if (!record.email || !record.email.includes('@')) {
    metrics.recordError('validate', 'Email invalido');
    metrics.increment('validate.invalidos');
    return null;
  }
  metrics.increment('validate.validos');
  return record as ValidatedRecord;
});

// Etapa 3: Transform
interface TransformedRecord {
  id: number;
  nome: string;
  email: string;
  plano: string;
  mrr: number;
  status: string;
  industria: string;
}

const transform = withMetrics(metrics, 'transform', (record: ValidatedRecord): TransformedRecord => {
  return {
    id: parseInt(record.id, 10),
    nome: record.nome,
    email: record.email.toLowerCase().trim(),
    plano: record.plano,
    mrr: parseInt(record.mrr, 10),
    status: record.status,
    industria: record.industria,
  };
});

// Etapa 4: Aggregate
function aggregate(records: TransformedRecord[]): Record<string, unknown> {
  const stop = metrics.startTimer('aggregate');

  const ativos = records.filter((r) => r.status === 'ativo');
  const mrrTotal = ativos.reduce((sum, r) => sum + r.mrr, 0);

  const porPlano: Record<string, { count: number; mrr: number }> = {};
  for (const r of ativos) {
    if (!porPlano[r.plano]) porPlano[r.plano] = { count: 0, mrr: 0 };
    porPlano[r.plano].count++;
    porPlano[r.plano].mrr += r.mrr;
  }

  metrics.increment('aggregate.planos', Object.keys(porPlano).length);
  stop();

  return { mrrTotal, clientesAtivos: ativos.length, porPlano };
}

// Etapa 5: Format
function format(aggregated: Record<string, unknown>): string {
  const stop = metrics.startTimer('format');
  const output = JSON.stringify(aggregated, null, 2);
  stop();
  return output;
}

// === 4 e 5: Executa e exibe metricas ===
console.log('=== Pipeline com Metricas ===\n');

// Extract
const rawRecords = extract();
console.log(`Extraidos: ${rawRecords.length} registros`);

// Validate
const validRecords: ValidatedRecord[] = [];
for (const record of rawRecords) {
  const validated = validate(record);
  if (validated) validRecords.push(validated);
}
console.log(`Validados: ${validRecords.length}/${rawRecords.length}`);

// Transform
const transformed = validRecords.map((r) => transform(r));
console.log(`Transformados: ${transformed.length}`);

// Aggregate
const aggregated = aggregate(transformed);
console.log(`Agregacao concluida`);

// Format
const output = format(aggregated);
console.log(`\n--- Resultado ---`);
console.log(output);

// === Relatorio de Metricas ===
const report = metrics.getReport();

console.log('\n========================================');
console.log('       METRICAS DO PIPELINE');
console.log('========================================');
console.log(`Duracao total: ${report.totalDurationMs}ms`);
console.log(`Taxa de erro: ${report.errorRate}%`);

console.log('\n--- Timing por Etapa ---');
for (const step of report.steps) {
  console.log(`  ${step.name}: avg=${step.avgMs}ms, p95=${step.p95Ms}ms, chamadas=${step.calls}`);
}

console.log('\n--- Contadores ---');
for (const [key, value] of Object.entries(report.counters)) {
  console.log(`  ${key}: ${value}`);
}

if (report.topErrors.length > 0) {
  console.log('\n--- Top Erros ---');
  for (const e of report.topErrors) {
    console.log(`  ${e.error}: ${e.count}x`);
  }
}

console.log('\n--- Exercicio 14 completo! ---');
