/**
 * Exercicio 5: Conversacao Multi-Turn
 *
 * Construa uma conversa de multiplos turnos onde Claude mantem contexto.
 * Execute: npx tsx exercicios/ex5-conversacao.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Cenario: suporte tecnico de um SmartWatch ===
const systemPrompt = 'Voce e um assistente de suporte tecnico da TechStore. Seja prestativo e faca perguntas de follow-up quando necessario.';

// === TODO 1: Inicie a conversa com a primeira mensagem ===
// Crie um array de messages com a primeira mensagem do usuario:
// "Meu SmartWatch X1 parou de sincronizar depois da atualizacao"
//
// type MessageParam = { role: 'user' | 'assistant'; content: string };

// const messages: MessageParam[] = [
//   { role: 'user', content: '...' },
// ];

// === TODO 2: Faca a primeira chamada e capture a resposta ===
// Envie messages para a API.
// Adicione a resposta do Claude ao array como role: 'assistant'.
// Exiba a resposta.

// === TODO 3: Adicione segunda mensagem do usuario ===
// O usuario responde: "Ja tentei reiniciar o bluetooth, mas nao funcionou"
// Adicione ao array e faca nova chamada.

// === TODO 4: Exiba a conversa completa com contagem de tokens ===
// Para cada turno, mostre:
// - Quem falou (USUARIO ou ASSISTENTE)
// - O texto
// - Tokens usados naquela chamada

console.log('\n--- Exercicio 5 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex5-conversacao.ts');
