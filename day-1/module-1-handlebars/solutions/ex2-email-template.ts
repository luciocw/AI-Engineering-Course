/**
 * Solution - Exercise 2: Email Template
 */

import Handlebars from 'handlebars';

// Helper for safe URL-encode (prevents parameter pollution)
Handlebars.registerHelper('urlEncode', (value: string) => encodeURIComponent(value));

const user = {
  name: 'Maria Silva',
  email: 'maria@exemplo.com',
  product: 'AI Engineering Course',
  price: 497,
};

// Solution TODO 1: Welcome email template
const emailTemplate = `Hello {{name}}!

Thank you for purchasing {{product}}.
Amount: R\${{price}}.
We will send details to {{email}}.`;

// Solution TODO 2: Compile and generate result
const compiled = Handlebars.compile(emailTemplate);
const result = compiled(user);

console.log('=== Welcome Email ===');
console.log(result);

// Solution TODO 3: Reminder template
const reminderTemplate = `{{name}}, your access to {{product}} expires in 7 days!

Renew now to continue learning.
Link: https://exemplo.com/renew?email={{urlEncode email}}`;

const compiledReminder = Handlebars.compile(reminderTemplate);
const reminderResult = compiledReminder(user);

console.log('\n=== Reminder Email ===');
console.log(reminderResult);

// Bonus: template with HTML
const htmlTemplate = `<div style="font-family: sans-serif;">
  <h1>Welcome, {{name}}!</h1>
  <p>Your product: <strong>{{product}}</strong></p>
  <p>Amount paid: <strong>R\${{price}}</strong></p>
  <a href="mailto:{{email}}">Contact</a>
</div>`;

const compiledHtml = Handlebars.compile(htmlTemplate);
console.log('\n=== HTML Email ===');
console.log(compiledHtml(user));
