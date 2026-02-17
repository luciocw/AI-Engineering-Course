/**
 * Exercise 2: CSV Processing
 *
 * Parse a customer CSV and calculate business metrics.
 * Run: npx tsx exercises/ex2-csv-processing.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// === TODO 1: Read and parse the CSV ===
// File: data/samples/customers.csv
// Use csv-parse/sync with options: { columns: true, skip_empty_lines: true }
// This returns an array of objects with the columns as keys.

// const csvContent = readFileSync('data/samples/customers.csv', 'utf-8');
// const customers = parse(csvContent, { ... });

// === TODO 2: Convert types ===
// CSV returns everything as string. Convert:
// - mrr: number (parseInt)
// - id: number
// - start_date: Date
// Create a Customer interface and do the mapping.

// interface Customer {
//   id: number;
//   name: string;
//   email: string;
//   plan: string;
//   mrr: number;
//   start_date: Date;
//   status: string;
//   industry: string;
// }

// === TODO 3: Calculate metrics ===
// 1. Total MRR (sum of mrr from active customers)
// 2. Customers by plan (count)
// 3. Churn rate (inactive / total)
// 4. Average MRR by plan
// 5. Unique industries

// === TODO 4: Display a formatted report ===
// Total MRR: $X,XXX
// Active customers: X/Y
// Churn rate: X%
// By plan:
//   Enterprise: X customers, MRR $X
//   Pro: X customers, MRR $X
//   Starter: X customers, MRR $X

console.log('\n--- Exercise 2 complete! ---');
console.log('Hint: see the solution in solutions/ex2-csv-processing.ts');
