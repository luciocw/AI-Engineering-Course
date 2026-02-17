/**
 * Exercise 9: Nested Loops
 *
 * Learn to use nested {{#each}} and access parent context with ../ .
 * You already master simple loops and object iteration (ex7-ex8). Now combine levels.
 * Run: npx tsx exercises/ex9-loops-aninhados.ts
 */

import Handlebars from 'handlebars';

// === School data ===
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

// === TODO 1: Template with nested loops ===
// For each class, list the students with name and grade.
// Use {{#each classes}} and inside it {{#each students}}.
//
// Example output:
// "Class A - Beginners:
//   - Carlos (grade: 8.5)
//   - Diana (grade: 9.2)
//   - Eduardo (grade: 7.0)"
//
// Tip: {{#each classes}}...{{#each students}}...{{/each}}{{/each}}

const nestedTemplate = `
TODO: Create template with nested loops for classes and students
`;

// === TODO 2: Accessing parent context with ../ ===
// Inside the students loop, access the class teacher using ../ .
// Format: "Student Carlos (Prof. Ana)"
//
// Tip: inside {{#each students}}, use {{../teacher}} to access
// the teacher property from the level above (class)

const parentContextTemplate = `
TODO: Create template that accesses parent context with ../
`;

// === TODO 3: Accessing root context with ../../ ===
// Inside the students loop (2 levels deep), access the school name.
// Format: "Carlos studies at AI Academy"
//
// Tip: each ../ goes up one level. From inside students (level 2),
// use ../../name to reach the school name (level 0)

const rootContextTemplate = `
TODO: Create template that accesses root context with ../../
`;

// === TODO 4: Helper 'passed' ===
// Create a helper that receives the grade and returns "Passed" if >= 7,
// otherwise returns "Failed".
//
// Tip: Handlebars.registerHelper('passed', function(grade) { ... })

// TODO: Register the 'passed' helper here

// Template using the passed helper:
const passedTemplate = `
TODO: Create template that uses the passed helper for each student
Format: "Carlos - 8.5 - Passed"
`;

// === Compile and test ===
// TODO: compile each template and display the results

console.log('=== Nested Loops ===');
// compile nestedTemplate

console.log('\n=== Parent Context (../) ===');
// compile parentContextTemplate

console.log('\n=== Root Context (../../) ===');
// compile rootContextTemplate

console.log('\n=== Pass/Fail ===');
// compile passedTemplate

console.log('\n--- Exercise 9 complete! ---');
console.log('Tip: see the solution in solutions/ex9-loops-aninhados.ts');
