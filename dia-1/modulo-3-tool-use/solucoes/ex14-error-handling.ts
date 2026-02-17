/**
 * Solucao 14: Error Handling em Tool Use
 *
 * Retries, timeouts e degradacao graceful.
 * Execute: npx tsx solucoes/ex14-error-handling.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const precos: Record<string, number> = {
  laptop: 4500,
  mouse: 89,
  teclado: 250,
  monitor: 1800,
  headset: 350,
};

const tools: Anthropic.Tool[] = [
  {
    name: 'buscar_preco',
    description:
      'Busca o preco de um produto no catalogo. Pode falhar temporariamente.',
    input_schema: {
      type: 'object' as const,
      properties: {
        produto: { type: 'string', description: 'Nome do produto' },
      },
      required: ['produto'],
    },
  },
  {
    name: 'buscar_estoque',
    description:
      'Busca quantidade em estoque. Operacao lenta que pode dar timeout.',
    input_schema: {
      type: 'object' as const,
      properties: {
        produto: { type: 'string', description: 'Nome do produto' },
      },
      required: ['produto'],
    },
  },
];

// Simula falhas intermitentes (50% chance)
function buscarPrecoUnsafe(produto: string): string {
  if (Math.random() < 0.5) {
    throw new Error('Servico temporariamente indisponivel');
  }
  const preco = precos[produto.toLowerCase()];
  if (preco === undefined) return JSON.stringify({ erro: 'Produto nao encontrado' });
  return JSON.stringify({ produto, preco });
}

// Simula operacao lenta (0-5 segundos)
async function buscarEstoqueSlow(produto: string): Promise<string> {
  const delay = Math.random() * 5000;
  await new Promise((resolve) => setTimeout(resolve, delay));
  const estoque = Math.floor(Math.random() * 100);
  return JSON.stringify({ produto, estoque, delay: `${(delay / 1000).toFixed(1)}s` });
}

// Retry wrapper
async function withRetry<T>(
  fn: () => T | Promise<T>,
  maxRetries = 3,
  label = ''
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`  [Retry ${attempt}/${maxRetries}${label ? ` - ${label}` : ''}: ${message}]`);
      if (attempt === maxRetries) {
        throw new Error(`Falhou apos ${maxRetries} tentativas: ${message}`);
      }
    }
  }
  throw new Error('Unreachable');
}

// Timeout wrapper
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout apos ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

async function handleTool(
  name: string,
  input: Record<string, unknown>
): Promise<{ content: string; isError: boolean }> {
  const produto = input.produto as string;

  try {
    switch (name) {
      case 'buscar_preco': {
        const result = await withRetry(
          () => buscarPrecoUnsafe(produto),
          3,
          produto
        );
        return { content: result, isError: false };
      }
      case 'buscar_estoque': {
        const result = await withTimeout(buscarEstoqueSlow(produto), 3000);
        return { content: result, isError: false };
      }
      default:
        return { content: `Tool desconhecida: ${name}`, isError: true };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`  [Erro final: ${message}]`);
    return { content: `Erro: ${message}`, isError: true };
  }
}

async function runToolLoop(question: string): Promise<void> {
  console.log(`\nPergunta: "${question}"\n`);

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  let continueLoop = true;

  while (continueLoop) {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools,
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [Tool: ${block.name}(${JSON.stringify(block.input)})]`);
        const { content, isError } = await handleTool(
          block.name,
          block.input as Record<string, unknown>
        );
        console.log(`  [${isError ? 'ERRO' : 'OK'}: ${content}]`);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content,
          is_error: isError,
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
  'Busque o preco e a disponibilidade em estoque do laptop, mouse e teclado.'
);

console.log('\n--- Exercicio 14 completo! ---');
