/**
 * Testes para o Modulo 4: Data Pipelines
 *
 * Testa CSV parsing, JSON transform, Zod validation e ETL logic.
 * Execute: npm test
 */

import { describe, it, expect } from 'vitest';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';

// =============================================
// Ex1: CSV Processing
// =============================================
describe('Ex1: CSV Processing', () => {
  const sampleCSV = `id,nome,email,plano,mrr,status
1,TechCorp,tech@corp.com,Enterprise,999,ativo
2,StartupXYZ,hello@xyz.com,Pro,299,ativo
3,DevShop,dev@shop.io,Starter,49,churned`;

  it('parses CSV with column headers', () => {
    const rows = parse(sampleCSV, {
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, string>[];

    expect(rows).toHaveLength(3);
    expect(rows[0].nome).toBe('TechCorp');
    expect(rows[0].plano).toBe('Enterprise');
  });

  it('converts string values to numbers', () => {
    const rows = parse(sampleCSV, {
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, string>[];

    const mrr = parseInt(rows[0].mrr, 10);
    expect(mrr).toBe(999);
    expect(typeof mrr).toBe('number');
  });

  it('calculates MRR for active customers', () => {
    const rows = parse(sampleCSV, {
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, string>[];

    const ativos = rows.filter((r) => r.status === 'ativo');
    const mrrTotal = ativos.reduce((sum, r) => sum + parseInt(r.mrr, 10), 0);

    expect(ativos).toHaveLength(2);
    expect(mrrTotal).toBe(1298);
  });

  it('calculates churn rate', () => {
    const rows = parse(sampleCSV, {
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, string>[];

    const total = rows.length;
    const churned = rows.filter((r) => r.status === 'churned').length;
    const churnRate = (churned / total) * 100;

    expect(churnRate).toBeCloseTo(33.3, 0);
  });
});

// =============================================
// Ex2: JSON Transform
// =============================================
describe('Ex2: JSON Transform', () => {
  it('normalizes plan names to consistent format', () => {
    function normalizePlano(raw: string): string {
      const lower = raw.toLowerCase();
      if (lower === 'enterprise') return 'Enterprise';
      if (lower === 'pro') return 'Pro';
      return 'Starter';
    }

    expect(normalizePlano('enterprise')).toBe('Enterprise');
    expect(normalizePlano('ENTERPRISE')).toBe('Enterprise');
    expect(normalizePlano('pro')).toBe('Pro');
    expect(normalizePlano('PRO')).toBe('Pro');
    expect(normalizePlano('starter')).toBe('Starter');
  });

  it('merges data from multiple sources by email', () => {
    const crm = new Map([['a@b.com', { nome: 'A', mrr: 100 }]]);
    const support = new Map([['a@b.com', { tickets: 3 }]]);

    const email = 'a@b.com';
    const merged = { ...crm.get(email), ...support.get(email), email };

    expect(merged.nome).toBe('A');
    expect(merged.mrr).toBe(100);
    expect(merged.tickets).toBe(3);
    expect(merged.email).toBe('a@b.com');
  });

  it('handles missing data in merge gracefully', () => {
    const crm = new Map([['a@b.com', { nome: 'A', mrr: 100 }]]);
    const support = new Map<string, { tickets: number }>();

    const email = 'a@b.com';
    const supportData = support.get(email) || { tickets: 0 };
    const merged = { ...crm.get(email), ...supportData };

    expect(merged.tickets).toBe(0);
  });
});

// =============================================
// Ex3: Zod Validation
// =============================================
describe('Ex3: Zod Validation', () => {
  const CustomerSchema = z.object({
    nome: z.string().min(2).max(100),
    email: z.string().email(),
    plano: z.enum(['Enterprise', 'Pro', 'Starter']),
    mrr: z.number().positive(),
    status: z.enum(['ativo', 'churned']),
  });

  it('validates correct customer data', () => {
    const result = CustomerSchema.safeParse({
      nome: 'TechCorp',
      email: 'tech@corp.com',
      plano: 'Enterprise',
      mrr: 999,
      status: 'ativo',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = CustomerSchema.safeParse({
      nome: 'Test',
      email: 'not-an-email',
      plano: 'Pro',
      mrr: 299,
      status: 'ativo',
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid plan', () => {
    const result = CustomerSchema.safeParse({
      nome: 'Test',
      email: 'test@test.com',
      plano: 'Platinum',
      mrr: 299,
      status: 'ativo',
    });

    expect(result.success).toBe(false);
  });

  it('rejects negative MRR', () => {
    const result = CustomerSchema.safeParse({
      nome: 'Test',
      email: 'test@test.com',
      plano: 'Pro',
      mrr: -10,
      status: 'ativo',
    });

    expect(result.success).toBe(false);
  });

  it('detects XSS in string fields', () => {
    function noXSS(field: string) {
      return z.string().refine(
        (val) => {
          const patterns = [
            /<script/i,
            /javascript:/i,
            /onerror\s*=/i,
            /onclick\s*=/i,
            /eval\s*\(/i,
          ];
          return !patterns.some((p) => p.test(val));
        },
        { message: `${field} contem XSS` }
      );
    }

    const SafeString = noXSS('input');

    expect(SafeString.safeParse('Normal text').success).toBe(true);
    expect(SafeString.safeParse('<script>alert(1)</script>').success).toBe(false);
    expect(SafeString.safeParse('javascript:void(0)').success).toBe(false);
    expect(SafeString.safeParse('img onerror=alert(1)').success).toBe(false);
    expect(SafeString.safeParse('eval("code")').success).toBe(false);
  });
});

// =============================================
// Ex4: ETL Pipeline
// =============================================
describe('Ex4: ETL Pipeline', () => {
  it('extract phase reads and parses CSV', () => {
    const csv = 'a,b\n1,2\n3,4';
    const rows = parse(csv, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

    expect(rows).toHaveLength(2);
    expect(rows[0].a).toBe('1');
  });

  it('transform phase validates with Zod', () => {
    const Schema = z.object({
      id: z.string().transform(Number),
      name: z.string().min(1),
    });

    const valid = Schema.safeParse({ id: '1', name: 'Test' });
    const invalid = Schema.safeParse({ id: '1', name: '' });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });

  it('transform phase computes resolution time', () => {
    const criado = new Date('2026-01-10');
    const resolvido = new Date('2026-01-12');
    const dias =
      (resolvido.getTime() - criado.getTime()) / (1000 * 60 * 60 * 24);

    expect(dias).toBe(2);
  });

  it('load phase generates alerts for high-priority tickets', () => {
    const customer = {
      nome: 'TechCorp',
      ticketsPorPrioridade: { alta: 3, media: 1, baixa: 0 },
      ticketsAbertos: 1,
    };

    const alertas: string[] = [];

    if (customer.ticketsPorPrioridade.alta >= 2) {
      alertas.push(`${customer.nome}: ${customer.ticketsPorPrioridade.alta} tickets alta prioridade`);
    }
    if (customer.ticketsAbertos > 0) {
      alertas.push(`${customer.nome}: ${customer.ticketsAbertos} ticket(s) aberto(s)`);
    }

    expect(alertas).toHaveLength(2);
    expect(alertas[0]).toContain('alta prioridade');
  });
});
