/**
 * Solucao 20: A/B Testing de Prompts (Capstone)
 *
 * Framework completo de A/B testing para otimizar prompts.
 * Une chaining, routing, cost tracking, LLM-as-judge e versionamento.
 * Execute: npx tsx solucoes/ex20-ab-testing.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Tipos ===

type PromptVariant = {
  name: string;
  systemPrompt: string;
  userPromptTemplate: string;
};

type VariantResult = {
  variantName: string;
  input: string;
  output: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  score: number;
  judgeJustificativa: string;
};

type ABTest = {
  name: string;
  variants: PromptVariant[];
  results: VariantResult[];
};

type ABTestSummary = {
  variantName: string;
  avgScore: number;
  avgTokens: number;
  avgLatencyMs: number;
  totalCost: number;
  wins: number;
};

// === Classe ABTestRunner ===

class ABTestRunner {
  private test: ABTest;

  constructor(name: string) {
    this.test = {
      name,
      variants: [],
      results: [],
    };
  }

  addVariant(variant: PromptVariant): void {
    this.test.variants.push(variant);
  }

  addResult(result: VariantResult): void {
    this.test.results.push(result);
  }

  getResults(): VariantResult[] {
    return this.test.results;
  }

  getSummary(): ABTestSummary[] {
    const summaries: ABTestSummary[] = [];

    for (const variant of this.test.variants) {
      const variantResults = this.test.results.filter(
        (r) => r.variantName === variant.name
      );

      if (variantResults.length === 0) continue;

      const avgScore =
        variantResults.reduce((s, r) => s + r.score, 0) / variantResults.length;
      const avgTokens =
        variantResults.reduce((s, r) => s + r.inputTokens + r.outputTokens, 0) /
        variantResults.length;
      const avgLatencyMs =
        variantResults.reduce((s, r) => s + r.latencyMs, 0) / variantResults.length;

      // Custo Haiku: $0.25/M input, $1.25/M output
      const totalCost = variantResults.reduce((s, r) => {
        return s + (r.inputTokens / 1_000_000) * 0.25 + (r.outputTokens / 1_000_000) * 1.25;
      }, 0);

      summaries.push({
        variantName: variant.name,
        avgScore,
        avgTokens: Math.round(avgTokens),
        avgLatencyMs: Math.round(avgLatencyMs),
        totalCost,
        wins: 0, // calculado depois
      });
    }

    // Calcular wins: para cada input, qual variante teve melhor score
    const inputs = [...new Set(this.test.results.map((r) => r.input))];
    for (const input of inputs) {
      const inputResults = this.test.results.filter((r) => r.input === input);
      if (inputResults.length < 2) continue;

      const best = inputResults.reduce((a, b) => (a.score > b.score ? a : b));
      const summary = summaries.find((s) => s.variantName === best.variantName);
      if (summary) summary.wins++;
    }

    return summaries;
  }

  getName(): string {
    return this.test.name;
  }
}

// === 2 Variantes de prompt para resumo de textos ===

const varianteA: PromptVariant = {
  name: 'Direto',
  systemPrompt: 'Voce e um assistente que resume textos tecnicos de forma concisa. Responda em portugues.',
  userPromptTemplate: 'Resuma o texto abaixo em 2-3 frases claras e objetivas:\n\n{{INPUT}}',
};

const varianteB: PromptVariant = {
  name: 'Estruturado',
  systemPrompt: `Voce e um especialista em comunicacao tecnica. Ao resumir textos:
1. Identifique o topico principal
2. Extraia os pontos-chave mais importantes
3. Formule uma conclusao pratica

Responda em portugues, de forma estruturada.`,
  userPromptTemplate: `Analise o texto abaixo passo a passo e produza um resumo estruturado com:
- Topico principal (1 frase)
- Pontos-chave (2-3 bullet points)
- Conclusao pratica (1 frase)

Texto:
{{INPUT}}`,
};

// === Inputs de teste ===
const inputsTeste = [
  `Kubernetes e um sistema de orquestracao de containers open-source que automatiza
o deployment, scaling e gerenciamento de aplicacoes em containers. Criado pelo
Google, hoje e mantido pela CNCF. Ele usa conceitos como pods, services e
deployments para abstrair a infraestrutura subjacente.`,

  `O padrao CQRS (Command Query Responsibility Segregation) separa as operacoes
de leitura e escrita em modelos distintos. Isso permite otimizar cada lado
independentemente: queries podem usar views desnormalizadas para performance,
enquanto commands passam por validacao rigorosa e event sourcing.`,

  `WebAssembly (Wasm) e um formato binario de instrucoes para uma maquina virtual
baseada em stack. Permite executar codigo C, Rust e Go no navegador com
performance proxima ao nativo. Casos de uso incluem jogos, editores de imagem
e ferramentas de compilacao rodando inteiramente no cliente.`,

  `Observabilidade em sistemas distribuidos envolve tres pilares: logs (registros
de eventos), metricas (dados numericos ao longo do tempo) e traces (rastreamento
de requisicoes entre servicos). Ferramentas como OpenTelemetry unificam a
coleta desses sinais para facilitar debugging em arquiteturas complexas.`,

  `Transfer Learning e uma tecnica de ML onde um modelo pre-treinado em uma
tarefa ampla (como classificacao de imagens no ImageNet) e reutilizado como
ponto de partida para uma tarefa especifica. Isso reduz drasticamente o tempo
de treinamento e a quantidade de dados necessarios.`,
];

// Executar uma variante contra um input
async function runVariant(
  variant: PromptVariant,
  input: string
): Promise<{ output: string; inputTokens: number; outputTokens: number; latencyMs: number }> {
  const userPrompt = variant.userPromptTemplate.replace('{{INPUT}}', input);
  const inicio = Date.now();

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    temperature: 0.3,
    system: variant.systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const latencyMs = Date.now() - inicio;
  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  return {
    output: text,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    latencyMs,
  };
}

// LLM-as-Judge para pontuar cada resposta
async function julgarResposta(
  inputOriginal: string,
  resumo: string
): Promise<{ score: number; justificativa: string }> {
  const judgePrompt = `Voce e um avaliador de qualidade de resumos tecnicos.
Avalie o resumo abaixo de 0 a 10 considerando:
- Fidelidade ao texto original
- Clareza e concisao
- Cobertura dos pontos importantes
- Utilidade pratica do resumo

Retorne APENAS um JSON valido:
{
  "score": 0,
  "justificativa": "breve explicacao da nota em 1 frase"
}

Texto original:
${inputOriginal}

Resumo a avaliar:
${resumo}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    temperature: 0,
    messages: [{ role: 'user', content: judgePrompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return JSON.parse(text);
}

// Executar A/B Test completo
async function executarABTest() {
  console.log('=== A/B Testing de Prompts (Capstone) ===\n');

  const runner = new ABTestRunner('Resumo Tecnico: Direto vs Estruturado');
  runner.addVariant(varianteA);
  runner.addVariant(varianteB);

  const variants = [varianteA, varianteB];

  // Executar todas as variantes contra todos os inputs
  for (let i = 0; i < inputsTeste.length; i++) {
    const input = inputsTeste[i];
    const inputCurto = input.slice(0, 50).trim() + '...';
    console.log(`\nInput ${i + 1}: "${inputCurto}"`);

    for (const variant of variants) {
      console.log(`  Executando variante "${variant.name}"...`);
      const { output, inputTokens, outputTokens, latencyMs } = await runVariant(variant, input);

      console.log(`  Avaliando com juiz...`);
      const { score, justificativa } = await julgarResposta(input, output);

      runner.addResult({
        variantName: variant.name,
        input,
        output,
        inputTokens,
        outputTokens,
        latencyMs,
        score,
        judgeJustificativa: justificativa,
      });

      console.log(`  -> Score: ${score}/10 | ${inputTokens + outputTokens} tokens | ${latencyMs}ms`);
    }
  }

  // Relatorio detalhado por input
  console.log('\n=== Resultados por Input ===');
  const results = runner.getResults();

  for (let i = 0; i < inputsTeste.length; i++) {
    const input = inputsTeste[i];
    const inputCurto = input.slice(0, 55).trim() + '...';
    console.log(`\n--- Input ${i + 1}: "${inputCurto}" ---`);

    const inputResults = results.filter((r) => r.input === input);
    for (const r of inputResults) {
      console.log(`  [${r.variantName}] Score: ${r.score}/10`);
      console.log(`    Juiz: ${r.judgeJustificativa}`);
    }
  }

  // Tabela resumo estatistico
  const summaries = runner.getSummary();

  console.log('\n=== Resumo Estatistico ===');
  console.log(
    'Variante'.padEnd(16) +
      'Avg Score'.padEnd(12) +
      'Avg Tokens'.padEnd(13) +
      'Avg Latencia'.padEnd(15) +
      'Custo Total'.padEnd(14) +
      'Wins'
  );
  console.log('-'.repeat(72));

  for (const s of summaries) {
    console.log(
      s.variantName.padEnd(16) +
        s.avgScore.toFixed(1).padEnd(12) +
        String(s.avgTokens).padEnd(13) +
        `${s.avgLatencyMs}ms`.padEnd(15) +
        `$${s.totalCost.toFixed(6)}`.padEnd(14) +
        String(s.wins)
    );
  }

  // Declarar vencedor
  const winner = summaries.reduce((a, b) => (a.avgScore > b.avgScore ? a : b));
  const runnerUp = summaries.find((s) => s.variantName !== winner.variantName)!;
  const diff = ((winner.avgScore - runnerUp.avgScore) / runnerUp.avgScore * 100).toFixed(1);

  console.log(`\n=== Vencedor: "${winner.variantName}" ===`);
  console.log(`Score medio: ${winner.avgScore.toFixed(1)} vs ${runnerUp.avgScore.toFixed(1)} (+${diff}%)`);
  console.log(`Wins: ${winner.wins} de ${inputsTeste.length} inputs`);
  console.log(`Custo: $${winner.totalCost.toFixed(6)} vs $${runnerUp.totalCost.toFixed(6)}`);

  if (winner.totalCost > runnerUp.totalCost) {
    const custoDiff = ((winner.totalCost - runnerUp.totalCost) / runnerUp.totalCost * 100).toFixed(1);
    console.log(`Nota: "${winner.variantName}" custa ${custoDiff}% mais. Avalie o trade-off qualidade vs custo.`);
  }
}

executarABTest().then(() => {
  console.log('\n--- Exercicio 20 completo! ---');
});
