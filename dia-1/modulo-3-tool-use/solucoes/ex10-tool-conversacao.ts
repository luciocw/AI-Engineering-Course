/**
 * Solucao 10: Tools em Conversas Multi-Turn
 *
 * Conversa com multiplas rodadas mantendo contexto e tools.
 * Execute: npx tsx solucoes/ex10-tool-conversacao.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Dados simulados - sistema de pedidos ===

const pedidosDB: Record<string, {
  id: string;
  cliente: string;
  itens: Array<{ nome: string; qtd: number; preco: number }>;
  status: string;
  data: string;
}> = {
  'PED-001': {
    id: 'PED-001', cliente: 'Maria Silva',
    itens: [{ nome: 'Notebook', qtd: 1, preco: 4500 }, { nome: 'Mouse', qtd: 2, preco: 89 }],
    status: 'enviado', data: '2026-02-10',
  },
  'PED-002': {
    id: 'PED-002', cliente: 'Maria Silva',
    itens: [{ nome: 'Teclado', qtd: 1, preco: 350 }],
    status: 'processando', data: '2026-02-15',
  },
  'PED-003': {
    id: 'PED-003', cliente: 'Joao Santos',
    itens: [{ nome: 'Monitor', qtd: 1, preco: 2800 }],
    status: 'entregue', data: '2026-02-01',
  },
};

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'buscar_pedidos',
    description:
      'Busca pedidos por nome do cliente ou por ID especifico. ' +
      'Retorna detalhes completos incluindo itens, status e data.',
    input_schema: {
      type: 'object' as const,
      properties: {
        cliente: {
          type: 'string',
          description: 'Nome do cliente para buscar todos os pedidos dele',
        },
        id: {
          type: 'string',
          description: 'ID especifico do pedido (ex: PED-001)',
        },
      },
      required: [],
    },
  },
  {
    name: 'atualizar_status',
    description:
      'Atualiza o status de um pedido existente. ' +
      'Status possiveis: processando, enviado, em_transito, entregue, cancelado.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'ID do pedido a atualizar (ex: PED-001)',
        },
        novo_status: {
          type: 'string',
          enum: ['processando', 'enviado', 'em_transito', 'entregue', 'cancelado'],
          description: 'Novo status do pedido',
        },
      },
      required: ['id', 'novo_status'],
    },
  },
  {
    name: 'calcular_total',
    description:
      'Calcula o valor total de um pedido, opcionalmente aplicando desconto percentual.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'ID do pedido para calcular total',
        },
        desconto: {
          type: 'number',
          description: 'Percentual de desconto (0-100). Opcional.',
        },
      },
      required: ['id'],
    },
  },
];

// === Handlers ===

function handleBuscarPedidos(input: { cliente?: string; id?: string }): string {
  if (input.id) {
    const pedido = pedidosDB[input.id];
    if (!pedido) return JSON.stringify({ erro: `Pedido ${input.id} nao encontrado` });
    return JSON.stringify(pedido);
  }

  if (input.cliente) {
    const pedidos = Object.values(pedidosDB).filter(
      (p) => p.cliente.toLowerCase().includes(input.cliente!.toLowerCase())
    );
    if (pedidos.length === 0) {
      return JSON.stringify({ erro: `Nenhum pedido encontrado para "${input.cliente}"` });
    }
    return JSON.stringify(pedidos);
  }

  return JSON.stringify({ erro: 'Informe cliente ou id para buscar' });
}

function handleAtualizarStatus(input: { id: string; novo_status: string }): string {
  const pedido = pedidosDB[input.id];
  if (!pedido) return JSON.stringify({ erro: `Pedido ${input.id} nao encontrado` });

  const statusAnterior = pedido.status;
  pedido.status = input.novo_status;

  return JSON.stringify({
    id: input.id,
    status_anterior: statusAnterior,
    novo_status: input.novo_status,
    atualizado_em: new Date().toISOString(),
  });
}

function handleCalcularTotal(input: { id: string; desconto?: number }): string {
  const pedido = pedidosDB[input.id];
  if (!pedido) return JSON.stringify({ erro: `Pedido ${input.id} nao encontrado` });

  const subtotal = pedido.itens.reduce((sum, item) => sum + item.preco * item.qtd, 0);
  const desconto = input.desconto || 0;
  const valorDesconto = subtotal * (desconto / 100);
  const total = subtotal - valorDesconto;

  return JSON.stringify({
    pedido_id: pedido.id,
    itens: pedido.itens.map((i) => ({
      nome: i.nome,
      qtd: i.qtd,
      preco_unitario: i.preco,
      subtotal: i.preco * i.qtd,
    })),
    subtotal: `R$ ${subtotal.toFixed(2)}`,
    desconto: `${desconto}% (R$ ${valorDesconto.toFixed(2)})`,
    total: `R$ ${total.toFixed(2)}`,
  });
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'buscar_pedidos':
      return handleBuscarPedidos(input as { cliente?: string; id?: string });
    case 'atualizar_status':
      return handleAtualizarStatus(input as { id: string; novo_status: string });
    case 'calcular_total':
      return handleCalcularTotal(input as { id: string; desconto?: number });
    default:
      return `Tool desconhecida: ${name}`;
  }
}

// === Conversa multi-turn ===

async function conversaMultiTurn(): Promise<void> {
  const messages: Anthropic.MessageParam[] = [];

  const perguntas = [
    'Busque os pedidos da Maria Silva',
    'Qual o total do pedido PED-001 com 10% de desconto?',
    'Atualize o status do PED-002 para enviado',
  ];

  for (const pergunta of perguntas) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Usuario: ${pergunta}`);
    console.log('='.repeat(50));

    messages.push({ role: 'user', content: pergunta });

    let continueLoop = true;

    while (continueLoop) {
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        tools,
        messages,
      });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type === 'text') {
          console.log(`\nClaude: ${block.text}`);
        } else if (block.type === 'tool_use') {
          console.log(`  [Tool: ${block.name}(${JSON.stringify(block.input)})]`);
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
        // Adiciona a resposta final do assistente ao historico
        messages.push({ role: 'assistant', content: response.content });
        continueLoop = false;
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Total de mensagens no historico: ${messages.length}`);
}

await conversaMultiTurn();

console.log('\n--- Exercicio 10 completo! ---');
