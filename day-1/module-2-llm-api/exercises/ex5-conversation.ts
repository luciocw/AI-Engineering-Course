/**
 * Exercise 5: Multi-Turn Conversation
 *
 * Build a multi-turn conversation where Claude maintains context.
 * Run: npx tsx exercises/ex5-conversacao.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Scenario: technical support for a SmartWatch ===
const systemPrompt = 'You are a technical support assistant for TechStore. Be helpful and ask follow-up questions when necessary.';

// === TODO 1: Start the conversation with the first message ===
// Create a messages array with the first user message:
// "My SmartWatch X1 stopped syncing after the update"
//
// type MessageParam = { role: 'user' | 'assistant'; content: string };

// const messages: MessageParam[] = [
//   { role: 'user', content: '...' },
// ];

// === TODO 2: Make the first call and capture the response ===
// Send messages to the API.
// Add Claude's response to the array as role: 'assistant'.
// Display the response.

// === TODO 3: Add second user message ===
// The user responds: "I already tried restarting bluetooth, but it didn't work"
// Add to the array and make a new call.

// === TODO 4: Display the full conversation with token count ===
// For each turn, show:
// - Who spoke (USER or ASSISTANT)
// - The text
// - Tokens used in that call

console.log('\n--- Exercise 5 complete! ---');
console.log('Hint: see the solution in solutions/ex5-conversacao.ts');
