/**
 * Solucao 1: Parsing CSV Basico
 *
 * Le e tipa dados de um arquivo CSV usando csv-parse/sync.
 * Execute: npx tsx solucoes/ex1-csv-basico.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// === 1: Leia o arquivo CSV ===
const csvContent = readFileSync('data/samples/customers.csv', 'utf-8');

// === 2: Parse o CSV ===
const registros = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
}) as Record<string, string>[];

// === 3: Interface tipada ===
interface CustomerRaw {
  id: string;
  nome: string;
  email: string;
  plano: string;
  mrr: string;
  data_inicio: string;
  status: string;
  industria: string;
}

const clientes = registros as CustomerRaw[];

// === 4: Estatisticas basicas ===
console.log('=== Parsing CSV Basico ===\n');
console.log(`Total de registros: ${clientes.length}`);
console.log(`Colunas: ${Object.keys(clientes[0]).join(', ')}`);

const industriasUnicas = [...new Set(clientes.map((r) => r.industria))];
console.log(`Industrias unicas (${industriasUnicas.length}): ${industriasUnicas.join(', ')}`);

const planosUnicos = [...new Set(clientes.map((r) => r.plano))];
console.log(`Planos unicos (${planosUnicos.length}): ${planosUnicos.join(', ')}`);

const statusUnicos = [...new Set(clientes.map((r) => r.status))];
console.log(`Status unicos (${statusUnicos.length}): ${statusUnicos.join(', ')}`);

console.log('\nPrimeiros 3 registros:');
for (const reg of clientes.slice(0, 3)) {
  console.log(`  ${reg.nome} - ${reg.plano} - MRR: R$${reg.mrr} - ${reg.industria}`);
}

console.log('\n--- Exercicio 1 completo! ---');
