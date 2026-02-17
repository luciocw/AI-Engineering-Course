/**
 * Solution 19: AI Context from Pipeline Data
 *
 * Builds structured context for Claude prompts using processed data.
 * Run: npx tsx solutions/ex19-ai-context.ts
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

// Types
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

interface Ticket {
  id: number;
  customer_id: number;
  title: string;
  priority: string;
  status: string;
  category: string;
  created_at: string;
  resolved_at: string;
}

const customers: Customer[] = rawCustomers.map((r) => ({
  id: parseInt(r.id, 10),
  name: r.nome,
  email: r.email,
  plan: r.plano,
  mrr: parseInt(r.mrr, 10),
  start_date: r.data_inicio,
  status: r.status,
  industry: r.industria,
}));

const tickets: Ticket[] = rawTickets.map((r) => ({
  id: parseInt(r.id, 10),
  customer_id: parseInt(r.cliente_id, 10),
  title: r.titulo,
  priority: r.prioridade,
  status: r.status,
  category: r.categoria,
  created_at: r.criado_em,
  resolved_at: r.resolvido_em,
}));

// === 1: Context builder ===
class ContextBuilder {
  private sections: { title: string; content: string }[] = [];

  addSection(title: string, content: string): this {
    this.sections.push({ title, content });
    return this;
  }

  addData(title: string, data: unknown): this {
    this.sections.push({
      title,
      content: JSON.stringify(data, null, 2),
    });
    return this;
  }

  addMetrics(title: string, metrics: Record<string, number | string>): this {
    const content = Object.entries(metrics)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n');
    this.sections.push({ title, content });
    return this;
  }

  addConstraints(constraints: string[]): this {
    this.sections.push({
      title: 'Constraints and Instructions',
      content: constraints.map((c) => `- ${c}`).join('\n'),
    });
    return this;
  }

  build(): string {
    return this.sections
      .map((s) => `## ${s.title}\n${s.content}`)
      .join('\n\n');
  }
}

// === 2: Summarization functions ===
function summarizeCustomers(custs: Customer[]): string {
  const active = custs.filter((c) => c.status === 'ativo');
  const totalMrr = active.reduce((sum, c) => sum + c.mrr, 0);
  const churnRate = (((custs.length - active.length) / custs.length) * 100).toFixed(1);

  const byPlan: Record<string, { count: number; mrr: number }> = {};
  for (const c of active) {
    if (!byPlan[c.plan]) byPlan[c.plan] = { count: 0, mrr: 0 };
    byPlan[c.plan].count++;
    byPlan[c.plan].mrr += c.mrr;
  }

  let text = `Total: ${custs.length} customers (${active.length} active)\n`;
  text += `Total MRR: $${totalMrr}\n`;
  text += `Churn Rate: ${churnRate}%\n`;
  text += `By plan:\n`;
  for (const [plan, data] of Object.entries(byPlan)) {
    text += `  - ${plan}: ${data.count} customers, MRR $${data.mrr}\n`;
  }

  return text;
}

function summarizeTickets(tix: Ticket[]): string {
  const open = tix.filter((t) => t.status === 'aberto').length;
  const resolved = tix.filter((t) => t.status === 'resolvido').length;
  const highPriority = tix.filter((t) => t.priority === 'alta').length;

  const categories = new Map<string, number>();
  for (const t of tix) {
    categories.set(t.category, (categories.get(t.category) || 0) + 1);
  }

  let text = `Total: ${tix.length} tickets\n`;
  text += `Open: ${open} | Resolved: ${resolved}\n`;
  text += `High priority: ${highPriority}\n`;
  text += `Categories: ${[...categories.entries()].map(([k, v]) => `${k}(${v})`).join(', ')}\n`;

  return text;
}

function summarizeBySegment(custs: Customer[], tix: Ticket[]): string {
  const segments: string[] = [];

  // By industry
  const byIndustry = new Map<string, Customer[]>();
  for (const c of custs) {
    const list = byIndustry.get(c.industry) || [];
    list.push(c);
    byIndustry.set(c.industry, list);
  }

  segments.push('By industry:');
  for (const [ind, customers] of byIndustry) {
    const indMrr = customers.filter((c) => c.status === 'ativo').reduce((s, c) => s + c.mrr, 0);
    segments.push(`  - ${ind}: ${customers.length} customers, MRR $${indMrr}`);
  }

  // Customers with most tickets
  segments.push('\nCustomers with most tickets:');
  const ticketCount = new Map<number, number>();
  for (const t of tix) {
    ticketCount.set(t.customer_id, (ticketCount.get(t.customer_id) || 0) + 1);
  }
  const topTickets = [...ticketCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  for (const [customerId, count] of topTickets) {
    const c = custs.find((c) => c.id === customerId);
    if (c) segments.push(`  - ${c.name}: ${count} tickets`);
  }

  return segments.join('\n');
}

// === 3 and 4: AI analysis with context ===
async function analyzeWithContext(
  contextBuilder: ContextBuilder,
  question: string
): Promise<string> {
  const context = contextBuilder.build();

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a data analyst for a B2B SaaS company. Use the context below to answer the question.

${context}

---

Question: ${question}

Respond concisely and with actionable insights.`,
      },
    ],
  });

  return response.content[0].type === 'text' ? response.content[0].text : 'Error';
}

// === 5: Execute analyses ===
async function main() {
  console.log('=== Building AI Context ===\n');

  // Base context
  const baseContext = new ContextBuilder()
    .addSection('Customer Summary', summarizeCustomers(customers))
    .addSection('Ticket Summary', summarizeTickets(tickets))
    .addSection('Segmentation', summarizeBySegment(customers, tickets));

  // Analysis 1: Churn
  console.log('--- Churn Analysis ---\n');
  const churnContext = new ContextBuilder()
    .addSection('Customer Summary', summarizeCustomers(customers))
    .addSection('Ticket Summary', summarizeTickets(tickets))
    .addData('Churned Customers', customers.filter((c) => c.status === 'churned').map((c) => ({
      name: c.name, plan: c.plan, mrr: c.mrr, industry: c.industry, start_date: c.start_date,
    })))
    .addConstraints([
      'Focus on patterns leading to churn',
      'Suggest concrete retention actions',
      'Consider industry and plan profile',
    ]);

  const churnAnalysis = await analyzeWithContext(
    churnContext,
    'What patterns do you identify in customers who cancelled? Which active customers are at highest risk of churn and why?'
  );
  console.log(churnAnalysis);

  // Analysis 2: Upsell
  console.log('\n\n--- Upsell Analysis ---\n');
  const upsellContext = new ContextBuilder()
    .addSection('Customer Summary', summarizeCustomers(customers))
    .addSection('Segmentation', summarizeBySegment(customers, tickets))
    .addData('Active Starter and Pro Customers', customers
      .filter((c) => c.status === 'ativo' && c.plan !== 'Enterprise')
      .map((c) => ({
        name: c.name, plan: c.plan, mrr: c.mrr, industry: c.industry,
        tickets: tickets.filter((t) => t.customer_id === c.id).length,
      })))
    .addConstraints([
      'Identify candidates for plan upgrade',
      'Consider ticket volume as an engagement indicator',
      'Suggest personalized approach by industry',
    ]);

  const upsellAnalysis = await analyzeWithContext(
    upsellContext,
    'Which Starter or Pro customers have the highest upgrade potential to Enterprise? What arguments should be used?'
  );
  console.log(upsellAnalysis);

  // Analysis 3: Executive summary
  console.log('\n\n--- Executive Summary ---\n');
  const execContext = new ContextBuilder()
    .addSection('Customer Summary', summarizeCustomers(customers))
    .addSection('Ticket Summary', summarizeTickets(tickets))
    .addSection('Segmentation', summarizeBySegment(customers, tickets))
    .addConstraints([
      'Format: concise bullet points',
      'Include: current state, risks, opportunities',
      'Maximum 10 bullets',
    ]);

  const execAnalysis = await analyzeWithContext(
    execContext,
    'Generate a 1-paragraph executive summary followed by bullet points with the main insights, risks, and opportunities.'
  );
  console.log(execAnalysis);

  console.log('\n\n--- Exercise 19 complete! ---');
}

main().catch(console.error);
