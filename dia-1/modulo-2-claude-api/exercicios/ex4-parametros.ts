/**
 * Exercicio 4: Parametros da API (temperature, max_tokens, stop_sequences)
 *
 * Experimente como os parametros afetam as respostas do Claude.
 * Execute: npx tsx exercicios/ex4-parametros.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === TODO 1: Teste diferentes temperatures ===
// Envie o prompt criativo "Escreva um slogan para uma startup de AI"
// com temperatures: 0.0, 0.3, 0.5, 0.8, 1.0
//
// Observe: temp=0 produz resultado deterministic,
// temp=1 produz resultado mais criativo.

const TEMPERATURES = [0.0, 0.3, 0.5, 0.8, 1.0];
const promptCriativo = 'Escreva um slogan curto para uma startup de AI.';

// for (const temp of TEMPERATURES) {
//   const response = await client.messages.create({
//     model: 'claude-haiku-4-5-20251001',
//     max_tokens: 50,
//     temperature: temp,
//     messages: [{ role: 'user', content: promptCriativo }],
//   });
//   console.log(`temp=${temp}: ${response.content[0].text}`);
// }

// === TODO 2: Teste max_tokens como limitador ===
// Envie uma pergunta factual com max_tokens: 10, 50, 200
// Observe como a resposta e cortada.

// === TODO 3: Teste stop_sequences ===
// Peca ao Claude para listar 5 itens numerados.
// Use stop_sequences: ['3.'] para cortar apos o item 2.
//
// Dica: stop_sequences e um array de strings.
// Quando Claude gera qualquer uma delas, para.

// === TODO 4: Compare custo de Haiku vs Sonnet ===
// Envie a mesma pergunta para ambos modelos.
// Calcule e compare: tokens usados e custo estimado.
// Haiku: $0.25/$1.25 per M tokens (input/output)
// Sonnet: $3/$15 per M tokens (input/output)

console.log('\n--- Exercicio 4 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex4-parametros.ts');
