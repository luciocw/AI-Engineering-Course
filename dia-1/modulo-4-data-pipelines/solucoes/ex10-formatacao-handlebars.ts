/**
 * Solucao 10: Formatacao com Handlebars
 *
 * Templates Handlebars para formatar dados em relatorios legiveis.
 * Execute: npx tsx solucoes/ex10-formatacao-handlebars.ts
 */

import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Carrega dados
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const rawCustomers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

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

// === 1: Helpers Handlebars ===
Handlebars.registerHelper('formatCurrency', function (value: number) {
  return `R$${value.toLocaleString('pt-BR')}`;
});

Handlebars.registerHelper('uppercase', function (value: string) {
  return value.toUpperCase();
});

Handlebars.registerHelper('ifEquals', function (this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
  return a === b ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('statusIcon', function (status: string) {
  return status === 'ativo' ? '[ATIVO]' : '[CHURNED]';
});

Handlebars.registerHelper('add', function (a: number, b: number) {
  return a + b;
});

// === 2: Template de relatorio ===
const reportTemplate = Handlebars.compile(`
============================================
       RELATORIO DE CLIENTES
============================================

{{#each planos}}
--- {{@key}} ---
{{#each this}}
  {{statusIcon status}} {{nome}} ({{email}})
    MRR: {{formatCurrency mrr}} | Industria: {{industria}}
    Cliente desde: {{data_inicio}}
{{/each}}
  Subtotal: {{formatCurrency subtotalMrr}} ({{this.length}} clientes)

{{/each}}
============================================
`);

// === 3: Template de resumo executivo ===
const summaryTemplate = Handlebars.compile(`
============================================
       RESUMO EXECUTIVO
============================================
MRR Total:        {{formatCurrency mrrTotal}}
Clientes Ativos:  {{clientesAtivos}}/{{totalClientes}}
Churn Rate:       {{churnRate}}%

Top Industrias:
{{#each topIndustrias}}
  {{add @index 1}}. {{industria}} ({{count}} clientes)
{{/each}}

Distribuicao por Plano:
{{#each porPlano}}
  {{plano}}: {{count}} clientes | MRR {{formatCurrency mrr}}
{{/each}}
============================================
`);

// === 4: Template de alerta ===
const alertTemplate = Handlebars.compile(`
============================================
       ALERTAS DE RISCO
============================================
{{#if alertas.length}}
{{#each alertas}}
  [{{severidade}}] {{nome}}
    Motivo: {{motivo}}
    Acao sugerida: {{acao}}
{{/each}}
{{else}}
  Nenhum alerta no momento.
{{/if}}
============================================
`);

// === 5: Prepara dados e executa templates ===

// Agrupa por plano
const planos: Record<string, (Customer & { subtotalMrr?: number })[]> = {};
for (const c of customers) {
  if (!planos[c.plano]) planos[c.plano] = [];
  planos[c.plano].push(c);
}

// Adiciona subtotal ao grupo
for (const plano of Object.keys(planos)) {
  const subtotal = planos[plano]
    .filter((c) => c.status === 'ativo')
    .reduce((sum, c) => sum + c.mrr, 0);
  // Adiciona como propriedade do array
  (planos[plano] as any).subtotalMrr = subtotal;
}

console.log(reportTemplate({ planos }));

// Dados do resumo
const ativos = customers.filter((c) => c.status === 'ativo');
const mrrTotal = ativos.reduce((sum, c) => sum + c.mrr, 0);
const churnRate = (((customers.length - ativos.length) / customers.length) * 100).toFixed(1);

// Industrias
const industriaCount = new Map<string, number>();
for (const c of customers) {
  industriaCount.set(c.industria, (industriaCount.get(c.industria) || 0) + 1);
}
const topIndustrias = [...industriaCount.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([industria, count]) => ({ industria, count }));

// Por plano
const porPlano = Object.entries(planos).map(([plano, clientes]) => ({
  plano,
  count: clientes.length,
  mrr: clientes.filter((c) => c.status === 'ativo').reduce((sum, c) => sum + c.mrr, 0),
}));

console.log(summaryTemplate({
  mrrTotal,
  clientesAtivos: ativos.length,
  totalClientes: customers.length,
  churnRate,
  topIndustrias,
  porPlano,
}));

// Alertas
const alertas = customers
  .filter((c) => c.status === 'churned')
  .map((c) => ({
    nome: c.nome,
    severidade: 'ALTO',
    motivo: `Cliente com plano ${c.plano} cancelou (MRR perdido: R$${c.mrr})`,
    acao: c.mrr >= 299 ? 'Contato imediato da equipe de CS' : 'Email de reativacao automatico',
  }));

console.log(alertTemplate({ alertas }));

console.log('\n--- Exercicio 10 completo! ---');
