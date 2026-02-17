/**
 * Exercise 10: Formatting with Handlebars
 *
 * Use Handlebars templates to format data into readable reports.
 * Difficulty: Intermediate
 * Estimated time: 25 minutes
 * Run: npx tsx exercises/ex10-formatacao-handlebars.ts
 */

import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Load data
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const customers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

// === TODO 1: Register Handlebars helpers ===
// Create helpers for:
// - formatCurrency: formats number as $X,XXX
// - uppercase: transforms text to uppercase
// - ifEquals: compares two values (block helper)
// - countIf: counts items in an array that satisfy a condition

// Handlebars.registerHelper('formatCurrency', function (value: number) { ... });
// Handlebars.registerHelper('uppercase', function (value: string) { ... });
// Handlebars.registerHelper('ifEquals', function (a: any, b: any, options: any) { ... });

// === TODO 2: Create a customer report template ===
// The template should:
// - List each customer with name, plan, and formatted MRR
// - Show a visual status indicator (active/churned)
// - Group by plan using #each

// const reportTemplate = Handlebars.compile(`...`);

// === TODO 3: Create an executive summary template ===
// Fields: totalMRR, activeCustomers, churnRate, topIndustries

// const summaryTemplate = Handlebars.compile(`...`);

// === TODO 4: Create an alert template ===
// For at-risk customers: name, reason, suggested action

// const alertTemplate = Handlebars.compile(`...`);

// === TODO 5: Execute the templates with real data ===
// Prepare the data and pass to each template

console.log('\n--- Exercise 10 complete! ---');
console.log('Hint: see the solution in solutions/ex10-formatacao-handlebars.ts');
