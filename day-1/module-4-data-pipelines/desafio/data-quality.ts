/**
 * Desafio: Dashboard de Qualidade de Dados
 *
 * Pipeline que avalia qualidade dos dados e gera contexto AI-ready.
 * Execute: npx tsx desafio/data-quality.ts
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
  mrr: z.string().transform(Number).pipe(z.number().positive()),
  data_inicio: z.string(),
  status: z.enum(['ativo', 'churned']),
  industria: z.string().min(1),
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

interface QualityMetrics {
  completude: number;
  validade: number;
  problemas: string[];
}

function avaliarQualidade(
  rawRows: Record<string, string>[],
  schema: z.ZodSchema,
  label: string
): QualityMetrics {
  const problemas: string[] = [];
  let validos = 0;
  let camposPreenchidos = 0;
  let camposTotal = 0;

  for (const row of rawRows) {
    // Completude
    const keys = Object.keys(row);
    camposTotal += keys.length;
    camposPreenchidos += keys.filter((k) => row[k] !== '' && row[k] !== undefined).length;

    // Validade
    const result = schema.safeParse(row);
    if (result.success) {
      validos++;
    } else {
      for (const issue of result.error.issues) {
        problemas.push(`${label} row ${row.id || '?'}: [${issue.path.join('.')}] ${issue.message}`);
      }
    }
  }

  // Consistencia: emails duplicados
  const emails = rawRows.map((r) => r.email).filter(Boolean);
  const emailSet = new Set(emails);
  if (emailSet.size < emails.length) {
    problemas.push(`${label}: ${emails.length - emailSet.size} email(s) duplicado(s)`);
  }

  return {
    completude: camposTotal > 0 ? (camposPreenchidos / camposTotal) * 100 : 0,
    validade: rawRows.length > 0 ? (validos / rawRows.length) * 100 : 0,
    problemas,
  };
}

// === Ingestao ===
const customersCSV = readFileSync('data/samples/customers.csv', 'utf-8');
const rawCustomers = parse(customersCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

const ticketsCSV = readFileSync('data/samples/tickets.csv', 'utf-8');
const rawTickets = parse(ticketsCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

// === Qualidade ===
const qualCustomers = avaliarQualidade(rawCustomers, CustomerSchema, 'Customer');
const qualTickets = avaliarQualidade(rawTickets, TicketSchema, 'Ticket');

// Consistencia: tickets com cliente_id orfao
const customerIds = new Set(rawCustomers.map((c) => c.id));
const orfaos = rawTickets.filter((t) => !customerIds.has(t.cliente_id));
if (orfaos.length > 0) {
  qualTickets.problemas.push(`${orfaos.length} ticket(s) com cliente_id orfao`);
}

// === Dashboard ===
console.log('=== Dashboard de Qualidade de Dados ===\n');

console.log('--- Customers ---');
console.log(`  Registros: ${rawCustomers.length}`);
console.log(`  Completude: ${qualCustomers.completude.toFixed(1)}%`);
console.log(`  Validade: ${qualCustomers.validade.toFixed(1)}%`);

console.log('\n--- Tickets ---');
console.log(`  Registros: ${rawTickets.length}`);
console.log(`  Completude: ${qualTickets.completude.toFixed(1)}%`);
console.log(`  Validade: ${qualTickets.validade.toFixed(1)}%`);

const allProblemas = [...qualCustomers.problemas, ...qualTickets.problemas];
if (allProblemas.length > 0) {
  console.log('\n--- Problemas Encontrados ---');
  for (const p of allProblemas) {
    console.log(`  - ${p}`);
  }
} else {
  console.log('\n  Nenhum problema encontrado!');
}

// === Output AI-Ready ===
const validCustomers = rawCustomers
  .map((r) => CustomerSchema.safeParse(r))
  .filter((r) => r.success)
  .map((r) => (r as { success: true; data: z.infer<typeof CustomerSchema> }).data);

const ativos = validCustomers.filter((c) => c.status === 'ativo');
const mrrTotal = ativos.reduce((sum, c) => sum + c.mrr, 0);

const aiContext = {
  qualidade: {
    customers: {
      completude: `${qualCustomers.completude.toFixed(1)}%`,
      validade: `${qualCustomers.validade.toFixed(1)}%`,
    },
    tickets: {
      completude: `${qualTickets.completude.toFixed(1)}%`,
      validade: `${qualTickets.validade.toFixed(1)}%`,
    },
    problemasTotal: allProblemas.length,
  },
  metricas: {
    mrrTotal,
    clientesAtivos: ativos.length,
    clientesChuned: validCustomers.length - ativos.length,
    ticketsAbertos: rawTickets.filter((t) => t.status === 'aberto').length,
    ticketsTotal: rawTickets.length,
  },
  alertas: allProblemas.slice(0, 5),
};

console.log('\n--- Contexto AI-Ready ---');
console.log(JSON.stringify(aiContext, null, 2));

console.log('\n--- Desafio completo! ---');
