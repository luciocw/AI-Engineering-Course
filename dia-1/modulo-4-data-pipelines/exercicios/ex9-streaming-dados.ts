/**
 * Exercicio 9: Streaming / Processamento em Chunks
 *
 * Processe grandes volumes de dados em lotes (chunks) para simular streaming.
 * Dificuldade: Intermediario
 * Tempo estimado: 25 minutos
 * Execute: npx tsx exercicios/ex9-streaming-dados.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// === TODO 1: Implemente uma funcao geradora de chunks ===
// Recebe um array e tamanho do chunk, retorna um generator que yield arrays menores.
// function* chunked<T>(items: T[], chunkSize: number): Generator<T[], void, unknown> {
//   for (let i = 0; i < items.length; i += chunkSize) {
//     yield items.slice(i, i + chunkSize);
//   }
// }

// === TODO 2: Crie um processador de chunks com callback ===
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
//   // Para cada chunk, execute o processor e meça o tempo
// }

// === TODO 3: Crie um pipeline de streaming simulado ===
// Carregue customers.csv, processe em chunks de 4:
// - Chunk 1: parse e valide
// - Chunk 2: enriqueca (adicione campo idadeDias)
// - Chunk 3: agregue (some MRR por plano)
// Use processChunks para cada etapa

// === TODO 4: Implemente backpressure simulado ===
// Crie uma funcao async que processa chunks com delay (simulando I/O lento)
// async function processWithBackpressure<T>(
//   items: T[],
//   chunkSize: number,
//   processor: (chunk: T[]) => Promise<void>,
//   delayMs: number
// ): Promise<void> { ... }

// === TODO 5: Exiba metricas de processamento ===
// - Tempo total
// - Tempo medio por chunk
// - Items processados por segundo

console.log('\n--- Exercicio 9 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex9-streaming-dados.ts');
