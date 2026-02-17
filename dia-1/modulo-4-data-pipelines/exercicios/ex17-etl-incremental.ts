/**
 * Exercicio 17: ETL Incremental
 *
 * Processe apenas dados novos ou alterados desde a ultima execucao.
 * Dificuldade: Expert
 * Tempo estimado: 35 minutos
 * Execute: npx tsx exercicios/ex17-etl-incremental.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// === TODO 1: Crie um sistema de checkpoint ===
// Salva o estado da ultima execucao (em memoria, nao precisa de arquivo).
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

// === TODO 2: Implemente deteccao de mudancas ===
// Use hash (simples: JSON.stringify) para detectar se um registro mudou.
// function hashRecord(record: Record<string, string>): string { ... }

// === TODO 3: Crie o ETL incremental ===
// - Na primeira execucao, processe tudo (full load)
// - Nas execucoes seguintes, processe apenas novos/alterados
// - Mantenha um log de operacoes (INSERT, UPDATE, SKIP)
// interface IncrementalResult {
//   inserts: number;
//   updates: number;
//   skipped: number;
//   records: ProcessedRecord[];
// }

// === TODO 4: Simule multiplas execucoes ===
// 1. Primeira execucao: full load
// 2. Segunda execucao: sem mudancas (tudo SKIP)
// 3. Terceira execucao: com dados novos/alterados (INSERT + UPDATE)

// === TODO 5: Exiba log de cada execucao ===

console.log('\n--- Exercicio 17 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex17-etl-incremental.ts');
