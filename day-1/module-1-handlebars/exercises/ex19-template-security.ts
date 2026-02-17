/**
 * Exercise 19: Sanitization and Security
 *
 * Learn to validate data BEFORE rendering templates using Zod.
 * You already master template inheritance (ex18). Now add security.
 * Patterns that will be reused in Module 3 (Tool Use) and Module 4 (Data Pipelines).
 * Run: npx tsx exercises/ex19-template-seguranca.ts
 */

import Handlebars from 'handlebars';
import { z } from 'zod';

// === Security in templates: validate data BEFORE rendering ===
// Templates receive data from various sources (APIs, users, databases).
// Rendering data without validation can cause XSS, layout breaking, or errors.
// Zod allows us to define type-safe validation schemas.

// === Safe data (valid) ===
const safeData = {
  name: 'Maria Silva',
  email: 'maria@example.com',
  bio: 'Developer with 5 years of experience in AI.',
  website: 'https://maria.dev',
};

// === Unsafe data (invalid or malicious) ===
const unsafeData = {
  name: '<script>alert("xss")</script>',
  email: 'invalid-no-at-sign',
  bio: '<img src=x onerror=alert("hack")>Normal text',
  website: 'javascript:alert(1)',
};

// === TODO 1: Create a Zod schema for profile validation ===
// The schema should validate:
// - name: string, minimum 2 characters, maximum 100
// - email: string in email format
// - bio: string, maximum 500 characters
// - website: string in URL format, must start with "https://"
//
// Tip:
// const profileSchema = z.object({
//   name: z.string().min(2).max(100),
//   email: z.string().email(),
//   bio: z.string().max(500),
//   website: z.string().url().startsWith('https://'),
// });

// TODO: Define the profileSchema here

// === TODO 2: Create the renderSafe function ===
// The function should:
// 1. Receive a Zod schema, a template string and data
// 2. Validate the data using the schema
// 3. If validation passes: compile and render the template
// 4. If validation fails: return the formatted error messages
//
// Suggested signature:
// function renderSafe<T>(
//   schema: z.ZodSchema<T>,
//   templateStr: string,
//   data: unknown,
// ): { success: boolean; result?: string; errors?: string[] }
//
// Tip: use schema.safeParse(data) for validation without throw.
// The return of safeParse has { success, data, error }.
// Use error.issues to access the error messages.

// TODO: Implement the renderSafe function here

// === TODO 3: Create a "sanitize" helper that removes HTML tags ===
// The helper should remove any HTML tag from a string.
// This is an extra layer of security beyond Handlebars' default escaping.
//
// Example: "<script>alert('xss')</script>Text" -> "alert('xss')Text"
//
// Tip: use regex /<[^>]*>/g to remove tags
// Handlebars.registerHelper('sanitize', function(text) {
//   return typeof text === 'string' ? text.replace(/<[^>]*>/g, '') : text;
// });

// TODO: Register the 'sanitize' helper here

// === User profile template ===
const profileTemplate = `=== User Profile ===
Name: {{name}}
Email: {{email}}
Bio: {{bio}}
Website: {{website}}`;

// === TODO 4: Test with safe and unsafe data ===
// Use the renderSafe function to:
// 1. Render safeData (should succeed)
// 2. Try to render unsafeData (should fail with errors)
//
// For each result, display:
// - If success: the rendered HTML
// - If failure: the list of validation errors

console.log('=== Test with SAFE data ===');
// TODO: render safeData and display the result

console.log('\n=== Test with UNSAFE data ===');
// TODO: render unsafeData and display the errors

// === TODO 5: "Safe Template" pattern ===
// Create a function that composes schema + template + helpers into a reusable unit.
//
// Suggested signature:
// function createSafeTemplate<T>(config: {
//   schema: z.ZodSchema<T>;
//   template: string;
//   helpers?: Record<string, (...args: any[]) => any>;
// }): (data: unknown) => { success: boolean; result?: string; errors?: string[] }
//
// Usage example:
// const renderProfile = createSafeTemplate({
//   schema: profileSchema,
//   template: profileTemplate,
//   helpers: { sanitize: (t) => t.replace(/<[^>]*>/g, '') },
// });
// const result = renderProfile(safeData);

// TODO: Implement createSafeTemplate here

console.log('\n=== Test with Safe Template Pattern ===');
// TODO: use createSafeTemplate to create and test a safe template

console.log('\n--- Exercise 19 complete! ---');
console.log('Tip: see the solution in solutions/ex19-template-seguranca.ts');
