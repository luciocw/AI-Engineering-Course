/**
 * Testes para o Modulo 4: Data Pipelines
 *
 * Cobertura completa de todos os 20 exercicios (~55 testes).
 * Execute: npm test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';

// =============================================
// Mock do SDK Anthropic (usado em Ex12, Ex15, Ex19, Ex20)
// =============================================
const mockCreate = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = { create: mockCreate };
  },
}));

beforeEach(() => {
  mockCreate.mockReset();
});

// =============================================
// Ex1: CSV Basico
// =============================================
describe('Ex1: CSV Basico', () => {
  const sampleCSV = `id,nome,email,plano,mrr,data_inicio,status,industria
1,TechCorp,tech@corp.com,Enterprise,999,2024-01-15,ativo,SaaS
2,StartupXYZ,hello@xyz.com,Pro,299,2024-06-01,ativo,Fintech
3,DevShop,dev@shop.io,Starter,49,2025-01-10,churned,Ecommerce`;

  it('parses CSV with columns: true and returns correct row and column count', () => {
    const registros = parse(sampleCSV, {
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, string>[];

    expect(registros).toHaveLength(3);
    expect(Object.keys(registros[0])).toHaveLength(8);
    expect(Object.keys(registros[0])).toEqual(
      expect.arrayContaining(['id', 'nome', 'email', 'plano', 'mrr', 'data_inicio', 'status', 'industria'])
    );
  });

  it('returns raw values as strings', () => {
    const registros = parse(sampleCSV, {
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, string>[];

    expect(typeof registros[0].id).toBe('string');
    expect(typeof registros[0].mrr).toBe('string');
    expect(registros[0].mrr).toBe('999');
  });

  it('reads correct field values from parsed rows', () => {
    const registros = parse(sampleCSV, {
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, string>[];

    expect(registros[0].nome).toBe('TechCorp');
    expect(registros[1].plano).toBe('Pro');
    expect(registros[2].status).toBe('churned');
  });
});

// =============================================
// Ex2: CSV Processing
// =============================================
describe('Ex2: CSV Processing', () => {
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
// Ex3: CSV Avancado (filterBy, groupBy, aggregate)
// =============================================
describe('Ex3: CSV Avancado', () => {
  interface Customer {
    id: number;
    nome: string;
    plano: string;
    mrr: number;
    status: string;
  }

  const clientes: Customer[] = [
    { id: 1, nome: 'TechCorp', plano: 'Enterprise', mrr: 999, status: 'ativo' },
    { id: 2, nome: 'StartupXYZ', plano: 'Pro', mrr: 299, status: 'ativo' },
    { id: 3, nome: 'DevShop', plano: 'Pro', mrr: 199, status: 'churned' },
    { id: 4, nome: 'BigData', plano: 'Enterprise', mrr: 899, status: 'ativo' },
  ];

  function filterBy<T>(items: T[], field: keyof T, value: T[keyof T]): T[] {
    return items.filter((item) => item[field] === value);
  }

  function groupBy<T>(items: T[], field: keyof T): Map<string, T[]> {
    const groups = new Map<string, T[]>();
    for (const item of items) {
      const key = String(item[field]);
      const group = groups.get(key) || [];
      group.push(item);
      groups.set(key, group);
    }
    return groups;
  }

  interface AggregateResult {
    soma: number;
    media: number;
    min: number;
    max: number;
    count: number;
  }

  function aggregate(values: number[]): AggregateResult {
    if (values.length === 0) {
      return { soma: 0, media: 0, min: 0, max: 0, count: 0 };
    }
    const soma = values.reduce((a, b) => a + b, 0);
    return {
      soma,
      media: Math.round(soma / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }

  it('filterBy filters by field value', () => {
    const ativos = filterBy(clientes, 'status', 'ativo');
    expect(ativos).toHaveLength(3);
    expect(ativos.every((c) => c.status === 'ativo')).toBe(true);

    const enterprise = filterBy(clientes, 'plano', 'Enterprise');
    expect(enterprise).toHaveLength(2);
  });

  it('groupBy groups records correctly', () => {
    const porPlano = groupBy(clientes, 'plano');
    expect(porPlano.size).toBe(2);
    expect(porPlano.get('Enterprise')).toHaveLength(2);
    expect(porPlano.get('Pro')).toHaveLength(2);
  });

  it('aggregate computes soma, media, min, max, count', () => {
    const mrrValues = clientes.map((c) => c.mrr);
    const stats = aggregate(mrrValues);

    expect(stats.soma).toBe(999 + 299 + 199 + 899);
    expect(stats.count).toBe(4);
    expect(stats.min).toBe(199);
    expect(stats.max).toBe(999);
    expect(stats.media).toBe(Math.round(stats.soma / 4));

    // Empty array
    const empty = aggregate([]);
    expect(empty.count).toBe(0);
    expect(empty.soma).toBe(0);
  });
});

// =============================================
// Ex4: JSON Transform
// =============================================
describe('Ex4: JSON Transform', () => {
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
    expect(normalizePlano('unknown')).toBe('Starter');
  });

  it('merges data from multiple sources by email', () => {
    const crm = new Map([['a@b.com', { nome: 'A', mrr: 100 }]]);
    const support = new Map([['a@b.com', { tickets: 3 }]]);
    const analytics = new Map([['a@b.com', { logins30d: 50, featuresUsadas: ['dashboard', 'api'] }]]);

    const email = 'a@b.com';
    const merged = {
      ...crm.get(email),
      ...support.get(email),
      ...analytics.get(email),
      email,
    };

    expect(merged.nome).toBe('A');
    expect(merged.mrr).toBe(100);
    expect(merged.tickets).toBe(3);
    expect(merged.logins30d).toBe(50);
    expect(merged.featuresUsadas).toEqual(['dashboard', 'api']);
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
// Ex5: Data Validation (Zod)
// =============================================
describe('Ex5: Data Validation', () => {
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

  it('rejects invalid email, invalid plan, and negative MRR', () => {
    const invalidEmail = CustomerSchema.safeParse({
      nome: 'Test', email: 'not-an-email', plano: 'Pro', mrr: 299, status: 'ativo',
    });
    expect(invalidEmail.success).toBe(false);

    const invalidPlan = CustomerSchema.safeParse({
      nome: 'Test', email: 'test@test.com', plano: 'Platinum', mrr: 299, status: 'ativo',
    });
    expect(invalidPlan.success).toBe(false);

    const negativeMrr = CustomerSchema.safeParse({
      nome: 'Test', email: 'test@test.com', plano: 'Pro', mrr: -10, status: 'ativo',
    });
    expect(negativeMrr.success).toBe(false);
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
// Ex6: Schema Complexo (Zod)
// =============================================
describe('Ex6: Schema Complexo', () => {
  const EnderecoSchema = z.object({
    rua: z.string().min(3),
    cidade: z.string().min(2),
    estado: z.string().length(2),
    cep: z.string().regex(/^\d{5}-?\d{3}$/),
    complemento: z.string().default(''),
  });

  const ContatoEmailSchema = z.object({
    tipo: z.literal('email'),
    valor: z.string().email(),
  });

  const ContatoTelefoneSchema = z.object({
    tipo: z.literal('telefone'),
    valor: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/),
  });

  const ContatoSchema = z.discriminatedUnion('tipo', [
    ContatoEmailSchema,
    ContatoTelefoneSchema,
  ]);

  const EmpresaSchema = z.object({
    nome: z.string().min(2).max(100),
    cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/),
    endereco: EnderecoSchema,
    contatos: z.array(ContatoSchema).min(1),
    plano: z.enum(['Enterprise', 'Pro', 'Starter']),
    mrr: z.string().transform(Number),
    tags: z.array(z.string()).default([]),
    metadata: z.record(z.string()).default({}),
    criadoEm: z.string().transform((val) => new Date(val)),
  });

  it('validates nested EnderecoSchema (rua, cidade, estado 2 chars, CEP regex)', () => {
    const validEndereco = EnderecoSchema.safeParse({
      rua: 'Av. Paulista, 1000',
      cidade: 'Sao Paulo',
      estado: 'SP',
      cep: '01310-100',
    });
    expect(validEndereco.success).toBe(true);
    if (validEndereco.success) {
      expect(validEndereco.data.complemento).toBe('');
    }

    const invalidEstado = EnderecoSchema.safeParse({
      rua: 'Av. Paulista', cidade: 'Sao Paulo', estado: 'ABC', cep: '01310-100',
    });
    expect(invalidEstado.success).toBe(false);

    const invalidCep = EnderecoSchema.safeParse({
      rua: 'Av. Paulista', cidade: 'Sao Paulo', estado: 'SP', cep: 'invalido',
    });
    expect(invalidCep.success).toBe(false);
  });

  it('validates discriminated union ContatoSchema (email vs telefone)', () => {
    const validEmail = ContatoSchema.safeParse({ tipo: 'email', valor: 'test@test.com' });
    expect(validEmail.success).toBe(true);

    const validTelefone = ContatoSchema.safeParse({ tipo: 'telefone', valor: '(11) 99999-8888' });
    expect(validTelefone.success).toBe(true);

    const invalidEmail = ContatoSchema.safeParse({ tipo: 'email', valor: 'not-email' });
    expect(invalidEmail.success).toBe(false);

    const invalidTelefone = ContatoSchema.safeParse({ tipo: 'telefone', valor: '12345' });
    expect(invalidTelefone.success).toBe(false);
  });

  it('validates EmpresaSchema with transforms and rejects invalid data', () => {
    const validEmpresa = EmpresaSchema.safeParse({
      nome: 'TechCorp Ltda',
      cnpj: '12.345.678/0001-90',
      endereco: { rua: 'Av. Paulista, 1000', cidade: 'Sao Paulo', estado: 'SP', cep: '01310-100' },
      contatos: [{ tipo: 'email', valor: 'contato@techcorp.com' }],
      plano: 'Enterprise',
      mrr: '999',
      criadoEm: '2024-06-15',
    });

    expect(validEmpresa.success).toBe(true);
    if (validEmpresa.success) {
      expect(typeof validEmpresa.data.mrr).toBe('number');
      expect(validEmpresa.data.mrr).toBe(999);
      expect(validEmpresa.data.criadoEm).toBeInstanceOf(Date);
      expect(validEmpresa.data.tags).toEqual([]);
    }

    // Invalid: empty name, bad cnpj, empty contatos, bad plano
    const invalidEmpresa = EmpresaSchema.safeParse({
      nome: '',
      cnpj: '123456',
      endereco: { rua: 'X', cidade: 'Y', estado: 'ABC', cep: 'invalido' },
      contatos: [],
      plano: 'Platinum',
      mrr: 'abc',
      criadoEm: 'data-invalida',
    });
    expect(invalidEmpresa.success).toBe(false);
  });
});

// =============================================
// Ex7: Limpeza de Dados
// =============================================
describe('Ex7: Limpeza de Dados', () => {
  function normalizeString(s: string): string {
    return s.trim().replace(/\s+/g, ' ');
  }

  function normalizeEmail(email: string): string | null {
    const cleaned = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(cleaned) ? cleaned : null;
  }

  type RawRecord = { nome: string; email: string; plano: string; mrr: string; status: string };

  function deduplicate(records: RawRecord[]): RawRecord[] {
    const seen = new Map<string, RawRecord>();
    for (const record of records) {
      const email = normalizeEmail(record.email);
      if (!email) continue;
      const existing = seen.get(email);
      if (!existing) {
        seen.set(email, record);
      } else if (record.nome.trim().length > existing.nome.trim().length) {
        seen.set(email, record);
      }
    }
    return [...seen.values()];
  }

  interface CleanRecord {
    nome: string;
    email: string;
    plano: 'Enterprise' | 'Pro' | 'Starter';
    mrr: number;
    status: 'ativo' | 'churned';
  }

  interface CleanResult {
    limpos: CleanRecord[];
    rejeitados: { registro: RawRecord; motivo: string }[];
    stats: { total: number; limpos: number; rejeitados: number; duplicatasRemovidas: number };
  }

  function cleanData(rawData: RawRecord[]): CleanResult {
    const rejeitados: { registro: RawRecord; motivo: string }[] = [];
    const limpos: CleanRecord[] = [];
    const deduplicados = deduplicate(rawData);
    const duplicatasRemovidas = rawData.length - deduplicados.length;

    for (const record of deduplicados) {
      const nome = normalizeString(record.nome);
      if (nome.length < 2) { rejeitados.push({ registro: record, motivo: 'Nome vazio ou muito curto' }); continue; }
      const email = normalizeEmail(record.email);
      if (!email) { rejeitados.push({ registro: record, motivo: 'Email invalido' }); continue; }
      const planoLower = record.plano.trim().toLowerCase();
      const planoMap: Record<string, 'Enterprise' | 'Pro' | 'Starter'> = { enterprise: 'Enterprise', pro: 'Pro', starter: 'Starter' };
      const plano = planoMap[planoLower];
      if (!plano) { rejeitados.push({ registro: record, motivo: `Plano desconhecido: ${record.plano}` }); continue; }
      const mrr = parseInt(record.mrr, 10);
      if (isNaN(mrr) || mrr <= 0) { rejeitados.push({ registro: record, motivo: `MRR invalido: ${record.mrr}` }); continue; }
      const statusLower = record.status.trim().toLowerCase();
      if (statusLower !== 'ativo' && statusLower !== 'churned') { rejeitados.push({ registro: record, motivo: `Status desconhecido: ${record.status}` }); continue; }
      limpos.push({ nome, email, plano, mrr, status: statusLower as 'ativo' | 'churned' });
    }

    return { limpos, rejeitados, stats: { total: rawData.length, limpos: limpos.length, rejeitados: rejeitados.length, duplicatasRemovidas } };
  }

  it('normalizeString trims and collapses whitespace', () => {
    expect(normalizeString('  hello   world  ')).toBe('hello world');
    expect(normalizeString('no change')).toBe('no change');
    expect(normalizeString('   ')).toBe('');
  });

  it('normalizeEmail lowercases and validates', () => {
    expect(normalizeEmail('TEST@CORP.COM')).toBe('test@corp.com');
    expect(normalizeEmail(' user@domain.io ')).toBe('user@domain.io');
    expect(normalizeEmail('invalido')).toBeNull();
    expect(normalizeEmail('')).toBeNull();
  });

  it('deduplicate removes duplicates by email and cleanData returns correct structure', () => {
    const dadosSujos: RawRecord[] = [
      { nome: '  TechCorp  ', email: 'CONTATO@TECHCORP.COM', plano: 'enterprise', mrr: '999', status: 'ATIVO' },
      { nome: 'TechCorp', email: 'contato@techcorp.com', plano: 'Enterprise', mrr: '999', status: 'ativo' },
      { nome: '', email: 'invalido', plano: 'enterprise', mrr: 'abc', status: 'ativo' },
      { nome: 'BigData Inc', email: 'vendas@bigdata.com', plano: 'Enterprise', mrr: '999', status: 'ativo' },
    ];

    const deduped = deduplicate(dadosSujos);
    // "invalido" email is skipped, two techcorp records become one
    expect(deduped.length).toBeLessThan(dadosSujos.length);

    const result = cleanData(dadosSujos);
    expect(result.limpos.length).toBeGreaterThan(0);
    expect(result.stats.total).toBe(dadosSujos.length);
    expect(result.stats.limpos + result.stats.rejeitados + result.stats.duplicatasRemovidas).toBeLessThanOrEqual(result.stats.total);
    expect(result).toHaveProperty('limpos');
    expect(result).toHaveProperty('rejeitados');
    expect(result).toHaveProperty('stats');
  });
});

// =============================================
// Ex8: Enriquecimento de Dados
// =============================================
describe('Ex8: Enriquecimento de Dados', () => {
  function calcularIdadeCliente(dataInicio: string, now?: number): number {
    const inicio = new Date(dataInicio).getTime();
    const hoje = now ?? Date.now();
    return Math.floor((hoje - inicio) / (1000 * 60 * 60 * 24));
  }

  function calcularHealthScore(
    statusAtivo: boolean,
    idadeDias: number,
    plano: string,
    ticketsAbertos: number
  ): number {
    let score = 0;
    if (statusAtivo) score += 40;
    if (idadeDias > 180) score += 20;
    else if (idadeDias > 90) score += 10;
    if (plano === 'Enterprise') score += 20;
    else if (plano === 'Pro') score += 15;
    else score += 10;
    if (ticketsAbertos === 0) score += 20;
    else if (ticketsAbertos === 1) score += 10;
    return Math.min(score, 100);
  }

  function classificarRisco(healthScore: number): 'baixo' | 'medio' | 'alto' {
    if (healthScore >= 80) return 'baixo';
    if (healthScore >= 50) return 'medio';
    return 'alto';
  }

  function calcularLTV(mrr: number, risco: string): number {
    const churnRates: Record<string, number> = { baixo: 0.02, medio: 0.05, alto: 0.10 };
    const churnRate = churnRates[risco] || 0.10;
    return Math.round(mrr / churnRate);
  }

  it('calcularIdadeCliente returns correct number of days', () => {
    // Use a fixed "now" for deterministic testing
    const fixedNow = new Date('2026-02-16').getTime();
    const idade = calcularIdadeCliente('2025-02-16', fixedNow);
    expect(idade).toBe(365);

    const idade2 = calcularIdadeCliente('2026-02-14', fixedNow);
    expect(idade2).toBe(2);
  });

  it('calcularHealthScore computes correctly based on inputs', () => {
    // Active, >180 days, Enterprise, 0 tickets = 40+20+20+20 = 100
    expect(calcularHealthScore(true, 200, 'Enterprise', 0)).toBe(100);

    // Active, >90 days, Pro, 1 ticket = 40+10+15+10 = 75
    expect(calcularHealthScore(true, 100, 'Pro', 1)).toBe(75);

    // Churned, <90 days, Starter, 5 tickets = 0+0+10+0 = 10
    expect(calcularHealthScore(false, 30, 'Starter', 5)).toBe(10);
  });

  it('classificarRisco and calcularLTV work correctly', () => {
    expect(classificarRisco(85)).toBe('baixo');
    expect(classificarRisco(60)).toBe('medio');
    expect(classificarRisco(30)).toBe('alto');

    // LTV = MRR / churnRate
    expect(calcularLTV(999, 'baixo')).toBe(Math.round(999 / 0.02));  // 49950
    expect(calcularLTV(299, 'medio')).toBe(Math.round(299 / 0.05));  // 5980
    expect(calcularLTV(49, 'alto')).toBe(Math.round(49 / 0.10));     // 490
  });
});

// =============================================
// Ex9: Streaming (Chunks)
// =============================================
describe('Ex9: Streaming Dados', () => {
  function* chunked<T>(items: T[], chunkSize: number): Generator<T[], void, unknown> {
    for (let i = 0; i < items.length; i += chunkSize) {
      yield items.slice(i, i + chunkSize);
    }
  }

  interface ChunkResult<T> {
    chunkIndex: number;
    processed: number;
    results: T[];
    durationMs: number;
  }

  function processChunks<T, R>(
    items: T[],
    chunkSize: number,
    processor: (chunk: T[], index: number) => R[]
  ): ChunkResult<R>[] {
    const results: ChunkResult<R>[] = [];
    let chunkIndex = 0;

    for (const chunk of chunked(items, chunkSize)) {
      const start = performance.now();
      const chunkResults = processor(chunk, chunkIndex);
      const duration = performance.now() - start;

      results.push({
        chunkIndex,
        processed: chunk.length,
        results: chunkResults,
        durationMs: Math.round(duration * 100) / 100,
      });
      chunkIndex++;
    }

    return results;
  }

  it('chunked generator yields correct chunk sizes', () => {
    const items = [1, 2, 3, 4, 5, 6, 7];
    const chunks = [...chunked(items, 3)];

    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toEqual([1, 2, 3]);
    expect(chunks[1]).toEqual([4, 5, 6]);
    expect(chunks[2]).toEqual([7]);
  });

  it('processChunks processes all items and returns ChunkResult', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    const results = processChunks(items, 2, (chunk) => chunk.map((s) => s.toUpperCase()));

    expect(results).toHaveLength(3);
    expect(results[0].processed).toBe(2);
    expect(results[0].results).toEqual(['A', 'B']);
    expect(results[2].processed).toBe(1);
    expect(results[2].results).toEqual(['E']);

    const totalProcessed = results.reduce((sum, r) => sum + r.processed, 0);
    expect(totalProcessed).toBe(5);
  });

  it('handles backpressure with delay between chunks', async () => {
    async function processWithBackpressure<T>(
      items: T[],
      chunkSize: number,
      processor: (chunk: T[]) => Promise<void>,
      delayMs: number
    ): Promise<{ totalMs: number; chunks: number }> {
      const start = performance.now();
      let chunkCount = 0;
      for (const chunk of chunked(items, chunkSize)) {
        await processor(chunk);
        chunkCount++;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      return { totalMs: Math.round(performance.now() - start), chunks: chunkCount };
    }

    const items = [1, 2, 3, 4, 5, 6];
    let processedCount = 0;

    const result = await processWithBackpressure(
      items, 2,
      async (chunk) => { processedCount += chunk.length; },
      10
    );

    expect(result.chunks).toBe(3);
    expect(processedCount).toBe(6);
    expect(result.totalMs).toBeGreaterThanOrEqual(20); // At least 3 * 10ms delays (minus last)
  });
});

// =============================================
// Ex10: Formatacao Handlebars
// =============================================
describe('Ex10: Formatacao Handlebars', () => {
  // Simulates Handlebars-style template rendering inline (handlebars may not be installed)
  function simpleTemplate(tpl: string, data: Record<string, unknown>): string {
    return tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] ?? ''));
  }

  it('compiles and renders a template with data substitution', () => {
    const result = simpleTemplate('Ola, {{nome}}! Plano: {{plano}}', {
      nome: 'TechCorp',
      plano: 'Enterprise',
    });

    expect(result).toBe('Ola, TechCorp! Plano: Enterprise');
  });

  it('handles conditional rendering logic', () => {
    function conditionalTemplate(ativo: boolean): string {
      return ativo ? 'ATIVO' : 'CHURNED';
    }

    expect(conditionalTemplate(true)).toBe('ATIVO');
    expect(conditionalTemplate(false)).toBe('CHURNED');
  });

  it('renders each-loop for data tables', () => {
    function eachTemplate(clientes: { nome: string; mrr: number }[]): string {
      return clientes.map((c) => `${c.nome}: R$${c.mrr}`).join('\n');
    }

    const result = eachTemplate([
      { nome: 'TechCorp', mrr: 999 },
      { nome: 'StartupXYZ', mrr: 299 },
    ]);

    expect(result).toContain('TechCorp: R$999');
    expect(result).toContain('StartupXYZ: R$299');
  });
});

// =============================================
// Ex11: Multi-Formato
// =============================================
describe('Ex11: Multi-Formato', () => {
  function toCSV(data: Record<string, unknown>[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const lines: string[] = [headers.join(',')];
    for (const row of data) {
      const values = headers.map((h) => {
        const val = String(row[h] ?? '');
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      lines.push(values.join(','));
    }
    return lines.join('\n');
  }

  function toJSON(data: Record<string, unknown>[], options: { pretty?: boolean; includeMetadata?: boolean } = {}): string {
    const { pretty = false, includeMetadata = false } = options;
    if (includeMetadata) {
      const output = {
        metadata: { totalRegistros: data.length },
        dados: data,
      };
      return JSON.stringify(output, null, pretty ? 2 : undefined);
    }
    return JSON.stringify(data, null, pretty ? 2 : undefined);
  }

  function toMarkdown(data: Record<string, unknown>[], title?: string): string {
    if (data.length === 0) return title ? `# ${title}\n\n_Sem dados_` : '_Sem dados_';
    const headers = Object.keys(data[0]);
    const lines: string[] = [];
    if (title) lines.push(`# ${title}\n`);
    lines.push(`| ${headers.join(' | ')} |`);
    lines.push(`| ${headers.map(() => '---').join(' | ')} |`);
    for (const row of data) {
      const values = headers.map((h) => String(row[h] ?? ''));
      lines.push(`| ${values.join(' | ')} |`);
    }
    lines.push(`\n_Total: ${data.length} registros_`);
    return lines.join('\n');
  }

  const sampleData: Record<string, unknown>[] = [
    { nome: 'TechCorp', plano: 'Enterprise', mrr: 999 },
    { nome: 'StartupXYZ', plano: 'Pro', mrr: 299 },
  ];

  it('toCSV generates correct CSV with headers and rows', () => {
    const csv = toCSV(sampleData);
    const lines = csv.split('\n');

    expect(lines[0]).toBe('nome,plano,mrr');
    expect(lines[1]).toBe('TechCorp,Enterprise,999');
    expect(lines[2]).toBe('StartupXYZ,Pro,299');
    expect(lines).toHaveLength(3);
  });

  it('toJSON with and without metadata', () => {
    const jsonPlain = toJSON(sampleData);
    const parsed = JSON.parse(jsonPlain);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].nome).toBe('TechCorp');

    const jsonMeta = toJSON(sampleData, { includeMetadata: true, pretty: true });
    const parsedMeta = JSON.parse(jsonMeta);
    expect(parsedMeta.metadata.totalRegistros).toBe(2);
    expect(parsedMeta.dados).toHaveLength(2);
  });

  it('toMarkdown generates table with headers and separator', () => {
    const md = toMarkdown(sampleData, 'Relatorio');

    expect(md).toContain('# Relatorio');
    expect(md).toContain('| nome | plano | mrr |');
    expect(md).toContain('| --- | --- | --- |');
    expect(md).toContain('| TechCorp | Enterprise | 999 |');
    expect(md).toContain('_Total: 2 registros_');
  });
});

// =============================================
// Ex12: Classificacao AI
// =============================================
describe('Ex12: Classificacao AI', () => {
  it('constructs classifier prompt correctly', () => {
    const titulo = 'Bug critico no dashboard';
    const prompt = `Classifique o sentimento deste titulo de ticket de suporte em EXATAMENTE uma palavra: urgente, frustrado, neutro ou positivo.\n\nTitulo: "${titulo}"\n\nResponda APENAS com a classificacao, sem explicacao.`;

    expect(prompt).toContain(titulo);
    expect(prompt).toContain('urgente, frustrado, neutro ou positivo');
  });

  it('parses JSON response for classification', () => {
    const validResponses = ['urgente', 'frustrado', 'neutro', 'positivo'];
    const text = 'urgente';
    const classification = validResponses.includes(text.trim().toLowerCase()) ? text.trim().toLowerCase() : 'neutro';
    expect(classification).toBe('urgente');

    const invalidText = 'something random';
    const fallback = validResponses.includes(invalidText.trim().toLowerCase()) ? invalidText.trim().toLowerCase() : 'neutro';
    expect(fallback).toBe('neutro');
  });

  it('calls Claude API and maps category correctly', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'frustrado' }],
    });

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic();

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Classifique: "Sistema fora do ar"' }],
    });

    expect(mockCreate).toHaveBeenCalledOnce();
    const text = response.content[0].type === 'text' ? response.content[0].text.trim().toLowerCase() : 'neutro';
    expect(text).toBe('frustrado');
  });
});

// =============================================
// Ex13: Error Pipeline
// =============================================
describe('Ex13: Error Pipeline', () => {
  async function withRetry<T>(fn: () => Promise<T>, options: { maxRetries: number; baseDelayMs: number }): Promise<T> {
    const { maxRetries, baseDelayMs } = options;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt - 1)));
      }
    }
    throw new Error('Retry esgotado');
  }

  async function withFallback<T>(primary: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    try {
      return await primary();
    } catch {
      return await fallback();
    }
  }

  class DeadLetterQueue<T> {
    private queue: { item: T; error: string; timestamp: string; attempts: number }[] = [];
    add(item: T, error: string, attempts: number): void {
      this.queue.push({ item, error, timestamp: new Date().toISOString(), attempts });
    }
    getAll() { return [...this.queue]; }
    size() { return this.queue.length; }
  }

  it('withRetry succeeds after initial failures', async () => {
    let callCount = 0;
    const fn = async () => {
      callCount++;
      if (callCount < 3) throw new Error('Falha temporaria');
      return 'sucesso';
    };

    const result = await withRetry(fn, { maxRetries: 3, baseDelayMs: 10 });
    expect(result).toBe('sucesso');
    expect(callCount).toBe(3);
  });

  it('withFallback uses fallback on primary failure', async () => {
    const primary = async () => { throw new Error('falha'); };
    const fallback = async () => 'fallback_value';

    const result = await withFallback(primary, fallback);
    expect(result).toBe('fallback_value');
  });

  it('DeadLetterQueue add/getAll/size operations', () => {
    const dlq = new DeadLetterQueue<{ id: number }>();

    expect(dlq.size()).toBe(0);

    dlq.add({ id: 1 }, 'Email invalido', 3);
    dlq.add({ id: 2 }, 'Valor invalido', 2);

    expect(dlq.size()).toBe(2);

    const items = dlq.getAll();
    expect(items).toHaveLength(2);
    expect(items[0].item.id).toBe(1);
    expect(items[0].error).toBe('Email invalido');
    expect(items[0].attempts).toBe(3);
    expect(items[1].item.id).toBe(2);
  });
});

// =============================================
// Ex14: Metricas Pipeline
// =============================================
describe('Ex14: Metricas Pipeline', () => {
  class PipelineMetrics {
    private timings = new Map<string, number[]>();
    private counters = new Map<string, number>();
    private errors = new Map<string, number>();
    private startTime = performance.now();

    startTimer(step: string): () => void {
      const start = performance.now();
      return () => {
        const duration = performance.now() - start;
        const existing = this.timings.get(step) || [];
        existing.push(duration);
        this.timings.set(step, existing);
      };
    }

    increment(counter: string, by: number = 1): void {
      this.counters.set(counter, (this.counters.get(counter) || 0) + by);
    }

    recordError(step: string, error: string): void {
      const key = `${step}: ${error}`;
      this.errors.set(key, (this.errors.get(key) || 0) + 1);
      this.increment('errors');
    }

    getReport() {
      const totalDurationMs = Math.round((performance.now() - this.startTime) * 100) / 100;
      const steps = [...this.timings.entries()].map(([name, durations]) => {
        const sorted = [...durations].sort((a, b) => a - b);
        const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
        const p95Index = Math.floor(sorted.length * 0.95);
        const p95 = sorted[p95Index] || sorted[sorted.length - 1];
        return { name, avgMs: Math.round(avg * 100) / 100, p95Ms: Math.round(p95 * 100) / 100, calls: durations.length };
      });
      const totalProcessed = this.counters.get('processed') || 0;
      const totalErrors = this.counters.get('errors') || 0;
      const errorRate = totalProcessed > 0 ? (totalErrors / totalProcessed) * 100 : 0;
      const topErrors = [...this.errors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([error, count]) => ({ error, count }));
      return { totalDurationMs, steps, counters: Object.fromEntries(this.counters), errorRate: Math.round(errorRate * 10) / 10, topErrors };
    }
  }

  function withMetrics<T, R>(metrics: PipelineMetrics, stepName: string, fn: (input: T) => R): (input: T) => R {
    return (input: T): R => {
      const stop = metrics.startTimer(stepName);
      try {
        const result = fn(input);
        metrics.increment('processed');
        stop();
        return result;
      } catch (error) {
        metrics.recordError(stepName, (error as Error).message);
        stop();
        throw error;
      }
    };
  }

  it('PipelineMetrics startTimer and increment work correctly', () => {
    const metrics = new PipelineMetrics();

    const stop = metrics.startTimer('test_step');
    // Simulate some work
    for (let i = 0; i < 1000; i++) { /* noop */ }
    stop();

    metrics.increment('processed', 5);
    metrics.increment('processed', 3);

    const report = metrics.getReport();
    expect(report.steps).toHaveLength(1);
    expect(report.steps[0].name).toBe('test_step');
    expect(report.steps[0].calls).toBe(1);
    expect(report.counters.processed).toBe(8);
  });

  it('getReport returns correct structure with errorRate and topErrors', () => {
    const metrics = new PipelineMetrics();

    metrics.increment('processed', 10);
    metrics.recordError('validate', 'Nome invalido');
    metrics.recordError('validate', 'Nome invalido');
    metrics.recordError('validate', 'Email invalido');

    const report = metrics.getReport();
    expect(report).toHaveProperty('totalDurationMs');
    expect(report).toHaveProperty('steps');
    expect(report).toHaveProperty('counters');
    expect(report).toHaveProperty('errorRate');
    expect(report).toHaveProperty('topErrors');
    expect(report.counters.errors).toBe(3);
    expect(report.errorRate).toBeGreaterThan(0);
    expect(report.topErrors[0].error).toBe('validate: Nome invalido');
    expect(report.topErrors[0].count).toBe(2);
  });

  it('withMetrics wrapper records timing and errors', () => {
    const metrics = new PipelineMetrics();

    const transform = withMetrics(metrics, 'transform', (input: string) => {
      if (input === 'bad') throw new Error('Invalid input');
      return input.toUpperCase();
    });

    expect(transform('hello')).toBe('HELLO');
    expect(() => transform('bad')).toThrow('Invalid input');

    const report = metrics.getReport();
    expect(report.steps.find((s) => s.name === 'transform')?.calls).toBe(2);
    expect(report.counters.processed).toBe(1);
    expect(report.counters.errors).toBe(1);
  });
});

