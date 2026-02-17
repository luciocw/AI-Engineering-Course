/**
 * Solucao 5: Validacao de Inputs com Zod
 *
 * Validacao manual de inputs antes de processar tools.
 * Execute: npx tsx solucoes/ex5-tool-validation.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Funcoes de validacao ===

function validarCriarUsuario(input: unknown): {
  valido: boolean;
  dados?: { nome: string; email: string; idade: number };
  erro?: string;
} {
  if (typeof input !== 'object' || input === null) {
    return { valido: false, erro: 'Input deve ser um objeto' };
  }
  const obj = input as Record<string, unknown>;

  // Valida nome
  if (typeof obj.nome !== 'string' || obj.nome.length < 2) {
    return { valido: false, erro: 'nome deve ser string com pelo menos 2 caracteres' };
  }

  // Valida email
  if (typeof obj.email !== 'string' || !obj.email.includes('@')) {
    return { valido: false, erro: 'email deve ser string valida contendo @' };
  }

  // Valida idade
  if (typeof obj.idade !== 'number' || obj.idade < 0 || obj.idade > 150) {
    return { valido: false, erro: 'idade deve ser numero entre 0 e 150' };
  }

  return {
    valido: true,
    dados: { nome: obj.nome, email: obj.email, idade: obj.idade },
  };
}

function validarBuscarProdutos(input: unknown): {
  valido: boolean;
  dados?: { categoria: string; preco_max?: number; ordenar?: 'preco' | 'nome' | 'avaliacao' };
  erro?: string;
} {
  if (typeof input !== 'object' || input === null) {
    return { valido: false, erro: 'Input deve ser um objeto' };
  }
  const obj = input as Record<string, unknown>;

  // Valida categoria (obrigatorio)
  if (typeof obj.categoria !== 'string' || obj.categoria.length === 0) {
    return { valido: false, erro: 'categoria e obrigatoria e deve ser string nao vazia' };
  }

  // Valida preco_max (opcional)
  if (obj.preco_max !== undefined) {
    if (typeof obj.preco_max !== 'number' || obj.preco_max <= 0) {
      return { valido: false, erro: 'preco_max deve ser numero positivo' };
    }
  }

  // Valida ordenar (opcional)
  const ordenarValidos = ['preco', 'nome', 'avaliacao'];
  if (obj.ordenar !== undefined) {
    if (typeof obj.ordenar !== 'string' || !ordenarValidos.includes(obj.ordenar)) {
      return { valido: false, erro: `ordenar deve ser um de: ${ordenarValidos.join(', ')}` };
    }
  }

  return {
    valido: true,
    dados: {
      categoria: obj.categoria,
      preco_max: obj.preco_max as number | undefined,
      ordenar: obj.ordenar as 'preco' | 'nome' | 'avaliacao' | undefined,
    },
  };
}

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'criar_usuario',
    description: 'Cria um novo usuario no sistema com nome, email e idade.',
    input_schema: {
      type: 'object' as const,
      properties: {
        nome: { type: 'string', description: 'Nome do usuario (minimo 2 caracteres)' },
        email: { type: 'string', description: 'Email valido do usuario' },
        idade: { type: 'number', description: 'Idade do usuario (0-150)' },
      },
      required: ['nome', 'email', 'idade'],
    },
  },
  {
    name: 'buscar_produtos',
    description: 'Busca produtos por categoria com filtros opcionais de preco e ordenacao.',
    input_schema: {
      type: 'object' as const,
      properties: {
        categoria: { type: 'string', description: 'Categoria dos produtos' },
        preco_max: { type: 'number', description: 'Preco maximo (opcional)' },
        ordenar: {
          type: 'string',
          enum: ['preco', 'nome', 'avaliacao'],
          description: 'Criterio de ordenacao (opcional)',
        },
      },
      required: ['categoria'],
    },
  },
];

// === Dados simulados ===

const produtosDB: Record<string, Array<{ nome: string; preco: number; avaliacao: number }>> = {
  eletronicos: [
    { nome: 'Smartphone X', preco: 2999, avaliacao: 4.5 },
    { nome: 'Notebook Pro', preco: 5499, avaliacao: 4.8 },
    { nome: 'Fone Bluetooth', preco: 199, avaliacao: 4.2 },
  ],
  livros: [
    { nome: 'Clean Code', preco: 89, avaliacao: 4.9 },
    { nome: 'Design Patterns', preco: 120, avaliacao: 4.7 },
  ],
};

let nextUserId = 1;

// === Dispatcher com validacao ===

function dispatchComValidacao(name: string, input: unknown): string {
  switch (name) {
    case 'criar_usuario': {
      const resultado = validarCriarUsuario(input);
      if (!resultado.valido) return `Erro de validacao: ${resultado.erro}`;
      const usuario = { id: nextUserId++, ...resultado.dados!, status: 'criado' };
      return JSON.stringify(usuario);
    }
    case 'buscar_produtos': {
      const resultado = validarBuscarProdutos(input);
      if (!resultado.valido) return `Erro de validacao: ${resultado.erro}`;
      let produtos = produtosDB[resultado.dados!.categoria] || [];
      if (resultado.dados!.preco_max) {
        produtos = produtos.filter((p) => p.preco <= resultado.dados!.preco_max!);
      }
      if (resultado.dados!.ordenar) {
        const campo = resultado.dados!.ordenar;
        produtos = [...produtos].sort((a, b) => {
          if (campo === 'nome') return a.nome.localeCompare(b.nome);
          return (a[campo] as number) - (b[campo] as number);
        });
      }
      return JSON.stringify(produtos);
    }
    default:
      return `Tool desconhecida: ${name}`;
  }
}

// === Testes de validacao ===

console.log('=== Testes de Validacao ===\n');

const testesValidacao = [
  { tool: 'criar_usuario', input: { nome: 'Ana Silva', email: 'ana@email.com', idade: 25 } },
  { tool: 'criar_usuario', input: { nome: '', email: 'invalido', idade: -5 } },
  { tool: 'criar_usuario', input: { nome: 'Jo', email: 'jo@x.com', idade: 200 } },
  { tool: 'buscar_produtos', input: { categoria: 'eletronicos', preco_max: 1000 } },
  { tool: 'buscar_produtos', input: { categoria: 'eletronicos', ordenar: 'preco' } },
  { tool: 'buscar_produtos', input: { preco_max: -10 } }, // sem categoria
  { tool: 'buscar_produtos', input: { categoria: 'livros', ordenar: 'invalido' } },
];

for (const teste of testesValidacao) {
  console.log(`${teste.tool}(${JSON.stringify(teste.input)}):`);
  console.log(`  -> ${dispatchComValidacao(teste.tool, teste.input)}\n`);
}

// === Loop de tool use com validacao ===

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
        const result = dispatchComValidacao(block.name, block.input);
        const isError = result.startsWith('Erro');
        console.log(`  [${isError ? 'ERRO' : 'OK'}: ${result}]`);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
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
  'Crie um usuario chamado Maria com email maria@teste.com e idade 30. Depois busque produtos de eletronicos ate R$500.'
);

console.log('\n--- Exercicio 5 completo! ---');
