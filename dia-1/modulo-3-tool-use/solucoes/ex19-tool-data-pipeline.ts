/**
 * Solucao 19: Tools como Data Pipeline
 *
 * Pipeline ETL: Extract -> Transform -> Load via tool use.
 * Execute: npx tsx solucoes/ex19-tool-data-pipeline.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Dados brutos simulados ===

const fontes: Record<string, string[]> = {
  vendas_csv: [
    'data,produto,valor,regiao',
    '2026-01-05,Plano Pro,299,Sudeste',
    '2026-01-05,Plano Starter,49,Sul',
    '2026-01-10,Plano Enterprise,999,Sudeste',
    '2026-01-15,Plano Pro,299,Nordeste',
    '2026-01-20,Plano Enterprise,999,Sudeste',
    '2026-01-25,Plano Starter,49,Sul',
    '2026-02-01,Plano Pro,299,Norte',
    '2026-02-05,Plano Enterprise,999,Sudeste',
    '2026-02-10,Plano Pro,299,Nordeste',
    '2026-02-15,Plano Starter,49,Centro-Oeste',
  ],
};

const resultadosSalvos: Record<string, unknown> = {};

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'extrair_dados',
    description:
      'Extrai dados brutos de uma fonte CSV e converte para JSON. ' +
      'Fontes disponiveis: vendas_csv. Retorna array de objetos.',
    input_schema: {
      type: 'object' as const,
      properties: {
        fonte: {
          type: 'string',
          description: 'Nome da fonte de dados. Disponivel: vendas_csv',
        },
      },
      required: ['fonte'],
    },
  },
  {
    name: 'transformar_dados',
    description:
      'Transforma um array de dados. Operacoes: "agrupar_por" (agrupa e soma valores por um campo), ' +
      '"filtrar" (filtra registros por campo e valor), "ordenar" (ordena por campo).',
    input_schema: {
      type: 'object' as const,
      properties: {
        dados: {
          type: 'array',
          description: 'Array de objetos para transformar',
        },
        operacao: {
          type: 'string',
          enum: ['agrupar_por', 'filtrar', 'ordenar'],
          description: 'Tipo de transformacao',
        },
        campo: {
          type: 'string',
          description: 'Campo para agrupar, filtrar ou ordenar',
        },
        valor_filtro: {
          type: 'string',
          description: 'Valor para filtrar (apenas quando operacao=filtrar)',
        },
        campo_soma: {
          type: 'string',
          description: 'Campo numerico para somar na agregacao (quando operacao=agrupar_por)',
        },
      },
      required: ['dados', 'operacao', 'campo'],
    },
  },
  {
    name: 'carregar_dados',
    description:
      'Carrega dados processados em um destino. Destinos: "relatorio" (formata como relatorio textual), ' +
      '"json" (salva como JSON), "console" (imprime formatado).',
    input_schema: {
      type: 'object' as const,
      properties: {
        destino: {
          type: 'string',
          enum: ['relatorio', 'json', 'console'],
          description: 'Formato/destino dos dados',
        },
        dados: {
          type: 'object',
          description: 'Dados processados para carregar',
        },
        titulo: {
          type: 'string',
          description: 'Titulo para o relatorio (quando destino=relatorio)',
        },
      },
      required: ['destino', 'dados'],
    },
  },
];

// === Handlers ===

function handleExtrair(input: { fonte: string }): string {
  const csv = fontes[input.fonte];
  if (!csv) {
    return JSON.stringify({ erro: `Fonte "${input.fonte}" nao encontrada. Disponiveis: ${Object.keys(fontes).join(', ')}` });
  }

  // Parse CSV para JSON
  const headers = csv[0].split(',');
  const registros = csv.slice(1).map((linha) => {
    const valores = linha.split(',');
    const obj: Record<string, string | number> = {};
    headers.forEach((h, i) => {
      // Tenta converter numeros
      const num = Number(valores[i]);
      obj[h] = isNaN(num) ? valores[i] : num;
    });
    return obj;
  });

  return JSON.stringify({
    fonte: input.fonte,
    total_registros: registros.length,
    colunas: headers,
    dados: registros,
  });
}

function handleTransformar(input: {
  dados: Array<Record<string, unknown>>;
  operacao: string;
  campo: string;
  valor_filtro?: string;
  campo_soma?: string;
}): string {
  const { dados, operacao, campo } = input;

  switch (operacao) {
    case 'agrupar_por': {
      const grupos: Record<string, { contagem: number; soma: number; registros: unknown[] }> = {};
      for (const reg of dados) {
        const chave = String(reg[campo]);
        if (!grupos[chave]) {
          grupos[chave] = { contagem: 0, soma: 0, registros: [] };
        }
        grupos[chave].contagem++;
        if (input.campo_soma && typeof reg[input.campo_soma] === 'number') {
          grupos[chave].soma += reg[input.campo_soma] as number;
        }
        grupos[chave].registros.push(reg);
      }

      const resultado = Object.entries(grupos).map(([chave, info]) => ({
        [campo]: chave,
        contagem: info.contagem,
        soma: input.campo_soma ? info.soma : undefined,
        media: input.campo_soma ? Math.round(info.soma / info.contagem * 100) / 100 : undefined,
      }));

      return JSON.stringify({
        operacao: 'agrupar_por',
        campo_agrupamento: campo,
        campo_soma: input.campo_soma || 'nenhum',
        total_grupos: resultado.length,
        resultado,
      });
    }

    case 'filtrar': {
      const filtrados = dados.filter(
        (reg) => String(reg[campo]).toLowerCase().includes((input.valor_filtro || '').toLowerCase())
      );
      return JSON.stringify({
        operacao: 'filtrar',
        campo,
        valor: input.valor_filtro,
        total_original: dados.length,
        total_filtrado: filtrados.length,
        dados: filtrados,
      });
    }

    case 'ordenar': {
      const ordenados = [...dados].sort((a, b) => {
        const va = a[campo];
        const vb = b[campo];
        if (typeof va === 'number' && typeof vb === 'number') return vb - va;
        return String(va).localeCompare(String(vb));
      });
      return JSON.stringify({
        operacao: 'ordenar',
        campo,
        dados: ordenados,
      });
    }

    default:
      return JSON.stringify({ erro: `Operacao "${operacao}" invalida` });
  }
}

function handleCarregar(input: {
  destino: string;
  dados: unknown;
  titulo?: string;
}): string {
  const titulo = input.titulo || 'Dados Processados';

  switch (input.destino) {
    case 'relatorio': {
      const linhas = [`=== ${titulo} ===`, `Gerado em: ${new Date().toISOString()}`, ''];
      if (Array.isArray(input.dados)) {
        for (const item of input.dados) {
          if (typeof item === 'object' && item !== null) {
            const entries = Object.entries(item as Record<string, unknown>);
            linhas.push(entries.map(([k, v]) => `${k}: ${v}`).join(' | '));
          }
        }
      } else if (typeof input.dados === 'object' && input.dados !== null) {
        const obj = input.dados as Record<string, unknown>;
        if (obj.resultado && Array.isArray(obj.resultado)) {
          for (const item of obj.resultado) {
            const entries = Object.entries(item as Record<string, unknown>)
              .filter(([, v]) => v !== undefined);
            linhas.push(entries.map(([k, v]) => `${k}: ${v}`).join(' | '));
          }
        } else {
          linhas.push(JSON.stringify(input.dados, null, 2));
        }
      }

      const relatorio = linhas.join('\n');
      resultadosSalvos[titulo] = relatorio;

      return JSON.stringify({
        destino: 'relatorio',
        titulo,
        salvo: true,
        conteudo: relatorio,
      });
    }

    case 'json': {
      resultadosSalvos[titulo] = input.dados;
      return JSON.stringify({
        destino: 'json',
        titulo,
        salvo: true,
        tamanho: JSON.stringify(input.dados).length,
      });
    }

    case 'console':
      return JSON.stringify({
        destino: 'console',
        dados: input.dados,
      });

    default:
      return JSON.stringify({ erro: `Destino "${input.destino}" invalido` });
  }
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'extrair_dados':
      return handleExtrair(input as { fonte: string });
    case 'transformar_dados':
      return handleTransformar(input as {
        dados: Array<Record<string, unknown>>;
        operacao: string;
        campo: string;
        valor_filtro?: string;
        campo_soma?: string;
      });
    case 'carregar_dados':
      return handleCarregar(input as { destino: string; dados: unknown; titulo?: string });
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

  let step = 0;
  let continueLoop = true;

  while (continueLoop) {
    step++;
    console.log(`--- Pipeline Step ${step} ---`);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: 'Voce e um engenheiro de dados. Use as tools na ordem: extrair -> transformar -> carregar. Passe a saida de cada etapa como entrada da proxima.',
      tools,
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [ETL: ${block.name}]`);
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
        console.log(`  [Resultado: ${result.slice(0, 120)}...]`);
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
  'Extraia os dados de vendas_csv, agrupe por regiao somando os valores, e gere um relatorio com o resultado.'
);

console.log('\n--- Exercicio 19 completo! ---');
