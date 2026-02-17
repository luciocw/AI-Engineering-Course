/**
 * Solution 10: Formatting with Handlebars
 *
 * Handlebars templates for formatting data into readable reports.
 * Run: npx tsx solutions/ex10-handlebars-reports.ts
 */

import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Load data
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const rawCustomers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

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

// === 1: Handlebars Helpers ===
Handlebars.registerHelper('formatCurrency', function (value: number) {
  return `$${value.toLocaleString('en-US')}`;
});

Handlebars.registerHelper('uppercase', function (value: string) {
  return value.toUpperCase();
});

Handlebars.registerHelper('ifEquals', function (this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
  return a === b ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('statusIcon', function (status: string) {
  return status === 'ativo' ? '[ACTIVE]' : '[CHURNED]';
});

Handlebars.registerHelper('add', function (a: number, b: number) {
  return a + b;
});

// === 2: Report template ===
const reportTemplate = Handlebars.compile(`
============================================
       CUSTOMER REPORT
============================================

{{#each plans}}
--- {{@key}} ---
{{#each this}}
  {{statusIcon status}} {{name}} ({{email}})
    MRR: {{formatCurrency mrr}} | Industry: {{industry}}
    Customer since: {{start_date}}
{{/each}}
  Subtotal: {{formatCurrency subtotalMrr}} ({{this.length}} customers)

{{/each}}
============================================
`);

// === 3: Executive summary template ===
const summaryTemplate = Handlebars.compile(`
============================================
       EXECUTIVE SUMMARY
============================================
Total MRR:         {{formatCurrency totalMrr}}
Active Customers:  {{activeCustomers}}/{{totalCustomers}}
Churn Rate:        {{churnRate}}%

Top Industries:
{{#each topIndustries}}
  {{add @index 1}}. {{industry}} ({{count}} customers)
{{/each}}

Distribution by Plan:
{{#each byPlan}}
  {{plan}}: {{count}} customers | MRR {{formatCurrency mrr}}
{{/each}}
============================================
`);

// === 4: Alert template ===
const alertTemplate = Handlebars.compile(`
============================================
       RISK ALERTS
============================================
{{#if alerts.length}}
{{#each alerts}}
  [{{severity}}] {{name}}
    Reason: {{reason}}
    Suggested action: {{action}}
{{/each}}
{{else}}
  No alerts at this time.
{{/if}}
============================================
`);

// === 5: Prepare data and execute templates ===

// Group by plan
const plans: Record<string, (Customer & { subtotalMrr?: number })[]> = {};
for (const c of customers) {
  if (!plans[c.plan]) plans[c.plan] = [];
  plans[c.plan].push(c);
}

// Add subtotal to group
for (const plan of Object.keys(plans)) {
  const subtotal = plans[plan]
    .filter((c) => c.status === 'ativo')
    .reduce((sum, c) => sum + c.mrr, 0);
  // Add as array property
  (plans[plan] as any).subtotalMrr = subtotal;
}

console.log(reportTemplate({ plans }));

// Summary data
const active = customers.filter((c) => c.status === 'ativo');
const totalMrr = active.reduce((sum, c) => sum + c.mrr, 0);
const churnRate = (((customers.length - active.length) / customers.length) * 100).toFixed(1);

// Industries
const industryCount = new Map<string, number>();
for (const c of customers) {
  industryCount.set(c.industry, (industryCount.get(c.industry) || 0) + 1);
}
const topIndustries = [...industryCount.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([industry, count]) => ({ industry, count }));

// By plan
const byPlan = Object.entries(plans).map(([plan, customers]) => ({
  plan,
  count: customers.length,
  mrr: customers.filter((c) => c.status === 'ativo').reduce((sum, c) => sum + c.mrr, 0),
}));

console.log(summaryTemplate({
  totalMrr,
  activeCustomers: active.length,
  totalCustomers: customers.length,
  churnRate,
  topIndustries,
  byPlan,
}));

// Alerts
const alerts = customers
  .filter((c) => c.status === 'churned')
  .map((c) => ({
    name: c.name,
    severity: 'HIGH',
    reason: `Customer with ${c.plan} plan cancelled (lost MRR: $${c.mrr})`,
    action: c.mrr >= 299 ? 'Immediate CS team contact' : 'Automated reactivation email',
  }));

console.log(alertTemplate({ alerts }));

console.log('\n--- Exercise 10 complete! ---');