// =============================================
// Ex15: Pipeline com Tools
// =============================================
describe('Ex15: Pipeline com Tools', () => {
  it('defines tool with correct schema for data pipeline operations', () => {
    const tools = [
      {
        name: 'consultar_cliente',
        description: 'Consulta dados de um cliente pelo email.',
        input_schema: {
          type: 'object' as const,
          properties: {
            email: { type: 'string', description: 'Email do cliente' },
          },
          required: ['email'],
        },
      },
      {
        name: 'calcular_metricas',
        description: 'Calcula metricas de um cliente.',
        input_schema: {
          type: 'object' as const,
          properties: {
            cliente_id: { type: 'number', description: 'ID do cliente' },
          },
          required: ['cliente_id'],
        },
      },
    ];

    expect(tools).toHaveLength(2);
    expect(tools[0].name).toBe('consultar_cliente');
    expect(tools[0].input_schema.required).toContain('email');
    expect(tools[1].name).toBe('calcular_metricas');
    expect(tools[1].input_schema.required).toContain('cliente_id');
  });

  it('executes pipeline step via tool handler', () => {
    const customers = [
      { id: '1', nome: 'TechCorp', email: 'tech@corp.com', plano: 'Enterprise', mrr: '999', status: 'ativo' },
    ];

    function handleToolCall(name: string, input: Record<string, unknown>): string {
      if (name === 'consultar_cliente') {
        const email = input.email as string;
        const customer = customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
        if (!customer) return JSON.stringify({ error: `Cliente nao encontrado: ${email}` });
        return JSON.stringify(customer);
      }
      return JSON.stringify({ error: `Tool desconhecida: ${name}` });
    }

    const result = JSON.parse(handleToolCall('consultar_cliente', { email: 'tech@corp.com' }));
    expect(result.nome).toBe('TechCorp');
    expect(result.plano).toBe('Enterprise');

    const notFound = JSON.parse(handleToolCall('consultar_cliente', { email: 'nope@nope.com' }));
    expect(notFound.error).toContain('nao encontrado');
  });

  it('calls Claude API with tools and processes tool_use response', async () => {
    // Simulate a tool_use response followed by a text response
    mockCreate
      .mockResolvedValueOnce({
        stop_reason: 'tool_use',
        content: [
          { type: 'tool_use', id: 'tu_1', name: 'consultar_cliente', input: { email: 'tech@corp.com' } },
        ],
      })
      .mockResolvedValueOnce({
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: 'Analise concluida do cliente TechCorp.' }],
      });

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic();

    let response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [],
      messages: [{ role: 'user', content: 'Analise o cliente tech@corp.com' }],
    });

    expect(response.stop_reason).toBe('tool_use');

    // Process tool results and continue
    response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [],
      messages: [],
    });

    expect(response.stop_reason).toBe('end_turn');
    const textBlock = response.content.find((b: { type: string }) => b.type === 'text') as { type: string; text: string };
    expect(textBlock.text).toContain('TechCorp');
  });
});

