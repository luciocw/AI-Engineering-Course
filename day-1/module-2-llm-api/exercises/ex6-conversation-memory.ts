/**
 * Exercise 6: Memory Management
 *
 * Learn how to handle long conversations by summarizing old messages
 * to maintain context without exceeding the token limit.
 * Run: npx tsx exercises/ex6-conversacao-memoria.ts
 *
 * Estimated time: 20 min
 * Difficulty: intermediate
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

type MessageParam = { role: 'user' | 'assistant'; content: string };

const systemPrompt =
  'You are a technical support assistant specialized in Linux servers. Be helpful and technical.';

// === Scenario: support conversation that grows over multiple turns ===
// Simulate a long conversation that needs memory management.

const simulatedConversation: string[] = [
  'My server is very slow, the load average is at 12 with 4 cores.',
  'I ran top and saw that the mysql process is using 85% of the CPU.',
  'MySQL is version 5.7, running on Ubuntu 20.04 with 16GB of RAM.',
  'There are about 200 active connections to MySQL right now.',
  'I already tried restarting MySQL but the problem comes back after 10 minutes.',
  'The slow query log shows queries with JOINs across 5 tables without indexes.',
];

// === TODO 1: Create a conversation with 5+ turns ===
// Use the simulatedConversation array to send messages one by one.
// Accumulate messages in the history array like a real conversation.
// Store the assistant's responses as well.

// const messages: MessageParam[] = [];

// === TODO 2: Implement token limit detection ===
// Define a CHARACTER_LIMIT (e.g., 1000 characters as a simple proxy).
// Before each call, check if the total history exceeds the limit.
// If it exceeds, call the summary function before continuing.
//
// Hint: use the sum of .content.length as a simple proxy for tokens.

// const CHARACTER_LIMIT = 1000;

// function countCharacters(msgs: MessageParam[]): number {
//   return msgs.reduce((total, m) => total + m.content.length, 0);
// }

// === TODO 3: Create the summarizeConversation function ===
// This function receives an array of messages and returns a summary.
// Call Claude asking to summarize the conversation so far.
// The summary should keep important technical information.

// async function summarizeConversation(msgs: MessageParam[]): Promise<string> {
//   // Build a prompt asking for a conversation summary
//   // Call the API
//   // Return the summary text
// }

// === TODO 4: Continue the conversation with summarized context ===
// When the limit is reached:
// 1. Summarize the old messages
// 2. Replace the history with a single message containing the summary
// 3. Continue adding new messages normally
// Display the history state before and after the summary.

console.log('\n--- Exercise 6 complete! ---');
console.log('Hint: see the solution in solutions/ex6-conversacao-memoria.ts');
