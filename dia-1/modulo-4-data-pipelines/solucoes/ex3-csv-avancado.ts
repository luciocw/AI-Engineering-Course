/**
 * Solucao 3: Filtros e Agregacoes CSV
 *
 * Funcoes utilitarias para filtrar, agrupar e agregar dados CSV.
 * Execute: npx tsx solucoes/ex3-csv-avancado.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Carrega os dados
const csvContent = readFileSync('data/samples/customers.csv', 'utf-8');
const registros = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
}) as Record<string, string>[];

// Tipagem
interface Customer {
  id: number;
  nome: string;
  email: string;
  plano: string;
  mrr: number;
  data_inicio: string;
  status: string;
  industria: string;
}

const clientes: Customer[] = registros.map((r) => ({
  id: parseInt(r.id, 10),
  nome: r.nome,
  email: r.email,
  plano: r.plano,
  mrr: parseInt(r.mrr, 10),
  data_inicio: r.data_inicio,
  status: r.status,
  industria: r.industria,
}));

// === 1: filterBy ===
function filterBy<T>(items: T[], field: keyof T, value: T[keyof T]): T[] {
  return items.filter((item) => item[field] === value);
}

// === 2: groupBy ===
function groupBy<T>(items: T[], field: keyof T): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = String(item[field]);
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  }
  return groups;
}

// === 3: aggregate ===
interface AggregateResult {
  soma: number;
  media: number;
  min: number;
  max: number;
  count: number;
}

function aggregate(values: number[]): AggregateResult {
  if (values.length === 0) {
    return { soma: 0, media: 0, min: 0, max: 0, count: 0 };
  }
  const soma = values.reduce((a, b) => a + b, 0);
  return {
    soma,
    media: Math.round(soma / values.length),
    min: Math.min(...values),
    max: Math.max(...values),
    count: values.length,
  };
}

// === 4: Gerando insights ===

// Filtra apenas ativos
const ativos = filterBy(clientes, 'status', 'ativo');

// Agrupa por plano
const porPlano = groupBy(ativos, 'plano');

console.log('=== Clientes Ativos por Plano ===\n');
for (const [plano, clientesPlano] of porPlano.entries()) {
  const mrrValues = clientesPlano.map((c) => c.mrr);
  const stats = aggregate(mrrValues);
  console.log(
    `${plano}: ${stats.count} clientes | MRR: soma=${stats.soma}, media=${stats.media}, min=${stats.min}, max=${stats.max}`
  );
}

// Agrupa por industria
const porIndustria = groupBy(clientes, 'industria');

console.log('\n=== Clientes por Industria ===\n');
const industriaEntries: string[] = [];
for (const [industria, clientesInd] of porIndustria.entries()) {
  industriaEntries.push(`${industria}: ${clientesInd.length}`);
}
console.log(industriaEntries.join(' | '));

// Plano com maior MRR medio
console.log('\n=== Plano com Maior MRR Medio ===\n');
let melhorPlano = '';
let melhorMedia = 0;

for (const [plano, clientesPlano] of porPlano.entries()) {
  const stats = aggregate(clientesPlano.map((c) => c.mrr));
  if (stats.media > melhorMedia) {
    melhorMedia = stats.media;
    melhorPlano = plano;
  }
}

console.log(`${melhorPlano} com MRR medio de R$${melhorMedia}`);

console.log('\n--- Exercicio 3 completo! ---');
