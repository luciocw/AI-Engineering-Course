/**
 * Solution 15: Pipeline with Claude Tools
 *
 * Uses Claude Tool Use to enrich data within the pipeline.
 * Run: npx tsx solutions/ex15-pipeline-with-tools.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const client = new Anthropic();

// Load data
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const rawCustomers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

const ticketsCSV = readFileSync('data/samples/tickets.csv', 'utf-8');
const rawTickets = parse(ticketsCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

// === 1: Tools ===
const tools: Anthropic.Tool[] = [
  {
    name: 'lookup_customer',
    description: 'Looks up customer data by email. Returns name, plan, MRR, status, and industry.',
    input_schema: {
      type: 'object' as const,
      properties: {
        email: { type: 'string', description: 'Customer email to search for' },
      },
      required: ['email'],
    },
  },
  {
    name: 'calculate_metrics',
    description: 'Calculates customer metrics: total tickets, open tickets, average resolution time, and health score.',
    input_schema: {
      type: 'object' as const,
      properties: {
        customer_id: { type: 'number', description: 'Customer ID to calculate metrics for' },
      },
      required: ['customer_id'],
    },
  },
];

// === 2: Tool handler ===
function handleToolCall(name: string, input: Record<string, unknown>): string {
  if (name === 'lookup_customer') {
    const email = input.email as string;
    const customer = rawCustomers.find(
      (c) => c.email.toLowerCase() === email.toLowerCase()
    );

    if (!customer) {
      return JSON.stringify({ error: `Customer not found: ${email}` });
    }

    return JSON.stringify({
      id: parseInt(customer.id, 10),
      name: customer.nome,
      email: customer.email,
      plan: customer.plano,
      mrr: parseInt(customer.mrr, 10),
      status: customer.status,
      industry: customer.industria,
      start_date: customer.data_inicio,
    });
  }

  if (name === 'calculate_metrics') {
    const customerId = input.customer_id as number;
    const customerTickets = rawTickets.filter(
      (t) => parseInt(t.cliente_id, 10) === customerId
    );

    const openTickets = customerTickets.filter((t) => t.status === 'aberto').length;
    const resolvedTickets = customerTickets.filter(
      (t) => t.status === 'resolvido' && t.resolvido_em
    );

    let avgResolutionTime: number | null = null;
    if (resolvedTickets.length > 0) {
      const times = resolvedTickets.map((t) => {
        const created = new Date(t.criado_em).getTime();
        const resolved = new Date(t.resolvido_em).getTime();
        return (resolved - created) / (1000 * 60 * 60 * 24);
      });
      avgResolutionTime = Math.round(
        (times.reduce((a, b) => a + b, 0) / times.length) * 10
      ) / 10;
    }

    // Simple health score
    const customer = rawCustomers.find((c) => parseInt(c.id, 10) === customerId);
    let healthScore = 0;
    if (customer?.status === 'ativo') healthScore += 40;
    if (customer?.plano === 'Enterprise') healthScore += 20;
    else if (customer?.plano === 'Pro') healthScore += 15;
    else healthScore += 10;
    if (openTickets === 0) healthScore += 20;
    else if (openTickets === 1) healthScore += 10;
    healthScore += 20; // Base

    return JSON.stringify({
      customer_id: customerId,
      totalTickets: customerTickets.length,
      openTickets,
      resolvedTickets: resolvedTickets.length,
      avgResolutionTimeDays: avgResolutionTime,
      healthScore: Math.min(healthScore, 100),
      categories: [...new Set(customerTickets.map((t) => t.categoria))],
    });
  }

  return JSON.stringify({ error: `Unknown tool: ${name}` });
}

// === 3: Conversation loop with tools ===
async function analyzeCustomer(email: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `Analyze the customer with email "${email}".
First look up the customer data, then calculate their metrics.
Based on the results, provide an executive summary including:
1. Customer data
2. Support metrics
3. Health assessment (health score)
4. Recommended action`,
    },
  ];

  let response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    tools,
    messages,
  });

  // Tool use loop
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

  // Extract final text
  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock && textBlock.type === 'text' ? textBlock.text : 'No response';
}

// === 4: Execute ===
async function main() {
  console.log('=== Pipeline with Claude Tools ===\n');

  const emailsToAnalyze = [
    'contato@techcorp.com',
    'admin@startupxyz.com',
    'labs@ailabs.com',
  ];

  for (const email of emailsToAnalyze) {
    console.log(`\n--- Analyzing: ${email} ---`);
    const analysis = await analyzeCustomer(email);
    console.log(`\n${analysis}`);
    console.log('\n' + '='.repeat(50));
  }

  console.log('\n--- Exercise 15 complete! ---');
}

main().catch(console.error);
