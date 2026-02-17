/**
 * Exercicio 8: Enriquecimento de Dados
 *
 * Adicione campos calculados e derivados aos dados existentes.
 * Dificuldade: Intermediario
 * Tempo estimado: 25 minutos
 * Execute: npx tsx exercicios/ex8-enriquecimento-dados.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Carrega dados
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const rawCustomers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

const ticketsCSV = readFileSync('data/samples/tickets.csv', 'utf-8');
const rawTickets = parse(ticketsCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

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

interface Ticket {
  id: number;
  cliente_id: number;
  titulo: string;
  prioridade: string;
  status: string;
  categoria: string;
  criado_em: string;
  resolvido_em: string;
}

const customers: Customer[] = rawCustomers.map((r) => ({
  id: parseInt(r.id, 10),
  nome: r.nome,
  email: r.email,
  plano: r.plano,
  mrr: parseInt(r.mrr, 10),
  data_inicio: r.data_inicio,
  status: r.status,
  industria: r.industria,
}));

const tickets: Ticket[] = rawTickets.map((r) => ({
  id: parseInt(r.id, 10),
  cliente_id: parseInt(r.cliente_id, 10),
  titulo: r.titulo,
  prioridade: r.prioridade,
  status: r.status,
  categoria: r.categoria,
  criado_em: r.criado_em,
  resolvido_em: r.resolvido_em,
}));

// === TODO 1: Calcule a "idade" do cliente em dias ===
// function calcularIdadeCliente(dataInicio: string): number {
//   // Diferenca entre hoje e data_inicio em dias
// }

// === TODO 2: Calcule o "health score" do cliente (0-100) ===
// Baseado em:
// - Status ativo: +40 pontos
// - Tempo como cliente (>180 dias: +20, >90 dias: +10)
// - Plano (Enterprise: +20, Pro: +15, Starter: +10)
// - Tickets abertos (0: +20, 1: +10, 2+: 0)
// function calcularHealthScore(customer: Customer, customerTickets: Ticket[]): number { ... }

// === TODO 3: Classifique o risco de churn ===
// - healthScore >= 80: 'baixo'
// - healthScore >= 50: 'medio'
// - healthScore < 50: 'alto'
// function classificarRisco(healthScore: number): 'baixo' | 'medio' | 'alto' { ... }

// === TODO 4: Calcule o LTV estimado ===
// LTV = MRR * (1 / churnRate) onde churnRate eh estimado pelo risco
// - baixo: 0.02 (2% mensal)
// - medio: 0.05 (5% mensal)
// - alto: 0.10 (10% mensal)
// function calcularLTV(mrr: number, risco: string): number { ... }

// === TODO 5: Crie a funcao de enriquecimento ===
// Combine todos os calculos acima e retorne EnrichedCustomer
// interface EnrichedCustomer extends Customer {
//   idadeDias: number;
//   healthScore: number;
//   risco: 'baixo' | 'medio' | 'alto';
//   ltvEstimado: number;
//   totalTickets: number;
//   ticketsAbertos: number;
// }
// function enrichCustomer(customer: Customer, allTickets: Ticket[]): EnrichedCustomer { ... }

// Execute o enriquecimento e exiba resultados

console.log('\n--- Exercicio 8 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex8-enriquecimento-dados.ts');
