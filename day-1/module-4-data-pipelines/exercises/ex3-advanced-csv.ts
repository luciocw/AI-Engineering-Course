/**
 * Exercise 3: CSV Filters and Aggregations
 *
 * Create utility functions to filter, group, and aggregate CSV data.
 * Difficulty: Intermediate
 * Estimated time: 25 minutes
 * Run: npx tsx exercises/ex3-csv-avancado.ts
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

// === TODO 1: Implement filterBy ===
// Generic function that filters an array of objects by a field and value.
// Example: filterBy(customers, 'plan', 'Enterprise') => [...enterprise customers]

// function filterBy<T>(items: T[], field: keyof T, value: T[keyof T]): T[] {
//   // Your implementation here
// }

// === TODO 2: Implement groupBy ===
// Generic function that groups an array by the value of a field.
// Returns a Map<string, T[]>
// Example: groupBy(customers, 'plan') => Map { 'Enterprise' => [...], 'Pro' => [...] }

// function groupBy<T>(items: T[], field: keyof T): Map<string, T[]> {
//   // Your implementation here
// }

// === TODO 3: Implement aggregate ===
// Function that receives an array of numbers and returns:
// { sum, average, min, max, count }

// interface AggregateResult {
//   sum: number;
//   average: number;
//   min: number;
//   max: number;
//   count: number;
// }
//
// function aggregate(values: number[]): AggregateResult {
//   // Your implementation here
// }

// === TODO 4: Use the functions to generate insights ===
// 1. Filter only active customers
// 2. Group customers by plan
// 3. For each plan, calculate aggregate of MRR
// 4. Group by industry and count customers per industry
// 5. Find the plan with the highest average MRR

// Expected output example:
// === Active Customers by Plan ===
// Enterprise: 4 customers | MRR: sum=3996, average=999, min=999, max=999
// Pro: 3 customers | MRR: sum=897, average=299, min=299, max=299
// Starter: 1 customers | MRR: sum=49, average=49, min=49, max=49
//
// === Customers by Industry ===
// Technology: 1 | Fintech: 1 | ...

console.log('\n--- Exercise 3 complete! ---');
console.log('Hint: see the solution in solutions/ex3-csv-avancado.ts');
