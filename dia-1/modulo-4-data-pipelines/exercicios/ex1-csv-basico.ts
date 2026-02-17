/**
 * Exercicio 1: Parsing CSV Basico
 *
 * Aprenda a ler e tipar dados de um arquivo CSV usando csv-parse/sync.
 * Dificuldade: Iniciante
 * Tempo estimado: 15 minutos
 * Execute: npx tsx exercicios/ex1-csv-basico.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// === TODO 1: Leia o arquivo CSV ===
// Use readFileSync para ler o arquivo data/samples/customers.csv
// Encoding: 'utf-8'

// const csvContent = readFileSync('data/samples/customers.csv', 'utf-8');

// === TODO 2: Parse o CSV usando csv-parse/sync ===
// Use a funcao parse com as opcoes:
//   { columns: true, skip_empty_lines: true }
// Isso transforma cada linha em um objeto { coluna: valor }
// Dica: o resultado sera um array de Record<string, string>

// const registros = parse(csvContent, { ... });

// === TODO 3: Defina uma interface para tipar os registros ===
// Crie a interface Customer com os campos:
//   id, nome, email, plano, mrr, data_inicio, status, industria
// Todos como string (pois o CSV retorna strings)

// interface CustomerRaw {
//   id: string;
//   nome: string;
//   email: string;
//   plano: string;
//   mrr: string;
//   data_inicio: string;
//   status: string;
//   industria: string;
// }

// === TODO 4: Imprima estatisticas basicas ===
// 1. Numero total de registros
// 2. Nomes de todas as colunas (Object.keys do primeiro registro)
// 3. Cidades/industrias unicas (use Set)
// 4. Imprima os 3 primeiros registros formatados

// console.log(`Total de registros: ${registros.length}`);
// console.log(`Colunas: ${Object.keys(registros[0]).join(', ')}`);
//
// const industriasUnicas = [...new Set(registros.map((r: CustomerRaw) => r.industria))];
// console.log(`Industrias unicas (${industriasUnicas.length}): ${industriasUnicas.join(', ')}`);
//
// console.log('\nPrimeiros 3 registros:');
// for (const reg of registros.slice(0, 3)) {
//   console.log(`  ${reg.nome} - ${reg.plano} - ${reg.industria}`);
// }

console.log('\n--- Exercicio 1 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex1-csv-basico.ts');
