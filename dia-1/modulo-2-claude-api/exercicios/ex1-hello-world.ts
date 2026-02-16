/**
 * Exercicio 1: Hello World com Claude API
 *
 * Faca sua primeira chamada a Claude API e entenda a estrutura da resposta.
 * Execute: npx tsx exercicios/ex1-hello-world.ts
 *
 * Pre-requisito: ANTHROPIC_API_KEY no .env
 */

import Anthropic from '@anthropic-ai/sdk';

// === TODO 1: Crie o client da Anthropic ===
// O SDK le automaticamente a env var ANTHROPIC_API_KEY.
// Basta instanciar: new Anthropic()

// const client = ...

// === TODO 2: Faca uma chamada a API ===
// Use client.messages.create() com:
// - model: 'claude-haiku-4-5-20251001' (rapido e barato para exercicios)
// - max_tokens: 300
// - messages: array com uma mensagem do usuario
//
// Pergunta: "Explique o que e AI Engineering em 2 frases."

// const response = await client.messages.create({ ... });

// === TODO 3: Extraia e exiba o resultado ===
// A resposta tem esta estrutura:
// response.content[0].text -> texto da resposta
// response.model -> modelo usado
// response.usage.input_tokens -> tokens de entrada
// response.usage.output_tokens -> tokens de saida
//
// Exiba tudo formatado no console.

// console.log('=== Primeira chamada a Claude API ===');
// console.log(`Modelo: ${response.model}`);
// console.log(`Resposta: ${response.content[0].text}`);
// console.log(`\nTokens: input=${response.usage.input_tokens}, output=${response.usage.output_tokens}`);

// === TODO 4: Calcule o custo estimado ===
// Haiku 4.5: $0.25/M input tokens, $1.25/M output tokens
// Faca a conta e exiba.

console.log('\n--- Exercicio 1 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex1-hello-world.ts');
