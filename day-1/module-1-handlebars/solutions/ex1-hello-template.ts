/**
 * Solution - Exercise 1: First Template
 */

import Handlebars from 'handlebars';

const greeting = {
  name: 'World',
};

// Solution TODO 1: Create and compile your first template
const template = 'Hello, {{name}}!';
const compiled = Handlebars.compile(template);
const result = compiled(greeting);

console.log('=== TODO 1: First Template ===');
console.log(result);
// Output: "Hello, World!"

// Solution TODO 2: Reuse the template with different data
console.log('\n=== TODO 2: Reusing the Template ===');
console.log(compiled({ name: 'TypeScript' }));
// Output: "Hello, TypeScript!"

console.log(compiled({ name: 'AI Engineering' }));
// Output: "Hello, AI Engineering!"

// Note: the template was compiled ONCE and reused multiple times.
// This is efficient - compile once, use as many times as you want.

// Solution TODO 3: Template with multiple variables
const learning = {
  language: 'TypeScript',
  framework: 'Handlebars',
};

const learningTemplate = "I'm learning {{framework}} with {{language}}!";
const compiledLearning = Handlebars.compile(learningTemplate);

console.log('\n=== TODO 3: Multiple Variables ===');
console.log(compiledLearning(learning));
// Output: "I'm learning Handlebars with TypeScript!"

// Bonus: what happens when a variable doesn't exist in the data?
console.log('\n=== Bonus: Missing variable ===');
console.log(compiled({}));
// Output: "Hello, !" - Handlebars simply ignores missing variables
