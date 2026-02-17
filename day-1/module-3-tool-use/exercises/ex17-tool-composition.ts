/**
 * Exercise 17: Tool Composition
 *
 * Create high-level tools that internally compose smaller operations.
 * A single tool call from Claude can trigger multiple operations.
 *
 * Difficulty: Expert
 * Estimated time: 25 minutes
 * Run: npx tsx exercises/ex17-tool-composicao.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEPT ===
// Tool composition = combining primitive operations into complex operations.
// Instead of Claude needing to call 5 tools in sequence,
// we offer 1 composed tool that does everything internally.
//
// Advantages:
// - Fewer loop iterations (less cost)
// - Atomic operations (all or nothing)
// - Less chance of sequence errors
//
// Example: "create_complete_order" = validate stock + calculate shipping +
//          apply discount + create order + send confirmation

// === TODO 1: Define primitive operations (internal functions) ===

// function validateStock(product: string, quantity: number): { ok: boolean; msg: string } { ... }
// function calculateShipping(city: string): number { ... }
// function applyDiscount(total: number, coupon?: string): number { ... }
// function createOrder(data: { ... }): { id: string; ... } { ... }
// function sendConfirmation(email: string, orderId: string): boolean { ... }

// === TODO 2: Create the composed tool ===
// A single tool that orchestrates all operations.

// const tools: Anthropic.Tool[] = [
//   {
//     name: 'create_complete_order',
//     description: 'Creates a complete order: validates stock, calculates shipping, ' +
//                  'applies discount, creates the order, and sends confirmation.',
//     input_schema: {
//       type: 'object' as const,
//       properties: {
//         customer_email: { type: 'string' },
//         products: { type: 'array', items: { type: 'object', ... } },
//         delivery_city: { type: 'string' },
//         discount_coupon: { type: 'string' },
//       },
//       required: ['customer_email', 'products', 'delivery_city'],
//     },
//   },
// ];

// === TODO 3: Implement the composed handler ===
// Orchestrate the primitive operations in sequence.
// If any fails, abort and return the error.

// function handleCreateCompleteOrder(input: { ... }): string {
//   // 1. Validate stock for each product
//   // 2. Calculate subtotal
//   // 3. Calculate shipping
//   // 4. Apply discount (if coupon provided)
//   // 5. Create the order
//   // 6. Send confirmation
//   // Return complete summary
// }

// === TODO 4: Run the tool use loop ===
// Question: "Create an order for joao@email.com with 2 notebooks and 3 mice,
//           delivery to Sao Paulo, coupon DISCOUNT10"

console.log('\n--- Exercise 17 complete! ---');
console.log('Hint: see the solution in solutions/ex17-tool-composicao.ts');
