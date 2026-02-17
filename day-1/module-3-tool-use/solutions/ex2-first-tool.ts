/**
 * Solution 2: First Tool — Calculator
 *
 * Complete tool use loop with a calculator.
 * Run: npx tsx solutions/ex2-first-tool.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const calculatorTool: Anthropic.Tool = {
  name: 'calculator',
  description:
    'Performs basic math operations: add, subtract, multiply, and divide.',
  input_schema: {
    type: 'object' as const,
    properties: {
      operation: {
        type: 'string',
        enum: ['add', 'subtract', 'multiply', 'divide'],
        description: 'The math operation to perform',
      },
      a: { type: 'number', description: 'First number' },
      b: { type: 'number', description: 'Second number' },
    },
    required: ['operation', 'a', 'b'],
  },
};

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
      if (input.b === 0) return 'Error: division by zero';
      return String(input.a / input.b);
    default:
      return `Invalid operation: ${input.operation}`;
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
      tools: [calculatorTool],
      messages,
    });

    // Process each block of the response
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`[Tool called: ${block.name}(${JSON.stringify(block.input)})]`);
        const result = handleCalculator(
          block.input as { operation: string; a: number; b: number }
        );
        console.log(`[Result: ${result}]`);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    if (response.stop_reason === 'tool_use') {
      // Add the assistant response and tool results
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });
    } else {
      continueLoop = false;
    }
  }
}

await runToolLoop(
  'How much is 1847 multiplied by 29? And then divide the result by 7.'
);

console.log('\n--- Exercise 2 complete! ---');
