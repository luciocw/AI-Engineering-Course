/**
 * Solucao 2: Comparando Modelos
 *
 * Compare Haiku vs Sonnet: mesma pergunta, modelos diferentes.
 * Execute: npx tsx solucoes/ex2-modelos-comparacao.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const descricaoProduto = `
Camiseta Premium Tech Wear - Feita com tecido inteligente que regula temperatura corporal.
Possui protecao UV50+, e resistente a manchas e tem secagem ultra-rapida.
Ideal para profissionais de tecnologia que valorizam conforto e praticidade no dia a dia.
Disponivel em 5 cores. Tamanhos P ao GG.
`;

const promptTraducao = `Traduza a seguinte descricao de produto do portugues para ingles profissional, mantendo o tom de marketing:\n\n${descricaoProduto}`;

// Configuracao dos modelos
const modelos = [
  {
    id: 'claude-haiku-4-5-20251001' as const,
    nome: 'Haiku 4.5',
    inputCost: 0.25,
    outputCost: 1.25,
  },
  {
    id: 'claude-sonnet-4-5-20250929' as const,
    nome: 'Sonnet 4.5',
    inputCost: 3,
    outputCost: 15,
  },
];

interface ResultadoModelo {
  nome: string;
  texto: string;
  inputTokens: number;
  outputTokens: number;
  custoInput: number;
  custoOutput: number;
  custoTotal: number;
}

const resultados: ResultadoModelo[] = [];

console.log('=== Comparacao: Haiku vs Sonnet ===');
console.log(`Tarefa: Traduzir descricao de produto PT-BR -> EN\n`);

for (const modelo of modelos) {
  const inicio = Date.now();

  const response = await client.messages.create({
    model: modelo.id,
    max_tokens: 500,
    messages: [{ role: 'user', content: promptTraducao }],
  });

  const duracao = Date.now() - inicio;

  const texto =
    response.content[0].type === 'text' ? response.content[0].text : '';

  const custoInput =
    (response.usage.input_tokens / 1_000_000) * modelo.inputCost;
  const custoOutput =
    (response.usage.output_tokens / 1_000_000) * modelo.outputCost;
  const custoTotal = custoInput + custoOutput;

  resultados.push({
    nome: modelo.nome,
    texto,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    custoInput,
    custoOutput,
    custoTotal,
  });

  console.log(`--- ${modelo.nome} ---`);
  console.log(`Traducao:\n${texto}\n`);
  console.log(`Tempo de resposta: ${duracao}ms`);
  console.log(
    `Tokens: input=${response.usage.input_tokens}, output=${response.usage.output_tokens}`
  );
  console.log(`Custo: $${custoTotal.toFixed(6)}`);
  console.log('');
}

// Tabela comparativa
console.log('=== Tabela Comparativa ===');
console.log(
  `${'Metrica'.padEnd(25)} | ${'Haiku 4.5'.padEnd(15)} | ${'Sonnet 4.5'.padEnd(15)}`
);
console.log('-'.repeat(60));

const [haiku, sonnet] = resultados;

console.log(
  `${'Input Tokens'.padEnd(25)} | ${String(haiku.inputTokens).padEnd(15)} | ${String(sonnet.inputTokens).padEnd(15)}`
);
console.log(
  `${'Output Tokens'.padEnd(25)} | ${String(haiku.outputTokens).padEnd(15)} | ${String(sonnet.outputTokens).padEnd(15)}`
);
console.log(
  `${'Custo Input'.padEnd(25)} | ${'$' + haiku.custoInput.toFixed(6).padEnd(14)} | ${'$' + sonnet.custoInput.toFixed(6).padEnd(14)}`
);
console.log(
  `${'Custo Output'.padEnd(25)} | ${'$' + haiku.custoOutput.toFixed(6).padEnd(14)} | ${'$' + sonnet.custoOutput.toFixed(6).padEnd(14)}`
);
console.log(
  `${'Custo Total'.padEnd(25)} | ${'$' + haiku.custoTotal.toFixed(6).padEnd(14)} | ${'$' + sonnet.custoTotal.toFixed(6).padEnd(14)}`
);

const fatorCusto = sonnet.custoTotal / haiku.custoTotal;
console.log(
  `\nSonnet custa ${fatorCusto.toFixed(1)}x mais que Haiku para esta tarefa.`
);
console.log(
  'Compare a qualidade das traducoes acima para decidir se o custo extra vale a pena.'
);

console.log('\n--- Exercicio 2 completo! ---');
