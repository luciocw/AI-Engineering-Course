/**
 * Solucao 13: Prompt Engineering para Tool Use
 *
 * System prompts e tool_choice para controlar uso de tools.
 * Execute: npx tsx solucoes/ex13-tool-prompt-engineering.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Dados simulados ===

const contaDB = {
  saldo: 15780.50,
  titular: 'Carlos Mendes',
  conta: '1234-5',
};

const extratoData = [
  { data: '2026-02-15', descricao: 'Salario', valor: 8500, tipo: 'credito' },
  { data: '2026-02-14', descricao: 'Supermercado', valor: -450.30, tipo: 'debito' },
  { data: '2026-02-13', descricao: 'Netflix', valor: -55.90, tipo: 'debito' },
  { data: '2026-02-10', descricao: 'Freelance', valor: 2000, tipo: 'credito' },
  { data: '2026-02-08', descricao: 'Aluguel', valor: -2800, tipo: 'debito' },
];

const investimentosData = [
  { nome: 'Tesouro Selic', valor: 25000, rendimento: '13.25% a.a.', tipo: 'renda_fixa' },
  { nome: 'CDB Banco X', valor: 10000, rendimento: '110% CDI', tipo: 'renda_fixa' },
  { nome: 'Fundo Acoes', valor: 5000, rendimento: '-2.3% no mes', tipo: 'renda_variavel' },
];

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'consultar_saldo',
    description:
      'Consulta o saldo atual da conta corrente do usuario. Retorna saldo, titular e numero da conta.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'consultar_extrato',
    description:
      'Consulta as ultimas transacoes da conta. Retorna data, descricao, valor e tipo (credito/debito).',
    input_schema: {
      type: 'object' as const,
      properties: {
        limite: {
          type: 'number',
          description: 'Numero de transacoes a retornar (default: 5)',
        },
      },
      required: [],
    },
  },
  {
    name: 'fazer_transferencia',
    description:
      'Realiza uma transferencia bancaria. IMPORTANTE: Operacao irreversivel. Sempre confirme com o usuario antes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        destinatario: { type: 'string', description: 'Nome ou conta do destinatario' },
        valor: { type: 'number', description: 'Valor a transferir em reais' },
        descricao: { type: 'string', description: 'Descricao da transferencia' },
      },
      required: ['destinatario', 'valor'],
    },
  },
  {
    name: 'consultar_investimentos',
    description:
      'Consulta o portfolio de investimentos do usuario. Retorna nome, valor aplicado, rendimento e tipo.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
];

// === System prompt que controla comportamento ===

const systemPrompt = `Voce e um assistente financeiro profissional e prudente.

Regras de uso de tools:
1. SEMPRE consulte o saldo antes de sugerir transferencias ou investimentos.
2. NUNCA execute fazer_transferencia sem antes confirmar explicitamente com o usuario: informe o valor, destinatario e peca confirmacao.
3. Para perguntas sobre a situacao financeira, consulte TANTO o saldo QUANTO o extrato para dar uma resposta completa.
4. Para conselhos de investimento, consulte o saldo e os investimentos atuais primeiro.
5. Formate todos os valores monetarios em reais (R$) com 2 casas decimais.
6. Seja prudente: quando em duvida, consulte mais dados antes de aconselhar.
7. Nunca invente dados — use APENAS informacoes retornadas pelas tools.`;

// === Handlers ===

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'consultar_saldo':
      return JSON.stringify(contaDB);
    case 'consultar_extrato': {
      const limite = (input.limite as number) || 5;
      return JSON.stringify(extratoData.slice(0, limite));
    }
    case 'fazer_transferencia':
      return JSON.stringify({
        status: 'confirmacao_pendente',
        destinatario: input.destinatario,
        valor: input.valor,
        mensagem: 'Transferencia requer confirmacao do usuario',
      });
    case 'consultar_investimentos':
      return JSON.stringify(investimentosData);
    default:
      return `Tool desconhecida: ${name}`;
  }
}

// === Loop de tool use ===

async function runToolLoop(
  question: string,
  toolChoice?: Anthropic.MessageCreateParams['tool_choice']
): Promise<void> {
  console.log(`\nPergunta: "${question}"`);
  if (toolChoice) console.log(`tool_choice: ${JSON.stringify(toolChoice)}`);
  console.log();

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  let continueLoop = true;

  while (continueLoop) {
    const params: Anthropic.MessageCreateParams = {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages,
    };

    if (toolChoice) {
      params.tool_choice = toolChoice;
    }

    const response = await client.messages.create(params);

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [Tool: ${block.name}(${JSON.stringify(block.input)})]`);
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
        console.log(`  [Resultado: ${result.slice(0, 100)}...]`);
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
      // Apos primeira iteracao, usar auto para nao forcar loop infinito
      toolChoice = undefined;
    } else {
      continueLoop = false;
    }
  }
}

// === Teste 1: Comportamento com system prompt ===
console.log('=== Teste 1: System prompt guiando tools ===');
await runToolLoop('Meu saldo esta bom para investir mais em renda fixa?');

console.log('\n' + '='.repeat(60));

// === Teste 2: tool_choice = 'any' ===
console.log('\n=== Teste 2: tool_choice = any (forca uso de tool) ===');
await runToolLoop('Como esta minha conta?', { type: 'any' });

console.log('\n' + '='.repeat(60));

// === Teste 3: tool_choice com tool especifica ===
console.log('\n=== Teste 3: tool_choice = tool especifica ===');
await runToolLoop('Quero ver meus dados', { type: 'tool', name: 'consultar_investimentos' });

console.log('\n--- Exercicio 13 completo! ---');
