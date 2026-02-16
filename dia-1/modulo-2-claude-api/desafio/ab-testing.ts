/**
 * Desafio: Framework de A/B Testing de Prompts
 *
 * Compare variantes de prompt medindo qualidade, custo e latencia.
 * Execute: npx tsx desafio/ab-testing.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

type PromptVariant = {
  name: string;
  system?: string;
  buildPrompt: (question: string) => string;
};

type RunResult = {
  text: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
};

type ABResult = {
  variant: string;
  avgLatencyMs: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  avgCost: number;
  avgResponseLength: number;
  runs: RunResult[];
};

async function runVariant(
  variant: PromptVariant,
  question: string
): Promise<RunResult> {
  const prompt = variant.buildPrompt(question);
  const start = performance.now();

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    ...(variant.system ? { system: variant.system } : {}),
    messages: [{ role: 'user', content: prompt }],
  });

  const latencyMs = performance.now() - start;
  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const cost =
    (inputTokens / 1_000_000) * 0.25 + (outputTokens / 1_000_000) * 1.25;

  return { text, latencyMs, inputTokens, outputTokens, cost };
}

function average(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

async function runABTest(
  question: string,
  variantA: PromptVariant,
  variantB: PromptVariant,
  runs = 3
): Promise<{ a: ABResult; b: ABResult }> {
  console.log(`\nPergunta: "${question}"`);
  console.log(`Execucoes por variante: ${runs}\n`);

  const resultsA: RunResult[] = [];
  const resultsB: RunResult[] = [];

  for (let i = 0; i < runs; i++) {
    console.log(`  Run ${i + 1}/${runs}...`);
    const [a, b] = await Promise.all([
      runVariant(variantA, question),
      runVariant(variantB, question),
    ]);
    resultsA.push(a);
    resultsB.push(b);
  }

  function summarize(name: string, results: RunResult[]): ABResult {
    return {
      variant: name,
      avgLatencyMs: average(results.map((r) => r.latencyMs)),
      avgInputTokens: average(results.map((r) => r.inputTokens)),
      avgOutputTokens: average(results.map((r) => r.outputTokens)),
      avgCost: average(results.map((r) => r.cost)),
      avgResponseLength: average(results.map((r) => r.text.length)),
      runs: results,
    };
  }

  return {
    a: summarize(variantA.name, resultsA),
    b: summarize(variantB.name, resultsB),
  };
}

function printComparison(a: ABResult, b: ABResult): void {
  const rows = [
    {
      metrica: 'Latencia (ms)',
      a: a.avgLatencyMs.toFixed(0),
      b: b.avgLatencyMs.toFixed(0),
      winner: a.avgLatencyMs < b.avgLatencyMs ? a.variant : b.variant,
    },
    {
      metrica: 'Input Tokens',
      a: a.avgInputTokens.toFixed(0),
      b: b.avgInputTokens.toFixed(0),
      winner: a.avgInputTokens < b.avgInputTokens ? a.variant : b.variant,
    },
    {
      metrica: 'Output Tokens',
      a: a.avgOutputTokens.toFixed(0),
      b: b.avgOutputTokens.toFixed(0),
      winner: a.avgOutputTokens < b.avgOutputTokens ? a.variant : b.variant,
    },
    {
      metrica: 'Custo ($)',
      a: `$${a.avgCost.toFixed(6)}`,
      b: `$${b.avgCost.toFixed(6)}`,
      winner: a.avgCost < b.avgCost ? a.variant : b.variant,
    },
    {
      metrica: 'Resp. Length',
      a: a.avgResponseLength.toFixed(0),
      b: b.avgResponseLength.toFixed(0),
      winner:
        a.avgResponseLength > b.avgResponseLength ? a.variant : b.variant,
    },
  ];

  console.log(
    '\n' +
      'Metrica'.padEnd(16) +
      a.variant.padEnd(16) +
      b.variant.padEnd(16) +
      'Vencedor'
  );
  console.log('-'.repeat(60));

  for (const row of rows) {
    console.log(
      row.metrica.padEnd(16) +
        row.a.padEnd(16) +
        row.b.padEnd(16) +
        row.winner
    );
  }
}

// === Teste 1: Prompt curto vs detalhado ===
console.log('=== Teste A/B #1: Curto vs Detalhado ===');

const { a: a1, b: b1 } = await runABTest(
  'O que e RAG em IA?',
  {
    name: 'Curto',
    buildPrompt: (q) => q,
  },
  {
    name: 'Detalhado',
    buildPrompt: (q) =>
      `Voce e um especialista em AI Engineering. Responda a seguinte pergunta de forma clara, com exemplos praticos e em no maximo 3 paragrafos.\n\nPergunta: ${q}`,
  }
);
printComparison(a1, b1);

// === Teste 2: Com system prompt vs sem ===
console.log('\n\n=== Teste A/B #2: Com System vs Sem System ===');

const { a: a2, b: b2 } = await runABTest(
  'Explique embeddings para um iniciante.',
  {
    name: 'Sem System',
    buildPrompt: (q) => q,
  },
  {
    name: 'Com System',
    system:
      'Voce e um professor didatico que explica conceitos de IA para iniciantes. Use analogias do dia-a-dia.',
    buildPrompt: (q) => q,
  }
);
printComparison(a2, b2);

console.log('\n--- Desafio completo! ---');
