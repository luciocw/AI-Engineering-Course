/**
 * Solucao 4: Pipeline ETL Completo
 *
 * Extract → Transform → Load: do CSV cru ao relatorio final.
 * Execute: npx tsx solucoes/ex4-etl-pipeline.ts
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
  ticketsAbertos: number;
  ticketsPorPrioridade: { alta: number; media: number; baixa: number };
  tempoMedioResolucao: number | null;
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
      warnings.push(`Customer invalido (${row.nome}): ${result.error.issues[0].message}`);
    }
  }

  // Validate tickets
  const validTickets: Ticket[] = [];
  for (const row of raw.rawTickets) {
    const result = TicketSchema.safeParse(row);
    if (result.success) {
      validTickets.push(result.data);
    } else {
      warnings.push(`Ticket invalido (${row.id}): ${result.error.issues[0].message}`);
    }
  }

  console.log(`  Customers validos: ${validCustomers.length}/${raw.rawCustomers.length}`);
  console.log(`  Tickets validos: ${validTickets.length}/${raw.rawTickets.length}`);

  // Enrich customers with ticket data
  const enriched: EnrichedCustomer[] = validCustomers.map((customer) => {
    const customerTickets = validTickets.filter(
      (t) => t.cliente_id === customer.id
    );

    const prioridades = { alta: 0, media: 0, baixa: 0 };
    for (const t of customerTickets) {
      prioridades[t.prioridade]++;
    }

    // Tempo medio de resolucao (dias)
    const resolvedTickets = customerTickets.filter(
      (t) => t.status === 'resolvido' && t.resolvido_em
    );
    let tempoMedioResolucao: number | null = null;

    if (resolvedTickets.length > 0) {
      const tempos = resolvedTickets.map((t) => {
        const criado = new Date(t.criado_em).getTime();
        const resolvido = new Date(t.resolvido_em).getTime();
        return (resolvido - criado) / (1000 * 60 * 60 * 24);
      });
      tempoMedioResolucao =
        Math.round(
          (tempos.reduce((a, b) => a + b, 0) / tempos.length) * 10
        ) / 10;
    }

    return {
      ...customer,
      totalTickets: customerTickets.length,
      ticketsAbertos: customerTickets.filter((t) => t.status === 'aberto').length,
      ticketsPorPrioridade: prioridades,
      tempoMedioResolucao,
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

  // Metricas agregadas
  const ativos = data.customers.filter((c) => c.status === 'ativo');
  const mrrTotal = ativos.reduce((sum, c) => sum + c.mrr, 0);
  const churnRate =
    ((data.customers.length - ativos.length) / data.customers.length) * 100;

  console.log('--- Metricas Agregadas ---');
  console.log(`MRR Total: R$${mrrTotal.toLocaleString('pt-BR')}`);
  console.log(`Clientes ativos: ${ativos.length}/${data.customers.length}`);
  console.log(`Churn rate: ${churnRate.toFixed(1)}%`);

  // Por plano
  console.log('\n--- Por Plano ---');
  const planos = ['Enterprise', 'Pro', 'Starter'] as const;
  for (const plano of planos) {
    const clientesPlano = ativos.filter((c) => c.plano === plano);
    const mrrPlano = clientesPlano.reduce((s, c) => s + c.mrr, 0);
    console.log(
      `  ${plano}: ${clientesPlano.length} clientes, MRR R$${mrrPlano}`
    );
  }

  // Alertas
  console.log('\n--- Alertas ---');
  const alertas: string[] = [];

  for (const c of data.customers) {
    if (c.ticketsPorPrioridade.alta >= 2) {
      alertas.push(
        `${c.nome}: ${c.ticketsPorPrioridade.alta} tickets de alta prioridade`
      );
    }
    if (c.ticketsAbertos > 0) {
      alertas.push(`${c.nome}: ${c.ticketsAbertos} ticket(s) aberto(s)`);
    }
  }

  if (alertas.length === 0) {
    console.log('  Nenhum alerta.');
  } else {
    for (const alerta of alertas) {
      console.log(`  ⚠ ${alerta}`);
    }
  }

  // AI-ready context
  console.log('\n--- Contexto AI-Ready ---');
  const aiContext = {
    resumo: {
      mrrTotal,
      clientesAtivos: ativos.length,
      churnRate: `${churnRate.toFixed(1)}%`,
      totalTickets: data.stats.validTickets,
    },
    topClientes: ativos
      .sort((a, b) => b.mrr - a.mrr)
      .slice(0, 3)
      .map((c) => ({
        nome: c.nome,
        plano: c.plano,
        mrr: c.mrr,
        tickets: c.totalTickets,
        satisfacao:
          c.tempoMedioResolucao !== null
            ? `${c.tempoMedioResolucao}d resolucao media`
            : 'Sem tickets resolvidos',
      })),
    alertas,
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

console.log('\n--- Exercicio 4 completo! ---');
