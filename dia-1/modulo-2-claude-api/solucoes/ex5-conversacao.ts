/**
 * Solucao 5: Conversacao Multi-Turn
 *
 * Conversa de multiplos turnos com contexto acumulado.
 * Execute: npx tsx solucoes/ex5-conversacao.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const systemPrompt =
  'Voce e um assistente de suporte tecnico da TechStore. Seja prestativo e faca perguntas de follow-up quando necessario.';

type MessageParam = { role: 'user' | 'assistant'; content: string };

const messages: MessageParam[] = [];
const tokenLog: Array<{ turno: number; input: number; output: number }> = [];

async function sendMessage(userMessage: string): Promise<string> {
  messages.push({ role: 'user', content: userMessage });

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system: systemPrompt,
    messages,
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';

  messages.push({ role: 'assistant', content: text });

  tokenLog.push({
    turno: tokenLog.length + 1,
    input: response.usage.input_tokens,
    output: response.usage.output_tokens,
  });

  return text;
}

// Turno 1
console.log('=== Turno 1 ===');
console.log(
  'USUARIO: Meu SmartWatch X1 parou de sincronizar depois da atualizacao'
);
const resposta1 = await sendMessage(
  'Meu SmartWatch X1 parou de sincronizar depois da atualizacao'
);
console.log(`ASSISTENTE: ${resposta1}\n`);

// Turno 2
console.log('=== Turno 2 ===');
console.log(
  'USUARIO: Ja tentei reiniciar o bluetooth, mas nao funcionou'
);
const resposta2 = await sendMessage(
  'Ja tentei reiniciar o bluetooth, mas nao funcionou'
);
console.log(`ASSISTENTE: ${resposta2}\n`);

// Turno 3
console.log('=== Turno 3 ===');
console.log('USUARIO: O relogio esta na versao 2.1.4 do firmware');
const resposta3 = await sendMessage(
  'O relogio esta na versao 2.1.4 do firmware'
);
console.log(`ASSISTENTE: ${resposta3}\n`);

// Resumo de tokens
console.log('=== Resumo de Tokens ===');
let totalInput = 0;
let totalOutput = 0;
for (const log of tokenLog) {
  console.log(
    `Turno ${log.turno}: input=${log.input}, output=${log.output}`
  );
  totalInput += log.input;
  totalOutput += log.output;
}
console.log(`Total: input=${totalInput}, output=${totalOutput}`);
console.log(
  `Observacao: tokens de input crescem a cada turno pois incluem historico completo.`
);

console.log('\n--- Exercicio 5 completo! ---');
