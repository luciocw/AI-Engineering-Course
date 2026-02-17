/**
 * Exercicio 13: Prompt Engineering para Tool Use
 *
 * Use system prompts e instrucoes para controlar COMO e QUANDO
 * Claude usa as tools disponiveis.
 *
 * Dificuldade: Avancado
 * Tempo estimado: 20 minutos
 * Execute: npx tsx exercicios/ex13-tool-prompt-engineering.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEITO ===
// O system prompt pode guiar o comportamento de tool use:
// 1. Definir QUANDO usar tools (vs responder diretamente)
// 2. Estabelecer ORDEM de preferencia entre tools
// 3. Instruir sobre COMBINACAO de tools
// 4. Pedir CONFIRMACAO antes de executar certas tools
// 5. Usar tool_choice para forcar ou desabilitar tools

// === TODO 1: Crie tools de um assistente financeiro ===
// Tool 1: consultar_saldo — retorna saldo da conta
// Tool 2: consultar_extrato — retorna ultimas transacoes
// Tool 3: fazer_transferencia — transfere dinheiro (sensivel!)
// Tool 4: consultar_investimentos — retorna portfolio de investimentos

// const tools: Anthropic.Tool[] = [ ... ];

// === TODO 2: Escreva um system prompt que controla o uso das tools ===
// O prompt deve:
// - Definir a persona do assistente (analista financeiro)
// - Instruir a SEMPRE consultar saldo antes de transferir
// - NUNCA transferir sem confirmar com o usuario primeiro
// - Preferir usar tools de consulta antes de dar conselhos
// - Formatar valores em reais (R$)

// const systemPrompt = `Voce e um assistente financeiro profissional...`;

// === TODO 3: Teste com tool_choice ===
// tool_choice pode ser:
// - { type: 'auto' } — Claude decide (default)
// - { type: 'any' } — Claude DEVE usar alguma tool
// - { type: 'tool', name: 'buscar_saldo' } — Forca uma tool especifica

// Teste a mesma pergunta com diferentes tool_choice:
// Pergunta: "Meu saldo esta bom para investir?"
// Com 'auto': Claude pode responder sem tool
// Com 'any': Claude DEVE usar alguma tool
// Com tool especifica: Forca consultar_saldo

// === TODO 4: Compare resultados ===
// async function testarComToolChoice(
//   pergunta: string,
//   toolChoice: Anthropic.MessageCreateParams['tool_choice']
// ): Promise<void> {
//   // Rode a pergunta com o tool_choice especificado
//   // Imprima qual tool foi escolhida (ou se respondeu sem tool)
// }

console.log('\n--- Exercicio 13 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex13-tool-prompt-engineering.ts');
