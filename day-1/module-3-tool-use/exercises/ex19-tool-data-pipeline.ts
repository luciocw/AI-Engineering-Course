/**
 * Exercise 19: Tools as Data Pipeline
 *
 * Use tools to create a data pipeline where the output of one
 * tool feeds the input of the next, forming an ETL flow.
 *
 * Difficulty: Expert
 * Estimated time: 25 minutes
 * Run: npx tsx exercises/ex19-tool-data-pipeline.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEPT ===
// Data pipeline with tools:
// Extract -> Transform -> Load
//
// 1. EXTRACT: Tool fetches raw data from a source
// 2. TRANSFORM: Tool processes/cleans/aggregates the data
// 3. LOAD: Tool saves/sends the processed result
//
// Claude orchestrates the pipeline automatically,
// passing the output of each stage as input to the next.

// === Simulated raw data ===
const rawData = {
  sales_csv: [
    'date,product,amount,region',
    '2026-01-05,Pro Plan,299,Southeast',
    '2026-01-05,Starter Plan,49,South',
    '2026-01-10,Enterprise Plan,999,Southeast',
    '2026-01-15,Pro Plan,299,Northeast',
    '2026-01-20,Enterprise Plan,999,Southeast',
    '2026-01-25,Starter Plan,49,South',
    '2026-02-01,Pro Plan,299,North',
    '2026-02-05,Enterprise Plan,999,Southeast',
    '2026-02-10,Pro Plan,299,Northeast',
    '2026-02-15,Starter Plan,49,Midwest',
  ],
};

// === TODO 1: Define the pipeline tools ===
// Tool 1: extract_data — reads raw data (simulates CSV/API reading)
// Tool 2: transform_data — aggregates, filters, and calculates metrics
// Tool 3: load_data — saves result (simulates writing to database/file)

// const tools: Anthropic.Tool[] = [
//   {
//     name: 'extract_data',
//     description: 'Extracts raw data from a source. Returns data in JSON format.',
//     input_schema: { ... },
//   },
//   {
//     name: 'transform_data',
//     description: 'Transforms data: groups, filters, calculates metrics.',
//     input_schema: { ... },
//   },
//   {
//     name: 'load_data',
//     description: 'Loads processed data into a destination.',
//     input_schema: { ... },
//   },
// ];

// === TODO 2: Implement the pipeline handlers ===

// function handleExtract(input: { source: string }): string {
//   // Parse CSV to JSON
// }

// function handleTransform(input: {
//   data: unknown[];
//   operation: string;  // 'group_by_region' | 'group_by_product' | 'filter'
//   filter?: { field: string; value: string };
// }): string {
//   // Perform the requested transformation
// }

// function handleLoad(input: {
//   destination: string;  // 'console' | 'json' | 'report'
//   data: unknown;
//   title?: string;
// }): string {
//   // Save the data to the destination
// }

// === TODO 3: Run the pipeline with Claude ===
// Question: "Extract the sales data, group by region,
//           and generate a report with the total by region."

console.log('\n--- Exercise 19 complete! ---');
console.log('Hint: see the solution in solutions/ex19-tool-data-pipeline.ts');
