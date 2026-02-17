/**
 * Exercicio 15: Pipeline com Claude Tools
 *
 * Use Tool Use do Claude para enriquecer dados dentro do pipeline.
 * Dificuldade: Avancado
 * Tempo estimado: 35 minutos
 * Execute: npx tsx exercicios/ex15-pipeline-com-tools.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const client = new Anthropic();

// Carrega dados
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const rawCustomers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

// === TODO 1: Defina as tools para o Claude ===
// Crie 2 tools:
// 1. consultar_cliente: recebe email, retorna dados do cliente do CSV
// 2. calcular_metricas: recebe cliente_id, retorna metricas calculadas
// As tools devem seguir o formato:
// { name: string, description: string, input_schema: { type: 'object', properties: {...}, required: [...] } }

// const tools: Anthropic.Tool[] = [ ... ];

// === TODO 2: Implemente o handler de tools ===
// Quando o Claude chamar uma tool, execute a logica real.
// function handleToolCall(name: string, input: Record<string, unknown>): string {
//   if (name === 'consultar_cliente') { ... }
//   if (name === 'calcular_metricas') { ... }
// }

// === TODO 3: Implemente o loop de conversacao com tools ===
// 1. Envie uma mensagem pedindo ao Claude para analisar um cliente
// 2. Se o Claude chamar uma tool, execute e envie o resultado de volta
// 3. Continue ate o Claude dar uma resposta final
// async function analisarCliente(email: string): Promise<string> { ... }

// === TODO 4: Execute o pipeline ===
// Para 3 clientes, use o loop com tools para obter analises enriquecidas.

console.log('\n--- Exercicio 15 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex15-pipeline-com-tools.ts');
