/**
 * Solucao 20: Plataforma de Dados Completa (Grand Capstone)
 *
 * Combina TODOS os conceitos dos Modulos 1-4:
 * - M1 (Handlebars): Templates para relatorios
 * - M2 (Claude API): Analise AI e classificacao
 * - M3 (Tool Use): Ferramentas para consulta e enriquecimento
 * - M4 (Data Pipelines): ETL, validacao, streaming, metricas
 *
 * Execute: npx tsx solucoes/ex20-plataforma-dados.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';

const client = new Anthropic();

// ============================================================
// METRICAS (M4) — Instrumentacao do pipeline
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
    const lines: string[] = ['--- Metricas do Pipeline ---'];
    lines.push(`Duracao total: ${totalMs}ms`);

    for (const [step, durations] of this.timings) {
      const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length * 100) / 100;
      lines.push(`  ${step}: ${avg}ms avg (${durations.length} chamadas)`);
    }

    for (const [key, value] of this.counters) {
      lines.push(`  ${key}: ${value}`);
    }

    return lines.join('\n');
  }
}

const metrics = new PipelineMetrics();

// ============================================================
// ETAPA 1: EXTRACT — Carga e validacao com Zod (M4)
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
  risco: 'baixo' | 'medio' | 'alto';
  ltvEstimado: number;
  totalTickets: number;
  ticketsAbertos: number;
  ticketsPorPrioridade: { alta: number; media: number; baixa: number };
  tempoMedioResolucao: number | null;
  idadeDias: number;
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
      metrics.increment('customers.validos');
    } else {
      warnings.push(`Customer invalido (${row.nome}): ${result.error.issues[0].message}`);
      metrics.increment('customers.invalidos');
    }
  }

  const validTickets: Ticket[] = [];
  for (const row of rawTickets) {
    const result = TicketSchema.safeParse(row);
    if (result.success) {
      validTickets.push(result.data);
      metrics.increment('tickets.validos');
    } else {
      warnings.push(`Ticket invalido (${row.id}): ${result.error.issues[0].message}`);
      metrics.increment('tickets.invalidos');
    }
  }

  stop();
  return { customers: validCustomers, tickets: validTickets, warnings };
}

// ============================================================
// ETAPA 2: TRANSFORM — Enriquecimento (M4 + M2)
// ============================================================

function enrichCustomers(customers: Customer[], tickets: Ticket[]): EnrichedCustomer[] {
  const stop = metrics.startTimer('transform.enrich');

  const enriched = customers.map((customer) => {
    const customerTickets = tickets.filter((t) => t.cliente_id === customer.id);
    const ticketsAbertos = customerTickets.filter((t) => t.status === 'aberto').length;

    const prioridades = { alta: 0, media: 0, baixa: 0 };
    for (const t of customerTickets) prioridades[t.prioridade]++;

    // Tempo medio de resolucao
    const resolved = customerTickets.filter((t) => t.status === 'resolvido' && t.resolvido_em);
    let tempoMedioResolucao: number | null = null;
    if (resolved.length > 0) {
      const tempos = resolved.map((t) => {
        const criado = new Date(t.criado_em).getTime();
        const resolvido = new Date(t.resolvido_em).getTime();
        return (resolvido - criado) / (1000 * 60 * 60 * 24);
      });
      tempoMedioResolucao = Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length * 10) / 10;
    }

    // Health score
    let healthScore = 0;
    if (customer.status === 'ativo') healthScore += 40;
    const idadeDias = Math.floor((Date.now() - new Date(customer.data_inicio).getTime()) / (1000 * 60 * 60 * 24));
    if (idadeDias > 180) healthScore += 20;
    else if (idadeDias > 90) healthScore += 10;
    if (customer.plano === 'Enterprise') healthScore += 20;
    else if (customer.plano === 'Pro') healthScore += 15;
    else healthScore += 10;
    if (ticketsAbertos === 0) healthScore += 20;
    else if (ticketsAbertos === 1) healthScore += 10;

    const risco: 'baixo' | 'medio' | 'alto' = healthScore >= 80 ? 'baixo' : healthScore >= 50 ? 'medio' : 'alto';

    const churnRates: Record<string, number> = { baixo: 0.02, medio: 0.05, alto: 0.10 };
    const ltvEstimado = Math.round(customer.mrr / (churnRates[risco] || 0.10));

    metrics.increment('transform.enriched');

    return {
      ...customer,
      healthScore: Math.min(healthScore, 100),
      risco,
      ltvEstimado,
      totalTickets: customerTickets.length,
      ticketsAbertos,
      ticketsPorPrioridade: prioridades,
      tempoMedioResolucao,
      idadeDias,
    };
  });

  stop();
  return enriched;
}

// Classificacao AI (M2) — classifica tickets criticos
async function classifyTopTickets(tickets: Ticket[]): Promise<{ ticketId: number; classificacao: string }[]> {
  const stop = metrics.startTimer('transform.ai_classify');

  const ticketsAlta = tickets.filter((t) => t.prioridade === 'alta' && t.status === 'aberto');
  if (ticketsAlta.length === 0) {
    stop();
    return [];
  }

  const ticketTexts = ticketsAlta.map((t) => `- Ticket #${t.id}: "${t.titulo}" (${t.categoria})`).join('\n');

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `Classifique cada ticket abaixo por urgencia e impacto no negocio.
Para cada ticket, responda no formato: #ID: CLASSIFICACAO (critico/importante/moderado)

${ticketTexts}`,
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const results = ticketsAlta.map((t) => ({
    ticketId: t.id,
    classificacao: text.includes(`#${t.id}`) ? text.split(`#${t.id}`)[1]?.split('\n')[0]?.trim() || 'sem classificacao' : 'sem classificacao',
  }));

  metrics.increment('ai.calls');
  stop();
  return results;
}

// ============================================================
// ETAPA 3: TOOLS — Ferramentas para consulta (M3)
// ============================================================

let enrichedCustomers: EnrichedCustomer[] = [];
let allTickets: Ticket[] = [];

const tools: Anthropic.Tool[] = [
  {
    name: 'consultar_cliente',
    description: 'Consulta dados enriquecidos de um cliente. Retorna health score, risco, LTV, tickets e metricas.',
    input_schema: {
      type: 'object' as const,
      properties: {
        email: { type: 'string', description: 'Email do cliente' },
      },
      required: ['email'],
    },
  },
  {
    name: 'gerar_relatorio',
    description: 'Gera um relatorio formatado de um cliente especifico com todos os dados e tickets.',
    input_schema: {
      type: 'object' as const,
      properties: {
        cliente_id: { type: 'number', description: 'ID do cliente' },
      },
      required: ['cliente_id'],
    },
  },
  {
    name: 'metricas_plataforma',
    description: 'Retorna KPIs gerais da plataforma: MRR total, churn rate, distribuicao por plano, tickets abertos.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
];

function handleToolCall(name: string, input: Record<string, unknown>): string {
  metrics.increment('tools.calls');

  if (name === 'consultar_cliente') {
    const email = input.email as string;
    const customer = enrichedCustomers.find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (!customer) return JSON.stringify({ error: `Cliente nao encontrado: ${email}` });
    return JSON.stringify(customer);
  }

  if (name === 'gerar_relatorio') {
    const clienteId = input.cliente_id as number;
    const customer = enrichedCustomers.find((c) => c.id === clienteId);
    if (!customer) return JSON.stringify({ error: `Cliente #${clienteId} nao encontrado` });

    const customerTickets = allTickets.filter((t) => t.cliente_id === clienteId);
    return JSON.stringify({
      ...customer,
      tickets: customerTickets.map((t) => ({
        id: t.id,
        titulo: t.titulo,
        prioridade: t.prioridade,
        status: t.status,
        categoria: t.categoria,
      })),
    });
  }

  if (name === 'metricas_plataforma') {
    const ativos = enrichedCustomers.filter((c) => c.status === 'ativo');
    const mrrTotal = ativos.reduce((sum, c) => sum + c.mrr, 0);
    const churnRate = ((enrichedCustomers.length - ativos.length) / enrichedCustomers.length * 100).toFixed(1);
    const ticketsAbertos = allTickets.filter((t) => t.status === 'aberto').length;

    const porPlano: Record<string, { count: number; mrr: number }> = {};
    for (const c of ativos) {
      if (!porPlano[c.plano]) porPlano[c.plano] = { count: 0, mrr: 0 };
      porPlano[c.plano].count++;
      porPlano[c.plano].mrr += c.mrr;
    }

    const porRisco = { baixo: 0, medio: 0, alto: 0 };
    for (const c of enrichedCustomers) porRisco[c.risco]++;

    return JSON.stringify({ mrrTotal, churnRate, clientesAtivos: ativos.length, total: enrichedCustomers.length, ticketsAbertos, porPlano, porRisco });
  }

  return JSON.stringify({ error: `Tool desconhecida: ${name}` });
}

// ============================================================
// ETAPA 4: REPORT — Templates Handlebars (M1)
// ============================================================

Handlebars.registerHelper('formatCurrency', (v: number) => `R$${v.toLocaleString('pt-BR')}`);
Handlebars.registerHelper('statusIcon', (s: string) => s === 'ativo' ? '[ATIVO]' : '[CHURNED]');
Handlebars.registerHelper('riscoIcon', (r: string) => r === 'alto' ? '[!!!]' : r === 'medio' ? '[!!]' : '[ok]');
Handlebars.registerHelper('repeat', (c: string, n: number) => c.repeat(n));
Handlebars.registerHelper('barChart', (v: number, max: number) => {
  const w = 20;
  const f = Math.round((v / max) * w);
  return '='.repeat(f) + ' '.repeat(w - f);
});

const dashboardTemplate = Handlebars.compile(`
{{repeat "=" 60}}
  PLATAFORMA DE DADOS SaaS — DASHBOARD EXECUTIVO
  Gerado em: {{dataRelatorio}}
{{repeat "=" 60}}

--- KPIs ---
  MRR Total:        {{formatCurrency kpis.mrrTotal}}
  Clientes Ativos:  {{kpis.clientesAtivos}}/{{kpis.total}}
  Churn Rate:       {{kpis.churnRate}}%
  Tickets Abertos:  {{kpis.ticketsAbertos}}
  LTV Total:        {{formatCurrency kpis.ltvTotal}}

--- Distribuicao de Risco ---
  Baixo:  {{barChart risco.baixo kpis.total}} {{risco.baixo}}
  Medio:  {{barChart risco.medio kpis.total}} {{risco.medio}}
  Alto:   {{barChart risco.alto kpis.total}} {{risco.alto}}

--- Top 5 Clientes (por MRR) ---
{{#each topClientes}}
  {{riscoIcon risco}} {{nome}} ({{plano}})
    MRR: {{formatCurrency mrr}} | Health: {{healthScore}}/100 | LTV: {{formatCurrency ltvEstimado}}
    Tickets: {{totalTickets}} total, {{ticketsAbertos}} abertos
{{/each}}

--- Alertas ---
{{#each alertas}}
  [ALERTA] {{this}}
{{/each}}
{{#unless alertas.length}}
  Nenhum alerta no momento.
{{/unless}}

{{repeat "=" 60}}
`);

function generateDashboard(customers: EnrichedCustomer[], tickets: Ticket[]): string {
  const stop = metrics.startTimer('report.dashboard');

  const ativos = customers.filter((c) => c.status === 'ativo');
  const mrrTotal = ativos.reduce((sum, c) => sum + c.mrr, 0);
  const ltvTotal = customers.reduce((sum, c) => sum + c.ltvEstimado, 0);

  const porRisco = { baixo: 0, medio: 0, alto: 0 };
  for (const c of customers) porRisco[c.risco]++;

  const alertas: string[] = [];
  for (const c of customers) {
    if (c.risco === 'alto' && c.status === 'ativo') {
      alertas.push(`${c.nome}: risco alto de churn (health ${c.healthScore}/100)`);
    }
    if (c.ticketsPorPrioridade.alta >= 2) {
      alertas.push(`${c.nome}: ${c.ticketsPorPrioridade.alta} tickets de alta prioridade`);
    }
  }

  const result = dashboardTemplate({
    dataRelatorio: new Date().toLocaleDateString('pt-BR'),
    kpis: {
      mrrTotal,
      clientesAtivos: ativos.length,
      total: customers.length,
      churnRate: ((customers.length - ativos.length) / customers.length * 100).toFixed(1),
      ticketsAbertos: tickets.filter((t) => t.status === 'aberto').length,
      ltvTotal,
    },
    risco: porRisco,
    topClientes: [...ativos].sort((a, b) => b.mrr - a.mrr).slice(0, 5),
    alertas,
  });

  stop();
  return result;
}

// ============================================================
// ETAPA 5: AI ANALYSIS com Tools (M2 + M3)
// ============================================================

async function aiAnalysisWithTools(): Promise<string> {
  const stop = metrics.startTimer('ai.analysis_with_tools');

  const messages: Anthropic.MessageParam[] = [{
    role: 'user',
    content: `Voce e um analista senior de dados de uma plataforma SaaS B2B.

Use as ferramentas disponiveis para:
1. Consultar as metricas gerais da plataforma
2. Consultar o cliente com mais risco (se houver tickets abertos)
3. Gerar um resumo executivo em portugues com:
   - Estado atual do negocio (MRR, churn, saude)
   - Top 3 riscos identificados
   - Top 3 oportunidades
   - Acoes recomendadas priorizadas

Seja conciso e acionavel.`,
  }];

  let response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    tools,
    messages,
  });

  metrics.increment('ai.calls');

  // Loop de tool use (M3)
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
  return textBlock && textBlock.type === 'text' ? textBlock.text : 'Sem resposta';
}

// ============================================================
// PIPELINE PRINCIPAL
// ============================================================

async function main() {
  const pipelineStop = metrics.startTimer('pipeline.total');

  console.log('========================================================');
  console.log('  PLATAFORMA DE DADOS SaaS — PIPELINE COMPLETO');
  console.log('========================================================\n');

  // ETAPA 1: EXTRACT
  console.log('>>> ETAPA 1: Extract + Validacao (Zod)');
  const { customers, tickets, warnings } = extract();
  console.log(`  Customers: ${customers.length} validos`);
  console.log(`  Tickets: ${tickets.length} validos`);
  if (warnings.length > 0) {
    console.log(`  Warnings: ${warnings.length}`);
  }

  // ETAPA 2: TRANSFORM
  console.log('\n>>> ETAPA 2: Transform + Enriquecimento');
  enrichedCustomers = enrichCustomers(customers, tickets);
  allTickets = tickets;
  console.log(`  Clientes enriquecidos: ${enrichedCustomers.length}`);

  // Classificacao AI dos tickets criticos
  console.log('\n  Classificando tickets criticos com AI...');
  const classifications = await classifyTopTickets(tickets);
  for (const c of classifications) {
    console.log(`    Ticket #${c.ticketId}: ${c.classificacao}`);
  }

  // ETAPA 3: REPORT (Handlebars)
  console.log('\n>>> ETAPA 3: Relatorio com Templates (Handlebars)');
  const dashboard = generateDashboard(enrichedCustomers, tickets);
  console.log(dashboard);

  // ETAPA 4: AI ANALYSIS com Tools
  console.log('>>> ETAPA 4: Analise AI com Tools');
  console.log('  Consultando dados via ferramentas...\n');
  const aiAnalysis = await aiAnalysisWithTools();
  console.log('\n--- Analise AI ---');
  console.log(aiAnalysis);

  // ETAPA 5: METRICAS
  pipelineStop();
  console.log('\n>>> ETAPA 5: Metricas do Pipeline');
  console.log(metrics.report());

  console.log('\n========================================================');
  console.log('  PIPELINE COMPLETO — Todos os modulos integrados!');
  console.log('  M1: Handlebars | M2: Claude API | M3: Tools | M4: ETL');
  console.log('========================================================');
  console.log('\n--- Exercicio 20 (Grand Capstone) completo! ---');
}

main().catch(console.error);
