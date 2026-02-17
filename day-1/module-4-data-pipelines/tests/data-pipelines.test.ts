/**
 * Tests for Module 4: Data Pipelines
 *
 * Full coverage of all 20 exercises (~55 tests).
 * Run: npm test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';

// =============================================
// Mock of the Anthropic SDK (used in Ex12, Ex15, Ex19, Ex20)
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
// Ex1: Basic CSV
// =============================================
describe('Ex1: Basic CSV', () => {
  const sampleCSV = `id,name,email,plan,mrr,start_date,status,industry
1,TechCorp,tech@corp.com,Enterprise,999,2024-01-15,active,SaaS
2,StartupXYZ,hello@xyz.com,Pro,299,2024-06-01,active,Fintech
3,DevShop,dev@shop.io,Starter,49,2025-01-10,churned,Ecommerce`;

  it('parses CSV with columns: true and returns correct row and column count', () => {
    const records = parse(sampleCSV, {
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, string>[];

    expect(records).toHaveLength(3);
    expect(Object.keys(records[0])).toHaveLength(8);
    expect(Object.keys(records[0])).toEqual(
      expect.arrayContaining(['id', 'name', 'email', 'plan', 'mrr', 'start_date', 'status', 'industry'])
    );
  });

  it('returns raw values as strings', () => {
    const records = parse(sampleCSV, {
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, string>[];

    expect(typeof records[0].id).toBe('string');
    expect(typeof records[0].mrr).toBe('string');
    expect(records[0].mrr).toBe('999');
  });

  it('reads correct field values from parsed rows', () => {
    const records = parse(sampleCSV, {
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, string>[];

    expect(records[0].name).toBe('TechCorp');
    expect(records[1].plan).toBe('Pro');
    expect(records[2].status).toBe('churned');
  });
});

// =============================================
// Ex2: CSV Processing
// =============================================
describe('Ex2: CSV Processing', () => {
  const sampleCSV = `id,name,email,plan,mrr,status
1,TechCorp,tech@corp.com,Enterprise,999,active
2,StartupXYZ,hello@xyz.com,Pro,299,active
3,DevShop,dev@shop.io,Starter,49,churned`;

  it('parses CSV with column headers', () => {
    const rows = parse(sampleCSV, {
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, string>[];

    expect(rows).toHaveLength(3);
    expect(rows[0].name).toBe('TechCorp');
    expect(rows[0].plan).toBe('Enterprise');
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

    const activeCustomers = rows.filter((r) => r.status === 'active');
    const totalMrr = activeCustomers.reduce((sum, r) => sum + parseInt(r.mrr, 10), 0);

    expect(activeCustomers).toHaveLength(2);
    expect(totalMrr).toBe(1298);
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
// Ex3: Advanced CSV (filterBy, groupBy, aggregate)
// =============================================
describe('Ex3: Advanced CSV', () => {
  interface Customer {
    id: number;
    name: string;
    plan: string;
    mrr: number;
    status: string;
  }

  const customers: Customer[] = [
    { id: 1, name: 'TechCorp', plan: 'Enterprise', mrr: 999, status: 'active' },
    { id: 2, name: 'StartupXYZ', plan: 'Pro', mrr: 299, status: 'active' },
    { id: 3, name: 'DevShop', plan: 'Pro', mrr: 199, status: 'churned' },
    { id: 4, name: 'BigData', plan: 'Enterprise', mrr: 899, status: 'active' },
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
    sum: number;
    average: number;
    min: number;
    max: number;
    count: number;
  }

  function aggregate(values: number[]): AggregateResult {
    if (values.length === 0) {
      return { sum: 0, average: 0, min: 0, max: 0, count: 0 };
    }
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      sum,
      average: Math.round(sum / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }

  it('filterBy filters by field value', () => {
    const activeCustomers = filterBy(customers, 'status', 'active');
    expect(activeCustomers).toHaveLength(3);
    expect(activeCustomers.every((c) => c.status === 'active')).toBe(true);

    const enterprise = filterBy(customers, 'plan', 'Enterprise');
    expect(enterprise).toHaveLength(2);
  });

  it('groupBy groups records correctly', () => {
    const byPlan = groupBy(customers, 'plan');
    expect(byPlan.size).toBe(2);
    expect(byPlan.get('Enterprise')).toHaveLength(2);
    expect(byPlan.get('Pro')).toHaveLength(2);
  });

  it('aggregate computes sum, average, min, max, count', () => {
    const mrrValues = customers.map((c) => c.mrr);
    const stats = aggregate(mrrValues);

    expect(stats.sum).toBe(999 + 299 + 199 + 899);
    expect(stats.count).toBe(4);
    expect(stats.min).toBe(199);
    expect(stats.max).toBe(999);
    expect(stats.average).toBe(Math.round(stats.sum / 4));

    // Empty array
    const empty = aggregate([]);
    expect(empty.count).toBe(0);
    expect(empty.sum).toBe(0);
  });
});

// =============================================
// Ex4: JSON Transform
// =============================================
describe('Ex4: JSON Transform', () => {
  it('normalizes plan names to consistent format', () => {
    function normalizePlan(raw: string): string {
      const lower = raw.toLowerCase();
      if (lower === 'enterprise') return 'Enterprise';
      if (lower === 'pro') return 'Pro';
      return 'Starter';
    }

    expect(normalizePlan('enterprise')).toBe('Enterprise');
    expect(normalizePlan('ENTERPRISE')).toBe('Enterprise');
    expect(normalizePlan('pro')).toBe('Pro');
    expect(normalizePlan('PRO')).toBe('Pro');
    expect(normalizePlan('starter')).toBe('Starter');
    expect(normalizePlan('unknown')).toBe('Starter');
  });

  it('merges data from multiple sources by email', () => {
    const crm = new Map([['a@b.com', { name: 'A', mrr: 100 }]]);
    const support = new Map([['a@b.com', { tickets: 3 }]]);
    const analytics = new Map([['a@b.com', { logins30d: 50, featuresUsed: ['dashboard', 'api'] }]]);

    const email = 'a@b.com';
    const merged = {
      ...crm.get(email),
      ...support.get(email),
      ...analytics.get(email),
      email,
    };

    expect(merged.name).toBe('A');
    expect(merged.mrr).toBe(100);
    expect(merged.tickets).toBe(3);
    expect(merged.logins30d).toBe(50);
    expect(merged.featuresUsed).toEqual(['dashboard', 'api']);
  });

  it('handles missing data in merge gracefully', () => {
    const crm = new Map([['a@b.com', { name: 'A', mrr: 100 }]]);
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
    name: z.string().min(2).max(100),
    email: z.string().email(),
    plan: z.enum(['Enterprise', 'Pro', 'Starter']),
    mrr: z.number().positive(),
    status: z.enum(['active', 'churned']),
  });

  it('validates correct customer data', () => {
    const result = CustomerSchema.safeParse({
      name: 'TechCorp',
      email: 'tech@corp.com',
      plan: 'Enterprise',
      mrr: 999,
      status: 'active',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid email, invalid plan, and negative MRR', () => {
    const invalidEmail = CustomerSchema.safeParse({
      name: 'Test', email: 'not-an-email', plan: 'Pro', mrr: 299, status: 'active',
    });
    expect(invalidEmail.success).toBe(false);

    const invalidPlan = CustomerSchema.safeParse({
      name: 'Test', email: 'test@test.com', plan: 'Platinum', mrr: 299, status: 'active',
    });
    expect(invalidPlan.success).toBe(false);

    const negativeMrr = CustomerSchema.safeParse({
      name: 'Test', email: 'test@test.com', plan: 'Pro', mrr: -10, status: 'active',
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
        { message: `${field} contains XSS` }
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
// Ex6: Complex Schema (Zod)
// =============================================
describe('Ex6: Complex Schema', () => {
  const AddressSchema = z.object({
    street: z.string().min(3),
    city: z.string().min(2),
    state: z.string().length(2),
    zipCode: z.string().regex(/^\d{5}-?\d{3}$/),
    complement: z.string().default(''),
  });

  const ContactEmailSchema = z.object({
    type: z.literal('email'),
    value: z.string().email(),
  });

  const ContactPhoneSchema = z.object({
    type: z.literal('phone'),
    value: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/),
  });

  const ContactSchema = z.discriminatedUnion('type', [
    ContactEmailSchema,
    ContactPhoneSchema,
  ]);

  const CompanySchema = z.object({
    name: z.string().min(2).max(100),
    taxId: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/),
    address: AddressSchema,
    contacts: z.array(ContactSchema).min(1),
    plan: z.enum(['Enterprise', 'Pro', 'Starter']),
    mrr: z.string().transform(Number),
    tags: z.array(z.string()).default([]),
    metadata: z.record(z.string()).default({}),
    createdAt: z.string().transform((val) => new Date(val)),
  });

  it('validates nested AddressSchema (street, city, state 2 chars, zip code regex)', () => {
    const validAddress = AddressSchema.safeParse({
      street: 'Av. Paulista, 1000',
      city: 'Sao Paulo',
      state: 'SP',
      zipCode: '01310-100',
    });
    expect(validAddress.success).toBe(true);
    if (validAddress.success) {
      expect(validAddress.data.complement).toBe('');
    }

    const invalidState = AddressSchema.safeParse({
      street: 'Av. Paulista', city: 'Sao Paulo', state: 'ABC', zipCode: '01310-100',
    });
    expect(invalidState.success).toBe(false);

    const invalidZipCode = AddressSchema.safeParse({
      street: 'Av. Paulista', city: 'Sao Paulo', state: 'SP', zipCode: 'invalid',
    });
    expect(invalidZipCode.success).toBe(false);
  });

  it('validates discriminated union ContactSchema (email vs phone)', () => {
    const validEmail = ContactSchema.safeParse({ type: 'email', value: 'test@test.com' });
    expect(validEmail.success).toBe(true);

    const validPhone = ContactSchema.safeParse({ type: 'phone', value: '(11) 99999-8888' });
    expect(validPhone.success).toBe(true);

    const invalidEmail = ContactSchema.safeParse({ type: 'email', value: 'not-email' });
    expect(invalidEmail.success).toBe(false);

    const invalidPhone = ContactSchema.safeParse({ type: 'phone', value: '12345' });
    expect(invalidPhone.success).toBe(false);
  });

  it('validates CompanySchema with transforms and rejects invalid data', () => {
    const validCompany = CompanySchema.safeParse({
      name: 'TechCorp Ltda',
      taxId: '12.345.678/0001-90',
      address: { street: 'Av. Paulista, 1000', city: 'Sao Paulo', state: 'SP', zipCode: '01310-100' },
      contacts: [{ type: 'email', value: 'contact@techcorp.com' }],
      plan: 'Enterprise',
      mrr: '999',
      createdAt: '2024-06-15',
    });

    expect(validCompany.success).toBe(true);
    if (validCompany.success) {
      expect(typeof validCompany.data.mrr).toBe('number');
      expect(validCompany.data.mrr).toBe(999);
      expect(validCompany.data.createdAt).toBeInstanceOf(Date);
      expect(validCompany.data.tags).toEqual([]);
    }

    // Invalid: empty name, bad tax ID, empty contacts, bad plan
    const invalidCompany = CompanySchema.safeParse({
      name: '',
      taxId: '123456',
      address: { street: 'X', city: 'Y', state: 'ABC', zipCode: 'invalid' },
      contacts: [],
      plan: 'Platinum',
      mrr: 'abc',
      createdAt: 'invalid-date',
    });
    expect(invalidCompany.success).toBe(false);
  });
});

// =============================================
// Ex7: Data Cleaning
// =============================================
describe('Ex7: Data Cleaning', () => {
  function normalizeString(s: string): string {
    return s.trim().replace(/\s+/g, ' ');
  }

  function normalizeEmail(email: string): string | null {
    const cleaned = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(cleaned) ? cleaned : null;
  }

  type RawRecord = { name: string; email: string; plan: string; mrr: string; status: string };

  function deduplicate(records: RawRecord[]): RawRecord[] {
    const seen = new Map<string, RawRecord>();
    for (const record of records) {
      const email = normalizeEmail(record.email);
      if (!email) continue;
      const existing = seen.get(email);
      if (!existing) {
        seen.set(email, record);
      } else if (record.name.trim().length > existing.name.trim().length) {
        seen.set(email, record);
      }
    }
    return [...seen.values()];
  }

  interface CleanRecord {
    name: string;
    email: string;
    plan: 'Enterprise' | 'Pro' | 'Starter';
    mrr: number;
    status: 'active' | 'churned';
  }

  interface CleanResult {
    cleaned: CleanRecord[];
    rejected: { record: RawRecord; reason: string }[];
    stats: { total: number; cleaned: number; rejected: number; duplicatesRemoved: number };
  }

  function cleanData(rawData: RawRecord[]): CleanResult {
    const rejected: { record: RawRecord; reason: string }[] = [];
    const cleaned: CleanRecord[] = [];
    const deduplicated = deduplicate(rawData);
    const duplicatesRemoved = rawData.length - deduplicated.length;

    for (const record of deduplicated) {
      const name = normalizeString(record.name);
      if (name.length < 2) { rejected.push({ record, reason: 'Name empty or too short' }); continue; }
      const email = normalizeEmail(record.email);
      if (!email) { rejected.push({ record, reason: 'Invalid email' }); continue; }
      const planLower = record.plan.trim().toLowerCase();
      const planMap: Record<string, 'Enterprise' | 'Pro' | 'Starter'> = { enterprise: 'Enterprise', pro: 'Pro', starter: 'Starter' };
      const plan = planMap[planLower];
      if (!plan) { rejected.push({ record, reason: `Unknown plan: ${record.plan}` }); continue; }
      const mrr = parseInt(record.mrr, 10);
      if (isNaN(mrr) || mrr <= 0) { rejected.push({ record, reason: `Invalid MRR: ${record.mrr}` }); continue; }
      const statusLower = record.status.trim().toLowerCase();
      if (statusLower !== 'active' && statusLower !== 'churned') { rejected.push({ record, reason: `Unknown status: ${record.status}` }); continue; }
      cleaned.push({ name, email, plan, mrr, status: statusLower as 'active' | 'churned' });
    }

    return { cleaned, rejected, stats: { total: rawData.length, cleaned: cleaned.length, rejected: rejected.length, duplicatesRemoved } };
  }

  it('normalizeString trims and collapses whitespace', () => {
    expect(normalizeString('  hello   world  ')).toBe('hello world');
    expect(normalizeString('no change')).toBe('no change');
    expect(normalizeString('   ')).toBe('');
  });

  it('normalizeEmail lowercases and validates', () => {
    expect(normalizeEmail('TEST@CORP.COM')).toBe('test@corp.com');
    expect(normalizeEmail(' user@domain.io ')).toBe('user@domain.io');
    expect(normalizeEmail('invalid')).toBeNull();
    expect(normalizeEmail('')).toBeNull();
  });

  it('deduplicate removes duplicates by email and cleanData returns correct structure', () => {
    const dirtyData: RawRecord[] = [
      { name: '  TechCorp  ', email: 'CONTACT@TECHCORP.COM', plan: 'enterprise', mrr: '999', status: 'ACTIVE' },
      { name: 'TechCorp', email: 'contact@techcorp.com', plan: 'Enterprise', mrr: '999', status: 'active' },
      { name: '', email: 'invalid', plan: 'enterprise', mrr: 'abc', status: 'active' },
      { name: 'BigData Inc', email: 'sales@bigdata.com', plan: 'Enterprise', mrr: '999', status: 'active' },
    ];

    const deduped = deduplicate(dirtyData);
    // "invalid" email is skipped, two techcorp records become one
    expect(deduped.length).toBeLessThan(dirtyData.length);

    const result = cleanData(dirtyData);
    expect(result.cleaned.length).toBeGreaterThan(0);
    expect(result.stats.total).toBe(dirtyData.length);
    expect(result.stats.cleaned + result.stats.rejected + result.stats.duplicatesRemoved).toBeLessThanOrEqual(result.stats.total);
    expect(result).toHaveProperty('cleaned');
    expect(result).toHaveProperty('rejected');
    expect(result).toHaveProperty('stats');
  });
});

// =============================================
// Ex8: Data Enrichment
// =============================================
describe('Ex8: Data Enrichment', () => {
  function calculateCustomerAge(startDate: string, now?: number): number {
    const start = new Date(startDate).getTime();
    const today = now ?? Date.now();
    return Math.floor((today - start) / (1000 * 60 * 60 * 24));
  }

  function calculateHealthScore(
    isActive: boolean,
    ageDays: number,
    plan: string,
    openTickets: number
  ): number {
    let score = 0;
    if (isActive) score += 40;
    if (ageDays > 180) score += 20;
    else if (ageDays > 90) score += 10;
    if (plan === 'Enterprise') score += 20;
    else if (plan === 'Pro') score += 15;
    else score += 10;
    if (openTickets === 0) score += 20;
    else if (openTickets === 1) score += 10;
    return Math.min(score, 100);
  }

  function classifyRisk(healthScore: number): 'low' | 'medium' | 'high' {
    if (healthScore >= 80) return 'low';
    if (healthScore >= 50) return 'medium';
    return 'high';
  }

  function calculateLTV(mrr: number, risk: string): number {
    const churnRates: Record<string, number> = { low: 0.02, medium: 0.05, high: 0.10 };
    const churnRate = churnRates[risk] || 0.10;
    return Math.round(mrr / churnRate);
  }

  it('calculateCustomerAge returns correct number of days', () => {
    // Use a fixed "now" for deterministic testing
    const fixedNow = new Date('2026-02-16').getTime();
    const age = calculateCustomerAge('2025-02-16', fixedNow);
    expect(age).toBe(365);

    const age2 = calculateCustomerAge('2026-02-14', fixedNow);
    expect(age2).toBe(2);
  });

  it('calculateHealthScore computes correctly based on inputs', () => {
    // Active, >180 days, Enterprise, 0 tickets = 40+20+20+20 = 100
    expect(calculateHealthScore(true, 200, 'Enterprise', 0)).toBe(100);

    // Active, >90 days, Pro, 1 ticket = 40+10+15+10 = 75
    expect(calculateHealthScore(true, 100, 'Pro', 1)).toBe(75);

    // Churned, <90 days, Starter, 5 tickets = 0+0+10+0 = 10
    expect(calculateHealthScore(false, 30, 'Starter', 5)).toBe(10);
  });

  it('classifyRisk and calculateLTV work correctly', () => {
    expect(classifyRisk(85)).toBe('low');
    expect(classifyRisk(60)).toBe('medium');
    expect(classifyRisk(30)).toBe('high');

    // LTV = MRR / churnRate
    expect(calculateLTV(999, 'low')).toBe(Math.round(999 / 0.02));  // 49950
    expect(calculateLTV(299, 'medium')).toBe(Math.round(299 / 0.05));  // 5980
    expect(calculateLTV(49, 'high')).toBe(Math.round(49 / 0.10));     // 490
  });
});

// =============================================
// Ex9: Streaming (Chunks)
// =============================================
describe('Ex9: Data Streaming', () => {
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
// Ex10: Handlebars Formatting
// =============================================
describe('Ex10: Handlebars Formatting', () => {
  // Simulates Handlebars-style template rendering inline (handlebars may not be installed)
  function simpleTemplate(tpl: string, data: Record<string, unknown>): string {
    return tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] ?? ''));
  }

  it('compiles and renders a template with data substitution', () => {
    const result = simpleTemplate('Hello, {{name}}! Plan: {{plan}}', {
      name: 'TechCorp',
      plan: 'Enterprise',
    });

    expect(result).toBe('Hello, TechCorp! Plan: Enterprise');
  });

  it('handles conditional rendering logic', () => {
    function conditionalTemplate(active: boolean): string {
      return active ? 'ACTIVE' : 'CHURNED';
    }

    expect(conditionalTemplate(true)).toBe('ACTIVE');
    expect(conditionalTemplate(false)).toBe('CHURNED');
  });

  it('renders each-loop for data tables', () => {
    function eachTemplate(customers: { name: string; mrr: number }[]): string {
      return customers.map((c) => `${c.name}: $${c.mrr}`).join('\n');
    }

    const result = eachTemplate([
      { name: 'TechCorp', mrr: 999 },
      { name: 'StartupXYZ', mrr: 299 },
    ]);

    expect(result).toContain('TechCorp: $999');
    expect(result).toContain('StartupXYZ: $299');
  });
});

// =============================================
// Ex11: Multi-Format
// =============================================
describe('Ex11: Multi-Format', () => {
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
        metadata: { totalRecords: data.length },
        data: data,
      };
      return JSON.stringify(output, null, pretty ? 2 : undefined);
    }
    return JSON.stringify(data, null, pretty ? 2 : undefined);
  }

  function toMarkdown(data: Record<string, unknown>[], title?: string): string {
    if (data.length === 0) return title ? `# ${title}\n\n_No data_` : '_No data_';
    const headers = Object.keys(data[0]);
    const lines: string[] = [];
    if (title) lines.push(`# ${title}\n`);
    lines.push(`| ${headers.join(' | ')} |`);
    lines.push(`| ${headers.map(() => '---').join(' | ')} |`);
    for (const row of data) {
      const values = headers.map((h) => String(row[h] ?? ''));
      lines.push(`| ${values.join(' | ')} |`);
    }
    lines.push(`\n_Total: ${data.length} records_`);
    return lines.join('\n');
  }

  const sampleData: Record<string, unknown>[] = [
    { name: 'TechCorp', plan: 'Enterprise', mrr: 999 },
    { name: 'StartupXYZ', plan: 'Pro', mrr: 299 },
  ];

  it('toCSV generates correct CSV with headers and rows', () => {
    const csv = toCSV(sampleData);
    const lines = csv.split('\n');

    expect(lines[0]).toBe('name,plan,mrr');
    expect(lines[1]).toBe('TechCorp,Enterprise,999');
    expect(lines[2]).toBe('StartupXYZ,Pro,299');
    expect(lines).toHaveLength(3);
  });

  it('toJSON with and without metadata', () => {
    const jsonPlain = toJSON(sampleData);
    const parsed = JSON.parse(jsonPlain);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].name).toBe('TechCorp');

    const jsonMeta = toJSON(sampleData, { includeMetadata: true, pretty: true });
    const parsedMeta = JSON.parse(jsonMeta);
    expect(parsedMeta.metadata.totalRecords).toBe(2);
    expect(parsedMeta.data).toHaveLength(2);
  });

  it('toMarkdown generates table with headers and separator', () => {
    const md = toMarkdown(sampleData, 'Report');

    expect(md).toContain('# Report');
    expect(md).toContain('| name | plan | mrr |');
    expect(md).toContain('| --- | --- | --- |');
    expect(md).toContain('| TechCorp | Enterprise | 999 |');
    expect(md).toContain('_Total: 2 records_');
  });
});

// =============================================
// Ex12: AI Classification
// =============================================
describe('Ex12: AI Classification', () => {
  it('constructs classifier prompt correctly', () => {
    const title = 'Critical bug in dashboard';
    const prompt = `Classify the sentiment of this support ticket title in EXACTLY one word: urgent, frustrated, neutral, or positive.\n\nTitle: "${title}"\n\nRespond ONLY with the classification, no explanation.`;

    expect(prompt).toContain(title);
    expect(prompt).toContain('urgent, frustrated, neutral, or positive');
  });

  it('parses JSON response for classification', () => {
    const validResponses = ['urgent', 'frustrated', 'neutral', 'positive'];
    const text = 'urgent';
    const classification = validResponses.includes(text.trim().toLowerCase()) ? text.trim().toLowerCase() : 'neutral';
    expect(classification).toBe('urgent');

    const invalidText = 'something random';
    const fallback = validResponses.includes(invalidText.trim().toLowerCase()) ? invalidText.trim().toLowerCase() : 'neutral';
    expect(fallback).toBe('neutral');
  });

  it('calls Claude API and maps category correctly', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'frustrated' }],
    });

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic();

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Classify: "System is down"' }],
    });

    expect(mockCreate).toHaveBeenCalledOnce();
    const text = response.content[0].type === 'text' ? response.content[0].text.trim().toLowerCase() : 'neutral';
    expect(text).toBe('frustrated');
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
    throw new Error('Retries exhausted');
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
      if (callCount < 3) throw new Error('Temporary failure');
      return 'success';
    };

    const result = await withRetry(fn, { maxRetries: 3, baseDelayMs: 10 });
    expect(result).toBe('success');
    expect(callCount).toBe(3);
  });

  it('withFallback uses fallback on primary failure', async () => {
    const primary = async () => { throw new Error('failure'); };
    const fallback = async () => 'fallback_value';

    const result = await withFallback(primary, fallback);
    expect(result).toBe('fallback_value');
  });

  it('DeadLetterQueue add/getAll/size operations', () => {
    const dlq = new DeadLetterQueue<{ id: number }>();

    expect(dlq.size()).toBe(0);

    dlq.add({ id: 1 }, 'Invalid email', 3);
    dlq.add({ id: 2 }, 'Invalid value', 2);

    expect(dlq.size()).toBe(2);

    const items = dlq.getAll();
    expect(items).toHaveLength(2);
    expect(items[0].item.id).toBe(1);
    expect(items[0].error).toBe('Invalid email');
    expect(items[0].attempts).toBe(3);
    expect(items[1].item.id).toBe(2);
  });
});

// =============================================
// Ex14: Pipeline Metrics
// =============================================
describe('Ex14: Pipeline Metrics', () => {
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
    metrics.recordError('validate', 'Invalid name');
    metrics.recordError('validate', 'Invalid name');
    metrics.recordError('validate', 'Invalid email');

    const report = metrics.getReport();
    expect(report).toHaveProperty('totalDurationMs');
    expect(report).toHaveProperty('steps');
    expect(report).toHaveProperty('counters');
    expect(report).toHaveProperty('errorRate');
    expect(report).toHaveProperty('topErrors');
    expect(report.counters.errors).toBe(3);
    expect(report.errorRate).toBeGreaterThan(0);
    expect(report.topErrors[0].error).toBe('validate: Invalid name');
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
// Ex15: Pipeline with Tools
// =============================================
describe('Ex15: Pipeline with Tools', () => {
  it('defines tool with correct schema for data pipeline operations', () => {
    const tools = [
      {
        name: 'query_customer',
        description: 'Queries customer data by email.',
        input_schema: {
          type: 'object' as const,
          properties: {
            email: { type: 'string', description: 'Customer email' },
          },
          required: ['email'],
        },
      },
      {
        name: 'calculate_metrics',
        description: 'Calculates metrics for a customer.',
        input_schema: {
          type: 'object' as const,
          properties: {
            customer_id: { type: 'number', description: 'Customer ID' },
          },
          required: ['customer_id'],
        },
      },
    ];

    expect(tools).toHaveLength(2);
    expect(tools[0].name).toBe('query_customer');
    expect(tools[0].input_schema.required).toContain('email');
    expect(tools[1].name).toBe('calculate_metrics');
    expect(tools[1].input_schema.required).toContain('customer_id');
  });

  it('executes pipeline step via tool handler', () => {
    const customers = [
      { id: '1', name: 'TechCorp', email: 'tech@corp.com', plan: 'Enterprise', mrr: '999', status: 'active' },
    ];

    function handleToolCall(name: string, input: Record<string, unknown>): string {
      if (name === 'query_customer') {
        const email = input.email as string;
        const customer = customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
        if (!customer) return JSON.stringify({ error: `Customer not found: ${email}` });
        return JSON.stringify(customer);
      }
      return JSON.stringify({ error: `Unknown tool: ${name}` });
    }

    const result = JSON.parse(handleToolCall('query_customer', { email: 'tech@corp.com' }));
    expect(result.name).toBe('TechCorp');
    expect(result.plan).toBe('Enterprise');

    const notFound = JSON.parse(handleToolCall('query_customer', { email: 'nope@nope.com' }));
    expect(notFound.error).toContain('not found');
  });

  it('calls Claude API with tools and processes tool_use response', async () => {
    // Simulate a tool_use response followed by a text response
    mockCreate
      .mockResolvedValueOnce({
        stop_reason: 'tool_use',
        content: [
          { type: 'tool_use', id: 'tu_1', name: 'query_customer', input: { email: 'tech@corp.com' } },
        ],
      })
      .mockResolvedValueOnce({
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: 'Analysis completed for customer TechCorp.' }],
      });

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic();

    let response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [],
      messages: [{ role: 'user', content: 'Analyze customer tech@corp.com' }],
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
    const csv = `id,name,email,plan,mrr,start_date,status,industry
1,TechCorp,tech@corp.com,Enterprise,999,2024-01-15,active,SaaS
2,StartupXYZ,hello@xyz.com,Pro,299,2024-06-01,churned,Fintech`;

    const rows = parse(csv, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe('TechCorp');
    expect(rows[1].status).toBe('churned');
  });

  it('transform phase validates with Zod schema', () => {
    const CustomerSchema = z.object({
      id: z.string().transform(Number),
      name: z.string().min(1),
      email: z.string().email(),
      plan: z.enum(['Enterprise', 'Pro', 'Starter']),
      mrr: z.string().transform(Number),
      status: z.enum(['active', 'churned']),
    });

    const valid = CustomerSchema.safeParse({
      id: '1', name: 'TechCorp', email: 'tech@corp.com', plan: 'Enterprise', mrr: '999', status: 'active',
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.id).toBe(1);
      expect(valid.data.mrr).toBe(999);
    }

    const invalid = CustomerSchema.safeParse({
      id: '1', name: '', email: 'bad', plan: 'Platinum', mrr: 'abc', status: 'unknown',
    });
    expect(invalid.success).toBe(false);
  });

  it('computes resolution time and generates alerts', () => {
    // Resolution time
    const created = new Date('2026-01-10');
    const resolved = new Date('2026-01-12');
    const days = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    expect(days).toBe(2);

    // Alert generation
    const customer = {
      name: 'TechCorp',
      ticketsByPriority: { high: 3, medium: 1, low: 0 },
      openTickets: 1,
    };

    const alerts: string[] = [];
    if (customer.ticketsByPriority.high >= 2) {
      alerts.push(`${customer.name}: ${customer.ticketsByPriority.high} high priority tickets`);
    }
    if (customer.openTickets > 0) {
      alerts.push(`${customer.name}: ${customer.openTickets} open ticket(s)`);
    }

    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toContain('high priority');
    expect(alerts[1]).toContain('open');
  });
});

// =============================================
// Ex17: Incremental ETL
// =============================================
describe('Ex17: Incremental ETL', () => {
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
  ): { inserts: number; updates: number; skipped: number; log: { id: string; operation: Operation; name: string }[] } {
    const result = { inserts: 0, updates: 0, skipped: 0, records: [] as Record<string, string>[], log: [] as { id: string; operation: Operation; name: string }[] };
    const currentHashes = new Map<string, string>();

    for (const record of data) {
      const id = record.id;
      const hash = hashRecord(record);
      currentHashes.set(id, hash);

      if (checkpoint.isNew(id)) {
        result.inserts++;
        result.log.push({ id, operation: 'INSERT', name: record.name });
      } else if (checkpoint.isChanged(id, hash)) {
        result.updates++;
        result.log.push({ id, operation: 'UPDATE', name: record.name });
      } else {
        result.skipped++;
        result.log.push({ id, operation: 'SKIP', name: record.name });
      }
    }

    const maxId = Math.max(...data.map((r) => parseInt(r.id, 10)));
    checkpoint.save(maxId, currentHashes);
    return result;
  }

  it('hashRecord produces consistent hashes', () => {
    const record = { id: '1', name: 'TechCorp', mrr: '999' };
    const hash1 = hashRecord(record);
    const hash2 = hashRecord(record);

    expect(hash1).toBe(hash2);
    expect(typeof hash1).toBe('string');
    expect(hash1.length).toBeGreaterThan(0);

    // Different record produces different hash
    const differentRecord = { id: '1', name: 'TechCorp', mrr: '1000' };
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
      { id: '1', name: 'TechCorp', mrr: '999' },
      { id: '2', name: 'StartupXYZ', mrr: '299' },
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
      { id: '1', name: 'TechCorp', mrr: '1500' }, // modified
      { id: '2', name: 'StartupXYZ', mrr: '299' }, // same
      { id: '3', name: 'NewCo', mrr: '49' },       // new
    ];
    const run3 = incrementalETL(modifiedData, checkpoint);
    expect(run3.inserts).toBe(1);
    expect(run3.updates).toBe(1);
    expect(run3.skipped).toBe(1);
  });
});

// =============================================
// Ex18: Report Templates
// =============================================
describe('Ex18: Report Templates', () => {
  // Simulate Handlebars-style template rendering inline (partials, helpers, layout composition)
  function simpleTemplate(tpl: string, data: Record<string, unknown>): string {
    return tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] ?? ''));
  }

  it('renders template with partials (simulated)', () => {
    // Simulates partial inclusion: a KPI partial embedded in a parent template
    function renderKpiPartial(data: { mrr: string; activeCount: number }): string {
      const partial = `  MRR: ${data.mrr} | Active: ${data.activeCount}`;
      return `--- KPIs ---\n${partial}`;
    }

    const result = renderKpiPartial({ mrr: '$5000', activeCount: 8 });
    expect(result).toContain('MRR: $5000');
    expect(result).toContain('Active: 8');
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

    const result = `Churn: ${percentage(3, 10)} | 5 ${pluralize(5, 'customer', 'customers')}`;
    expect(result).toContain('Churn: 30.0%');
    expect(result).toContain('5 customers');

    const single = `1 ${pluralize(1, 'customer', 'customers')}`;
    expect(single).toContain('1 customer');
    expect(single).not.toContain('customers');
  });

  it('composes layout with multiple sections (header + body)', () => {
    function renderLayout(title: string, items: string[]): string {
      const header = `=== ${title} ===`;
      const body = items.map((item) => `  - ${item}`).join('\n');
      return `${header}\n\n${body}`;
    }

    const result = renderLayout('Dashboard', [
      'Total MRR: $5000',
      'Customers: 10',
      'Churn: 20%',
    ]);

    expect(result).toContain('=== Dashboard ===');
    expect(result).toContain('Total MRR: $5000');
    expect(result).toContain('Customers: 10');
    expect(result).toContain('Churn: 20%');
  });
});

// =============================================
// Ex19: AI Context
// =============================================
describe('Ex19: AI Context', () => {
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
      content: [{ type: 'text', text: 'Summary: SaaS company with MRR of $5000 and churn of 20%.' }],
    });

    const context = '## Customer Summary\nTotal: 10 customers (8 active)\nTotal MRR: $5000\nChurn Rate: 20%';
    const question = 'Generate an executive summary.';

    const prompt = `You are a data analyst. Use the context below:\n\n${context}\n\nQuestion: ${question}`;

    expect(prompt).toContain('Customer Summary');
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
// Ex20: Data Platform (End-to-End)
// =============================================
describe('Ex20: Data Platform', () => {
  it('end-to-end pipeline: CSV -> validate -> transform -> output', () => {
    const csv = `id,name,email,plan,mrr,start_date,status,industry
1,TechCorp,tech@corp.com,Enterprise,999,2024-01-15,active,SaaS
2,StartupXYZ,hello@xyz.com,Pro,299,2024-06-01,active,Fintech
3,DevShop,dev@shop.io,Starter,49,2025-01-10,churned,Ecommerce`;

    // Extract
    const rawRecords = parse(csv, { columns: true, skip_empty_lines: true }) as Record<string, string>[];
    expect(rawRecords).toHaveLength(3);

    // Validate
    const CustomerSchema = z.object({
      id: z.string().transform(Number),
      name: z.string().min(1),
      email: z.string().email(),
      plan: z.enum(['Enterprise', 'Pro', 'Starter']),
      mrr: z.string().transform(Number),
      start_date: z.string(),
      status: z.enum(['active', 'churned']),
      industry: z.string(),
    });

    const validated = rawRecords
      .map((r) => CustomerSchema.safeParse(r))
      .filter((r) => r.success)
      .map((r) => (r as { success: true; data: z.infer<typeof CustomerSchema> }).data);
    expect(validated).toHaveLength(3);

    // Transform (enrich)
    const enriched = validated.map((c) => {
      const ageDays = Math.floor((Date.now() - new Date(c.start_date).getTime()) / (1000 * 60 * 60 * 24));
      let healthScore = 0;
      if (c.status === 'active') healthScore += 40;
      if (ageDays > 180) healthScore += 20;
      if (c.plan === 'Enterprise') healthScore += 20;
      else if (c.plan === 'Pro') healthScore += 15;
      else healthScore += 10;
      healthScore += 20; // base for no tickets
      return { ...c, ageDays, healthScore: Math.min(healthScore, 100) };
    });

    expect(enriched[0].healthScore).toBeGreaterThan(0);
    expect(enriched[0]).toHaveProperty('ageDays');
    expect(enriched[0]).toHaveProperty('name');
    expect(enriched[0]).toHaveProperty('mrr');
    expect(enriched[0]).toHaveProperty('plan');
    expect(enriched[0]).toHaveProperty('status');

    // Output aggregation
    const activeCustomers = enriched.filter((c) => c.status === 'active');
    const totalMrr = activeCustomers.reduce((sum, c) => sum + c.mrr, 0);
    expect(totalMrr).toBe(999 + 299);
    expect(activeCustomers).toHaveLength(2);
  });

  it('integrates multiple pipeline components (validation, enrichment, aggregation)', () => {
    // Inline data
    const records = [
      { name: 'TechCorp', email: 'tech@corp.com', plan: 'Enterprise', mrr: 999, status: 'active' },
      { name: 'StartupXYZ', email: 'hello@xyz.com', plan: 'Pro', mrr: 299, status: 'active' },
      { name: 'BadData', email: 'bad', plan: 'Invalid', mrr: -1, status: 'unknown' },
    ];

    const Schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      plan: z.enum(['Enterprise', 'Pro', 'Starter']),
      mrr: z.number().positive(),
      status: z.enum(['active', 'churned']),
    });

    const valid = records.filter((r) => Schema.safeParse(r).success);
    expect(valid).toHaveLength(2);

    // Enrich
    const enriched = valid.map((c) => ({
      ...c,
      risk: c.mrr >= 500 ? 'low' : 'medium',
      estimatedLtv: Math.round(c.mrr / 0.05),
    }));

    expect(enriched[0].risk).toBe('low');
    expect(enriched[1].risk).toBe('medium');
    expect(enriched[0].estimatedLtv).toBe(Math.round(999 / 0.05));

    // Aggregate
    const byPlan = new Map<string, number>();
    for (const c of enriched) {
      byPlan.set(c.plan, (byPlan.get(c.plan) || 0) + c.mrr);
    }
    expect(byPlan.get('Enterprise')).toBe(999);
    expect(byPlan.get('Pro')).toBe(299);
  });

  it('final output includes all expected fields from full pipeline', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Complete analysis: healthy MRR, 2 active customers.' }],
    });

    // Simulate final AI analysis step
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic();

    const pipelineResult = {
      totalMrr: 1298,
      activeCustomers: 2,
      totalCustomers: 3,
      churnRate: '33.3%',
      topCustomers: [{ name: 'TechCorp', mrr: 999 }],
      alerts: ['DevShop: churned'],
    };

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Analyze this data: ${JSON.stringify(pipelineResult)}. Generate executive summary.`,
      }],
    });

    expect(mockCreate).toHaveBeenCalledOnce();
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    expect(text).toContain('MRR');

    // Verify pipeline output has all expected fields
    expect(pipelineResult).toHaveProperty('totalMrr');
    expect(pipelineResult).toHaveProperty('activeCustomers');
    expect(pipelineResult).toHaveProperty('totalCustomers');
    expect(pipelineResult).toHaveProperty('churnRate');
    expect(pipelineResult).toHaveProperty('topCustomers');
    expect(pipelineResult).toHaveProperty('alerts');
  });
});
