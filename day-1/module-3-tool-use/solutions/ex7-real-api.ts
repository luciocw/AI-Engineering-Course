/**
 * Solution 7: Tool with Real API (ViaCEP)
 *
 * Tool that fetches real addresses using the ViaCEP API.
 * Run: npx tsx solutions/ex7-real-api.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const lookupZipCodeTool: Anthropic.Tool = {
  name: 'lookup_zip_code',
  description:
    'Looks up the full address from a Brazilian ZIP code (CEP). Returns street, neighborhood, city, and state.',
  input_schema: {
    type: 'object' as const,
    properties: {
      zip_code: {
        type: 'string',
        description: 'ZIP code in format 00000-000 or 00000000',
      },
    },
    required: ['zip_code'],
  },
};

async function handleLookupZipCode(input: { zip_code: string }): Promise<string> {
  const cleanZip = input.zip_code.replace(/\D/g, '');

  if (cleanZip.length !== 8) {
    return 'Invalid ZIP code: must have 8 digits';
  }

  const response = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);

  if (!response.ok) {
    return `Error querying ViaCEP: HTTP ${response.status}`;
  }

  const data = (await response.json()) as {
    erro?: boolean;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
    complemento?: string;
  };

  if (data.erro) {
    return `ZIP code ${input.zip_code} not found`;
  }

  return JSON.stringify({
    zip_code: input.zip_code,
    street: data.logradouro,
    neighborhood: data.bairro,
    city: data.localidade,
    state: data.uf,
    complement: data.complemento || '',
  });
}

async function runToolLoop(question: string): Promise<void> {
  console.log(`\nQuestion: "${question}"\n`);

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  let continueLoop = true;

  while (continueLoop) {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [lookupZipCodeTool],
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [Tool: lookup_zip_code(${JSON.stringify(block.input)})]`);
        const result = await handleLookupZipCode(block.input as { zip_code: string });
        console.log(`  [Result: ${result}]`);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });
    } else {
      continueLoop = false;
    }
  }
}

await runToolLoop(
  'What is the address for ZIP code 01001-000? And for ZIP code 20040-020?'
);

console.log('\n--- Exercise 7 complete! ---');
