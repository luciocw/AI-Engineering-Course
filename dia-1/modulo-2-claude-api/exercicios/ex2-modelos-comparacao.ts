/**
 * Exercicio 2: Comparando Modelos
 *
 * Compare Haiku vs Sonnet: mesma pergunta, modelos diferentes.
 * Analise qualidade, tokens e custo de cada modelo.
 * Execute: npx tsx exercicios/ex2-modelos-comparacao.ts
 *
 * Tempo estimado: 15 min
 * Dificuldade: iniciante
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Cenario: traduzir descricao de produto do portugues para ingles ===
const descricaoProduto = `
Camiseta Premium Tech Wear - Feita com tecido inteligente que regula temperatura corporal.
Possui protecao UV50+, e resistente a manchas e tem secagem ultra-rapida.
Ideal para profissionais de tecnologia que valorizam conforto e praticidade no dia a dia.
Disponivel em 5 cores. Tamanhos P ao GG.
`;

const promptTraducao = `Traduza a seguinte descricao de produto do portugues para ingles profissional, mantendo o tom de marketing:\n\n${descricaoProduto}`;

// === TODO 1: Chame o modelo Haiku com o prompt de traducao ===
// Use model: 'claude-haiku-4-5-20251001'
// max_tokens: 500
// Capture: texto da resposta, input_tokens, output_tokens

// const respostaHaiku = await client.messages.create({ ... });

// === TODO 2: Chame o modelo Sonnet com o mesmo prompt ===
// Use model: 'claude-sonnet-4-5-20250929'
// max_tokens: 500
// Capture: texto da resposta, input_tokens, output_tokens

// const respostaSonnet = await client.messages.create({ ... });

// === TODO 3: Calcule o custo de cada modelo ===
// Haiku 4.5: $0.25 por 1M input tokens, $1.25 por 1M output tokens
// Sonnet 4.5: $3.00 por 1M input tokens, $15.00 por 1M output tokens
//
// Formula: (tokens / 1_000_000) * preco_por_milhao

// const custoHaiku = ...
// const custoSonnet = ...

// === TODO 4: Exiba uma tabela comparativa formatada ===
// Mostre para cada modelo:
// - Nome do modelo
// - Texto da traducao
// - Tokens (input + output)
// - Custo estimado
// - Diferenca de custo entre os dois

// console.log('=== Comparacao: Haiku vs Sonnet ===');
// console.log('...');

console.log('\n--- Exercicio 2 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex2-modelos-comparacao.ts');
