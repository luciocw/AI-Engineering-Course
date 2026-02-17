/**
 * Exercicio 11: Output Multi-Formato
 *
 * Exporte dados processados em CSV, JSON e Markdown.
 * Dificuldade: Avancado
 * Tempo estimado: 30 minutos
 * Execute: npx tsx exercicios/ex11-multi-formato.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Carrega dados
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const customers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

// === TODO 1: Implemente toCSV ===
// Converte um array de objetos para formato CSV string.
// - Primeira linha: headers (Object.keys do primeiro item)
// - Linhas seguintes: valores separados por virgula
// - Trate virgulas dentro de valores (envolva em aspas)
// function toCSV(data: Record<string, unknown>[]): string { ... }

// === TODO 2: Implemente toJSON ===
// Converte para JSON formatado com opcoes:
// - pretty: boolean (JSON.stringify com indent)
// - includeMetadata: boolean (adiciona timestamp e count)
// interface JSONOptions { pretty?: boolean; includeMetadata?: boolean }
// function toJSON(data: Record<string, unknown>[], options?: JSONOptions): string { ... }

// === TODO 3: Implemente toMarkdown ===
// Converte para tabela Markdown:
// | Header1 | Header2 | Header3 |
// |---------|---------|---------|
// | val1    | val2    | val3    |
// function toMarkdown(data: Record<string, unknown>[], title?: string): string { ... }

// === TODO 4: Crie um exportador unificado ===
// interface ExportOptions {
//   format: 'csv' | 'json' | 'markdown' | 'all';
//   pretty?: boolean;
//   title?: string;
// }
// function exportData(data: Record<string, unknown>[], options: ExportOptions): Record<string, string> { ... }

// === TODO 5: Execute com dados reais ===
// Transforme os dados de customers em formato resumido e exporte em todos os formatos

console.log('\n--- Exercicio 11 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex11-multi-formato.ts');
