/**
 * Exercise 6: Complex Schemas with Zod
 *
 * Create nested schemas with transforms, defaults, and unions.
 * Difficulty: Intermediate
 * Estimated time: 25 minutes
 * Run: npx tsx exercises/ex6-schema-complexo.ts
 */

import { z } from 'zod';

// === TODO 1: Create a schema for Address ===
// Fields:
// - street: string, min 3
// - city: string, min 2
// - state: string, exactly 2 characters (state abbreviation)
// - zipCode: string, regex /^\d{5}-?\d{3}$/
// - complement: optional string (default '')

// const AddressSchema = z.object({ ... });

// === TODO 2: Create a schema for Contact with union type ===
// A contact can be:
// - type 'email' with field value being a valid email
// - type 'phone' with field value being a string regex /^\(\d{2}\)\s?\d{4,5}-\d{4}$/
// Use z.discriminatedUnion based on the 'type' field

// const ContactSchema = z.discriminatedUnion('tipo', [ ... ]);

// === TODO 3: Create a schema for Company with nested schemas ===
// Fields:
// - name: string, min 2, max 100
// - cnpj: string, regex /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
// - address: AddressSchema
// - contacts: array of ContactSchema, min 1
// - plan: enum 'Enterprise' | 'Pro' | 'Starter'
// - mrr: string that transforms to number (use .transform(Number))
// - tags: array of strings, default []
// - metadata: z.record(z.string()) for arbitrary data, default {}
// - createdAt: string that transforms to Date

// const CompanySchema = z.object({ ... });

// === TODO 4: Validate test data ===
// Create at least 3 test objects:
// 1. Complete valid company
// 2. Company with optional fields missing (should use defaults)
// 3. Invalid company (wrong CNPJ, invalid zip code, etc)
// For each, use safeParse and display the result

const testData = [
  {
    nome: 'TechCorp Ltda',
    cnpj: '12.345.678/0001-90',
    endereco: {
      rua: 'Av. Paulista, 1000',
      cidade: 'Sao Paulo',
      estado: 'SP',
      cep: '01310-100',
    },
    contatos: [
      { tipo: 'email', valor: 'contato@techcorp.com' },
      { tipo: 'telefone', valor: '(11) 99999-8888' },
    ],
    plano: 'Enterprise',
    mrr: '999',
    criadoEm: '2024-06-15',
  },
  {
    nome: 'Startup XYZ',
    cnpj: '98.765.432/0001-10',
    endereco: {
      rua: 'Rua das Flores, 42',
      cidade: 'Curitiba',
      estado: 'PR',
      cep: '80000100',
    },
    contatos: [{ tipo: 'email', valor: 'hello@startup.xyz' }],
    plano: 'Pro',
    mrr: '299',
    tags: ['fintech', 'b2b'],
    criadoEm: '2025-01-10',
  },
  {
    nome: '',
    cnpj: '123456',
    endereco: { rua: 'X', cidade: 'Y', estado: 'ABC', cep: 'invalido' },
    contatos: [],
    plano: 'Platinum',
    mrr: 'abc',
    criadoEm: 'data-invalida',
  },
];

// For each data item, use CompanySchema.safeParse(item) and display the result

console.log('\n--- Exercise 6 complete! ---');
console.log('Hint: see the solution in solutions/ex6-schema-complexo.ts');
