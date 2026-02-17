/**
 * Solution 2: Comparing Models
 *
 * Compare Haiku vs Sonnet: same question, different models.
 * Run: npx tsx solutions/ex2-modelos-comparacao.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const productDescription = `
Premium Tech Wear T-Shirt - Made with smart fabric that regulates body temperature.
Features UV50+ protection, is stain-resistant, and has ultra-fast drying.
Ideal for tech professionals who value comfort and practicality in daily life.
Available in 5 colors. Sizes S to XL.
`;

const translationPrompt = `Translate the following product description from English to professional French, maintaining the marketing tone:\n\n${productDescription}`;

// Model configuration
const models = [
  {
    id: 'claude-haiku-4-5-20251001' as const,
    name: 'Haiku 4.5',
    inputCost: 0.25,
    outputCost: 1.25,
  },
  {
    id: 'claude-sonnet-4-5-20250929' as const,
    name: 'Sonnet 4.5',
    inputCost: 3,
    outputCost: 15,
  },
];

interface ModelResult {
  name: string;
  text: string;
  inputTokens: number;
  outputTokens: number;
  costInput: number;
  costOutput: number;
  costTotal: number;
}

const results: ModelResult[] = [];

console.log('=== Comparison: Haiku vs Sonnet ===');
console.log(`Task: Translate product description EN -> FR\n`);

for (const model of models) {
  const start = Date.now();

  const response = await client.messages.create({
    model: model.id,
    max_tokens: 500,
    messages: [{ role: 'user', content: translationPrompt }],
  });

  const duration = Date.now() - start;

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';

  const costInput =
    (response.usage.input_tokens / 1_000_000) * model.inputCost;
  const costOutput =
    (response.usage.output_tokens / 1_000_000) * model.outputCost;
  const costTotal = costInput + costOutput;

  results.push({
    name: model.name,
    text,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    costInput,
    costOutput,
    costTotal,
  });

  console.log(`--- ${model.name} ---`);
  console.log(`Translation:\n${text}\n`);
  console.log(`Response time: ${duration}ms`);
  console.log(
    `Tokens: input=${response.usage.input_tokens}, output=${response.usage.output_tokens}`
  );
  console.log(`Cost: $${costTotal.toFixed(6)}`);
  console.log('');
}

// Comparison table
console.log('=== Comparison Table ===');
console.log(
  `${'Metric'.padEnd(25)} | ${'Haiku 4.5'.padEnd(15)} | ${'Sonnet 4.5'.padEnd(15)}`
);
console.log('-'.repeat(60));

const [haiku, sonnet] = results;

console.log(
  `${'Input Tokens'.padEnd(25)} | ${String(haiku.inputTokens).padEnd(15)} | ${String(sonnet.inputTokens).padEnd(15)}`
);
console.log(
  `${'Output Tokens'.padEnd(25)} | ${String(haiku.outputTokens).padEnd(15)} | ${String(sonnet.outputTokens).padEnd(15)}`
);
console.log(
  `${'Input Cost'.padEnd(25)} | ${'$' + haiku.costInput.toFixed(6).padEnd(14)} | ${'$' + sonnet.costInput.toFixed(6).padEnd(14)}`
);
console.log(
  `${'Output Cost'.padEnd(25)} | ${'$' + haiku.costOutput.toFixed(6).padEnd(14)} | ${'$' + sonnet.costOutput.toFixed(6).padEnd(14)}`
);
console.log(
  `${'Total Cost'.padEnd(25)} | ${'$' + haiku.costTotal.toFixed(6).padEnd(14)} | ${'$' + sonnet.costTotal.toFixed(6).padEnd(14)}`
);

const costFactor = sonnet.costTotal / haiku.costTotal;
console.log(
  `\nSonnet costs ${costFactor.toFixed(1)}x more than Haiku for this task.`
);
console.log(
  'Compare the translation quality above to decide if the extra cost is worth it.'
);

console.log('\n--- Exercise 2 complete! ---');
