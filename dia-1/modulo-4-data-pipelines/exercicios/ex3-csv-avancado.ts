/**
 * Exercicio 3: Filtros e Agregacoes CSV
 *
 * Crie funcoes utilitarias para filtrar, agrupar e agregar dados CSV.
 * Dificuldade: Intermediario
 * Tempo estimado: 25 minutos
 * Execute: npx tsx exercicios/ex3-csv-avancado.ts
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

// === TODO 1: Implemente filterBy ===
// Funcao generica que filtra um array de objetos por um campo e valor.
// Exemplo: filterBy(clientes, 'plano', 'Enterprise') => [...clientes enterprise]

// function filterBy<T>(items: T[], field: keyof T, value: T[keyof T]): T[] {
//   // Sua implementacao aqui
// }

// === TODO 2: Implemente groupBy ===
// Funcao generica que agrupa um array pelo valor de um campo.
// Retorna um Map<string, T[]>
// Exemplo: groupBy(clientes, 'plano') => Map { 'Enterprise' => [...], 'Pro' => [...] }

// function groupBy<T>(items: T[], field: keyof T): Map<string, T[]> {
//   // Sua implementacao aqui
// }

// === TODO 3: Implemente aggregate ===
// Funcao que recebe um array de numeros e retorna:
// { soma, media, min, max, count }

// interface AggregateResult {
//   soma: number;
//   media: number;
//   min: number;
//   max: number;
//   count: number;
// }
//
// function aggregate(values: number[]): AggregateResult {
//   // Sua implementacao aqui
// }

// === TODO 4: Use as funcoes para gerar insights ===
// 1. Filtre apenas clientes ativos
// 2. Agrupe clientes por plano
// 3. Para cada plano, calcule aggregate do MRR
// 4. Agrupe por industria e conte clientes por industria
// 5. Encontre o plano com maior MRR medio

// Exemplo de output esperado:
// === Clientes Ativos por Plano ===
// Enterprise: 4 clientes | MRR: soma=3996, media=999, min=999, max=999
// Pro: 3 clientes | MRR: soma=897, media=299, min=299, max=299
// Starter: 1 clientes | MRR: soma=49, media=49, min=49, max=49
//
// === Clientes por Industria ===
// Tecnologia: 1 | Fintech: 1 | ...

console.log('\n--- Exercicio 3 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex3-csv-avancado.ts');
