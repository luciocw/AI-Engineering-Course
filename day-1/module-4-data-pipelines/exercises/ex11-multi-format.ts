/**
 * Exercise 11: Multi-Format Output
 *
 * Export processed data in CSV, JSON, and Markdown.
 * Difficulty: Advanced
 * Estimated time: 30 minutes
 * Run: npx tsx exercises/ex11-multi-formato.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Load data
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const customers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

// === TODO 1: Implement toCSV ===
// Converts an array of objects to CSV format string.
// - First line: headers (Object.keys of the first item)
// - Following lines: values separated by comma
// - Handle commas inside values (wrap in quotes)
// function toCSV(data: Record<string, unknown>[]): string { ... }

// === TODO 2: Implement toJSON ===
// Converts to formatted JSON with options:
// - pretty: boolean (JSON.stringify with indent)
// - includeMetadata: boolean (adds timestamp and count)
// interface JSONOptions { pretty?: boolean; includeMetadata?: boolean }
// function toJSON(data: Record<string, unknown>[], options?: JSONOptions): string { ... }

// === TODO 3: Implement toMarkdown ===
// Converts to Markdown table:
// | Header1 | Header2 | Header3 |
// |---------|---------|---------|
// | val1    | val2    | val3    |
// function toMarkdown(data: Record<string, unknown>[], title?: string): string { ... }

// === TODO 4: Create a unified exporter ===
// interface ExportOptions {
//   format: 'csv' | 'json' | 'markdown' | 'all';
//   pretty?: boolean;
//   title?: string;
// }
// function exportData(data: Record<string, unknown>[], options: ExportOptions): Record<string, string> { ... }

// === TODO 5: Run with real data ===
// Transform the customer data into a summarized format and export in all formats

console.log('\n--- Exercise 11 complete! ---');
console.log('Hint: see the solution in solutions/ex11-multi-formato.ts');
