/**
 * Exercise 5: Basic Conditionals
 *
 * Learn to use {{#if}}, {{else}} and {{#unless}} for conditional logic.
 * You already master variables and dot-notation (ex1-ex4). Now add logic.
 * Run: npx tsx exercises/ex5-condicionais.ts
 */

import Handlebars from 'handlebars';

// === User data with different plans ===
const users = [
  { name: 'Ana', plan: 'premium', active: true, credits: 100 },
  { name: 'Bruno', plan: 'basic', active: true, credits: 10 },
  { name: 'Carla', plan: 'premium', active: false, credits: 0 },
  { name: 'Diego', plan: '', active: false, credits: 0 },
];

// === TODO 1: Template with basic {{#if}} ===
// If the user has a plan, show "Plan: [plan]"
// If not, show "No active plan"
//
// Tip: {{#if plan}}...{{else}}...{{/if}}

const planTemplate = `
TODO: Create template with conditional for plan
`;

// === TODO 2: Template with multiple conditions ===
// 1. If premium AND active: "VIP access granted"
// 2. If premium but inactive: "Renew your premium plan"
// 3. If basic: "Upgrade to premium"
// 4. If no plan: "Subscribe now"
//
// Tip: Handlebars doesn't support && directly.
// Use nested {{#if}} or create a helper.

const accessTemplate = `
TODO: Create template with multiple conditions
`;

// === TODO 3: Template with {{#unless}} ===
// {{#unless}} is the inverse of {{#if}}
// If the user does NOT have credits, show an alert.
//
// Tip: {{#unless credits}}No credits!{{/unless}}

const creditsTemplate = `
TODO: Create template using unless
`;

// === Compile and test with all users ===
// For each user, compile the 3 templates and show the result.

for (const user of users) {
  console.log(`\n=== ${user.name} ===`);
  // TODO: compile and display each template
}

console.log('\n--- Exercise 5 complete! ---');
console.log('Tip: see the solution in solutions/ex5-condicionais.ts');
