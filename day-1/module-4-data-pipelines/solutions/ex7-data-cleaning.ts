/**
 * Solution 7: Data Cleaning
 *
 * Normalizes, deduplicates, and fixes dirty data.
 * Run: npx tsx solutions/ex7-limpeza-dados.ts
 */

// Simulated dirty data
const dirtyData = [
  { name: '  TechCorp  ', email: 'CONTATO@TECHCORP.COM', plan: 'enterprise', mrr: '999', status: 'ATIVO' },
  { name: 'TechCorp', email: 'contato@techcorp.com', plan: 'Enterprise', mrr: '999', status: 'ativo' },
  { name: 'Startup XYZ  ', email: 'hello@startup.xyz', plan: 'pro', mrr: '299', status: 'Ativo' },
  { name: 'startup xyz', email: 'HELLO@STARTUP.XYZ', plan: 'PRO', mrr: '299', status: 'ativo' },
  { name: '', email: 'invalid', plan: 'enterprise', mrr: 'abc', status: 'ativo' },
  { name: 'BigData Inc', email: 'vendas@bigdata.com', plan: 'Enterprise', mrr: '999', status: 'ativo' },
  { name: 'CloudFirst', email: 'cloud@first.com ', plan: 'Pro', mrr: '299', status: 'churned' },
  { name: 'Cl\u00f3udFirst', email: 'cloud@first.com', plan: 'pro', mrr: '299', status: 'churned' },
];

type RawRecord = (typeof dirtyData)[number];

// === 1: normalizeString ===
function normalizeString(s: string): string {
  return s.trim().replace(/\s+/g, ' ');
}

// === 2: normalizeEmail ===
function normalizeEmail(email: string): string | null {
  const cleaned = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(cleaned) ? cleaned : null;
}

// === 3: normalizePlan ===
function normalizePlan(plan: string): 'Enterprise' | 'Pro' | 'Starter' | null {
  const lower = plan.trim().toLowerCase();
  const planMap: Record<string, 'Enterprise' | 'Pro' | 'Starter'> = {
    enterprise: 'Enterprise',
    pro: 'Pro',
    starter: 'Starter',
  };
  return planMap[lower] || null;
}

// === 4: normalizeStatus ===
function normalizeStatus(status: string): 'ativo' | 'churned' | null {
  const lower = status.trim().toLowerCase();
  if (lower === 'ativo') return 'ativo';
  if (lower === 'churned') return 'churned';
  return null;
}

// === 5: deduplicate ===
function deduplicate(records: RawRecord[]): RawRecord[] {
  const seen = new Map<string, RawRecord>();

  for (const record of records) {
    const email = normalizeEmail(record.email);
    if (!email) continue;

    const existing = seen.get(email);
    if (!existing) {
      seen.set(email, record);
    } else {
      // Keep the more complete record (longer name, no strange accents)
      if (record.name.trim().length > existing.name.trim().length) {
        seen.set(email, record);
      }
    }
  }

  return [...seen.values()];
}

// === 6: cleanData ===
interface CleanRecord {
  name: string;
  email: string;
  plan: 'Enterprise' | 'Pro' | 'Starter';
  mrr: number;
  status: 'ativo' | 'churned';
}

interface CleanResult {
  cleaned: CleanRecord[];
  rejected: { record: RawRecord; reason: string }[];
  stats: {
    total: number;
    cleaned: number;
    rejected: number;
    duplicatesRemoved: number;
  };
}

function cleanData(rawData: RawRecord[]): CleanResult {
  const rejected: { record: RawRecord; reason: string }[] = [];
  const cleaned: CleanRecord[] = [];

  // Phase 1: Deduplicate
  const deduplicated = deduplicate(rawData);
  const duplicatesRemoved = rawData.length - deduplicated.length;

  // Phase 2: Normalize and validate
  for (const record of deduplicated) {
    const name = normalizeString(record.name);
    if (name.length < 2) {
      rejected.push({ record, reason: 'Name empty or too short' });
      continue;
    }

    const email = normalizeEmail(record.email);
    if (!email) {
      rejected.push({ record, reason: 'Invalid email' });
      continue;
    }

    const plan = normalizePlan(record.plan);
    if (!plan) {
      rejected.push({ record, reason: `Unknown plan: ${record.plan}` });
      continue;
    }

    const mrr = parseInt(record.mrr, 10);
    if (isNaN(mrr) || mrr <= 0) {
      rejected.push({ record, reason: `Invalid MRR: ${record.mrr}` });
      continue;
    }

    const status = normalizeStatus(record.status);
    if (!status) {
      rejected.push({ record, reason: `Unknown status: ${record.status}` });
      continue;
    }

    cleaned.push({ name, email, plan, mrr, status });
  }

  return {
    cleaned,
    rejected,
    stats: {
      total: rawData.length,
      cleaned: cleaned.length,
      rejected: rejected.length,
      duplicatesRemoved,
    },
  };
}

// Execute
const result = cleanData(dirtyData);

console.log('=== Data Cleaning ===\n');
console.log(`Total records: ${result.stats.total}`);
console.log(`Duplicates removed: ${result.stats.duplicatesRemoved}`);
console.log(`Cleaned records: ${result.stats.cleaned}`);
console.log(`Rejected records: ${result.stats.rejected}`);

console.log('\n--- Cleaned Records ---');
for (const r of result.cleaned) {
  console.log(`  ${r.name} | ${r.email} | ${r.plan} | $${r.mrr} | ${r.status}`);
}

console.log('\n--- Rejected Records ---');
for (const r of result.rejected) {
  console.log(`  ${r.record.name || '(empty)'} | ${r.record.email} | Reason: ${r.reason}`);
}

console.log('\n--- Exercise 7 complete! ---');
