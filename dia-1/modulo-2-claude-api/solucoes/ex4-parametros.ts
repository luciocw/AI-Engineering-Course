/**
 * Solucao 4: Parametros da API
 *
 * Experimente temperature, max_tokens, stop_sequences e compare modelos.
 * Execute: npx tsx solucoes/ex4-parametros.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Teste 1: Temperatures ===
console.log('=== Teste 1: Temperatures ===');
const TEMPERATURES = [0.0, 0.3, 0.5, 0.8, 1.0];
const promptCriativo = 'Escreva um slogan curto para uma startup de AI.';

for (const temp of TEMPERATURES) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 50,
    temperature: temp,
    messages: [{ role: 'user', content: promptCriativo }],
  });
  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';
  console.log(`temp=${temp}: ${text}`);
}

// === Teste 2: max_tokens como limitador ===
console.log('\n=== Teste 2: max_tokens ===');
const MAX_TOKENS = [10, 50, 200];
const perguntaFactual = 'O que e machine learning?';

for (const maxTk of MAX_TOKENS) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTk,
    messages: [{ role: 'user', content: perguntaFactual }],
  });
  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';
  console.log(`max_tokens=${maxTk} (stop=${response.stop_reason}):`);
  console.log(`  "${text.slice(0, 100)}${text.length > 100 ? '...' : ''}"`);
}

// === Teste 3: stop_sequences ===
console.log('\n=== Teste 3: stop_sequences ===');
const response3 = await client.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 200,
  stop_sequences: ['3.'],
  messages: [
    { role: 'user', content: 'Liste 5 linguagens de programacao populares, numeradas de 1 a 5.' },
  ],
});
const text3 =
  response3.content[0].type === 'text' ? response3.content[0].text : '';
console.log(`stop_sequences=['3.'] (stop=${response3.stop_reason}):`);
console.log(`  ${text3}`);
console.log('  -> Parou antes do item 3!');

// === Teste 4: Haiku vs Sonnet (custo) ===
console.log('\n=== Teste 4: Haiku vs Sonnet ===');
const perguntaComparar = 'Explique o conceito de embeddings em 3 frases.';

const modelos = [
  {
    id: 'claude-haiku-4-5-20251001' as const,
    nome: 'Haiku 4.5',
    inputCost: 0.25,
    outputCost: 1.25,
  },
  {
    id: 'claude-sonnet-4-5-20250929' as const,
    nome: 'Sonnet 4.5',
    inputCost: 3,
    outputCost: 15,
  },
];

for (const modelo of modelos) {
  const response = await client.messages.create({
    model: modelo.id,
    max_tokens: 200,
    messages: [{ role: 'user', content: perguntaComparar }],
  });
  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';
  const custoInput =
    (response.usage.input_tokens / 1_000_000) * modelo.inputCost;
  const custoOutput =
    (response.usage.output_tokens / 1_000_000) * modelo.outputCost;

  console.log(`\n${modelo.nome}:`);
  console.log(`  Resposta: ${text.slice(0, 120)}...`);
  console.log(
    `  Tokens: input=${response.usage.input_tokens}, output=${response.usage.output_tokens}`
  );
  console.log(`  Custo: $${(custoInput + custoOutput).toFixed(6)}`);
}

console.log('\n--- Exercicio 4 completo! ---');
