/**
 * Solucao 4: Tools Encadeadas
 *
 * Claude encadeia 3 tools: dados → metricas → relatorio.
 * Execute: npx tsx solucoes/ex4-tool-encadeada.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Dados simulados de vendas
const vendasDB: Record<
  string,
  Array<{ produto: string; valor: number; data: string }>
> = {
  '2026-01': [
    { produto: 'Plano Pro', valor: 299, data: '2026-01-05' },
    { produto: 'Plano Enterprise', valor: 999, data: '2026-01-12' },
    { produto: 'Plano Pro', valor: 299, data: '2026-01-20' },
    { produto: 'Plano Starter', valor: 49, data: '2026-01-25' },
  ],
  '2026-02': [
    { produto: 'Plano Enterprise', valor: 999, data: '2026-02-03' },
    { produto: 'Plano Pro', valor: 299, data: '2026-02-10' },
    { produto: 'Plano Pro', valor: 299, data: '2026-02-14' },
    { produto: 'Plano Enterprise', valor: 999, data: '2026-02-20' },
    { produto: 'Plano Starter', valor: 49, data: '2026-02-28' },
  ],
};

const tools: Anthropic.Tool[] = [
  {
    name: 'buscar_vendas',
    description:
      'Busca vendas de um mes especifico. Retorna array de vendas com produto, valor e data.',
    input_schema: {
      type: 'object' as const,
      properties: {
        mes: {
          type: 'string',
          description: 'Mes no formato YYYY-MM (ex: 2026-01)',
        },
      },
      required: ['mes'],
    },
  },
  {
    name: 'calcular_metricas',
    description:
      'Calcula metricas a partir de dados de vendas: total, media, contagem por produto.',
    input_schema: {
      type: 'object' as const,
      properties: {
        vendas: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              produto: { type: 'string' },
              valor: { type: 'number' },
              data: { type: 'string' },
            },
          },
          description: 'Array de vendas para calcular metricas',
        },
        mes: { type: 'string', description: 'Identificador do mes' },
      },
      required: ['vendas', 'mes'],
    },
  },
  {
    name: 'gerar_relatorio',
    description:
      'Gera relatorio comparativo entre dois conjuntos de metricas mensais.',
    input_schema: {
      type: 'object' as const,
      properties: {
        metricas_a: {
          type: 'object',
          description: 'Metricas do primeiro mes',
        },
        metricas_b: {
          type: 'object',
          description: 'Metricas do segundo mes',
        },
      },
      required: ['metricas_a', 'metricas_b'],
    },
  },
];

function handleBuscarVendas(input: { mes: string }): string {
  const vendas = vendasDB[input.mes];
  if (!vendas) return JSON.stringify({ erro: `Sem dados para ${input.mes}` });
  return JSON.stringify(vendas);
}

function handleCalcularMetricas(input: {
  vendas: Array<{ produto: string; valor: number }>;
  mes: string;
}): string {
  const total = input.vendas.reduce((sum, v) => sum + v.valor, 0);
  const media = total / input.vendas.length;
  const porProduto: Record<string, { count: number; total: number }> = {};

  for (const v of input.vendas) {
    if (!porProduto[v.produto]) {
      porProduto[v.produto] = { count: 0, total: 0 };
    }
    porProduto[v.produto].count++;
    porProduto[v.produto].total += v.valor;
  }

  return JSON.stringify({
    mes: input.mes,
    totalVendas: input.vendas.length,
    receita: total,
    ticketMedio: Math.round(media * 100) / 100,
    porProduto,
  });
}

function handleGerarRelatorio(input: {
  metricas_a: { mes: string; receita: number; totalVendas: number; ticketMedio: number };
  metricas_b: { mes: string; receita: number; totalVendas: number; ticketMedio: number };
}): string {
  const a = input.metricas_a;
  const b = input.metricas_b;
  const crescimentoReceita = ((b.receita - a.receita) / a.receita) * 100;
  const crescimentoVendas = ((b.totalVendas - a.totalVendas) / a.totalVendas) * 100;

  return JSON.stringify({
    periodo: `${a.mes} vs ${b.mes}`,
    crescimentoReceita: `${crescimentoReceita.toFixed(1)}%`,
    crescimentoVendas: `${crescimentoVendas.toFixed(1)}%`,
    mesA: { receita: a.receita, vendas: a.totalVendas, ticket: a.ticketMedio },
    mesB: { receita: b.receita, vendas: b.totalVendas, ticket: b.ticketMedio },
  });
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'buscar_vendas':
      return handleBuscarVendas(input as { mes: string });
    case 'calcular_metricas':
      return handleCalcularMetricas(
        input as {
          vendas: Array<{ produto: string; valor: number }>;
          mes: string;
        }
      );
    case 'gerar_relatorio':
      return handleGerarRelatorio(input as {
        metricas_a: { mes: string; receita: number; totalVendas: number; ticketMedio: number };
        metricas_b: { mes: string; receita: number; totalVendas: number; ticketMedio: number };
      });
    default:
      return `Tool desconhecida: ${name}`;
  }
}

async function runToolLoop(question: string): Promise<void> {
  console.log(`Pergunta: "${question}"\n`);

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  let step = 0;
  let continueLoop = true;

  while (continueLoop) {
    step++;
    console.log(`--- Step ${step} ---`);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      tools,
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        const inputStr = JSON.stringify(block.input).slice(0, 100);
        console.log(`  [Tool: ${block.name}(${inputStr}...)]`);
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
        console.log(`  [Resultado: ${result.slice(0, 120)}...]`);
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
  'Compare as vendas de janeiro e fevereiro de 2026. Busque os dados, calcule metricas e gere um relatorio comparativo.'
);

console.log('\n--- Exercicio 4 completo! ---');
