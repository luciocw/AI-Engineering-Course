/**
 * Solution - Exercise 10: Each + If Combined
 */

import Handlebars from 'handlebars';

const salesReport = {
  month: 'January 2026',
  sellers: [
    { name: 'Alice', sales: 45, target: 40, region: 'South', featured: true },
    { name: 'Bob', sales: 32, target: 40, region: 'North', featured: false },
    { name: 'Carol', sales: 51, target: 40, region: 'Southeast', featured: true },
    { name: 'Daniel', sales: 38, target: 40, region: 'Central-West', featured: false },
    { name: 'Eva', sales: 40, target: 40, region: 'Northeast', featured: false },
  ],
};

// Solution TODO 1: Comparison and calculation helpers
Handlebars.registerHelper('gte', function (a: number, b: number) {
  return a >= b;
});

Handlebars.registerHelper('percentage', function (a: number, b: number) {
  return ((a / b) * 100).toFixed(1);
});

Handlebars.registerHelper('subtract', function (a: number, b: number) {
  return a - b;
});

// Solution TODO 2: Template with loop + conditionals
const reportTemplate = `Sales Report - {{month}}
========================================
{{#each sellers}}{{#if (gte sales target)}}[HIT ] {{name}} ({{region}}) - TARGET HIT ({{percentage sales target}}%){{#if featured}} ⭐{{/if}}
{{else}}[    ] {{name}} ({{region}}) - Missing {{subtract target sales}} sales
{{/if}}{{/each}}`;

// Solution TODO 3: Count helper and summary template
Handlebars.registerHelper(
  'countTargetHit',
  function (sellers: Array<{ sales: number; target: number }>) {
    return sellers.filter((s) => s.sales >= s.target).length;
  },
);

Handlebars.registerHelper(
  'countTargetMissed',
  function (sellers: Array<{ sales: number; target: number }>) {
    return sellers.filter((s) => s.sales < s.target).length;
  },
);

Handlebars.registerHelper(
  'totalSales',
  function (sellers: Array<{ sales: number }>) {
    return sellers.reduce((sum, s) => sum + s.sales, 0);
  },
);

Handlebars.registerHelper(
  'topSeller',
  function (sellers: Array<{ name: string; sales: number }>) {
    const best = sellers.reduce((top, s) => (s.sales > top.sales ? s : top));
    return `${best.name} (${best.sales} sales)`;
  },
);

const summaryTemplate = `========================================
Summary:
  Total sellers: {{sellers.length}}
  Hit target: {{countTargetHit sellers}}
  Missed target: {{countTargetMissed sellers}}
  Total sales: {{totalSales sellers}}
  Top seller: {{topSeller sellers}}`;

// Compile and test
const compiledReport = Handlebars.compile(reportTemplate);
console.log(compiledReport(salesReport));

const compiledSummary = Handlebars.compile(summaryTemplate);
console.log(compiledSummary(salesReport));
