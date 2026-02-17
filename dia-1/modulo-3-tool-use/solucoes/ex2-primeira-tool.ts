/**
 * Solucao 2: Primeira Tool — Calculadora
 *
 * Loop completo de tool use com uma calculadora.
 * Execute: npx tsx solucoes/ex2-primeira-tool.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const calculadoraTool: Anthropic.Tool = {
  name: 'calculadora',
  description:
    'Faz calculos matematicos basicos: soma, subtracao, multiplicacao e divisao.',
  input_schema: {
    type: 'object' as const,
    properties: {
      operacao: {
        type: 'string',
        enum: ['soma', 'subtracao', 'multiplicacao', 'divisao'],
        description: 'A operacao matematica a ser realizada',
      },
      a: { type: 'number', description: 'Primeiro numero' },
      b: { type: 'number', description: 'Segundo numero' },
    },
    required: ['operacao', 'a', 'b'],
  },
};

function handleCalculadora(input: {
  operacao: string;
  a: number;
  b: number;
}): string {
  switch (input.operacao) {
    case 'soma':
      return String(input.a + input.b);
    case 'subtracao':
      return String(input.a - input.b);
    case 'multiplicacao':
      return String(input.a * input.b);
    case 'divisao':
      if (input.b === 0) return 'Erro: divisao por zero';
      return String(input.a / input.b);
    default:
      return `Operacao invalida: ${input.operacao}`;
  }
}

async function runToolLoop(question: string): Promise<void> {
  console.log(`\nPergunta: "${question}"\n`);

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  let continueLoop = true;

  while (continueLoop) {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [calculadoraTool],
      messages,
    });

    // Processa cada bloco da resposta
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`[Tool chamada: ${block.name}(${JSON.stringify(block.input)})]`);
        const result = handleCalculadora(
          block.input as { operacao: string; a: number; b: number }
        );
        console.log(`[Resultado: ${result}]`);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    if (response.stop_reason === 'tool_use') {
      // Adiciona a resposta do assistente e os resultados das tools
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });
    } else {
      continueLoop = false;
    }
  }
}

await runToolLoop(
  'Quanto e 1847 multiplicado por 29? E depois divida o resultado por 7.'
);

console.log('\n--- Exercicio 2 completo! ---');