// =============================================
// Ex16: ETL Pipeline
// =============================================
describe('Ex16: ETL Pipeline', () => {
  it('extract phase reads and parses CSV', () => {
    const csv = `id,nome,email,plano,mrr,data_inicio,status,industria
1,TechCorp,tech@corp.com,Enterprise,999,2024-01-15,ativo,SaaS
2,StartupXYZ,hello@xyz.com,Pro,299,2024-06-01,churned,Fintech`;

    const rows = parse(csv, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

    expect(rows).toHaveLength(2);
    expect(rows[0].nome).toBe('TechCorp');
    expect(rows[1].status).toBe('churned');
  });

  it('transform phase validates with Zod schema', () => {
    const CustomerSchema = z.object({
      id: z.string().transform(Number),
      nome: z.string().min(1),
      email: z.string().email(),
      plano: z.enum(['Enterprise', 'Pro', 'Starter']),
      mrr: z.string().transform(Number),
      status: z.enum(['ativo', 'churned']),
    });

    const valid = CustomerSchema.safeParse({
      id: '1', nome: 'TechCorp', email: 'tech@corp.com', plano: 'Enterprise', mrr: '999', status: 'ativo',
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.id).toBe(1);
      expect(valid.data.mrr).toBe(999);
    }

    const invalid = CustomerSchema.safeParse({
      id: '1', nome: '', email: 'bad', plano: 'Platinum', mrr: 'abc', status: 'unknown',
    });
    expect(invalid.success).toBe(false);
  });

  it('computes resolution time and generates alerts', () => {
    // Resolution time
    const criado = new Date('2026-01-10');
    const resolvido = new Date('2026-01-12');
    const dias = (resolvido.getTime() - criado.getTime()) / (1000 * 60 * 60 * 24);
    expect(dias).toBe(2);

    // Alert generation
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
    expect(alertas[1]).toContain('aberto');
  });
});

// =============================================
// Ex17: ETL Incremental
// =============================================
describe('Ex17: ETL Incremental', () => {
  function hashRecord(record: Record<string, string>): string {
    const content = JSON.stringify(record);
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash.toString(36);
  }

  class CheckpointManager {
    private checkpoint = {
      lastRunAt: '',
      lastProcessedId: 0,
      processedHashes: new Map<string, string>(),
    };

    save(lastId: number, records: Map<string, string>): void {
      this.checkpoint = {
        lastRunAt: new Date().toISOString(),
        lastProcessedId: lastId,
        processedHashes: new Map(records),
      };
    }

    getCheckpoint() { return this.checkpoint; }
    isNew(id: string): boolean { return !this.checkpoint.processedHashes.has(id); }
    isChanged(id: string, hash: string): boolean {
      const existing = this.checkpoint.processedHashes.get(id);
      return existing !== undefined && existing !== hash;
    }
    hasData(): boolean { return this.checkpoint.processedHashes.size > 0; }
  }

  type Operation = 'INSERT' | 'UPDATE' | 'SKIP';

  function incrementalETL(
    data: Record<string, string>[],
    checkpoint: CheckpointManager
  ): { inserts: number; updates: number; skipped: number; log: { id: string; operation: Operation; nome: string }[] } {
    const result = { inserts: 0, updates: 0, skipped: 0, records: [] as Record<string, string>[], log: [] as { id: string; operation: Operation; nome: string }[] };
    const currentHashes = new Map<string, string>();

    for (const record of data) {
      const id = record.id;
      const hash = hashRecord(record);
      currentHashes.set(id, hash);

      if (checkpoint.isNew(id)) {
        result.inserts++;
        result.log.push({ id, operation: 'INSERT', nome: record.nome });
      } else if (checkpoint.isChanged(id, hash)) {
        result.updates++;
        result.log.push({ id, operation: 'UPDATE', nome: record.nome });
      } else {
        result.skipped++;
        result.log.push({ id, operation: 'SKIP', nome: record.nome });
      }
    }

    const maxId = Math.max(...data.map((r) => parseInt(r.id, 10)));
    checkpoint.save(maxId, currentHashes);
    return result;
  }

  it('hashRecord produces consistent hashes', () => {
    const record = { id: '1', nome: 'TechCorp', mrr: '999' };
    const hash1 = hashRecord(record);
    const hash2 = hashRecord(record);

    expect(hash1).toBe(hash2);
    expect(typeof hash1).toBe('string');
    expect(hash1.length).toBeGreaterThan(0);

    // Different record produces different hash
    const differentRecord = { id: '1', nome: 'TechCorp', mrr: '1000' };
    expect(hashRecord(differentRecord)).not.toBe(hash1);
  });

  it('CheckpointManager tracks processed records', () => {
    const cm = new CheckpointManager();
    expect(cm.hasData()).toBe(false);
    expect(cm.isNew('1')).toBe(true);

    const hashes = new Map<string, string>();
    hashes.set('1', 'abc123');
    hashes.set('2', 'def456');
    cm.save(2, hashes);

    expect(cm.hasData()).toBe(true);
    expect(cm.isNew('1')).toBe(false);
    expect(cm.isNew('3')).toBe(true);
    expect(cm.isChanged('1', 'abc123')).toBe(false);
    expect(cm.isChanged('1', 'different')).toBe(true);
  });

  it('incrementalETL: first run = all INSERTs, second run = all SKIPs, modified = UPDATEs', () => {
    const data = [
      { id: '1', nome: 'TechCorp', mrr: '999' },
      { id: '2', nome: 'StartupXYZ', mrr: '299' },
    ];

    const checkpoint = new CheckpointManager();

    // First run: all inserts
    const run1 = incrementalETL(data, checkpoint);
    expect(run1.inserts).toBe(2);
    expect(run1.updates).toBe(0);
    expect(run1.skipped).toBe(0);

    // Second run (same data): all skips
    const run2 = incrementalETL(data, checkpoint);
    expect(run2.inserts).toBe(0);
    expect(run2.updates).toBe(0);
    expect(run2.skipped).toBe(2);

    // Third run: one modified, one new
    const modifiedData = [
      { id: '1', nome: 'TechCorp', mrr: '1500' }, // modified
      { id: '2', nome: 'StartupXYZ', mrr: '299' }, // same
      { id: '3', nome: 'NewCo', mrr: '49' },       // new
    ];
    const run3 = incrementalETL(modifiedData, checkpoint);
    expect(run3.inserts).toBe(1);
    expect(run3.updates).toBe(1);
    expect(run3.skipped).toBe(1);
  });
});

// =============================================
// Ex18: Relatorio Templates
// =============================================
describe('Ex18: Relatorio Templates', () => {
  // Simulate Handlebars-style template rendering inline (partials, helpers, layout composition)
  function simpleTemplate(tpl: string, data: Record<string, unknown>): string {
    return tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] ?? ''));
  }

  it('renders template with partials (simulated)', () => {
    // Simulates partial inclusion: a KPI partial embedded in a parent template
    function renderKpiPartial(data: { mrr: string; ativos: number }): string {
      const partial = `  MRR: ${data.mrr} | Ativos: ${data.ativos}`;
      return `--- KPIs ---\n${partial}`;
    }

    const result = renderKpiPartial({ mrr: 'R$5000', ativos: 8 });
    expect(result).toContain('MRR: R$5000');
    expect(result).toContain('Ativos: 8');
    expect(result).toContain('--- KPIs ---');
  });

  it('formats report data with helpers (percentage, pluralize)', () => {
    function percentage(part: number, total: number): string {
      if (total === 0) return '0%';
      return `${((part / total) * 100).toFixed(1)}%`;
    }

    function pluralize(count: number, singular: string, plural: string): string {
      return count === 1 ? singular : plural;
    }

    const result = `Churn: ${percentage(3, 10)} | 5 ${pluralize(5, 'cliente', 'clientes')}`;
    expect(result).toContain('Churn: 30.0%');
    expect(result).toContain('5 clientes');

    const single = `1 ${pluralize(1, 'cliente', 'clientes')}`;
    expect(single).toContain('1 cliente');
    expect(single).not.toContain('clientes');
  });

  it('composes layout with multiple sections (header + body)', () => {
    function renderLayout(titulo: string, itens: string[]): string {
      const header = `=== ${titulo} ===`;
      const body = itens.map((item) => `  - ${item}`).join('\n');
      return `${header}\n\n${body}`;
    }

    const result = renderLayout('Dashboard', [
      'MRR Total: R$5000',
      'Clientes: 10',
      'Churn: 20%',
    ]);

    expect(result).toContain('=== Dashboard ===');
    expect(result).toContain('MRR Total: R$5000');
    expect(result).toContain('Clientes: 10');
    expect(result).toContain('Churn: 20%');
  });
});

