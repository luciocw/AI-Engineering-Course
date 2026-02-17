/**
 * Solution 8: Data Enrichment
 *
 * Adds calculated and derived fields to existing data.
 * Run: npx tsx solutions/ex8-enriquecimento-dados.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Load data
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const rawCustomers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

const ticketsCSV = readFileSync('data/samples/tickets.csv', 'utf-8');
const rawTickets = parse(ticketsCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

interface Customer {
  id: number;
  name: string;
  email: string;
  plan: string;
  mrr: number;
  start_date: string;
  status: string;
  industry: string;
}

interface Ticket {
  id: number;
  customer_id: number;
  title: string;
  priority: string;
  status: string;
  category: string;
  created_at: string;
  resolved_at: string;
}

interface EnrichedCustomer extends Customer {
  ageDays: number;
  healthScore: number;
  risk: 'low' | 'medium' | 'high';
  estimatedLtv: number;
  totalTickets: number;
  openTickets: number;
}

const customers: Customer[] = rawCustomers.map((r) => ({
  id: parseInt(r.id, 10),
  name: r.nome,
  email: r.email,
  plan: r.plano,
  mrr: parseInt(r.mrr, 10),
  start_date: r.data_inicio,
  status: r.status,
  industry: r.industria,
}));

const tickets: Ticket[] = rawTickets.map((r) => ({
  id: parseInt(r.id, 10),
  customer_id: parseInt(r.cliente_id, 10),
  title: r.titulo,
  priority: r.prioridade,
  status: r.status,
  category: r.categoria,
  created_at: r.criado_em,
  resolved_at: r.resolvido_em,
}));

// === 1: Customer age ===
function calculateCustomerAge(startDate: string): number {
  const start = new Date(startDate).getTime();
  const today = Date.now();
  return Math.floor((today - start) / (1000 * 60 * 60 * 24));
}

// === 2: Health score ===
function calculateHealthScore(customer: Customer, customerTickets: Ticket[]): number {
  let score = 0;

  // Active status: +40
  if (customer.status === 'ativo') score += 40;

  // Time as customer
  const ageDays = calculateCustomerAge(customer.start_date);
  if (ageDays > 180) score += 20;
  else if (ageDays > 90) score += 10;

  // Plan
  if (customer.plan === 'Enterprise') score += 20;
  else if (customer.plan === 'Pro') score += 15;
  else score += 10;

  // Open tickets
  const openTickets = customerTickets.filter((t) => t.status === 'aberto').length;
  if (openTickets === 0) score += 20;
  else if (openTickets === 1) score += 10;

  return Math.min(score, 100);
}

// === 3: Risk classification ===
function classifyRisk(healthScore: number): 'low' | 'medium' | 'high' {
  if (healthScore >= 80) return 'low';
  if (healthScore >= 50) return 'medium';
  return 'high';
}

// === 4: Estimated LTV ===
function calculateLTV(mrr: number, risk: string): number {
  const churnRates: Record<string, number> = {
    low: 0.02,
    medium: 0.05,
    high: 0.10,
  };
  const churnRate = churnRates[risk] || 0.10;
  return Math.round(mrr / churnRate);
}

// === 5: Enrichment function ===
function enrichCustomer(customer: Customer, allTickets: Ticket[]): EnrichedCustomer {
  const customerTickets = allTickets.filter((t) => t.customer_id === customer.id);
  const ageDays = calculateCustomerAge(customer.start_date);
  const healthScore = calculateHealthScore(customer, customerTickets);
  const risk = classifyRisk(healthScore);
  const estimatedLtv = calculateLTV(customer.mrr, risk);
  const openTickets = customerTickets.filter((t) => t.status === 'aberto').length;

  return {
    ...customer,
    ageDays,
    healthScore,
    risk,
    estimatedLtv,
    totalTickets: customerTickets.length,
    openTickets,
  };
}

// Execute
const enrichedCustomers = customers.map((c) => enrichCustomer(c, tickets));

console.log('=== Enriched Customers ===\n');

// Sort by health score (lowest first to see who needs attention)
const sorted = [...enrichedCustomers].sort((a, b) => a.healthScore - b.healthScore);

for (const c of sorted) {
  const riskIcon = c.risk === 'high' ? '[!!!]' : c.risk === 'medium' ? '[!!]' : '[ok]';
  console.log(`${riskIcon} ${c.name} (${c.plan})`);
  console.log(`  Health: ${c.healthScore}/100 | Risk: ${c.risk} | Status: ${c.status}`);
  console.log(`  MRR: $${c.mrr} | LTV: $${c.estimatedLtv.toLocaleString('en-US')} | Age: ${c.ageDays} days`);
  console.log(`  Tickets: ${c.totalTickets} total, ${c.openTickets} open`);
  console.log('');
}

// Summary
const risks = { low: 0, medium: 0, high: 0 };
let totalLtv = 0;
for (const c of enrichedCustomers) {
  risks[c.risk]++;
  totalLtv += c.estimatedLtv;
}

console.log('=== Summary ===');
console.log(`Low risk: ${risks.low} | Medium risk: ${risks.medium} | High risk: ${risks.high}`);
console.log(`Total estimated LTV: $${totalLtv.toLocaleString('en-US')}`);

console.log('\n--- Exercise 8 complete! ---');
