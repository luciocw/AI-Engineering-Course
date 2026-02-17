/**
 * Solucao 8: Tools com Templates de Resultado
 *
 * Templates formatam resultados para Claude interpretar melhor.
 * Execute: npx tsx solucoes/ex8-tool-com-templates.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Dados simulados ===

const usuariosDB: Record<string, {
  nome: string;
  email: string;
  plano: string;
  ativo: boolean;
  criadoEm: string;
}> = {
  'joao@empresa.com': {
    nome: 'Joao Silva',
    email: 'joao@empresa.com',
    plano: 'Pro',
    ativo: true,
    criadoEm: '2025-03-15',
  },
  'maria@empresa.com': {
    nome: 'Maria Santos',
    email: 'maria@empresa.com',
    plano: 'Enterprise',
    ativo: true,
    criadoEm: '2024-11-01',
  },
};

const produtosDB: Record<string, Array<{
  nome: string;
  preco: number;
  estoque: number;
}>> = {
  eletronicos: [
    { nome: 'Notebook Pro 15"', preco: 5499, estoque: 23 },
    { nome: 'Mouse Wireless', preco: 149, estoque: 156 },
    { nome: 'Teclado Mecanico', preco: 399, estoque: 45 },
    { nome: 'Monitor 27" 4K', preco: 2899, estoque: 12 },
  ],
  livros: [
    { nome: 'Clean Code', preco: 89, estoque: 200 },
    { nome: 'Design Patterns', preco: 120, estoque: 85 },
  ],
};

// === Templates ===

function templateUsuario(usuario: {
  nome: string;
  email: string;
  plano: string;
  ativo: boolean;
  criadoEm: string;
}): string {
  return `
=== Perfil do Usuario ===
Nome: ${usuario.nome}
Email: ${usuario.email}
Plano: ${usuario.plano}
Status: ${usuario.ativo ? 'Ativo' : 'Inativo'}
Membro desde: ${usuario.criadoEm}
  `.trim();
}

function templateListaProdutos(
  categoria: string,
  produtos: Array<{ nome: string; preco: number; estoque: number }>
): string {
  const linhas = produtos.map(
    (p) => `  - ${p.nome.padEnd(25)} R$ ${p.preco.toFixed(2).padStart(10)}   Estoque: ${String(p.estoque).padStart(4)}`
  );
  const valorTotal = produtos.reduce((sum, p) => sum + p.preco * p.estoque, 0);
  const totalItens = produtos.reduce((sum, p) => sum + p.estoque, 0);

  return `
=== Produtos: ${categoria.charAt(0).toUpperCase() + categoria.slice(1)} ===
${linhas.join('\n')}

Resumo: ${produtos.length} produtos | ${totalItens} unidades em estoque | Valor total: R$ ${valorTotal.toFixed(2)}
  `.trim();
}

function templateRelatorio(dados: {
  titulo: string;
  periodo: string;
  metricas: Record<string, number>;
  observacoes: string[];
}): string {
  const linhasMetricas = Object.entries(dados.metricas)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n');
  const linhasObs = dados.observacoes.map((o) => `  - ${o}`).join('\n');

  return `
=== ${dados.titulo} ===
Periodo: ${dados.periodo}

Metricas:
${linhasMetricas}

Observacoes:
${linhasObs}
  `.trim();
}

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'buscar_usuario',
    description:
      'Busca o perfil completo de um usuario pelo email. Retorna nome, plano, status e data de criacao.',
    input_schema: {
      type: 'object' as const,
      properties: {
        email: {
          type: 'string',
          description: 'Email do usuario. Exemplo: joao@empresa.com',
        },
      },
      required: ['email'],
    },
  },
  {
    name: 'listar_produtos',
    description:
      'Lista todos os produtos de uma categoria com preco e estoque. Retorna tabela formatada.',
    input_schema: {
      type: 'object' as const,
      properties: {
        categoria: {
          type: 'string',
          description: 'Categoria dos produtos. Opcoes: eletronicos, livros',
        },
      },
      required: ['categoria'],
    },
  },
  {
    name: 'gerar_relatorio_mensal',
    description:
      'Gera relatorio de metricas de um mes especifico. Retorna metricas e observacoes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        mes: {
          type: 'string',
          description: 'Mes no formato YYYY-MM. Exemplo: 2026-01',
        },
      },
      required: ['mes'],
    },
  },
];

// === Handlers com templates ===

function handleBuscarUsuario(input: { email: string }): string {
  const usuario = usuariosDB[input.email];
  if (!usuario) return `Usuario com email "${input.email}" nao encontrado.`;
  return templateUsuario(usuario);
}

function handleListarProdutos(input: { categoria: string }): string {
  const produtos = produtosDB[input.categoria.toLowerCase()];
  if (!produtos) return `Categoria "${input.categoria}" nao encontrada. Categorias disponiveis: ${Object.keys(produtosDB).join(', ')}`;
  return templateListaProdutos(input.categoria, produtos);
}

function handleRelatorioMensal(input: { mes: string }): string {
  // Simulacao de metricas
  return templateRelatorio({
    titulo: `Relatorio Mensal`,
    periodo: input.mes,
    metricas: {
      'Usuarios ativos': 1250,
      'Novos cadastros': 89,
      'Receita (R$)': 45600,
      'Ticket medio (R$)': 365,
      'Taxa de churn (%)': 2.3,
    },
    observacoes: [
      'Crescimento de 12% em novos cadastros vs mes anterior',
      'Receita acima da meta de R$ 40.000',
      'Churn estavel e dentro do esperado',
    ],
  });
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'buscar_usuario':
      return handleBuscarUsuario(input as { email: string });
    case 'listar_produtos':
      return handleListarProdutos(input as { categoria: string });
    case 'gerar_relatorio_mensal':
      return handleRelatorioMensal(input as { mes: string });
    default:
      return `Tool desconhecida: ${name}`;
  }
}

// === Loop de tool use ===

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
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
        console.log(`  [Resultado formatado:]\n${result}\n`);
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
  'Busque o perfil do usuario joao@empresa.com, liste os produtos de eletronicos e gere o relatorio de janeiro 2026.'
);

console.log('\n--- Exercicio 8 completo! ---');
