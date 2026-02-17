/**
 * Solution - Exercise 13: Comparison Helpers
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

// Solution TODO 1: Comparison helpers
Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
Handlebars.registerHelper('gte', (a: number, b: number) => a >= b);
Handlebars.registerHelper('lt', (a: number, b: number) => a < b);
Handlebars.registerHelper('lte', (a: number, b: number) => a <= b);

// Solution TODO 2: Logical helpers
Handlebars.registerHelper('and', (a: unknown, b: unknown) => a && b);
Handlebars.registerHelper('or', (a: unknown, b: unknown) => a || b);
Handlebars.registerHelper('not', (a: unknown) => !a);

// Solution TODO 3: Classification template
const classificationTemplate = `=== Class Report Card ===
{{#each students}}
{{name}} | Grade: {{grade}} | Attendance: {{attendance}}% | Status: {{#if (and (gte grade 9) (and (gte attendance 90) finalProject))}}Passed with honors{{else}}{{#if (and (gte grade 7) (gte attendance 75))}}Passed{{else}}{{#if (gte grade 5)}}Recovery{{else}}Failed{{/if}}{{/if}}{{/if}}
{{/each}}`;

// Compile and test
const compiled = Handlebars.compile(classificationTemplate);
const result = compiled({ students });

console.log('=== Student Classification ===');
console.log(`Minimum grade: ${MIN_GRADE} | Minimum attendance: ${MIN_ATTENDANCE}%`);
console.log('');
console.log(result);

// Statistical summary using helpers
const summaryTemplate = `=== Summary ===
{{#each students}}{{#if (gte grade 9)}}[Featured] {{name}} - grade {{grade}}
{{/if}}{{/each}}
Students below average:
{{#each students}}{{#if (lt grade 7)}}  - {{name}} ({{grade}})
{{/if}}{{/each}}`;

const compiledSummary = Handlebars.compile(summaryTemplate);
console.log(compiledSummary({ students }));
