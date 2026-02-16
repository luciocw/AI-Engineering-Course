/**
 * Exercicio 4: Pipeline ETL Completo
 *
 * Extract → Transform → Load: do CSV cru ao relatorio final.
 * Execute: npx tsx exercicios/ex4-etl-pipeline.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';

// === TODO 1: EXTRACT — Leia os 2 CSVs ===
// customers.csv e tickets.csv
// Parse ambos e retorne arrays tipados.

// function extract(): { customers: RawCustomer[]; tickets: RawTicket[] } { ... }

// === TODO 2: TRANSFORM — Limpe e enriqueca os dados ===
// 1. Valide com Zod (rejeite invalidos, log warnings)
// 2. Normalize campos (trim, lowercase emails)
// 3. Enriqueca: calcule para cada cliente:
//    - totalTickets: contagem de tickets
//    - ticketsPorPrioridade: { alta, media, baixa }
//    - tempoMedioResolucao: dias

// function transform(raw: ExtractResult): TransformResult { ... }

// === TODO 3: LOAD — Gere o output final ===
// 1. Relatorio em texto com metricas agregadas
// 2. JSON estruturado pronto para ser usado como contexto de um prompt AI
// 3. Lista de alertas (ex: cliente com muitos tickets alta prioridade)

// function load(data: TransformResult): void { ... }

// === TODO 4: Execute o pipeline ===
// const raw = extract();
// const transformed = transform(raw);
// load(transformed);

console.log('\n--- Exercicio 4 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex4-etl-pipeline.ts');
