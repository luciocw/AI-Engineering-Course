/**
 * Solucao 17: Composicao de Tools
 *
 * Tool de alto nivel que compoe operacoes primitivas internamente.
 * Execute: npx tsx solucoes/ex17-tool-composicao.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Dados simulados ===

const estoqueDB: Record<string, { preco: number; quantidade: number }> = {
  notebook: { preco: 4500, quantidade: 15 },
  mouse: { preco: 89, quantidade: 200 },
  teclado: { preco: 250, quantidade: 45 },
  monitor: { preco: 2800, quantidade: 8 },
  headset: { preco: 350, quantidade: 30 },
};

const fretePorCidade: Record<string, number> = {
  'sao paulo': 15,
  'rio de janeiro': 25,
  'belo horizonte': 30,
  curitiba: 35,
  'porto alegre': 40,
};

const cuponsDB: Record<string, number> = {
  DESCONTO10: 10,
  DESCONTO20: 20,
  PRIMEIRACOMPRA: 15,
};

let nextPedidoId = 1001;

// === Operacoes primitivas ===

function validarEstoque(
  produto: string,
  quantidade: number
): { ok: boolean; msg: string; preco?: number } {
  const item = estoqueDB[produto.toLowerCase()];
  if (!item) return { ok: false, msg: `Produto "${produto}" nao encontrado` };
  if (item.quantidade < quantidade) {
    return { ok: false, msg: `Estoque insuficiente: ${produto} tem ${item.quantidade}, pedido ${quantidade}` };
  }
  return { ok: true, msg: 'OK', preco: item.preco };
}

function calcularFrete(cidade: string): { valor: number; prazo: string } {
  const frete = fretePorCidade[cidade.toLowerCase()];
  if (frete === undefined) return { valor: 50, prazo: '10-15 dias uteis' };
  return { valor: frete, prazo: frete <= 20 ? '3-5 dias uteis' : '5-8 dias uteis' };
}

function aplicarDesconto(total: number, cupom?: string): { desconto: number; percentual: number } {
  if (!cupom) return { desconto: 0, percentual: 0 };
  const percentual = cuponsDB[cupom.toUpperCase()];
  if (!percentual) return { desconto: 0, percentual: 0 };
  return { desconto: total * (percentual / 100), percentual };
}

function criarPedido(dados: {
  email: string;
  itens: Array<{ produto: string; qtd: number; preco: number }>;
  subtotal: number;
  frete: number;
  desconto: number;
  total: number;
}): { id: string; status: string } {
  // Atualizar estoque
  for (const item of dados.itens) {
    const estoque = estoqueDB[item.produto.toLowerCase()];
    if (estoque) estoque.quantidade -= item.qtd;
  }
  return { id: `PED-${nextPedidoId++}`, status: 'criado' };
}

function enviarConfirmacao(email: string, pedidoId: string): { enviado: boolean; timestamp: string } {
  return { enviado: true, timestamp: new Date().toISOString() };
}

// === Tool composta ===

const tools: Anthropic.Tool[] = [
  {
    name: 'criar_pedido_completo',
    description:
      'Cria um pedido completo de forma atomica. Internamente: valida estoque de todos os produtos, ' +
      'calcula frete pela cidade, aplica cupom de desconto se fornecido, cria o pedido e envia email de confirmacao. ' +
      'Retorna resumo com todos os detalhes ou erro se alguma etapa falhar.',
    input_schema: {
      type: 'object' as const,
      properties: {
        cliente_email: {
          type: 'string',
          description: 'Email do cliente para confirmacao',
        },
        produtos: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              nome: { type: 'string', description: 'Nome do produto' },
              quantidade: { type: 'number', description: 'Quantidade desejada' },
            },
            required: ['nome', 'quantidade'],
          },
          description: 'Lista de produtos com quantidade',
        },
        cidade_entrega: {
          type: 'string',
          description: 'Cidade para calculo de frete',
        },
        cupom_desconto: {
          type: 'string',
          description: 'Cupom de desconto (opcional)',
        },
      },
      required: ['cliente_email', 'produtos', 'cidade_entrega'],
    },
  },
  {
    name: 'consultar_catalogo',
    description:
      'Consulta o catalogo de produtos com precos e estoque disponivel.',
    input_schema: {
      type: 'object' as const,
      properties: {
        produto: {
          type: 'string',
          description: 'Nome do produto para consultar (ou "todos" para listar tudo)',
        },
      },
      required: ['produto'],
    },
  },
];

// === Handler composto ===

function handleCriarPedidoCompleto(input: {
  cliente_email: string;
  produtos: Array<{ nome: string; quantidade: number }>;
  cidade_entrega: string;
  cupom_desconto?: string;
}): string {
  const etapas: string[] = [];

  // Etapa 1: Validar estoque
  etapas.push('1. Validando estoque...');
  const itensValidados: Array<{ produto: string; qtd: number; preco: number }> = [];

  for (const p of input.produtos) {
    const validacao = validarEstoque(p.nome, p.quantidade);
    if (!validacao.ok) {
      return JSON.stringify({
        sucesso: false,
        etapa_falha: 'validacao_estoque',
        erro: validacao.msg,
        etapas_executadas: etapas,
      });
    }
    itensValidados.push({ produto: p.nome, qtd: p.quantidade, preco: validacao.preco! });
    etapas.push(`   ${p.nome}: ${p.quantidade}x R$ ${validacao.preco!.toFixed(2)} - OK`);
  }

  // Etapa 2: Calcular subtotal
  const subtotal = itensValidados.reduce((sum, i) => sum + i.preco * i.qtd, 0);
  etapas.push(`2. Subtotal: R$ ${subtotal.toFixed(2)}`);

  // Etapa 3: Calcular frete
  const frete = calcularFrete(input.cidade_entrega);
  etapas.push(`3. Frete para ${input.cidade_entrega}: R$ ${frete.valor.toFixed(2)} (${frete.prazo})`);

  // Etapa 4: Aplicar desconto
  const desc = aplicarDesconto(subtotal, input.cupom_desconto);
  if (desc.desconto > 0) {
    etapas.push(`4. Desconto (${input.cupom_desconto} - ${desc.percentual}%): -R$ ${desc.desconto.toFixed(2)}`);
  } else if (input.cupom_desconto) {
    etapas.push(`4. Cupom "${input.cupom_desconto}" invalido — sem desconto`);
  } else {
    etapas.push('4. Sem cupom de desconto');
  }

  // Etapa 5: Criar pedido
  const total = subtotal + frete.valor - desc.desconto;
  const pedido = criarPedido({
    email: input.cliente_email,
    itens: itensValidados,
    subtotal,
    frete: frete.valor,
    desconto: desc.desconto,
    total,
  });
  etapas.push(`5. Pedido criado: ${pedido.id}`);

  // Etapa 6: Enviar confirmacao
  const confirmacao = enviarConfirmacao(input.cliente_email, pedido.id);
  etapas.push(`6. Confirmacao enviada para ${input.cliente_email}`);

  return JSON.stringify({
    sucesso: true,
    pedido: {
      id: pedido.id,
      itens: itensValidados.map((i) => ({
        produto: i.produto,
        quantidade: i.qtd,
        preco_unitario: `R$ ${i.preco.toFixed(2)}`,
        subtotal: `R$ ${(i.preco * i.qtd).toFixed(2)}`,
      })),
      subtotal: `R$ ${subtotal.toFixed(2)}`,
      frete: `R$ ${frete.valor.toFixed(2)}`,
      prazo_entrega: frete.prazo,
      desconto: `R$ ${desc.desconto.toFixed(2)}`,
      total: `R$ ${total.toFixed(2)}`,
    },
    confirmacao: {
      email: input.cliente_email,
      enviado: confirmacao.enviado,
      timestamp: confirmacao.timestamp,
    },
    etapas_executadas: etapas,
  }, null, 2);
}

function handleConsultarCatalogo(input: { produto: string }): string {
  if (input.produto.toLowerCase() === 'todos') {
    return JSON.stringify(
      Object.entries(estoqueDB).map(([nome, info]) => ({
        produto: nome,
        preco: `R$ ${info.preco.toFixed(2)}`,
        estoque: info.quantidade,
      }))
    );
  }
  const item = estoqueDB[input.produto.toLowerCase()];
  if (!item) return JSON.stringify({ erro: `Produto "${input.produto}" nao encontrado` });
  return JSON.stringify({ produto: input.produto, preco: `R$ ${item.preco.toFixed(2)}`, estoque: item.quantidade });
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'criar_pedido_completo':
      return handleCriarPedidoCompleto(input as {
        cliente_email: string;
        produtos: Array<{ nome: string; quantidade: number }>;
        cidade_entrega: string;
        cupom_desconto?: string;
      });
    case 'consultar_catalogo':
      return handleConsultarCatalogo(input as { produto: string });
    default:
      return `Tool desconhecida: ${name}`;
  }
}

// === Loop de tool use ===

async function runToolLoop(question: string): Promise<void> {
  console.log(`\nPergunta: "${question}"\n`);

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  let continueLoop = true;

  while (continueLoop) {
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
        console.log(`  [Tool: ${block.name}]`);
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
        console.log(`  [Resultado: ${result.slice(0, 150)}...]`);
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
  'Crie um pedido para joao@email.com com 2 notebooks e 3 mouses, entrega em Sao Paulo, cupom DESCONTO10'
);

console.log('\n--- Exercicio 17 completo! ---');
