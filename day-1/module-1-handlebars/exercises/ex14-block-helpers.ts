/**
 * Exercise 14: Block Helpers
 *
 * Learn to create block helpers with options.fn(), options.inverse() and options.hash.
 * You already master simple helpers (ex13). Now create helpers that control entire blocks.
 * Run: npx tsx exercises/ex14-block-helpers.ts
 */

import Handlebars from 'handlebars';

// === Application data ===
const data = {
  user: { name: 'Pedro', role: 'admin', authenticated: true },
  items: [
    { name: 'Laptop', price: 4500, available: true },
    { name: 'Monitor', price: 2200, available: false },
    { name: 'Keyboard', price: 350, available: true },
    { name: 'Mouse', price: 150, available: true },
  ],
  config: { debug: false, theme: 'dark' },
};

// === TODO 1: Block helper #authorized ===
// Create a block helper that renders the content only if the user
// has the specified role via hash.
// If not, render the {{else}} block.
//
// Usage in template:
//   {{#authorized user role="admin"}}
//     Admin panel: Welcome, {{user.name}}!
//   {{else}}
//     Access denied. Required role: admin
//   {{/authorized}}
//
// Tip: the first argument is the user object.
// options.hash.role contains the required role.
// Use options.fn(this) to render the main block.
// Use options.inverse(this) to render the {{else}} block.

// TODO: Register the block helper 'authorized' here

// === TODO 2: Block helper #list ===
// Create a block helper that wraps items in a formatted list
// with header and footer.
//
// Usage in template:
//   {{#list items title="Products"}}
//     - {{name}} - ${{price}}
//   {{/list}}
//
// Expected output:
//   === Products (4 items) ===
//   - Laptop - $4500
//   - Monitor - $2200
//   - Keyboard - $350
//   - Mouse - $150
//   === End ===
//
// Tip: iterate over the array manually inside the helper.
// For each item, call options.fn(item) to render the block.
// Concatenate the results with header and footer.

// TODO: Register the block helper 'list' here

// === TODO 3: Block helper #repeat ===
// Create a block helper that repeats the content N times.
// Make @index available as a data variable inside the block.
//
// Usage in template:
//   {{#repeat 3}}
//     Line {{@index}}
//   {{/repeat}}
//
// Expected output:
//   Line 0
//   Line 1
//   Line 2
//
// Tip: use a for loop from 0 to n.
// To inject @index, create a data object:
//   const data = Handlebars.createFrame(options.data);
//   data.index = i;
//   result += options.fn(this, { data });

// TODO: Register the block helper 'repeat' here

// === TODO 4: Block helper #filterBy ===
// Create a block helper that filters an array and renders only the items
// that match the criteria.
//
// Usage in template:
//   {{#filterBy items "available" true}}
//     {{name}} - available
//   {{/filterBy}}
//
// Expected output (only items with available === true):
//   Laptop - available
//   Keyboard - available
//   Mouse - available
//
// Tip: the first argument is the array, the second is the property name,
// the third is the expected value.
// Filter the array and call options.fn(item) for each item that passes the filter.
// If no items pass, use options.inverse(this).

// TODO: Register the block helper 'filterBy' here

// === Main template that uses all block helpers ===
const mainTemplate = `
TODO: Create a template that uses all 4 block helpers:
1. {{#authorized}} to check access
2. {{#list}} to display items
3. {{#repeat}} to repeat a separator
4. {{#filterBy}} to show only available items
`;

// === Compile and test ===
// TODO: compile the template and display the result

console.log('=== Block Helpers ===');
// compile mainTemplate and display

// Test with user without permission
const dataNoPermission = {
  ...data,
  user: { name: 'Julia', role: 'viewer', authenticated: true },
};

console.log('\n=== Test without Permission ===');
// compile mainTemplate with dataNoPermission and display

console.log('\n--- Exercise 14 complete! ---');
console.log('Tip: see the solution in solutions/ex14-block-helpers.ts');
