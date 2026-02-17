/**
 * Solution 1: Hello World with Claude API
 *
 * First call to the Claude API with response analysis.
 * Run: npx tsx solutions/ex1-hello-world.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const response = await client.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 300,
  messages: [
    { role: 'user', content: 'Explain what AI Engineering is in 2 sentences.' },
  ],
});

const text =
  response.content[0].type === 'text' ? response.content[0].text : '';

console.log('=== First call to Claude API ===');
console.log(`Model: ${response.model}`);
console.log(`Response: ${text}`);
console.log(
  `\nTokens: input=${response.usage.input_tokens}, output=${response.usage.output_tokens}`
);

// Estimated cost — Haiku 4.5: $0.25/M input, $1.25/M output
const costInput = (response.usage.input_tokens / 1_000_000) * 0.25;
const costOutput = (response.usage.output_tokens / 1_000_000) * 1.25;
const costTotal = costInput + costOutput;

console.log(`\nEstimated cost:`);
console.log(`  Input:  $${costInput.toFixed(6)}`);
console.log(`  Output: $${costOutput.toFixed(6)}`);
console.log(`  Total:  $${costTotal.toFixed(6)}`);

console.log('\n--- Exercise 1 complete! ---');
