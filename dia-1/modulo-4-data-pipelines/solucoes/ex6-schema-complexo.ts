/**
 * Solucao 6: Schemas Complexos com Zod
 *
 * Schemas aninhados com transforms, defaults e unions.
 * Execute: npx tsx solucoes/ex6-schema-complexo.ts
 */

import { z } from 'zod';

// === 1: Schema para Endereco ===
const EnderecoSchema = z.object({
  rua: z.string().min(3, 'Rua deve ter pelo menos 3 caracteres'),
  cidade: z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  estado: z.string().length(2, 'Estado deve ser a sigla com 2 caracteres'),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP invalido (formato: 00000-000)'),
  complemento: z.string().default(''),
});

// === 2: Schema para Contato com union ===
const ContatoEmailSchema = z.object({
  tipo: z.literal('email'),
  valor: z.string().email('Email invalido'),
});

const ContatoTelefoneSchema = z.object({
  tipo: z.literal('telefone'),
  valor: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, 'Telefone invalido (formato: (XX) XXXXX-XXXX)'),
});

const ContatoSchema = z.discriminatedUnion('tipo', [
  ContatoEmailSchema,
  ContatoTelefoneSchema,
]);

// === 3: Schema para Empresa ===
const EmpresaSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ invalido (formato: XX.XXX.XXX/XXXX-XX)'),
  endereco: EnderecoSchema,
  contatos: z.array(ContatoSchema).min(1, 'Pelo menos 1 contato obrigatorio'),
  plano: z.enum(['Enterprise', 'Pro', 'Starter']),
  mrr: z.string().transform(Number),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.string()).default({}),
  criadoEm: z.string().transform((val) => new Date(val)),
});

type Empresa = z.infer<typeof EmpresaSchema>;

// === 4: Validacao ===
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

console.log('=== Validacao de Empresas ===\n');

let validCount = 0;
let invalidCount = 0;

for (const dado of dadosTeste) {
  const result = EmpresaSchema.safeParse(dado);

  if (result.success) {
    validCount++;
    const empresa = result.data;
    console.log(`OK: ${empresa.nome}`);
    console.log(`  CNPJ: ${dado.cnpj}`);
    console.log(`  Plano: ${empresa.plano} | MRR: R$${empresa.mrr}`);
    console.log(`  Endereco: ${empresa.endereco.rua}, ${empresa.endereco.cidade}/${empresa.endereco.estado}`);
    console.log(`  Contatos: ${empresa.contatos.length}`);
    console.log(`  Tags: ${empresa.tags.length > 0 ? empresa.tags.join(', ') : '(nenhuma)'}`);
    console.log(`  Criado em: ${empresa.criadoEm.toISOString().split('T')[0]}`);
  } else {
    invalidCount++;
    console.log(`ERRO: ${dado.nome || '(nome vazio)'}`);
    for (const issue of result.error.issues) {
      console.log(`  - [${issue.path.join('.')}] ${issue.message}`);
    }
  }
  console.log('');
}

console.log(`Resultado: ${validCount} validos, ${invalidCount} invalidos`);

console.log('\n--- Exercicio 6 completo! ---');
