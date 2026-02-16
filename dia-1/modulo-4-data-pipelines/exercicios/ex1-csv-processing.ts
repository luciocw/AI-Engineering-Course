/**
 * Exercicio 1: CSV Processing
 *
 * Parse um CSV de clientes e calcule metricas de negocios.
 * Execute: npx tsx exercicios/ex1-csv-processing.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// === TODO 1: Leia e parse o CSV ===
// Arquivo: data/samples/customers.csv
// Use csv-parse/sync com options: { columns: true, skip_empty_lines: true }
// Isso retorna um array de objetos com as colunas como chaves.

// const csvContent = readFileSync('data/samples/customers.csv', 'utf-8');
// const clientes = parse(csvContent, { ... });

// === TODO 2: Converta tipos ===
// O CSV retorna tudo como string. Converta:
// - mrr: number (parseInt)
// - id: number
// - data_inicio: Date
// Crie uma interface Customer e faca o mapeamento.

// interface Customer {
//   id: number;
//   nome: string;
//   email: string;
//   plano: string;
//   mrr: number;
//   data_inicio: Date;
//   status: string;
//   industria: string;
// }

// === TODO 3: Calcule metricas ===
// 1. MRR total (soma de mrr dos clientes ativos)
// 2. Clientes por plano (contagem)
// 3. Taxa de churn (inativos / total)
// 4. MRR medio por plano
// 5. Industrias unicas

// === TODO 4: Exiba um relatorio formatado ===
// MRR Total: R$X.XXX
// Clientes ativos: X/Y
// Churn rate: X%
// Por plano:
//   Enterprise: X clientes, MRR R$X
//   Pro: X clientes, MRR R$X
//   Starter: X clientes, MRR R$X

console.log('\n--- Exercicio 1 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex1-csv-processing.ts');
