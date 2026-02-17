/**
 * Exercise 7: Data Cleaning
 *
 * Normalize, deduplicate, and fix dirty data.
 * Difficulty: Intermediate
 * Estimated time: 25 minutes
 * Run: npx tsx exercises/ex7-limpeza-dados.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Simulated dirty data
const dirtyData = [
  { nome: '  TechCorp  ', email: 'CONTATO@TECHCORP.COM', plano: 'enterprise', mrr: '999', status: 'ATIVO' },
  { nome: 'TechCorp', email: 'contato@techcorp.com', plano: 'Enterprise', mrr: '999', status: 'ativo' },
  { nome: 'Startup XYZ  ', email: 'hello@startup.xyz', plano: 'pro', mrr: '299', status: 'Ativo' },
  { nome: 'startup xyz', email: 'HELLO@STARTUP.XYZ', plano: 'PRO', mrr: '299', status: 'ativo' },
  { nome: '', email: 'invalido', plano: 'enterprise', mrr: 'abc', status: 'ativo' },
  { nome: 'BigData Inc', email: 'vendas@bigdata.com', plano: 'Enterprise', mrr: '999', status: 'ativo' },
  { nome: 'CloudFirst', email: 'cloud@first.com ', plano: 'Pro', mrr: '299', status: 'churned' },
  { nome: 'Cl\u00f3udFirst', email: 'cloud@first.com', plano: 'pro', mrr: '299', status: 'churned' },
];

// === TODO 1: Implement normalizeString ===
// - Trim whitespace
// - Remove double spaces
// - Return cleaned string
// function normalizeString(s: string): string { ... }

// === TODO 2: Implement normalizeEmail ===
// - Trim
// - Lowercase
// - Validate basic format (contains @ and .)
// function normalizeEmail(email: string): string | null { ... }

// === TODO 3: Implement normalizePlan ===
// - Accept 'enterprise', 'ENTERPRISE', 'Enterprise' etc
// - Return standard format: 'Enterprise' | 'Pro' | 'Starter'
// function normalizePlan(plan: string): string | null { ... }

// === TODO 4: Implement normalizeStatus ===
// - Accept 'ATIVO', 'Ativo', 'ativo' -> 'ativo'
// - Accept 'CHURNED', 'Churned', 'churned' -> 'churned'
// function normalizeStatus(status: string): string | null { ... }

// === TODO 5: Implement deduplicate ===
// - Use normalized email as unique key
// - When there is a duplicate, keep the most complete record
// function deduplicate(records: typeof dirtyData): typeof dirtyData { ... }

// === TODO 6: Implement cleanData ===
// Combine everything: normalize -> validate -> deduplicate
// Return { cleaned: [...], rejected: [...], stats: { ... } }

// Run and display results

console.log('\n--- Exercise 7 complete! ---');
console.log('Hint: see the solution in solutions/ex7-limpeza-dados.ts');
