/**
 * Exercise 13: Comparison Helpers
 *
 * Build a library of helpers for comparison and conditional logic.
 * You already master basic helpers (ex5, ex8-ex9). Now create reusable helpers.
 * Run: npx tsx exercises/ex13-helpers-comparacao.ts
 */

import Handlebars from 'handlebars';

// === Student data ===
const students = [
  { name: 'Ana', grade: 9.5, attendance: 95, finalProject: true },
  { name: 'Bruno', grade: 6.8, attendance: 72, finalProject: true },
  { name: 'Carla', grade: 7.5, attendance: 88, finalProject: false },
  { name: 'Diego', grade: 4.2, attendance: 60, finalProject: false },
  { name: 'Eva', grade: 8.0, attendance: 91, finalProject: true },
];

const MIN_GRADE = 7.0;
const MIN_ATTENDANCE = 75;

// === TODO 1: Create comparison helpers ===
// Register the following helpers that receive two values and return boolean:
//   eq  - equal (a === b)
//   gt  - greater than (a > b)
//   gte - greater than or equal (a >= b)
//   lt  - less than (a < b)
//   lte - less than or equal (a <= b)
//
// Usage in template: {{#if (gt grade 7)}}Passed{{/if}}
//
// Tip: Handlebars.registerHelper('gt', (a, b) => a > b)

// TODO: Register the 5 comparison helpers here

// === TODO 2: Create logical helpers ===
// Register helpers to combine conditions:
//   and - returns true if BOTH arguments are truthy
//   or  - returns true if AT LEAST ONE argument is truthy
//   not - returns true if the argument is falsy
//
// Usage in template: {{#if (and (gte grade 7) (gte attendance 75))}}Passed{{/if}}
//
// Tip: Handlebars.registerHelper('and', (a, b) => a && b)

// TODO: Register the 3 logical helpers here

// === TODO 3: Student classification template ===
// Use the created helpers to classify each student:
//
// - "Passed with honors" if grade >= 9 AND attendance >= 90 AND finalProject
// - "Passed" if grade >= 7 AND attendance >= 75
// - "Recovery" if grade >= 5 but doesn't meet all passing conditions
// - "Failed" if grade < 5
//
// Output format for each student:
// "Ana | Grade: 9.5 | Attendance: 95% | Status: Passed with honors"
//
// Tip: use {{#if (and (gte grade 9) (and (gte attendance 90) finalProject))}}
//       for the honors condition

const classificationTemplate = `
TODO: Create template that classifies each student using the comparison helpers
Use {{#each students}} to iterate and the helpers to classify
`;

// === Compile and test ===
// TODO: compile the template and display the result

console.log('=== Student Classification ===');
console.log(`Minimum grade: ${MIN_GRADE} | Minimum attendance: ${MIN_ATTENDANCE}%`);
console.log('');
// compile classificationTemplate and display

console.log('\n--- Exercise 13 complete! ---');
console.log('Tip: see the solution in solutions/ex13-helpers-comparacao.ts');
