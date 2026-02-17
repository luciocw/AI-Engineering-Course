/**
 * Exercise 6: Effective Tool Descriptions
 *
 * The quality of the description directly impacts Claude's ability
 * to choose and use the tool correctly. Practice writing clear,
 * specific descriptions with examples.
 *
 * Difficulty: Intermediate
 * Estimated time: 15 minutes
 * Run: npx tsx exercises/ex6-tool-descricao-eficaz.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEPT ===
// Good tool descriptions should:
// 1. Explain WHAT the tool does (not how)
// 2. Specify WHEN to use (and when NOT to use)
// 3. Describe the PARAMETERS with examples
// 4. Indicate the RETURN format
//
// Bad descriptions lead to incorrect or unnecessary tool calls.

// === TODO 1: Improve these BAD descriptions ===
// Rewrite each tool with better descriptions.

// BAD — too vague:
// const badTool1: Anthropic.Tool = {
//   name: 'search',
//   description: 'Searches for things',
//   input_schema: {
//     type: 'object' as const,
//     properties: {
//       q: { type: 'string', description: 'query' },
//     },
//     required: ['q'],
//   },
// };

// GOOD — rewrite with effective description:
// const goodTool1: Anthropic.Tool = {
//   name: 'search_documents',
//   description: '...',    // Describe what it searches, where, return format
//   input_schema: {
//     type: 'object' as const,
//     properties: {
//       query: { type: 'string', description: '...' },  // Examples!
//       limit: { type: 'number', description: '...' },
//     },
//     required: ['query'],
//   },
// };

// BAD — too technical, no context:
// const badTool2 = {
//   name: 'db_query',
//   description: 'SELECT * FROM table WHERE condition',
//   ...
// };

// GOOD — rewrite:
// const goodTool2: Anthropic.Tool = { ... };

// BAD — doesn't say when to use vs not use:
// const badTool3 = {
//   name: 'calculate',
//   description: 'Does calculations',
//   ...
// };

// GOOD — rewrite:
// const goodTool3: Anthropic.Tool = { ... };

// === TODO 2: Create 2 tools with intentionally ambiguous descriptions ===
// And then an improved version of each one.
// Goal: see how bad descriptions affect tool selection.

// === TODO 3: Test with Claude ===
// Send the same question with the bad tools and then with the good tools.
// Compare whether Claude chooses the correct tool in each case.

// const question = 'I need to find the document about the company vacation policy';

// async function testDescriptions(tools: Anthropic.Tool[], label: string): Promise<void> {
//   console.log(`\n=== Test: ${label} ===`);
//   const response = await client.messages.create({
//     model: 'claude-haiku-4-5-20251001',
//     max_tokens: 1024,
//     tools,
//     messages: [{ role: 'user', content: question }],
//   });
//   for (const block of response.content) {
//     if (block.type === 'tool_use') {
//       console.log(`  Tool chosen: ${block.name}`);
//       console.log(`  Input: ${JSON.stringify(block.input)}`);
//     }
//   }
// }

console.log('\n--- Exercise 6 complete! ---');
console.log('Hint: see the solution in solutions/ex6-tool-descricao-eficaz.ts');
