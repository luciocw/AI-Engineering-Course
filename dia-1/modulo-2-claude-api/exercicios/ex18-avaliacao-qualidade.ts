/**
 * Exercicio 18: Avaliacao de Qualidade (LLM-as-Judge)
 *
 * Use Claude como juiz para avaliar a qualidade das proprias respostas.
 * Voce ja domina multiplas chamadas (ex15) e roteamento (ex16) —
 * agora vai implementar o padrao LLM-as-Judge para comparar modelos.
 *
 * Dificuldade: avancado | Tempo estimado: 25 min
 * Execute: npx tsx exercicios/ex18-avaliacao-qualidade.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Tipos ===

type Avaliacao = {
  clareza: number;       // 0-10
  completude: number;    // 0-10
  precisao: number;      // 0-10
  justificativa: string;
};

type RespostaModelo = {
  modelo: string;
  prompt: string;
  resposta: string;
  inputTokens: number;
  outputTokens: number;
};

type ResultadoAvaliacao = {
  prompt: string;
  modelo: string;
  resposta: string;
  avaliacao: Avaliacao;
  media: number;
};

// === Prompts de teste ===
const promptsTeste = [
  'Explique o conceito de recursao em programacao para um iniciante.',
  'Quais sao as vantagens e desvantagens de microservicos vs monolito?',
  'Como funciona o garbage collector em linguagens como Java e Go?',
];

// === Modelos para comparar ===
const modelos: Array<{ id: string; nome: string }> = [
  { id: 'claude-haiku-4-5-20251001', nome: 'Haiku 4.5' },
  { id: 'claude-sonnet-4-20250514', nome: 'Sonnet 4' },
];

// === TODO 1: Gere respostas de ambos os modelos ===
// Para cada prompt de teste, chame ambos os modelos.
// Armazene a resposta, modelo, e tokens usados.
// Use max_tokens: 500 e temperature: 0.3.

// async function gerarRespostas(): Promise<RespostaModelo[]> {
//   const respostas: RespostaModelo[] = [];
//   for (const prompt of promptsTeste) {
//     for (const modelo of modelos) {
//       // Chame client.messages.create({ model: modelo.id, ... })
//       // Armazene em respostas
//     }
//   }
//   return respostas;
// }

// === TODO 2: Crie o prompt do juiz ===
// O juiz deve avaliar cada resposta em 3 criterios (0-10):
// - clareza: quao clara e acessivel e a explicacao
// - completude: quao completa e abrangente e a resposta
// - precisao: quao precisa e tecnicamente correta e a resposta
//
// Retorne JSON: { "clareza": N, "completude": N, "precisao": N, "justificativa": "..." }
// IMPORTANTE: O juiz NAO deve saber qual modelo gerou a resposta.

// function buildJudgePrompt(prompt: string, resposta: string): string { ... }

// === TODO 3: Use Sonnet como juiz para avaliar todas as respostas ===
// Para cada resposta gerada, chame o juiz (Sonnet) para avaliar.
// Parse o JSON da avaliacao.
// Calcule a media dos 3 criterios.

// async function avaliarResposta(prompt: string, resposta: string): Promise<Avaliacao> { ... }

// === TODO 4: Gere tabela comparativa ===
// Formato:
// Prompt (resumido) | Modelo    | Clareza | Completude | Precisao | Media
// Recursao          | Haiku 4.5 | 8       | 7          | 9        | 8.0
// Recursao          | Sonnet 4  | 9       | 9          | 10       | 9.3
// ...
// Ao final, mostre a media geral por modelo.

// async function executarAvaliacao() { ... }
// executarAvaliacao();

console.log('\n--- Exercicio 18 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex18-avaliacao-qualidade.ts');
