/**
 * Solution 16: Complete ETL Pipeline
 *
 * Extract -> Transform -> Load: from raw CSV to final report.
 * Run: npx tsx solutions/ex16-etl-pipeline.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';

// === Schemas ===
const CustomerSchema = z.object({
  id: z.string().transform(Number),
  nome: z.string().min(1),
  email: z.string().email(),
  plano: z.enum(['Enterprise', 'Pro', 'Starter']),
  mrr: z.string().transform(Number),
  data_inicio: z.string(),
  status: z.enum(['ativo', 'churned']),
  industria: z.string(),
});

const TicketSchema = z.object({
  id: z.string().transform(Number),
  cliente_id: z.string().transform(Number),
  titulo: z.string().min(1),
  prioridade: z.enum(['alta', 'media', 'baixa']),
  status: z.enum(['resolvido', 'aberto']),
  categoria: z.string(),
  criado_em: z.string(),
  resolvido_em: z.string(),
});

type Customer = z.infer<typeof CustomerSchema>;
type Ticket = z.infer<typeof TicketSchema>;

interface EnrichedCustomer extends Customer {
  totalTickets: number;
  openTickets: number;
  ticketsByPriority: { alta: number; media: number; baixa: number };
  avgResolutionTime: number | null;
}

interface TransformResult {
  customers: EnrichedCustomer[];
  warnings: string[];
  stats: {
    totalCustomers: number;
    validCustomers: number;
    totalTickets: number;
    validTickets: number;
  };
}

// === EXTRACT ===
function extract(): {
  rawCustomers: Record<string, string>[];
  rawTickets: Record<string, string>[];
} {
  console.log('=== EXTRACT ===');

  const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
  const rawCustomers = parse(customersCSV, {
    columns: true,
    skip_empty_lines: true,
  }) as Record<string, string>[];

  const ticketsCSV = readFileSync('data/samples/tickets.csv', 'utf-8');
  const rawTickets = parse(ticketsCSV, {
    columns: true,
    skip_empty_lines: true,
  }) as Record<string, string>[];

  console.log(`  Customers: ${rawCustomers.length} rows`);
  console.log(`  Tickets: ${rawTickets.length} rows`);

  return { rawCustomers, rawTickets };
}

// === TRANSFORM ===
function transform(raw: {
  rawCustomers: Record<string, string>[];
  rawTickets: Record<string, string>[];
}): TransformResult {
  console.log('\n=== TRANSFORM ===');
  const warnings: string[] = [];

  // Validate customers
  const validCustomers: Customer[] = [];
  for (const row of raw.rawCustomers) {
    const result = CustomerSchema.safeParse(row);
    if (result.success) {
      validCustomers.push(result.data);
    } else {
      warnings.push(`Invalid customer (${row.nome}): ${result.error.issues[0].message}`);
    }
  }

  // Validate tickets
  const validTickets: Ticket[] = [];
  for (const row of raw.rawTickets) {
    const result = TicketSchema.safeParse(row);
    if (result.success) {
      validTickets.push(result.data);
    } else {
      warnings.push(`Invalid ticket (${row.id}): ${result.error.issues[0].message}`);
    }
  }

  console.log(`  Valid customers: ${validCustomers.length}/${raw.rawCustomers.length}`);
  console.log(`  Valid tickets: ${validTickets.length}/${raw.rawTickets.length}`);

  // Enrich customers with ticket data
  const enriched: EnrichedCustomer[] = validCustomers.map((customer) => {
    const customerTickets = validTickets.filter(
      (t) => t.cliente_id === customer.id
    );

    const priorities = { alta: 0, media: 0, baixa: 0 };
    for (const t of customerTickets) {
      priorities[t.prioridade]++;
    }

    // Average resolution time (days)
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
      avgResolutionTime =
        Math.round(
          (times.reduce((a, b) => a + b, 0) / times.length) * 10
        ) / 10;
    }

    return {
      ...customer,
      totalTickets: customerTickets.length,
      openTickets: customerTickets.filter((t) => t.status === 'aberto').length,
      ticketsByPriority: priorities,
      avgResolutionTime,
    };
  });

  if (warnings.length > 0) {
    console.log(`  Warnings: ${warnings.length}`);
  }

  return {
    customers: enriched,
    warnings,
    stats: {
      totalCustomers: raw.rawCustomers.length,
      validCustomers: validCustomers.length,
      totalTickets: raw.rawTickets.length,
      validTickets: validTickets.length,
    },
  };
}

// === LOAD ===
function load(data: TransformResult): void {
  console.log('\n=== LOAD ===\n');

  // Aggregated metrics
  const active = data.customers.filter((c) => c.status === 'ativo');
  const totalMrr = active.reduce((sum, c) => sum + c.mrr, 0);
  const churnRate =
    ((data.customers.length - active.length) / data.customers.length) * 100;

  console.log('--- Aggregated Metrics ---');
  console.log(`Total MRR: $${totalMrr.toLocaleString('en-US')}`);
  console.log(`Active customers: ${active.length}/${data.customers.length}`);
  console.log(`Churn rate: ${churnRate.toFixed(1)}%`);

  // By plan
  console.log('\n--- By Plan ---');
  const plans = ['Enterprise', 'Pro', 'Starter'] as const;
  for (const plan of plans) {
    const planCustomers = active.filter((c) => c.plano === plan);
    const planMrr = planCustomers.reduce((s, c) => s + c.mrr, 0);
    console.log(
      `  ${plan}: ${planCustomers.length} customers, MRR $${planMrr}`
    );
  }

  // Alerts
  console.log('\n--- Alerts ---');
  const alerts: string[] = [];

  for (const c of data.customers) {
    if (c.ticketsByPriority.alta >= 2) {
      alerts.push(
        `${c.nome}: ${c.ticketsByPriority.alta} high priority tickets`
      );
    }
    if (c.openTickets > 0) {
      alerts.push(`${c.nome}: ${c.openTickets} open ticket(s)`);
    }
  }

  if (alerts.length === 0) {
    console.log('  No alerts.');
  } else {
    for (const alert of alerts) {
      console.log(`  ALERT: ${alert}`);
    }
  }

  // AI-ready context
  console.log('\n--- AI-Ready Context ---');
  const aiContext = {
    summary: {
      totalMrr,
      activeCustomers: active.length,
      churnRate: `${churnRate.toFixed(1)}%`,
      totalTickets: data.stats.validTickets,
    },
    topCustomers: active
      .sort((a, b) => b.mrr - a.mrr)
      .slice(0, 3)
      .map((c) => ({
        name: c.nome,
        plan: c.plano,
        mrr: c.mrr,
        tickets: c.totalTickets,
        satisfaction:
          c.avgResolutionTime !== null
            ? `${c.avgResolutionTime}d avg resolution`
            : 'No resolved tickets',
      })),
    alerts,
  };

  console.log(JSON.stringify(aiContext, null, 2));

  // Warnings
  if (data.warnings.length > 0) {
    console.log('\n--- Warnings ---');
    for (const w of data.warnings) {
      console.log(`  ${w}`);
    }
  }
}

// === Execute Pipeline ===
const raw = extract();
const transformed = transform(raw);
load(transformed);

console.log('\n--- Exercise 16 complete! ---');
