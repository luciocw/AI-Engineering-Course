/**
 * Exercise 12: AI Classification (Claude)
 *
 * Use the Claude API to automatically classify and categorize data.
 * Difficulty: Advanced
 * Estimated time: 30 minutes
 * Run: npx tsx exercises/ex12-classificacao-ai.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const client = new Anthropic();

// Load tickets
const ticketsCSV = readFileSync('data/samples/tickets.csv', 'utf-8');
const rawTickets = parse(ticketsCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

interface Ticket {
  id: number;
  customer_id: number;
  title: string;
  priority: string;
  status: string;
  category: string;
  created_at: string;
}

const tickets: Ticket[] = rawTickets.map((r) => ({
  id: parseInt(r.id, 10),
  customer_id: parseInt(r.cliente_id, 10),
  title: r.titulo,
  priority: r.prioridade,
  status: r.status,
  category: r.categoria,
  created_at: r.criado_em,
}));

// === TODO 1: Create a function to classify ticket sentiment ===
// Use Claude to analyze the ticket title and classify as:
// 'urgent' | 'frustrated' | 'neutral' | 'positive'
// async function classifySentiment(title: string): Promise<string> {
//   const response = await client.messages.create({
//     model: 'claude-haiku-4-5-20251001',
//     max_tokens: 50,
//     messages: [{ role: 'user', content: `Classify the sentiment...` }],
//   });
//   // Parse the response
// }

// === TODO 2: Create a function to suggest department ===
// Based on the title and category, suggest which department should handle it:
// 'engineering' | 'support' | 'sales' | 'compliance' | 'product'
// async function suggestDepartment(ticket: Ticket): Promise<string> { ... }

// === TODO 3: Create a function to generate a batch summary ===
// Send multiple tickets to Claude in a single call to generate
// a summary of the most common issues.
// async function generateTicketSummary(tickets: Ticket[]): Promise<string> { ... }

// === TODO 4: Run the classification ===
// For the first 5 tickets, classify sentiment and department.
// Then generate an overall summary.

console.log('\n--- Exercise 12 complete! ---');
console.log('Hint: see the solution in solutions/ex12-classificacao-ai.ts');
