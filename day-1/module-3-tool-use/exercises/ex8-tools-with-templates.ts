/**
 * Exercise 8: Tools with Result Templates
 *
 * Use templates to format tool results consistently
 * and readably before sending back to Claude.
 *
 * Difficulty: Intermediate
 * Estimated time: 20 minutes
 * Run: npx tsx exercises/ex8-tool-com-templates.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEPT ===
// Instead of returning raw JSON, we can use templates to format
// tool results. This helps Claude interpret the data
// and generate more natural responses.
//
// Templates are functions that receive data and return formatted text.

// === TODO 1: Create template functions ===
// Each template receives typed data and returns a formatted string.

// function templateUser(user: {
//   name: string;
//   email: string;
//   plan: string;
//   active: boolean;
//   createdAt: string;
// }): string {
//   return `
// === User Profile ===
// Name: ${user.name}
// Email: ${user.email}
// Plan: ${user.plan}
// Status: ${user.active ? 'Active' : 'Inactive'}
// Member since: ${user.createdAt}
//   `.trim();
// }

// function templateProductList(products: Array<{
//   name: string;
//   price: number;
//   stock: number;
// }>): string {
//   // Format as text table
//   // Include total items and total stock value
// }

// function templateReport(data: {
//   title: string;
//   period: string;
//   metrics: Record<string, number>;
//   notes: string[];
// }): string {
//   // Format as structured report
// }

// === TODO 2: Define the tools ===
// Tool 1: get_user — returns user data
// Tool 2: list_products — returns product list
// Tool 3: generate_monthly_report — returns metrics report

// const tools: Anthropic.Tool[] = [ ... ];

// === TODO 3: Implement handlers that use templates ===
// Each handler fetches data (simulated) and formats with the template.

// function handleGetUser(input: { email: string }): string {
//   const user = usersDB[input.email];
//   if (!user) return 'User not found';
//   return templateUser(user);
// }

// === TODO 4: Run the tool use loop ===
// Question: "Look up the profile for user joao@empresa.com and list the electronics products"

console.log('\n--- Exercise 8 complete! ---');
console.log('Hint: see the solution in solutions/ex8-tool-com-templates.ts');
