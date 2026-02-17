/**
 * Exercise 16: Partials and Composition
 *
 * Learn to use registerPartial(), dynamic partials and context passing.
 * You already master helpers and subexpressions (ex13-ex15). Now compose reusable templates.
 * Run: npx tsx exercises/ex16-partials-composicao.ts
 */

import Handlebars from 'handlebars';

// === Page data ===
const page = {
  title: 'Dashboard AI',
  user: { name: 'Maria', avatar: 'M', role: 'admin' },
  notifications: [
    { type: 'success', message: 'Model trained successfully' },
    { type: 'warning', message: 'Token usage above 80%' },
    { type: 'error', message: 'Failed to connect to API' },
  ],
  metrics: { models: 12, requests: 45000, uptime: '99.9%' },
};

// === TODO 1: Register a partial for header ===
// Create a partial called 'header' that displays the page title.
//
// Usage in template: {{> header}}
// Output: "========== Dashboard AI =========="
//
// Tip: Handlebars.registerPartial('header', '========== {{title}} ==========')

// TODO: Register the 'header' partial here

// === TODO 2: Register a partial for notification ===
// Create a partial called 'notification' that displays each notification
// with a different icon based on the type:
//   success -> [OK]
//   warning -> [!!]
//   error   -> [XX]
//
// Usage: {{#each notifications}}{{> notification}}{{/each}}
// Output: "[OK] Model trained successfully"
//
// Tip: use {{#if}} inside the partial to check the type.
// Handlebars.registerPartial('notification', '{{#if ...}}...')

// TODO: Register the 'notification' partial here

// === TODO 3: Register a partial with specific context ===
// Create a partial called 'userCard' that displays user data.
// The partial receives the user object as context.
//
// Usage: {{> userCard user}}
// Output:
//   "[M] Maria"
//   "Role: admin"
//
// Tip: when you pass {{> userCard user}}, inside the partial
// 'this' refers to the user object. Use {{name}}, {{avatar}}, {{role}}.

// TODO: Register the 'userCard' partial here

// === TODO 4: Dynamic partial ===
// Dynamic partials allow choosing which partial to render at runtime.
// Use {{> (lookup . "partialType")}} to select the partial based on a property.
//
// Create two partials: 'viewAdmin' and 'viewUser'.
// - viewAdmin: "Admin Panel: {{metrics.models}} models | {{metrics.requests}} requests"
// - viewUser: "Welcome! Your models: {{metrics.models}}"
//
// In the template, use the partialType property to decide which to render.
//
// Tip: add partialType to the data:
//   const dataWithType = { ...page, partialType: 'viewAdmin' };

// TODO: Register the 'viewAdmin' and 'viewUser' partials here

// === TODO 5: Partial with parameters ===
// Partials can receive inline parameters using the syntax:
//   {{> partialName param1="value1" param2=variable}}
//
// Create a partial called 'metric' that displays a label and formatted value.
// Usage:
//   {{> metric label="Models" value=metrics.models}}
//   {{> metric label="Requests" value=metrics.requests}}
//   {{> metric label="Uptime" value=metrics.uptime}}
//
// Output:
//   "[ Models ]: 12"
//   "[ Requests ]: 45000"
//   "[ Uptime ]: 99.9%"
//
// Tip: inside the partial, the parameters are available as {{label}} and {{value}}.

// TODO: Register the 'metric' partial here

// === Main template that uses all partials ===
const pageTemplate = `
TODO: Create a template that combines all partials:
1. {{> header}} at the top
2. {{> userCard user}} for the user card
3. {{#each notifications}}{{> notification}}{{/each}} for notifications
4. {{> (lookup . "partialType")}} for the dynamic view
5. {{> metric label="..." value=...}} for each metric
`;

// === Compile and test ===

const dataWithType = { ...page, partialType: 'viewAdmin' };

console.log('=== Full Page (Admin) ===');
// TODO: compile pageTemplate with dataWithType and display

const dataUser = { ...page, partialType: 'viewUser', user: { name: 'Joao', avatar: 'J', role: 'user' } };

console.log('\n=== Full Page (User) ===');
// TODO: compile pageTemplate with dataUser and display

console.log('\n--- Exercise 16 complete! ---');
console.log('Tip: see the solution in solutions/ex16-partials-composicao.ts');
