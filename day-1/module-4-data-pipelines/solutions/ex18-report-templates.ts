/**
 * Solution 18: Reports with Handlebars Templates
 *
 * Generates professional reports using Handlebars and pipeline data.
 * Run: npx tsx solutions/ex18-report-templates.ts
 */

import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

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

// === 1: Advanced helpers ===
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

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
});

Handlebars.registerHelper('formatCurrency', function (value: number) {
  return `$${value.toLocaleString('en-US')}`;
});

Handlebars.registerHelper('statusLabel', function (status: string) {
  return status === 'ativo' ? '[ACTIVE]' : '[CHURNED]';
});

Handlebars.registerHelper('priorityLabel', function (priority: string) {
  const labels: Record<string, string> = { alta: '[!!!]', media: '[!!]', baixa: '[!]' };
  return labels[priority] || '[?]';
});

Handlebars.registerHelper('repeat', function (char: string, count: number) {
  return char.repeat(count);
});

// === 2: Dashboard template ===
Handlebars.registerPartial('kpiSection', `
--- Main KPIs ---
  Total MRR:          {{formatCurrency kpis.totalMrr}}
  Active Customers:   {{kpis.activeCustomers}}/{{kpis.totalCustomers}}
  Churn Rate:         {{kpis.churnRate}}%
  Ticket Resolution:  {{kpis.ticketResolutionRate}}%
  Average MRR:        {{formatCurrency kpis.avgMrr}}
`);

Handlebars.registerPartial('healthSection', `
--- Customer Health ---
{{#each health}}
  {{statusLabel status}} {{name}} ({{plan}})
    MRR: {{formatCurrency mrr}} | Tickets: {{totalTickets}} | Open: {{openTickets}}
    Customer since: {{relativeDate start_date}}
{{/each}}
`);

Handlebars.registerPartial('ticketSection', `
--- Recent Tickets ---
{{#each recentTickets}}
  {{priorityLabel priority}} #{{id}} {{title}}
    Status: {{status}} | Category: {{category}}
    Created: {{relativeDate created_at}}
{{/each}}
`);

const dashboardTemplate = Handlebars.compile(`
{{repeat "=" 50}}
    EXECUTIVE DASHBOARD - {{reportDate}}
{{repeat "=" 50}}

{{> kpiSection}}

{{> healthSection}}

{{> ticketSection}}

--- Distribution by Plan ---
{{#each byPlan}}
  {{plan}}: {{barChart count ../kpis.totalCustomers}} customers
{{/each}}

{{repeat "=" 50}}
`);

// === 3: Individual customer report template ===
const customerReportTemplate = Handlebars.compile(`
{{repeat "-" 40}}
REPORT: {{customer.name}}
{{repeat "-" 40}}
  Email:     {{customer.email}}
  Plan:      {{customer.plan}}
  MRR:       {{formatCurrency customer.mrr}}
  Status:    {{statusLabel customer.status}}
  Industry:  {{customer.industry}}
  Customer since: {{relativeDate customer.start_date}}

  Tickets ({{customerTickets.length}} total):
  {{#each customerTickets}}
    {{priorityLabel priority}} {{title}} ({{status}})
  {{/each}}
  {{#unless customerTickets.length}}
    No tickets recorded.
  {{/unless}}

  Recommendation: {{recommendation}}
{{repeat "-" 40}}
`);

// === 4: Alert email template ===
const emailAlertTemplate = Handlebars.compile(`
From: sistema@build.ai
To: {{recipient}}
Subject: [ALERT] {{subject}}
Date: {{date}}
{{repeat "-" 50}}

Dear manager,

{{message}}

Details:
{{#each details}}
  - {{this}}
{{/each}}

Required action: {{action}}

Best regards,
Build.AI Monitoring System
{{repeat "-" 50}}
`);

// === 5: Prepare data and generate reports ===

// Dashboard
const active = customers.filter((c) => c.status === 'ativo');
const totalMrr = active.reduce((sum, c) => sum + c.mrr, 0);
const resolvedTickets = tickets.filter((t) => t.status === 'resolvido').length;

const healthData = customers.map((c) => {
  const ct = tickets.filter((t) => t.customer_id === c.id);
  return {
    ...c,
    totalTickets: ct.length,
    openTickets: ct.filter((t) => t.status === 'aberto').length,
  };
});

const byPlan = ['Enterprise', 'Pro', 'Starter'].map((plan) => ({
  plan,
  count: customers.filter((c) => c.plan === plan).length,
}));

console.log(dashboardTemplate({
  reportDate: new Date().toLocaleDateString('en-US'),
  kpis: {
    totalMrr,
    activeCustomers: active.length,
    totalCustomers: customers.length,
    churnRate: (((customers.length - active.length) / customers.length) * 100).toFixed(1),
    ticketResolutionRate: ((resolvedTickets / tickets.length) * 100).toFixed(1),
    avgMrr: Math.round(totalMrr / active.length),
  },
  health: healthData.slice(0, 5),
  recentTickets: tickets.slice(-5).reverse(),
  byPlan,
}));

// Individual report (first customer)
const firstCustomer = customers[0];
const customerTickets = tickets.filter((t) => t.customer_id === firstCustomer.id);

console.log(customerReportTemplate({
  customer: firstCustomer,
  customerTickets: customerTickets,
  recommendation: firstCustomer.status === 'ativo'
    ? 'Maintain proactive follow-up. Healthy customer.'
    : 'Start reactivation campaign with discount.',
}));

// Alert email
const churnedCustomers = customers.filter((c) => c.status === 'churned');
if (churnedCustomers.length > 0) {
  console.log(emailAlertTemplate({
    recipient: 'cs-team@build.ai',
    subject: `${churnedCustomers.length} churned customers detected`,
    date: new Date().toLocaleDateString('en-US'),
    message: `${churnedCustomers.length} customers who recently cancelled their subscriptions have been identified.`,
    details: churnedCustomers.map(
      (c) => `${c.name} (${c.plan}) - Lost MRR: $${c.mrr}`
    ),
    action: 'Contact each customer within 24h to understand reasons and offer retention.',
  }));
}

console.log('\n--- Exercise 18 complete! ---');
