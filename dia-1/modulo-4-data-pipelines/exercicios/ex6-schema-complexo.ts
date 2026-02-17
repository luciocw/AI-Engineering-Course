/**
 * Exercicio 6: Schemas Complexos com Zod
 *
 * Crie schemas aninhados com transforms, defaults e unions.
 * Dificuldade: Intermediario
 * Tempo estimado: 25 minutos
 * Execute: npx tsx exercicios/ex6-schema-complexo.ts
 */

import { z } from 'zod';

// === TODO 1: Crie um schema para Endereco ===
// Campos:
// - rua: string, min 3
// - cidade: string, min 2
// - estado: string, exatamente 2 caracteres (sigla UF)
// - cep: string, regex /^\d{5}-?\d{3}$/
// - complemento: string opcional (default '')

// const EnderecoSchema = z.object({ ... });

// === TODO 2: Crie um schema para Contato com union type ===
// Um contato pode ser:
// - tipo 'email' com campo valor sendo email valido
// - tipo 'telefone' com campo valor sendo string regex /^\(\d{2}\)\s?\d{4,5}-\d{4}$/
// Use z.discriminatedUnion baseado no campo 'tipo'

// const ContatoSchema = z.discriminatedUnion('tipo', [ ... ]);

// === TODO 3: Crie um schema para Empresa com nested schemas ===
// Campos:
// - nome: string, min 2, max 100
// - cnpj: string, regex /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
// - endereco: EnderecoSchema
// - contatos: array de ContatoSchema, min 1
// - plano: enum 'Enterprise' | 'Pro' | 'Starter'
// - mrr: string que se transforma em number (use .transform(Number))
// - tags: array de strings, default []
// - metadata: z.record(z.string()) para dados arbitrarios, default {}
// - criadoEm: string que se transforma em Date

// const EmpresaSchema = z.object({ ... });

// === TODO 4: Valide dados de teste ===
// Crie pelo menos 3 objetos de teste:
// 1. Empresa valida completa
// 2. Empresa com campos opcionais ausentes (deve usar defaults)
// 3. Empresa invalida (CNPJ errado, CEP invalido, etc)
// Para cada, use safeParse e exiba resultado

const dadosTeste = [
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

// Para cada dado, use EmpresaSchema.safeParse(dado) e exiba o resultado

console.log('\n--- Exercicio 6 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex6-schema-complexo.ts');
