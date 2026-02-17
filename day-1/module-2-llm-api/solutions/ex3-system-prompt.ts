/**
 * Solution 3: System Prompts and Personas
 *
 * 3 different personas answer the same question.
 * Run: npx tsx solutions/ex3-system-prompt.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const question = 'How does a vector database work?';

const personas: Record<string, string> = {
  'Code Reviewer':
    'You are a senior code reviewer with 15 years of experience. Be technical, critical, and direct. Use technical terms without simplifying. Point out trade-offs and performance issues.',
  Professor:
    'You are a patient and didactic university professor. Explain using everyday analogies. Break complex concepts into simple parts. Use concrete examples.',
  'Technical Writer':
    'You are a technical writer specialized in documentation. Be concise and structured. Use bullet points and clear sections. Maximum 150 words.',
};

async function askWithPersona(
  system: string,
  question: string
): Promise<{ text: string; tokens: { input: number; output: number } }> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system,
    messages: [{ role: 'user', content: question }],
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';

  return {
    text,
    tokens: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
  };
}

console.log(`Question: "${question}"\n`);

for (const [name, system] of Object.entries(personas)) {
  const result = await askWithPersona(system, question);
  console.log(`=== Persona: ${name} ===`);
  console.log(result.text);
  console.log(
    `\n[Tokens: input=${result.tokens.input}, output=${result.tokens.output}]`
  );
  console.log('');
}

console.log('\n--- Exercise 3 complete! ---');
