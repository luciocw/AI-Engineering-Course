/**
 * Exercise 1: Hello World with Claude API
 *
 * Make your first call to the Claude API and understand the response structure.
 * Run: npx tsx exercises/ex1-hello-world.ts
 *
 * Prerequisite: ANTHROPIC_API_KEY in .env
 */

import Anthropic from '@anthropic-ai/sdk';

// === TODO 1: Create the Anthropic client ===
// The SDK automatically reads the ANTHROPIC_API_KEY env var.
// Just instantiate: new Anthropic()

// const client = ...

// === TODO 2: Make a call to the API ===
// Use client.messages.create() with:
// - model: 'claude-haiku-4-5-20251001' (fast and cheap for exercises)
// - max_tokens: 300
// - messages: array with one user message
//
// Question: "Explain what AI Engineering is in 2 sentences."

// const response = await client.messages.create({ ... });

// === TODO 3: Extract and display the result ===
// The response has this structure:
// response.content[0].text -> response text
// response.model -> model used
// response.usage.input_tokens -> input tokens
// response.usage.output_tokens -> output tokens
//
// Display everything formatted in the console.

// console.log('=== First call to Claude API ===');
// console.log(`Model: ${response.model}`);
// console.log(`Response: ${response.content[0].text}`);
// console.log(`\nTokens: input=${response.usage.input_tokens}, output=${response.usage.output_tokens}`);

// === TODO 4: Calculate the estimated cost ===
// Haiku 4.5: $0.25/M input tokens, $1.25/M output tokens
// Do the math and display it.

console.log('\n--- Exercise 1 complete! ---');
console.log('Hint: see the solution in solutions/ex1-hello-world.ts');
