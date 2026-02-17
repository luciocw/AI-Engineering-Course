/**
 * Solucao 9: Resultados Ricos com Dados Estruturados
 *
 * Retorno de dados complexos com metadados e hierarquia.
 * Execute: npx tsx solucoes/ex9-tool-resultados-ricos.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Dados simulados ===

const dashboardData = {
  vendas: {
    hoje: { total: 15680, pedidos: 42, ticket_medio: 373.33 },
    semana: { total: 98450, pedidos: 287, ticket_medio: 343.03 },
    mes: { total: 456000, pedidos: 1250, ticket_medio: 364.80 },
  },
  topProdutos: [
    { nome: 'Plano Enterprise', vendas: 45, receita: 44955 },
    { nome: 'Plano Pro', vendas: 120, receita: 35880 },
    { nome: 'Plano Starter', vendas: 350, receita: 17150 },
  ],
  alertas: [
    { tipo: 'warning', msg: 'Estoque baixo: Mouse Wireless (5 unidades)', timestamp: '2026-02-16T10:30:00' },
    { tipo: 'info', msg: 'Novo recorde de vendas diarias atingido', timestamp: '2026-02-16T09:15:00' },
    { tipo: 'error', msg: 'Falha no gateway de pagamento as 14:32', timestamp: '2026-02-16T14:32:00' },
  ],
};

const clientesDB = [
  { id: 1, nome: 'TechCorp', plano: 'Enterprise', mrr: 999, health: 95, ultimoContato: '2026-02-10' },
  { id: 2, nome: 'StartupXYZ', plano: 'Pro', mrr: 299, health: 72, ultimoContato: '2026-01-20' },
  { id: 3, nome: 'MegaLtda', plano: 'Enterprise', mrr: 999, health: 88, ultimoContato: '2026-02-14' },
  { id: 4, nome: 'DevShop', plano: 'Starter', mrr: 49, health: 45, ultimoContato: '2025-12-15' },
  { id: 5, nome: 'DataFlow', plano: 'Pro', mrr: 299, health: 91, ultimoContato: '2026-02-16' },
];

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'dashboard_vendas',
    description:
      'Retorna o dashboard completo de vendas com metricas por periodo (hoje/semana/mes), ' +
      'ranking dos top 3 produtos e alertas do sistema. Dados incluem metadados de fonte e timestamp.',
    input_schema: {
      type: 'object' as const,
      properties: {
        periodo: {
          type: 'string',
          enum: ['hoje', 'semana', 'mes'],
          description: 'Periodo para exibir metricas principais',
        },
        incluir_alertas: {
          type: 'boolean',
          description: 'Se true, inclui alertas do sistema no resultado (default: true)',
        },
      },
      required: ['periodo'],
    },
  },
  {
    name: 'analise_clientes',
    description:
      'Retorna analise detalhada dos clientes com health score, MRR e classificacao de risco. ' +
      'Pode filtrar por plano ou listar todos.',
    input_schema: {
      type: 'object' as const,
      properties: {
        plano: {
          type: 'string',
          enum: ['Enterprise', 'Pro', 'Starter', 'todos'],
          description: 'Filtrar por plano ou "todos" para ver completo',
        },
      },
      required: ['plano'],
    },
  },
];

// === Handlers com resultados ricos ===

function handleDashboard(input: { periodo: string; incluir_alertas?: boolean }): string {
  const periodo = input.periodo as keyof typeof dashboardData.vendas;
  const metricas = dashboardData.vendas[periodo];

  if (!metricas) {
    return JSON.stringify({ erro: `Periodo "${input.periodo}" invalido` });
  }

  const resultado: Record<string, unknown> = {
    _meta: {
      fonte: 'sistema_vendas_v2',
      timestamp: new Date().toISOString(),
      periodo: input.periodo,
      cache: false,
    },
    metricas: {
      receita_total: `R$ ${metricas.total.toLocaleString('pt-BR')}`,
      total_pedidos: metricas.pedidos,
      ticket_medio: `R$ ${metricas.ticket_medio.toFixed(2)}`,
      receita_bruta: metricas.total,
    },
    ranking_produtos: dashboardData.topProdutos.map((p, i) => ({
      posicao: i + 1,
      produto: p.nome,
      vendas: p.vendas,
      receita: `R$ ${p.receita.toLocaleString('pt-BR')}`,
      participacao: `${((p.receita / metricas.total) * 100).toFixed(1)}%`,
    })),
  };

  if (input.incluir_alertas !== false) {
    resultado.alertas = dashboardData.alertas.map((a) => ({
      nivel: a.tipo.toUpperCase(),
      mensagem: a.msg,
      horario: a.timestamp,
    }));
    resultado.resumo_alertas = {
      total: dashboardData.alertas.length,
      erros: dashboardData.alertas.filter((a) => a.tipo === 'error').length,
      avisos: dashboardData.alertas.filter((a) => a.tipo === 'warning').length,
      info: dashboardData.alertas.filter((a) => a.tipo === 'info').length,
    };
  }

  return JSON.stringify(resultado, null, 2);
}

function handleAnaliseClientes(input: { plano: string }): string {
  let clientes = clientesDB;
  if (input.plano !== 'todos') {
    clientes = clientes.filter((c) => c.plano === input.plano);
  }

  const classificarRisco = (health: number): string => {
    if (health >= 80) return 'baixo';
    if (health >= 60) return 'medio';
    return 'alto';
  };

  const mrrTotal = clientes.reduce((sum, c) => sum + c.mrr, 0);
  const healthMedio = clientes.reduce((sum, c) => sum + c.health, 0) / clientes.length;

  const resultado = {
    _meta: {
      fonte: 'crm_analytics',
      timestamp: new Date().toISOString(),
      filtro: input.plano,
    },
    resumo: {
      total_clientes: clientes.length,
      mrr_total: `R$ ${mrrTotal.toLocaleString('pt-BR')}`,
      health_medio: Math.round(healthMedio),
      clientes_risco_alto: clientes.filter((c) => c.health < 60).length,
    },
    clientes: clientes.map((c) => ({
      nome: c.nome,
      plano: c.plano,
      mrr: `R$ ${c.mrr}`,
      health_score: c.health,
      risco: classificarRisco(c.health),
      ultimo_contato: c.ultimoContato,
      dias_sem_contato: Math.floor(
        (Date.now() - new Date(c.ultimoContato).getTime()) / (1000 * 60 * 60 * 24)
      ),
    })),
    recomendacoes: clientes
      .filter((c) => c.health < 70)
      .map((c) => `Agendar contato com ${c.nome} (health: ${c.health}, ultimo contato: ${c.ultimoContato})`),
  };

  return JSON.stringify(resultado, null, 2);
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'dashboard_vendas':
      return handleDashboard(input as { periodo: string; incluir_alertas?: boolean });
    case 'analise_clientes':
      return handleAnaliseClientes(input as { plano: string });
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
        console.log(`  [Tool: ${block.name}(${JSON.stringify(block.input)})]`);
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
        console.log(`  [Resultado rico retornado - ${result.length} chars]`);
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
  'Me mostre o dashboard de vendas do mes com alertas. Tambem quero ver a analise de todos os clientes, especialmente os de risco alto.'
);

console.log('\n--- Exercicio 9 completo! ---');
