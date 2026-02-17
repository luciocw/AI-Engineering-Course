/**
 * Solucao 11: Output Multi-Formato
 *
 * Exporta dados processados em CSV, JSON e Markdown.
 * Execute: npx tsx solucoes/ex11-multi-formato.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Carrega dados
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const rawCustomers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

interface Customer {
  nome: string;
  plano: string;
  mrr: number;
  status: string;
  industria: string;
}

const customers: Customer[] = rawCustomers.map((r) => ({
  nome: r.nome,
  plano: r.plano,
  mrr: parseInt(r.mrr, 10),
  status: r.status,
  industria: r.industria,
}));

// === 1: toCSV ===
function toCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const lines: string[] = [headers.join(',')];

  for (const row of data) {
    const values = headers.map((h) => {
      const val = String(row[h] ?? '');
      // Envolve em aspas se contiver virgula, aspas ou newline
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
      geradoEm: new Date().toISOString(),
      totalRegistros: data.length,
    };
    output.dados = data;
  } else {
    return JSON.stringify(data, null, pretty ? 2 : undefined);
  }

  return JSON.stringify(output, null, pretty ? 2 : undefined);
}

// === 3: toMarkdown ===
function toMarkdown(data: Record<string, unknown>[], title?: string): string {
  if (data.length === 0) return title ? `# ${title}\n\n_Sem dados_` : '_Sem dados_';

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

  lines.push(`\n_Total: ${data.length} registros_`);

  return lines.join('\n');
}

// === 4: Exportador unificado ===
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

// === 5: Executa com dados reais ===
const dataForExport = customers.map((c) => ({
  nome: c.nome,
  plano: c.plano,
  mrr: c.mrr,
  status: c.status,
  industria: c.industria,
})) as Record<string, unknown>[];

const exports = exportData(dataForExport, {
  format: 'all',
  pretty: true,
  title: 'Relatorio de Clientes SaaS',
});

console.log('=== Formato CSV ===\n');
console.log(exports.csv);

console.log('\n=== Formato JSON ===\n');
console.log(exports.json);

console.log('\n=== Formato Markdown ===\n');
console.log(exports.markdown);

// Resumo por plano em todos os formatos
console.log('\n\n=== Resumo por Plano (Multi-Formato) ===');

const planos = ['Enterprise', 'Pro', 'Starter'];
const resumo = planos.map((plano) => {
  const clientesPlano = customers.filter((c) => c.plano === plano);
  const ativos = clientesPlano.filter((c) => c.status === 'ativo');
  return {
    plano,
    total: clientesPlano.length,
    ativos: ativos.length,
    mrrTotal: ativos.reduce((sum, c) => sum + c.mrr, 0),
  };
}) as Record<string, unknown>[];

const resumoExports = exportData(resumo, {
  format: 'all',
  pretty: true,
  title: 'Resumo por Plano',
});

console.log('\n--- CSV ---');
console.log(resumoExports.csv);
console.log('\n--- Markdown ---');
console.log(resumoExports.markdown);

console.log('\n--- Exercicio 11 completo! ---');
