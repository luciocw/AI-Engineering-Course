/**
 * Exercise 9: Handlebars + Claude API Integration
 *
 * Connect Module 1 (templates) with Module 2 (API).
 * Create dynamic and reusable prompts.
 * Reference: exercises 1-4 (basic API) + M1 (Handlebars).
 * Run: npx tsx exercises/ex9-handlebars-integration.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import Handlebars from 'handlebars';

const client = new Anthropic();

// === Scenario: generate product descriptions for e-commerce ===
const products = [
  {
    name: 'AI Analytics Pro',
    features: ['Real-time dashboard', 'Smart alerts', 'Slack integration'],
    targetAudience: 'product managers at startups',
    tone: 'professional and enthusiastic',
    length: 50,
  },
  {
    name: 'SmartSit Ergonomic Chair',
    features: ['Automatic lumbar adjustment', 'Posture sensors', 'Companion app'],
    targetAudience: 'developers who work 8+ hours seated',
    tone: 'casual and fun',
    length: 60,
  },
];

// === TODO 1: Create a system prompt template with Handlebars ===
// Variables: {{tone}}, {{length}}
// Example: "You are a copywriter. Write in a {{tone}} tone. Maximum {{length}} words."

// const systemTemplate = '...';

// === TODO 2: Create a user prompt template with Handlebars ===
// Variables: {{name}}, {{#each features}}, {{targetAudience}}
// The template should inject features as a list.

// const userTemplate = '...';

// === TODO 3: Implement generateWithTemplate() ===
// Receives: systemTemplate, userTemplate, data
// 1. Compile the templates with Handlebars
// 2. Render with the data
// 3. Call the Claude API
// 4. Return the text

// async function generateWithTemplate(
//   systemTmpl: string,
//   userTmpl: string,
//   data: Record<string, unknown>
// ): Promise<string> { ... }

// === TODO 4: Test with the 2 products ===
// Show: rendered template + Claude's response

// for (const product of products) {
//   console.log(`\n=== ${product.name} ===`);
//   const result = await generateWithTemplate(systemTemplate, userTemplate, product);
//   console.log(result);
// }

console.log('\n--- Exercise 9 complete! ---');
console.log('Hint: see the solution in solutions/ex9-handlebars-integration.ts');
