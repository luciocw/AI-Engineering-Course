/**
 * Solution 1: Basic CSV Parsing
 *
 * Reads and types data from a CSV file using csv-parse/sync.
 * Run: npx tsx solutions/ex1-csv-basico.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// === 1: Read the CSV file ===
const csvContent = readFileSync('data/samples/customers.csv', 'utf-8');

// === 2: Parse the CSV ===
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
}) as Record<string, string>[];

// === 3: Typed interface ===
interface CustomerRaw {
  id: string;
  name: string;
  email: string;
  plan: string;
  mrr: string;
  start_date: string;
  status: string;
  industry: string;
}

const customers = records as CustomerRaw[];

// === 4: Basic statistics ===
console.log('=== Basic CSV Parsing ===\n');
console.log(`Total records: ${customers.length}`);
console.log(`Columns: ${Object.keys(customers[0]).join(', ')}`);

const uniqueIndustries = [...new Set(customers.map((r) => r.industry))];
console.log(`Unique industries (${uniqueIndustries.length}): ${uniqueIndustries.join(', ')}`);

const uniquePlans = [...new Set(customers.map((r) => r.plan))];
console.log(`Unique plans (${uniquePlans.length}): ${uniquePlans.join(', ')}`);

const uniqueStatuses = [...new Set(customers.map((r) => r.status))];
console.log(`Unique statuses (${uniqueStatuses.length}): ${uniqueStatuses.join(', ')}`);

console.log('\nFirst 3 records:');
for (const record of customers.slice(0, 3)) {
  console.log(`  ${record.name} - ${record.plan} - MRR: $${record.mrr} - ${record.industry}`);
}

console.log('\n--- Exercise 1 complete! ---');
