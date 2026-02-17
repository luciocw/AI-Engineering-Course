/**
 * Exercise 1: First Template
 *
 * Learn the basics of Handlebars: compiling templates and inserting variables.
 * This is the starting point - {{variable}} and Handlebars.compile().
 * Run: npx tsx exercises/ex1-hello-template.ts
 */

import Handlebars from 'handlebars';

// === Simple data ===
const greeting = {
  name: 'World',
};

// === TODO 1: Create and compile your first template ===
// 1. Create a template string: "Hello, {{name}}!"
// 2. Use Handlebars.compile() to compile the template
// 3. Pass the `greeting` object to the compiled template
// 4. Print the result with console.log()
//
// Expected output example:
// "Hello, World!"

// const template = ...
// const compiled = Handlebars.compile(template);
// const result = compiled(greeting);
// console.log(result);

// === TODO 2: Test with different data ===
// Pass a different object to the SAME compiled template.
// Example: { name: 'TypeScript' } -> "Hello, TypeScript!"
//
// Tip: you don't need to recompile the template.
// Just call the compiled function with new data.

// console.log(compiled({ name: 'TypeScript' }));

// === TODO 3: Template with multiple variables ===
// Create a NEW template with 2 variables: language and framework.
// Data: { language: 'TypeScript', framework: 'Handlebars' }
// Template: "I'm learning {{framework}} with {{language}}!"
//
// Expected output example:
// "I'm learning Handlebars with TypeScript!"

const learning = {
  language: 'TypeScript',
  framework: 'Handlebars',
};

// const learningTemplate = ...
// const compiledLearning = ...
// console.log(compiledLearning(learning));

console.log('\n--- Exercise 1 complete! ---');
console.log('Tip: see the solution in solutions/ex1-hello-template.ts');
