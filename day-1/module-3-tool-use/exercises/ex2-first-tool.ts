/**
 * Exercise 2: First Tool — Calculator
 *
 * Implement the complete tool use loop with a simple calculator.
 * Run: npx tsx exercises/ex2-primeira-tool.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === TODO 1: Define the "calculator" tool ===
// A tool needs:
// - name: 'calculator'
// - description: explain what it does
// - input_schema: JSON Schema with the properties the tool accepts
//
// The calculator receives:
// - operation: 'add' | 'subtract' | 'multiply' | 'divide'
// - a: number
// - b: number

// const calculatorTool = {
//   name: 'calculator',
//   description: '...',
//   input_schema: {
//     type: 'object',
//     properties: { ... },
//     required: ['operation', 'a', 'b'],
//   },
// };

// === TODO 2: Implement the tool handler ===
// Receives the parameters and returns the result.
// Remember to handle division by zero!

// function handleCalculator(input: { operation: string; a: number; b: number }): string {
//   switch (input.operation) {
//     case 'add': ...
//     case 'subtract': ...
//     case 'multiply': ...
//     case 'divide': ...
//     default: return 'Invalid operation';
//   }
// }

// === TODO 3: Implement the tool use loop ===
// 1. Send the question to Claude with the tool available
// 2. Check if stop_reason === 'tool_use'
// 3. If yes, extract the tool_use block, execute the handler
// 4. Send the result back as tool_result
// 5. Claude will use the result to respond

// const question = 'How much is 1847 multiplied by 29? And then divide the result by 7.';

// async function runToolLoop(question: string): Promise<void> {
//   let messages = [{ role: 'user', content: question }];
//   // Loop until Claude stops requesting tools...
// }

// await runToolLoop(question);

console.log('\n--- Exercise 2 complete! ---');
console.log('Hint: see the solution in solutions/ex2-primeira-tool.ts');
