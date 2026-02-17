/**
 * Exercise 12: Dynamic Few-Shot
 * Difficulty: intermediate | Time: 20 min
 *
 * Dynamically select few-shot examples based on input similarity.
 * Reference: exercise 11 (fixed few-shot) — now examples are chosen by relevance.
 * Run: npx tsx exercises/ex12-few-shot-dinamico.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Bank of labeled examples (10+) ===
type Example = {
  text: string;
  category: string;
  keywords: string[]; // keywords for matching
};

const exampleBank: Example[] = [
  {
    text: 'My card was cloned and they made purchases without my authorization',
    category: 'fraud',
    keywords: ['card', 'cloned', 'purchases', 'authorization', 'fraud'],
  },
  {
    text: 'The banking app won\'t open since yesterday, it gives error 500',
    category: 'technical_issue',
    keywords: ['app', 'bank', 'error', 'open', 'bug'],
  },
  {
    text: 'I want to request a credit limit increase on my credit card',
    category: 'request',
    keywords: ['limit', 'card', 'credit', 'increase', 'request'],
  },
  {
    text: 'I was charged twice on the same credit card statement',
    category: 'billing',
    keywords: ['charged', 'statement', 'card', 'duplicate', 'billing'],
  },
  {
    text: 'How do I register my PIX key in the app?',
    category: 'question',
    keywords: ['register', 'pix', 'app', 'how', 'key'],
  },
  {
    text: 'I would like to close my checking account at this bank',
    category: 'cancellation',
    keywords: ['close', 'account', 'checking', 'terminate', 'bank'],
  },
  {
    text: 'I received a call asking for my password, is it really from the bank?',
    category: 'fraud',
    keywords: ['call', 'password', 'scam', 'bank', 'asking'],
  },
  {
    text: 'The transfer I made yesterday still hasn\'t arrived in the other account',
    category: 'technical_issue',
    keywords: ['transfer', 'arrived', 'account', 'pending', 'delay'],
  },
  {
    text: 'I want to switch my account plan to the premium package',
    category: 'request',
    keywords: ['switch', 'plan', 'account', 'premium', 'package'],
  },
  {
    text: 'They are charging a maintenance fee that didn\'t exist before',
    category: 'billing',
    keywords: ['fee', 'maintenance', 'charging', 'rate', 'before'],
  },
  {
    text: 'What are the business hours for the central branch?',
    category: 'question',
    keywords: ['hours', 'service', 'branch', 'open', 'central'],
  },
  {
    text: 'I want to cancel my credit card and all its features',
    category: 'cancellation',
    keywords: ['cancel', 'card', 'credit', 'terminate', 'features'],
  },
];

// === Test inputs ===
const testInputs = [
  'Someone used my card to buy things online without me knowing',
  'I can\'t log in to the banking app, it keeps loading',
  'I want to know how the card rewards program works',
  'I was charged an annual fee that was supposed to be waived',
  'I need to close my savings account urgently',
];

// === TODO 1: Create the example bank with categories ===
// Already provided above. Examine the structure and understand the `keywords` field.

// === TODO 2: Create selectExamples(input, bank, n) ===
// Select the N most relevant examples from the bank for the input.
// Strategy: count how many keywords from each example appear in the input.
// Sort by relevance (more keywords in common = more relevant).
// Return the top N.
//
// function selectExamples(input: string, bank: Example[], n: number): Example[] { ... }

// === TODO 3: Build the dynamic few-shot prompt ===
// Use selectExamples to choose 3 relevant examples.
// Build the prompt in the format:
//   Examples:
//   Text: "..." -> Category: fraud
//   Text: "..." -> Category: technical_issue
//   Text: "..." -> Category: billing
//
//   Text: "[input]" -> Category:
//
// function buildDynamicFewShotPrompt(input: string): string { ... }

// === TODO 4: Compare fixed few-shot vs dynamic ===
// Fixed few-shot: always uses the same first 3 examples from the bank.
// Dynamic few-shot: selects 3 examples by relevance.
// For each test input:
//   1. Classify with fixed few-shot
//   2. Classify with dynamic few-shot
//   3. Record which examples were selected
// Display comparison table and show which examples were chosen.

// for (const input of testInputs) {
//   const dynamicExamples = selectExamples(input, exampleBank, 3);
//   ...
// }

console.log('\n--- Exercise 12 complete! ---');
console.log('Hint: see the solution in solutions/ex12-few-shot-dinamico.ts');
