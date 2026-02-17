/**
 * Exercicio 6: Gerenciamento de Memoria
 *
 * Aprenda a lidar com conversas longas resumindo mensagens antigas
 * para manter o contexto sem estourar o limite de tokens.
 * Execute: npx tsx exercicios/ex6-conversacao-memoria.ts
 *
 * Tempo estimado: 20 min
 * Dificuldade: intermediario
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

type MessageParam = { role: 'user' | 'assistant'; content: string };

const systemPrompt =
  'Voce e um assistente de suporte tecnico especializado em servidores Linux. Seja prestativo e tecnico.';

// === Cenario: conversa de suporte que cresce ao longo de varios turnos ===
// Simule uma conversa longa que precisa de gerenciamento de memoria.

const conversaSimulada: string[] = [
  'Meu servidor esta muito lento, o load average esta em 12 com 4 cores.',
  'Rodei o top e vi que o processo mysql esta usando 85% da CPU.',
  'O MySQL esta na versao 5.7, rodando em Ubuntu 20.04 com 16GB de RAM.',
  'Tem cerca de 200 conexoes ativas no MySQL agora.',
  'Ja tentei reiniciar o MySQL mas o problema volta depois de 10 minutos.',
  'O slow query log mostra queries com JOIN em 5 tabelas sem indice.',
];

// === TODO 1: Crie uma conversa com 5+ turnos ===
// Use o array conversaSimulada para enviar mensagens uma a uma.
// Acumule as mensagens no array de historico como uma conversa real.
// Armazene as respostas do assistente tambem.

// const messages: MessageParam[] = [];

// === TODO 2: Implemente deteccao de limite de tokens ===
// Defina um LIMITE_TOKENS (ex: 1000 caracteres como proxy simples).
// Antes de cada chamada, verifique se o historico total excede o limite.
// Se exceder, chame a funcao de resumo antes de continuar.
//
// Dica: use a soma dos .content.length como proxy simples para tokens.

// const LIMITE_CARACTERES = 1000;

// function contarCaracteres(msgs: MessageParam[]): number {
//   return msgs.reduce((total, m) => total + m.content.length, 0);
// }

// === TODO 3: Crie a funcao summarizeConversation ===
// Esta funcao recebe um array de mensagens e retorna um resumo.
// Chame Claude pedindo para resumir a conversa ate o momento.
// O resumo deve manter informacoes tecnicas importantes.

// async function summarizeConversation(msgs: MessageParam[]): Promise<string> {
//   // Monte um prompt pedindo resumo da conversa
//   // Chame a API
//   // Retorne o texto do resumo
// }

// === TODO 4: Continue a conversa com contexto resumido ===
// Quando o limite e atingido:
// 1. Resuma as mensagens antigas
// 2. Substitua o historico por uma unica mensagem com o resumo
// 3. Continue adicionando novas mensagens normalmente
// Exiba o estado do historico antes e depois do resumo.

console.log('\n--- Exercicio 6 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex6-conversacao-memoria.ts');
