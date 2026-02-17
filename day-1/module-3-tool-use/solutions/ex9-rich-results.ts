/**
 * Solution 9: Rich Results with Structured Data
 *
 * Returning complex data with metadata and hierarchy.
 * Run: npx tsx solutions/ex9-rich-results.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Simulated data ===

const dashboardData = {
  sales: {
    today: { total: 15680, orders: 42, average_ticket: 373.33 },
    week: { total: 98450, orders: 287, average_ticket: 343.03 },
    month: { total: 456000, orders: 1250, average_ticket: 364.80 },
  },
  topProducts: [
    { name: 'Enterprise Plan', sales: 45, revenue: 44955 },
    { name: 'Pro Plan', sales: 120, revenue: 35880 },
    { name: 'Starter Plan', sales: 350, revenue: 17150 },
  ],
  alerts: [
    { type: 'warning', msg: 'Low stock: Wireless Mouse (5 units)', timestamp: '2026-02-16T10:30:00' },
    { type: 'info', msg: 'New daily sales record reached', timestamp: '2026-02-16T09:15:00' },
    { type: 'error', msg: 'Payment gateway failure at 14:32', timestamp: '2026-02-16T14:32:00' },
  ],
};

const clientsDB = [
  { id: 1, name: 'TechCorp', plan: 'Enterprise', mrr: 999, health: 95, lastContact: '2026-02-10' },
  { id: 2, name: 'StartupXYZ', plan: 'Pro', mrr: 299, health: 72, lastContact: '2026-01-20' },
  { id: 3, name: 'MegaLtd', plan: 'Enterprise', mrr: 999, health: 88, lastContact: '2026-02-14' },
  { id: 4, name: 'DevShop', plan: 'Starter', mrr: 49, health: 45, lastContact: '2025-12-15' },
  { id: 5, name: 'DataFlow', plan: 'Pro', mrr: 299, health: 91, lastContact: '2026-02-16' },
];

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'sales_dashboard',
    description:
      'Returns the complete sales dashboard with metrics by period (today/week/month), ' +
      'top 3 product ranking, and system alerts. Data includes source metadata and timestamp.',
    input_schema: {
      type: 'object' as const,
      properties: {
        period: {
          type: 'string',
          enum: ['today', 'week', 'month'],
          description: 'Period to display main metrics',
        },
        include_alerts: {
          type: 'boolean',
          description: 'If true, includes system alerts in the result (default: true)',
        },
      },
      required: ['period'],
    },
  },
  {
    name: 'client_analysis',
    description:
      'Returns detailed client analysis with health score, MRR, and risk classification. ' +
      'Can filter by plan or list all.',
    input_schema: {
      type: 'object' as const,
      properties: {
        plan: {
          type: 'string',
          enum: ['Enterprise', 'Pro', 'Starter', 'all'],
          description: 'Filter by plan or "all" to see everything',
        },
      },
      required: ['plan'],
    },
  },
];

// === Handlers with rich results ===

function handleDashboard(input: { period: string; include_alerts?: boolean }): string {
  const period = input.period as keyof typeof dashboardData.sales;
  const metrics = dashboardData.sales[period];

  if (!metrics) {
    return JSON.stringify({ error: `Period "${input.period}" is invalid` });
  }

  const result: Record<string, unknown> = {
    _meta: {
      source: 'sales_system_v2',
      timestamp: new Date().toISOString(),
      period: input.period,
      cache: false,
    },
    metrics: {
      total_revenue: `$${metrics.total.toLocaleString('en-US')}`,
      total_orders: metrics.orders,
      average_ticket: `$${metrics.average_ticket.toFixed(2)}`,
      gross_revenue: metrics.total,
    },
    product_ranking: dashboardData.topProducts.map((p, i) => ({
      position: i + 1,
      product: p.name,
      sales: p.sales,
      revenue: `$${p.revenue.toLocaleString('en-US')}`,
      share: `${((p.revenue / metrics.total) * 100).toFixed(1)}%`,
    })),
  };

  if (input.include_alerts !== false) {
    result.alerts = dashboardData.alerts.map((a) => ({
      level: a.type.toUpperCase(),
      message: a.msg,
      time: a.timestamp,
    }));
    result.alert_summary = {
      total: dashboardData.alerts.length,
      errors: dashboardData.alerts.filter((a) => a.type === 'error').length,
      warnings: dashboardData.alerts.filter((a) => a.type === 'warning').length,
      info: dashboardData.alerts.filter((a) => a.type === 'info').length,
    };
  }

  return JSON.stringify(result, null, 2);
}

function handleClientAnalysis(input: { plan: string }): string {
  let clients = clientsDB;
  if (input.plan !== 'all') {
    clients = clients.filter((c) => c.plan === input.plan);
  }

  const classifyRisk = (health: number): string => {
    if (health >= 80) return 'low';
    if (health >= 60) return 'medium';
    return 'high';
  };

  const totalMRR = clients.reduce((sum, c) => sum + c.mrr, 0);
  const averageHealth = clients.reduce((sum, c) => sum + c.health, 0) / clients.length;

  const result = {
    _meta: {
      source: 'crm_analytics',
      timestamp: new Date().toISOString(),
      filter: input.plan,
    },
    summary: {
      total_clients: clients.length,
      total_mrr: `$${totalMRR.toLocaleString('en-US')}`,
      average_health: Math.round(averageHealth),
      high_risk_clients: clients.filter((c) => c.health < 60).length,
    },
    clients: clients.map((c) => ({
      name: c.name,
      plan: c.plan,
      mrr: `$${c.mrr}`,
      health_score: c.health,
      risk: classifyRisk(c.health),
      last_contact: c.lastContact,
      days_without_contact: Math.floor(
        (Date.now() - new Date(c.lastContact).getTime()) / (1000 * 60 * 60 * 24)
      ),
    })),
    recommendations: clients
      .filter((c) => c.health < 70)
      .map((c) => `Schedule contact with ${c.name} (health: ${c.health}, last contact: ${c.lastContact})`),
  };

  return JSON.stringify(result, null, 2);
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'sales_dashboard':
      return handleDashboard(input as { period: string; include_alerts?: boolean });
    case 'client_analysis':
      return handleClientAnalysis(input as { plan: string });
    default:
      return `Unknown tool: ${name}`;
  }
}

// === Tool use loop ===

async function runToolLoop(question: string): Promise<void> {
  console.log(`\nQuestion: "${question}"\n`);

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
        console.log(`  [Rich result returned - ${result.length} chars]`);
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
  'Show me the monthly sales dashboard with alerts. I also want to see the analysis of all clients, especially the high-risk ones.'
);

console.log('\n--- Exercise 9 complete! ---');
