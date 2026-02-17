/**
 * Solution 13: Chain-of-Thought Prompting
 *
 * Compare direct approach vs CoT vs structured CoT.
 * Reference: exercise 8 (JSON parsing) and exercise 11 (few-shot).
 * Run: npx tsx solutions/ex13-chain-of-thought.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

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
const CORRECT_ANSWER = 1372.75;

const scenarioData = `Company: ${scenario.company}
Base Plan: $${scenario.basePlan}/month
Users: ${scenario.users} at $${scenario.pricePerUser} each
Tier: ${scenario.tier} (+$${scenario.tierAdditional})
Addons: ${scenario.addons.map((a) => `${a.name} ($${a.price})`).join(', ')}
Annual discount: ${scenario.annualDiscount * 100}%
Loyalty discount: ${scenario.loyaltyDiscount * 100}%`;

function buildDirectPrompt(): string {
  return `Calculate the final monthly price for the following SaaS plan.
Respond ONLY with the numeric value (e.g., 1234.56).

${scenarioData}`;
}

function buildCoTPrompt(): string {
  return `Calculate the final monthly price for the following SaaS plan.
Think step by step. Show each calculation stage.
At the end, indicate the final value in the format: TOTAL: $X,XXX.XX

${scenarioData}`;
}

function buildStructuredCoTPrompt(): string {
  return `Calculate the final monthly price for the following SaaS plan.
Think step by step and return ONLY valid JSON in the format:
{
  "steps": [{ "description": "...", "value": 0 }],
  "finalPrice": 0,
  "confidence": "high|medium|low"
}

${scenarioData}`;
}

function extractPrice(text: string): number | null {
  // Try JSON parse first
  try {
    const json = JSON.parse(text);
    if (json.finalPrice) return Number(json.finalPrice);
    if (json.precoFinal) return Number(json.precoFinal);
  } catch {
    // Not JSON, try regex
  }

  // Match $1,372.75 or $1372.75 or 1372.75 or TOTAL: $1,372.75
  const patterns = [
    /TOTAL:\s*\$?\s*([\d.,]+)/gi,
    /\$\s*([\d.,]+)/g,
    /([\d]+[.,][\d]{2})\b/g,
  ];

  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      const last = matches[matches.length - 1][1];
      // Handle format: 1,372.75 -> 1372.75
      const normalized = last.replace(/,/g, '');
      return parseFloat(normalized);
    }
  }
  return null;
}

type Result = {
  approach: string;
  price: number | null;
  correct: boolean;
  tokens: { input: number; output: number };
  response: string;
};

const results: Result[] = [];

const approaches = [
  { name: 'Direct', prompt: buildDirectPrompt() },
  { name: 'CoT', prompt: buildCoTPrompt() },
  { name: 'CoT JSON', prompt: buildStructuredCoTPrompt() },
];

for (const approach of approaches) {
  console.log(`\n=== Approach: ${approach.name} ===`);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    temperature: 0,
    messages: [{ role: 'user', content: approach.prompt }],
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';
  const price = extractPrice(text);
  const correct = price !== null && Math.abs(price - CORRECT_ANSWER) < 0.01;

  console.log(text);

  results.push({
    approach: approach.name,
    price,
    correct,
    tokens: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
    response: text,
  });
}

// Comparative summary
console.log('\n=== Comparative Summary ===');
console.log(
  'Approach'.padEnd(12) +
    'Price'.padEnd(14) +
    'Correct?'.padEnd(10) +
    'Input'.padEnd(8) +
    'Output'
);
console.log('-'.repeat(55));

for (const r of results) {
  const priceStr = r.price !== null ? `$${r.price.toFixed(2)}` : 'N/A';
  console.log(
    r.approach.padEnd(12) +
      priceStr.padEnd(14) +
      (r.correct ? 'Yes' : 'No').padEnd(10) +
      String(r.tokens.input).padEnd(8) +
      String(r.tokens.output)
  );
}

console.log(`\nCorrect answer: $${CORRECT_ANSWER.toFixed(2)}`);

console.log('\n--- Exercise 13 complete! ---');
