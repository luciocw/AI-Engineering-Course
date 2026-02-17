/**
 * Exercicio 5: Data Validation com Zod
 *
 * Valide dados com Zod e detecte tentativas de XSS/injection.
 * Execute: npx tsx exercicios/ex5-data-validation.ts
 */

import { z } from 'zod';

// === TODO 1: Crie um schema Zod para Customer ===
// Campos:
// - nome: string, min 2, max 100
// - email: string, formato email
// - plano: enum 'Enterprise' | 'Pro' | 'Starter'
// - mrr: number, positivo
// - status: enum 'ativo' | 'churned'

// const CustomerSchema = z.object({ ... });

// === TODO 2: Crie um schema para Ticket ===
// Campos:
// - titulo: string, min 5, max 200
// - prioridade: enum 'alta' | 'media' | 'baixa'
// - descricao: string, max 1000
// - cliente_email: string, formato email

// const TicketSchema = z.object({ ... });

// === TODO 3: Crie um custom validator anti-XSS ===
// Rejeite strings que contenham:
// - <script>
// - javascript:
// - onerror=
// - onclick=
// - eval(

// function noXSS(field: string) {
//   return z.string().refine((val) => {
//     const patterns = [/<script/i, /javascript:/i, /onerror=/i, /onclick=/i, /eval\(/i];
//     return !patterns.some((p) => p.test(val));
//   }, { message: `${field} contem conteudo potencialmente malicioso` });
// }

// === TODO 4: Valide dados de teste ===
// Inclua dados validos e invalidos (com XSS).
// Exiba erros formatados.

const dadosTeste = [
  { nome: 'TechCorp', email: 'tech@corp.com', plano: 'Enterprise', mrr: 999, status: 'ativo' },
  { nome: '', email: 'invalido', plano: 'Platinum', mrr: -10, status: 'outro' },
  { nome: '<script>alert("xss")</script>', email: 'hack@evil.com', plano: 'Pro', mrr: 299, status: 'ativo' },
  { nome: 'Normal User', email: 'user@test.com', plano: 'Starter', mrr: 49, status: 'churned' },
];

// Para cada dado, valide e exiba o resultado.

console.log('\n--- Exercicio 5 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex5-data-validation.ts');
