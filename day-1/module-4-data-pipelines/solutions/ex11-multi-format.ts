/**
 * Solution 11: Multi-Format Output
 *
 * Exports processed data in CSV, JSON, and Markdown.
 * Run: npx tsx solutions/ex11-multi-formato.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Load data
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const rawCustomers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

interface Customer {
  name: string;
  plan: string;
  mrr: number;
  status: string;
  industry: string;
}

const customers: Customer[] = rawCustomers.map((r) => ({
  name: r.nome,
  plan: r.plano,
  mrr: parseInt(r.mrr, 10),
  status: r.status,
  industry: r.industria,
}));

// === 1: toCSV ===
function toCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const lines: string[] = [headers.join(',')];

  for (const row of data) {
    const values = headers.map((h) => {
      const val = String(row[h] ?? '');
      // Wrap in quotes if it contains comma, quotes, or newline
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    lines.push(values.join(','));
  }

  return lines.join('\n');
}

// === 2: toJSON ===
interface JSONOptions {
  pretty?: boolean;
  includeMetadata?: boolean;
}

function toJSON(data: Record<string, unknown>[], options: JSONOptions = {}): string {
  const { pretty = false, includeMetadata = false } = options;

  const output: Record<string, unknown> = {};

  if (includeMetadata) {
    output.metadata = {
      generatedAt: new Date().toISOString(),
      totalRecords: data.length,
    };
    output.data = data;
  } else {
    return JSON.stringify(data, null, pretty ? 2 : undefined);
  }

  return JSON.stringify(output, null, pretty ? 2 : undefined);
}

// === 3: toMarkdown ===
function toMarkdown(data: Record<string, unknown>[], title?: string): string {
  if (data.length === 0) return title ? `# ${title}\n\n_No data_` : '_No data_';

  const headers = Object.keys(data[0]);
  const lines: string[] = [];

  if (title) {
    lines.push(`# ${title}\n`);
  }

  // Header
  lines.push(`| ${headers.join(' | ')} |`);
  lines.push(`| ${headers.map(() => '---').join(' | ')} |`);

  // Rows
  for (const row of data) {
    const values = headers.map((h) => String(row[h] ?? ''));
    lines.push(`| ${values.join(' | ')} |`);
  }

  lines.push(`\n_Total: ${data.length} records_`);

  return lines.join('\n');
}

// === 4: Unified exporter ===
interface ExportOptions {
  format: 'csv' | 'json' | 'markdown' | 'all';
  pretty?: boolean;
  title?: string;
}

function exportData(data: Record<string, unknown>[], options: ExportOptions): Record<string, string> {
  const result: Record<string, string> = {};

  if (options.format === 'csv' || options.format === 'all') {
    result.csv = toCSV(data);
  }

  if (options.format === 'json' || options.format === 'all') {
    result.json = toJSON(data, { pretty: options.pretty ?? true, includeMetadata: true });
  }

  if (options.format === 'markdown' || options.format === 'all') {
    result.markdown = toMarkdown(data, options.title);
  }

  return result;
}

// === 5: Execute with real data ===
const dataForExport = customers.map((c) => ({
  name: c.name,
  plan: c.plan,
  mrr: c.mrr,
  status: c.status,
  industry: c.industry,
})) as Record<string, unknown>[];

const exports = exportData(dataForExport, {
  format: 'all',
  pretty: true,
  title: 'SaaS Customer Report',
});

console.log('=== CSV Format ===\n');
console.log(exports.csv);

console.log('\n=== JSON Format ===\n');
console.log(exports.json);

console.log('\n=== Markdown Format ===\n');
console.log(exports.markdown);

// Summary by plan in all formats
console.log('\n\n=== Summary by Plan (Multi-Format) ===');

const planNames = ['Enterprise', 'Pro', 'Starter'];
const summary = planNames.map((plan) => {
  const planCustomers = customers.filter((c) => c.plan === plan);
  const active = planCustomers.filter((c) => c.status === 'ativo');
  return {
    plan,
    total: planCustomers.length,
    active: active.length,
    totalMrr: active.reduce((sum, c) => sum + c.mrr, 0),
  };
}) as Record<string, unknown>[];

const summaryExports = exportData(summary, {
  format: 'all',
  pretty: true,
  title: 'Summary by Plan',
});

console.log('\n--- CSV ---');
console.log(summaryExports.csv);
console.log('\n--- Markdown ---');
console.log(summaryExports.markdown);

console.log('\n--- Exercise 11 complete! ---');
