/**
 * Solucao 2: Multiplas Tools
 *
 * 3 tools disponiveis — Claude escolhe qual usar.
 * Execute: npx tsx solucoes/ex2-multiplas-tools.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: 'calculadora',
    description: 'Faz calculos matematicos: soma, subtracao, multiplicacao, divisao, porcentagem.',
    input_schema: {
      type: 'object' as const,
      properties: {
        operacao: {
          type: 'string',
          enum: ['soma', 'subtracao', 'multiplicacao', 'divisao', 'porcentagem'],
          description: 'A operacao matematica',
        },
        a: { type: 'number', description: 'Primeiro numero' },
        b: { type: 'number', description: 'Segundo numero' },
      },
      required: ['operacao', 'a', 'b'],
    },
  },
  {
    name: 'conversor_unidades',
    description: 'Converte unidades: celsius/fahrenheit, km/milhas, kg/libras.',
    input_schema: {
      type: 'object' as const,
      properties: {
        tipo: {
          type: 'string',
          enum: [
            'celsius_fahrenheit',
            'fahrenheit_celsius',
            'km_milhas',
            'milhas_km',
            'kg_libras',
            'libras_kg',
          ],
          description: 'Tipo da conversao',
        },
        valor: { type: 'number', description: 'Valor a converter' },
      },
      required: ['tipo', 'valor'],
    },
  },
  {
    name: 'data_info',
    description: 'Informacoes sobre datas: dia da semana, dias ate uma data futura.',
    input_schema: {
      type: 'object' as const,
      properties: {
        operacao: {
          type: 'string',
          enum: ['dia_semana', 'dias_ate'],
          description: 'Tipo de operacao com datas',
        },
        data: {
          type: 'string',
          description: 'Data no formato YYYY-MM-DD',
        },
      },
      required: ['operacao', 'data'],
    },
  },
];

function handleCalculadora(input: {
  operacao: string;
  a: number;
  b: number;
}): string {
  switch (input.operacao) {
    case 'soma':
      return String(input.a + input.b);
    case 'subtracao':
      return String(input.a - input.b);
    case 'multiplicacao':
      return String(input.a * input.b);
    case 'divisao':
      return input.b === 0 ? 'Erro: divisao por zero' : String(input.a / input.b);
    case 'porcentagem':
      return String((input.a / 100) * input.b);
    default:
      return `Operacao invalida: ${input.operacao}`;
  }
}

function handleConversor(input: { tipo: string; valor: number }): string {
  const conversoes: Record<string, (v: number) => number> = {
    celsius_fahrenheit: (v) => (v * 9) / 5 + 32,
    fahrenheit_celsius: (v) => ((v - 32) * 5) / 9,
    km_milhas: (v) => v * 0.621371,
    milhas_km: (v) => v / 0.621371,
    kg_libras: (v) => v * 2.20462,
    libras_kg: (v) => v / 2.20462,
  };
  const fn = conversoes[input.tipo];
  if (!fn) return `Tipo de conversao invalido: ${input.tipo}`;
  return String(fn(input.valor).toFixed(2));
}

function handleDataInfo(input: { operacao: string; data: string }): string {
  const dias = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];
  const date = new Date(input.data + 'T12:00:00');

  if (isNaN(date.getTime())) return 'Data invalida';

  switch (input.operacao) {
    case 'dia_semana':
      return dias[date.getDay()];
    case 'dias_ate': {
      const hoje = new Date();
      hoje.setHours(12, 0, 0, 0);
      const diff = Math.ceil((date.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0
        ? `Faltam ${diff} dias`
        : `Ja passou ha ${Math.abs(diff)} dias`;
    }
    default:
      return `Operacao invalida: ${input.operacao}`;
  }
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'calculadora':
      return handleCalculadora(input as { operacao: string; a: number; b: number });
    case 'conversor_unidades':
      return handleConversor(input as { tipo: string; valor: number });
    case 'data_info':
      return handleDataInfo(input as { operacao: string; data: string });
    default:
      return `Tool desconhecida: ${name}`;
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
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
        console.log(`  [Resultado: ${result}]`);
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

const perguntas = [
  'Quanto e 25 graus Celsius em Fahrenheit?',
  'Que dia da semana sera 25/12/2026?',
  'Calcule 15% de 2500 e converta o resultado de km para milhas.',
];

for (const pergunta of perguntas) {
  await runToolLoop(pergunta);
  console.log('\n' + '='.repeat(50));
}

console.log('\n--- Exercicio 2 completo! ---');
