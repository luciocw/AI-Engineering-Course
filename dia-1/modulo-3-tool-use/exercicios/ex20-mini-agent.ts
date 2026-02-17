/**
 * Exercicio 20: Mini Agente Autonomo (Capstone)
 *
 * Construa um mini agente que usa tools para completar tarefas
 * complexas de forma autonoma, tomando decisoes sobre quais
 * tools usar e em que ordem.
 *
 * Dificuldade: Expert
 * Tempo estimado: 30 minutos
 * Execute: npx tsx exercicios/ex20-mini-agent.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEITO ===
// Um agente autonomo:
// 1. Recebe um objetivo em linguagem natural
// 2. Planeja quais tools usar
// 3. Executa tools iterativamente
// 4. Avalia se o objetivo foi atingido
// 5. Pode mudar o plano baseado nos resultados
//
// O loop continua ate o agente decidir que terminou (stop_reason !== 'tool_use').
// O system prompt define a persona e as regras de decisao do agente.

// === TODO 1: Defina o ambiente do agente ===
// Simule um sistema de gerenciamento de projetos com:
// - Projetos com tarefas
// - Membros da equipe
// - Prazos e prioridades

// === TODO 2: Defina 5+ tools para o agente ===
// Tool 1: listar_projetos — lista projetos ativos
// Tool 2: ver_tarefas — lista tarefas de um projeto
// Tool 3: criar_tarefa — cria nova tarefa em um projeto
// Tool 4: atribuir_tarefa — atribui tarefa a um membro
// Tool 5: listar_equipe — lista membros disponiveis
// Tool 6: atualizar_tarefa — muda status/prioridade
// Tool 7: gerar_relatorio_projeto — resumo do projeto

// === TODO 3: Escreva o system prompt do agente ===
// Defina:
// - Persona: gerente de projetos AI
// - Regras: sempre verificar projetos antes de criar tarefas
// - Estrategia: consultar equipe antes de atribuir
// - Formato: responder com plano de acao

// === TODO 4: Implemente o loop do agente ===
// O loop deve:
// - Ter limite maximo de iteracoes (safety)
// - Logar cada decisao do agente
// - Tratar erros gracefully
// - Suportar tarefas complexas de multiplos passos

// async function runAgent(objetivo: string, maxIteracoes = 10): Promise<void> {
//   const messages: Anthropic.MessageParam[] = [
//     { role: 'user', content: objetivo },
//   ];
//   for (let i = 0; i < maxIteracoes; i++) {
//     // Chame a API, processe tools, verifique se terminou
//   }
// }

// === TODO 5: Teste com objetivos complexos ===
// Objetivo: "Organize o projeto 'Launch v2': crie tarefas para backend,
//           frontend e QA, atribua para membros disponiveis, e gere
//           um relatorio do status do projeto."

console.log('\n--- Exercicio 20 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex20-mini-agent.ts');
