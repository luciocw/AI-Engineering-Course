/**
 * Exercicio 15: Confirmacao do Usuario Antes de Executar
 *
 * Implemente um fluxo onde certas tools pedem confirmacao
 * do usuario antes de serem executadas (human-in-the-loop).
 *
 * Dificuldade: Avancado
 * Tempo estimado: 20 minutos
 * Execute: npx tsx exercicios/ex15-tool-confirmacao.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEITO ===
// Nem toda tool deve ser executada automaticamente.
// Acoes destrutivas ou irreversiveis devem pedir confirmacao.
// Implementamos isso classificando tools em "seguras" e "sensiveis".
// Tools sensiveis retornam um pedido de confirmacao em vez do resultado.

// === TODO 1: Classifique as tools por nivel de risco ===
// Seguras: consultas, leituras (executar automaticamente)
// Sensiveis: escrita, delete, envios (pedir confirmacao)

// type ToolRisco = 'segura' | 'sensivel';
// const toolRiscos: Record<string, ToolRisco> = {
//   listar_arquivos: 'segura',
//   ler_arquivo: 'segura',
//   deletar_arquivo: 'sensivel',
//   enviar_email: 'sensivel',
//   renomear_arquivo: 'sensivel',
// };

// === TODO 2: Defina as tools ===

// const tools: Anthropic.Tool[] = [
//   { name: 'listar_arquivos', description: '...', input_schema: { ... } },
//   { name: 'ler_arquivo', description: '...', input_schema: { ... } },
//   { name: 'deletar_arquivo', description: '...', input_schema: { ... } },
//   { name: 'enviar_email', description: '...', input_schema: { ... } },
//   { name: 'renomear_arquivo', description: '...', input_schema: { ... } },
// ];

// === TODO 3: Implemente o fluxo de confirmacao ===
// Para tools sensiveis:
// 1. Nao execute o handler
// 2. Retorne uma mensagem pedindo confirmacao
// 3. Claude informa ao usuario o que sera feito
// 4. No proximo turno, o usuario confirma ou cancela
// 5. Se confirmado, execute a tool

// function processarToolCall(
//   name: string,
//   input: Record<string, unknown>,
//   confirmado: boolean
// ): { resultado: string; pedirConfirmacao: boolean } {
//   const risco = toolRiscos[name] || 'sensivel';
//
//   if (risco === 'sensivel' && !confirmado) {
//     return {
//       resultado: `CONFIRMACAO NECESSARIA: A acao "${name}" requer sua confirmacao.`,
//       pedirConfirmacao: true,
//     };
//   }
//
//   // Executa o handler normalmente
//   return { resultado: dispatchTool(name, input), pedirConfirmacao: false };
// }

// === TODO 4: Implemente o loop com confirmacao ===
// Simule a confirmacao automaticamente para teste.

console.log('\n--- Exercicio 15 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex15-tool-confirmacao.ts');
