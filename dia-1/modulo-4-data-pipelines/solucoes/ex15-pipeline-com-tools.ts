/**
 * Solucao 15: Pipeline com Claude Tools
 *
 * Usa Tool Use do Claude para enriquecer dados dentro do pipeline.
 * Execute: npx tsx solucoes/ex15-pipeline-com-tools.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const client = new Anthropic();

// Carrega dados
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const rawCustomers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

const ticketsCSV = readFileSync('data/samples/tickets.csv', 'utf-8');
const rawTickets = parse(ticketsCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

// === 1: Tools ===
const tools: Anthropic.Tool[] = [
  {
    name: 'consultar_cliente',
    description: 'Consulta dados de um cliente pelo email. Retorna nome, plano, MRR, status e industria.',
    input_schema: {
      type: 'object' as const,
      properties: {
        email: { type: 'string', description: 'Email do cliente para buscar' },
      },
      required: ['email'],
    },
  },
  {
    name: 'calcular_metricas',
    description: 'Calcula metricas de um cliente: total de tickets, tickets abertos, tempo medio de resolucao, e health score.',
    input_schema: {
      type: 'object' as const,
      properties: {
        cliente_id: { type: 'number', description: 'ID do cliente para calcular metricas' },
      },
      required: ['cliente_id'],
    },
  },
];

// === 2: Handler de tools ===
function handleToolCall(name: string, input: Record<string, unknown>): string {
  if (name === 'consultar_cliente') {
    const email = input.email as string;
    const customer = rawCustomers.find(
      (c) => c.email.toLowerCase() === email.toLowerCase()
    );

    if (!customer) {
      return JSON.stringify({ error: `Cliente nao encontrado: ${email}` });
    }

    return JSON.stringify({
      id: parseInt(customer.id, 10),
      nome: customer.nome,
      email: customer.email,
      plano: customer.plano,
      mrr: parseInt(customer.mrr, 10),
      status: customer.status,
      industria: customer.industria,
      data_inicio: customer.data_inicio,
    });
  }

  if (name === 'calcular_metricas') {
    const clienteId = input.cliente_id as number;
    const clienteTickets = rawTickets.filter(
      (t) => parseInt(t.cliente_id, 10) === clienteId
    );

    const ticketsAbertos = clienteTickets.filter((t) => t.status === 'aberto').length;
    const ticketsResolvidos = clienteTickets.filter(
      (t) => t.status === 'resolvido' && t.resolvido_em
    );

    let tempoMedioResolucao: number | null = null;
    if (ticketsResolvidos.length > 0) {
      const tempos = ticketsResolvidos.map((t) => {
        const criado = new Date(t.criado_em).getTime();
        const resolvido = new Date(t.resolvido_em).getTime();
        return (resolvido - criado) / (1000 * 60 * 60 * 24);
      });
      tempoMedioResolucao = Math.round(
        (tempos.reduce((a, b) => a + b, 0) / tempos.length) * 10
      ) / 10;
    }

    // Health score simples
    const customer = rawCustomers.find((c) => parseInt(c.id, 10) === clienteId);
    let healthScore = 0;
    if (customer?.status === 'ativo') healthScore += 40;
    if (customer?.plano === 'Enterprise') healthScore += 20;
    else if (customer?.plano === 'Pro') healthScore += 15;
    else healthScore += 10;
    if (ticketsAbertos === 0) healthScore += 20;
    else if (ticketsAbertos === 1) healthScore += 10;
    healthScore += 20; // Base

    return JSON.stringify({
      cliente_id: clienteId,
      totalTickets: clienteTickets.length,
      ticketsAbertos,
      ticketsResolvidos: ticketsResolvidos.length,
      tempoMedioResolucaoDias: tempoMedioResolucao,
      healthScore: Math.min(healthScore, 100),
      categorias: [...new Set(clienteTickets.map((t) => t.categoria))],
    });
  }

  return JSON.stringify({ error: `Tool desconhecida: ${name}` });
}

// === 3: Loop de conversacao com tools ===
async function analisarCliente(email: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `Analise o cliente com email "${email}".
Primeiro consulte os dados do cliente, depois calcule suas metricas.
Com base nos resultados, forneca um resumo executivo em portugues incluindo:
1. Dados do cliente
2. Metricas de suporte
3. Avaliacao de saude (health score)
4. Recomendacao de acao`,
    },
  ];

  let response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    tools,
    messages,
  });

  // Loop de tool use
  while (response.stop_reason === 'tool_use') {
    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ContentBlockParam & { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> } =>
        block.type === 'tool_use'
    );

    const toolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks.map((toolUse) => {
      console.log(`  [Tool] ${toolUse.name}(${JSON.stringify(toolUse.input)})`);
      const result = handleToolCall(toolUse.name, toolUse.input);
      return {
        type: 'tool_result' as const,
        tool_use_id: toolUse.id,
        content: result,
      };
    });

    messages.push({ role: 'assistant', content: response.content });
    messages.push({ role: 'user', content: toolResults });

    response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools,
      messages,
    });
  }

  // Extrai texto final
  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock && textBlock.type === 'text' ? textBlock.text : 'Sem resposta';
}

// === 4: Executa ===
async function main() {
  console.log('=== Pipeline com Claude Tools ===\n');

  const emailsParaAnalisar = [
    'contato@techcorp.com',
    'admin@startupxyz.com',
    'labs@ailabs.com',
  ];

  for (const email of emailsParaAnalisar) {
    console.log(`\n--- Analisando: ${email} ---`);
    const analise = await analisarCliente(email);
    console.log(`\n${analise}`);
    console.log('\n' + '='.repeat(50));
  }

  console.log('\n--- Exercicio 15 completo! ---');
}

main().catch(console.error);
