/**
 * Exercise 3: Typed Handlers
 *
 * Create typed handler functions with TypeScript for tools.
 * Use discriminated unions and a type-safe dispatcher.
 *
 * Difficulty: Basic
 * Estimated time: 15 minutes
 * Run: npx tsx exercises/ex3-tool-handler-tipado.ts
 */

import Anthropic from '@anthropic-ai/sdk';

// === CONCEPT ===
// When Claude calls a tool, we receive name + input.
// In TypeScript, we can type each handler individually
// and create a dispatcher that routes to the correct handler.
// Discriminated unions allow TS to infer types automatically.

// === TODO 1: Define the input types for each tool ===
// Use discriminated union based on the 'tool_name' field

// type CalculatorInput = {
//   tool_name: 'calculator';
//   operation: 'add' | 'subtract' | 'multiply' | 'divide';
//   a: number;
//   b: number;
// };

// type TranslationInput = {
//   tool_name: 'translate';
//   text: string;
//   target_language: string;
// };

// type FormatterInput = {
//   tool_name: 'format_date';
//   date: string;
//   format: 'short' | 'long' | 'iso';
// };

// type ToolInput = CalculatorInput | TranslationInput | FormatterInput;

// === TODO 2: Implement typed handlers for each tool ===
// Each handler receives its specific type and returns string

// function handleCalculator(input: CalculatorInput): string { ... }
// function handleTranslate(input: TranslationInput): string { ... }
// function handleFormatDate(input: FormatterInput): string { ... }

// === TODO 3: Create the type-safe dispatcher ===
// Use switch on the tool_name field — TypeScript should infer the type in each case

// function dispatch(input: ToolInput): string {
//   switch (input.tool_name) {
//     case 'calculator':
//       return handleCalculator(input); // TS knows it's CalculatorInput
//     case 'translate':
//       return handleTranslate(input);    // TS knows it's TranslationInput
//     case 'format_date':
//       return handleFormatDate(input); // TS knows it's FormatterInput
//     default:
//       // exhaustive check: if a new type is added, TS complains here
//       const _exhaustive: never = input;
//       return `Unknown tool`;
//   }
// }

// === TODO 4: Test the dispatcher with examples ===
// const tests: ToolInput[] = [
//   { tool_name: 'calculator', operation: 'add', a: 10, b: 20 },
//   { tool_name: 'translate', text: 'Hello world', target_language: 'pt' },
//   { tool_name: 'format_date', date: '2026-03-15', format: 'long' },
// ];
//
// for (const test of tests) {
//   console.log(`${test.tool_name}: ${dispatch(test)}`);
// }

console.log('\n--- Exercise 3 complete! ---');
console.log('Hint: see the solution in solutions/ex3-tool-handler-tipado.ts');
