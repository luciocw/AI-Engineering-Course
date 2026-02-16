/**
 * Solucao 1: CSV Processing
 *
 * Parse CSV de clientes e calcula metricas de negocios.
 * Execute: npx tsx solucoes/ex1-csv-processing.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

interface Customer {
  id: number;
  nome: string;
  email: string;
  plano: string;
  mrr: number;
  data_inicio: Date;
  status: string;
  industria: string;
}

// Parse CSV
const csvContent = readFileSync('data/samples/customers.csv', 'utf-8');
const rawClientes = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
}) as Record<string, string>[];

// Converte tipos
const clientes: Customer[] = rawClientes.map((row) => ({
  id: parseInt(row.id, 10),
  nome: row.nome,
  email: row.email,
  plano: row.plano,
  mrr: parseInt(row.mrr, 10),
  data_inicio: new Date(row.data_inicio),
  status: row.status,
  industria: row.industria,
}));

console.log(`Total de clientes carregados: ${clientes.length}`);

// Metricas
const ativos = clientes.filter((c) => c.status === 'ativo');
const inativos = clientes.filter((c) => c.status !== 'ativo');
const mrrTotal = ativos.reduce((sum, c) => sum + c.mrr, 0);
const churnRate = (inativos.length / clientes.length) * 100;

// Por plano
const porPlano = new Map<string, { count: number; mrr: number }>();
for (const c of ativos) {
  const entry = porPlano.get(c.plano) || { count: 0, mrr: 0 };
  entry.count++;
  entry.mrr += c.mrr;
  porPlano.set(c.plano, entry);
}

// Industrias unicas
const industrias = [...new Set(clientes.map((c) => c.industria))];

// Relatorio
console.log('\n=== Relatorio de Clientes SaaS ===');
console.log(`MRR Total: R$${mrrTotal.toLocaleString('pt-BR')}`);
console.log(`Clientes ativos: ${ativos.length}/${clientes.length}`);
console.log(`Churn rate: ${churnRate.toFixed(1)}%`);
console.log(`\nPor plano:`);

for (const [plano, dados] of porPlano.entries()) {
  console.log(
    `  ${plano}: ${dados.count} clientes, MRR R$${dados.mrr.toLocaleString('pt-BR')}`
  );
}

console.log(`\nIndustrias: ${industrias.join(', ')}`);

console.log('\n--- Exercicio 1 completo! ---');
