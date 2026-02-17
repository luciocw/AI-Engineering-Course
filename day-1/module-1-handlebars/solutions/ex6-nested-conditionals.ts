/**
 * Solution - Exercise 6: Complex Conditionals
 */

import Handlebars from 'handlebars';

const orders = [
  { id: 1, status: 'delivered', paid: true, amount: 150, rating: 5 },
  { id: 2, status: 'shipped', paid: true, amount: 89, rating: null },
  { id: 3, status: 'processing', paid: false, amount: 320, rating: null },
  { id: 4, status: 'cancelled', paid: true, amount: 45, rating: null },
];

// Solution TODO 1: Helper "eq" for equality comparison
Handlebars.registerHelper('eq', (a: unknown, b: unknown) => {
  return a === b;
});

// Solution TODO 2 and TODO 3: Template with nested conditionals + each
const allOrdersTemplate = `{{#each orders}}{{#if (eq status "delivered")}}{{#if rating}}Order #{{id}} delivered - Rating: {{rating}} stars{{else}}Order #{{id}} delivered - Rate now!{{/if}}{{else if (eq status "shipped")}}Order #{{id}} on the way{{else if (eq status "processing")}}{{#unless paid}}Order #{{id}} awaiting payment{{else}}Order #{{id}} being processed{{/unless}}{{else if (eq status "cancelled")}}Order #{{id}} cancelled - Refund: {{#if paid}}processing{{else}}N/A{{/if}}{{/if}}
{{/each}}`;

const compiled = Handlebars.compile(allOrdersTemplate);
const result = compiled({ orders });

console.log('=== Order Status ===');
console.log(result);

// Alternative version with more readable template using explicit \n:
// In real templates, readability matters more than a single line.
const readableTemplate = `{{#each orders}}
---
{{#if (eq status "delivered")}}
  {{#if rating}}
    Order #{{id}} delivered - Rating: {{rating}} stars (R\${{amount}})
  {{else}}
    Order #{{id}} delivered - Rate now! (R\${{amount}})
  {{/if}}
{{else if (eq status "shipped")}}
    Order #{{id}} on the way (R\${{amount}})
{{else if (eq status "processing")}}
  {{#unless paid}}
    Order #{{id}} awaiting payment of R\${{amount}}
  {{else}}
    Order #{{id}} being processed (R\${{amount}})
  {{/unless}}
{{else if (eq status "cancelled")}}
    Order #{{id}} cancelled - Refund: {{#if paid}}processing R\${{amount}}{{else}}N/A{{/if}}
{{/if}}
{{/each}}`;

console.log('\n=== Detailed Version ===');
const compiledReadable = Handlebars.compile(readableTemplate);
console.log(compiledReadable({ orders }));

// Test with extra order for coverage
const extraOrders = [
  ...orders,
  { id: 5, status: 'cancelled', paid: false, amount: 60, rating: null },
];

console.log('\n=== With Extra Order (cancelled, not paid) ===');
console.log(compiled({ orders: extraOrders }));
