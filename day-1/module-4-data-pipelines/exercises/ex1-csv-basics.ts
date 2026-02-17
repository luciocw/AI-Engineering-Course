/**
 * Exercise 1: Basic CSV Parsing
 *
 * Learn to read and type data from a CSV file using csv-parse/sync.
 * Difficulty: Beginner
 * Estimated time: 15 minutes
 * Run: npx tsx exercises/ex1-csv-basico.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// === TODO 1: Read the CSV file ===
// Use readFileSync to read the file data/samples/customers.csv
// Encoding: 'utf-8'

// const csvContent = readFileSync('data/samples/customers.csv', 'utf-8');

// === TODO 2: Parse the CSV using csv-parse/sync ===
// Use the parse function with the options:
//   { columns: true, skip_empty_lines: true }
// This transforms each row into an object { column: value }
// Hint: the result will be an array of Record<string, string>

// const records = parse(csvContent, { ... });

// === TODO 3: Define an interface to type the records ===
// Create the Customer interface with the fields:
//   id, name, email, plan, mrr, start_date, status, industry
// All as string (since CSV returns strings)

// interface CustomerRaw {
//   id: string;
//   name: string;
//   email: string;
//   plan: string;
//   mrr: string;
//   start_date: string;
//   status: string;
//   industry: string;
// }

// === TODO 4: Print basic statistics ===
// 1. Total number of records
// 2. Names of all columns (Object.keys of the first record)
// 3. Unique cities/industries (use Set)
// 4. Print the first 3 records formatted

// console.log(`Total records: ${records.length}`);
// console.log(`Columns: ${Object.keys(records[0]).join(', ')}`);
//
// const uniqueIndustries = [...new Set(records.map((r: CustomerRaw) => r.industry))];
// console.log(`Unique industries (${uniqueIndustries.length}): ${uniqueIndustries.join(', ')}`);
//
// console.log('\nFirst 3 records:');
// for (const record of records.slice(0, 3)) {
//   console.log(`  ${record.name} - ${record.plan} - ${record.industry}`);
// }

console.log('\n--- Exercise 1 complete! ---');
console.log('Hint: see the solution in solutions/ex1-csv-basico.ts');