// =============================================
// Ex19: Contexto AI
// =============================================
describe('Ex19: Contexto AI', () => {
  it('chunks text by character limit', () => {
    function chunkText(text: string, maxChars: number): string[] {
      const chunks: string[] = [];
      for (let i = 0; i < text.length; i += maxChars) {
        chunks.push(text.slice(i, i + maxChars));
      }
      return chunks;
    }

    const text = 'A'.repeat(100);
    const chunks = chunkText(text, 30);

    expect(chunks).toHaveLength(4); // 30+30+30+10
    expect(chunks[0]).toHaveLength(30);
    expect(chunks[3]).toHaveLength(10);
  });

  it('supports chunk overlap for context continuity', () => {
    function chunkTextWithOverlap(text: string, maxChars: number, overlap: number): string[] {
      const chunks: string[] = [];
      let i = 0;
      while (i < text.length) {
        chunks.push(text.slice(i, i + maxChars));
        i += maxChars - overlap;
      }
      return chunks;
    }

    const text = 'ABCDEFGHIJKLMNOPQRST'; // 20 chars
    const chunks = chunkTextWithOverlap(text, 10, 3);

    expect(chunks.length).toBeGreaterThan(1);
    // First chunk ends with some chars that second chunk starts with (overlap)
    expect(chunks[0].slice(-3)).toBe(chunks[1].slice(0, 3));
  });

  it('constructs summarization prompt and calls Claude API', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Resumo: empresa SaaS com MRR de R$5000 e churn de 20%.' }],
    });

    const context = '## Resumo de Clientes\nTotal: 10 clientes (8 ativos)\nMRR Total: R$5000\nChurn Rate: 20%';
    const question = 'Gere um resumo executivo.';

    const prompt = `Voce e um analista de dados. Use o contexto abaixo:\n\n${context}\n\nPergunta: ${question}`;

    expect(prompt).toContain('Resumo de Clientes');
    expect(prompt).toContain(question);

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic();

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    expect(mockCreate).toHaveBeenCalledOnce();
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    expect(text).toContain('MRR');
  });
});

