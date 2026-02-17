/**
 * Exercise 7: API Parameters (temperature, max_tokens, stop_sequences)
 *
 * Experiment with how parameters affect Claude's responses.
 * Run: npx tsx exercises/ex7-parametros.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === TODO 1: Test different temperatures ===
// Send the creative prompt "Write a slogan for an AI startup"
// with temperatures: 0.0, 0.3, 0.5, 0.8, 1.0
//
// Observe: temp=0 produces deterministic results,
// temp=1 produces more creative results.

const TEMPERATURES = [0.0, 0.3, 0.5, 0.8, 1.0];
const creativePrompt = 'Write a short slogan for an AI startup.';

// for (const temp of TEMPERATURES) {
//   const response = await client.messages.create({
//     model: 'claude-haiku-4-5-20251001',
//     max_tokens: 50,
//     temperature: temp,
//     messages: [{ role: 'user', content: creativePrompt }],
//   });
//   console.log(`temp=${temp}: ${response.content[0].text}`);
// }

// === TODO 2: Test max_tokens as a limiter ===
// Send a factual question with max_tokens: 10, 50, 200
// Observe how the response gets cut off.

// === TODO 3: Test stop_sequences ===
// Ask Claude to list 5 numbered items.
// Use stop_sequences: ['3.'] to cut off after item 2.
//
// Hint: stop_sequences is an array of strings.
// When Claude generates any of them, it stops.

// === TODO 4: Compare cost of Haiku vs Sonnet ===
// Send the same question to both models.
// Calculate and compare: tokens used and estimated cost.
// Haiku: $0.25/$1.25 per M tokens (input/output)
// Sonnet: $3/$15 per M tokens (input/output)

console.log('\n--- Exercise 7 complete! ---');
console.log('Hint: see the solution in solutions/ex7-parametros.ts');
