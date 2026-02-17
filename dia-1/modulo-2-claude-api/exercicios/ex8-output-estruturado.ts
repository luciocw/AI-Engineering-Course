/**
 * Exercicio 8: Output JSON Estruturado
 * Dificuldade: intermediario | Tempo: 20 min
 *
 * Extraia dados estruturados (JSON) das respostas do Claude.
 * Aprenda a forcar formato, parsear e lidar com erros.
 * Execute: npx tsx exercicios/ex8-output-estruturado.ts
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
  confianca: number; // 0 a 1
  palavrasChave: string[];
  resumo: string;
};

// === TODO 1: Crie o prompt que forca resposta em JSON ===
// O prompt deve:
// - Instruir Claude a responder APENAS com JSON valido
// - Especificar o schema exato: { sentimento, confianca, palavrasChave, resumo }
// - Incluir a review a ser analisada
// Dica: use system prompt para definir o formato + user prompt com a review.

// function buildAnalysisPrompt(reviewTexto: string): {
//   system: string;
//   user: string;
// } { ... }

// === TODO 2: Parse o JSON da resposta com tratamento de erros ===
// A funcao deve:
// - Tentar JSON.parse no texto
// - Caso falhe, tentar extrair JSON de dentro de blocos ```json ... ```
// - Retornar o objeto parseado ou null em caso de erro

// function parseJsonResponse(text: string): AnaliseReview | null { ... }

// === TODO 3: Crie uma funcao de retry ===
// Se o JSON for invalido:
// - Re-envie o prompt com a mensagem de erro
// - Use o historico de conversa (messages) para dar contexto
// - Maximo 2 tentativas
// Dica: monte um array de messages com user -> assistant -> user (correcao)

// async function analyzeWithRetry(reviewTexto: string): Promise<AnaliseReview | null> { ... }

// === TODO 4: Processe as 3 reviews e exiba tabela de resultados ===
// Para cada review:
// 1. Chame analyzeWithRetry
// 2. Exiba o resultado formatado
// Ao final, mostre uma tabela-resumo:
// | Review | Sentimento | Confianca | Palavras-chave |

// for (const review of reviews) {
//   console.log(`\n=== Review #${review.id} ===`);
//   console.log(`Texto: ${review.texto.slice(0, 60)}...`);
//   const result = await analyzeWithRetry(review.texto);
//   if (result) {
//     console.log(`Sentimento: ${result.sentimento}`);
//     console.log(`Confianca: ${(result.confianca * 100).toFixed(0)}%`);
//     console.log(`Palavras-chave: ${result.palavrasChave.join(', ')}`);
//     console.log(`Resumo: ${result.resumo}`);
//   }
// }

console.log('\n--- Exercicio 8 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex8-output-estruturado.ts');
