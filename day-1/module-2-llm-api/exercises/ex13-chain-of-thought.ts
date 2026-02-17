/**
 * Exercise 13: Chain-of-Thought Prompting
 *
 * Compare direct approach vs CoT vs structured CoT in complex calculations.
 * Reference: exercise 8 (JSON parsing) and exercise 11 (few-shot).
 * Run: npx tsx exercises/ex13-chain-of-thought.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Scenario: complex SaaS pricing calculation ===
const scenario = {
  company: 'TechCorp',
  basePlan: 500,
  users: 25,
  pricePerUser: 30,
  tier: 'Premium',
  tierAdditional: 200,
  addons: [
    { name: 'Analytics', price: 100 },
    { name: 'API Access', price: 150 },
  ],
  annualDiscount: 0.15,
  loyaltyDiscount: 0.05,
};

// Correct answer: $1,372.75
// Base(500) + Users(750) + Tier(200) + Analytics(100) + API(150) = 1700
// Annual: 1700 * 0.85 = 1445
// Loyalty: 1445 * 0.95 = 1372.75

// === TODO 1: Direct prompt ===
// Just ask: "Calculate the final monthly price."
// Include all scenario data in the prompt.

// function buildDirectPrompt(): string { ... }

// === TODO 2: Chain-of-Thought prompt ===
// Add: "Think step by step. Show each calculation step."
// Same data, but with instruction to reason.

// function buildCoTPrompt(): string { ... }

// === TODO 3: Structured CoT prompt ===
// Request response in JSON:
// {
//   "steps": [{ "description": "...", "value": 0 }],
//   "finalPrice": 0,
//   "confidence": "high|medium|low"
// }

// function buildStructuredCoTPrompt(): string { ... }

// === TODO 4: Execute the 3 approaches and compare ===
// For each one:
// 1. Call the API
// 2. Display the response
// 3. Compare with the correct value ($1,372.75)

// === TODO 5: Display comparison summary ===
// Approach | Calculated Price | Correct? | Tokens
// Direct   | $...             | Yes/No   | XX
// CoT      | $...             | Yes/No   | XX
// CoT JSON | $...             | Yes/No   | XX

console.log('\n--- Exercise 13 complete! ---');
console.log('Hint: see the solution in solutions/ex13-chain-of-thought.ts');
