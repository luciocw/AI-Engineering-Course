/**
 * Solution - Exercise 8: Iterating Objects
 */

import Handlebars from 'handlebars';

const dashboardConfig = {
  metrics: {
    activeUsers: 1250,
    monthlyRevenue: 45000,
    openTickets: 23,
    avgResponseTime: '2.5h',
    satisfaction: '94%',
  },
  labels: {
    activeUsers: 'Active Users',
    monthlyRevenue: 'Monthly Revenue (R$)',
    openTickets: 'Open Tickets',
    avgResponseTime: 'Avg Response Time',
    satisfaction: 'Customer Satisfaction',
  },
};

// Solution TODO 1: Basic iteration with @key and this
const basicTemplate = `{{#each metrics}}{{@key}}: {{this}}
{{/each}}`;

// Solution TODO 2: Helper 'label' to fetch friendly name
Handlebars.registerHelper('label', function (key: string, options: Handlebars.HelperOptions) {
  const labels = options.data.root.labels as Record<string, string>;
  return labels[key] || key;
});

// Solution TODO 3: Template with table format
const tableTemplate = `=== Dashboard Metrics ===
+-------------------------------+------------------+
{{#each metrics}}| {{label @key}}{{padRight (label @key) 30}}| {{this}}{{padRight this 17}}|
{{/each}}+-------------------------------+------------------+`;

// Auxiliary helper for padding (table alignment)
Handlebars.registerHelper('padRight', function (text: string | number, width: number) {
  const str = String(text);
  const padding = width - str.length;
  return padding > 0 ? ' '.repeat(padding) : '';
});

// Compile and test
const compiledBasic = Handlebars.compile(basicTemplate);
console.log('=== Basic Iteration ===');
console.log(compiledBasic(dashboardConfig));

const compiledTable = Handlebars.compile(tableTemplate);
console.log('\n=== Formatted Table ===');
console.log(compiledTable(dashboardConfig));

// Bonus: iteration with @index and @first/@last
Handlebars.registerHelper('withComma', function (options: Handlebars.HelperOptions) {
  const data = options.data;
  return data.last ? '' : ', ';
});

const inlineListTemplate = `Monitored metrics: {{#each metrics}}{{label @key}}{{withComma}}{{/each}}`;
const compiledList = Handlebars.compile(inlineListTemplate);
console.log('\n=== Inline List ===');
console.log(compiledList(dashboardConfig));
