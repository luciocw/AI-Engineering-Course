/**
 * Exercise 8: Iterating Objects
 *
 * Learn to use {{#each}} with objects and access keys with {{@key}}.
 * You already master loops with arrays (ex7). Now iterate over object properties.
 * Run: npx tsx exercises/ex8-loops-objetos.ts
 */

import Handlebars from 'handlebars';

// === Dashboard configuration data ===
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
    monthlyRevenue: 'Monthly Revenue ($)',
    openTickets: 'Open Tickets',
    avgResponseTime: 'Average Response Time',
    satisfaction: 'Customer Satisfaction',
  },
};

// === TODO 1: Template iterating over object with {{#each}} and {{@key}} ===
// Use {{#each metrics}} to iterate over the object properties.
// Inside the loop, {{@key}} returns the property name and {{this}} the value.
//
// Example output:
// "activeUsers: 1250"
// "monthlyRevenue: 45000"
//
// Tip: {{#each metrics}}{{@key}}: {{this}}{{/each}}

const basicTemplate = `
TODO: Create template iterating over metrics with @key and this
`;

// === TODO 2: Helper 'label' to look up the friendly metric name ===
// Create a helper that receives the key (e.g.: "activeUsers") and returns
// the corresponding label (e.g.: "Active Users").
// The helper needs to access the labels object from the root context.
//
// Tip: use options.data.root to access the root context inside the helper
// Handlebars.registerHelper('label', function(key, options) { ... })

// TODO: Register the 'label' helper here

// === TODO 3: Template with table format ===
// Combine the 'label' helper with {{#each}} to create a formatted table.
// Format for each row: "| Active Users             | 1250    |"
//
// Tip: use the label helper with {{label @key}} inside the each

const tableTemplate = `
TODO: Create template with table format using the label helper
`;

// === Compile and test ===
// TODO: compile and display the template results

console.log('=== Basic Iteration ===');
// compile basicTemplate and display

console.log('\n=== Formatted Table ===');
// compile tableTemplate and display

console.log('\n--- Exercise 8 complete! ---');
console.log('Tip: see the solution in solutions/ex8-loops-objetos.ts');
