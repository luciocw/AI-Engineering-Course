/**
 * Solucao 2: System Prompts e Personas
 *
 * 3 personas diferentes respondem a mesma pergunta.
 * Execute: npx tsx solucoes/ex2-system-prompt.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const pergunta = 'Como funciona um vector database?';

const personas: Record<string, string> = {
  'Code Reviewer':
    'Voce e um code reviewer senior com 15 anos de experiencia. Seja tecnico, critico e direto. Use termos tecnicos sem simplificar. Aponte trade-offs e problemas de performance.',
  Professor:
    'Voce e um professor universitario paciente e didatico. Explique usando analogias do dia-a-dia. Divida conceitos complexos em partes simples. Use exemplos concretos.',
  'Redator Tecnico':
    'Voce e um redator tecnico especializado em documentacao. Seja conciso e estruturado. Use bullet points e secoes claras. Maximo 150 palavras.',
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

console.log(`Pergunta: "${pergunta}"\n`);

for (const [nome, system] of Object.entries(personas)) {
  const resultado = await askWithPersona(system, pergunta);
  console.log(`=== Persona: ${nome} ===`);
  console.log(resultado.text);
  console.log(
    `\n[Tokens: input=${resultado.tokens.input}, output=${resultado.tokens.output}]`
  );
  console.log('');
}

console.log('\n--- Exercicio 2 completo! ---');
