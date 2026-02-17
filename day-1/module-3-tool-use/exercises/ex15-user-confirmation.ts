/**
 * Exercise 15: User Confirmation Before Executing
 *
 * Implement a flow where certain tools ask for user confirmation
 * before being executed (human-in-the-loop).
 *
 * Difficulty: Advanced
 * Estimated time: 20 minutes
 * Run: npx tsx exercises/ex15-tool-confirmacao.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEPT ===
// Not every tool should be executed automatically.
// Destructive or irreversible actions should ask for confirmation.
// We implement this by classifying tools as "safe" and "sensitive".
// Sensitive tools return a confirmation request instead of the result.

// === TODO 1: Classify tools by risk level ===
// Safe: queries, reads (execute automatically)
// Sensitive: writes, deletes, sends (ask for confirmation)

// type ToolRisk = 'safe' | 'sensitive';
// const toolRisks: Record<string, ToolRisk> = {
//   list_files: 'safe',
//   read_file: 'safe',
//   delete_file: 'sensitive',
//   send_email: 'sensitive',
//   rename_file: 'sensitive',
// };

// === TODO 2: Define the tools ===

// const tools: Anthropic.Tool[] = [
//   { name: 'list_files', description: '...', input_schema: { ... } },
//   { name: 'read_file', description: '...', input_schema: { ... } },
//   { name: 'delete_file', description: '...', input_schema: { ... } },
//   { name: 'send_email', description: '...', input_schema: { ... } },
//   { name: 'rename_file', description: '...', input_schema: { ... } },
// ];

// === TODO 3: Implement the confirmation flow ===
// For sensitive tools:
// 1. Don't execute the handler
// 2. Return a message asking for confirmation
// 3. Claude informs the user what will be done
// 4. In the next turn, the user confirms or cancels
// 5. If confirmed, execute the tool

// function processToolCall(
//   name: string,
//   input: Record<string, unknown>,
//   confirmed: boolean
// ): { result: string; requiresConfirmation: boolean } {
//   const risk = toolRisks[name] || 'sensitive';
//
//   if (risk === 'sensitive' && !confirmed) {
//     return {
//       result: `CONFIRMATION REQUIRED: The action "${name}" requires your confirmation.`,
//       requiresConfirmation: true,
//     };
//   }
//
//   // Execute the handler normally
//   return { result: dispatchTool(name, input), requiresConfirmation: false };
// }

// === TODO 4: Implement the loop with confirmation ===
// Simulate confirmation automatically for testing.

console.log('\n--- Exercise 15 complete! ---');
console.log('Hint: see the solution in solutions/ex15-tool-confirmacao.ts');