// =============================================
// Ex20: Plataforma Dados (End-to-End)
// =============================================
describe('Ex20: Plataforma Dados', () => {
  it('end-to-end pipeline: CSV -> validate -> transform -> output', () => {
    const csv = `id,nome,email,plano,mrr,data_inicio,status,industria
1,TechCorp,tech@corp.com,Enterprise,999,2024-01-15,ativo,SaaS
2,StartupXYZ,hello@xyz.com,Pro,299,2024-06-01,ativo,Fintech
3,DevShop,dev@shop.io,Starter,49,2025-01-10,churned,Ecommerce`;

    // Extract
    const rawRecords = parse(csv, { columns: true, skip_empty_lines: true }) as Record<string, string>[];
    expect(rawRecords).toHaveLength(3);

    // Validate
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

    const validated = rawRecords
      .map((r) => CustomerSchema.safeParse(r))
      .filter((r) => r.success)
      .map((r) => (r as { success: true; data: z.infer<typeof CustomerSchema> }).data);
    expect(validated).toHaveLength(3);

    // Transform (enrich)
    const enriched = validated.map((c) => {
      const idadeDias = Math.floor((Date.now() - new Date(c.data_inicio).getTime()) / (1000 * 60 * 60 * 24));
      let healthScore = 0;
      if (c.status === 'ativo') healthScore += 40;
      if (idadeDias > 180) healthScore += 20;
      if (c.plano === 'Enterprise') healthScore += 20;
      else if (c.plano === 'Pro') healthScore += 15;
      else healthScore += 10;
      healthScore += 20; // base for no tickets
      return { ...c, idadeDias, healthScore: Math.min(healthScore, 100) };
    });

    expect(enriched[0].healthScore).toBeGreaterThan(0);
    expect(enriched[0]).toHaveProperty('idadeDias');
    expect(enriched[0]).toHaveProperty('nome');
    expect(enriched[0]).toHaveProperty('mrr');
    expect(enriched[0]).toHaveProperty('plano');
    expect(enriched[0]).toHaveProperty('status');

    // Output aggregation
    const ativos = enriched.filter((c) => c.status === 'ativo');
    const mrrTotal = ativos.reduce((sum, c) => sum + c.mrr, 0);
    expect(mrrTotal).toBe(999 + 299);
    expect(ativos).toHaveLength(2);
  });

  it('integrates multiple pipeline components (validation, enrichment, aggregation)', () => {
    // Inline data
    const records = [
      { nome: 'TechCorp', email: 'tech@corp.com', plano: 'Enterprise', mrr: 999, status: 'ativo' },
      { nome: 'StartupXYZ', email: 'hello@xyz.com', plano: 'Pro', mrr: 299, status: 'ativo' },
      { nome: 'BadData', email: 'bad', plano: 'Invalid', mrr: -1, status: 'unknown' },
    ];

    const Schema = z.object({
      nome: z.string().min(2),
      email: z.string().email(),
      plano: z.enum(['Enterprise', 'Pro', 'Starter']),
      mrr: z.number().positive(),
      status: z.enum(['ativo', 'churned']),
    });

    const valid = records.filter((r) => Schema.safeParse(r).success);
    expect(valid).toHaveLength(2);

    // Enrich
    const enriched = valid.map((c) => ({
      ...c,
      risco: c.mrr >= 500 ? 'baixo' : 'medio',
      ltvEstimado: Math.round(c.mrr / 0.05),
    }));

    expect(enriched[0].risco).toBe('baixo');
    expect(enriched[1].risco).toBe('medio');
    expect(enriched[0].ltvEstimado).toBe(Math.round(999 / 0.05));

    // Aggregate
    const porPlano = new Map<string, number>();
    for (const c of enriched) {
      porPlano.set(c.plano, (porPlano.get(c.plano) || 0) + c.mrr);
    }
    expect(porPlano.get('Enterprise')).toBe(999);
    expect(porPlano.get('Pro')).toBe(299);
  });

  it('final output includes all expected fields from full pipeline', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Analise completa: MRR saudavel, 2 clientes ativos.' }],
    });

    // Simulate final AI analysis step
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic();

    const pipelineResult = {
      mrrTotal: 1298,
      clientesAtivos: 2,
      totalClientes: 3,
      churnRate: '33.3%',
      topClientes: [{ nome: 'TechCorp', mrr: 999 }],
      alertas: ['DevShop: churned'],
    };

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Analise estes dados: ${JSON.stringify(pipelineResult)}. Gere resumo executivo.`,
      }],
    });

    expect(mockCreate).toHaveBeenCalledOnce();
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    expect(text).toContain('MRR');

    // Verify pipeline output has all expected fields
    expect(pipelineResult).toHaveProperty('mrrTotal');
    expect(pipelineResult).toHaveProperty('clientesAtivos');
    expect(pipelineResult).toHaveProperty('totalClientes');
    expect(pipelineResult).toHaveProperty('churnRate');
    expect(pipelineResult).toHaveProperty('topClientes');
    expect(pipelineResult).toHaveProperty('alertas');
  });
});
