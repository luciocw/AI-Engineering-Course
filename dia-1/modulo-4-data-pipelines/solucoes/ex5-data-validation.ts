/**
 * Solucao 5: Data Validation com Zod
 *
 * Validacao de schemas e deteccao de XSS/injection.
 * Execute: npx tsx solucoes/ex5-data-validation.ts
 */

import { z } from 'zod';

// Custom validator anti-XSS
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
    { message: `${field} contem conteudo potencialmente malicioso (XSS)` }
  );
}

// Schema Customer
const CustomerSchema = z.object({
  nome: noXSS('nome').pipe(z.string().min(2).max(100)),
  email: z.string().email('Email invalido'),
  plano: z.enum(['Enterprise', 'Pro', 'Starter']),
  mrr: z.number().positive('MRR deve ser positivo'),
  status: z.enum(['ativo', 'churned']),
});

// Schema Ticket
const TicketSchema = z.object({
  titulo: noXSS('titulo').pipe(z.string().min(5).max(200)),
  prioridade: z.enum(['alta', 'media', 'baixa']),
  descricao: noXSS('descricao').pipe(z.string().max(1000)),
  cliente_email: z.string().email('Email de cliente invalido'),
});

type Customer = z.infer<typeof CustomerSchema>;
type Ticket = z.infer<typeof TicketSchema>;

// Dados de teste
const dadosClientes = [
  { nome: 'TechCorp', email: 'tech@corp.com', plano: 'Enterprise', mrr: 999, status: 'ativo' },
  { nome: '', email: 'invalido', plano: 'Platinum', mrr: -10, status: 'outro' },
  { nome: '<script>alert("xss")</script>', email: 'hack@evil.com', plano: 'Pro', mrr: 299, status: 'ativo' },
  { nome: 'Normal User', email: 'user@test.com', plano: 'Starter', mrr: 49, status: 'churned' },
  { nome: 'Test" onclick="alert(1)', email: 'xss2@evil.com', plano: 'Pro', mrr: 299, status: 'ativo' },
];

const dadosTickets = [
  { titulo: 'Bug no dashboard', prioridade: 'alta', descricao: 'Dashboard nao carrega', cliente_email: 'tech@corp.com' },
  { titulo: '<img onerror=alert(1)>', prioridade: 'alta', descricao: 'Normal desc', cliente_email: 'hack@evil.com' },
  { titulo: 'Duvida sobre API', prioridade: 'baixa', descricao: 'javascript:void(0)', cliente_email: 'user@test.com' },
];

// Validacao de clientes
console.log('=== Validacao de Clientes ===\n');

let validCount = 0;
let invalidCount = 0;

for (const dado of dadosClientes) {
  const result = CustomerSchema.safeParse(dado);

  if (result.success) {
    validCount++;
    console.log(`OK: ${result.data.nome} (${result.data.plano})`);
  } else {
    invalidCount++;
    console.log(`ERRO: ${JSON.stringify(dado).slice(0, 60)}`);
    for (const issue of result.error.issues) {
      console.log(`  - [${issue.path.join('.')}] ${issue.message}`);
    }
  }
}

console.log(`\nResultado: ${validCount} validos, ${invalidCount} invalidos`);

// Validacao de tickets
console.log('\n=== Validacao de Tickets ===\n');

for (const dado of dadosTickets) {
  const result = TicketSchema.safeParse(dado);

  if (result.success) {
    console.log(`OK: "${result.data.titulo}"`);
  } else {
    console.log(`ERRO: "${dado.titulo}"`);
    for (const issue of result.error.issues) {
      console.log(`  - [${issue.path.join('.')}] ${issue.message}`);
    }
  }
}

console.log('\n--- Exercicio 5 completo! ---');
