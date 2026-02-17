/**
 * Exercise 17: Template Registry
 *
 * Create a TemplateRegistry class to manage Handlebars templates.
 * You already master partials and composition (ex16). Now encapsulate everything in a reusable pattern.
 * This pattern will be reused in Module 2 to manage AI prompts.
 * Run: npx tsx exercises/ex17-template-registry.ts
 */

import Handlebars from 'handlebars';

// === Template configuration type ===
type TemplateConfig = {
  name: string;
  template: string;
  description: string;
};

// === TODO 1: Create the TemplateRegistry class ===
// The class should have the following methods:
//
//   register(config: TemplateConfig): void
//     - Registers a template in the registry
//     - Compiles the template with Handlebars.compile()
//     - Stores the configuration and the compiled template
//
//   render(name: string, data: Record<string, unknown>): string
//     - Renders the template with the specified name using the data
//     - Throws an error if the template doesn't exist
//
//   list(): string[]
//     - Returns an array with the names of all registered templates
//
//   has(name: string): boolean
//     - Returns true if the template with the specified name exists
//
// Tip: use a Map<string, { config: TemplateConfig; compiled: HandlebarsTemplateDelegate }>
// to store the templates.

class TemplateRegistry {
  // TODO: implement the class
}

// === TODO 2: Register 3 templates ===
// Create an instance of the registry and register:
//
// 1. "welcome-email" - Welcome email template
//    Template: "Hello {{name}}! Welcome to {{company}}.
//              Your {{plan}} plan is active.
//              {{#if premium}}You have VIP access!{{/if}}"
//
// 2. "payment-notification" - Payment notification
//    Template: "Payment {{status}}: ${{amount}} on {{date}}.
//              {{#if installments}}Split into {{installments}}x{{/if}}"
//
// 3. "daily-report" - Daily report
//    Template: "Report {{date}}
//              New users: {{newUsers}}
//              Revenue: ${{revenue}}
//              {{#each highlights}}* {{this}}
//              {{/each}}"

const registry = new TemplateRegistry();

// TODO: register the 3 templates here

// === TODO 3: Add registerHelper to the registry ===
// Add a method that delegates to Handlebars.registerHelper():
//
//   registerHelper(name: string, fn: Handlebars.HelperDelegate): void
//
// Use this method to register a 'currency' helper that formats values.
//
// Tip: this.handlebars can be an isolated Handlebars instance
// (Handlebars.create()) to avoid polluting the global scope.
// Or simply delegate to Handlebars.registerHelper().

// TODO: add the registerHelper method and register the 'currency' helper

// === TODO 4: Add renderAll to the registry ===
// Add a method that renders all templates with the same data:
//
//   renderAll(data: Record<string, unknown>): Record<string, string>
//     - Returns an object with { templateName: renderedResult }
//
// Tip: iterate over all registered templates and render each one.

// TODO: add the renderAll method

// === TODO 5: Export the class ===
// At the end of the file, export the class for use in Module 2.
// export { TemplateRegistry };

// === Test ===

// Individual test
console.log('=== Registered Templates ===');
console.log('Templates:', registry.list());
console.log('');

// Render email
console.log('=== Welcome Email ===');
// TODO: use registry.render('welcome-email', { ... }) and display

// Render notification
console.log('\n=== Payment Notification ===');
// TODO: use registry.render('payment-notification', { ... }) and display

// Render report
console.log('\n=== Daily Report ===');
// TODO: use registry.render('daily-report', { ... }) and display

// Test renderAll
console.log('\n=== Render All ===');
// TODO: use registry.renderAll({ ... }) and display all results

// Error test
console.log('\n=== Error Test ===');
try {
  registry.render('nonexistent-template', {});
} catch (error) {
  console.log('Expected error:', (error as Error).message);
}

console.log('\n--- Exercise 17 complete! ---');
console.log('Tip: see the solution in solutions/ex17-template-registry.ts');
