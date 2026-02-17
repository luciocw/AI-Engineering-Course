/**
 * Exercise 5: Input Validation with Zod
 *
 * Validate tool inputs before processing.
 * Use Zod to ensure runtime type safety and return clear errors.
 *
 * Difficulty: Basic
 * Estimated time: 15 minutes
 * Run: npx tsx exercises/ex5-tool-validation.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEPT ===
// When Claude calls a tool, inputs come as `unknown`.
// We need to validate before using to avoid runtime errors.
// Zod is a popular library for schema validation in TypeScript.
// Here we will implement manual validation (no external dependency).

// === TODO 1: Create validation functions for each type ===
// Validate that fields exist, have the correct type, and are within limits.

// function validateCreateUser(input: unknown): {
//   valid: boolean;
//   data?: { name: string; email: string; age: number };
//   error?: string;
// } {
//   if (typeof input !== 'object' || input === null) {
//     return { valid: false, error: 'Input must be an object' };
//   }
//   const obj = input as Record<string, unknown>;
//   // Check name (string, min 2 chars)
//   // Check email (string, contains @)
//   // Check age (number, 0-150)
//   // Return { valid: true, data: { name, email, age } }
// }

// function validateSearchProducts(input: unknown): {
//   valid: boolean;
//   data?: { category: string; max_price?: number; sort_by?: 'price' | 'name' | 'rating' };
//   error?: string;
// } {
//   // Check category (string, required)
//   // Check max_price (number, optional, > 0)
//   // Check sort_by (string, optional, must be one of the allowed values)
// }

// === TODO 2: Define the tools with detailed schemas ===

// const tools: Anthropic.Tool[] = [
//   {
//     name: 'create_user',
//     description: 'Creates a new user in the system with name, email, and age.',
//     input_schema: { ... },
//   },
//   {
//     name: 'search_products',
//     description: 'Searches products by category with optional filters.',
//     input_schema: { ... },
//   },
// ];

// === TODO 3: Implement the dispatcher with validation ===
// Before executing the handler, validate the input.
// If validation fails, return the error as tool_result.

// function dispatchWithValidation(name: string, input: unknown): string {
//   switch (name) {
//     case 'create_user': {
//       const result = validateCreateUser(input);
//       if (!result.valid) return `Validation error: ${result.error}`;
//       // Process with result.data (typed!)
//       return JSON.stringify({ id: 1, ...result.data, status: 'created' });
//     }
//     case 'search_products': {
//       const result = validateSearchProducts(input);
//       if (!result.valid) return `Validation error: ${result.error}`;
//       // Simulate search
//       return JSON.stringify([{ name: 'Product A', price: 99 }]);
//     }
//     default:
//       return `Unknown tool: ${name}`;
//   }
// }

// === TODO 4: Test validation with correct and incorrect inputs ===
// Test with valid and invalid inputs to verify that validation works.

// const validationTests = [
//   { tool: 'create_user', input: { name: 'Ana', email: 'ana@email.com', age: 25 } },
//   { tool: 'create_user', input: { name: '', email: 'invalid', age: -5 } },
//   { tool: 'search_products', input: { category: 'electronics', max_price: 1000 } },
//   { tool: 'search_products', input: { max_price: -10 } }, // missing category
// ];
//
// for (const test of validationTests) {
//   console.log(`\n${test.tool}(${JSON.stringify(test.input)}):`);
//   console.log(`  -> ${dispatchWithValidation(test.tool, test.input)}`);
// }

console.log('\n--- Exercise 5 complete! ---');
console.log('Hint: see the solution in solutions/ex5-tool-validation.ts');
