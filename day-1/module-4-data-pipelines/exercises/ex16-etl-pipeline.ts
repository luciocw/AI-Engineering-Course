/**
 * Exercise 16: Complete ETL Pipeline
 *
 * Extract -> Transform -> Load: from raw CSV to final report.
 * Run: npx tsx exercises/ex16-etl-pipeline.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';

// === TODO 1: EXTRACT -- Read the 2 CSVs ===
// customers.csv and tickets.csv
// Parse both and return typed arrays.

// function extract(): { customers: RawCustomer[]; tickets: RawTicket[] } { ... }

// === TODO 2: TRANSFORM -- Clean and enrich the data ===
// 1. Validate with Zod (reject invalid, log warnings)
// 2. Normalize fields (trim, lowercase emails)
// 3. Enrich: calculate for each customer:
//    - totalTickets: ticket count
//    - ticketsByPriority: { high, medium, low }
//    - averageResolutionTime: days

// function transform(raw: ExtractResult): TransformResult { ... }

// === TODO 3: LOAD -- Generate the final output ===
// 1. Text report with aggregated metrics
// 2. Structured JSON ready to be used as context for an AI prompt
// 3. List of alerts (e.g.: customer with many high-priority tickets)

// function load(data: TransformResult): void { ... }

// === TODO 4: Run the pipeline ===
// const raw = extract();
// const transformed = transform(raw);
// load(transformed);

console.log('\n--- Exercise 16 complete! ---');
console.log('Hint: see the solution in solutions/ex16-etl-pipeline.ts');
