/**
 * Exercise 12: Multi-Parameter Helpers
 *
 * Learn to create helpers with multiple arguments and hash arguments (options.hash).
 * You already created simple formatting helpers (ex11). Now advance to complex parameters.
 * Run: npx tsx exercises/ex12-helpers-parametros.ts
 */

import Handlebars from 'handlebars';

// === Product data ===
const data = {
  products: [
    { name: 'API Credits', price: 50, category: 'service', launchDate: new Date('2025-06-01') },
    { name: 'GPU Hours', price: 200, category: 'infrastructure', launchDate: new Date('2025-01-15') },
    { name: 'LangSmith', price: 35, category: 'service', launchDate: new Date('2026-01-10') },
    { name: 'Vector DB', price: 70, category: 'infrastructure', launchDate: new Date('2024-11-20') },
  ],
  currency: 'BRL',
  locale: 'pt-BR',
};

// === TODO 1: Helper 'formatPrice' with 2 parameters ===
// Receives price and currency, formats accordingly:
// - BRL: "R$ 50,00"
// - USD: "$ 50.00"
// - EUR: "E 50.00" (E as simplified symbol)
//
// Usage in template: {{formatPrice price currency}}
//
// Tip: the helper receives (price, currency) as positional arguments

// TODO: Register the 'formatPrice' helper here

// === TODO 2: Helper 'daysSince' ===
// Calculates how many days have passed since a date until today.
// Usage: {{daysSince launchDate}} => "260 days"
//
// Tip: new Date().getTime() - date.getTime() / (1000 * 60 * 60 * 24)

// TODO: Register the 'daysSince' helper here

// === TODO 3: Helper 'badge' with hash arguments ===
// Hash arguments are named parameters accessed via options.hash.
// Usage: {{badge name type="pill" color="green"}}
//
// Output based on type:
// - type="pill": "[green: API Credits]"
// - type="tag": "#API Credits"
// - default: "(API Credits)"
//
// Tip: function(text, options) { const { type, color } = options.hash; }

// TODO: Register the 'badge' helper here

// === TODO 4: Block helper 'filterBy' with hash arguments ===
// Filters an array by a property and renders the block for each item.
// Usage: {{#filterBy products category="service"}}...{{/filterBy}}
//
// Inside the block, the context is each filtered product.
// The helper should iterate over the filtered items and render options.fn(item).
//
// Tip: block helpers receive options.fn (block) and options.hash (named parameters)
// function(array, options) {
//   const filtered = array.filter(item => ...);
//   return filtered.map(item => options.fn(item)).join('');
// }

// TODO: Register the block helper 'filterBy' here

// === Template using all helpers ===
const productsTemplate = `
TODO: Create template that uses the 4 helpers:
- List all products with formatPrice and daysSince
- Use badge to show the category
- Use filterBy to show only services
`;

// === Compile and test ===
// TODO: compile the template and display the result

console.log('\n--- Exercise 12 complete! ---');
console.log('Tip: see the solution in solutions/ex12-helpers-parametros.ts');
