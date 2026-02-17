/**
 * Exercise 16: Prompt Routing
 *
 * Use Claude to classify message intent and route each one
 * to a specialized prompt. You already know prompt chaining (ex15) —
 * now you'll add conditional routing logic between steps.
 *
 * Difficulty: advanced | Estimated time: 20 min
 * Run: npx tsx exercises/ex16-prompt-routing.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Types ===

type Category = 'technical' | 'sales' | 'support' | 'general';

type Classification = {
  category: Category;
  confidence: number;
  justification: string;
};

type RoutingResult = {
  originalMessage: string;
  classification: Classification;
  specialistResponse: string;
  totalTokens: number;
};

// === Customer messages to classify and route ===
const customerMessages = [
  'My API is returning error 429, how do I fix the rate limiting?',
  'What plans do you offer for companies with more than 500 employees?',
  'I can\'t access my account since yesterday, I already tried resetting my password.',
  'Do you have Salesforce integration? I need to connect my CRM.',
  'I want to better understand how your AI works, can you explain?',
];

// === TODO 1: Create the router prompt ===
// The router should classify the message into one of 4 categories:
// - technical: implementation issues, bugs, errors, API
// - sales: pricing, plans, proposals, comparisons
// - support: access, account, password, usage issues
// - general: general questions, information, curiosity
//
// Return JSON: { "category": "...", "confidence": 0.0-1.0, "justification": "..." }

// function buildRouterPrompt(message: string): string { ... }

// === TODO 2: Create 4 specialized system prompts ===
// One for each category. Each specialist should:
// - Have their own tone and approach
// - technical: detailed, with code/config examples
// - sales: persuasive, focused on benefits
// - support: empathetic, with clear steps
// - general: informative, accessible

// const systemPrompts: Record<Category, string> = { ... };

// === TODO 3: For each message, classify and route ===
// 1. Call Claude with the router prompt to classify
// 2. Parse the classification JSON
// 3. Use the category to select the correct system prompt
// 4. Call Claude again with the specialized system prompt
// 5. Store the complete result

// async function classifyMessage(message: string): Promise<Classification> { ... }
// async function routeToSpecialist(message: string, category: Category): Promise<string> { ... }

// === TODO 4: Display the complete flow ===
// For each message, show:
// - Original message
// - Classification (category + confidence)
// - Specialist response
// At the end, display a summary: how many messages per category

// async function executeRouting() { ... }
// executeRouting();

console.log('\n--- Exercise 16 complete! ---');
console.log('Hint: see the solution in solutions/ex16-prompt-routing.ts');
