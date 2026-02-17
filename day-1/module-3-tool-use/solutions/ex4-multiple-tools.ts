/**
 * Solution 4: Multiple Tools
 *
 * 3 tools available — Claude chooses which to use.
 * Run: npx tsx solutions/ex4-multiple-tools.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: 'calculator',
    description: 'Performs math operations: add, subtract, multiply, divide, percentage.',
    input_schema: {
      type: 'object' as const,
      properties: {
        operation: {
          type: 'string',
          enum: ['add', 'subtract', 'multiply', 'divide', 'percentage'],
          description: 'The math operation',
        },
        a: { type: 'number', description: 'First number' },
        b: { type: 'number', description: 'Second number' },
      },
      required: ['operation', 'a', 'b'],
    },
  },
  {
    name: 'unit_converter',
    description: 'Converts units: celsius/fahrenheit, km/miles, kg/pounds.',
    input_schema: {
      type: 'object' as const,
      properties: {
        type: {
          type: 'string',
          enum: [
            'celsius_fahrenheit',
            'fahrenheit_celsius',
            'km_miles',
            'miles_km',
            'kg_pounds',
            'pounds_kg',
          ],
          description: 'Conversion type',
        },
        value: { type: 'number', description: 'Value to convert' },
      },
      required: ['type', 'value'],
    },
  },
  {
    name: 'date_info',
    description: 'Information about dates: day of the week, days until a future date.',
    input_schema: {
      type: 'object' as const,
      properties: {
        operation: {
          type: 'string',
          enum: ['day_of_week', 'days_until'],
          description: 'Type of date operation',
        },
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format',
        },
      },
      required: ['operation', 'date'],
    },
  },
];

function handleCalculator(input: {
  operation: string;
  a: number;
  b: number;
}): string {
  switch (input.operation) {
    case 'add':
      return String(input.a + input.b);
    case 'subtract':
      return String(input.a - input.b);
    case 'multiply':
      return String(input.a * input.b);
    case 'divide':
      return input.b === 0 ? 'Error: division by zero' : String(input.a / input.b);
    case 'percentage':
      return String((input.a / 100) * input.b);
    default:
      return `Invalid operation: ${input.operation}`;
  }
}

function handleConverter(input: { type: string; value: number }): string {
  const conversions: Record<string, (v: number) => number> = {
    celsius_fahrenheit: (v) => (v * 9) / 5 + 32,
    fahrenheit_celsius: (v) => ((v - 32) * 5) / 9,
    km_miles: (v) => v * 0.621371,
    miles_km: (v) => v / 0.621371,
    kg_pounds: (v) => v * 2.20462,
    pounds_kg: (v) => v / 2.20462,
  };
  const fn = conversions[input.type];
  if (!fn) return `Invalid conversion type: ${input.type}`;
  return String(fn(input.value).toFixed(2));
}

function handleDateInfo(input: { operation: string; date: string }): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(input.date + 'T12:00:00');

  if (isNaN(date.getTime())) return 'Invalid date';

  switch (input.operation) {
    case 'day_of_week':
      return days[date.getDay()];
    case 'days_until': {
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0
        ? `${diff} days remaining`
        : `${Math.abs(diff)} days ago`;
    }
    default:
      return `Invalid operation: ${input.operation}`;
  }
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'calculator':
      return handleCalculator(input as { operation: string; a: number; b: number });
    case 'unit_converter':
      return handleConverter(input as { type: string; value: number });
    case 'date_info':
      return handleDateInfo(input as { operation: string; date: string });
    default:
      return `Unknown tool: ${name}`;
  }
}

async function runToolLoop(question: string): Promise<void> {
  console.log(`\nQuestion: "${question}"\n`);

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  let continueLoop = true;

  while (continueLoop) {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools,
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [Tool: ${block.name}(${JSON.stringify(block.input)})]`);
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
        console.log(`  [Result: ${result}]`);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });
    } else {
      continueLoop = false;
    }
  }
}

const questions = [
  'How much is 25 degrees Celsius in Fahrenheit?',
  'What day of the week will 12/25/2026 be?',
  'Calculate 15% of 2500 and convert the result from km to miles.',
];

for (const question of questions) {
  await runToolLoop(question);
  console.log('\n' + '='.repeat(50));
}

console.log('\n--- Exercise 4 complete! ---');
