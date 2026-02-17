/**
 * Exercicio 10: Formatacao com Handlebars
 *
 * Use templates Handlebars para formatar dados em relatorios legíveis.
 * Dificuldade: Intermediario
 * Tempo estimado: 25 minutos
 * Execute: npx tsx exercicios/ex10-formatacao-handlebars.ts
 */

import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Carrega dados
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const customers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

// === TODO 1: Registre helpers Handlebars ===
// Crie helpers para:
// - formatCurrency: formata numero como R$X.XXX
// - uppercase: transforma texto em maiusculas
// - ifEquals: compara dois valores (block helper)
// - countIf: conta items de um array que satisfazem condicao

// Handlebars.registerHelper('formatCurrency', function (value: number) { ... });
// Handlebars.registerHelper('uppercase', function (value: string) { ... });
// Handlebars.registerHelper('ifEquals', function (a: any, b: any, options: any) { ... });

// === TODO 2: Crie um template de relatorio de clientes ===
// O template deve:
// - Listar cada cliente com nome, plano e MRR formatado
// - Mostrar um indicador visual de status (ativo/churned)
// - Agrupar por plano usando #each

// const reportTemplate = Handlebars.compile(`...`);

// === TODO 3: Crie um template de resumo executivo ===
// Campos: mrrTotal, clientesAtivos, churnRate, topIndustrias

// const summaryTemplate = Handlebars.compile(`...`);

// === TODO 4: Crie um template de alerta ===
// Para clientes em risco: nome, motivo, acao sugerida

// const alertTemplate = Handlebars.compile(`...`);

// === TODO 5: Execute os templates com dados reais ===
// Prepare os dados e passe para cada template

console.log('\n--- Exercicio 10 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex10-formatacao-handlebars.ts');
