/**
 * Exercicio 13: Chain-of-Thought Prompting
 *
 * Compare abordagem direta vs CoT vs CoT estruturado em calculo complexo.
 * Referencia: exercicio 8 (JSON parsing) e exercicio 11 (few-shot).
 * Execute: npx tsx exercicios/ex13-chain-of-thought.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Cenario: calculo de preco SaaS complexo ===
const cenario = {
  empresa: 'TechCorp',
  planoBase: 500,
  usuarios: 25,
  precoPorUsuario: 30,
  tier: 'Premium',
  tierAdicional: 200,
  addons: [
    { nome: 'Analytics', preco: 100 },
    { nome: 'API Access', preco: 150 },
  ],
  descontoAnual: 0.15,
  descontoFidelidade: 0.05,
};

// Resposta correta: R$1.372,75
// Base(500) + Usuarios(750) + Tier(200) + Analytics(100) + API(150) = 1700
// Anual: 1700 * 0.85 = 1445
// Fidelidade: 1445 * 0.95 = 1372.75

// === TODO 1: Prompt direto ===
// Apenas peca: "Calcule o preco mensal final."
// Inclua todos os dados do cenario no prompt.

// function buildDirectPrompt(): string { ... }

// === TODO 2: Prompt Chain-of-Thought ===
// Adicione: "Pense passo a passo. Mostre cada etapa do calculo."
// Mesmos dados, mas com instrucao de raciocinar.

// function buildCoTPrompt(): string { ... }

// === TODO 3: Prompt CoT Estruturado ===
// Peca resposta em JSON:
// {
//   "etapas": [{ "descricao": "...", "valor": 0 }],
//   "precoFinal": 0,
//   "confianca": "alta|media|baixa"
// }

// function buildStructuredCoTPrompt(): string { ... }

// === TODO 4: Execute as 3 abordagens e compare ===
// Para cada uma:
// 1. Chame a API
// 2. Exiba a resposta
// 3. Compare com o valor correto (R$1.372,75)

// === TODO 5: Exiba resumo comparativo ===
// Abordagem | Preco Calculado | Correto? | Tokens
// Direto    | R$...           | Sim/Nao  | XX
// CoT       | R$...           | Sim/Nao  | XX
// CoT JSON  | R$...           | Sim/Nao  | XX

console.log('\n--- Exercicio 13 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex13-chain-of-thought.ts');
