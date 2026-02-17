/**
 * Solucao 12: Execucao Paralela de Tools
 *
 * Promise.all() para executar tools independentes em paralelo.
 * Execute: npx tsx solucoes/ex12-tool-paralela.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Servicos simulados com latencia ===

async function buscarClima(cidade: string): Promise<string> {
  const delay = 1000 + Math.random() * 2000;
  await new Promise((r) => setTimeout(r, delay));
  const climas: Record<string, { temp: number; condicao: string }> = {
    'Sao Paulo': { temp: 28, condicao: 'nublado' },
    'Rio de Janeiro': { temp: 32, condicao: 'ensolarado' },
    'Belo Horizonte': { temp: 25, condicao: 'parcialmente nublado' },
  };
  const clima = climas[cidade] || { temp: 22, condicao: 'desconhecido' };
  return JSON.stringify({ cidade, ...clima, latencia: `${Math.round(delay)}ms` });
}

async function buscarCotacao(moeda: string): Promise<string> {
  const delay = 500 + Math.random() * 1500;
  await new Promise((r) => setTimeout(r, delay));
  const cotacoes: Record<string, number> = { USD: 5.12, EUR: 5.56, GBP: 6.48, JPY: 0.034 };
  return JSON.stringify({
    moeda,
    valor_brl: cotacoes[moeda.toUpperCase()] || 1,
    latencia: `${Math.round(delay)}ms`,
  });
}

async function buscarNoticias(tema: string): Promise<string> {
  const delay = 800 + Math.random() * 1200;
  await new Promise((r) => setTimeout(r, delay));
  return JSON.stringify({
    tema,
    noticias: [
      { titulo: `${tema}: novas tendencias para 2026`, fonte: 'TechBlog' },
      { titulo: `Mercado de ${tema} cresce 15%`, fonte: 'Economia Hoje' },
    ],
    latencia: `${Math.round(delay)}ms`,
  });
}

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'buscar_clima',
    description:
      'Busca a temperatura e condicao climatica atual de uma cidade brasileira.',
    input_schema: {
      type: 'object' as const,
      properties: {
        cidade: { type: 'string', description: 'Nome da cidade. Ex: Sao Paulo, Rio de Janeiro' },
      },
      required: ['cidade'],
    },
  },
  {
    name: 'buscar_cotacao',
    description:
      'Busca a cotacao atual de uma moeda estrangeira em relacao ao real (BRL).',
    input_schema: {
      type: 'object' as const,
      properties: {
        moeda: { type: 'string', description: 'Codigo da moeda. Ex: USD, EUR, GBP' },
      },
      required: ['moeda'],
    },
  },
  {
    name: 'buscar_noticias',
    description:
      'Busca as noticias mais recentes sobre um tema especifico.',
    input_schema: {
      type: 'object' as const,
      properties: {
        tema: { type: 'string', description: 'Tema para buscar noticias. Ex: tecnologia, economia' },
      },
      required: ['tema'],
    },
  },
];

// === Dispatcher assincrono ===

async function dispatchToolAsync(
  name: string,
  input: Record<string, unknown>
): Promise<string> {
  switch (name) {
    case 'buscar_clima':
      return buscarClima(input.cidade as string);
    case 'buscar_cotacao':
      return buscarCotacao(input.moeda as string);
    case 'buscar_noticias':
      return buscarNoticias(input.tema as string);
    default:
      return `Tool desconhecida: ${name}`;
  }
}

// === Loop de tool use com execucao paralela ===

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
      tools,
      messages,
    });

    // Coleta todas as tool calls desta resposta
    const toolCalls: Array<{
      id: string;
      name: string;
      input: Record<string, unknown>;
    }> = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [Tool requisitada: ${block.name}(${JSON.stringify(block.input)})]`);
        toolCalls.push({
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        });
      }
    }

    if (response.stop_reason === 'tool_use' && toolCalls.length > 0) {
      console.log(`\n  Executando ${toolCalls.length} tools em PARALELO...`);
      const inicio = Date.now();

      // Execucao paralela com Promise.all
      const resultados = await Promise.all(
        toolCalls.map((tc) => dispatchToolAsync(tc.name, tc.input))
      );

      const tempoTotal = Date.now() - inicio;
      console.log(`  Todas finalizadas em ${tempoTotal}ms (paralelo)\n`);

      // Monta tool_results
      const toolResults: Anthropic.ToolResultBlockParam[] = toolCalls.map(
        (tc, i) => ({
          type: 'tool_result' as const,
          tool_use_id: tc.id,
          content: resultados[i],
        })
      );

      for (const [i, tc] of toolCalls.entries()) {
        console.log(`  [${tc.name} -> ${resultados[i].slice(0, 80)}...]`);
      }

      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });
    } else {
      continueLoop = false;
    }
  }
}

await runToolLoop(
  'Me diga a temperatura em Sao Paulo, a cotacao do dolar e as ultimas noticias de tecnologia.'
);

console.log('\n--- Exercicio 12 completo! ---');
