/**
 * Solucao 8: Enriquecimento de Dados
 *
 * Adiciona campos calculados e derivados aos dados existentes.
 * Execute: npx tsx solucoes/ex8-enriquecimento-dados.ts
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

interface EnrichedCustomer extends Customer {
  idadeDias: number;
  healthScore: number;
  risco: 'baixo' | 'medio' | 'alto';
  ltvEstimado: number;
  totalTickets: number;
  ticketsAbertos: number;
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

// === 1: Idade do cliente ===
function calcularIdadeCliente(dataInicio: string): number {
  const inicio = new Date(dataInicio).getTime();
  const hoje = Date.now();
  return Math.floor((hoje - inicio) / (1000 * 60 * 60 * 24));
}

// === 2: Health score ===
function calcularHealthScore(customer: Customer, customerTickets: Ticket[]): number {
  let score = 0;

  // Status ativo: +40
  if (customer.status === 'ativo') score += 40;

  // Tempo como cliente
  const idadeDias = calcularIdadeCliente(customer.data_inicio);
  if (idadeDias > 180) score += 20;
  else if (idadeDias > 90) score += 10;

  // Plano
  if (customer.plano === 'Enterprise') score += 20;
  else if (customer.plano === 'Pro') score += 15;
  else score += 10;

  // Tickets abertos
  const ticketsAbertos = customerTickets.filter((t) => t.status === 'aberto').length;
  if (ticketsAbertos === 0) score += 20;
  else if (ticketsAbertos === 1) score += 10;

  return Math.min(score, 100);
}

// === 3: Classificacao de risco ===
function classificarRisco(healthScore: number): 'baixo' | 'medio' | 'alto' {
  if (healthScore >= 80) return 'baixo';
  if (healthScore >= 50) return 'medio';
  return 'alto';
}

// === 4: LTV estimado ===
function calcularLTV(mrr: number, risco: string): number {
  const churnRates: Record<string, number> = {
    baixo: 0.02,
    medio: 0.05,
    alto: 0.10,
  };
  const churnRate = churnRates[risco] || 0.10;
  return Math.round(mrr / churnRate);
}

// === 5: Funcao de enriquecimento ===
function enrichCustomer(customer: Customer, allTickets: Ticket[]): EnrichedCustomer {
  const customerTickets = allTickets.filter((t) => t.cliente_id === customer.id);
  const idadeDias = calcularIdadeCliente(customer.data_inicio);
  const healthScore = calcularHealthScore(customer, customerTickets);
  const risco = classificarRisco(healthScore);
  const ltvEstimado = calcularLTV(customer.mrr, risco);
  const ticketsAbertos = customerTickets.filter((t) => t.status === 'aberto').length;

  return {
    ...customer,
    idadeDias,
    healthScore,
    risco,
    ltvEstimado,
    totalTickets: customerTickets.length,
    ticketsAbertos,
  };
}

// Executa
const enrichedCustomers = customers.map((c) => enrichCustomer(c, tickets));

console.log('=== Clientes Enriquecidos ===\n');

// Ordena por health score (menor primeiro para ver quem precisa de atencao)
const sorted = [...enrichedCustomers].sort((a, b) => a.healthScore - b.healthScore);

for (const c of sorted) {
  const riscoEmoji = c.risco === 'alto' ? '[!!!]' : c.risco === 'medio' ? '[!!]' : '[ok]';
  console.log(`${riscoEmoji} ${c.nome} (${c.plano})`);
  console.log(`  Health: ${c.healthScore}/100 | Risco: ${c.risco} | Status: ${c.status}`);
  console.log(`  MRR: R$${c.mrr} | LTV: R$${c.ltvEstimado.toLocaleString('pt-BR')} | Idade: ${c.idadeDias} dias`);
  console.log(`  Tickets: ${c.totalTickets} total, ${c.ticketsAbertos} abertos`);
  console.log('');
}

// Resumo
const riscos = { baixo: 0, medio: 0, alto: 0 };
let ltvTotal = 0;
for (const c of enrichedCustomers) {
  riscos[c.risco]++;
  ltvTotal += c.ltvEstimado;
}

console.log('=== Resumo ===');
console.log(`Risco baixo: ${riscos.baixo} | Risco medio: ${riscos.medio} | Risco alto: ${riscos.alto}`);
console.log(`LTV Total estimado: R$${ltvTotal.toLocaleString('pt-BR')}`);

console.log('\n--- Exercicio 8 completo! ---');
