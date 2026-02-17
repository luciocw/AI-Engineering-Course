/**
 * Exercise 11: Chained Tools
 *
 * Claude calls multiple tools in sequence: data -> metrics -> report.
 * Run: npx tsx exercises/ex11-tool-encadeada.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Simulated sales data ===
const salesDB: Record<string, Array<{ product: string; amount: number; date: string }>> = {
  '2026-01': [
    { product: 'Pro Plan', amount: 299, date: '2026-01-05' },
    { product: 'Enterprise Plan', amount: 999, date: '2026-01-12' },
    { product: 'Pro Plan', amount: 299, date: '2026-01-20' },
    { product: 'Starter Plan', amount: 49, date: '2026-01-25' },
  ],
  '2026-02': [
    { product: 'Enterprise Plan', amount: 999, date: '2026-02-03' },
    { product: 'Pro Plan', amount: 299, date: '2026-02-10' },
    { product: 'Pro Plan', amount: 299, date: '2026-02-14' },
    { product: 'Enterprise Plan', amount: 999, date: '2026-02-20' },
    { product: 'Starter Plan', amount: 49, date: '2026-02-28' },
  ],
};

// === TODO 1: Define 3 chained tools ===
// Tool 1: get_sales — receives month (YYYY-MM), returns sales for the month
// Tool 2: calculate_metrics — receives array of sales, returns total, average, count by product
// Tool 3: generate_report — receives metrics from 2 months, returns comparative analysis

// const tools = [ ... ];

// === TODO 2: Implement the handlers ===
// Each handler uses data from the previous one:
// get_sales('2026-01') -> data
// calculate_metrics(data) -> metrics
// generate_report(metrics_jan, metrics_feb) -> report

// === TODO 3: Have Claude chain the tools ===
// Question: "Compare the sales from January and February 2026.
//           Fetch the data, calculate metrics, and generate a report."

// Claude should call the tools in the correct order automatically.

console.log('\n--- Exercise 11 complete! ---');
console.log('Hint: see the solution in solutions/ex11-tool-encadeada.ts');
