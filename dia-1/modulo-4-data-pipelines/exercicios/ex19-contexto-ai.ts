/**
 * Exercicio 19: Contexto AI a Partir de Dados do Pipeline
 *
 * Construa contexto estruturado para prompts do Claude usando dados processados.
 * Dificuldade: Expert
 * Tempo estimado: 35 minutos
 * Execute: npx tsx exercicios/ex19-contexto-ai.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const client = new Anthropic();

// Carrega dados
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const rawCustomers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

const ticketsCSV = readFileSync('data/samples/tickets.csv', 'utf-8');
const rawTickets = parse(ticketsCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

// === TODO 1: Crie um builder de contexto ===
// O builder deve compor um contexto estruturado em etapas.
// class ContextBuilder {
//   private sections: { title: string; content: string }[] = [];
//
//   addSection(title: string, content: string): this { ... }
//   addData(title: string, data: unknown): this { ... }
//   addMetrics(title: string, metrics: Record<string, number | string>): this { ... }
//   addConstraints(constraints: string[]): this { ... }
//   build(): string { ... }
// }

// === TODO 2: Crie funcoes de sumarizacao de dados ===
// Funcoes que transformam arrays de dados em resumos concisos:
// - summarizeCustomers: KPIs de clientes
// - summarizeTickets: metricas de suporte
// - summarizeBySegment: segmentacao por plano/industria
// Cada funcao retorna string formatada para contexto AI

// === TODO 3: Crie prompts que usam o contexto ===
// 3 tipos de analise:
// a) Analise de churn: quais clientes estao em risco?
// b) Recomendacao de upsell: quem pode upgrade?
// c) Resumo executivo: visao geral do negocio

// === TODO 4: Implemente a funcao de analise AI ===
// async function analyzeWithContext(
//   contextBuilder: ContextBuilder,
//   question: string
// ): Promise<string> {
//   // Monta o contexto e envia ao Claude com a pergunta
// }

// === TODO 5: Execute as 3 analises e exiba resultados ===

console.log('\n--- Exercicio 19 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex19-contexto-ai.ts');
