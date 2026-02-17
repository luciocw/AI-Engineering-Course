/**
 * Solution 12: Dynamic Few-Shot
 * Difficulty: intermediate | Time: 20 min
 *
 * Dynamically select few-shot examples based on input similarity.
 * Reference: exercise 11 (fixed few-shot) — now examples are chosen by relevance.
 * Run: npx tsx solutions/ex12-few-shot-dinamico.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Bank of labeled examples ===
type Example = {
  text: string;
  category: string;
  keywords: string[];
};

const exampleBank: Example[] = [
  {
    text: 'My card was cloned and purchases were made without my authorization',
    category: 'fraud',
    keywords: ['card', 'cloned', 'purchases', 'authorization', 'fraud'],
  },
  {
    text: 'The banking app has not opened since yesterday, gives error 500',
    category: 'technical_issue',
    keywords: ['app', 'bank', 'error', 'open', 'bug'],
  },
  {
    text: 'I want to request an increase in my credit card limit',
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
    text: 'I would like to cancel my checking account at this bank',
    category: 'cancellation',
    keywords: ['cancel', 'account', 'checking', 'close', 'bank'],
  },
  {
    text: 'I received a call asking for my password, is it really from the bank?',
    category: 'fraud',
    keywords: ['call', 'password', 'scam', 'bank', 'asking'],
  },
  {
    text: 'The transfer I made yesterday still has not arrived in the other account',
    category: 'technical_issue',
    keywords: ['transfer', 'arrived', 'account', 'pending', 'delay'],
  },
  {
    text: 'I want to switch my account plan to the premium package',
    category: 'request',
    keywords: ['switch', 'plan', 'account', 'premium', 'package'],
  },
  {
    text: 'They are charging a maintenance fee that did not exist before',
    category: 'billing',
    keywords: ['fee', 'maintenance', 'charging', 'rate', 'before'],
  },
  {
    text: 'What are the business hours for the main branch?',
    category: 'question',
    keywords: ['hours', 'service', 'branch', 'operates', 'main'],
  },
  {
    text: 'I want to close my credit card and all its features',
    category: 'cancellation',
    keywords: ['close', 'card', 'credit', 'cancel', 'features'],
  },
];

// === Test inputs ===
const testInputs = [
  'Someone used my card to buy things online without me knowing',
  'I cannot log into the banking app, it keeps loading',
  'I want to know how the card rewards program works',
  'They charged me an annual fee that was supposed to be waived',
  'I need to close my savings account urgently',
];

// Solution TODO 2: Dynamic example selection by relevance
function selectExamples(
  input: string,
  bank: Example[],
  n: number
): Example[] {
  const inputLower = input.toLowerCase();
  const inputWords = inputLower.split(/\s+/);

  const scored = bank.map((example) => {
    let score = 0;
    for (const keyword of example.keywords) {
      // Check if keyword appears in input (partial match)
      if (inputLower.includes(keyword.toLowerCase())) {
        score += 2; // direct text match
      }
      // Check match by individual word
      for (const word of inputWords) {
        if (word.length > 3 && keyword.toLowerCase().includes(word)) {
          score += 1;
        }
      }
    }
    return { example, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((s) => s.example);
}

// Solution TODO 3: Dynamic few-shot prompt
function buildDynamicFewShotPrompt(
  input: string,
  examples: Example[]
): string {
  const formattedExamples = examples
    .map((e) => `Text: "${e.text}" -> Category: ${e.category}`)
    .join('\n');

  return `Classify the text into one of these categories: fraud, technical_issue, request, billing, question, cancellation.
Respond ONLY with the category name.

${formattedExamples}

Text: "${input}" -> Category:`;
}

// Fixed few-shot: always the same first 3
function buildFixedFewShotPrompt(input: string): string {
  const fixedExamples = exampleBank.slice(0, 3);
  const formattedExamples = fixedExamples
    .map((e) => `Text: "${e.text}" -> Category: ${e.category}`)
    .join('\n');

  return `Classify the text into one of these categories: fraud, technical_issue, request, billing, question, cancellation.
Respond ONLY with the category name.

${formattedExamples}

Text: "${input}" -> Category:`;
}

async function classify(prompt: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 20,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
  });
  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';
  return text.trim().toLowerCase();
}

// Solution TODO 4: Comparison of fixed vs dynamic few-shot
type Result = {
  input: string;
  fixed: string;
  dynamic: string;
  selectedExamples: string[];
};

const results: Result[] = [];

console.log('=== Classification: Fixed vs Dynamic Few-Shot ===\n');

for (const input of testInputs) {
  console.log(`Input: "${input.slice(0, 55)}..."`);

  // Select dynamic examples
  const dynamicExamples = selectExamples(input, exampleBank, 3);

  console.log(
    `  Selected examples: ${dynamicExamples.map((e) => e.category).join(', ')}`
  );

  // Classify with both approaches
  const fixed = await classify(buildFixedFewShotPrompt(input));
  const dynamic = await classify(
    buildDynamicFewShotPrompt(input, dynamicExamples)
  );

  results.push({
    input,
    fixed,
    dynamic,
    selectedExamples: dynamicExamples.map((e) => e.category),
  });

  console.log(`  Fixed: ${fixed} | Dynamic: ${dynamic}\n`);
}

// Comparison table
console.log('=== Comparison Table ===\n');
console.log(
  'Input'.padEnd(40) +
    'Fixed'.padEnd(18) +
    'Dynamic'.padEnd(18) +
    'Examples Used'
);
console.log('-'.repeat(95));

for (const r of results) {
  const inputTrunc =
    r.input.length > 37 ? r.input.slice(0, 37) + '...' : r.input;
  const match = r.fixed === r.dynamic ? '' : ' *';
  console.log(
    inputTrunc.padEnd(40) +
      (r.fixed + match).padEnd(18) +
      r.dynamic.padEnd(18) +
      r.selectedExamples.join(', ')
  );
}

const divergences = results.filter((r) => r.fixed !== r.dynamic).length;
console.log(`\nDivergences: ${divergences}/${results.length}`);
console.log('(* indicates divergence between fixed and dynamic)');

console.log('\n--- Exercise 12 complete! ---');
