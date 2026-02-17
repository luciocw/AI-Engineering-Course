/**
 * Exercicio 10: Each + If Combinados
 *
 * Aprenda a combinar loops com condicionais para templates complexos.
 * Voce ja domina loops aninhados e contexto pai (ex9). Agora adicione logica dentro dos loops.
 * Execute: npx tsx exercicios/ex10-loops-condicionais.ts
 */

import Handlebars from 'handlebars';

// === Dados do relatorio de vendas ===
const relatorioVendas = {
  mes: 'Janeiro 2026',
  vendedores: [
    { nome: 'Alice', vendas: 45, meta: 40, regiao: 'Sul', destaque: true },
    { nome: 'Bob', vendas: 32, meta: 40, regiao: 'Norte', destaque: false },
    { nome: 'Carol', vendas: 51, meta: 40, regiao: 'Sudeste', destaque: true },
    { nome: 'Daniel', vendas: 38, meta: 40, regiao: 'Centro-Oeste', destaque: false },
    { nome: 'Eva', vendas: 40, meta: 40, regiao: 'Nordeste', destaque: false },
  ],
};

// === TODO 1: Helpers de comparacao e calculo ===
// Crie os seguintes helpers:
//
// 'gte' - retorna true se a >= b (greater than or equal)
//   Uso: {{#if (gte vendas meta)}}...{{/if}}
//
// 'percentage' - calcula (a / b * 100) e formata com 1 casa decimal
//   Uso: {{percentage vendas meta}} => "112.5"
//
// 'subtract' - retorna a - b
//   Uso: {{subtract meta vendas}} => "8"
//
// Dica: para usar helper dentro de {{#if}}, use subexpressoes: {{#if (gte vendas meta)}}

// TODO: Registre os helpers 'gte', 'percentage' e 'subtract' aqui

// === TODO 2: Template com loop + condicionais ===
// Para cada vendedor, mostre:
// - Se vendas >= meta: "Alice - META BATIDA (112.5%)"
// - Se vendas < meta: "Bob - Faltam 8 vendas"
//
// Dica: use {{#each vendedores}} com {{#if (gte vendas meta)}} dentro

const templateRelatorio = `
TODO: Crie template combinando each com if/else
`;

// === TODO 3: Resumo com block helper 'countIf' ===
// Crie um block helper 'countIf' que conta quantos itens de um array
// atendem a uma condicao. Use-o para mostrar:
// "Total: 5 vendedores | Bateram meta: 3 | Nao bateram: 2"
//
// Dica: block helpers recebem options.fn e options.inverse
// Handlebars.registerHelper('countIf', function(array, field, threshold, options) { ... })
// Ou use uma abordagem mais simples com um helper que retorna o numero diretamente.

// TODO: Registre o helper 'countIf' aqui

const templateResumo = `
TODO: Crie template de resumo usando countIf ou helpers de contagem
`;

// === Compile e teste ===
// TODO: compile os templates e exiba os resultados

console.log(`=== Relatorio de Vendas - ${relatorioVendas.mes} ===`);
// compile templateRelatorio

console.log('\n=== Resumo ===');
// compile templateResumo

console.log('\n--- Exercicio 10 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex10-loops-condicionais.ts');
