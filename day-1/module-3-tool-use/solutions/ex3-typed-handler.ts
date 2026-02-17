/**
 * Solution 3: Typed Handlers
 *
 * Discriminated unions and typed dispatcher for tool handlers.
 * Run: npx tsx solutions/ex3-typed-handler.ts
 */

import Anthropic from '@anthropic-ai/sdk';

// === Input types with discriminated union ===

type CalculatorInput = {
  tool_name: 'calculator';
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
  a: number;
  b: number;
};

type TranslationInput = {
  tool_name: 'translate';
  text: string;
  target_language: string;
};

type FormatterInput = {
  tool_name: 'format_date';
  date: string;
  format: 'short' | 'long' | 'iso';
};

type ToolInput = CalculatorInput | TranslationInput | FormatterInput;

// === Typed handlers ===

function handleCalculator(input: CalculatorInput): string {
  switch (input.operation) {
    case 'add':
      return String(input.a + input.b);
    case 'subtract':
      return String(input.a - input.b);
    case 'multiply':
      return String(input.a * input.b);
    case 'divide':
      if (input.b === 0) return 'Error: division by zero';
      return String(input.a / input.b);
  }
}

function handleTranslate(input: TranslationInput): string {
  // Simple translation simulation
  const translations: Record<string, Record<string, string>> = {
    pt: { 'Hello world': 'Ola mundo', 'Good morning': 'Bom dia' },
    es: { 'Hello world': 'Hola mundo', 'Good morning': 'Buenos dias' },
    fr: { 'Hello world': 'Bonjour le monde', 'Good morning': 'Bonjour' },
  };

  const translated = translations[input.target_language]?.[input.text];
  return translated || `[Simulated translation of "${input.text}" to ${input.target_language}]`;
}

function handleFormatDate(input: FormatterInput): string {
  const date = new Date(input.date + 'T12:00:00');
  if (isNaN(date.getTime())) return 'Invalid date';

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  switch (input.format) {
    case 'short':
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
    case 'long':
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    case 'iso':
      return date.toISOString().split('T')[0];
  }
}

// === Dispatcher with safe typing ===

function dispatch(input: ToolInput): string {
  switch (input.tool_name) {
    case 'calculator':
      return handleCalculator(input); // TS knows this is CalculatorInput
    case 'translate':
      return handleTranslate(input);    // TS knows this is TranslationInput
    case 'format_date':
      return handleFormatDate(input); // TS knows this is FormatterInput
    default:
      // Exhaustive check: if a new type is added, TS will complain here
      const _exhaustive: never = input;
      return `Unknown tool`;
  }
}

// === Tests ===

const tests: ToolInput[] = [
  { tool_name: 'calculator', operation: 'add', a: 10, b: 20 },
  { tool_name: 'calculator', operation: 'multiply', a: 7, b: 8 },
  { tool_name: 'calculator', operation: 'divide', a: 100, b: 0 },
  { tool_name: 'translate', text: 'Hello world', target_language: 'pt' },
  { tool_name: 'translate', text: 'Good morning', target_language: 'es' },
  { tool_name: 'format_date', date: '2026-03-15', format: 'long' },
  { tool_name: 'format_date', date: '2026-12-25', format: 'short' },
  { tool_name: 'format_date', date: '2026-07-04', format: 'iso' },
];

console.log('=== Testing Typed Dispatcher ===\n');

for (const test of tests) {
  const result = dispatch(test);
  console.log(`${test.tool_name} -> ${result}`);
}

console.log('\n--- Exercise 3 complete! ---');
