/**
 * Exercise 19: AI Context from Pipeline Data
 *
 * Build structured context for Claude prompts using processed data.
 * Difficulty: Expert
 * Estimated time: 35 minutes
 * Run: npx tsx exercises/ex19-contexto-ai.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const client = new Anthropic();

// Load data
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const rawCustomers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

const ticketsCSV = readFileSync('data/samples/tickets.csv', 'utf-8');
const rawTickets = parse(ticketsCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

// === TODO 1: Create a context builder ===
// The builder should compose a structured context in stages.
// class ContextBuilder {
//   private sections: { title: string; content: string }[] = [];
//
//   addSection(title: string, content: string): this { ... }
//   addData(title: string, data: unknown): this { ... }
//   addMetrics(title: string, metrics: Record<string, number | string>): this { ... }
//   addConstraints(constraints: string[]): this { ... }
//   build(): string { ... }
// }

// === TODO 2: Create data summarization functions ===
// Functions that transform data arrays into concise summaries:
// - summarizeCustomers: customer KPIs
// - summarizeTickets: support metrics
// - summarizeBySegment: segmentation by plan/industry
// Each function returns a formatted string for AI context

// === TODO 3: Create prompts that use the context ===
// 3 types of analysis:
// a) Churn analysis: which customers are at risk?
// b) Upsell recommendation: who could upgrade?
// c) Executive summary: business overview

// === TODO 4: Implement the AI analysis function ===
// async function analyzeWithContext(
//   contextBuilder: ContextBuilder,
//   question: string
// ): Promise<string> {
//   // Build the context and send to Claude with the question
// }

// === TODO 5: Run the 3 analyses and display results ===

console.log('\n--- Exercise 19 complete! ---');
console.log('Hint: see the solution in solutions/ex19-contexto-ai.ts');
