/**
 * Solucao 13: Chain-of-Thought Prompting
 *
 * Compare abordagem direta vs CoT vs CoT estruturado.
 * Referencia: exercicio 8 (JSON parsing) e exercicio 11 (few-shot).
 * Execute: npx tsx solucoes/ex13-chain-of-thought.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const cenario = {
  empresa: 'TechCorp',
  planoBase: 500,
  usuarios: 25,
  precoPorUsuario: 30,
  tier: 'Premium',
  tierAdicional: 200,
  addons: [
    { nome: 'Analytics', preco: 100 },
    { nome: 'API Access', preco: 150 },
  ],
  descontoAnual: 0.15,
  descontoFidelidade: 0.05,
};

// Resposta correta: R$1.372,75
const RESPOSTA_CORRETA = 1372.75;

const dadosCenario = `Empresa: ${cenario.empresa}
Plano Base: R$${cenario.planoBase}/mes
Usuarios: ${cenario.usuarios} a R$${cenario.precoPorUsuario} cada
Tier: ${cenario.tier} (+R$${cenario.tierAdicional})
Addons: ${cenario.addons.map((a) => `${a.nome} (R$${a.preco})`).join(', ')}
Desconto anual: ${cenario.descontoAnual * 100}%
Desconto fidelidade: ${cenario.descontoFidelidade * 100}%`;

function buildDirectPrompt(): string {
  return `Calcule o preco mensal final para o seguinte plano SaaS.
Responda APENAS com o valor numerico (ex: 1234.56).

${dadosCenario}`;
}

function buildCoTPrompt(): string {
  return `Calcule o preco mensal final para o seguinte plano SaaS.
Pense passo a passo. Mostre cada etapa do calculo.
Ao final, indique o valor final no formato: TOTAL: R$X.XXX,XX

${dadosCenario}`;
}

function buildStructuredCoTPrompt(): string {
  return `Calcule o preco mensal final para o seguinte plano SaaS.
Pense passo a passo e retorne APENAS um JSON valido no formato:
{
  "etapas": [{ "descricao": "...", "valor": 0 }],
  "precoFinal": 0,
  "confianca": "alta|media|baixa"
}

${dadosCenario}`;
}

function extractPrice(text: string): number | null {
  // Try JSON parse first
  try {
    const json = JSON.parse(text);
    if (json.precoFinal) return Number(json.precoFinal);
  } catch {
    // Not JSON, try regex
  }

  // Match R$1.372,75 or R$1372.75 or 1372.75 or TOTAL: R$1.372,75
  const patterns = [
    /TOTAL:\s*R?\$?\s*([\d.,]+)/gi,
    /R\$\s*([\d.,]+)/g,
    /([\d]+[.,][\d]{2})\b/g,
  ];

  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      const last = matches[matches.length - 1][1];
      // Handle Brazilian format: 1.372,75 -> 1372.75
      const normalized = last.includes(',')
        ? last.replace(/\./g, '').replace(',', '.')
        : last;
      return parseFloat(normalized);
    }
  }
  return null;
}

type Resultado = {
  abordagem: string;
  preco: number | null;
  correto: boolean;
  tokens: { input: number; output: number };
  resposta: string;
};

const resultados: Resultado[] = [];

const abordagens = [
  { nome: 'Direto', prompt: buildDirectPrompt() },
  { nome: 'CoT', prompt: buildCoTPrompt() },
  { nome: 'CoT JSON', prompt: buildStructuredCoTPrompt() },
];

for (const abordagem of abordagens) {
  console.log(`\n=== Abordagem: ${abordagem.nome} ===`);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    temperature: 0,
    messages: [{ role: 'user', content: abordagem.prompt }],
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';
  const preco = extractPrice(text);
  const correto = preco !== null && Math.abs(preco - RESPOSTA_CORRETA) < 0.01;

  console.log(text);

  resultados.push({
    abordagem: abordagem.nome,
    preco,
    correto,
    tokens: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
    resposta: text,
  });
}

// Resumo comparativo
console.log('\n=== Resumo Comparativo ===');
console.log(
  'Abordagem'.padEnd(12) +
    'Preco'.padEnd(14) +
    'Correto?'.padEnd(10) +
    'Input'.padEnd(8) +
    'Output'
);
console.log('-'.repeat(55));

for (const r of resultados) {
  const precoStr = r.preco !== null ? `R$${r.preco.toFixed(2)}` : 'N/A';
  console.log(
    r.abordagem.padEnd(12) +
      precoStr.padEnd(14) +
      (r.correto ? 'Sim' : 'Nao').padEnd(10) +
      String(r.tokens.input).padEnd(8) +
      String(r.tokens.output)
  );
}

console.log(`\nResposta correta: R$${RESPOSTA_CORRETA.toFixed(2)}`);

console.log('\n--- Exercicio 13 completo! ---');
