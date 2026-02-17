/**
 * Solution 4: JSON Transform
 *
 * Normalizes data from 3 different sources into a unified format.
 * Run: npx tsx solutions/ex4-json-transform.ts
 */

interface UnifiedCustomer {
  name: string;
  email: string;
  plan: 'Enterprise' | 'Pro' | 'Starter';
  mrr: number;
  openTickets: number;
  satisfaction: number;
  logins30d: number;
  featuresUsed: string[];
}

// Sources with different formats
const crmSource = [
  { customer_name: 'TechCorp', customer_email: 'tech@corp.com', plan_type: 'enterprise', monthly_revenue: 999 },
  { customer_name: 'StartupXYZ', customer_email: 'hello@startup.xyz', plan_type: 'pro', monthly_revenue: 299 },
  { customer_name: 'CloudFirst', customer_email: 'cloud@first.com', plan_type: 'pro', monthly_revenue: 299 },
];

const supportSource = [
  { user: 'TechCorp', mail: 'tech@corp.com', tier: 'ENTERPRISE', tickets_open: 3, satisfaction: 4.5 },
  { user: 'StartupXYZ', mail: 'hello@startup.xyz', tier: 'PRO', tickets_open: 1, satisfaction: 4.8 },
  { user: 'CloudFirst', mail: 'cloud@first.com', tier: 'PRO', tickets_open: 0, satisfaction: 4.9 },
];

const analyticsSource = [
  { name: 'TechCorp', email: 'tech@corp.com', logins_30d: 156, features_used: ['dashboard', 'api', 'reports'] },
  { name: 'StartupXYZ', email: 'hello@startup.xyz', logins_30d: 45, features_used: ['dashboard'] },
  { name: 'CloudFirst', email: 'cloud@first.com', logins_30d: 89, features_used: ['dashboard', 'api'] },
];

function normalizePlan(raw: string): 'Enterprise' | 'Pro' | 'Starter' {
  const lower = raw.toLowerCase();
  if (lower === 'enterprise') return 'Enterprise';
  if (lower === 'pro') return 'Pro';
  return 'Starter';
}

function transformCRM(
  data: typeof crmSource
): Map<string, Partial<UnifiedCustomer>> {
  const map = new Map<string, Partial<UnifiedCustomer>>();
  for (const row of data) {
    map.set(row.customer_email, {
      name: row.customer_name,
      email: row.customer_email,
      plan: normalizePlan(row.plan_type),
      mrr: row.monthly_revenue,
    });
  }
  return map;
}

function transformSupport(
  data: typeof supportSource
): Map<string, Partial<UnifiedCustomer>> {
  const map = new Map<string, Partial<UnifiedCustomer>>();
  for (const row of data) {
    map.set(row.mail, {
      openTickets: row.tickets_open,
      satisfaction: row.satisfaction,
    });
  }
  return map;
}

function transformAnalytics(
  data: typeof analyticsSource
): Map<string, Partial<UnifiedCustomer>> {
  const map = new Map<string, Partial<UnifiedCustomer>>();
  for (const row of data) {
    map.set(row.email, {
      logins30d: row.logins_30d,
      featuresUsed: row.features_used,
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
      name: crmData.name || 'Unknown',
      email,
      plan: crmData.plan || 'Starter',
      mrr: crmData.mrr || 0,
      openTickets: supportData.openTickets || 0,
      satisfaction: supportData.satisfaction || 0,
      logins30d: analyticsData.logins30d || 0,
      featuresUsed: analyticsData.featuresUsed || [],
    });
  }

  return result;
}

// Execute
const crmMap = transformCRM(crmSource);
const supportMap = transformSupport(supportSource);
const analyticsMap = transformAnalytics(analyticsSource);
const unified = merge(crmMap, supportMap, analyticsMap);

console.log('=== Unified Data ===\n');

for (const customer of unified) {
  console.log(`${customer.name} (${customer.email})`);
  console.log(`  Plan: ${customer.plan} | MRR: $${customer.mrr}`);
  console.log(`  Tickets: ${customer.openTickets} | Satisfaction: ${customer.satisfaction}/5`);
  console.log(`  Logins (30d): ${customer.logins30d} | Features: ${customer.featuresUsed.join(', ')}`);
  console.log('');
}

console.log(`Total: ${unified.length} unified customers`);
console.log('\n--- Exercise 4 complete! ---');
