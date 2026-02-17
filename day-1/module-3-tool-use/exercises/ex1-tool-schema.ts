/**
 * Exercise 1: Defining Tool Schemas
 *
 * Learn the structure of an Anthropic tool definition.
 * Define 3 tools with correct name, description, and input_schema.
 * No need to call the API — just define the schemas and validate them.
 *
 * Difficulty: Basic
 * Estimated time: 10 minutes
 * Run: npx tsx exercises/ex1-tool-schema.ts
 */

import Anthropic from '@anthropic-ai/sdk';

// === CONCEPT ===
// A tool in the Anthropic API has 3 required fields:
// - name: unique identifier (snake_case)
// - description: clear text explaining what the tool does
// - input_schema: JSON Schema describing the parameters
//
// The corresponding TypeScript type is Anthropic.Tool

// === TODO 1: Define the "get_weather" tool ===
// Receives: city (string, required), unit ('celsius' | 'fahrenheit', optional, default 'celsius')
// Returns: temperature and weather condition
//
// const getWeatherTool: Anthropic.Tool = {
//   name: 'get_weather',
//   description: '...',
//   input_schema: {
//     type: 'object' as const,
//     properties: {
//       city: { type: 'string', description: '...' },
//       unit: { type: 'string', enum: ['celsius', 'fahrenheit'], description: '...' },
//     },
//     required: ['city'],
//   },
// };

// === TODO 2: Define the "send_email" tool ===
// Receives: recipient (string, required), subject (string, required),
//         body (string, required), cc (array of strings, optional)
//
// const sendEmailTool: Anthropic.Tool = { ... };

// === TODO 3: Define the "query_database" tool ===
// Receives: table (string, required), filters (object with field and value, optional),
//         limit (number, optional, default 10)
//
// const queryDatabaseTool: Anthropic.Tool = { ... };

// === TODO 4: Validate that all tools have the correct structure ===
// Create an array with the 3 tools and verify:
// - All have 'name', 'description', 'input_schema'
// - All input_schema have 'type' === 'object'
// - All input_schema have 'properties'
// - All input_schema have 'required' (array)

// const tools: Anthropic.Tool[] = [getWeatherTool, sendEmailTool, queryDatabaseTool];

// function validateTools(tools: Anthropic.Tool[]): void {
//   for (const tool of tools) {
//     console.log(`\nValidating tool: ${tool.name}`);
//     // Check the fields...
//     console.log(`  ✓ name: ${tool.name}`);
//     console.log(`  ✓ description: ${tool.description.slice(0, 50)}...`);
//     console.log(`  ✓ input_schema.type: ${tool.input_schema.type}`);
//     // Check properties and required...
//   }
// }

// validateTools(tools);

console.log('\n--- Exercise 1 complete! ---');
console.log('Hint: see the solution in solutions/ex1-tool-schema.ts');
