/**
 * Solucao 18: Relatorios com Templates Handlebars
 *
 * Gera relatorios profissionais usando Handlebars e dados do pipeline.
 * Execute: npx tsx solucoes/ex18-relatorio-templates.ts
 */

import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

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

// === 1: Helpers avancados ===
Handlebars.registerHelper('barChart', function (value: number, max: number) {
  const width = 20;
  const filled = Math.round((value / max) * width);
  return '='.repeat(filled) + ' '.repeat(width - filled) + ` ${value}/${max}`;
});

Handlebars.registerHelper('percentage', function (part: number, total: number) {
  if (total === 0) return '0%';
  return `${((part / total) * 100).toFixed(1)}%`;
});

Handlebars.registerHelper('pluralize', function (count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
});

Handlebars.registerHelper('relativeDate', function (dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'hoje';
  if (diffDays === 1) return 'ontem';
  if (diffDays < 30) return `ha ${diffDays} dias`;
  if (diffDays < 365) return `ha ${Math.floor(diffDays / 30)} meses`;
  return `ha ${Math.floor(diffDays / 365)} anos`;
});

Handlebars.registerHelper('formatCurrency', function (value: number) {
  return `R$${value.toLocaleString('pt-BR')}`;
});

Handlebars.registerHelper('statusLabel', function (status: string) {
  return status === 'ativo' ? '[ATIVO]' : '[CHURNED]';
});

Handlebars.registerHelper('prioridadeLabel', function (prioridade: string) {
  const labels: Record<string, string> = { alta: '[!!!]', media: '[!!]', baixa: '[!]' };
  return labels[prioridade] || '[?]';
});

Handlebars.registerHelper('repeat', function (char: string, count: number) {
  return char.repeat(count);
});

// === 2: Template de dashboard ===
Handlebars.registerPartial('kpiSection', `
--- KPIs Principais ---
  MRR Total:         {{formatCurrency kpis.mrrTotal}}
  Clientes Ativos:   {{kpis.clientesAtivos}}/{{kpis.totalClientes}}
  Churn Rate:        {{kpis.churnRate}}%
  Ticket Resolucao:  {{kpis.ticketResolutionRate}}%
  MRR Medio:         {{formatCurrency kpis.mrrMedio}}
`);

Handlebars.registerPartial('healthSection', `
--- Saude dos Clientes ---
{{#each health}}
  {{statusLabel status}} {{nome}} ({{plano}})
    MRR: {{formatCurrency mrr}} | Tickets: {{totalTickets}} | Abertos: {{ticketsAbertos}}
    Cliente desde: {{relativeDate data_inicio}}
{{/each}}
`);

Handlebars.registerPartial('ticketSection', `
--- Tickets Recentes ---
{{#each recentTickets}}
  {{prioridadeLabel prioridade}} #{{id}} {{titulo}}
    Status: {{status}} | Categoria: {{categoria}}
    Criado: {{relativeDate criado_em}}
{{/each}}
`);

const dashboardTemplate = Handlebars.compile(`
{{repeat "=" 50}}
    DASHBOARD EXECUTIVO - {{dataRelatorio}}
{{repeat "=" 50}}

{{> kpiSection}}

{{> healthSection}}

{{> ticketSection}}

--- Distribuicao por Plano ---
{{#each porPlano}}
  {{plano}}: {{barChart count ../kpis.totalClientes}} clientes
{{/each}}

{{repeat "=" 50}}
`);

// === 3: Template individual por cliente ===
const customerReportTemplate = Handlebars.compile(`
{{repeat "-" 40}}
RELATORIO: {{customer.nome}}
{{repeat "-" 40}}
  Email:     {{customer.email}}
  Plano:     {{customer.plano}}
  MRR:       {{formatCurrency customer.mrr}}
  Status:    {{statusLabel customer.status}}
  Industria: {{customer.industria}}
  Cliente desde: {{relativeDate customer.data_inicio}}

  Tickets ({{customerTickets.length}} total):
  {{#each customerTickets}}
    {{prioridadeLabel prioridade}} {{titulo}} ({{status}})
  {{/each}}
  {{#unless customerTickets.length}}
    Nenhum ticket registrado.
  {{/unless}}

  Recomendacao: {{recomendacao}}
{{repeat "-" 40}}
`);

// === 4: Template de email de alerta ===
const emailAlertTemplate = Handlebars.compile(`
De: sistema@build.ai
Para: {{destinatario}}
Assunto: [ALERTA] {{assunto}}
Data: {{data}}
{{repeat "-" 50}}

Prezado(a) gestor(a),

{{mensagem}}

Detalhes:
{{#each detalhes}}
  - {{this}}
{{/each}}

Acao requerida: {{acao}}

Atenciosamente,
Sistema de Monitoramento Build.AI
{{repeat "-" 50}}
`);

// === 5: Prepara dados e gera relatorios ===

// Dashboard
const ativos = customers.filter((c) => c.status === 'ativo');
const mrrTotal = ativos.reduce((sum, c) => sum + c.mrr, 0);
const ticketsResolvidos = tickets.filter((t) => t.status === 'resolvido').length;

const healthData = customers.map((c) => {
  const ct = tickets.filter((t) => t.cliente_id === c.id);
  return {
    ...c,
    totalTickets: ct.length,
    ticketsAbertos: ct.filter((t) => t.status === 'aberto').length,
  };
});

const porPlano = ['Enterprise', 'Pro', 'Starter'].map((plano) => ({
  plano,
  count: customers.filter((c) => c.plano === plano).length,
}));

console.log(dashboardTemplate({
  dataRelatorio: new Date().toLocaleDateString('pt-BR'),
  kpis: {
    mrrTotal,
    clientesAtivos: ativos.length,
    totalClientes: customers.length,
    churnRate: (((customers.length - ativos.length) / customers.length) * 100).toFixed(1),
    ticketResolutionRate: ((ticketsResolvidos / tickets.length) * 100).toFixed(1),
    mrrMedio: Math.round(mrrTotal / ativos.length),
  },
  health: healthData.slice(0, 5),
  recentTickets: tickets.slice(-5).reverse(),
  porPlano,
}));

// Relatorio individual (primeiro cliente)
const primeiroCliente = customers[0];
const ticketsCliente = tickets.filter((t) => t.cliente_id === primeiroCliente.id);

console.log(customerReportTemplate({
  customer: primeiroCliente,
  customerTickets: ticketsCliente,
  recomendacao: primeiroCliente.status === 'ativo'
    ? 'Manter acompanhamento proativo. Cliente saudavel.'
    : 'Iniciar campanha de reativacao com desconto.',
}));

// Email de alerta
const clientesChurned = customers.filter((c) => c.status === 'churned');
if (clientesChurned.length > 0) {
  console.log(emailAlertTemplate({
    destinatario: 'cs-team@build.ai',
    assunto: `${clientesChurned.length} clientes em churn detectados`,
    data: new Date().toLocaleDateString('pt-BR'),
    mensagem: `Foram identificados ${clientesChurned.length} clientes que cancelaram suas assinaturas recentemente.`,
    detalhes: clientesChurned.map(
      (c) => `${c.nome} (${c.plano}) - MRR perdido: R$${c.mrr}`
    ),
    acao: 'Entrar em contato com cada cliente em ate 24h para entender motivos e oferecer retencao.',
  }));
}

console.log('\n--- Exercicio 18 completo! ---');
