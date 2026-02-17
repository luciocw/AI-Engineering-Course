/**
 * Exercicio 10: Tools em Conversas Multi-Turn
 *
 * Use tools dentro de uma conversa com multiplas rodadas,
 * mantendo contexto e historico entre as interacoes.
 *
 * Dificuldade: Intermediario
 * Tempo estimado: 20 minutos
 * Execute: npx tsx exercicios/ex10-tool-conversacao.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEITO ===
// Em conversas multi-turn, o Claude mantem contexto de mensagens anteriores.
// Tools podem ser chamadas em qualquer turno da conversa.
// O historico completo (incluindo tool calls anteriores) e mantido em messages[].
// Isso permite que Claude faca perguntas de follow-up usando resultados
// de tools chamadas em turnos anteriores.

// === Dados simulados - sistema de pedidos ===
const pedidosDB: Record<string, {
  id: string;
  cliente: string;
  itens: Array<{ nome: string; qtd: number; preco: number }>;
  status: string;
  data: string;
}> = {
  'PED-001': {
    id: 'PED-001', cliente: 'Maria Silva',
    itens: [{ nome: 'Notebook', qtd: 1, preco: 4500 }, { nome: 'Mouse', qtd: 2, preco: 89 }],
    status: 'enviado', data: '2026-02-10',
  },
  'PED-002': {
    id: 'PED-002', cliente: 'Maria Silva',
    itens: [{ nome: 'Teclado', qtd: 1, preco: 350 }],
    status: 'processando', data: '2026-02-15',
  },
  'PED-003': {
    id: 'PED-003', cliente: 'Joao Santos',
    itens: [{ nome: 'Monitor', qtd: 1, preco: 2800 }],
    status: 'entregue', data: '2026-02-01',
  },
};

// === TODO 1: Defina as tools do sistema de pedidos ===
// Tool 1: buscar_pedidos — busca pedidos por cliente ou ID
// Tool 2: atualizar_status — atualiza status de um pedido
// Tool 3: calcular_total — calcula total de um pedido com desconto

// const tools: Anthropic.Tool[] = [ ... ];

// === TODO 2: Implemente os handlers ===

// function handleBuscarPedidos(input: { cliente?: string; id?: string }): string { ... }
// function handleAtualizarStatus(input: { id: string; novo_status: string }): string { ... }
// function handleCalcularTotal(input: { id: string; desconto?: number }): string { ... }

// === TODO 3: Implemente a conversa multi-turn ===
// Mantenha o array de messages entre turnos.
// Simule uma conversa de 3 turnos:
//
// Turno 1: "Busque os pedidos da Maria Silva"
// Turno 2: "Qual o total do pedido PED-001 com 10% de desconto?"
// Turno 3: "Atualize o status do PED-002 para enviado"

// async function conversaMultiTurn(): Promise<void> {
//   const messages: Anthropic.MessageParam[] = [];
//   const perguntas = [
//     'Busque os pedidos da Maria Silva',
//     'Qual o total do pedido PED-001 com 10% de desconto?',
//     'Atualize o status do PED-002 para enviado',
//   ];
//
//   for (const pergunta of perguntas) {
//     console.log(`\nUsuario: ${pergunta}`);
//     messages.push({ role: 'user', content: pergunta });
//
//     // Loop de tool use para este turno
//     let continueLoop = true;
//     while (continueLoop) {
//       // Chame a API, processe tools, atualize messages...
//     }
//   }
// }

console.log('\n--- Exercicio 10 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex10-tool-conversacao.ts');
