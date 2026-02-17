/**
 * Solution 20: Complete Data Platform (Grand Capstone)
 *
 * Combines ALL concepts from Modules 1-4:
 * - M1 (Handlebars): Templates for reports
 * - M2 (Claude API): AI analysis and classification
 * - M3 (Tool Use): Tools for querying and enrichment
 * - M4 (Data Pipelines): ETL, validation, streaming, metrics
 *
 * Run: npx tsx solutions/ex20-data-platform.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';

const client = new Anthropic();

// ============================================================
// METRICS (M4) — Pipeline instrumentation
// ============================================================

class PipelineMetrics {
  private timings = new Map<string, number[]>();
  private counters = new Map<string, number>();
  private startTime = performance.now();

  startTimer(step: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      const existing = this.timings.get(step) || [];
      existing.push(duration);
      this.timings.set(step, existing);
    };
  }

  increment(counter: string, by: number = 1): void {
    this.counters.set(counter, (this.counters.get(counter) || 0) + by);
  }

  report(): string {
    const totalMs = Math.round(performance.now() - this.startTime);
    const lines: string[] = ['--- Pipeline Metrics ---'];
    lines.push(`Total duration: ${totalMs}ms`);

    for (const [step, durations] of this.timings) {
      const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length * 100) / 100;
      lines.push(`  ${step}: ${avg}ms avg (${durations.length} calls)`);
    }

    for (const [key, value] of this.counters) {
      lines.push(`  ${key}: ${value}`);
    }

    return lines.join('\n');
  }
}

const metrics = new PipelineMetrics();

// ============================================================
// STEP 1: EXTRACT — Load and validate with Zod (M4)
// ============================================================

const CustomerSchema = z.object({
  id: z.string().transform(Number),
  nome: z.string().min(1),
  email: z.string().email(),
  plano: z.enum(['Enterprise', 'Pro', 'Starter']),
  mrr: z.string().transform(Number),
  data_inicio: z.string(),
  status: z.enum(['ativo', 'churned']),
  industria: z.string(),
});

const TicketSchema = z.object({
  id: z.string().transform(Number),
  cliente_id: z.string().transform(Number),
  titulo: z.string().min(1),
  prioridade: z.enum(['alta', 'media', 'baixa']),
  status: z.enum(['resolvido', 'aberto']),
  categoria: z.string(),
  criado_em: z.string(),
  resolvido_em: z.string(),
});

type Customer = z.infer<typeof CustomerSchema>;
type Ticket = z.infer<typeof TicketSchema>;

interface EnrichedCustomer extends Customer {
  healthScore: number;
  risk: 'low' | 'medium' | 'high';
  estimatedLtv: number;
  totalTickets: number;
  openTickets: number;
  ticketsByPriority: { alta: number; media: number; baixa: number };
  avgResolutionTime: number | null;
  ageDays: number;
}

function extract(): { customers: Customer[]; tickets: Ticket[]; warnings: string[] } {
  const stop = metrics.startTimer('extract');
  const warnings: string[] = [];

  const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
  const rawCustomers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

  const ticketsCSV = readFileSync('data/samples/tickets.csv', 'utf-8');
  const rawTickets = parse(ticketsCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

  const validCustomers: Customer[] = [];
  for (const row of rawCustomers) {
    const result = CustomerSchema.safeParse(row);
    if (result.success) {
      validCustomers.push(result.data);
      metrics.increment('customers.valid');
    } else {
      warnings.push(`Invalid customer (${row.nome}): ${result.error.issues[0].message}`);
      metrics.increment('customers.invalid');
    }
  }

  const validTickets: Ticket[] = [];
  for (const row of rawTickets) {
    const result = TicketSchema.safeParse(row);
    if (result.success) {
      validTickets.push(result.data);
      metrics.increment('tickets.valid');
    } else {
      warnings.push(`Invalid ticket (${row.id}): ${result.error.issues[0].message}`);
      metrics.increment('tickets.invalid');
    }
  }

  stop();
  return { customers: validCustomers, tickets: validTickets, warnings };
}

// ============================================================
// STEP 2: TRANSFORM — Enrichment (M4 + M2)
// ============================================================

function enrichCustomers(customers: Customer[], tickets: Ticket[]): EnrichedCustomer[] {
  const stop = metrics.startTimer('transform.enrich');

  const enriched = customers.map((customer) => {
    const customerTickets = tickets.filter((t) => t.cliente_id === customer.id);
    const openTickets = customerTickets.filter((t) => t.status === 'aberto').length;

    const priorities = { alta: 0, media: 0, baixa: 0 };
    for (const t of customerTickets) priorities[t.prioridade]++;

    // Average resolution time
    const resolved = customerTickets.filter((t) => t.status === 'resolvido' && t.resolvido_em);
    let avgResolutionTime: number | null = null;
    if (resolved.length > 0) {
      const times = resolved.map((t) => {
        const created = new Date(t.criado_em).getTime();
        const resolvedAt = new Date(t.resolvido_em).getTime();
        return (resolvedAt - created) / (1000 * 60 * 60 * 24);
      });
      avgResolutionTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length * 10) / 10;
    }

    // Health score
    let healthScore = 0;
    if (customer.status === 'ativo') healthScore += 40;
    const ageDays = Math.floor((Date.now() - new Date(customer.data_inicio).getTime()) / (1000 * 60 * 60 * 24));
    if (ageDays > 180) healthScore += 20;
    else if (ageDays > 90) healthScore += 10;
    if (customer.plano === 'Enterprise') healthScore += 20;
    else if (customer.plano === 'Pro') healthScore += 15;
    else healthScore += 10;
    if (openTickets === 0) healthScore += 20;
    else if (openTickets === 1) healthScore += 10;

    const risk: 'low' | 'medium' | 'high' = healthScore >= 80 ? 'low' : healthScore >= 50 ? 'medium' : 'high';

    const churnRates: Record<string, number> = { low: 0.02, medium: 0.05, high: 0.10 };
    const estimatedLtv = Math.round(customer.mrr / (churnRates[risk] || 0.10));

    metrics.increment('transform.enriched');

    return {
      ...customer,
      healthScore: Math.min(healthScore, 100),
      risk,
      estimatedLtv,
      totalTickets: customerTickets.length,
      openTickets,
      ticketsByPriority: priorities,
      avgResolutionTime,
      ageDays,
    };
  });

  stop();
  return enriched;
}

// AI Classification (M2) — classify critical tickets
async function classifyTopTickets(tickets: Ticket[]): Promise<{ ticketId: number; classification: string }[]> {
  const stop = metrics.startTimer('transform.ai_classify');

  const highPriorityTickets = tickets.filter((t) => t.prioridade === 'alta' && t.status === 'aberto');
  if (highPriorityTickets.length === 0) {
    stop();
    return [];
  }

  const ticketTexts = highPriorityTickets.map((t) => `- Ticket #${t.id}: "${t.titulo}" (${t.categoria})`).join('\n');

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `Classify each ticket below by urgency and business impact.
For each ticket, respond in the format: #ID: CLASSIFICATION (critical/important/moderate)

${ticketTexts}`,
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const results = highPriorityTickets.map((t) => ({
    ticketId: t.id,
    classification: text.includes(`#${t.id}`) ? text.split(`#${t.id}`)[1]?.split('\n')[0]?.trim() || 'unclassified' : 'unclassified',
  }));

  metrics.increment('ai.calls');
  stop();
  return results;
}

// ============================================================
// STEP 3: TOOLS — Query tools (M3)
// ============================================================

let enrichedCustomers: EnrichedCustomer[] = [];
let allTickets: Ticket[] = [];

const tools: Anthropic.Tool[] = [
  {
    name: 'lookup_customer',
    description: 'Looks up enriched customer data. Returns health score, risk, LTV, tickets, and metrics.',
    input_schema: {
      type: 'object' as const,
      properties: {
        email: { type: 'string', description: 'Customer email' },
      },
      required: ['email'],
    },
  },
  {
    name: 'generate_report',
    description: 'Generates a formatted report for a specific customer with all data and tickets.',
    input_schema: {
      type: 'object' as const,
      properties: {
        customer_id: { type: 'number', description: 'Customer ID' },
      },
      required: ['customer_id'],
    },
  },
  {
    name: 'platform_metrics',
    description: 'Returns overall platform KPIs: total MRR, churn rate, distribution by plan, open tickets.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
];

function handleToolCall(name: string, input: Record<string, unknown>): string {
  metrics.increment('tools.calls');

  if (name === 'lookup_customer') {
    const email = input.email as string;
    const customer = enrichedCustomers.find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (!customer) return JSON.stringify({ error: `Customer not found: ${email}` });
    return JSON.stringify(customer);
  }

  if (name === 'generate_report') {
    const customerId = input.customer_id as number;
    const customer = enrichedCustomers.find((c) => c.id === customerId);
    if (!customer) return JSON.stringify({ error: `Customer #${customerId} not found` });

    const customerTickets = allTickets.filter((t) => t.cliente_id === customerId);
    return JSON.stringify({
      ...customer,
      tickets: customerTickets.map((t) => ({
        id: t.id,
        title: t.titulo,
        priority: t.prioridade,
        status: t.status,
        category: t.categoria,
      })),
    });
  }

  if (name === 'platform_metrics') {
    const active = enrichedCustomers.filter((c) => c.status === 'ativo');
    const totalMrr = active.reduce((sum, c) => sum + c.mrr, 0);
    const churnRate = ((enrichedCustomers.length - active.length) / enrichedCustomers.length * 100).toFixed(1);
    const openTickets = allTickets.filter((t) => t.status === 'aberto').length;

    const byPlan: Record<string, { count: number; mrr: number }> = {};
    for (const c of active) {
      if (!byPlan[c.plano]) byPlan[c.plano] = { count: 0, mrr: 0 };
      byPlan[c.plano].count++;
      byPlan[c.plano].mrr += c.mrr;
    }

    const byRisk = { low: 0, medium: 0, high: 0 };
    for (const c of enrichedCustomers) byRisk[c.risk]++;

    return JSON.stringify({ totalMrr, churnRate, activeCustomers: active.length, total: enrichedCustomers.length, openTickets, byPlan, byRisk });
  }

  return JSON.stringify({ error: `Unknown tool: ${name}` });
}

// ============================================================
// STEP 4: REPORT — Handlebars Templates (M1)
// ============================================================

Handlebars.registerHelper('formatCurrency', (v: number) => `$${v.toLocaleString('en-US')}`);
Handlebars.registerHelper('statusIcon', (s: string) => s === 'ativo' ? '[ACTIVE]' : '[CHURNED]');
Handlebars.registerHelper('riskIcon', (r: string) => r === 'high' ? '[!!!]' : r === 'medium' ? '[!!]' : '[ok]');
Handlebars.registerHelper('repeat', (c: string, n: number) => c.repeat(n));
Handlebars.registerHelper('barChart', (v: number, max: number) => {
  const w = 20;
  const f = Math.round((v / max) * w);
  return '='.repeat(f) + ' '.repeat(w - f);
});

const dashboardTemplate = Handlebars.compile(`
{{repeat "=" 60}}
  SaaS DATA PLATFORM — EXECUTIVE DASHBOARD
  Generated on: {{reportDate}}
{{repeat "=" 60}}

--- KPIs ---
  Total MRR:         {{formatCurrency kpis.totalMrr}}
  Active Customers:  {{kpis.activeCustomers}}/{{kpis.total}}
  Churn Rate:        {{kpis.churnRate}}%
  Open Tickets:      {{kpis.openTickets}}
  Total LTV:         {{formatCurrency kpis.totalLtv}}

--- Risk Distribution ---
  Low:     {{barChart risk.low kpis.total}} {{risk.low}}
  Medium:  {{barChart risk.medium kpis.total}} {{risk.medium}}
  High:    {{barChart risk.high kpis.total}} {{risk.high}}

--- Top 5 Customers (by MRR) ---
{{#each topCustomers}}
  {{riskIcon risk}} {{nome}} ({{plano}})
    MRR: {{formatCurrency mrr}} | Health: {{healthScore}}/100 | LTV: {{formatCurrency estimatedLtv}}
    Tickets: {{totalTickets}} total, {{openTickets}} open
{{/each}}

--- Alerts ---
{{#each alerts}}
  [ALERT] {{this}}
{{/each}}
{{#unless alerts.length}}
  No alerts at this time.
{{/unless}}

{{repeat "=" 60}}
`);

function generateDashboard(customers: EnrichedCustomer[], tickets: Ticket[]): string {
  const stop = metrics.startTimer('report.dashboard');

  const active = customers.filter((c) => c.status === 'ativo');
  const totalMrr = active.reduce((sum, c) => sum + c.mrr, 0);
  const totalLtv = customers.reduce((sum, c) => sum + c.estimatedLtv, 0);

  const byRisk = { low: 0, medium: 0, high: 0 };
  for (const c of customers) byRisk[c.risk]++;

  const alerts: string[] = [];
  for (const c of customers) {
    if (c.risk === 'high' && c.status === 'ativo') {
      alerts.push(`${c.nome}: high churn risk (health ${c.healthScore}/100)`);
    }
    if (c.ticketsByPriority.alta >= 2) {
      alerts.push(`${c.nome}: ${c.ticketsByPriority.alta} high priority tickets`);
    }
  }

  const result = dashboardTemplate({
    reportDate: new Date().toLocaleDateString('en-US'),
    kpis: {
      totalMrr,
      activeCustomers: active.length,
      total: customers.length,
      churnRate: ((customers.length - active.length) / customers.length * 100).toFixed(1),
      openTickets: tickets.filter((t) => t.status === 'aberto').length,
      totalLtv,
    },
    risk: byRisk,
    topCustomers: [...active].sort((a, b) => b.mrr - a.mrr).slice(0, 5),
    alerts,
  });

  stop();
  return result;
}

// ============================================================
// STEP 5: AI ANALYSIS with Tools (M2 + M3)
// ============================================================

async function aiAnalysisWithTools(): Promise<string> {
  const stop = metrics.startTimer('ai.analysis_with_tools');

  const messages: Anthropic.MessageParam[] = [{
    role: 'user',
    content: `You are a senior data analyst for a B2B SaaS platform.

Use the available tools to:
1. Query the overall platform metrics
2. Look up the customer with the highest risk (if there are open tickets)
3. Generate an executive summary with:
   - Current business state (MRR, churn, health)
   - Top 3 identified risks
   - Top 3 opportunities
   - Prioritized recommended actions

Be concise and actionable.`,
  }];

  let response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    tools,
    messages,
  });

  metrics.increment('ai.calls');

  // Tool use loop (M3)
  while (response.stop_reason === 'tool_use') {
    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ContentBlockParam & { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> } =>
        block.type === 'tool_use'
    );

    const toolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks.map((toolUse) => {
      console.log(`  [Tool] ${toolUse.name}(${JSON.stringify(toolUse.input).slice(0, 60)})`);
      const result = handleToolCall(toolUse.name, toolUse.input);
      return {
        type: 'tool_result' as const,
        tool_use_id: toolUse.id,
        content: result,
      };
    });

    messages.push({ role: 'assistant', content: response.content });
    messages.push({ role: 'user', content: toolResults });

    response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      tools,
      messages,
    });

    metrics.increment('ai.calls');
  }

  stop();

  const textBlock = response.content.find((b) => b.type === 'text');
  return textBlock && textBlock.type === 'text' ? textBlock.text : 'No response';
}

// ============================================================
// MAIN PIPELINE
// ============================================================

async function main() {
  const pipelineStop = metrics.startTimer('pipeline.total');

  console.log('========================================================');
  console.log('  SaaS DATA PLATFORM — COMPLETE PIPELINE');
  console.log('========================================================\n');

  // STEP 1: EXTRACT
  console.log('>>> STEP 1: Extract + Validation (Zod)');
  const { customers, tickets, warnings } = extract();
  console.log(`  Customers: ${customers.length} valid`);
  console.log(`  Tickets: ${tickets.length} valid`);
  if (warnings.length > 0) {
    console.log(`  Warnings: ${warnings.length}`);
  }

  // STEP 2: TRANSFORM
  console.log('\n>>> STEP 2: Transform + Enrichment');
  enrichedCustomers = enrichCustomers(customers, tickets);
  allTickets = tickets;
  console.log(`  Enriched customers: ${enrichedCustomers.length}`);

  // AI classification of critical tickets
  console.log('\n  Classifying critical tickets with AI...');
  const classifications = await classifyTopTickets(tickets);
  for (const c of classifications) {
    console.log(`    Ticket #${c.ticketId}: ${c.classification}`);
  }

  // STEP 3: REPORT (Handlebars)
  console.log('\n>>> STEP 3: Report with Templates (Handlebars)');
  const dashboard = generateDashboard(enrichedCustomers, tickets);
  console.log(dashboard);

  // STEP 4: AI ANALYSIS with Tools
  console.log('>>> STEP 4: AI Analysis with Tools');
  console.log('  Querying data via tools...\n');
  const aiAnalysis = await aiAnalysisWithTools();
  console.log('\n--- AI Analysis ---');
  console.log(aiAnalysis);

  // STEP 5: METRICS
  pipelineStop();
  console.log('\n>>> STEP 5: Pipeline Metrics');
  console.log(metrics.report());

  console.log('\n========================================================');
  console.log('  COMPLETE PIPELINE — All modules integrated!');
  console.log('  M1: Handlebars | M2: Claude API | M3: Tools | M4: ETL');
  console.log('========================================================');
  console.log('\n--- Exercise 20 (Grand Capstone) complete! ---');
}

main().catch(console.error);
