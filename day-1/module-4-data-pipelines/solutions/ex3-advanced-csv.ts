/**
 * Solution 3: CSV Filters and Aggregations
 *
 * Utility functions to filter, group, and aggregate CSV data.
 * Run: npx tsx solutions/ex3-csv-avancado.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Load data
const csvContent = readFileSync('data/samples/customers.csv', 'utf-8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
}) as Record<string, string>[];

// Typing
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

const customers: Customer[] = records.map((r) => ({
  id: parseInt(r.id, 10),
  name: r.nome,
  email: r.email,
  plan: r.plano,
  mrr: parseInt(r.mrr, 10),
  start_date: r.data_inicio,
  status: r.status,
  industry: r.industria,
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
  sum: number;
  average: number;
  min: number;
  max: number;
  count: number;
}

function aggregate(values: number[]): AggregateResult {
  if (values.length === 0) {
    return { sum: 0, average: 0, min: 0, max: 0, count: 0 };
  }
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    sum,
    average: Math.round(sum / values.length),
    min: Math.min(...values),
    max: Math.max(...values),
    count: values.length,
  };
}

// === 4: Generating insights ===

// Filter active only
const active = filterBy(customers, 'status', 'ativo');

// Group by plan
const byPlan = groupBy(active, 'plan');

console.log('=== Active Customers by Plan ===\n');
for (const [plan, planCustomers] of byPlan.entries()) {
  const mrrValues = planCustomers.map((c) => c.mrr);
  const stats = aggregate(mrrValues);
  console.log(
    `${plan}: ${stats.count} customers | MRR: sum=${stats.sum}, average=${stats.average}, min=${stats.min}, max=${stats.max}`
  );
}

// Group by industry
const byIndustry = groupBy(customers, 'industry');

console.log('\n=== Customers by Industry ===\n');
const industryEntries: string[] = [];
for (const [industry, industryCustomers] of byIndustry.entries()) {
  industryEntries.push(`${industry}: ${industryCustomers.length}`);
}
console.log(industryEntries.join(' | '));

// Plan with highest average MRR
console.log('\n=== Plan with Highest Average MRR ===\n');
let bestPlan = '';
let bestAverage = 0;

for (const [plan, planCustomers] of byPlan.entries()) {
  const stats = aggregate(planCustomers.map((c) => c.mrr));
  if (stats.average > bestAverage) {
    bestAverage = stats.average;
    bestPlan = plan;
  }
}

console.log(`${bestPlan} with average MRR of $${bestAverage}`);

console.log('\n--- Exercise 3 complete! ---');
