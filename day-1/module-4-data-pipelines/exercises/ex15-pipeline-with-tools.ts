/**
 * Exercise 15: Pipeline with Claude Tools
 *
 * Use Claude's Tool Use to enrich data within the pipeline.
 * Difficulty: Advanced
 * Estimated time: 35 minutes
 * Run: npx tsx exercises/ex15-pipeline-com-tools.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const client = new Anthropic();

// Load data
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const rawCustomers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

// === TODO 1: Define the tools for Claude ===
// Create 2 tools:
// 1. lookup_customer: receives email, returns customer data from CSV
// 2. calculate_metrics: receives customer_id, returns calculated metrics
// The tools should follow the format:
// { name: string, description: string, input_schema: { type: 'object', properties: {...}, required: [...] } }

// const tools: Anthropic.Tool[] = [ ... ];

// === TODO 2: Implement the tool handler ===
// When Claude calls a tool, execute the actual logic.
// function handleToolCall(name: string, input: Record<string, unknown>): string {
//   if (name === 'lookup_customer') { ... }
//   if (name === 'calculate_metrics') { ... }
// }

// === TODO 3: Implement the conversation loop with tools ===
// 1. Send a message asking Claude to analyze a customer
// 2. If Claude calls a tool, execute and send the result back
// 3. Continue until Claude gives a final response
// async function analyzeCustomer(email: string): Promise<string> { ... }

// === TODO 4: Run the pipeline ===
// For 3 customers, use the loop with tools to get enriched analyses.

console.log('\n--- Exercise 15 complete! ---');
console.log('Hint: see the solution in solutions/ex15-pipeline-com-tools.ts');
