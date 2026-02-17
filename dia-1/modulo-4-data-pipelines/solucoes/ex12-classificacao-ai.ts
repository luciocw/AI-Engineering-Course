/**
 * Solucao 12: Classificacao com AI (Claude)
 *
 * Usa a API do Claude para classificar e categorizar dados.
 * Execute: npx tsx solucoes/ex12-classificacao-ai.ts
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

// === 1: Classificar sentimento ===
async function classificarSentimento(titulo: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 50,
    messages: [
      {
        role: 'user',
        content: `Classifique o sentimento deste titulo de ticket de suporte em EXATAMENTE uma palavra: urgente, frustrado, neutro ou positivo.

Titulo: "${titulo}"

Responda APENAS com a classificacao, sem explicacao.`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text.trim().toLowerCase() : 'neutro';
  const validos = ['urgente', 'frustrado', 'neutro', 'positivo'];
  return validos.includes(text) ? text : 'neutro';
}

// === 2: Sugerir departamento ===
async function sugerirDepartamento(ticket: Ticket): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 50,
    messages: [
      {
        role: 'user',
        content: `Baseado neste ticket de suporte, sugira qual departamento deve tratar. Responda APENAS com uma opcao: engenharia, suporte, vendas, compliance ou produto.

Titulo: "${ticket.titulo}"
Categoria: ${ticket.categoria}
Prioridade: ${ticket.prioridade}

Departamento:`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text.trim().toLowerCase() : 'suporte';
  const validos = ['engenharia', 'suporte', 'vendas', 'compliance', 'produto'];
  return validos.includes(text) ? text : 'suporte';
}

// === 3: Resumo em batch ===
async function gerarResumoTickets(ticketList: Ticket[]): Promise<string> {
  const ticketTexts = ticketList.map(
    (t) => `- [${t.prioridade}] ${t.titulo} (${t.categoria}, ${t.status})`
  ).join('\n');

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `Analise estes tickets de suporte e gere um resumo executivo em portugues com:
1. Principais problemas identificados
2. Areas mais afetadas
3. Recomendacoes de acao

Tickets:
${ticketTexts}

Resumo:`,
      },
    ],
  });

  return response.content[0].type === 'text' ? response.content[0].text : 'Erro ao gerar resumo';
}

// === 4: Executa ===
async function main() {
  console.log('=== Classificacao AI de Tickets ===\n');

  // Classifica os primeiros 5 tickets
  const ticketsParaClassificar = tickets.slice(0, 5);

  console.log('--- Classificacao Individual ---\n');

  for (const ticket of ticketsParaClassificar) {
    const sentimento = await classificarSentimento(ticket.titulo);
    const departamento = await sugerirDepartamento(ticket);

    console.log(`Ticket #${ticket.id}: "${ticket.titulo}"`);
    console.log(`  Categoria original: ${ticket.categoria}`);
    console.log(`  Sentimento AI: ${sentimento}`);
    console.log(`  Departamento AI: ${departamento}`);
    console.log('');
  }

  // Resumo geral
  console.log('--- Resumo Geral AI ---\n');
  const resumo = await gerarResumoTickets(tickets);
  console.log(resumo);

  console.log('\n--- Exercicio 12 completo! ---');
}

main().catch(console.error);
