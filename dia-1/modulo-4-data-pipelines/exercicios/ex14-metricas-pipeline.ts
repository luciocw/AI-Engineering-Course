/**
 * Exercicio 14: Metricas de Pipeline
 *
 * Instrumente um pipeline com timing, contadores e taxas de erro.
 * Dificuldade: Avancado
 * Tempo estimado: 30 minutos
 * Execute: npx tsx exercicios/ex14-metricas-pipeline.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// === TODO 1: Crie uma classe PipelineMetrics ===
// Deve rastrear:
// - Timings por etapa (nome da etapa -> duracoes[])
// - Contadores (items processados, sucesso, falha)
// - Erros (mensagem de erro -> count)
//
// class PipelineMetrics {
//   private timings: Map<string, number[]>;
//   private counters: Map<string, number>;
//   private errors: Map<string, number>;
//
//   startTimer(step: string): () => void { ... }  // retorna funcao stop
//   increment(counter: string, by?: number): void { ... }
//   recordError(step: string, error: string): void { ... }
//   getReport(): MetricsReport { ... }
// }

// === TODO 2: Crie um decorator/wrapper de metricas ===
// Envolve uma funcao de pipeline e automaticamente mede tempo e erros.
// function withMetrics<T, R>(
//   metrics: PipelineMetrics,
//   stepName: string,
//   fn: (input: T) => R
// ): (input: T) => R { ... }

// === TODO 3: Crie o pipeline instrumentado ===
// Pipeline ETL simples com metricas em cada etapa:
// 1. Extract: le CSV (mede tempo de I/O)
// 2. Validate: valida com regras (conta validos/invalidos)
// 3. Transform: converte tipos (mede tempo de CPU)
// 4. Aggregate: calcula metricas de negocio
// 5. Format: gera output final

// === TODO 4: Gere o relatorio de metricas ===
// interface MetricsReport {
//   totalDurationMs: number;
//   steps: { name: string; avgMs: number; p95Ms: number; calls: number }[];
//   counters: Record<string, number>;
//   errorRate: number;
//   topErrors: { error: string; count: number }[];
// }

// === TODO 5: Execute o pipeline e exiba as metricas ===

console.log('\n--- Exercicio 14 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex14-metricas-pipeline.ts');
