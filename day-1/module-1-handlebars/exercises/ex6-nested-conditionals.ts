/**
 * Exercise 6: Complex Conditionals
 *
 * Combine nested conditionals with helpers for multi-branch logic.
 * You already know basic {{#if}} (ex5). Now master complex conditionals.
 * Run: npx tsx exercises/ex6-condicionais-aninhadas.ts
 */

import Handlebars from 'handlebars';

// === Order data ===
const orders = [
  { id: 1, status: 'delivered', paid: true, amount: 150, rating: 5 },
  { id: 2, status: 'shipped', paid: true, amount: 89, rating: null },
  { id: 3, status: 'processing', paid: false, amount: 320, rating: null },
  { id: 4, status: 'cancelled', paid: true, amount: 45, rating: null },
];

// === TODO 1: Create an "eq" helper for equality comparison ===
// Handlebars doesn't have native equality comparison.
// Create a helper that compares two values and returns true/false.
//
// Usage in template: {{#if (eq status "delivered")}}...{{/if}}
//
// Tip: Handlebars.registerHelper('eq', (a, b) => a === b);

// TODO: register the eq helper here

// === TODO 2: Template with nested conditionals ===
// For EACH order, show a different message based on the status:
//
// - If "delivered" AND has rating:
//   "Order #1 delivered - Rating: 5 stars"
//
// - If "delivered" without rating:
//   "Order #1 delivered - Rate now!"
//
// - If "shipped":
//   "Order #2 on the way"
//
// - If "processing" AND not paid:
//   "Order #3 awaiting payment"
//
// - If "cancelled":
//   "Order #4 cancelled - Refund: processing" (if paid)
//   "Order #4 cancelled - Refund: N/A" (if not paid)
//
// Tip: use {{#if (eq status "delivered")}} to compare strings
// and {{#if rating}} to check if a rating exists.

const orderTemplate = `
TODO: Create template with nested conditionals for each status
`;

// === TODO 3: Wrap everything with {{#each}} ===
// Use {{#each orders}} to iterate over all orders.
// The template from TODO 2 should work INSIDE the each.
//
// Tip: inside {{#each}}, the context changes to each item.
// So {{id}} already refers to the current order's id.

const allOrdersTemplate = `
TODO: Wrap the TODO 2 template with {{#each orders}}
`;

// === Compile and test ===
// Uncomment and complete the code below:

// const compiled = Handlebars.compile(allOrdersTemplate);
// const result = compiled({ orders });
// console.log(result);

console.log('\n--- Exercise 6 complete! ---');
console.log('Tip: see the solution in solutions/ex6-condicionais-aninhadas.ts');
