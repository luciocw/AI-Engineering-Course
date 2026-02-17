/**
 * Solution 12: AI Classification (Claude)
 *
 * Uses the Claude API to classify and categorize data.
 * Run: npx tsx solutions/ex12-ai-classification.ts
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

// === 1: Classify sentiment ===
async function classifySentiment(title: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 50,
    messages: [
      {
        role: 'user',
        content: `Classify the sentiment of this support ticket title in EXACTLY one word: urgent, frustrated, neutral, or positive.

Title: "${title}"

Respond ONLY with the classification, no explanation.`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text.trim().toLowerCase() : 'neutral';
  const valid = ['urgent', 'frustrated', 'neutral', 'positive'];
  return valid.includes(text) ? text : 'neutral';
}

// === 2: Suggest department ===
async function suggestDepartment(ticket: Ticket): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 50,
    messages: [
      {
        role: 'user',
        content: `Based on this support ticket, suggest which department should handle it. Respond ONLY with one option: engineering, support, sales, compliance, or product.

Title: "${ticket.title}"
Category: ${ticket.category}
Priority: ${ticket.priority}

Department:`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text.trim().toLowerCase() : 'support';
  const valid = ['engineering', 'support', 'sales', 'compliance', 'product'];
  return valid.includes(text) ? text : 'support';
}

// === 3: Batch summary ===
async function generateTicketSummary(ticketList: Ticket[]): Promise<string> {
  const ticketTexts = ticketList.map(
    (t) => `- [${t.priority}] ${t.title} (${t.category}, ${t.status})`
  ).join('\n');

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `Analyze these support tickets and generate an executive summary with:
1. Main issues identified
2. Most affected areas
3. Action recommendations

Tickets:
${ticketTexts}

Summary:`,
      },
    ],
  });

  return response.content[0].type === 'text' ? response.content[0].text : 'Error generating summary';
}

// === 4: Execute ===
async function main() {
  console.log('=== AI Ticket Classification ===\n');

  // Classify the first 5 tickets
  const ticketsToClassify = tickets.slice(0, 5);

  console.log('--- Individual Classification ---\n');

  for (const ticket of ticketsToClassify) {
    const sentiment = await classifySentiment(ticket.title);
    const department = await suggestDepartment(ticket);

    console.log(`Ticket #${ticket.id}: "${ticket.title}"`);
    console.log(`  Original category: ${ticket.category}`);
    console.log(`  AI sentiment: ${sentiment}`);
    console.log(`  AI department: ${department}`);
    console.log('');
  }

  // General summary
  console.log('--- AI General Summary ---\n');
  const summary = await generateTicketSummary(tickets);
  console.log(summary);

  console.log('\n--- Exercise 12 complete! ---');
}

main().catch(console.error);
