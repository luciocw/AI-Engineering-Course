/**
 * Exercicio 7: Limpeza de Dados
 *
 * Normalize, deduplicar e corrigir dados sujos.
 * Dificuldade: Intermediario
 * Tempo estimado: 25 minutos
 * Execute: npx tsx exercicios/ex7-limpeza-dados.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

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

// === TODO 1: Implemente normalizeString ===
// - Trim whitespace
// - Remova espacos duplos
// - Retorne string limpa
// function normalizeString(s: string): string { ... }

// === TODO 2: Implemente normalizeEmail ===
// - Trim
// - Lowercase
// - Valide formato basico (contem @ e .)
// function normalizeEmail(email: string): string | null { ... }

// === TODO 3: Implemente normalizePlano ===
// - Aceite 'enterprise', 'ENTERPRISE', 'Enterprise' etc
// - Retorne formato padrao: 'Enterprise' | 'Pro' | 'Starter'
// function normalizePlano(plano: string): string | null { ... }

// === TODO 4: Implemente normalizeStatus ===
// - Aceite 'ATIVO', 'Ativo', 'ativo' -> 'ativo'
// - Aceite 'CHURNED', 'Churned', 'churned' -> 'churned'
// function normalizeStatus(status: string): string | null { ... }

// === TODO 5: Implemente deduplicate ===
// - Use email normalizado como chave unica
// - Quando houver duplicata, mantenha o registro mais completo
// function deduplicate(records: typeof dadosSujos): typeof dadosSujos { ... }

// === TODO 6: Implemente cleanData ===
// Combine tudo: normalize -> valide -> deduplique
// Retorne { limpos: [...], rejeitados: [...], stats: { ... } }

// Execute e exiba resultados

console.log('\n--- Exercicio 7 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex7-limpeza-dados.ts');
