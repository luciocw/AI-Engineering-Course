/**
 * Exercise 10: Each + If Combined
 *
 * Learn to combine loops with conditionals for complex templates.
 * You already master nested loops and parent context (ex9). Now add logic inside loops.
 * Run: npx tsx exercises/ex10-loops-condicionais.ts
 */

import Handlebars from 'handlebars';

// === Sales report data ===
const salesReport = {
  month: 'January 2026',
  sellers: [
    { name: 'Alice', sales: 45, target: 40, region: 'South', featured: true },
    { name: 'Bob', sales: 32, target: 40, region: 'North', featured: false },
    { name: 'Carol', sales: 51, target: 40, region: 'Southeast', featured: true },
    { name: 'Daniel', sales: 38, target: 40, region: 'Midwest', featured: false },
    { name: 'Eva', sales: 40, target: 40, region: 'Northeast', featured: false },
  ],
};

// === TODO 1: Comparison and calculation helpers ===
// Create the following helpers:
//
// 'gte' - returns true if a >= b (greater than or equal)
//   Usage: {{#if (gte sales target)}}...{{/if}}
//
// 'percentage' - calculates (a / b * 100) and formats with 1 decimal place
//   Usage: {{percentage sales target}} => "112.5"
//
// 'subtract' - returns a - b
//   Usage: {{subtract target sales}} => "8"
//
// Tip: to use a helper inside {{#if}}, use subexpressions: {{#if (gte sales target)}}

// TODO: Register the 'gte', 'percentage' and 'subtract' helpers here

// === TODO 2: Template with loop + conditionals ===
// For each seller, show:
// - If sales >= target: "Alice - TARGET MET (112.5%)"
// - If sales < target: "Bob - Missing 8 sales"
//
// Tip: use {{#each sellers}} with {{#if (gte sales target)}} inside

const reportTemplate = `
TODO: Create template combining each with if/else
`;

// === TODO 3: Summary with block helper 'countIf' ===
// Create a block helper 'countIf' that counts how many items in an array
// meet a condition. Use it to show:
// "Total: 5 sellers | Met target: 3 | Didn't meet: 2"
//
// Tip: block helpers receive options.fn and options.inverse
// Handlebars.registerHelper('countIf', function(array, field, threshold, options) { ... })
// Or use a simpler approach with a helper that returns the number directly.

// TODO: Register the 'countIf' helper here

const summaryTemplate = `
TODO: Create summary template using countIf or counting helpers
`;

// === Compile and test ===
// TODO: compile the templates and display the results

console.log(`=== Sales Report - ${salesReport.month} ===`);
// compile reportTemplate

console.log('\n=== Summary ===');
// compile summaryTemplate

console.log('\n--- Exercise 10 complete! ---');
console.log('Tip: see the solution in solutions/ex10-loops-condicionais.ts');
