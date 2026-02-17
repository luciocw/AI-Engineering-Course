/**
 * Solucao 1: Definindo Tool Schemas
 *
 * 3 tools com nome, descricao e input_schema corretos.
 * Execute: npx tsx solucoes/ex1-tool-schema.ts
 */

import Anthropic from '@anthropic-ai/sdk';

// === Tool 1: buscar_clima ===
const buscarClimaTool: Anthropic.Tool = {
  name: 'buscar_clima',
  description:
    'Busca a temperatura e condicao climatica atual de uma cidade.',
  input_schema: {
    type: 'object' as const,
    properties: {
      cidade: {
        type: 'string',
        description: 'Nome da cidade para buscar o clima',
      },
      unidade: {
        type: 'string',
        enum: ['celsius', 'fahrenheit'],
        description: 'Unidade de temperatura (default: celsius)',
      },
    },
    required: ['cidade'],
  },
};

// === Tool 2: enviar_email ===
const enviarEmailTool: Anthropic.Tool = {
  name: 'enviar_email',
  description:
    'Envia um email para um destinatario com assunto e corpo especificados.',
  input_schema: {
    type: 'object' as const,
    properties: {
      destinatario: {
        type: 'string',
        description: 'Endereco de email do destinatario',
      },
      assunto: {
        type: 'string',
        description: 'Assunto do email',
      },
      corpo: {
        type: 'string',
        description: 'Corpo/conteudo do email',
      },
      cc: {
        type: 'array',
        items: { type: 'string' },
        description: 'Lista de enderecos em copia (opcional)',
      },
    },
    required: ['destinatario', 'assunto', 'corpo'],
  },
};

// === Tool 3: consultar_banco ===
const consultarBancoTool: Anthropic.Tool = {
  name: 'consultar_banco',
  description:
    'Consulta registros de uma tabela do banco de dados com filtros opcionais.',
  input_schema: {
    type: 'object' as const,
    properties: {
      tabela: {
        type: 'string',
        description: 'Nome da tabela a consultar',
      },
      filtros: {
        type: 'object',
        properties: {
          campo: { type: 'string', description: 'Nome do campo para filtrar' },
          valor: { type: 'string', description: 'Valor do filtro' },
        },
        description: 'Filtros opcionais para a consulta',
      },
      limite: {
        type: 'number',
        description: 'Numero maximo de registros (default: 10)',
      },
    },
    required: ['tabela'],
  },
};

// === Validacao ===
const tools: Anthropic.Tool[] = [buscarClimaTool, enviarEmailTool, consultarBancoTool];

function validarTools(tools: Anthropic.Tool[]): void {
  console.log('=== Validacao de Tool Schemas ===\n');

  for (const tool of tools) {
    console.log(`Validando tool: ${tool.name}`);

    // Verifica campos obrigatorios
    console.log(`  name: ${tool.name}`);
    console.log(`  description: ${tool.description.slice(0, 60)}...`);
    console.log(`  input_schema.type: ${tool.input_schema.type}`);

    const props = (tool.input_schema as Record<string, unknown>).properties;
    const required = (tool.input_schema as Record<string, unknown>).required;

    if (props && typeof props === 'object') {
      console.log(`  properties: [${Object.keys(props as object).join(', ')}]`);
    } else {
      console.log(`  ERRO: properties ausente ou invalido`);
    }

    if (Array.isArray(required)) {
      console.log(`  required: [${(required as string[]).join(', ')}]`);
    } else {
      console.log(`  ERRO: required ausente ou invalido`);
    }

    console.log(`  VALIDO\n`);
  }

  console.log(`Total: ${tools.length} tools validadas com sucesso!`);
}

validarTools(tools);

console.log('\n--- Exercicio 1 completo! ---');
