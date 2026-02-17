/**
 * Solucao 4: JSON Transform
 *
 * Normaliza dados de 3 fontes diferentes em formato unificado.
 * Execute: npx tsx solucoes/ex4-json-transform.ts
 */

interface UnifiedCustomer {
  nome: string;
  email: string;
  plano: 'Enterprise' | 'Pro' | 'Starter';
  mrr: number;
  ticketsAbertos: number;
  satisfacao: number;
  logins30d: number;
  featuresUsadas: string[];
}

// Fontes com formatos diferentes
const fonteCRM = [
  { customer_name: 'TechCorp', customer_email: 'tech@corp.com', plan_type: 'enterprise', monthly_revenue: 999 },
  { customer_name: 'StartupXYZ', customer_email: 'hello@startup.xyz', plan_type: 'pro', monthly_revenue: 299 },
  { customer_name: 'CloudFirst', customer_email: 'cloud@first.com', plan_type: 'pro', monthly_revenue: 299 },
];

const fonteSupport = [
  { user: 'TechCorp', mail: 'tech@corp.com', tier: 'ENTERPRISE', tickets_open: 3, satisfaction: 4.5 },
  { user: 'StartupXYZ', mail: 'hello@startup.xyz', tier: 'PRO', tickets_open: 1, satisfaction: 4.8 },
  { user: 'CloudFirst', mail: 'cloud@first.com', tier: 'PRO', tickets_open: 0, satisfaction: 4.9 },
];

const fonteAnalytics = [
  { name: 'TechCorp', email: 'tech@corp.com', logins_30d: 156, features_used: ['dashboard', 'api', 'reports'] },
  { name: 'StartupXYZ', email: 'hello@startup.xyz', logins_30d: 45, features_used: ['dashboard'] },
  { name: 'CloudFirst', email: 'cloud@first.com', logins_30d: 89, features_used: ['dashboard', 'api'] },
];

function normalizePlano(raw: string): 'Enterprise' | 'Pro' | 'Starter' {
  const lower = raw.toLowerCase();
  if (lower === 'enterprise') return 'Enterprise';
  if (lower === 'pro') return 'Pro';
  return 'Starter';
}

function transformCRM(
  data: typeof fonteCRM
): Map<string, Partial<UnifiedCustomer>> {
  const map = new Map<string, Partial<UnifiedCustomer>>();
  for (const row of data) {
    map.set(row.customer_email, {
      nome: row.customer_name,
      email: row.customer_email,
      plano: normalizePlano(row.plan_type),
      mrr: row.monthly_revenue,
    });
  }
  return map;
}

function transformSupport(
  data: typeof fonteSupport
): Map<string, Partial<UnifiedCustomer>> {
  const map = new Map<string, Partial<UnifiedCustomer>>();
  for (const row of data) {
    map.set(row.mail, {
      ticketsAbertos: row.tickets_open,
      satisfacao: row.satisfaction,
    });
  }
  return map;
}

function transformAnalytics(
  data: typeof fonteAnalytics
): Map<string, Partial<UnifiedCustomer>> {
  const map = new Map<string, Partial<UnifiedCustomer>>();
  for (const row of data) {
    map.set(row.email, {
      logins30d: row.logins_30d,
      featuresUsadas: row.features_used,
    });
  }
  return map;
}

function merge(
  crm: Map<string, Partial<UnifiedCustomer>>,
  support: Map<string, Partial<UnifiedCustomer>>,
  analytics: Map<string, Partial<UnifiedCustomer>>
): UnifiedCustomer[] {
  const result: UnifiedCustomer[] = [];

  for (const [email, crmData] of crm.entries()) {
    const supportData = support.get(email) || {};
    const analyticsData = analytics.get(email) || {};

    result.push({
      nome: crmData.nome || 'Desconhecido',
      email,
      plano: crmData.plano || 'Starter',
      mrr: crmData.mrr || 0,
      ticketsAbertos: supportData.ticketsAbertos || 0,
      satisfacao: supportData.satisfacao || 0,
      logins30d: analyticsData.logins30d || 0,
      featuresUsadas: analyticsData.featuresUsadas || [],
    });
  }

  return result;
}

// Execute
const crmMap = transformCRM(fonteCRM);
const supportMap = transformSupport(fonteSupport);
const analyticsMap = transformAnalytics(fonteAnalytics);
const unified = merge(crmMap, supportMap, analyticsMap);

console.log('=== Dados Unificados ===\n');

for (const customer of unified) {
  console.log(`${customer.nome} (${customer.email})`);
  console.log(`  Plano: ${customer.plano} | MRR: R$${customer.mrr}`);
  console.log(`  Tickets: ${customer.ticketsAbertos} | Satisfacao: ${customer.satisfacao}/5`);
  console.log(`  Logins (30d): ${customer.logins30d} | Features: ${customer.featuresUsadas.join(', ')}`);
  console.log('');
}

console.log(`Total: ${unified.length} clientes unificados`);
console.log('\n--- Exercicio 4 completo! ---');
