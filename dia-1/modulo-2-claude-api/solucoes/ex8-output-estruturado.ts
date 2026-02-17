/**
 * Solucao 8: Output JSON Estruturado
 * Dificuldade: intermediario | Tempo: 20 min
 *
 * Extraia dados estruturados (JSON) das respostas do Claude.
 * Execute: npx tsx solucoes/ex8-output-estruturado.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Dados: reviews de produtos para analise ===
const reviews = [
  {
    id: 1,
    texto:
      'Produto fantastico! A qualidade do material e surpreendente pelo preco. Entrega rapida e embalagem impecavel. Super recomendo para quem busca custo-beneficio.',
  },
  {
    id: 2,
    texto:
      'Veio com defeito na tela, ja e o segundo que compro com problema. O suporte demorou 3 semanas para responder. Nao vale o preco cobrado.',
  },
  {
    id: 3,
    texto:
      'Funciona bem para o basico. Nao e o melhor do mercado, mas tambem nao e o pior. A bateria poderia durar mais, porem o design e bonito.',
  },
];

// === Tipo esperado do JSON de saida ===
type AnaliseReview = {
  sentimento: 'positivo' | 'negativo' | 'neutro';
  confianca: number;
  palavrasChave: string[];
  resumo: string;
};

// Solucao TODO 1: Prompt que forca JSON
function buildAnalysisPrompt(reviewTexto: string): {
  system: string;
  user: string;
} {
  const system = `Voce e um analista de sentimento. Responda APENAS com JSON valido, sem texto adicional, sem markdown.
O JSON deve seguir exatamente este schema:
{
  "sentimento": "positivo" | "negativo" | "neutro",
  "confianca": <numero de 0 a 1>,
  "palavrasChave": [<lista de 3-5 palavras-chave relevantes>],
  "resumo": "<resumo de 1 frase da review>"
}`;

  const user = `Analise a seguinte review de produto:\n\n"${reviewTexto}"`;

  return { system, user };
}

// Solucao TODO 2: Parse robusto de JSON
function parseJsonResponse(text: string): AnaliseReview | null {
  // Tentativa 1: parse direto
  try {
    return JSON.parse(text) as AnaliseReview;
  } catch {
    // continua
  }

  // Tentativa 2: extrair de bloco ```json ... ```
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    try {
      return JSON.parse(jsonBlockMatch[1].trim()) as AnaliseReview;
    } catch {
      // continua
    }
  }

  // Tentativa 3: encontrar primeiro { ... } no texto
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]) as AnaliseReview;
    } catch {
      // falhou
    }
  }

  return null;
}

// Solucao TODO 3: Funcao de retry com contexto de erro
async function analyzeWithRetry(
  reviewTexto: string,
  maxRetries = 2
): Promise<AnaliseReview | null> {
  const { system, user } = buildAnalysisPrompt(reviewTexto);

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: user }];

  for (let tentativa = 0; tentativa <= maxRetries; tentativa++) {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      temperature: 0,
      system,
      messages,
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';

    const parsed = parseJsonResponse(text);

    if (parsed) {
      if (tentativa > 0) {
        console.log(`  (sucesso na tentativa ${tentativa + 1})`);
      }
      return parsed;
    }

    // Se falhou e ainda tem retries, adiciona contexto de erro
    if (tentativa < maxRetries) {
      console.log(
        `  Tentativa ${tentativa + 1} falhou no parse. Reenviando com correcao...`
      );
      messages.push({ role: 'assistant', content: text });
      messages.push({
        role: 'user',
        content: `O JSON retornado e invalido. Erro: nao foi possivel parsear como JSON. Por favor, retorne APENAS o JSON valido, sem nenhum texto antes ou depois. Sem blocos de codigo markdown.`,
      });
    }
  }

  console.log('  ERRO: nao foi possivel obter JSON valido apos retries.');
  return null;
}

// Solucao TODO 4: Processar reviews e exibir resultados
const resultados: { id: number; analise: AnaliseReview | null }[] = [];

for (const review of reviews) {
  console.log(`\n=== Review #${review.id} ===`);
  console.log(`Texto: ${review.texto.slice(0, 60)}...`);

  const analise = await analyzeWithRetry(review.texto);
  resultados.push({ id: review.id, analise });

  if (analise) {
    console.log(`  Sentimento: ${analise.sentimento}`);
    console.log(`  Confianca: ${(analise.confianca * 100).toFixed(0)}%`);
    console.log(`  Palavras-chave: ${analise.palavrasChave.join(', ')}`);
    console.log(`  Resumo: ${analise.resumo}`);
  }
}

// Tabela-resumo
console.log('\n=== Tabela Resumo ===\n');
console.log(
  'Review'.padEnd(8) +
    'Sentimento'.padEnd(12) +
    'Confianca'.padEnd(12) +
    'Palavras-chave'
);
console.log('-'.repeat(70));

for (const r of resultados) {
  if (r.analise) {
    console.log(
      `#${r.id}`.padEnd(8) +
        r.analise.sentimento.padEnd(12) +
        `${(r.analise.confianca * 100).toFixed(0)}%`.padEnd(12) +
        r.analise.palavrasChave.slice(0, 3).join(', ')
    );
  } else {
    console.log(`#${r.id}`.padEnd(8) + 'ERRO'.padEnd(12) + '-'.padEnd(12) + '-');
  }
}

console.log('\n--- Exercicio 8 completo! ---');
