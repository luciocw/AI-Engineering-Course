/**
 * Solucao 11: Few-Shot Learning
 *
 * Compare zero-shot vs few-shot para classificacao de sentimento.
 * Referencia: exercicio 8 (output estruturado) para parsing de respostas.
 * Execute: npx tsx solucoes/ex11-few-shot.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const exemplos = [
  { review: 'Produto excelente, superou expectativas!', sentimento: 'positivo' },
  { review: 'Nao funcionou, pedi reembolso.', sentimento: 'negativo' },
  { review: 'Faz o basico, nada excepcional.', sentimento: 'neutro' },
  { review: 'Pessimo atendimento, nunca mais compro.', sentimento: 'negativo' },
];

const reviewsTeste = [
  'Entrega rapida e produto de qualidade!',
  'Veio com defeito, muito decepcionado.',
  'Ok, funciona mas o preco e alto.',
  'Entrega atrasou mas o produto e bom.',
  'Melhor compra que ja fiz, recomendo!',
];

function buildZeroShotPrompt(review: string): string {
  return `Classifique o sentimento da review abaixo como "positivo", "negativo" ou "neutro".
Responda APENAS com a classificacao, uma unica palavra.

Review: "${review}"
Sentimento:`;
}

function buildFewShotPrompt(review: string): string {
  const exemplosFormatados = exemplos
    .map((e) => `Review: "${e.review}" -> Sentimento: ${e.sentimento}`)
    .join('\n');

  return `Classifique o sentimento da review como "positivo", "negativo" ou "neutro".
Responda APENAS com a classificacao, uma unica palavra.

${exemplosFormatados}

Review: "${review}" -> Sentimento:`;
}

async function classify(prompt: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 10,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
  });
  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';
  return text.trim().toLowerCase();
}

type Resultado = {
  review: string;
  zeroShot: string;
  fewShot: string;
};

const resultados: Resultado[] = [];

for (const review of reviewsTeste) {
  const zeroShot = await classify(buildZeroShotPrompt(review));
  const fewShot = await classify(buildFewShotPrompt(review));
  resultados.push({ review, zeroShot, fewShot });
}

// Tabela comparativa
console.log('=== Comparacao: Zero-Shot vs Few-Shot ===\n');
console.log(
  'Review'.padEnd(45) +
    'Zero-Shot'.padEnd(12) +
    'Few-Shot'.padEnd(12) +
    'Match?'
);
console.log('-'.repeat(75));

for (const r of resultados) {
  const reviewTrunc =
    r.review.length > 42 ? r.review.slice(0, 42) + '...' : r.review;
  const match = r.zeroShot === r.fewShot ? 'Sim' : 'NAO';
  console.log(
    reviewTrunc.padEnd(45) +
      r.zeroShot.padEnd(12) +
      r.fewShot.padEnd(12) +
      match
  );
}

console.log('\n--- Exercicio 11 completo! ---');
