/**
 * Exercise 2: Comparing Models
 *
 * Compare Haiku vs Sonnet: same question, different models.
 * Analyze quality, tokens, and cost for each model.
 * Run: npx tsx exercises/ex2-modelos-comparacao.ts
 *
 * Estimated time: 15 min
 * Difficulty: beginner
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Scenario: translate a product description from Portuguese to English ===
const productDescription = `
Premium Tech Wear T-Shirt - Made with smart fabric that regulates body temperature.
Features UV50+ protection, is stain-resistant, and has ultra-fast drying.
Ideal for tech professionals who value comfort and practicality in daily life.
Available in 5 colors. Sizes S to XL.
`;

const translationPrompt = `Translate the following product description from English to professional French, maintaining the marketing tone:\n\n${productDescription}`;

// === TODO 1: Call the Haiku model with the translation prompt ===
// Use model: 'claude-haiku-4-5-20251001'
// max_tokens: 500
// Capture: response text, input_tokens, output_tokens

// const responseHaiku = await client.messages.create({ ... });

// === TODO 2: Call the Sonnet model with the same prompt ===
// Use model: 'claude-sonnet-4-5-20250929'
// max_tokens: 500
// Capture: response text, input_tokens, output_tokens

// const responseSonnet = await client.messages.create({ ... });

// === TODO 3: Calculate the cost for each model ===
// Haiku 4.5: $0.25 per 1M input tokens, $1.25 per 1M output tokens
// Sonnet 4.5: $3.00 per 1M input tokens, $15.00 per 1M output tokens
//
// Formula: (tokens / 1_000_000) * price_per_million

// const costHaiku = ...
// const costSonnet = ...

// === TODO 4: Display a formatted comparison table ===
// Show for each model:
// - Model name
// - Translation text
// - Tokens (input + output)
// - Estimated cost
// - Cost difference between the two

// console.log('=== Comparison: Haiku vs Sonnet ===');
// console.log('...');

console.log('\n--- Exercise 2 complete! ---');
console.log('Hint: see the solution in solutions/ex2-modelos-comparacao.ts');
