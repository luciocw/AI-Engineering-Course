/**
 * Solution - Exercise 16: Partials and Composition
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

// Solution TODO 1: Partial for header
Handlebars.registerPartial('header', '========== {{title}} ==========');

// Solution TODO 2: Partial for notification with icon by type
Handlebars.registerPartial(
  'notification',
  '{{#if (eq type "success")}}[OK]{{/if}}{{#if (eq type "warning")}}[!!]{{/if}}{{#if (eq type "error")}}[XX]{{/if}} {{message}}',
);

// Helper eq needed for the partials
Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);

// Solution TODO 3: Partial with specific context
Handlebars.registerPartial(
  'userCard',
  '[{{avatar}}] {{name}}\nRole: {{role}}',
);

// Solution TODO 4: Dynamic partials
Handlebars.registerPartial(
  'viewAdmin',
  'Admin Panel: {{metrics.models}} models | {{metrics.requests}} requests | Uptime: {{metrics.uptime}}',
);

Handlebars.registerPartial(
  'viewUser',
  'Welcome! Your models: {{metrics.models}}',
);

// Solution TODO 5: Partial with parameters
Handlebars.registerPartial(
  'metric',
  '[ {{label}} ]: {{value}}',
);

// Main template using all partials
const pageTemplate = `{{> header}}

--- User ---
{{> userCard user}}

--- Notifications ---
{{#each notifications}}
{{> notification}}
{{/each}}

--- View ---
{{> (lookup . "partialType")}}

--- Metrics ---
{{> metric label="Models" value=metrics.models}}
{{> metric label="Requests" value=metrics.requests}}
{{> metric label="Uptime" value=metrics.uptime}}`;

// Compile and test
const compiled = Handlebars.compile(pageTemplate);

const adminData = { ...page, partialType: 'viewAdmin' };
console.log('=== Full Page (Admin) ===');
console.log(compiled(adminData));

const userData = {
  ...page,
  partialType: 'viewUser',
  user: { name: 'Joao', avatar: 'J', role: 'user' },
};

console.log('\n=== Full Page (User) ===');
console.log(compiled(userData));

// Bonus: inline partial (defined in the template)
const templateWithInline = `{{#*inline "badge"}}[{{level}}]{{/inline}}
{{> badge level="PRO"}} {{user.name}} - {{title}}`;

const compiledInline = Handlebars.compile(templateWithInline);
console.log('\n=== Inline Partial ===');
console.log(compiledInline(page));
