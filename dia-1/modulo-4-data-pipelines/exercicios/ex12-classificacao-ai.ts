/**
 * Exercicio 12: Classificacao com AI (Claude)
 *
 * Use a API do Claude para classificar e categorizar dados automaticamente.
 * Dificuldade: Avancado
 * Tempo estimado: 30 minutos
 * Execute: npx tsx exercicios/ex12-classificacao-ai.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const client = new Anthropic();

// Carrega tickets
const ticketsCSV = readFileSync('data/samples/tickets.csv', 'utf-8');
const rawTickets = parse(ticketsCSV, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

interface Ticket {
  id: number;
  cliente_id: number;
  titulo: string;
  prioridade: string;
  status: string;
  categoria: string;
  criado_em: string;
}

const tickets: Ticket[] = rawTickets.map((r) => ({
  id: parseInt(r.id, 10),
  cliente_id: parseInt(r.cliente_id, 10),
  titulo: r.titulo,
  prioridade: r.prioridade,
  status: r.status,
  categoria: r.categoria,
  criado_em: r.criado_em,
}));

// === TODO 1: Crie uma funcao para classificar sentimento do ticket ===
// Use Claude para analisar o titulo do ticket e classificar como:
// 'urgente' | 'frustrado' | 'neutro' | 'positivo'
// async function classificarSentimento(titulo: string): Promise<string> {
//   const response = await client.messages.create({
//     model: 'claude-haiku-4-5-20251001',
//     max_tokens: 50,
//     messages: [{ role: 'user', content: `Classifique o sentimento...` }],
//   });
//   // Parse a resposta
// }

// === TODO 2: Crie uma funcao para sugerir departamento ===
// Com base no titulo e categoria, sugira qual departamento deve tratar:
// 'engenharia' | 'suporte' | 'vendas' | 'compliance' | 'produto'
// async function sugerirDepartamento(ticket: Ticket): Promise<string> { ... }

// === TODO 3: Crie uma funcao para gerar resumo em batch ===
// Envie multiplos tickets ao Claude em uma unica chamada para gerar
// um resumo dos problemas mais comuns.
// async function gerarResumoTickets(tickets: Ticket[]): Promise<string> { ... }

// === TODO 4: Execute a classificacao ===
// Para os primeiros 5 tickets, classifique sentimento e departamento.
// Depois gere um resumo geral.

console.log('\n--- Exercicio 12 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex12-classificacao-ai.ts');
