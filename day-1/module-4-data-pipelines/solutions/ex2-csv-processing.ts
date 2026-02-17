/**
 * Solution 2: CSV Processing
 *
 * Parses a customer CSV and calculates business metrics.
 * Run: npx tsx solutions/ex2-csv-processing.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

interface Customer {
  id: number;
  name: string;
  email: string;
  plan: string;
  mrr: number;
  start_date: Date;
  status: string;
  industry: string;
}

// Parse CSV
const csvContent = readFileSync('data/samples/customers.csv', 'utf-8');
const rawCustomers = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
}) as Record<string, string>[];

// Convert types
const customers: Customer[] = rawCustomers.map((row) => ({
  id: parseInt(row.id, 10),
  name: row.nome,
  email: row.email,
  plan: row.plano,
  mrr: parseInt(row.mrr, 10),
  start_date: new Date(row.data_inicio),
  status: row.status,
  industry: row.industria,
}));

console.log(`Total customers loaded: ${customers.length}`);

// Metrics
const active = customers.filter((c) => c.status === 'ativo');
const inactive = customers.filter((c) => c.status !== 'ativo');
const totalMrr = active.reduce((sum, c) => sum + c.mrr, 0);
const churnRate = (inactive.length / customers.length) * 100;

// By plan
const byPlan = new Map<string, { count: number; mrr: number }>();
for (const c of active) {
  const entry = byPlan.get(c.plan) || { count: 0, mrr: 0 };
  entry.count++;
  entry.mrr += c.mrr;
  byPlan.set(c.plan, entry);
}

// Unique industries
const industries = [...new Set(customers.map((c) => c.industry))];

// Report
console.log('\n=== SaaS Customer Report ===');
console.log(`Total MRR: $${totalMrr.toLocaleString('en-US')}`);
console.log(`Active customers: ${active.length}/${customers.length}`);
console.log(`Churn rate: ${churnRate.toFixed(1)}%`);
console.log(`\nBy plan:`);

for (const [plan, data] of byPlan.entries()) {
  console.log(
    `  ${plan}: ${data.count} customers, MRR $${data.mrr.toLocaleString('en-US')}`
  );
}

console.log(`\nIndustries: ${industries.join(', ')}`);

console.log('\n--- Exercise 2 complete! ---');
