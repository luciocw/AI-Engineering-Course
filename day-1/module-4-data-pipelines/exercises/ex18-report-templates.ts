/**
 * Exercise 18: Reports with Handlebars Templates
 *
 * Generate professional reports using Handlebars and pipeline data.
 * Difficulty: Expert
 * Estimated time: 35 minutes
 * Run: npx tsx exercises/ex18-relatorio-templates.ts
 */

import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Load data
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const rawCustomers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

const ticketsCSV = readFileSync('data/samples/tickets.csv', 'utf-8');
const rawTickets = parse(ticketsCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

// === TODO 1: Register advanced helpers ===
// - barChart: generates an ASCII bar chart given a value and max
//   Example: barChart(7, 10) -> "======= " (7 out of 10)
// - percentage: calculates and formats a percentage
// - pluralize: returns singular/plural form
// - relativeDate: returns "X days ago" or "X months ago"
// - conditional class: returns CSS classes based on value

// === TODO 2: Create an executive dashboard template ===
// With sections: KPIs, Customer Health, Tickets, Trends
// Use partials for each section
// Handlebars.registerPartial('kpiSection', `...`);
// Handlebars.registerPartial('healthSection', `...`);
// Handlebars.registerPartial('ticketSection', `...`);

// === TODO 3: Create an individual customer report template ===
// For each customer, show: data, tickets, metrics, recommendations

// === TODO 4: Create an email alert template (text) ===
// Simulate an alert email with: recipient, subject, formatted body

// === TODO 5: Prepare the data and generate all reports ===

console.log('\n--- Exercise 18 complete! ---');
console.log('Hint: see the solution in solutions/ex18-relatorio-templates.ts');
