/**
 * Desafio: Mini Assistente de Pesquisa
 *
 * Assistente com 3+ tools que responde perguntas complexas de negocios.
 * Execute: npx tsx desafio/research-assistant.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Base de dados simulada ===
const clientes = [
  { id: 1, nome: 'TechCorp', plano: 'Enterprise', mrr: 999, meses: 18, ativo: true },
  { id: 2, nome: 'StartupXYZ', plano: 'Pro', mrr: 299, meses: 6, ativo: true },
  { id: 3, nome: 'BigData Inc', plano: 'Enterprise', mrr: 999, meses: 24, ativo: true },
  { id: 4, nome: 'DevShop', plano: 'Starter', mrr: 49, meses: 3, ativo: false },
  { id: 5, nome: 'CloudFirst', plano: 'Pro', mrr: 299, meses: 12, ativo: true },
  { id: 6, nome: 'DataFlow', plano: 'Pro', mrr: 299, meses: 2, ativo: false },
  { id: 7, nome: 'AILabs', plano: 'Enterprise', mrr: 999, meses: 8, ativo: true },
  { id: 8, nome: 'WebAgency', plano: 'Starter', mrr: 49, meses: 1, ativo: false },
];

const tools: Anthropic.Tool[] = [
  {
    name: 'buscar_dados',
    description:
      'Busca dados de clientes. Pode filtrar por plano, status (ativo/inativo) ou retornar todos.',
    input_schema: {
      type: 'object' as const,
      properties: {
        filtro: {
          type: 'string',
          enum: ['todos', 'ativos', 'inativos', 'Enterprise', 'Pro', 'Starter'],
          description: 'Filtro para busca de clientes',
        },
      },
      required: ['filtro'],
    },
  },
  {
    name: 'calcular',
    description:
      'Calcula metricas de negocios a partir de dados de clientes: MRR total, LTV medio, churn rate, receita por plano.',
    input_schema: {
      type: 'object' as const,
      properties: {
        metrica: {
          type: 'string',
          enum: ['mrr_total', 'ltv_medio', 'churn_rate', 'receita_por_plano', 'cliente_top'],
          description: 'Metrica a calcular',
        },
        dados: {
          type: 'array',
          items: { type: 'object' },
          description: 'Dados de clientes para calcular',
        },
      },
      required: ['metrica', 'dados'],
    },
  },
  {
    name: 'formatar_relatorio',
    description:
      'Formata dados e metricas em um relatorio estruturado com titulo, secoes e conclusao.',
    input_schema: {
      type: 'object' as const,
      properties: {
        titulo: { type: 'string', description: 'Titulo do relatorio' },
        secoes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              subtitulo: { type: 'string' },
              conteudo: { type: 'string' },
            },
          },
          description: 'Secoes do relatorio',
        },
      },
      required: ['titulo', 'secoes'],
    },
  },
];

type ClienteData = {
  id: number;
  nome: string;
  plano: string;
  mrr: number;
  meses: number;
  ativo: boolean;
};

function handleBuscarDados(input: { filtro: string }): string {
  let resultado: ClienteData[];

  switch (input.filtro) {
    case 'todos':
      resultado = clientes;
      break;
    case 'ativos':
      resultado = clientes.filter((c) => c.ativo);
      break;
    case 'inativos':
      resultado = clientes.filter((c) => !c.ativo);
      break;
    default:
      resultado = clientes.filter((c) => c.plano === input.filtro);
  }

  return JSON.stringify(resultado);
}

function handleCalcular(input: {
  metrica: string;
  dados: ClienteData[];
}): string {
  const dados = input.dados;

  switch (input.metrica) {
    case 'mrr_total': {
      const ativos = dados.filter((d) => d.ativo);
      const total = ativos.reduce((sum, d) => sum + d.mrr, 0);
      return JSON.stringify({ mrr_total: total, clientes_ativos: ativos.length });
    }
    case 'ltv_medio': {
      const ltvs = dados.map((d) => d.mrr * d.meses);
      const media = ltvs.reduce((a, b) => a + b, 0) / ltvs.length;
      return JSON.stringify({ ltv_medio: Math.round(media), clientes: dados.length });
    }
    case 'churn_rate': {
      const total = dados.length;
      const inativos = dados.filter((d) => !d.ativo).length;
      return JSON.stringify({
        churn_rate: `${((inativos / total) * 100).toFixed(1)}%`,
        inativos,
        total,
      });
    }
    case 'receita_por_plano': {
      const porPlano: Record<string, { mrr: number; count: number }> = {};
      for (const d of dados.filter((d) => d.ativo)) {
        if (!porPlano[d.plano]) porPlano[d.plano] = { mrr: 0, count: 0 };
        porPlano[d.plano].mrr += d.mrr;
        porPlano[d.plano].count++;
      }
      return JSON.stringify(porPlano);
    }
    case 'cliente_top': {
      const sorted = [...dados].sort((a, b) => b.mrr * b.meses - a.mrr * a.meses);
      return JSON.stringify({
        top: sorted[0],
        receita_total: sorted[0].mrr * sorted[0].meses,
      });
    }
    default:
      return JSON.stringify({ erro: `Metrica desconhecida: ${input.metrica}` });
  }
}

function handleFormatar(input: {
  titulo: string;
  secoes: Array<{ subtitulo: string; conteudo: string }>;
}): string {
  const lines = [`=== ${input.titulo} ===`, ''];
  for (const secao of input.secoes) {
    lines.push(`--- ${secao.subtitulo} ---`);
    lines.push(secao.conteudo);
    lines.push('');
  }
  return lines.join('\n');
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'buscar_dados':
      return handleBuscarDados(input as { filtro: string });
    case 'calcular':
      return handleCalcular(input as { metrica: string; dados: ClienteData[] });
    case 'formatar_relatorio':
      return handleFormatar(
        input as { titulo: string; secoes: Array<{ subtitulo: string; conteudo: string }> }
      );
    default:
      return `Tool desconhecida: ${name}`;
  }
}

async function ask(question: string): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Pergunta: "${question}"\n`);

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  let continueLoop = true;
  let step = 0;

  while (continueLoop) {
    step++;
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system:
        'Voce e um analista de dados de uma empresa SaaS. Use as tools disponiveis para buscar dados, calcular metricas e gerar relatorios estruturados. Sempre baseie suas respostas em dados concretos.',
      tools,
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(block.text);
      } else if (block.type === 'tool_use') {
        console.log(`  [Step ${step}: ${block.name}]`);
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
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

// Perguntas de teste
const perguntas = [
  'Qual cliente gerou mais receita total (MRR * meses)?',
  'Qual a taxa de churn por plano? Compare Enterprise, Pro e Starter.',
  'Gere um relatorio executivo com MRR total, LTV medio e churn rate geral.',
];

for (const pergunta of perguntas) {
  await ask(pergunta);
}

console.log('\n--- Desafio completo! ---');
