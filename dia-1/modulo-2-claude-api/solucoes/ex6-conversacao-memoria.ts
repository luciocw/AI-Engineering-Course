/**
 * Solucao 6: Gerenciamento de Memoria
 *
 * Conversa longa com resumo automatico de mensagens antigas.
 * Execute: npx tsx solucoes/ex6-conversacao-memoria.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

type MessageParam = { role: 'user' | 'assistant'; content: string };

const systemPrompt =
  'Voce e um assistente de suporte tecnico especializado em servidores Linux. Seja prestativo e tecnico.';

// Conversa simulada de suporte tecnico
const conversaSimulada: string[] = [
  'Meu servidor esta muito lento, o load average esta em 12 com 4 cores.',
  'Rodei o top e vi que o processo mysql esta usando 85% da CPU.',
  'O MySQL esta na versao 5.7, rodando em Ubuntu 20.04 com 16GB de RAM.',
  'Tem cerca de 200 conexoes ativas no MySQL agora.',
  'Ja tentei reiniciar o MySQL mas o problema volta depois de 10 minutos.',
  'O slow query log mostra queries com JOIN em 5 tabelas sem indice.',
];

const LIMITE_CARACTERES = 1000;
let messages: MessageParam[] = [];
let resumosFeitos = 0;

function contarCaracteres(msgs: MessageParam[]): number {
  return msgs.reduce((total, m) => total + m.content.length, 0);
}

async function summarizeConversation(
  msgs: MessageParam[]
): Promise<string> {
  const conversaFormatada = msgs
    .map((m) => `${m.role === 'user' ? 'USUARIO' : 'ASSISTENTE'}: ${m.content}`)
    .join('\n\n');

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Resuma a seguinte conversa de suporte tecnico de forma concisa, mantendo todas as informacoes tecnicas importantes (versoes, numeros, diagnosticos, solucoes tentadas):\n\n${conversaFormatada}`,
      },
    ],
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';
  return text;
}

async function sendMessage(userMessage: string): Promise<string> {
  // Verificar se precisa resumir antes de adicionar nova mensagem
  const totalCaracteres = contarCaracteres(messages) + userMessage.length;

  if (totalCaracteres > LIMITE_CARACTERES && messages.length >= 4) {
    console.log(`\n  [MEMORIA] Limite atingido (${totalCaracteres} caracteres)`);
    console.log(`  [MEMORIA] Resumindo ${messages.length} mensagens...`);

    const resumo = await summarizeConversation(messages);
    resumosFeitos++;

    console.log(`  [MEMORIA] Resumo criado (${resumo.length} caracteres)`);
    console.log(`  [MEMORIA] Resumo: "${resumo.slice(0, 100)}..."\n`);

    // Substituir historico pelo resumo como contexto
    messages = [
      {
        role: 'user',
        content: `[Contexto da conversa anterior]: ${resumo}`,
      },
      {
        role: 'assistant',
        content:
          'Entendido, tenho o contexto da conversa anterior. Como posso continuar ajudando?',
      },
    ];
  }

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

  return text;
}

// Executar a conversa completa
console.log('=== Gerenciamento de Memoria em Conversas ===');
console.log(`Limite de caracteres: ${LIMITE_CARACTERES}\n`);

for (let i = 0; i < conversaSimulada.length; i++) {
  const turno = i + 1;
  const mensagem = conversaSimulada[i];

  console.log(`--- Turno ${turno} ---`);
  console.log(`USUARIO: ${mensagem}`);

  const resposta = await sendMessage(mensagem);
  console.log(`ASSISTENTE: ${resposta.slice(0, 200)}${resposta.length > 200 ? '...' : ''}`);

  const totalChars = contarCaracteres(messages);
  console.log(
    `  [Estado] ${messages.length} mensagens, ${totalChars} caracteres\n`
  );
}

// Resumo final
console.log('=== Estatisticas ===');
console.log(`Total de turnos: ${conversaSimulada.length}`);
console.log(`Resumos realizados: ${resumosFeitos}`);
console.log(`Mensagens finais no historico: ${messages.length}`);
console.log(`Caracteres finais: ${contarCaracteres(messages)}`);
console.log(
  '\nObservacao: sem gerenciamento de memoria, o historico cresceria'
);
console.log(
  'indefinidamente e eventualmente excederia o limite de contexto da API.'
);

console.log('\n--- Exercicio 6 completo! ---');
