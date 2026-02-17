/**
 * Exercicio 18: Relatorios com Templates Handlebars
 *
 * Gere relatorios profissionais usando Handlebars e dados do pipeline.
 * Dificuldade: Expert
 * Tempo estimado: 35 minutos
 * Execute: npx tsx exercicios/ex18-relatorio-templates.ts
 */

import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Carrega dados
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const rawCustomers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

const ticketsCSV = readFileSync('data/samples/tickets.csv', 'utf-8');
const rawTickets = parse(ticketsCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

// === TODO 1: Registre helpers avancados ===
// - barChart: gera um grafico de barras em ASCII dado um valor e max
//   Exemplo: barChart(7, 10) -> "======= " (7 de 10)
// - percentage: calcula e formata percentual
// - pluralize: retorna forma singular/plural
// - relativeDate: retorna "X dias atras" ou "ha X meses"
// - conditional class: retorna classes CSS baseadas em valor

// === TODO 2: Crie um template de dashboard executivo ===
// Com secoes: KPIs, Saude dos Clientes, Tickets, Tendencias
// Use partials para cada secao
// Handlebars.registerPartial('kpiSection', `...`);
// Handlebars.registerPartial('healthSection', `...`);
// Handlebars.registerPartial('ticketSection', `...`);

// === TODO 3: Crie um template de relatorio individual por cliente ===
// Para cada cliente, mostre: dados, tickets, metricas, recomendacoes

// === TODO 4: Crie um template de alerta por email (texto) ===
// Simule um email de alerta com: destinatario, assunto, corpo formatado

// === TODO 5: Prepare os dados e gere todos os relatorios ===

console.log('\n--- Exercicio 18 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex18-relatorio-templates.ts');
