/**
 * Solucao 3: Tool com API Real (ViaCEP)
 *
 * Tool que busca enderecos reais usando a API ViaCEP.
 * Execute: npx tsx solucoes/ex3-api-real.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const buscarCepTool: Anthropic.Tool = {
  name: 'buscar_cep',
  description:
    'Busca o endereco completo a partir de um CEP brasileiro. Retorna logradouro, bairro, cidade e estado.',
  input_schema: {
    type: 'object' as const,
    properties: {
      cep: {
        type: 'string',
        description: 'CEP no formato 00000-000 ou 00000000',
      },
    },
    required: ['cep'],
  },
};

async function handleBuscarCep(input: { cep: string }): Promise<string> {
  const cepLimpo = input.cep.replace(/\D/g, '');

  if (cepLimpo.length !== 8) {
    return 'CEP invalido: deve ter 8 digitos';
  }

  const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

  if (!response.ok) {
    return `Erro ao consultar ViaCEP: HTTP ${response.status}`;
  }

  const data = (await response.json()) as {
    erro?: boolean;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
    complemento?: string;
  };

  if (data.erro) {
    return `CEP ${input.cep} nao encontrado`;
  }

  return JSON.stringify({
    cep: input.cep,
    logradouro: data.logradouro,
    bairro: data.bairro,
    cidade: data.localidade,
    estado: data.uf,
    complemento: data.complemento || '',
  });
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
      tools: [buscarCepTool],
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [Tool: buscar_cep(${JSON.stringify(block.input)})]`);
        const result = await handleBuscarCep(block.input as { cep: string });
        console.log(`  [Resultado: ${result}]`);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });
    } else {
      continueLoop = false;
    }
  }
}

await runToolLoop(
  'Qual o endereco do CEP 01001-000? E do CEP 20040-020?'
);

console.log('\n--- Exercicio 3 completo! ---');
