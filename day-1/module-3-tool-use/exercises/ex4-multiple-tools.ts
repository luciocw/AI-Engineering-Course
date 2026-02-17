/**
 * Exercise 4: Multiple Tools
 *
 * Provide 3 tools and let Claude choose which one to use.
 * Run: npx tsx exercises/ex4-multiplas-tools.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === TODO 1: Define 3 tools ===
// Tool 1: calculator — math operations (from ex2)
// Tool 2: unit_converter — converts celsius/fahrenheit, km/miles, kg/pounds
// Tool 3: date_info — returns day of the week, days until a date, difference between dates

// const tools = [ ... ];

// === TODO 2: Implement the handlers ===
// One handler for each tool.

// function handleCalculator(input: {...}): string { ... }
// function handleConverter(input: {...}): string { ... }
// function handleDateInfo(input: {...}): string { ... }

// === TODO 3: Create a tool dispatcher ===
// Receives the tool name + input, dispatches to the correct handler.

// function dispatchTool(name: string, input: Record<string, unknown>): string {
//   switch (name) {
//     case 'calculator': return handleCalculator(input);
//     case 'unit_converter': return handleConverter(input);
//     case 'date_info': return handleDateInfo(input);
//     default: return `Tool ${name} not found`;
//   }
// }

// === TODO 4: Test with questions that use different tools ===
// Question 1: "How much is 25 degrees Celsius in Fahrenheit?"
// Question 2: "What day of the week will 12/25/2026 be?"
// Question 3: "Calculate 15% of 2500 and convert the result from km to miles"

// For each question, run the complete tool use loop.

console.log('\n--- Exercise 4 complete! ---');
console.log('Hint: see the solution in solutions/ex4-multiplas-tools.ts');
