/**
 * Exercicio 2: JSON Transform
 *
 * Normalize dados de multiplas fontes em um formato unificado.
 * Execute: npx tsx exercicios/ex2-json-transform.ts
 */

// === Dados de 3 fontes diferentes (formatos diferentes) ===
const fonteCRM = [
  { customer_name: 'TechCorp', customer_email: 'tech@corp.com', plan_type: 'enterprise', monthly_revenue: 999 },
  { customer_name: 'StartupXYZ', customer_email: 'hello@startup.xyz', plan_type: 'pro', monthly_revenue: 299 },
];

const fonteSupport = [
  { user: 'TechCorp', mail: 'tech@corp.com', tier: 'ENTERPRISE', tickets_open: 3, satisfaction: 4.5 },
  { user: 'StartupXYZ', mail: 'hello@startup.xyz', tier: 'PRO', tickets_open: 1, satisfaction: 4.8 },
];

const fonteAnalytics = [
  { name: 'TechCorp', email: 'tech@corp.com', logins_30d: 156, features_used: ['dashboard', 'api', 'reports'] },
  { name: 'StartupXYZ', email: 'hello@startup.xyz', logins_30d: 45, features_used: ['dashboard'] },
];

// === TODO 1: Defina o formato unificado ===
// interface UnifiedCustomer {
//   nome: string;
//   email: string;
//   plano: 'Enterprise' | 'Pro' | 'Starter';
//   mrr: number;
//   ticketsAbertos: number;
//   satisfacao: number;
//   logins30d: number;
//   featuresUsadas: string[];
// }

// === TODO 2: Crie transformers para cada fonte ===
// Cada transformer recebe dados da fonte e retorna Partial<UnifiedCustomer>
// Use o email como chave para fazer o merge.

// function transformCRM(data: typeof fonteCRM): Map<string, Partial<UnifiedCustomer>> { ... }
// function transformSupport(data: typeof fonteSupport): Map<string, Partial<UnifiedCustomer>> { ... }
// function transformAnalytics(data: typeof fonteAnalytics): Map<string, Partial<UnifiedCustomer>> { ... }

// === TODO 3: Faca o merge dos dados ===
// Combine os 3 Maps em um unico array de UnifiedCustomer.
// Trate conflitos (ex: nome aparece diferente em fontes diferentes).

// === TODO 4: Exiba os dados unificados ===

console.log('\n--- Exercicio 2 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex2-json-transform.ts');
