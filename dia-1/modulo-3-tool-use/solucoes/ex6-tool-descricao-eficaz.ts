/**
 * Solucao 6: Descricoes Eficazes para Tools
 *
 * Comparacao entre descricoes ruins e boas.
 * Execute: npx tsx solucoes/ex6-tool-descricao-eficaz.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Tools com descricoes RUINS ===

const toolsRuins: Anthropic.Tool[] = [
  {
    name: 'buscar',
    description: 'Busca coisas',
    input_schema: {
      type: 'object' as const,
      properties: {
        q: { type: 'string', description: 'query' },
      },
      required: ['q'],
    },
  },
  {
    name: 'calcular',
    description: 'Faz calculos',
    input_schema: {
      type: 'object' as const,
      properties: {
        expr: { type: 'string', description: 'expressao' },
      },
      required: ['expr'],
    },
  },
  {
    name: 'enviar',
    description: 'Envia mensagem',
    input_schema: {
      type: 'object' as const,
      properties: {
        dest: { type: 'string', description: 'destino' },
        msg: { type: 'string', description: 'mensagem' },
      },
      required: ['dest', 'msg'],
    },
  },
];

// === Tools com descricoes BOAS ===

const toolsBoas: Anthropic.Tool[] = [
  {
    name: 'buscar_documentos',
    description:
      'Busca documentos internos da empresa por palavras-chave. ' +
      'Pesquisa no titulo e conteudo de documentos como politicas, manuais e procedimentos. ' +
      'Retorna uma lista com titulo, resumo e data de atualizacao de cada documento encontrado. ' +
      'Use quando o usuario perguntar sobre documentos, politicas ou procedimentos da empresa. ' +
      'NAO use para buscas na internet ou informacoes externas.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description:
            'Palavras-chave para busca. Exemplos: "politica ferias", "manual onboarding", "procedimento reembolso"',
        },
        limite: {
          type: 'number',
          description: 'Numero maximo de resultados (1-20, default: 5)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'calculadora_financeira',
    description:
      'Realiza calculos financeiros como juros compostos, ROI, margem de lucro e conversao de moedas. ' +
      'Use para perguntas envolvendo calculos numericos com dinheiro ou porcentagens. ' +
      'NAO use para calculos matematicos simples (soma, subtracao) — Claude pode fazer esses sozinho. ' +
      'Retorna o resultado formatado em reais (BRL) com 2 casas decimais.',
    input_schema: {
      type: 'object' as const,
      properties: {
        tipo: {
          type: 'string',
          enum: ['juros_compostos', 'roi', 'margem_lucro', 'conversao_moeda'],
          description: 'Tipo do calculo financeiro',
        },
        valores: {
          type: 'object',
          description:
            'Valores para o calculo. Para juros: {principal, taxa, meses}. Para ROI: {investimento, retorno}. Para margem: {custo, preco_venda}.',
        },
      },
      required: ['tipo', 'valores'],
    },
  },
  {
    name: 'enviar_notificacao',
    description:
      'Envia notificacao push para um usuario ou equipe do sistema interno. ' +
      'A notificacao aparece no painel do destinatario em tempo real. ' +
      'Use para alertas, lembretes ou comunicados que precisam de atencao imediata. ' +
      'NAO use para envio de emails (use enviar_email para isso). ' +
      'Retorna confirmacao com ID da notificacao e status de entrega.',
    input_schema: {
      type: 'object' as const,
      properties: {
        destinatario: {
          type: 'string',
          description: 'ID do usuario ou nome da equipe. Exemplos: "user_123", "equipe_vendas"',
        },
        titulo: {
          type: 'string',
          description: 'Titulo curto da notificacao (max 100 caracteres)',
        },
        mensagem: {
          type: 'string',
          description: 'Corpo da notificacao com detalhes',
        },
        prioridade: {
          type: 'string',
          enum: ['baixa', 'media', 'alta', 'urgente'],
          description: 'Nivel de prioridade (default: media)',
        },
      },
      required: ['destinatario', 'titulo', 'mensagem'],
    },
  },
];

// === Handlers simulados ===

function handleBuscarDocumentos(input: { query: string; limite?: number }): string {
  const docs = [
    { titulo: 'Politica de Ferias 2026', resumo: 'Regras e procedimentos para solicitar ferias', data: '2026-01-15' },
    { titulo: 'Manual do Colaborador', resumo: 'Guia completo de normas e beneficios', data: '2025-12-01' },
    { titulo: 'Procedimento de Reembolso', resumo: 'Como solicitar reembolso de despesas', data: '2026-02-01' },
  ];
  const resultados = docs.filter(
    (d) => d.titulo.toLowerCase().includes(input.query.toLowerCase()) ||
           d.resumo.toLowerCase().includes(input.query.toLowerCase())
  );
  return JSON.stringify(resultados.slice(0, input.limite || 5));
}

function handleCalculadoraFinanceira(input: { tipo: string; valores: Record<string, number> }): string {
  switch (input.tipo) {
    case 'juros_compostos': {
      const { principal, taxa, meses } = input.valores;
      const montante = principal * Math.pow(1 + taxa / 100, meses);
      return JSON.stringify({ montante: montante.toFixed(2), juros: (montante - principal).toFixed(2) });
    }
    case 'roi': {
      const roi = ((input.valores.retorno - input.valores.investimento) / input.valores.investimento) * 100;
      return JSON.stringify({ roi: `${roi.toFixed(2)}%` });
    }
    case 'margem_lucro': {
      const margem = ((input.valores.preco_venda - input.valores.custo) / input.valores.preco_venda) * 100;
      return JSON.stringify({ margem: `${margem.toFixed(2)}%` });
    }
    default:
      return JSON.stringify({ erro: 'Tipo de calculo invalido' });
  }
}

function handleEnviarNotificacao(input: {
  destinatario: string;
  titulo: string;
  mensagem: string;
  prioridade?: string;
}): string {
  return JSON.stringify({
    id: `notif_${Date.now()}`,
    destinatario: input.destinatario,
    titulo: input.titulo,
    prioridade: input.prioridade || 'media',
    status: 'entregue',
  });
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'buscar_documentos':
      return handleBuscarDocumentos(input as { query: string; limite?: number });
    case 'calculadora_financeira':
      return handleCalculadoraFinanceira(input as { tipo: string; valores: Record<string, number> });
    case 'enviar_notificacao':
      return handleEnviarNotificacao(input as { destinatario: string; titulo: string; mensagem: string; prioridade?: string });
    default:
      return `Tool desconhecida: ${name}`;
  }
}

// === Teste comparativo ===

async function testarDescricoes(
  tools: Anthropic.Tool[],
  label: string,
  pergunta: string
): Promise<void> {
  console.log(`\n=== ${label} ===`);
  console.log(`Pergunta: "${pergunta}"\n`);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    tools,
    messages: [{ role: 'user', content: pergunta }],
  });

  for (const block of response.content) {
    if (block.type === 'text') {
      console.log(`  Claude: ${block.text}`);
    } else if (block.type === 'tool_use') {
      console.log(`  Tool escolhida: ${block.name}`);
      console.log(`  Input: ${JSON.stringify(block.input)}`);
    }
  }
}

const pergunta = 'Preciso encontrar o documento sobre politica de ferias da empresa';

await testarDescricoes(toolsRuins, 'Com descricoes RUINS', pergunta);
await testarDescricoes(toolsBoas, 'Com descricoes BOAS', pergunta);

// === Teste com tool loop completo usando tools boas ===

console.log('\n=== Loop completo com tools boas ===');

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
      tools: toolsBoas,
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [Tool: ${block.name}(${JSON.stringify(block.input)})]`);
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
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

await runToolLoop('Busque o documento sobre ferias e calcule o ROI de um investimento de R$10000 que retornou R$15000.');

console.log('\n--- Exercicio 6 completo! ---');
