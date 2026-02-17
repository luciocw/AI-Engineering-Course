/**
 * Exercise 20: Templates for AI Prompts (Capstone)
 *
 * Apply everything you learned to create dynamic and reusable prompts.
 * This exercise connects Handlebars with AI Engineering - the foundation of Module 2.
 * Run: npx tsx exercises/ex20-prompt-ai.ts
 */

import Handlebars from 'handlebars';

// === Scenario: You are building a customer support system ===
// The system uses Claude API to answer questions.
// The prompts need to be dynamic based on context.

// === Context data ===
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

// === TODO 1: System Prompt template ===
// Create a system prompt that configures the AI behavior.
// Include: company, tone of voice, language, and rules.
//
// Example:
// "You are a support assistant for TechStore.
//  Respond in english with a professional and empathetic tone.
//  Rules: ..."

const systemPromptTemplate = `
TODO: Create the system prompt template
`;

// === TODO 2: User Prompt template with Few-Shot ===
// Include FAQ examples as "few-shot examples" in the prompt.
// Use {{#each faq}} to inject the examples.
//
// Format:
// "Customer context: [data]
//  Example responses:
//  Q: [FAQ question] -> A: [FAQ answer]
//  ...
//  Current question: [customer question]"

const userPromptTemplate = `
TODO: Create the user prompt template with few-shot examples
`;

// === TODO 3: Conditional template by plan type ===
// If the customer is premium, add a special instruction:
// "This is a premium customer (12 purchases). Prioritize service."
// If basic: "Basic customer. Suggest upgrade if appropriate."

const contextTemplate = `
TODO: Create conditional template based on plan
`;

// === TODO 4: Put it all together - Prompt Builder ===
// Create a function that receives data and returns the complete prompt.
// Use the 3 templates above.

type PromptContext = typeof context;

function buildPrompt(_context: PromptContext): { system: string; user: string } {
  // TODO: compile the templates and return the complete prompt
  return {
    system: 'TODO',
    user: 'TODO',
  };
}

// === Test ===
const prompt = buildPrompt(context);
console.log('=== SYSTEM PROMPT ===');
console.log(prompt.system);
console.log('\n=== USER PROMPT ===');
console.log(prompt.user);

// Test with basic customer
const basicContext = {
  ...context,
  customer: { name: 'Julia Lima', plan: 'basic', purchaseHistory: 1 },
  question: 'How much does the extended warranty cost?',
};

const basicPrompt = buildPrompt(basicContext);
console.log('\n=== BASIC CUSTOMER PROMPT ===');
console.log(basicPrompt.user);

console.log('\n--- Exercise 20 complete! ---');
console.log('Tip: see the solution in solutions/ex20-prompt-ai.ts');
