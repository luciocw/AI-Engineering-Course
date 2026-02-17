/**
 * Solution 7: API Parameters
 *
 * Experiment with temperature, max_tokens, stop_sequences and compare models.
 * Run: npx tsx solutions/ex7-parametros.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Test 1: Temperatures ===
console.log('=== Test 1: Temperatures ===');
const TEMPERATURES = [0.0, 0.3, 0.5, 0.8, 1.0];
const creativePrompt = 'Write a short slogan for an AI startup.';

for (const temp of TEMPERATURES) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 50,
    temperature: temp,
    messages: [{ role: 'user', content: creativePrompt }],
  });
  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';
  console.log(`temp=${temp}: ${text}`);
}

// === Test 2: max_tokens as limiter ===
console.log('\n=== Test 2: max_tokens ===');
const MAX_TOKENS = [10, 50, 200];
const factualQuestion = 'What is machine learning?';

for (const maxTk of MAX_TOKENS) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTk,
    messages: [{ role: 'user', content: factualQuestion }],
  });
  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';
  console.log(`max_tokens=${maxTk} (stop=${response.stop_reason}):`);
  console.log(`  "${text.slice(0, 100)}${text.length > 100 ? '...' : ''}"`);
}

// === Test 3: stop_sequences ===
console.log('\n=== Test 3: stop_sequences ===');
const response3 = await client.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 200,
  stop_sequences: ['3.'],
  messages: [
    { role: 'user', content: 'List 5 popular programming languages, numbered from 1 to 5.' },
  ],
});
const text3 =
  response3.content[0].type === 'text' ? response3.content[0].text : '';
console.log(`stop_sequences=['3.'] (stop=${response3.stop_reason}):`);
console.log(`  ${text3}`);
console.log('  -> Stopped before item 3!');

// === Test 4: Haiku vs Sonnet (cost) ===
console.log('\n=== Test 4: Haiku vs Sonnet ===');
const comparisonQuestion = 'Explain the concept of embeddings in 3 sentences.';

const models = [
  {
    id: 'claude-haiku-4-5-20251001' as const,
    name: 'Haiku 4.5',
    inputCost: 0.25,
    outputCost: 1.25,
  },
  {
    id: 'claude-sonnet-4-5-20250929' as const,
    name: 'Sonnet 4.5',
    inputCost: 3,
    outputCost: 15,
  },
];

for (const model of models) {
  const response = await client.messages.create({
    model: model.id,
    max_tokens: 200,
    messages: [{ role: 'user', content: comparisonQuestion }],
  });
  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';
  const costInput =
    (response.usage.input_tokens / 1_000_000) * model.inputCost;
  const costOutput =
    (response.usage.output_tokens / 1_000_000) * model.outputCost;

  console.log(`\n${model.name}:`);
  console.log(`  Response: ${text.slice(0, 120)}...`);
  console.log(
    `  Tokens: input=${response.usage.input_tokens}, output=${response.usage.output_tokens}`
  );
  console.log(`  Cost: $${(costInput + costOutput).toFixed(6)}`);
}

console.log('\n--- Exercise 7 complete! ---');
