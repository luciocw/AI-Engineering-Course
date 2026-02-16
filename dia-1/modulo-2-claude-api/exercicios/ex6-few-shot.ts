/**
 * Exercicio 6: Few-Shot Learning
 *
 * Compare zero-shot vs few-shot para classificacao de sentimento.
 * Execute: npx tsx exercicios/ex6-few-shot.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Exemplos para few-shot (treinamento) ===
const exemplos = [
  { review: 'Produto excelente, superou expectativas!', sentimento: 'positivo' },
  { review: 'Nao funcionou, pedi reembolso.', sentimento: 'negativo' },
  { review: 'Faz o basico, nada excepcional.', sentimento: 'neutro' },
  { review: 'Pessimo atendimento, nunca mais compro.', sentimento: 'negativo' },
];

// === Reviews para classificar ===
const reviewsTeste = [
  'Entrega rapida e produto de qualidade!',
  'Veio com defeito, muito decepcionado.',
  'Ok, funciona mas o preco e alto.',
  'Entrega atrasou mas o produto e bom.',
  'Melhor compra que ja fiz, recomendo!',
];

// === TODO 1: Crie um prompt zero-shot ===
// Apenas instrua: "Classifique o sentimento como positivo, negativo ou neutro."
// Sem exemplos.

// function buildZeroShotPrompt(review: string): string { ... }

// === TODO 2: Crie um prompt few-shot ===
// Inclua os exemplos antes da review a classificar.
// Formato:
// Review: "..." -> Sentimento: positivo
// Review: "..." -> Sentimento: negativo
// ...
// Review: "[review teste]" -> Sentimento:

// function buildFewShotPrompt(review: string): string { ... }

// === TODO 3: Classifique cada review com ambas abordagens ===
// Para cada review de teste:
// 1. Chame API com zero-shot
// 2. Chame API com few-shot
// 3. Armazene os resultados

// === TODO 4: Exiba tabela comparativa ===
// | Review | Zero-Shot | Few-Shot |
// |--------|-----------|---------|
// | ...    | positivo  | positivo|

console.log('\n--- Exercicio 6 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex6-few-shot.ts');
