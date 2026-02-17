/**
 * Solucao 16: Tool Use com Consciencia de Custo
 *
 * CostTracker para monitorar tokens e custos em tempo real.
 * Execute: npx tsx solucoes/ex16-tool-cost-aware.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Precos por 1M tokens (Claude Haiku) ===
const PRECO_INPUT_POR_MILHAO = 1.0;
const PRECO_OUTPUT_POR_MILHAO = 5.0;

// === CostTracker ===

class CostTracker {
  private chamadas: Array<{
    iteracao: number;
    inputTokens: number;
    outputTokens: number;
    custoInput: number;
    custoOutput: number;
    toolsChamadas: string[];
  }> = [];
  private budgetMaximo: number;

  constructor(budgetMaximo: number = 0.10) {
    this.budgetMaximo = budgetMaximo;
  }

  registrar(response: Anthropic.Message, toolsChamadas: string[] = []): void {
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const custoInput = (inputTokens / 1_000_000) * PRECO_INPUT_POR_MILHAO;
    const custoOutput = (outputTokens / 1_000_000) * PRECO_OUTPUT_POR_MILHAO;

    this.chamadas.push({
      iteracao: this.chamadas.length + 1,
      inputTokens,
      outputTokens,
      custoInput,
      custoOutput,
      toolsChamadas,
    });

    console.log(
      `  [Custo iteracao ${this.chamadas.length}: ` +
      `${inputTokens} in + ${outputTokens} out = ` +
      `$${(custoInput + custoOutput).toFixed(6)} | ` +
      `Acumulado: $${this.getCustoTotal().toFixed(6)}]`
    );
  }

  getCustoTotal(): number {
    return this.chamadas.reduce((sum, c) => sum + c.custoInput + c.custoOutput, 0);
  }

  getTokensTotal(): { input: number; output: number } {
    return {
      input: this.chamadas.reduce((sum, c) => sum + c.inputTokens, 0),
      output: this.chamadas.reduce((sum, c) => sum + c.outputTokens, 0),
    };
  }

  getTotalChamadas(): number {
    return this.chamadas.length;
  }

  excedeuBudget(): boolean {
    return this.getCustoTotal() >= this.budgetMaximo;
  }

  resumo(): string {
    const tokens = this.getTokensTotal();
    const custoTotal = this.getCustoTotal();

    const linhas = [
      '\n=== Resumo de Custos ===',
      `Chamadas a API: ${this.chamadas.length}`,
      `Tokens de input: ${tokens.input.toLocaleString()}`,
      `Tokens de output: ${tokens.output.toLocaleString()}`,
      `Total de tokens: ${(tokens.input + tokens.output).toLocaleString()}`,
      `Custo total: $${custoTotal.toFixed(6)}`,
      `Budget maximo: $${this.budgetMaximo.toFixed(6)}`,
      `Uso do budget: ${((custoTotal / this.budgetMaximo) * 100).toFixed(1)}%`,
      '',
      'Detalhamento por iteracao:',
    ];

    for (const c of this.chamadas) {
      linhas.push(
        `  #${c.iteracao}: ${c.inputTokens} in + ${c.outputTokens} out = ` +
        `$${(c.custoInput + c.custoOutput).toFixed(6)}` +
        (c.toolsChamadas.length > 0 ? ` [tools: ${c.toolsChamadas.join(', ')}]` : '')
      );
    }

    return linhas.join('\n');
  }
}

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'buscar_dados',
    description: 'Busca dados de uma tabela. Retorna registros filtrados.',
    input_schema: {
      type: 'object' as const,
      properties: {
        tabela: { type: 'string', description: 'Nome da tabela: usuarios, vendas, produtos' },
        filtro: { type: 'string', description: 'Filtro opcional' },
      },
      required: ['tabela'],
    },
  },
  {
    name: 'calcular_estatisticas',
    description: 'Calcula estatisticas (media, soma, max, min) de um conjunto de dados.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dados: { type: 'array', items: { type: 'number' }, description: 'Array de numeros' },
        operacao: { type: 'string', enum: ['media', 'soma', 'max', 'min'], description: 'Operacao' },
      },
      required: ['dados', 'operacao'],
    },
  },
  {
    name: 'formatar_relatorio',
    description: 'Formata dados em um relatorio textual estruturado.',
    input_schema: {
      type: 'object' as const,
      properties: {
        titulo: { type: 'string', description: 'Titulo do relatorio' },
        dados: { type: 'object', description: 'Dados para o relatorio' },
      },
      required: ['titulo', 'dados'],
    },
  },
];

// === Handlers ===

const tabelasDB: Record<string, unknown[]> = {
  usuarios: [
    { nome: 'Ana', plano: 'Pro', gasto: 299 },
    { nome: 'Carlos', plano: 'Enterprise', gasto: 999 },
    { nome: 'Julia', plano: 'Starter', gasto: 49 },
    { nome: 'Pedro', plano: 'Pro', gasto: 299 },
  ],
  vendas: [
    { mes: 'Jan', valor: 15000 },
    { mes: 'Fev', valor: 18500 },
    { mes: 'Mar', valor: 22000 },
  ],
  produtos: [
    { nome: 'Plano Starter', preco: 49, clientes: 350 },
    { nome: 'Plano Pro', preco: 299, clientes: 120 },
    { nome: 'Plano Enterprise', preco: 999, clientes: 45 },
  ],
};

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'buscar_dados': {
      const tabela = tabelasDB[input.tabela as string];
      if (!tabela) return JSON.stringify({ erro: `Tabela "${input.tabela}" nao encontrada` });
      return JSON.stringify(tabela);
    }
    case 'calcular_estatisticas': {
      const dados = input.dados as number[];
      const op = input.operacao as string;
      const ops: Record<string, (d: number[]) => number> = {
        media: (d) => d.reduce((a, b) => a + b, 0) / d.length,
        soma: (d) => d.reduce((a, b) => a + b, 0),
        max: (d) => Math.max(...d),
        min: (d) => Math.min(...d),
      };
      const fn = ops[op];
      if (!fn) return JSON.stringify({ erro: `Operacao "${op}" invalida` });
      return JSON.stringify({ operacao: op, resultado: fn(dados) });
    }
    case 'formatar_relatorio':
      return JSON.stringify({
        relatorio: `=== ${input.titulo} ===\n${JSON.stringify(input.dados, null, 2)}`,
      });
    default:
      return `Tool desconhecida: ${name}`;
  }
}

// === Loop de tool use com Cost Tracking ===

async function runComCostTracking(
  question: string,
  budget: number
): Promise<void> {
  console.log(`\nPergunta: "${question}"`);
  console.log(`Budget maximo: $${budget.toFixed(4)}\n`);

  const tracker = new CostTracker(budget);
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

    // Coleta nomes das tools chamadas
    const toolNames = response.content
      .filter((b) => b.type === 'tool_use')
      .map((b) => (b as Anthropic.ToolUseBlock).name);

    tracker.registrar(response, toolNames);

    if (tracker.excedeuBudget()) {
      console.log('\n  *** BUDGET EXCEDIDO — interrompendo loop ***');
      // Envia resposta parcial para Claude finalizar
      const textoBlocks = response.content.filter((b) => b.type === 'text');
      if (textoBlocks.length > 0) {
        console.log(`Claude: ${(textoBlocks[0] as Anthropic.TextBlock).text}`);
      }
      break;
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [Tool: ${block.name}]`);
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
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

  console.log(tracker.resumo());
}

// === Testes ===

await runComCostTracking(
  'Busque os dados de vendas, calcule a media dos valores e formate um relatorio com o resultado.',
  0.05
);

console.log('\n--- Exercicio 16 completo! ---');
