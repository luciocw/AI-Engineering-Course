/**
 * Exercise 11: Formatting Helpers
 *
 * Learn to create simple helpers with registerHelper() to format values.
 * You already used helpers inside loops (ex8-ex10). Now create your own value helpers.
 * Run: npx tsx exercises/ex11-helpers-simples.ts
 */

import Handlebars from 'handlebars';

// === Order data ===
const order = {
  customer: 'joao pereira',
  items: [
    { name: 'AI Engineering Course', price: 497.5 },
    { name: 'Individual Mentorship', price: 1200 },
    { name: 'Advanced RAG Ebook', price: 89.9 },
  ],
  discount: 0.15,
  date: new Date('2026-02-15'),
  longDescription:
    'This package includes full access to the AI Engineering course with all modules, individual mentorship with a specialist, and an exclusive ebook on advanced RAG with practical examples',
};

// === TODO 1: Helper 'uppercase' ===
// Transforms text to UPPERCASE.
// Usage: {{uppercase customer}} => "JOAO PEREIRA"
//
// Tip: use String.prototype.toUpperCase()

// TODO: Register the 'uppercase' helper here

// === TODO 2: Helper 'currency' ===
// Formats a number as currency: "$497.50"
// Usage: {{currency price}} => "$497.50"
//
// Tip: use Number.prototype.toFixed(2)

// TODO: Register the 'currency' helper here

// === TODO 3: Helper 'truncate' ===
// Cuts text at a limit of N characters and adds "..."
// Usage: {{truncate longDescription 50}} => "This package includes full access to the AI Engin..."
//
// Tip: the helper receives (text, limit) as parameters

// TODO: Register the 'truncate' helper here

// === TODO 4: Helper 'formatDate' ===
// Formats Date as "MM/DD/YYYY"
// Usage: {{formatDate date}} => "02/15/2026"
//
// Tip: use getDate(), getMonth() + 1, getFullYear()
// Remember to add leading zero for day and month (01, 02...)

// TODO: Register the 'formatDate' helper here

// === TODO 5: Helper 'total' ===
// Sums the 'price' field of an array of items.
// Usage: {{total items}} => 1787.4
//
// Tip: use Array.prototype.reduce() to sum the prices

// TODO: Register the 'total' helper here

// === Template using all helpers ===
// Create a template that uses all 5 helpers to display the order.
//
// Expected output example:
// "=== ORDER ===
//  Customer: JOAO PEREIRA
//  Date: 02/15/2026
//
//  Items:
//  - AI Engineering Course: $497.50
//  - Individual Mentorship: $1,200.00
//  - Advanced RAG Ebook: $89.90
//
//  Total: $1,787.40
//  Description: This package includes full access to the AI Engin..."

const orderTemplate = `
TODO: Create template using the 5 helpers
`;

// === Compile and test ===
// TODO: compile the template and display the result

console.log('\n--- Exercise 11 complete! ---');
console.log('Tip: see the solution in solutions/ex11-helpers-simples.ts');
