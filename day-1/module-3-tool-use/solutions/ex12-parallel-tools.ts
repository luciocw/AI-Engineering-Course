/**
 * Solution 12: Parallel Tool Execution
 *
 * Promise.all() to execute independent tools in parallel.
 * Run: npx tsx solutions/ex12-parallel-tools.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Simulated services with latency ===

async function getWeather(city: string): Promise<string> {
  const delay = 1000 + Math.random() * 2000;
  await new Promise((r) => setTimeout(r, delay));
  const weather: Record<string, { temp: number; condition: string }> = {
    'Sao Paulo': { temp: 28, condition: 'cloudy' },
    'Rio de Janeiro': { temp: 32, condition: 'sunny' },
    'Belo Horizonte': { temp: 25, condition: 'partly cloudy' },
  };
  const data = weather[city] || { temp: 22, condition: 'unknown' };
  return JSON.stringify({ city, ...data, latency: `${Math.round(delay)}ms` });
}

async function getExchangeRate(currency: string): Promise<string> {
  const delay = 500 + Math.random() * 1500;
  await new Promise((r) => setTimeout(r, delay));
  const rates: Record<string, number> = { USD: 5.12, EUR: 5.56, GBP: 6.48, JPY: 0.034 };
  return JSON.stringify({
    currency,
    value_brl: rates[currency.toUpperCase()] || 1,
    latency: `${Math.round(delay)}ms`,
  });
}

async function getNews(topic: string): Promise<string> {
  const delay = 800 + Math.random() * 1200;
  await new Promise((r) => setTimeout(r, delay));
  return JSON.stringify({
    topic,
    news: [
      { title: `${topic}: new trends for 2026`, source: 'TechBlog' },
      { title: `${topic} market grows 15%`, source: 'Economy Today' },
    ],
    latency: `${Math.round(delay)}ms`,
  });
}

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'get_weather',
    description:
      'Fetches the current temperature and weather condition for a Brazilian city.',
    input_schema: {
      type: 'object' as const,
      properties: {
        city: { type: 'string', description: 'City name. E.g.: Sao Paulo, Rio de Janeiro' },
      },
      required: ['city'],
    },
  },
  {
    name: 'get_exchange_rate',
    description:
      'Fetches the current exchange rate of a foreign currency against BRL.',
    input_schema: {
      type: 'object' as const,
      properties: {
        currency: { type: 'string', description: 'Currency code. E.g.: USD, EUR, GBP' },
      },
      required: ['currency'],
    },
  },
  {
    name: 'get_news',
    description:
      'Fetches the latest news about a specific topic.',
    input_schema: {
      type: 'object' as const,
      properties: {
        topic: { type: 'string', description: 'Topic to search news for. E.g.: technology, economy' },
      },
      required: ['topic'],
    },
  },
];

// === Async dispatcher ===

async function dispatchToolAsync(
  name: string,
  input: Record<string, unknown>
): Promise<string> {
  switch (name) {
    case 'get_weather':
      return getWeather(input.city as string);
    case 'get_exchange_rate':
      return getExchangeRate(input.currency as string);
    case 'get_news':
      return getNews(input.topic as string);
    default:
      return `Unknown tool: ${name}`;
  }
}

// === Tool use loop with parallel execution ===

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

    // Collect all tool calls from this response
    const toolCalls: Array<{
      id: string;
      name: string;
      input: Record<string, unknown>;
    }> = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [Tool requested: ${block.name}(${JSON.stringify(block.input)})]`);
        toolCalls.push({
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        });
      }
    }

    if (response.stop_reason === 'tool_use' && toolCalls.length > 0) {
      console.log(`\n  Executing ${toolCalls.length} tools in PARALLEL...`);
      const start = Date.now();

      // Parallel execution with Promise.all
      const results = await Promise.all(
        toolCalls.map((tc) => dispatchToolAsync(tc.name, tc.input))
      );

      const totalTime = Date.now() - start;
      console.log(`  All finished in ${totalTime}ms (parallel)\n`);

      // Build tool_results
      const toolResults: Anthropic.ToolResultBlockParam[] = toolCalls.map(
        (tc, i) => ({
          type: 'tool_result' as const,
          tool_use_id: tc.id,
          content: results[i],
        })
      );

      for (const [i, tc] of toolCalls.entries()) {
        console.log(`  [${tc.name} -> ${results[i].slice(0, 80)}...]`);
      }

      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });
    } else {
      continueLoop = false;
    }
  }
}

await runToolLoop(
  'Tell me the temperature in Sao Paulo, the dollar exchange rate, and the latest technology news.'
);

console.log('\n--- Exercise 12 complete! ---');
