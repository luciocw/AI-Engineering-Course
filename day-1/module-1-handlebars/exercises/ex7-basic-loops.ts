/**
 * Exercise 7: Loops with Each
 *
 * Learn to iterate over arrays with {{#each}}, using @index, @first and @last.
 * You already master conditionals (ex5-ex6). Now iterate over lists.
 * Run: npx tsx exercises/ex7-loops-basico.ts
 */

import Handlebars from 'handlebars';

// === Catalog data ===
const catalog = {
  store: 'AI Tools Store',
  products: [
    { name: 'Claude API Credits', price: 50, inStock: true, tags: ['ai', 'api'] },
    { name: 'Vector DB Hosting', price: 70, inStock: true, tags: ['database', 'cloud'] },
    { name: 'GPU Training Hours', price: 200, inStock: false, tags: ['training', 'gpu'] },
    { name: 'LangSmith Pro', price: 35, inStock: true, tags: ['monitoring', 'observability'] },
  ],
};

// === TODO 1: List products with {{#each}} and {{@index}} ===
// Create a template that lists all products with a number (index).
// Use {{@index}} to access the current item's index (starts at 0).
//
// Expected output example:
// "Catalog: AI Tools Store
//  0. Claude API Credits - $50
//  1. Vector DB Hosting - $70
//  2. GPU Training Hours - $200
//  3. LangSmith Pro - $35"
//
// Tip: inside {{#each products}}, use {{@index}} for the number
// and {{name}}, {{price}} for the product data.

const listTemplate = `
TODO: Create template listing products with @index
`;

// === TODO 2: Filter with {{#if}} inside {{#each}} ===
// Combine each + if to show only products in stock.
//
// Expected output example:
// "Available products:
//  - Claude API Credits ($50) - IN STOCK
//  - Vector DB Hosting ($70) - IN STOCK
//  - LangSmith Pro ($35) - IN STOCK
//  Out of stock products:
//  - GPU Training Hours ($200) - OUT OF STOCK"
//
// Tip: use {{#if inStock}} inside {{#each products}}

const filteredTemplate = `
TODO: Create template combining each + if to filter by stock
`;

// === TODO 3: Use {{@first}} and {{@last}} for special formatting ===
// Add special markers on the first and last item.
//
// Expected output example:
// "[FEATURED] Claude API Credits - $50
//  Vector DB Hosting - $70
//  GPU Training Hours - $200
//  [LAST] LangSmith Pro - $35"
//
// Tip: {{#if @first}}[FEATURED]{{/if}} and {{#if @last}}[LAST]{{/if}}

const formattedTemplate = `
TODO: Create template using @first and @last
`;

// === TODO 4: {{else}} inside {{#each}} for empty array ===
// What happens when the list is empty?
// Use {{else}} inside {{#each}} as a fallback.
//
// Expected output example (with empty array):
// "No products found."
//
// Tip: {{#each items}}...{{else}}No items.{{/each}}

const emptyCatalog = {
  store: 'New Store',
  products: [],
};

const templateWithElse = `
TODO: Create template with {{else}} inside {{#each}} for empty list
`;

// === Compile and test ===
// Uncomment and complete the code below:

// console.log('=== TODO 1: List with @index ===');
// const comp1 = Handlebars.compile(listTemplate);
// console.log(comp1(catalog));

// console.log('\n=== TODO 2: Filtered by stock ===');
// const comp2 = Handlebars.compile(filteredTemplate);
// console.log(comp2(catalog));

// console.log('\n=== TODO 3: @first and @last ===');
// const comp3 = Handlebars.compile(formattedTemplate);
// console.log(comp3(catalog));

// console.log('\n=== TODO 4: Empty array ===');
// const comp4 = Handlebars.compile(templateWithElse);
// console.log('With products:', comp4(catalog));
// console.log('Without products:', comp4(emptyCatalog));

console.log('\n--- Exercise 7 complete! ---');
console.log('Tip: see the solution in solutions/ex7-loops-basico.ts');
