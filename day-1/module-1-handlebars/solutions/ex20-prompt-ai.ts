/**
 * Solution - Exercise 20: Templates for AI Prompts (Capstone)
 */

import Handlebars from 'handlebars';

const context = {
  company: 'TechStore',
  product: 'SmartWatch X1',
  customer: {
    name: 'Pedro Costa',
    plan: 'premium',
    purchaseHistory: 12,
  },
  question: 'My watch is not syncing with the app',
  faq: [
    { question: 'How to sync?', answer: 'Open the app > Settings > Bluetooth > Sync' },
    { question: 'Reset device?', answer: 'Hold the side button for 10 seconds' },
  ],
  language: 'english',
  toneOfVoice: 'professional and empathetic',
};

// Comparison helper
Handlebars.registerHelper('eq', (a: string, b: string) => a === b);

// Solution TODO 1: System Prompt Template
const systemPromptTemplate = `You are a support assistant for {{company}}.
Always respond in {{language}} with a {{toneOfVoice}} tone.

Rules:
- Be concise and direct
- Offer practical solutions
- If you don't know the answer, escalate to human support
- Never make up information about the product
- Use numbered steps when applicable`;

// Solution TODO 2: User Prompt with Few-Shot
const userPromptTemplate = `Customer context:
- Name: {{customer.name}}
- Plan: {{customer.plan}}
- History: {{customer.purchaseHistory}} purchases
- Product: {{product}}

{{#if faq.length}}
Examples of previous questions and answers:
{{#each faq}}
Q: {{this.question}}
A: {{this.answer}}
{{/each}}
{{/if}}

{{#if (eq customer.plan "premium")}}
NOTE: This is a premium customer ({{customer.purchaseHistory}} purchases). Prioritize support and offer advanced solutions.
{{else}}
NOTE: Basic plan customer. Suggest upgrade to premium if appropriate.
{{/if}}

Customer question: {{question}}

Respond clearly and objectively:`;

// Solution TODO 4: Prompt Builder
type PromptContext = typeof context;

function buildPrompt(ctx: PromptContext): { system: string; user: string } {
  const compiledSystem = Handlebars.compile(systemPromptTemplate);
  const compiledUser = Handlebars.compile(userPromptTemplate);

  return {
    system: compiledSystem(ctx),
    user: compiledUser(ctx),
  };
}

// Test with premium customer
const prompt = buildPrompt(context);
console.log('=== SYSTEM PROMPT ===');
console.log(prompt.system);
console.log('\n=== USER PROMPT (Premium) ===');
console.log(prompt.user);

// Test with basic customer
const basicContext: PromptContext = {
  ...context,
  customer: { name: 'Julia Lima', plan: 'basic', purchaseHistory: 1 },
  question: 'How much does the extended warranty cost?',
};

const basicPrompt = buildPrompt(basicContext);
console.log('\n=== USER PROMPT (Basic) ===');
console.log(basicPrompt.user);

// Demonstration: how this would be used with Claude API
console.log('\n=== How to use with Claude API ===');
console.log(`
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();
const response = await client.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 500,
  system: prompt.system,
  messages: [{ role: 'user', content: prompt.user }],
});
`);
