/**
 * Solution - Exercise 5: Basic Conditionals
 */

import Handlebars from 'handlebars';

const users = [
  { name: 'Ana', plan: 'premium', active: true, credits: 100 },
  { name: 'Bruno', plan: 'basic', active: true, credits: 10 },
  { name: 'Carla', plan: 'premium', active: false, credits: 0 },
  { name: 'Diego', plan: '', active: false, credits: 0 },
];

// Solution TODO 1: Basic {{#if}}
const planTemplate = `{{#if plan}}Plan: {{plan}}{{else}}No active plan{{/if}}`;

// Solution TODO 2: Multiple conditions
// Handlebars doesn't have native &&, so we use helpers or nested ifs.

// Helper for equality comparison (type-safe)
Handlebars.registerHelper('eq', (a: unknown, b: unknown) => {
  if (typeof a !== typeof b) return false;
  return a === b;
});

const accessTemplate = `{{#if active}}{{#if (eq plan "premium")}}VIP access granted{{else}}Basic plan active{{/if}}{{else}}{{#if (eq plan "premium")}}Renew your premium plan{{else}}{{#if plan}}Your {{plan}} plan is inactive{{else}}Subscribe now{{/if}}{{/if}}{{/if}}`;

// Solution TODO 3: {{#unless}}
const creditsTemplate = `{{#unless credits}}Alert: you have no credits! Recharge now.{{else}}Available credits: {{credits}}{{/unless}}`;

// Compile and test with all users
const compiledPlan = Handlebars.compile(planTemplate);
const compiledAccess = Handlebars.compile(accessTemplate);
const compiledCredits = Handlebars.compile(creditsTemplate);

for (const user of users) {
  console.log(`\n=== ${user.name} ===`);
  console.log(`  Plan: ${compiledPlan(user)}`);
  console.log(`  Access: ${compiledAccess(user)}`);
  console.log(`  Credits: ${compiledCredits(user)}`);
}
