/**
 * Exercise 10: Tools in Multi-Turn Conversations
 *
 * Use tools within a multi-turn conversation,
 * maintaining context and history between interactions.
 *
 * Difficulty: Intermediate
 * Estimated time: 20 minutes
 * Run: npx tsx exercises/ex10-tool-conversacao.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEPT ===
// In multi-turn conversations, Claude maintains context from previous messages.
// Tools can be called in any turn of the conversation.
// The complete history (including previous tool calls) is maintained in messages[].
// This allows Claude to ask follow-up questions using results
// from tools called in previous turns.

// === Simulated data - order system ===
const ordersDB: Record<string, {
  id: string;
  customer: string;
  items: Array<{ name: string; qty: number; price: number }>;
  status: string;
  date: string;
}> = {
  'ORD-001': {
    id: 'ORD-001', customer: 'Maria Silva',
    items: [{ name: 'Notebook', qty: 1, price: 4500 }, { name: 'Mouse', qty: 2, price: 89 }],
    status: 'shipped', date: '2026-02-10',
  },
  'ORD-002': {
    id: 'ORD-002', customer: 'Maria Silva',
    items: [{ name: 'Keyboard', qty: 1, price: 350 }],
    status: 'processing', date: '2026-02-15',
  },
  'ORD-003': {
    id: 'ORD-003', customer: 'Joao Santos',
    items: [{ name: 'Monitor', qty: 1, price: 2800 }],
    status: 'delivered', date: '2026-02-01',
  },
};

// === TODO 1: Define the order system tools ===
// Tool 1: search_orders — searches orders by customer or ID
// Tool 2: update_status — updates the status of an order
// Tool 3: calculate_total — calculates the total of an order with discount

// const tools: Anthropic.Tool[] = [ ... ];

// === TODO 2: Implement the handlers ===

// function handleSearchOrders(input: { customer?: string; id?: string }): string { ... }
// function handleUpdateStatus(input: { id: string; new_status: string }): string { ... }
// function handleCalculateTotal(input: { id: string; discount?: number }): string { ... }

// === TODO 3: Implement the multi-turn conversation ===
// Maintain the messages array between turns.
// Simulate a 3-turn conversation:
//
// Turn 1: "Search for Maria Silva's orders"
// Turn 2: "What is the total for order ORD-001 with a 10% discount?"
// Turn 3: "Update the status of ORD-002 to shipped"

// async function multiTurnConversation(): Promise<void> {
//   const messages: Anthropic.MessageParam[] = [];
//   const questions = [
//     'Search for Maria Silva\'s orders',
//     'What is the total for order ORD-001 with a 10% discount?',
//     'Update the status of ORD-002 to shipped',
//   ];
//
//   for (const question of questions) {
//     console.log(`\nUser: ${question}`);
//     messages.push({ role: 'user', content: question });
//
//     // Tool use loop for this turn
//     let continueLoop = true;
//     while (continueLoop) {
//       // Call the API, process tools, update messages...
//     }
//   }
// }

console.log('\n--- Exercise 10 complete! ---');
console.log('Hint: see the solution in solutions/ex10-tool-conversacao.ts');
