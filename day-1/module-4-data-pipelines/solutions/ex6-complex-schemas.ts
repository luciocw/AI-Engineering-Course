/**
 * Solution 6: Complex Schemas with Zod
 *
 * Nested schemas with transforms, defaults, and unions.
 * Run: npx tsx solutions/ex6-schema-complexo.ts
 */

import { z } from 'zod';

// === 1: Address Schema ===
const AddressSchema = z.object({
  street: z.string().min(3, 'Street must be at least 3 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().length(2, 'State must be a 2-character abbreviation'),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'Invalid zip code (format: 00000-000)'),
  complement: z.string().default(''),
});

// === 2: Contact Schema with union ===
const ContactEmailSchema = z.object({
  type: z.literal('email'),
  value: z.string().email('Invalid email'),
});

const ContactPhoneSchema = z.object({
  type: z.literal('phone'),
  value: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, 'Invalid phone (format: (XX) XXXXX-XXXX)'),
});

const ContactSchema = z.discriminatedUnion('type', [
  ContactEmailSchema,
  ContactPhoneSchema,
]);

// === 3: Company Schema ===
const CompanySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'Invalid CNPJ (format: XX.XXX.XXX/XXXX-XX)'),
  address: AddressSchema,
  contacts: z.array(ContactSchema).min(1, 'At least 1 contact is required'),
  plan: z.enum(['Enterprise', 'Pro', 'Starter']),
  mrr: z.string().transform(Number),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.string()).default({}),
  createdAt: z.string().transform((val) => new Date(val)),
});

type Company = z.infer<typeof CompanySchema>;

// === 4: Validation ===
const testData = [
  {
    name: 'TechCorp Ltda',
    cnpj: '12.345.678/0001-90',
    address: {
      street: 'Av. Paulista, 1000',
      city: 'Sao Paulo',
      state: 'SP',
      zipCode: '01310-100',
    },
    contacts: [
      { type: 'email', value: 'contato@techcorp.com' },
      { type: 'phone', value: '(11) 99999-8888' },
    ],
    plan: 'Enterprise',
    mrr: '999',
    createdAt: '2024-06-15',
  },
  {
    name: 'Startup XYZ',
    cnpj: '98.765.432/0001-10',
    address: {
      street: 'Rua das Flores, 42',
      city: 'Curitiba',
      state: 'PR',
      zipCode: '80000100',
    },
    contacts: [{ type: 'email', value: 'hello@startup.xyz' }],
    plan: 'Pro',
    mrr: '299',
    tags: ['fintech', 'b2b'],
    createdAt: '2025-01-10',
  },
  {
    name: '',
    cnpj: '123456',
    address: { street: 'X', city: 'Y', state: 'ABC', zipCode: 'invalid' },
    contacts: [],
    plan: 'Platinum',
    mrr: 'abc',
    createdAt: 'invalid-date',
  },
];

console.log('=== Company Validation ===\n');

let validCount = 0;
let invalidCount = 0;

for (const data of testData) {
  const result = CompanySchema.safeParse(data);

  if (result.success) {
    validCount++;
    const company = result.data;
    console.log(`OK: ${company.name}`);
    console.log(`  CNPJ: ${data.cnpj}`);
    console.log(`  Plan: ${company.plan} | MRR: $${company.mrr}`);
    console.log(`  Address: ${company.address.street}, ${company.address.city}/${company.address.state}`);
    console.log(`  Contacts: ${company.contacts.length}`);
    console.log(`  Tags: ${company.tags.length > 0 ? company.tags.join(', ') : '(none)'}`);
    console.log(`  Created at: ${company.createdAt.toISOString().split('T')[0]}`);
  } else {
    invalidCount++;
    console.log(`ERROR: ${data.name || '(empty name)'}`);
    for (const issue of result.error.issues) {
      console.log(`  - [${issue.path.join('.')}] ${issue.message}`);
    }
  }
  console.log('');
}

console.log(`Result: ${validCount} valid, ${invalidCount} invalid`);

console.log('\n--- Exercise 6 complete! ---');
