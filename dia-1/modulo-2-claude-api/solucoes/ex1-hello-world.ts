/**
 * Solucao 1: Hello World com Claude API
 *
 * Primeira chamada a Claude API com analise da resposta.
 * Execute: npx tsx solucoes/ex1-hello-world.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const response = await client.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 300,
  messages: [
    { role: 'user', content: 'Explique o que e AI Engineering em 2 frases.' },
  ],
});

const text =
  response.content[0].type === 'text' ? response.content[0].text : '';

console.log('=== Primeira chamada a Claude API ===');
console.log(`Modelo: ${response.model}`);
console.log(`Resposta: ${text}`);
console.log(
  `\nTokens: input=${response.usage.input_tokens}, output=${response.usage.output_tokens}`
);

// Custo estimado — Haiku 4.5: $0.25/M input, $1.25/M output
const custoInput = (response.usage.input_tokens / 1_000_000) * 0.25;
const custoOutput = (response.usage.output_tokens / 1_000_000) * 1.25;
const custoTotal = custoInput + custoOutput;

console.log(`\nCusto estimado:`);
console.log(`  Input:  $${custoInput.toFixed(6)}`);
console.log(`  Output: $${custoOutput.toFixed(6)}`);
console.log(`  Total:  $${custoTotal.toFixed(6)}`);

console.log('\n--- Exercicio 1 completo! ---');
