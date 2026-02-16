/**
 * Exercicio 1: Primeira Tool — Calculadora
 *
 * Implemente o loop completo de tool use com uma calculadora simples.
 * Execute: npx tsx exercicios/ex1-primeira-tool.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === TODO 1: Defina a tool "calculadora" ===
// Uma tool precisa de:
// - name: 'calculadora'
// - description: explique o que faz
// - input_schema: JSON Schema com as propriedades que a tool aceita
//
// A calculadora recebe:
// - operacao: 'soma' | 'subtracao' | 'multiplicacao' | 'divisao'
// - a: number
// - b: number

// const calculadoraTool = {
//   name: 'calculadora',
//   description: '...',
//   input_schema: {
//     type: 'object',
//     properties: { ... },
//     required: ['operacao', 'a', 'b'],
//   },
// };

// === TODO 2: Implemente o handler da tool ===
// Recebe os parametros e retorna o resultado.
// Lembre-se de tratar divisao por zero!

// function handleCalculadora(input: { operacao: string; a: number; b: number }): string {
//   switch (input.operacao) {
//     case 'soma': ...
//     case 'subtracao': ...
//     case 'multiplicacao': ...
//     case 'divisao': ...
//     default: return 'Operacao invalida';
//   }
// }

// === TODO 3: Implemente o loop de tool use ===
// 1. Envie a pergunta para Claude com a tool disponivel
// 2. Verifique se stop_reason === 'tool_use'
// 3. Se sim, extraia o tool_use block, execute o handler
// 4. Envie o resultado de volta como tool_result
// 5. Claude usara o resultado para responder

// const pergunta = 'Quanto e 1847 multiplicado por 29? E depois divida o resultado por 7.';

// async function runToolLoop(question: string): Promise<void> {
//   let messages = [{ role: 'user', content: question }];
//   // Loop ate Claude parar de pedir tools...
// }

// await runToolLoop(pergunta);

console.log('\n--- Exercicio 1 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex1-primeira-tool.ts');
