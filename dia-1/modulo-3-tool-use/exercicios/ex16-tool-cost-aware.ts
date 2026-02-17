/**
 * Exercicio 16: Tool Use com Consciencia de Custo
 *
 * Rastreie tokens e custos de cada chamada a API.
 * Implemente um CostTracker para monitorar gastos em tempo real.
 *
 * Dificuldade: Expert
 * Tempo estimado: 25 minutos
 * Execute: npx tsx exercicios/ex16-tool-cost-aware.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEITO ===
// Cada chamada a API consome tokens (input + output).
// Em loops de tool use, os custos podem se multiplicar rapidamente.
// Um CostTracker monitora:
// - Tokens de input e output por chamada
// - Custo acumulado em dolares
// - Numero de iteracoes do loop
// - Budget maximo para interromper se ultrapassar

// Precos do Claude Haiku (por 1M tokens):
// Input: $1.00 / 1M tokens
// Output: $5.00 / 1M tokens

// === TODO 1: Implemente a classe CostTracker ===

// class CostTracker {
//   private chamadas: Array<{
//     inputTokens: number;
//     outputTokens: number;
//     custoInput: number;
//     custoOutput: number;
//   }> = [];
//   private budgetMaximo: number;
//
//   constructor(budgetMaximo: number = 0.10) {
//     this.budgetMaximo = budgetMaximo;
//   }
//
//   registrar(response: Anthropic.Message): void {
//     // Extraia input_tokens e output_tokens de response.usage
//     // Calcule custo baseado nos precos
//     // Adicione ao array de chamadas
//   }
//
//   getCustoTotal(): number { ... }
//   getTokensTotal(): { input: number; output: number } { ... }
//   getTotalChamadas(): number { ... }
//   excedeuBudget(): boolean { ... }
//   resumo(): string { ... }
// }

// === TODO 2: Defina tools simples para teste ===
// Use tools que gerem multiplas iteracoes no loop.

// === TODO 3: Rode o loop de tool use com CostTracker ===
// Apos cada chamada a API, registre no tracker.
// Se exceder o budget, interrompa o loop.
// No final, imprima o resumo de custos.

// async function runComCostTracking(question: string, budget: number): Promise<void> {
//   const tracker = new CostTracker(budget);
//   const messages: Anthropic.MessageParam[] = [{ role: 'user', content: question }];
//
//   while (true) {
//     const response = await client.messages.create({ ... });
//     tracker.registrar(response);
//
//     if (tracker.excedeuBudget()) {
//       console.log('Budget excedido! Interrompendo...');
//       break;
//     }
//     // ... processar tools ...
//   }
//
//   console.log(tracker.resumo());
// }

console.log('\n--- Exercicio 16 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex16-tool-cost-aware.ts');
