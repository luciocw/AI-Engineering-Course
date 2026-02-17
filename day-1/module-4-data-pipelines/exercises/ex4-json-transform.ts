/**
 * Exercise 4: JSON Transform
 *
 * Normalize data from multiple sources into a unified format.
 * Run: npx tsx exercises/ex4-json-transform.ts
 */

// === Data from 3 different sources (different formats) ===
const sourceCRM = [
  { customer_name: 'TechCorp', customer_email: 'tech@corp.com', plan_type: 'enterprise', monthly_revenue: 999 },
  { customer_name: 'StartupXYZ', customer_email: 'hello@startup.xyz', plan_type: 'pro', monthly_revenue: 299 },
];

const sourceSupport = [
  { user: 'TechCorp', mail: 'tech@corp.com', tier: 'ENTERPRISE', tickets_open: 3, satisfaction: 4.5 },
  { user: 'StartupXYZ', mail: 'hello@startup.xyz', tier: 'PRO', tickets_open: 1, satisfaction: 4.8 },
];

const sourceAnalytics = [
  { name: 'TechCorp', email: 'tech@corp.com', logins_30d: 156, features_used: ['dashboard', 'api', 'reports'] },
  { name: 'StartupXYZ', email: 'hello@startup.xyz', logins_30d: 45, features_used: ['dashboard'] },
];

// === TODO 1: Define the unified format ===
// interface UnifiedCustomer {
//   name: string;
//   email: string;
//   plan: 'Enterprise' | 'Pro' | 'Starter';
//   mrr: number;
//   openTickets: number;
//   satisfaction: number;
//   logins30d: number;
//   featuresUsed: string[];
// }

// === TODO 2: Create transformers for each source ===
// Each transformer receives source data and returns Partial<UnifiedCustomer>
// Use email as the key to merge.

// function transformCRM(data: typeof sourceCRM): Map<string, Partial<UnifiedCustomer>> { ... }
// function transformSupport(data: typeof sourceSupport): Map<string, Partial<UnifiedCustomer>> { ... }
// function transformAnalytics(data: typeof sourceAnalytics): Map<string, Partial<UnifiedCustomer>> { ... }

// === TODO 3: Merge the data ===
// Combine the 3 Maps into a single array of UnifiedCustomer.
// Handle conflicts (e.g.: name appears differently in different sources).

// === TODO 4: Display the unified data ===

console.log('\n--- Exercise 4 complete! ---');
console.log('Hint: see the solution in solutions/ex4-json-transform.ts');
