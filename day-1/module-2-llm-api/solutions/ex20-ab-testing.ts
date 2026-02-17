/**
 * Solution 20: A/B Testing for Prompts (Capstone)
 *
 * Complete A/B testing framework for optimizing prompts.
 * Combines chaining, routing, cost tracking, LLM-as-judge, and versioning.
 * Run: npx tsx solutions/ex20-ab-testing.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Types ===

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
  judgeJustification: string;
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

// === ABTestRunner Class ===

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

      // Cost Haiku: $0.25/M input, $1.25/M output
      const totalCost = variantResults.reduce((s, r) => {
        return s + (r.inputTokens / 1_000_000) * 0.25 + (r.outputTokens / 1_000_000) * 1.25;
      }, 0);

      summaries.push({
        variantName: variant.name,
        avgScore,
        avgTokens: Math.round(avgTokens),
        avgLatencyMs: Math.round(avgLatencyMs),
        totalCost,
        wins: 0, // calculated later
      });
    }

    // Calculate wins: for each input, which variant had the best score
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

// === 2 Prompt variants for text summarization ===

const variantA: PromptVariant = {
  name: 'Direct',
  systemPrompt: 'You are an assistant that summarizes technical texts concisely.',
  userPromptTemplate: 'Summarize the text below in 2-3 clear and objective sentences:\n\n{{INPUT}}',
};

const variantB: PromptVariant = {
  name: 'Structured',
  systemPrompt: `You are a specialist in technical communication. When summarizing texts:
1. Identify the main topic
2. Extract the most important key points
3. Formulate a practical conclusion

Respond in a structured way.`,
  userPromptTemplate: `Analyze the text below step by step and produce a structured summary with:
- Main topic (1 sentence)
- Key points (2-3 bullet points)
- Practical conclusion (1 sentence)

Text:
{{INPUT}}`,
};

// === Test inputs ===
const testInputs = [
  `Kubernetes is an open-source container orchestration system that automates
the deployment, scaling, and management of containerized applications. Created by
Google, it is now maintained by the CNCF. It uses concepts like pods, services, and
deployments to abstract the underlying infrastructure.`,

  `The CQRS (Command Query Responsibility Segregation) pattern separates read
and write operations into distinct models. This allows optimizing each side
independently: queries can use denormalized views for performance,
while commands go through rigorous validation and event sourcing.`,

  `WebAssembly (Wasm) is a binary instruction format for a stack-based virtual
machine. It allows running C, Rust, and Go code in the browser with
near-native performance. Use cases include games, image editors,
and compilation tools running entirely on the client.`,

  `Observability in distributed systems involves three pillars: logs (event
records), metrics (numerical data over time), and traces (request tracing
between services). Tools like OpenTelemetry unify the collection of these
signals to facilitate debugging in complex architectures.`,

  `Transfer Learning is an ML technique where a model pre-trained on a
broad task (like image classification on ImageNet) is reused as a
starting point for a specific task. This drastically reduces training
time and the amount of data needed.`,
];

// Execute a variant against an input
async function runVariant(
  variant: PromptVariant,
  input: string
): Promise<{ output: string; inputTokens: number; outputTokens: number; latencyMs: number }> {
  const userPrompt = variant.userPromptTemplate.replace('{{INPUT}}', input);
  const start = Date.now();

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    temperature: 0.3,
    system: variant.systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const latencyMs = Date.now() - start;
  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  return {
    output: text,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    latencyMs,
  };
}

// LLM-as-Judge to score each response
async function judgeResponse(
  originalInput: string,
  summary: string
): Promise<{ score: number; justification: string }> {
  const judgePrompt = `You are a quality evaluator of technical summaries.
Evaluate the summary below from 0 to 10 considering:
- Faithfulness to the original text
- Clarity and conciseness
- Coverage of important points
- Practical utility of the summary

Return ONLY valid JSON:
{
  "score": 0,
  "justification": "brief explanation of the score in 1 sentence"
}

Original text:
${originalInput}

Summary to evaluate:
${summary}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    temperature: 0,
    messages: [{ role: 'user', content: judgePrompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return JSON.parse(text);
}

// Execute full A/B Test
async function executeABTest() {
  console.log('=== A/B Testing for Prompts (Capstone) ===\n');

  const runner = new ABTestRunner('Technical Summary: Direct vs Structured');
  runner.addVariant(variantA);
  runner.addVariant(variantB);

  const variants = [variantA, variantB];

  // Execute all variants against all inputs
  for (let i = 0; i < testInputs.length; i++) {
    const input = testInputs[i];
    const inputShort = input.slice(0, 50).trim() + '...';
    console.log(`\nInput ${i + 1}: "${inputShort}"`);

    for (const variant of variants) {
      console.log(`  Running variant "${variant.name}"...`);
      const { output, inputTokens, outputTokens, latencyMs } = await runVariant(variant, input);

      console.log(`  Evaluating with judge...`);
      const { score, justification } = await judgeResponse(input, output);

      runner.addResult({
        variantName: variant.name,
        input,
        output,
        inputTokens,
        outputTokens,
        latencyMs,
        score,
        judgeJustification: justification,
      });

      console.log(`  -> Score: ${score}/10 | ${inputTokens + outputTokens} tokens | ${latencyMs}ms`);
    }
  }

  // Detailed report by input
  console.log('\n=== Results by Input ===');
  const results = runner.getResults();

  for (let i = 0; i < testInputs.length; i++) {
    const input = testInputs[i];
    const inputShort = input.slice(0, 55).trim() + '...';
    console.log(`\n--- Input ${i + 1}: "${inputShort}" ---`);

    const inputResults = results.filter((r) => r.input === input);
    for (const r of inputResults) {
      console.log(`  [${r.variantName}] Score: ${r.score}/10`);
      console.log(`    Judge: ${r.judgeJustification}`);
    }
  }

  // Statistical summary table
  const summaries = runner.getSummary();

  console.log('\n=== Statistical Summary ===');
  console.log(
    'Variant'.padEnd(16) +
      'Avg Score'.padEnd(12) +
      'Avg Tokens'.padEnd(13) +
      'Avg Latency'.padEnd(15) +
      'Total Cost'.padEnd(14) +
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

  // Declare winner
  const winner = summaries.reduce((a, b) => (a.avgScore > b.avgScore ? a : b));
  const runnerUp = summaries.find((s) => s.variantName !== winner.variantName)!;
  const diff = ((winner.avgScore - runnerUp.avgScore) / runnerUp.avgScore * 100).toFixed(1);

  console.log(`\n=== Winner: "${winner.variantName}" ===`);
  console.log(`Average score: ${winner.avgScore.toFixed(1)} vs ${runnerUp.avgScore.toFixed(1)} (+${diff}%)`);
  console.log(`Wins: ${winner.wins} of ${testInputs.length} inputs`);
  console.log(`Cost: $${winner.totalCost.toFixed(6)} vs $${runnerUp.totalCost.toFixed(6)}`);

  if (winner.totalCost > runnerUp.totalCost) {
    const costDiff = ((winner.totalCost - runnerUp.totalCost) / runnerUp.totalCost * 100).toFixed(1);
    console.log(`Note: "${winner.variantName}" costs ${costDiff}% more. Evaluate the quality vs cost trade-off.`);
  }
}

executeABTest().then(() => {
  console.log('\n--- Exercise 20 complete! ---');
});
