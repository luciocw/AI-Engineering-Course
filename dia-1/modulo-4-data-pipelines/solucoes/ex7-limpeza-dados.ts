/**
 * Solucao 7: Limpeza de Dados
 *
 * Normaliza, deduplica e corrige dados sujos.
 * Execute: npx tsx solucoes/ex7-limpeza-dados.ts
 */

// Dados sujos simulados
const dadosSujos = [
  { nome: '  TechCorp  ', email: 'CONTATO@TECHCORP.COM', plano: 'enterprise', mrr: '999', status: 'ATIVO' },
  { nome: 'TechCorp', email: 'contato@techcorp.com', plano: 'Enterprise', mrr: '999', status: 'ativo' },
  { nome: 'Startup XYZ  ', email: 'hello@startup.xyz', plano: 'pro', mrr: '299', status: 'Ativo' },
  { nome: 'startup xyz', email: 'HELLO@STARTUP.XYZ', plano: 'PRO', mrr: '299', status: 'ativo' },
  { nome: '', email: 'invalido', plano: 'enterprise', mrr: 'abc', status: 'ativo' },
  { nome: 'BigData Inc', email: 'vendas@bigdata.com', plano: 'Enterprise', mrr: '999', status: 'ativo' },
  { nome: 'CloudFirst', email: 'cloud@first.com ', plano: 'Pro', mrr: '299', status: 'churned' },
  { nome: 'Cl\u00f3udFirst', email: 'cloud@first.com', plano: 'pro', mrr: '299', status: 'churned' },
];

type RawRecord = (typeof dadosSujos)[number];

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

// === 3: normalizePlano ===
function normalizePlano(plano: string): 'Enterprise' | 'Pro' | 'Starter' | null {
  const lower = plano.trim().toLowerCase();
  const planoMap: Record<string, 'Enterprise' | 'Pro' | 'Starter'> = {
    enterprise: 'Enterprise',
    pro: 'Pro',
    starter: 'Starter',
  };
  return planoMap[lower] || null;
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
      // Manter o registro mais completo (com nome mais longo, sem acentos estranhos)
      if (record.nome.trim().length > existing.nome.trim().length) {
        seen.set(email, record);
      }
    }
  }

  return [...seen.values()];
}

// === 6: cleanData ===
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
  stats: {
    total: number;
    limpos: number;
    rejeitados: number;
    duplicatasRemovidas: number;
  };
}

function cleanData(rawData: RawRecord[]): CleanResult {
  const rejeitados: { registro: RawRecord; motivo: string }[] = [];
  const limpos: CleanRecord[] = [];

  // Fase 1: Deduplicate
  const deduplicados = deduplicate(rawData);
  const duplicatasRemovidas = rawData.length - deduplicados.length;

  // Fase 2: Normalize e valide
  for (const record of deduplicados) {
    const nome = normalizeString(record.nome);
    if (nome.length < 2) {
      rejeitados.push({ registro: record, motivo: 'Nome vazio ou muito curto' });
      continue;
    }

    const email = normalizeEmail(record.email);
    if (!email) {
      rejeitados.push({ registro: record, motivo: 'Email invalido' });
      continue;
    }

    const plano = normalizePlano(record.plano);
    if (!plano) {
      rejeitados.push({ registro: record, motivo: `Plano desconhecido: ${record.plano}` });
      continue;
    }

    const mrr = parseInt(record.mrr, 10);
    if (isNaN(mrr) || mrr <= 0) {
      rejeitados.push({ registro: record, motivo: `MRR invalido: ${record.mrr}` });
      continue;
    }

    const status = normalizeStatus(record.status);
    if (!status) {
      rejeitados.push({ registro: record, motivo: `Status desconhecido: ${record.status}` });
      continue;
    }

    limpos.push({ nome, email, plano, mrr, status });
  }

  return {
    limpos,
    rejeitados,
    stats: {
      total: rawData.length,
      limpos: limpos.length,
      rejeitados: rejeitados.length,
      duplicatasRemovidas,
    },
  };
}

// Execute
const resultado = cleanData(dadosSujos);

console.log('=== Limpeza de Dados ===\n');
console.log(`Total de registros: ${resultado.stats.total}`);
console.log(`Duplicatas removidas: ${resultado.stats.duplicatasRemovidas}`);
console.log(`Registros limpos: ${resultado.stats.limpos}`);
console.log(`Registros rejeitados: ${resultado.stats.rejeitados}`);

console.log('\n--- Registros Limpos ---');
for (const r of resultado.limpos) {
  console.log(`  ${r.nome} | ${r.email} | ${r.plano} | R$${r.mrr} | ${r.status}`);
}

console.log('\n--- Registros Rejeitados ---');
for (const r of resultado.rejeitados) {
  console.log(`  ${r.registro.nome || '(vazio)'} | ${r.registro.email} | Motivo: ${r.motivo}`);
}

console.log('\n--- Exercicio 7 completo! ---');
