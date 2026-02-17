/**
 * Exercise 5: Data Validation with Zod
 *
 * Validate data with Zod and detect XSS/injection attempts.
 * Run: npx tsx exercises/ex5-data-validation.ts
 */

import { z } from 'zod';

// === TODO 1: Create a Zod schema for Customer ===
// Fields:
// - name: string, min 2, max 100
// - email: string, email format
// - plan: enum 'Enterprise' | 'Pro' | 'Starter'
// - mrr: number, positive
// - status: enum 'ativo' | 'churned'

// const CustomerSchema = z.object({ ... });

// === TODO 2: Create a schema for Ticket ===
// Fields:
// - title: string, min 5, max 200
// - priority: enum 'alta' | 'media' | 'baixa'
// - description: string, max 1000
// - customer_email: string, email format

// const TicketSchema = z.object({ ... });

// === TODO 3: Create a custom anti-XSS validator ===
// Reject strings that contain:
// - <script>
// - javascript:
// - onerror=
// - onclick=
// - eval(

// function noXSS(field: string) {
//   return z.string().refine((val) => {
//     const patterns = [/<script/i, /javascript:/i, /onerror=/i, /onclick=/i, /eval\(/i];
//     return !patterns.some((p) => p.test(val));
//   }, { message: `${field} contains potentially malicious content` });
// }

// === TODO 4: Validate test data ===
// Include valid and invalid data (with XSS).
// Display formatted errors.

const testData = [
  { nome: 'TechCorp', email: 'tech@corp.com', plano: 'Enterprise', mrr: 999, status: 'ativo' },
  { nome: '', email: 'invalido', plano: 'Platinum', mrr: -10, status: 'outro' },
  { nome: '<script>alert("xss")</script>', email: 'hack@evil.com', plano: 'Pro', mrr: 299, status: 'ativo' },
  { nome: 'Normal User', email: 'user@test.com', plano: 'Starter', mrr: 49, status: 'churned' },
];

// For each data item, validate and display the result.

console.log('\n--- Exercise 5 complete! ---');
console.log('Hint: see the solution in solutions/ex5-data-validation.ts');
