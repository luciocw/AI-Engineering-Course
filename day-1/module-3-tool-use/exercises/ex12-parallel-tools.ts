/**
 * Exercise 12: Parallel Tool Execution
 *
 * When Claude returns multiple tool_use in a single response,
 * we can execute the handlers in parallel with Promise.all().
 *
 * Difficulty: Advanced
 * Estimated time: 20 minutes
 * Run: npx tsx exercises/ex12-tool-paralela.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEPT ===
// Claude can return MULTIPLE tool_use blocks in a single response.
// This happens when the tools are independent of each other.
// Instead of executing sequentially, we can use Promise.all()
// to run them all in parallel, reducing total time.

// === Simulated data ===
// Simulate different latencies for each service
// async function getWeather(city: string): Promise<string> {
//   await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
//   const temps = { 'SP': 28, 'RJ': 32, 'BH': 25 };
//   return JSON.stringify({ city, temp: temps[city] || 20, condition: 'sunny' });
// }

// async function getExchangeRate(currency: string): Promise<string> {
//   await new Promise(r => setTimeout(r, 500 + Math.random() * 1500));
//   const rates = { USD: 5.12, EUR: 5.56, GBP: 6.48 };
//   return JSON.stringify({ currency, rate: rates[currency] || 1 });
// }

// async function getNews(topic: string): Promise<string> {
//   await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));
//   return JSON.stringify([{ title: `Latest on ${topic}`, summary: 'Lorem ipsum...' }]);
// }

// === TODO 1: Define 3 independent tools ===
// Tool 1: get_weather — fetches temperature for a city
// Tool 2: get_exchange_rate — fetches currency exchange rate
// Tool 3: get_news — fetches news about a topic

// const tools: Anthropic.Tool[] = [ ... ];

// === TODO 2: Implement the async dispatcher ===
// Each handler is async and has different latency.

// async function dispatchToolAsync(name: string, input: Record<string, unknown>): Promise<string> {
//   switch (name) { ... }
// }

// === TODO 3: Implement parallel vs sequential execution ===
// Compare execution time using Promise.all() vs for...of

// async function executeParallel(toolCalls: Array<{ name: string; input: unknown; id: string }>): Promise<...> {
//   const start = Date.now();
//   const results = await Promise.all(
//     toolCalls.map(tc => dispatchToolAsync(tc.name, tc.input))
//   );
//   console.log(`  Parallel: ${Date.now() - start}ms`);
//   return results;
// }

// async function executeSequential(toolCalls: Array<{ name: string; input: unknown; id: string }>): Promise<...> {
//   const start = Date.now();
//   const results = [];
//   for (const tc of toolCalls) {
//     results.push(await dispatchToolAsync(tc.name, tc.input));
//   }
//   console.log(`  Sequential: ${Date.now() - start}ms`);
//   return results;
// }

// === TODO 4: Run the tool use loop with parallel execution ===
// Question: "Tell me the temperature in SP, the dollar exchange rate, and the tech news"

console.log('\n--- Exercise 12 complete! ---');
console.log('Hint: see the solution in solutions/ex12-tool-paralela.ts');
