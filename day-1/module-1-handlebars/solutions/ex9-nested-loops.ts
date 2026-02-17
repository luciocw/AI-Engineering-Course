/**
 * Solution - Exercise 9: Nested Loops
 */

import Handlebars from 'handlebars';

const school = {
  name: 'AI Academy',
  classes: [
    {
      name: 'Class A - Beginners',
      teacher: 'Prof. Ana',
      students: [
        { name: 'Carlos', grade: 8.5 },
        { name: 'Diana', grade: 9.2 },
        { name: 'Eduardo', grade: 7.0 },
      ],
    },
    {
      name: 'Class B - Advanced',
      teacher: 'Prof. Bruno',
      students: [
        { name: 'Fernanda', grade: 9.8 },
        { name: 'Gabriel', grade: 8.9 },
      ],
    },
  ],
};

// Solution TODO 1: Nested loops
const nestedTemplate = `{{#each classes}}{{name}}:
{{#each students}}  - {{name}} (grade: {{grade}})
{{/each}}
{{/each}}`;

// Solution TODO 2: Parent context with ../
const parentContextTemplate = `{{#each classes}}{{name}}:
{{#each students}}  Student {{name}} ({{../teacher}})
{{/each}}
{{/each}}`;

// Solution TODO 3: Root context with ../../
const rootContextTemplate = `{{#each classes}}{{#each students}}{{name}} studies at {{../../name}}
{{/each}}{{/each}}`;

// Solution TODO 4: Helper 'passed'
Handlebars.registerHelper('passed', function (grade: number) {
  return grade >= 7 ? 'Passed' : 'Failed';
});

// Template combining everything: nested loops + parent context + helper
const approvalTemplate = `=== Report {{name}} ===
{{#each classes}}
{{name}} ({{teacher}}):
{{#each students}}  {{name}} - {{grade}} - {{passed grade}} [School: {{../../name}}]
{{/each}}{{/each}}`;

// Compile and test
const compiledNested = Handlebars.compile(nestedTemplate);
console.log('=== Nested Loops ===');
console.log(compiledNested(school));

const compiledParentContext = Handlebars.compile(parentContextTemplate);
console.log('=== Parent Context (../) ===');
console.log(compiledParentContext(school));

const compiledRootContext = Handlebars.compile(rootContextTemplate);
console.log('=== Root Context (../../) ===');
console.log(compiledRootContext(school));

const compiledApproval = Handlebars.compile(approvalTemplate);
console.log('=== Approval ===');
console.log(compiledApproval(school));
