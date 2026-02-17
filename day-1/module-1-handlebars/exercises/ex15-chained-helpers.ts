/**
 * Exercise 15: Helper Composition
 *
 * Learn to use subexpressions to chain helpers: (helper1 (helper2 arg)).
 * You already master comparison helpers and block helpers (ex13-ex14). Now combine them.
 * Run: npx tsx exercises/ex15-helpers-encadeados.ts
 */

import Handlebars from 'handlebars';

// === Financial transaction data ===
const transactions = [
  { description: 'ai course sale', amount: 497.5, type: 'income', date: new Date('2026-01-15') },
  { description: 'cloud server', amount: 89.9, type: 'expense', date: new Date('2026-01-20') },
  { description: 'group mentorship', amount: 1200, type: 'income', date: new Date('2026-02-01') },
  { description: 'software license', amount: 299, type: 'expense', date: new Date('2026-02-10') },
];

// === TODO 1: Register basic helpers ===
// Create the following helpers:
//
//   uppercase - converts text to uppercase
//     Usage: {{uppercase description}} => "AI COURSE SALE"
//
//   currency - formats number as currency
//     Usage: {{currency amount}} => "$497.50"
//     Tip: use toFixed(2)
//
//   formatDate - formats Date to mm/dd/yyyy
//     Usage: {{formatDate date}} => "01/15/2026"
//     Tip: use toLocaleDateString('en-US')
//
//   eq - equality comparison
//     Usage: {{#if (eq type "income")}}...{{/if}}

// TODO: Register the 4 helpers here

// === TODO 2: Create calculateTotal helper and use subexpressions ===
// Create a helper that receives the transactions array and returns the sum
// of the amounts (income as positive, expenses as negative).
//
// Usage with subexpression: {{currency (calculateTotal transactions)}}
// This first calculates the total, then formats as currency.
//
// Tip: the helper receives the array as the first argument.
// Sum the amounts: income as positive, expense as negative.

// TODO: Register the 'calculateTotal' helper here

// === TODO 3: Template with nested subexpressions ===
// Create a template that for each transaction displays:
// - If income: "+ $497.50 | AI COURSE SALE | 01/15/2026"
// - If expense: "- $89.90  | CLOUD SERVER | 01/20/2026"
//
// Use nested subexpressions:
//   {{#if (eq type "income")}}+{{else}}-{{/if}} {{currency amount}} | {{uppercase description}} | {{formatDate date}}
//
// At the end, show the total: "Balance: $1,308.60"
// Using: {{currency (calculateTotal transactions)}}

const statementTemplate = `
TODO: Create statement template with nested subexpressions
Each line should show +/- amount | description in uppercase | formatted date
At the end show the total balance
`;

// === TODO 4: Create a 'pipe' helper that chains transformations ===
// The 'pipe' helper receives a value and a list of transformation names.
// Each transformation is applied to the result of the previous one.
//
// Usage: {{pipe description "uppercase" "truncate:10"}}
// 1. "ai course sale" -> "AI COURSE SALE" (uppercase)
// 2. "AI COURSE SALE" -> "AI COURSE ..." (truncate:10)
//
// Tip: inside the helper, maintain a map of functions:
//   const transforms = {
//     uppercase: (val) => String(val).toUpperCase(),
//     lowercase: (val) => String(val).toLowerCase(),
//     'truncate:N': (val) => truncates to N characters + "..."
//   };
// Parse the transformation name to separate "truncate" from "10".

// TODO: Register the 'pipe' helper here

const pipeTemplate = `
TODO: Create template that uses the pipe helper to chain transformations
Show each description with uppercase and truncated to 15 characters
`;

// === Compile and test ===

console.log('=== Financial Statement ===');
// TODO: compile statementTemplate and display

console.log('\n=== Transformation Pipe ===');
// TODO: compile pipeTemplate and display

console.log('\n--- Exercise 15 complete! ---');
console.log('Tip: see the solution in solutions/ex15-helpers-encadeados.ts');
