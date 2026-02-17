/**
 * Exercise 8: Data Enrichment
 *
 * Add calculated and derived fields to existing data.
 * Difficulty: Intermediate
 * Estimated time: 25 minutes
 * Run: npx tsx exercises/ex8-enriquecimento-dados.ts
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

// === TODO 1: Calculate the customer "age" in days ===
// function calculateCustomerAge(startDate: string): number {
//   // Difference between today and start_date in days
// }

// === TODO 2: Calculate the customer "health score" (0-100) ===
// Based on:
// - Active status: +40 points
// - Time as customer (>180 days: +20, >90 days: +10)
// - Plan (Enterprise: +20, Pro: +15, Starter: +10)
// - Open tickets (0: +20, 1: +10, 2+: 0)
// function calculateHealthScore(customer: Customer, customerTickets: Ticket[]): number { ... }

// === TODO 3: Classify churn risk ===
// - healthScore >= 80: 'low'
// - healthScore >= 50: 'medium'
// - healthScore < 50: 'high'
// function classifyRisk(healthScore: number): 'low' | 'medium' | 'high' { ... }

// === TODO 4: Calculate estimated LTV ===
// LTV = MRR * (1 / churnRate) where churnRate is estimated by risk
// - low: 0.02 (2% monthly)
// - medium: 0.05 (5% monthly)
// - high: 0.10 (10% monthly)
// function calculateLTV(mrr: number, risk: string): number { ... }

// === TODO 5: Create the enrichment function ===
// Combine all calculations above and return EnrichedCustomer
// interface EnrichedCustomer extends Customer {
//   ageDays: number;
//   healthScore: number;
//   risk: 'low' | 'medium' | 'high';
//   estimatedLTV: number;
//   totalTickets: number;
//   openTickets: number;
// }
// function enrichCustomer(customer: Customer, allTickets: Ticket[]): EnrichedCustomer { ... }

// Run the enrichment and display results

console.log('\n--- Exercise 8 complete! ---');
console.log('Hint: see the solution in solutions/ex8-enriquecimento-dados.ts');
