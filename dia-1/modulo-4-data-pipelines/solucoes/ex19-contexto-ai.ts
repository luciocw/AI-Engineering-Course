/**
 * Solucao 19: Contexto AI a Partir de Dados do Pipeline
 *
 * Constroi contexto estruturado para prompts do Claude usando dados processados.
 * Execute: npx tsx solucoes/ex19-contexto-ai.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const client = new Anthropic();

// Carrega dados
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const rawCustomers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

const ticketsCSV = readFileSync('data/samples/tickets.csv', 'utf-8');
const rawTickets = parse(ticketsCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

// Tipos
interface Customer {
  id: number;
  nome: string;
  email: string;
  plano: string;
  mrr: number;
  data_inicio: string;
  status: string;
  industria: string;
}

interface Ticket {
  id: number;
  cliente_id: number;
  titulo: string;
  prioridade: string;
  status: string;
  categoria: string;
  criado_em: string;
  resolvido_em: string;
}

const customers: Customer[] = rawCustomers.map((r) => ({
  id: parseInt(r.id, 10),
  nome: r.nome,
  email: r.email,
  plano: r.plano,
  mrr: parseInt(r.mrr, 10),
  data_inicio: r.data_inicio,
  status: r.status,
  industria: r.industria,
}));

const tickets: Ticket[] = rawTickets.map((r) => ({
  id: parseInt(r.id, 10),
  cliente_id: parseInt(r.cliente_id, 10),
  titulo: r.titulo,
  prioridade: r.prioridade,
  status: r.status,
  categoria: r.categoria,
  criado_em: r.criado_em,
  resolvido_em: r.resolvido_em,
}));

// === 1: Builder de contexto ===
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
      title: 'Restricoes e Instrucoes',
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

// === 2: Funcoes de sumarizacao ===
function summarizeCustomers(custs: Customer[]): string {
  const ativos = custs.filter((c) => c.status === 'ativo');
  const mrrTotal = ativos.reduce((sum, c) => sum + c.mrr, 0);
  const churnRate = (((custs.length - ativos.length) / custs.length) * 100).toFixed(1);

  const porPlano: Record<string, { count: number; mrr: number }> = {};
  for (const c of ativos) {
    if (!porPlano[c.plano]) porPlano[c.plano] = { count: 0, mrr: 0 };
    porPlano[c.plano].count++;
    porPlano[c.plano].mrr += c.mrr;
  }

  let text = `Total: ${custs.length} clientes (${ativos.length} ativos)\n`;
  text += `MRR Total: R$${mrrTotal}\n`;
  text += `Churn Rate: ${churnRate}%\n`;
  text += `Por plano:\n`;
  for (const [plano, data] of Object.entries(porPlano)) {
    text += `  - ${plano}: ${data.count} clientes, MRR R$${data.mrr}\n`;
  }

  return text;
}

function summarizeTickets(tix: Ticket[]): string {
  const abertos = tix.filter((t) => t.status === 'aberto').length;
  const resolvidos = tix.filter((t) => t.status === 'resolvido').length;
  const altaPrioridade = tix.filter((t) => t.prioridade === 'alta').length;

  const categorias = new Map<string, number>();
  for (const t of tix) {
    categorias.set(t.categoria, (categorias.get(t.categoria) || 0) + 1);
  }

  let text = `Total: ${tix.length} tickets\n`;
  text += `Abertos: ${abertos} | Resolvidos: ${resolvidos}\n`;
  text += `Alta prioridade: ${altaPrioridade}\n`;
  text += `Categorias: ${[...categorias.entries()].map(([k, v]) => `${k}(${v})`).join(', ')}\n`;

  return text;
}

function summarizeBySegment(custs: Customer[], tix: Ticket[]): string {
  const segments: string[] = [];

  // Por industria
  const porIndustria = new Map<string, Customer[]>();
  for (const c of custs) {
    const list = porIndustria.get(c.industria) || [];
    list.push(c);
    porIndustria.set(c.industria, list);
  }

  segments.push('Por industria:');
  for (const [ind, clientes] of porIndustria) {
    const mrrInd = clientes.filter((c) => c.status === 'ativo').reduce((s, c) => s + c.mrr, 0);
    segments.push(`  - ${ind}: ${clientes.length} clientes, MRR R$${mrrInd}`);
  }

  // Clientes com mais tickets
  segments.push('\nClientes com mais tickets:');
  const ticketCount = new Map<number, number>();
  for (const t of tix) {
    ticketCount.set(t.cliente_id, (ticketCount.get(t.cliente_id) || 0) + 1);
  }
  const topTickets = [...ticketCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  for (const [clienteId, count] of topTickets) {
    const c = custs.find((c) => c.id === clienteId);
    if (c) segments.push(`  - ${c.nome}: ${count} tickets`);
  }

  return segments.join('\n');
}

// === 3 e 4: Analise AI com contexto ===
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
        content: `Voce e um analista de dados de uma empresa SaaS B2B. Use o contexto abaixo para responder a pergunta.

${context}

---

Pergunta: ${question}

Responda em portugues de forma concisa e acionavel.`,
      },
    ],
  });

  return response.content[0].type === 'text' ? response.content[0].text : 'Erro';
}

// === 5: Executa analises ===
async function main() {
  console.log('=== Construindo Contexto AI ===\n');

  // Contexto base
  const baseContext = new ContextBuilder()
    .addSection('Resumo de Clientes', summarizeCustomers(customers))
    .addSection('Resumo de Tickets', summarizeTickets(tickets))
    .addSection('Segmentacao', summarizeBySegment(customers, tickets));

  // Analise 1: Churn
  console.log('--- Analise de Churn ---\n');
  const churnContext = new ContextBuilder()
    .addSection('Resumo de Clientes', summarizeCustomers(customers))
    .addSection('Resumo de Tickets', summarizeTickets(tickets))
    .addData('Clientes Churned', customers.filter((c) => c.status === 'churned').map((c) => ({
      nome: c.nome, plano: c.plano, mrr: c.mrr, industria: c.industria, data_inicio: c.data_inicio,
    })))
    .addConstraints([
      'Foque em padroes que levam ao churn',
      'Sugira acoes concretas de retencao',
      'Considere o perfil de industria e plano',
    ]);

  const churnAnalysis = await analyzeWithContext(
    churnContext,
    'Quais padroes voce identifica nos clientes que cancelaram? Quais clientes ativos estao em maior risco de churn e por que?'
  );
  console.log(churnAnalysis);

  // Analise 2: Upsell
  console.log('\n\n--- Analise de Upsell ---\n');
  const upsellContext = new ContextBuilder()
    .addSection('Resumo de Clientes', summarizeCustomers(customers))
    .addSection('Segmentacao', summarizeBySegment(customers, tickets))
    .addData('Clientes Starter e Pro Ativos', customers
      .filter((c) => c.status === 'ativo' && c.plano !== 'Enterprise')
      .map((c) => ({
        nome: c.nome, plano: c.plano, mrr: c.mrr, industria: c.industria,
        tickets: tickets.filter((t) => t.cliente_id === c.id).length,
      })))
    .addConstraints([
      'Identifique candidatos a upgrade de plano',
      'Considere volume de tickets como indicador de engajamento',
      'Sugira abordagem personalizada por industria',
    ]);

  const upsellAnalysis = await analyzeWithContext(
    upsellContext,
    'Quais clientes Starter ou Pro tem maior potencial de upgrade para Enterprise? Que argumentos usar?'
  );
  console.log(upsellAnalysis);

  // Analise 3: Resumo executivo
  console.log('\n\n--- Resumo Executivo ---\n');
  const execContext = new ContextBuilder()
    .addSection('Resumo de Clientes', summarizeCustomers(customers))
    .addSection('Resumo de Tickets', summarizeTickets(tickets))
    .addSection('Segmentacao', summarizeBySegment(customers, tickets))
    .addConstraints([
      'Formato: bullet points concisos',
      'Inclua: estado atual, riscos, oportunidades',
      'Maximo 10 bullets',
    ]);

  const execAnalysis = await analyzeWithContext(
    execContext,
    'Gere um resumo executivo de 1 paragrafo seguido de bullet points com os principais insights, riscos e oportunidades.'
  );
  console.log(execAnalysis);

  console.log('\n\n--- Exercicio 19 completo! ---');
}

main().catch(console.error);
