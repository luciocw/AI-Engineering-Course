/**
 * Solucao 12: Few-Shot Dinamico
 * Dificuldade: intermediario | Tempo: 20 min
 *
 * Selecione exemplos few-shot dinamicamente com base na similaridade do input.
 * Referencia: exercicio 11 (few-shot fixo) — agora os exemplos sao escolhidos por relevancia.
 * Execute: npx tsx solucoes/ex12-few-shot-dinamico.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Banco de exemplos rotulados ===
type Exemplo = {
  texto: string;
  categoria: string;
  keywords: string[];
};

const bancoExemplos: Exemplo[] = [
  {
    texto: 'Meu cartao foi clonado e fizeram compras sem minha autorizacao',
    categoria: 'fraude',
    keywords: ['cartao', 'clonado', 'compras', 'autorizacao', 'fraude'],
  },
  {
    texto: 'O aplicativo do banco nao abre desde ontem, da erro 500',
    categoria: 'problema_tecnico',
    keywords: ['aplicativo', 'banco', 'erro', 'abre', 'bug'],
  },
  {
    texto: 'Quero solicitar um aumento no limite do meu cartao de credito',
    categoria: 'solicitacao',
    keywords: ['limite', 'cartao', 'credito', 'aumento', 'solicitar'],
  },
  {
    texto: 'Fui cobrado duas vezes na mesma fatura do cartao',
    categoria: 'cobranca',
    keywords: ['cobrado', 'fatura', 'cartao', 'duplicada', 'cobranca'],
  },
  {
    texto: 'Como faco para cadastrar minha chave PIX no aplicativo?',
    categoria: 'duvida',
    keywords: ['cadastrar', 'pix', 'aplicativo', 'como', 'chave'],
  },
  {
    texto: 'Gostaria de cancelar minha conta corrente neste banco',
    categoria: 'cancelamento',
    keywords: ['cancelar', 'conta', 'corrente', 'encerrar', 'banco'],
  },
  {
    texto: 'Recebi uma ligacao pedindo minha senha, e do banco mesmo?',
    categoria: 'fraude',
    keywords: ['ligacao', 'senha', 'golpe', 'banco', 'pedindo'],
  },
  {
    texto: 'A transferencia que fiz ontem ainda nao caiu na outra conta',
    categoria: 'problema_tecnico',
    keywords: ['transferencia', 'caiu', 'conta', 'pendente', 'demora'],
  },
  {
    texto: 'Quero trocar meu plano de conta para o pacote premium',
    categoria: 'solicitacao',
    keywords: ['trocar', 'plano', 'conta', 'premium', 'pacote'],
  },
  {
    texto: 'Estao cobrando tarifa de manutencao que nao existia antes',
    categoria: 'cobranca',
    keywords: ['tarifa', 'manutencao', 'cobrando', 'taxa', 'antes'],
  },
  {
    texto: 'Qual e o horario de atendimento da agencia central?',
    categoria: 'duvida',
    keywords: ['horario', 'atendimento', 'agencia', 'funciona', 'central'],
  },
  {
    texto: 'Quero encerrar meu cartao de credito e todas as suas funcoes',
    categoria: 'cancelamento',
    keywords: ['encerrar', 'cartao', 'credito', 'cancelar', 'funcoes'],
  },
];

// === Inputs de teste ===
const inputsTeste = [
  'Alguem usou meu cartao para comprar coisas na internet sem eu saber',
  'Nao consigo fazer login no app do banco, fica carregando',
  'Quero saber como funciona o programa de pontos do cartao',
  'Me cobraram uma anuidade que era pra ser isenta',
  'Preciso fechar minha conta poupanca urgente',
];

// Solucao TODO 2: Selecao dinamica de exemplos por relevancia
function selectExamples(
  input: string,
  banco: Exemplo[],
  n: number
): Exemplo[] {
  const inputLower = input.toLowerCase();
  const inputWords = inputLower.split(/\s+/);

  const scored = banco.map((exemplo) => {
    let score = 0;
    for (const keyword of exemplo.keywords) {
      // Verifica se a keyword aparece no input (match parcial)
      if (inputLower.includes(keyword.toLowerCase())) {
        score += 2; // match direto no texto
      }
      // Verifica match por palavra individual
      for (const word of inputWords) {
        if (word.length > 3 && keyword.toLowerCase().includes(word)) {
          score += 1;
        }
      }
    }
    return { exemplo, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((s) => s.exemplo);
}

// Solucao TODO 3: Prompt few-shot dinamico
function buildDynamicFewShotPrompt(
  input: string,
  exemplos: Exemplo[]
): string {
  const exemplosFormatados = exemplos
    .map((e) => `Texto: "${e.texto}" -> Categoria: ${e.categoria}`)
    .join('\n');

  return `Classifique o texto em uma destas categorias: fraude, problema_tecnico, solicitacao, cobranca, duvida, cancelamento.
Responda APENAS com o nome da categoria.

${exemplosFormatados}

Texto: "${input}" -> Categoria:`;
}

// Few-shot fixo: sempre os mesmos 3 primeiros
function buildFixedFewShotPrompt(input: string): string {
  const exemplosFixos = bancoExemplos.slice(0, 3);
  const exemplosFormatados = exemplosFixos
    .map((e) => `Texto: "${e.texto}" -> Categoria: ${e.categoria}`)
    .join('\n');

  return `Classifique o texto em uma destas categorias: fraude, problema_tecnico, solicitacao, cobranca, duvida, cancelamento.
Responda APENAS com o nome da categoria.

${exemplosFormatados}

Texto: "${input}" -> Categoria:`;
}

async function classify(prompt: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 20,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
  });
  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';
  return text.trim().toLowerCase();
}

// Solucao TODO 4: Comparacao few-shot fixo vs dinamico
type Resultado = {
  input: string;
  fixo: string;
  dinamico: string;
  exemplosSelecionados: string[];
};

const resultados: Resultado[] = [];

console.log('=== Classificacao: Few-Shot Fixo vs Dinamico ===\n');

for (const input of inputsTeste) {
  console.log(`Input: "${input.slice(0, 55)}..."`);

  // Selecionar exemplos dinamicos
  const exemplosDinamicos = selectExamples(input, bancoExemplos, 3);

  console.log(
    `  Exemplos selecionados: ${exemplosDinamicos.map((e) => e.categoria).join(', ')}`
  );

  // Classificar com ambas abordagens
  const fixo = await classify(buildFixedFewShotPrompt(input));
  const dinamico = await classify(
    buildDynamicFewShotPrompt(input, exemplosDinamicos)
  );

  resultados.push({
    input,
    fixo,
    dinamico,
    exemplosSelecionados: exemplosDinamicos.map((e) => e.categoria),
  });

  console.log(`  Fixo: ${fixo} | Dinamico: ${dinamico}\n`);
}

// Tabela comparativa
console.log('=== Tabela Comparativa ===\n');
console.log(
  'Input'.padEnd(40) +
    'Fixo'.padEnd(18) +
    'Dinamico'.padEnd(18) +
    'Exemplos Usados'
);
console.log('-'.repeat(95));

for (const r of resultados) {
  const inputTrunc =
    r.input.length > 37 ? r.input.slice(0, 37) + '...' : r.input;
  const match = r.fixo === r.dinamico ? '' : ' *';
  console.log(
    inputTrunc.padEnd(40) +
      (r.fixo + match).padEnd(18) +
      r.dinamico.padEnd(18) +
      r.exemplosSelecionados.join(', ')
  );
}

const divergencias = resultados.filter((r) => r.fixo !== r.dinamico).length;
console.log(`\nDivergencias: ${divergencias}/${resultados.length}`);
console.log('(* indica divergencia entre fixo e dinamico)');

console.log('\n--- Exercicio 12 completo! ---');
