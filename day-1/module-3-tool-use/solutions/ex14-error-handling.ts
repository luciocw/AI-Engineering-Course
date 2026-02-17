/**
 * Solution 14: Error Handling in Tool Use
 *
 * Retries, timeouts, and graceful degradation.
 * Run: npx tsx solutions/ex14-error-handling.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const prices: Record<string, number> = {
  laptop: 4500,
  mouse: 89,
  keyboard: 250,
  monitor: 1800,
  headset: 350,
};

const tools: Anthropic.Tool[] = [
  {
    name: 'get_price',
    description:
      'Fetches the price of a product from the catalog. May fail temporarily.',
    input_schema: {
      type: 'object' as const,
      properties: {
        product: { type: 'string', description: 'Product name' },
      },
      required: ['product'],
    },
  },
  {
    name: 'get_stock',
    description:
      'Fetches stock quantity. Slow operation that may timeout.',
    input_schema: {
      type: 'object' as const,
      properties: {
        product: { type: 'string', description: 'Product name' },
      },
      required: ['product'],
    },
  },
];

// Simulates intermittent failures (50% chance)
function getPriceUnsafe(product: string): string {
  if (Math.random() < 0.5) {
    throw new Error('Service temporarily unavailable');
  }
  const price = prices[product.toLowerCase()];
  if (price === undefined) return JSON.stringify({ error: 'Product not found' });
  return JSON.stringify({ product, price });
}

// Simulates slow operation (0-5 seconds)
async function getStockSlow(product: string): Promise<string> {
  const delay = Math.random() * 5000;
  await new Promise((resolve) => setTimeout(resolve, delay));
  const stock = Math.floor(Math.random() * 100);
  return JSON.stringify({ product, stock, delay: `${(delay / 1000).toFixed(1)}s` });
}

// Retry wrapper
async function withRetry<T>(
  fn: () => T | Promise<T>,
  maxRetries = 3,
  label = ''
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`  [Retry ${attempt}/${maxRetries}${label ? ` - ${label}` : ''}: ${message}]`);
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${message}`);
      }
    }
  }
  throw new Error('Unreachable');
}

// Timeout wrapper
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

async function handleTool(
  name: string,
  input: Record<string, unknown>
): Promise<{ content: string; isError: boolean }> {
  const product = input.product as string;

  try {
    switch (name) {
      case 'get_price': {
        const result = await withRetry(
          () => getPriceUnsafe(product),
          3,
          product
        );
        return { content: result, isError: false };
      }
      case 'get_stock': {
        const result = await withTimeout(getStockSlow(product), 3000);
        return { content: result, isError: false };
      }
      default:
        return { content: `Unknown tool: ${name}`, isError: true };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`  [Final error: ${message}]`);
    return { content: `Error: ${message}`, isError: true };
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
        const { content, isError } = await handleTool(
          block.name,
          block.input as Record<string, unknown>
        );
        console.log(`  [${isError ? 'ERROR' : 'OK'}: ${content}]`);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content,
          is_error: isError,
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

await runToolLoop(
  'Fetch the price and stock availability for the laptop, mouse, and keyboard.'
);

console.log('\n--- Exercise 14 complete! ---');
