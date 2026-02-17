/**
 * Solution 5: Data Validation with Zod
 *
 * Schema validation and XSS/injection detection.
 * Run: npx tsx solutions/ex5-data-validation.ts
 */

import { z } from 'zod';

// Custom anti-XSS validator
function noXSS(field: string) {
  return z.string().refine(
    (val) => {
      const patterns = [
        /<script/i,
        /javascript:/i,
        /onerror\s*=/i,
        /onclick\s*=/i,
        /eval\s*\(/i,
        /on\w+\s*=/i,
      ];
      return !patterns.some((p) => p.test(val));
    },
    { message: `${field} contains potentially malicious content (XSS)` }
  );
}

// Customer Schema
const CustomerSchema = z.object({
  name: noXSS('name').pipe(z.string().min(2).max(100)),
  email: z.string().email('Invalid email'),
  plan: z.enum(['Enterprise', 'Pro', 'Starter']),
  mrr: z.number().positive('MRR must be positive'),
  status: z.enum(['ativo', 'churned']),
});

// Ticket Schema
const TicketSchema = z.object({
  title: noXSS('title').pipe(z.string().min(5).max(200)),
  priority: z.enum(['alta', 'media', 'baixa']),
  description: noXSS('description').pipe(z.string().max(1000)),
  customer_email: z.string().email('Invalid customer email'),
});

type Customer = z.infer<typeof CustomerSchema>;
type Ticket = z.infer<typeof TicketSchema>;

// Test data
const customerData = [
  { name: 'TechCorp', email: 'tech@corp.com', plan: 'Enterprise', mrr: 999, status: 'ativo' },
  { name: '', email: 'invalid', plan: 'Platinum', mrr: -10, status: 'other' },
  { name: '<script>alert("xss")</script>', email: 'hack@evil.com', plan: 'Pro', mrr: 299, status: 'ativo' },
  { name: 'Normal User', email: 'user@test.com', plan: 'Starter', mrr: 49, status: 'churned' },
  { name: 'Test" onclick="alert(1)', email: 'xss2@evil.com', plan: 'Pro', mrr: 299, status: 'ativo' },
];

const ticketData = [
  { title: 'Dashboard bug', priority: 'alta', description: 'Dashboard not loading', customer_email: 'tech@corp.com' },
  { title: '<img onerror=alert(1)>', priority: 'alta', description: 'Normal desc', customer_email: 'hack@evil.com' },
  { title: 'API question', priority: 'baixa', description: 'javascript:void(0)', customer_email: 'user@test.com' },
];

// Customer validation
console.log('=== Customer Validation ===\n');

let validCount = 0;
let invalidCount = 0;

for (const data of customerData) {
  const result = CustomerSchema.safeParse(data);

  if (result.success) {
    validCount++;
    console.log(`OK: ${result.data.name} (${result.data.plan})`);
  } else {
    invalidCount++;
    console.log(`ERROR: ${JSON.stringify(data).slice(0, 60)}`);
    for (const issue of result.error.issues) {
      console.log(`  - [${issue.path.join('.')}] ${issue.message}`);
    }
  }
}

console.log(`\nResult: ${validCount} valid, ${invalidCount} invalid`);

// Ticket validation
console.log('\n=== Ticket Validation ===\n');

for (const data of ticketData) {
  const result = TicketSchema.safeParse(data);

  if (result.success) {
    console.log(`OK: "${result.data.title}"`);
  } else {
    console.log(`ERROR: "${data.title}"`);
    for (const issue of result.error.issues) {
      console.log(`  - [${issue.path.join('.')}] ${issue.message}`);
    }
  }
}

console.log('\n--- Exercise 5 complete! ---');
