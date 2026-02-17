/**
 * Exercise 13: Prompt Engineering for Tool Use
 *
 * Use system prompts and instructions to control HOW and WHEN
 * Claude uses the available tools.
 *
 * Difficulty: Advanced
 * Estimated time: 20 minutes
 * Run: npx tsx exercises/ex13-tool-prompt-engineering.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEPT ===
// The system prompt can guide tool use behavior:
// 1. Define WHEN to use tools (vs respond directly)
// 2. Establish ORDER of preference between tools
// 3. Instruct about COMBINING tools
// 4. Ask for CONFIRMATION before executing certain tools
// 5. Use tool_choice to force or disable tools

// === TODO 1: Create tools for a financial assistant ===
// Tool 1: check_balance — returns account balance
// Tool 2: get_statement — returns recent transactions
// Tool 3: make_transfer — transfers money (sensitive!)
// Tool 4: check_investments — returns investment portfolio

// const tools: Anthropic.Tool[] = [ ... ];

// === TODO 2: Write a system prompt that controls tool usage ===
// The prompt should:
// - Define the assistant's persona (financial analyst)
// - Instruct to ALWAYS check balance before transferring
// - NEVER transfer without confirming with the user first
// - Prefer using query tools before giving advice
// - Format values in dollars ($)

// const systemPrompt = `You are a professional financial assistant...`;

// === TODO 3: Test with tool_choice ===
// tool_choice can be:
// - { type: 'auto' } — Claude decides (default)
// - { type: 'any' } — Claude MUST use some tool
// - { type: 'tool', name: 'check_balance' } — Forces a specific tool

// Test the same question with different tool_choice:
// Question: "Is my balance good enough to invest?"
// With 'auto': Claude may respond without a tool
// With 'any': Claude MUST use some tool
// With specific tool: Forces check_balance

// === TODO 4: Compare results ===
// async function testWithToolChoice(
//   question: string,
//   toolChoice: Anthropic.MessageCreateParams['tool_choice']
// ): Promise<void> {
//   // Run the question with the specified tool_choice
//   // Print which tool was chosen (or if it responded without a tool)
// }

console.log('\n--- Exercise 13 complete! ---');
console.log('Hint: see the solution in solutions/ex13-tool-prompt-engineering.ts');
