/**
 * Testes para o Modulo 3: Tool Use & Function Calling
 *
 * Testa definicao de tools, handlers, validacao, loop de tool use e logica de agente.
 * API calls sao mockadas — nenhuma chamada real e feita.
 * Execute: npm test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// === Mock do SDK da Anthropic ===
const mockCreate = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = { create: mockCreate };
  },
}));

beforeEach(() => {
  mockCreate.mockReset();
});

function mockResponse(text: string, inputTokens = 50, outputTokens = 30) {
  return {
    content: [{ type: 'text', text }],
    model: 'claude-haiku-4-5-20251001',
    usage: { input_tokens: inputTokens, output_tokens: outputTokens },
    stop_reason: 'end_turn',
  };
}

function mockToolUseResponse(
  toolName: string,
  toolInput: Record<string, unknown>,
  toolId = 'toolu_123'
) {
  return {
    content: [
      { type: 'tool_use', id: toolId, name: toolName, input: toolInput },
    ],
    model: 'claude-haiku-4-5-20251001',
    usage: { input_tokens: 100, output_tokens: 50 },
    stop_reason: 'tool_use',
  };
}

// =============================================
// Ex1: Tool Schema Definition
// =============================================
describe('Ex1: Tool Schema Definition', () => {
  const buscarClimaTool = {
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

  const enviarEmailTool = {
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
        assunto: { type: 'string', description: 'Assunto do email' },
        corpo: { type: 'string', description: 'Corpo/conteudo do email' },
        cc: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de enderecos em copia (opcional)',
        },
      },
      required: ['destinatario', 'assunto', 'corpo'],
    },
  };

  const consultarBancoTool = {
    name: 'consultar_banco',
    description:
      'Consulta registros de uma tabela do banco de dados com filtros opcionais.',
    input_schema: {
      type: 'object' as const,
      properties: {
        tabela: { type: 'string', description: 'Nome da tabela a consultar' },
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

  it('buscar_clima has correct structure with name, description, input_schema', () => {
    expect(buscarClimaTool.name).toBe('buscar_clima');
    expect(buscarClimaTool.description).toBeTruthy();
    expect(buscarClimaTool.input_schema).toBeDefined();
    expect(buscarClimaTool.input_schema.type).toBe('object');
    expect(buscarClimaTool.input_schema.properties).toBeDefined();
    expect(buscarClimaTool.input_schema.required).toContain('cidade');
  });

  it('enviar_email requires destinatario, assunto, corpo', () => {
    expect(enviarEmailTool.name).toBe('enviar_email');
    expect(enviarEmailTool.input_schema.type).toBe('object');
    expect(enviarEmailTool.input_schema.required).toContain('destinatario');
    expect(enviarEmailTool.input_schema.required).toContain('assunto');
    expect(enviarEmailTool.input_schema.required).toContain('corpo');
    expect(enviarEmailTool.input_schema.required).toHaveLength(3);
  });

  it('consultar_banco has nested filtros object and optional properties', () => {
    expect(consultarBancoTool.name).toBe('consultar_banco');
    expect(consultarBancoTool.input_schema.required).toEqual(['tabela']);
    const filtros = consultarBancoTool.input_schema.properties.filtros as Record<string, unknown>;
    expect(filtros.type).toBe('object');
    expect(consultarBancoTool.input_schema.properties.limite).toBeDefined();
  });

  it('all 3 tools have valid schema structure', () => {
    const tools = [buscarClimaTool, enviarEmailTool, consultarBancoTool];
    expect(tools).toHaveLength(3);
    for (const tool of tools) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.input_schema.type).toBe('object');
      expect(tool.input_schema.properties).toBeDefined();
      expect(Array.isArray(tool.input_schema.required)).toBe(true);
    }
  });
});

// =============================================
// Ex2: Primeira Tool — Calculator
// =============================================
describe('Ex2: Primeira Tool (Calculator)', () => {
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
        if (input.b === 0) return 'Erro: divisao por zero';
        return String(input.a / input.b);
      default:
        return `Operacao invalida: ${input.operacao}`;
    }
  }

  it('handles all 4 arithmetic operations correctly', () => {
    expect(handleCalculadora({ operacao: 'soma', a: 10, b: 5 })).toBe('15');
    expect(handleCalculadora({ operacao: 'subtracao', a: 10, b: 5 })).toBe('5');
    expect(handleCalculadora({ operacao: 'multiplicacao', a: 10, b: 5 })).toBe('50');
    expect(handleCalculadora({ operacao: 'divisao', a: 10, b: 5 })).toBe('2');
  });

  it('returns error message on division by zero', () => {
    const result = handleCalculadora({ operacao: 'divisao', a: 10, b: 0 });
    expect(result).toContain('zero');
    expect(result).toContain('Erro');
  });

  it('detects tool_use stop_reason in API response', () => {
    const toolUseResp = mockToolUseResponse('calculadora', {
      operacao: 'soma',
      a: 10,
      b: 5,
    });
    expect(toolUseResp.stop_reason).toBe('tool_use');
    expect(toolUseResp.content[0].type).toBe('tool_use');
    expect(toolUseResp.content[0].name).toBe('calculadora');

    const endTurnResp = mockResponse('O resultado e 15.');
    expect(endTurnResp.stop_reason).toBe('end_turn');
  });

  it('sends tools array in API call', async () => {
    mockCreate.mockResolvedValue(mockResponse('O resultado e 15'));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [
        {
          name: 'calculadora',
          description: 'Faz calculos matematicos',
          input_schema: {
            type: 'object',
            properties: {
              operacao: { type: 'string', enum: ['soma', 'subtracao', 'multiplicacao', 'divisao'] },
              a: { type: 'number' },
              b: { type: 'number' },
            },
            required: ['operacao', 'a', 'b'],
          },
        },
      ],
      messages: [{ role: 'user', content: 'Quanto e 10 + 5?' }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: expect.arrayContaining([
          expect.objectContaining({ name: 'calculadora' }),
        ]),
      })
    );
  });
});

// =============================================
// Ex3: Typed Handlers (Discriminated Union)
// =============================================
describe('Ex3: Typed Handlers (Discriminated Union)', () => {
  type CalculadoraInput = {
    tool_name: 'calculadora';
    operacao: 'soma' | 'subtracao' | 'multiplicacao' | 'divisao';
    a: number;
    b: number;
  };

  type TraducaoInput = {
    tool_name: 'traduzir';
    texto: string;
    idioma_destino: string;
  };

  type FormatadorInput = {
    tool_name: 'formatar_data';
    data: string;
    formato: 'curto' | 'longo' | 'iso';
  };

  type ToolInput = CalculadoraInput | TraducaoInput | FormatadorInput;

  function handleCalculadora(input: CalculadoraInput): string {
    switch (input.operacao) {
      case 'soma': return String(input.a + input.b);
      case 'subtracao': return String(input.a - input.b);
      case 'multiplicacao': return String(input.a * input.b);
      case 'divisao':
        if (input.b === 0) return 'Erro: divisao por zero';
        return String(input.a / input.b);
    }
  }

  function handleTraduzir(input: TraducaoInput): string {
    const traducoes: Record<string, Record<string, string>> = {
      pt: { 'Hello world': 'Ola mundo', 'Good morning': 'Bom dia' },
      es: { 'Hello world': 'Hola mundo', 'Good morning': 'Buenos dias' },
      fr: { 'Hello world': 'Bonjour le monde', 'Good morning': 'Bonjour' },
    };
    const traduzido = traducoes[input.idioma_destino]?.[input.texto];
    return traduzido || `[Traducao simulada de "${input.texto}" para ${input.idioma_destino}]`;
  }

  function handleFormatarData(input: FormatadorInput): string {
    const date = new Date(input.data + 'T12:00:00');
    if (isNaN(date.getTime())) return 'Data invalida';

    const meses = [
      'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
    ];

    switch (input.formato) {
      case 'curto':
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      case 'longo':
        return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
      case 'iso':
        return date.toISOString().split('T')[0];
    }
  }

  function dispatch(input: ToolInput): string {
    switch (input.tool_name) {
      case 'calculadora': return handleCalculadora(input);
      case 'traduzir': return handleTraduzir(input);
      case 'formatar_data': return handleFormatarData(input);
      default:
        return `Tool desconhecida`;
    }
  }

  it('dispatcher routes calculadora correctly', () => {
    expect(dispatch({ tool_name: 'calculadora', operacao: 'soma', a: 10, b: 20 })).toBe('30');
    expect(dispatch({ tool_name: 'calculadora', operacao: 'multiplicacao', a: 7, b: 8 })).toBe('56');
  });

  it('dispatcher routes traduzir correctly', () => {
    expect(dispatch({ tool_name: 'traduzir', texto: 'Hello world', idioma_destino: 'pt' })).toBe('Ola mundo');
    expect(dispatch({ tool_name: 'traduzir', texto: 'Good morning', idioma_destino: 'es' })).toBe('Buenos dias');
  });

  it('formats dates in curto, longo, and iso formats', () => {
    const curto = dispatch({ tool_name: 'formatar_data', data: '2026-12-25', formato: 'curto' });
    expect(curto).toBe('25/12/2026');

    const longo = dispatch({ tool_name: 'formatar_data', data: '2026-03-15', formato: 'longo' });
    expect(longo).toBe('15 de marco de 2026');

    const iso = dispatch({ tool_name: 'formatar_data', data: '2026-07-04', formato: 'iso' });
    expect(iso).toBe('2026-07-04');
  });

  it('returns error for unknown tool_name via exhaustive dispatch', () => {
    const result = dispatch({ tool_name: 'desconhecida' as never, operacao: 'soma', a: 1, b: 2 } as ToolInput);
    expect(result).toContain('desconhecida');
  });
});

// =============================================
// Ex4: Multiple Tools (Conversor + Dispatcher)
// =============================================
describe('Ex4: Multiple Tools', () => {
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

  it('converts celsius to fahrenheit correctly', () => {
    expect(handleConversor({ tipo: 'celsius_fahrenheit', valor: 0 })).toBe('32.00');
    expect(handleConversor({ tipo: 'celsius_fahrenheit', valor: 100 })).toBe('212.00');
  });

  it('converts km to milhas correctly', () => {
    const result = parseFloat(handleConversor({ tipo: 'km_milhas', valor: 10 }));
    expect(result).toBeCloseTo(6.21, 1);
  });

  it('dispatcher routes to correct handler by tool name', () => {
    function dispatchTool(name: string, input: Record<string, unknown>): string {
      switch (name) {
        case 'calculadora':
          return 'calculadora_handler';
        case 'conversor_unidades':
          return 'conversor_handler';
        case 'data_info':
          return 'data_handler';
        default:
          return `Tool desconhecida: ${name}`;
      }
    }

    expect(dispatchTool('calculadora', {})).toBe('calculadora_handler');
    expect(dispatchTool('conversor_unidades', {})).toBe('conversor_handler');
    expect(dispatchTool('data_info', {})).toBe('data_handler');
    expect(dispatchTool('inexistente', {})).toContain('desconhecida');
  });

  it('handles invalid conversion type', () => {
    const result = handleConversor({ tipo: 'metros_jardas', valor: 10 });
    expect(result).toContain('invalido');
  });
});

// =============================================
// Ex5: Tool Validation
// =============================================
describe('Ex5: Tool Validation', () => {
  function validarCriarUsuario(input: unknown): {
    valido: boolean;
    dados?: { nome: string; email: string; idade: number };
    erro?: string;
  } {
    if (typeof input !== 'object' || input === null) {
      return { valido: false, erro: 'Input deve ser um objeto' };
    }
    const obj = input as Record<string, unknown>;

    if (typeof obj.nome !== 'string' || obj.nome.length < 2) {
      return { valido: false, erro: 'nome deve ser string com pelo menos 2 caracteres' };
    }
    if (typeof obj.email !== 'string' || !obj.email.includes('@')) {
      return { valido: false, erro: 'email deve ser string valida contendo @' };
    }
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

    if (typeof obj.categoria !== 'string' || obj.categoria.length === 0) {
      return { valido: false, erro: 'categoria e obrigatoria e deve ser string nao vazia' };
    }
    if (obj.preco_max !== undefined) {
      if (typeof obj.preco_max !== 'number' || obj.preco_max <= 0) {
        return { valido: false, erro: 'preco_max deve ser numero positivo' };
      }
    }
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

  it('validarCriarUsuario passes with valid data', () => {
    const result = validarCriarUsuario({ nome: 'Ana Silva', email: 'ana@email.com', idade: 25 });
    expect(result.valido).toBe(true);
    expect(result.dados!.nome).toBe('Ana Silva');
    expect(result.dados!.email).toBe('ana@email.com');
    expect(result.dados!.idade).toBe(25);
  });

  it('validarCriarUsuario rejects invalid nome, email, and idade', () => {
    const badName = validarCriarUsuario({ nome: '', email: 'ok@ok.com', idade: 20 });
    expect(badName.valido).toBe(false);
    expect(badName.erro).toContain('nome');

    const badEmail = validarCriarUsuario({ nome: 'Ana', email: 'invalido', idade: 20 });
    expect(badEmail.valido).toBe(false);
    expect(badEmail.erro).toContain('email');

    const badIdade = validarCriarUsuario({ nome: 'Ana', email: 'a@b.com', idade: 200 });
    expect(badIdade.valido).toBe(false);
    expect(badIdade.erro).toContain('idade');
  });

  it('validarBuscarProdutos passes with valid category and rejects invalid preco_max/ordenar', () => {
    const valid = validarBuscarProdutos({ categoria: 'eletronicos', preco_max: 1000 });
    expect(valid.valido).toBe(true);
    expect(valid.dados!.categoria).toBe('eletronicos');

    const badPreco = validarBuscarProdutos({ categoria: 'livros', preco_max: -10 });
    expect(badPreco.valido).toBe(false);
    expect(badPreco.erro).toContain('preco_max');

    const badOrdenar = validarBuscarProdutos({ categoria: 'livros', ordenar: 'invalido' });
    expect(badOrdenar.valido).toBe(false);
    expect(badOrdenar.erro).toContain('ordenar');
  });

  it('dispatcher with validation returns error messages for invalid input', () => {
    function dispatchComValidacao(name: string, input: unknown): string {
      switch (name) {
        case 'criar_usuario': {
          const resultado = validarCriarUsuario(input);
          if (!resultado.valido) return `Erro de validacao: ${resultado.erro}`;
          return JSON.stringify({ id: 1, ...resultado.dados!, status: 'criado' });
        }
        case 'buscar_produtos': {
          const resultado = validarBuscarProdutos(input);
          if (!resultado.valido) return `Erro de validacao: ${resultado.erro}`;
          return JSON.stringify([]);
        }
        default:
          return `Tool desconhecida: ${name}`;
      }
    }

    const erroResult = dispatchComValidacao('criar_usuario', { nome: '', email: 'bad', idade: -5 });
    expect(erroResult).toContain('Erro de validacao');

    const okResult = dispatchComValidacao('criar_usuario', { nome: 'Maria', email: 'maria@test.com', idade: 30 });
    expect(okResult).toContain('criado');
    expect(okResult).not.toContain('Erro');
  });
});

// =============================================
// Ex6: Tool Description Quality
// =============================================
describe('Ex6: Tool Description Quality', () => {
  const toolsRuins = [
    {
      name: 'buscar',
      description: 'Busca coisas',
      input_schema: {
        type: 'object' as const,
        properties: { q: { type: 'string', description: 'query' } },
        required: ['q'],
      },
    },
    {
      name: 'calcular',
      description: 'Faz calculos',
      input_schema: {
        type: 'object' as const,
        properties: { expr: { type: 'string', description: 'expressao' } },
        required: ['expr'],
      },
    },
  ];

  const toolsBoas = [
    {
      name: 'buscar_documentos',
      description:
        'Busca documentos internos da empresa por palavras-chave. ' +
        'Pesquisa no titulo e conteudo de documentos como politicas, manuais e procedimentos. ' +
        'Retorna uma lista com titulo, resumo e data de atualizacao de cada documento encontrado. ' +
        'Use quando o usuario perguntar sobre documentos, politicas ou procedimentos da empresa. ' +
        'NAO use para buscas na internet ou informacoes externas.',
      input_schema: {
        type: 'object' as const,
        properties: {
          query: {
            type: 'string',
            description:
              'Palavras-chave para busca. Exemplos: "politica ferias", "manual onboarding", "procedimento reembolso"',
          },
          limite: {
            type: 'number',
            description: 'Numero maximo de resultados (1-20, default: 5)',
          },
        },
        required: ['query'],
      },
    },
  ];

  it('bad descriptions are vague (short, no context)', () => {
    for (const tool of toolsRuins) {
      expect(tool.description.length).toBeLessThan(30);
    }
  });

  it('good descriptions include what, when to use, when NOT to use, and return format', () => {
    const desc = toolsBoas[0].description;
    expect(desc).toContain('Busca documentos internos');
    expect(desc).toContain('Use quando');
    expect(desc).toContain('NAO use');
    expect(desc).toContain('Retorna');
    expect(desc.length).toBeGreaterThan(100);
  });

  it('good property descriptions include examples', () => {
    const queryDesc = toolsBoas[0].input_schema.properties.query.description;
    expect(queryDesc).toContain('Exemplos');
    expect(queryDesc).toContain('politica ferias');
  });
});

// =============================================
// Ex7: API Real ViaCEP
// =============================================
describe('Ex7: API Real ViaCEP', () => {
  function limparCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }

  function validarCep(cep: string): boolean {
    return limparCep(cep).length === 8;
  }

  it('cleans CEP by removing hyphens and dots', () => {
    expect(limparCep('01001-000')).toBe('01001000');
    expect(limparCep('01001000')).toBe('01001000');
    expect(limparCep('01.001-000')).toBe('01001000');
  });

  it('validates CEP length must be 8 digits', () => {
    expect(validarCep('01001-000')).toBe(true);
    expect(validarCep('01001000')).toBe(true);
    expect(validarCep('0100')).toBe(false);
    expect(validarCep('010010001')).toBe(false);
  });

  it('handles invalid CEP format gracefully', () => {
    function handleBuscarCep(cep: string): string {
      const cepLimpo = limparCep(cep);
      if (cepLimpo.length !== 8) {
        return 'CEP invalido: deve ter 8 digitos';
      }
      return `CEP ${cepLimpo} valido`;
    }

    expect(handleBuscarCep('123')).toContain('invalido');
    expect(handleBuscarCep('01001-000')).toContain('valido');
  });
});

// =============================================
// Ex8: Tools + Handlebars Templates
// =============================================
describe('Ex8: Tools with Templates', () => {
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
      (p) =>
        `  - ${p.nome.padEnd(25)} R$ ${p.preco.toFixed(2).padStart(10)}   Estoque: ${String(p.estoque).padStart(4)}`
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

  it('templateUsuario formats user profile correctly', () => {
    const result = templateUsuario({
      nome: 'Joao Silva',
      email: 'joao@empresa.com',
      plano: 'Pro',
      ativo: true,
      criadoEm: '2025-03-15',
    });

    expect(result).toContain('Joao Silva');
    expect(result).toContain('joao@empresa.com');
    expect(result).toContain('Pro');
    expect(result).toContain('Ativo');
    expect(result).toContain('Perfil do Usuario');
  });

  it('templateListaProdutos formats product list with totals', () => {
    const produtos = [
      { nome: 'Notebook Pro 15"', preco: 5499, estoque: 23 },
      { nome: 'Mouse Wireless', preco: 149, estoque: 156 },
    ];
    const result = templateListaProdutos('eletronicos', produtos);

    expect(result).toContain('Eletronicos');
    expect(result).toContain('Notebook Pro');
    expect(result).toContain('Mouse Wireless');
    expect(result).toContain('2 produtos');
    expect(result).toContain('179 unidades');
    const expectedTotal = 5499 * 23 + 149 * 156;
    expect(result).toContain(expectedTotal.toFixed(2));
  });

  it('templateRelatorio formats report with metrics and observations', () => {
    const result = templateRelatorio({
      titulo: 'Relatorio Mensal',
      periodo: '2026-01',
      metricas: { 'Usuarios ativos': 1250, 'Novos cadastros': 89 },
      observacoes: ['Crescimento de 12%', 'Receita acima da meta'],
    });

    expect(result).toContain('Relatorio Mensal');
    expect(result).toContain('2026-01');
    expect(result).toContain('Usuarios ativos: 1250');
    expect(result).toContain('Novos cadastros: 89');
    expect(result).toContain('Crescimento de 12%');
    expect(result).toContain('Receita acima da meta');
  });
});

// =============================================
// Ex9: Rich Results (Dashboard + Client Analysis)
// =============================================
describe('Ex9: Rich Results', () => {
  const dashboardData = {
    vendas: {
      hoje: { total: 15680, pedidos: 42, ticket_medio: 373.33 },
      semana: { total: 98450, pedidos: 287, ticket_medio: 343.03 },
      mes: { total: 456000, pedidos: 1250, ticket_medio: 364.80 },
    },
    topProdutos: [
      { nome: 'Plano Enterprise', vendas: 45, receita: 44955 },
      { nome: 'Plano Pro', vendas: 120, receita: 35880 },
      { nome: 'Plano Starter', vendas: 350, receita: 17150 },
    ],
    alertas: [
      { tipo: 'warning', msg: 'Estoque baixo: Mouse Wireless', timestamp: '2026-02-16T10:30:00' },
      { tipo: 'info', msg: 'Novo recorde de vendas', timestamp: '2026-02-16T09:15:00' },
      { tipo: 'error', msg: 'Falha no gateway de pagamento', timestamp: '2026-02-16T14:32:00' },
    ],
  };

  function handleDashboard(input: { periodo: string; incluir_alertas?: boolean }): Record<string, unknown> {
    const periodo = input.periodo as keyof typeof dashboardData.vendas;
    const metricas = dashboardData.vendas[periodo];

    const resultado: Record<string, unknown> = {
      _meta: {
        fonte: 'sistema_vendas_v2',
        timestamp: new Date().toISOString(),
        periodo: input.periodo,
      },
      metricas: {
        receita_total: metricas.total,
        total_pedidos: metricas.pedidos,
        ticket_medio: metricas.ticket_medio,
      },
      ranking_produtos: dashboardData.topProdutos.map((p, i) => ({
        posicao: i + 1,
        produto: p.nome,
        vendas: p.vendas,
        receita: p.receita,
      })),
    };

    if (input.incluir_alertas !== false) {
      resultado.alertas = dashboardData.alertas;
    }

    return resultado;
  }

  function classificarRisco(health: number): string {
    if (health >= 80) return 'baixo';
    if (health >= 60) return 'medio';
    return 'alto';
  }

  it('dashboard handler returns _meta, metricas, and ranking_produtos', () => {
    const result = handleDashboard({ periodo: 'mes' });

    expect(result._meta).toBeDefined();
    expect((result._meta as Record<string, unknown>).fonte).toBe('sistema_vendas_v2');
    expect(result.metricas).toBeDefined();
    expect((result.metricas as Record<string, unknown>).receita_total).toBe(456000);
    expect(Array.isArray(result.ranking_produtos)).toBe(true);
    expect((result.ranking_produtos as unknown[]).length).toBe(3);
  });

  it('analise_clientes returns correct health score classification', () => {
    expect(classificarRisco(95)).toBe('baixo');
    expect(classificarRisco(80)).toBe('baixo');
    expect(classificarRisco(72)).toBe('medio');
    expect(classificarRisco(60)).toBe('medio');
    expect(classificarRisco(45)).toBe('alto');
    expect(classificarRisco(30)).toBe('alto');
  });

  it('alert filtering works in dashboard response', () => {
    const withAlerts = handleDashboard({ periodo: 'hoje', incluir_alertas: true });
    expect(withAlerts.alertas).toBeDefined();
    expect((withAlerts.alertas as unknown[]).length).toBe(3);

    const withoutAlerts = handleDashboard({ periodo: 'hoje', incluir_alertas: false });
    expect(withoutAlerts.alertas).toBeUndefined();
  });
});

// =============================================
// Ex10: Tools in Multi-Turn Conversation
// =============================================
describe('Ex10: Tools in Multi-Turn Conversation', () => {
  const pedidosDB: Record<string, {
    id: string;
    cliente: string;
    itens: Array<{ nome: string; qtd: number; preco: number }>;
    status: string;
    data: string;
  }> = {
    'PED-001': {
      id: 'PED-001', cliente: 'Maria Silva',
      itens: [{ nome: 'Notebook', qtd: 1, preco: 4500 }, { nome: 'Mouse', qtd: 2, preco: 89 }],
      status: 'enviado', data: '2026-02-10',
    },
    'PED-002': {
      id: 'PED-002', cliente: 'Maria Silva',
      itens: [{ nome: 'Teclado', qtd: 1, preco: 350 }],
      status: 'processando', data: '2026-02-15',
    },
    'PED-003': {
      id: 'PED-003', cliente: 'Joao Santos',
      itens: [{ nome: 'Monitor', qtd: 1, preco: 2800 }],
      status: 'entregue', data: '2026-02-01',
    },
  };

  function handleBuscarPedidos(input: { cliente?: string; id?: string }): string {
    if (input.id) {
      const pedido = pedidosDB[input.id];
      if (!pedido) return JSON.stringify({ erro: `Pedido ${input.id} nao encontrado` });
      return JSON.stringify(pedido);
    }
    if (input.cliente) {
      const pedidos = Object.values(pedidosDB).filter(
        (p) => p.cliente.toLowerCase().includes(input.cliente!.toLowerCase())
      );
      if (pedidos.length === 0) return JSON.stringify({ erro: `Nenhum pedido encontrado` });
      return JSON.stringify(pedidos);
    }
    return JSON.stringify({ erro: 'Informe cliente ou id para buscar' });
  }

  function handleAtualizarStatus(input: { id: string; novo_status: string }): string {
    const pedido = pedidosDB[input.id];
    if (!pedido) return JSON.stringify({ erro: `Pedido ${input.id} nao encontrado` });
    const statusAnterior = pedido.status;
    pedido.status = input.novo_status;
    return JSON.stringify({ id: input.id, status_anterior: statusAnterior, novo_status: input.novo_status });
  }

  function handleCalcularTotal(input: { id: string; desconto?: number }): string {
    const pedido = pedidosDB[input.id];
    if (!pedido) return JSON.stringify({ erro: `Pedido ${input.id} nao encontrado` });
    const subtotal = pedido.itens.reduce((sum, item) => sum + item.preco * item.qtd, 0);
    const desconto = input.desconto || 0;
    const valorDesconto = subtotal * (desconto / 100);
    const total = subtotal - valorDesconto;
    return JSON.stringify({ pedido_id: pedido.id, subtotal, desconto: `${desconto}%`, total });
  }

  it('looks up pedidos by cliente name', () => {
    const result = JSON.parse(handleBuscarPedidos({ cliente: 'Maria' }));
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0].cliente).toContain('Maria');
  });

  it('looks up pedido by specific ID', () => {
    const result = JSON.parse(handleBuscarPedidos({ id: 'PED-003' }));
    expect(result.id).toBe('PED-003');
    expect(result.cliente).toBe('Joao Santos');
  });

  it('atualizar_status changes pedido status', () => {
    const result = JSON.parse(handleAtualizarStatus({ id: 'PED-002', novo_status: 'enviado' }));
    expect(result.status_anterior).toBe('processando');
    expect(result.novo_status).toBe('enviado');
    expect(pedidosDB['PED-002'].status).toBe('enviado');
  });

  it('calcular_total applies desconto correctly', () => {
    const result = JSON.parse(handleCalcularTotal({ id: 'PED-001', desconto: 10 }));
    const expectedSubtotal = 4500 * 1 + 89 * 2; // 4678
    const expectedTotal = expectedSubtotal * 0.9; // 4210.2
    expect(result.subtotal).toBe(expectedSubtotal);
    expect(result.total).toBeCloseTo(expectedTotal, 1);
  });
});

// =============================================
// Ex11: Tool Chaining (Sales Pipeline)
// =============================================
describe('Ex11: Tool Chaining', () => {
  const vendasJan = [
    { produto: 'Plano Pro', valor: 299, data: '2026-01-05' },
    { produto: 'Plano Enterprise', valor: 999, data: '2026-01-12' },
    { produto: 'Plano Pro', valor: 299, data: '2026-01-20' },
    { produto: 'Plano Starter', valor: 49, data: '2026-01-25' },
  ];

  const vendasFev = [
    { produto: 'Plano Enterprise', valor: 999, data: '2026-02-03' },
    { produto: 'Plano Pro', valor: 299, data: '2026-02-10' },
    { produto: 'Plano Pro', valor: 299, data: '2026-02-14' },
    { produto: 'Plano Enterprise', valor: 999, data: '2026-02-20' },
    { produto: 'Plano Starter', valor: 49, data: '2026-02-28' },
  ];

  it('calculates metrics from sales data (total, media)', () => {
    const total = vendasJan.reduce((sum, v) => sum + v.valor, 0);
    const media = total / vendasJan.length;

    expect(total).toBe(1646);
    expect(media).toBeCloseTo(411.5, 1);
  });

  it('groups sales by product', () => {
    const porProduto: Record<string, { count: number; total: number }> = {};
    for (const v of vendasJan) {
      if (!porProduto[v.produto]) {
        porProduto[v.produto] = { count: 0, total: 0 };
      }
      porProduto[v.produto].count++;
      porProduto[v.produto].total += v.valor;
    }

    expect(porProduto['Plano Pro'].count).toBe(2);
    expect(porProduto['Plano Pro'].total).toBe(598);
    expect(porProduto['Plano Enterprise'].count).toBe(1);
    expect(porProduto['Plano Starter'].count).toBe(1);
  });

  it('computes growth between months', () => {
    const receitaJan = vendasJan.reduce((sum, v) => sum + v.valor, 0);
    const receitaFev = vendasFev.reduce((sum, v) => sum + v.valor, 0);
    const crescimento = ((receitaFev - receitaJan) / receitaJan) * 100;

    expect(receitaJan).toBe(1646);
    expect(receitaFev).toBe(2645);
    expect(crescimento).toBeCloseTo(60.7, 0);
  });
});

// =============================================
// Ex12: Parallel Tool Execution
// =============================================
describe('Ex12: Parallel Tool Execution', () => {
  it('Promise.all executes multiple tool handlers concurrently', async () => {
    async function buscarClima(cidade: string): Promise<string> {
      return JSON.stringify({ cidade, temp: 28, condicao: 'nublado' });
    }
    async function buscarCotacao(moeda: string): Promise<string> {
      return JSON.stringify({ moeda, valor_brl: 5.12 });
    }
    async function buscarNoticias(tema: string): Promise<string> {
      return JSON.stringify({ tema, noticias: [{ titulo: `${tema}: tendencias` }] });
    }

    const [clima, cotacao, noticias] = await Promise.all([
      buscarClima('Sao Paulo'),
      buscarCotacao('USD'),
      buscarNoticias('tecnologia'),
    ]);

    expect(JSON.parse(clima).cidade).toBe('Sao Paulo');
    expect(JSON.parse(cotacao).moeda).toBe('USD');
    expect(JSON.parse(noticias).tema).toBe('tecnologia');
  });

  it('collects tool_use blocks from API response', () => {
    const response = {
      content: [
        { type: 'tool_use', id: 'toolu_1', name: 'buscar_clima', input: { cidade: 'Sao Paulo' } },
        { type: 'tool_use', id: 'toolu_2', name: 'buscar_cotacao', input: { moeda: 'USD' } },
        { type: 'tool_use', id: 'toolu_3', name: 'buscar_noticias', input: { tema: 'tech' } },
      ],
      stop_reason: 'tool_use',
    };

    const toolCalls = response.content.filter((b) => b.type === 'tool_use');
    expect(toolCalls).toHaveLength(3);
    expect(toolCalls[0].name).toBe('buscar_clima');
    expect(toolCalls[1].name).toBe('buscar_cotacao');
    expect(toolCalls[2].name).toBe('buscar_noticias');
  });

  it('maps tool results back to correct tool_use_ids', () => {
    const toolCalls = [
      { id: 'toolu_1', name: 'buscar_clima' },
      { id: 'toolu_2', name: 'buscar_cotacao' },
    ];

    const resultados = ['{"temp": 28}', '{"valor": 5.12}'];

    const toolResults = toolCalls.map((tc, i) => ({
      type: 'tool_result' as const,
      tool_use_id: tc.id,
      content: resultados[i],
    }));

    expect(toolResults[0].tool_use_id).toBe('toolu_1');
    expect(toolResults[0].content).toContain('28');
    expect(toolResults[1].tool_use_id).toBe('toolu_2');
    expect(toolResults[1].content).toContain('5.12');
  });
});

// =============================================
// Ex13: Prompt Engineering for Tools
// =============================================
describe('Ex13: Prompt Engineering for Tools', () => {
  it('system prompt with rules guides tool selection behavior', async () => {
    const systemPrompt = `Voce e um assistente financeiro profissional e prudente.

Regras de uso de tools:
1. SEMPRE consulte o saldo antes de sugerir transferencias.
2. NUNCA execute transferencia sem confirmar com o usuario.
3. Formate todos os valores em reais (R$) com 2 casas decimais.`;

    mockCreate.mockResolvedValue(
      mockToolUseResponse('consultar_saldo', {})
    );

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      tools: [
        { name: 'consultar_saldo', description: 'Consulta saldo', input_schema: { type: 'object', properties: {}, required: [] } },
      ],
      messages: [{ role: 'user', content: 'Posso investir mais?' }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('SEMPRE consulte o saldo'),
      })
    );
  });

  it('tool_choice any forces tool usage', async () => {
    mockCreate.mockResolvedValue(
      mockToolUseResponse('consultar_saldo', {})
    );

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [
        { name: 'consultar_saldo', description: 'Consulta saldo', input_schema: { type: 'object', properties: {}, required: [] } },
      ],
      tool_choice: { type: 'any' },
      messages: [{ role: 'user', content: 'Oi' }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        tool_choice: { type: 'any' },
      })
    );
  });

  it('tool_choice with specific tool name forces that tool', async () => {
    mockCreate.mockResolvedValue(
      mockToolUseResponse('consultar_investimentos', {})
    );

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [
        { name: 'consultar_saldo', description: 'Consulta saldo', input_schema: { type: 'object', properties: {}, required: [] } },
        { name: 'consultar_investimentos', description: 'Consulta investimentos', input_schema: { type: 'object', properties: {}, required: [] } },
      ],
      tool_choice: { type: 'tool', name: 'consultar_investimentos' },
      messages: [{ role: 'user', content: 'Quero ver meus dados' }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        tool_choice: { type: 'tool', name: 'consultar_investimentos' },
      })
    );
  });
});

// =============================================
// Ex14: Error Handling
// =============================================
describe('Ex14: Error Handling', () => {
  it('withRetry succeeds after initial failures', async () => {
    let attempts = 0;
    async function unreliable(): Promise<string> {
      attempts++;
      if (attempts < 3) throw new Error('Falha');
      return 'sucesso';
    }

    async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn();
        } catch {
          /* retry */
        }
      }
      throw new Error('Todas falharam');
    }

    const result = await withRetry(unreliable);
    expect(result).toBe('sucesso');
    expect(attempts).toBe(3);
  });

  it('withRetry throws after max attempts exhausted', async () => {
    async function alwaysFails(): Promise<string> {
      throw new Error('Sempre falha');
    }

    async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn();
        } catch {
          /* retry */
        }
      }
      throw new Error('Todas falharam');
    }

    await expect(withRetry(alwaysFails)).rejects.toThrow('Todas falharam');
  });

  it('withTimeout rejects slow operations', async () => {
    async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), ms)
      );
      return Promise.race([promise, timeout]);
    }

    const slow = new Promise<string>((resolve) => setTimeout(() => resolve('ok'), 5000));
    await expect(withTimeout(slow, 50)).rejects.toThrow('Timeout');
  });

  it('tool_result supports is_error flag for error communication', () => {
    const successResult = {
      type: 'tool_result' as const,
      tool_use_id: 'toolu_abc',
      content: '{"produto": "laptop", "preco": 4500}',
      is_error: false,
    };

    const errorResult = {
      type: 'tool_result' as const,
      tool_use_id: 'toolu_abc',
      content: 'Erro: servico temporariamente indisponivel',
      is_error: true,
    };

    expect(successResult.is_error).toBe(false);
    expect(errorResult.is_error).toBe(true);
    expect(errorResult.content).toContain('Erro');
  });
});

// =============================================
// Ex15: Human-in-the-Loop Confirmation
// =============================================
describe('Ex15: Human-in-the-Loop Confirmation', () => {
  type ToolRisco = 'segura' | 'sensivel';

  const toolRiscos: Record<string, ToolRisco> = {
    listar_arquivos: 'segura',
    ler_arquivo: 'segura',
    deletar_arquivo: 'sensivel',
    enviar_email: 'sensivel',
    renomear_arquivo: 'sensivel',
  };

  function gerarDescricaoAcao(name: string, input: Record<string, unknown>): string {
    switch (name) {
      case 'deletar_arquivo':
        return `Deletar permanentemente o arquivo "${input.nome}"`;
      case 'enviar_email':
        return `Enviar email para "${input.para}" com assunto "${input.assunto}"`;
      case 'renomear_arquivo':
        return `Renomear arquivo de "${input.nome_atual}" para "${input.nome_novo}"`;
      default:
        return `Executar ${name}`;
    }
  }

  it('classifies tools as segura vs sensivel', () => {
    expect(toolRiscos['listar_arquivos']).toBe('segura');
    expect(toolRiscos['ler_arquivo']).toBe('segura');
    expect(toolRiscos['deletar_arquivo']).toBe('sensivel');
    expect(toolRiscos['enviar_email']).toBe('sensivel');
    expect(toolRiscos['renomear_arquivo']).toBe('sensivel');
  });

  it('safe tools execute without confirmation', () => {
    function processarToolCall(name: string): { needsConfirmation: boolean } {
      const risco = toolRiscos[name] || 'sensivel';
      return { needsConfirmation: risco === 'sensivel' };
    }

    expect(processarToolCall('listar_arquivos').needsConfirmation).toBe(false);
    expect(processarToolCall('ler_arquivo').needsConfirmation).toBe(false);
    expect(processarToolCall('deletar_arquivo').needsConfirmation).toBe(true);
  });

  it('sensitive tools return CONFIRMACAO_NECESSARIA', () => {
    function processarToolCall(
      name: string,
      input: Record<string, unknown>
    ): string {
      const risco = toolRiscos[name] || 'sensivel';
      if (risco === 'sensivel') {
        const descricao = gerarDescricaoAcao(name, input);
        return `CONFIRMACAO_NECESSARIA: ${descricao}. Por favor, peca ao usuario para confirmar esta acao.`;
      }
      return 'Executado com sucesso';
    }

    const result = processarToolCall('deletar_arquivo', { nome: 'rascunho.txt' });
    expect(result).toContain('CONFIRMACAO_NECESSARIA');
    expect(result).toContain('rascunho.txt');
  });

  it('generates human-readable confirmation descriptions', () => {
    expect(gerarDescricaoAcao('deletar_arquivo', { nome: 'test.txt' }))
      .toBe('Deletar permanentemente o arquivo "test.txt"');
    expect(gerarDescricaoAcao('enviar_email', { para: 'a@b.com', assunto: 'Oi' }))
      .toBe('Enviar email para "a@b.com" com assunto "Oi"');
    expect(gerarDescricaoAcao('renomear_arquivo', { nome_atual: 'old.txt', nome_novo: 'new.txt' }))
      .toBe('Renomear arquivo de "old.txt" para "new.txt"');
  });
});

// =============================================
// Ex16: Cost-Aware Tools
// =============================================
describe('Ex16: Cost-Aware Tools', () => {
  const PRECO_INPUT_POR_MILHAO = 1.0;
  const PRECO_OUTPUT_POR_MILHAO = 5.0;

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

    registrar(usage: { input_tokens: number; output_tokens: number }, toolsChamadas: string[] = []): void {
      const inputTokens = usage.input_tokens;
      const outputTokens = usage.output_tokens;
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
      return [
        `Chamadas a API: ${this.chamadas.length}`,
        `Tokens de input: ${tokens.input}`,
        `Tokens de output: ${tokens.output}`,
        `Custo total: $${custoTotal.toFixed(6)}`,
        `Budget maximo: $${this.budgetMaximo.toFixed(6)}`,
        `Uso do budget: ${((custoTotal / this.budgetMaximo) * 100).toFixed(1)}%`,
      ].join('\n');
    }
  }

  it('registrar() accumulates costs from usage data', () => {
    const tracker = new CostTracker();
    tracker.registrar({ input_tokens: 100, output_tokens: 50 }, ['buscar_dados']);
    tracker.registrar({ input_tokens: 200, output_tokens: 100 }, ['calcular_estatisticas']);

    expect(tracker.getTotalChamadas()).toBe(2);
    const tokens = tracker.getTokensTotal();
    expect(tokens.input).toBe(300);
    expect(tokens.output).toBe(150);
  });

  it('getCustoTotal() sums all iterations correctly', () => {
    const tracker = new CostTracker();
    tracker.registrar({ input_tokens: 1000, output_tokens: 500 });
    tracker.registrar({ input_tokens: 2000, output_tokens: 1000 });

    const expectedCost1 = (1000 / 1_000_000) * 1.0 + (500 / 1_000_000) * 5.0;
    const expectedCost2 = (2000 / 1_000_000) * 1.0 + (1000 / 1_000_000) * 5.0;
    expect(tracker.getCustoTotal()).toBeCloseTo(expectedCost1 + expectedCost2, 8);
  });

  it('excedeuBudget() triggers at budget limit', () => {
    const tracker = new CostTracker(0.001);
    tracker.registrar({ input_tokens: 100, output_tokens: 50 });
    expect(tracker.excedeuBudget()).toBe(false);

    tracker.registrar({ input_tokens: 100000, output_tokens: 50000 });
    expect(tracker.excedeuBudget()).toBe(true);
  });

  it('resumo() returns formatted report with all fields', () => {
    const tracker = new CostTracker(0.05);
    tracker.registrar({ input_tokens: 500, output_tokens: 200 }, ['buscar_dados']);

    const report = tracker.resumo();
    expect(report).toContain('Chamadas a API: 1');
    expect(report).toContain('Tokens de input: 500');
    expect(report).toContain('Tokens de output: 200');
    expect(report).toContain('Custo total: $');
    expect(report).toContain('Budget maximo: $');
    expect(report).toContain('Uso do budget:');
  });
});

// =============================================
// Ex17: Tool Composition
// =============================================
describe('Ex17: Tool Composition', () => {
  const estoqueDB: Record<string, { preco: number; quantidade: number }> = {
    notebook: { preco: 4500, quantidade: 15 },
    mouse: { preco: 89, quantidade: 200 },
    teclado: { preco: 250, quantidade: 45 },
    monitor: { preco: 2800, quantidade: 8 },
  };

  const fretePorCidade: Record<string, number> = {
    'sao paulo': 15,
    'rio de janeiro': 25,
    'belo horizonte': 30,
    curitiba: 35,
  };

  const cuponsDB: Record<string, number> = {
    DESCONTO10: 10,
    DESCONTO20: 20,
    PRIMEIRACOMPRA: 15,
  };

  function validarEstoque(produto: string, quantidade: number): { ok: boolean; msg: string; preco?: number } {
    const item = estoqueDB[produto.toLowerCase()];
    if (!item) return { ok: false, msg: `Produto "${produto}" nao encontrado` };
    if (item.quantidade < quantidade) {
      return { ok: false, msg: `Estoque insuficiente: ${produto} tem ${item.quantidade}, pedido ${quantidade}` };
    }
    return { ok: true, msg: 'OK', preco: item.preco };
  }

  function calcularFrete(cidade: string): { valor: number; prazo: string } {
    const frete = fretePorCidade[cidade.toLowerCase()];
    if (frete === undefined) return { valor: 50, prazo: '10-15 dias uteis' };
    return { valor: frete, prazo: frete <= 20 ? '3-5 dias uteis' : '5-8 dias uteis' };
  }

  function aplicarDesconto(total: number, cupom?: string): { desconto: number; percentual: number } {
    if (!cupom) return { desconto: 0, percentual: 0 };
    const percentual = cuponsDB[cupom.toUpperCase()];
    if (!percentual) return { desconto: 0, percentual: 0 };
    return { desconto: total * (percentual / 100), percentual };
  }

  it('validarEstoque returns ok for existing product with sufficient stock', () => {
    const result = validarEstoque('notebook', 5);
    expect(result.ok).toBe(true);
    expect(result.preco).toBe(4500);
  });

  it('validarEstoque returns error for missing product or insufficient stock', () => {
    const missing = validarEstoque('tablet', 1);
    expect(missing.ok).toBe(false);
    expect(missing.msg).toContain('nao encontrado');

    const insufficient = validarEstoque('monitor', 100);
    expect(insufficient.ok).toBe(false);
    expect(insufficient.msg).toContain('insuficiente');
  });

  it('calcularFrete returns correct values by city', () => {
    expect(calcularFrete('Sao Paulo').valor).toBe(15);
    expect(calcularFrete('Sao Paulo').prazo).toBe('3-5 dias uteis');
    expect(calcularFrete('Curitiba').valor).toBe(35);
    expect(calcularFrete('Curitiba').prazo).toBe('5-8 dias uteis');
    expect(calcularFrete('Manaus').valor).toBe(50); // cidade desconhecida = frete padrao
  });

  it('aplicarDesconto applies valid cupons and ignores invalid ones', () => {
    const valid = aplicarDesconto(1000, 'DESCONTO10');
    expect(valid.percentual).toBe(10);
    expect(valid.desconto).toBe(100);

    const invalid = aplicarDesconto(1000, 'INVALIDO');
    expect(invalid.percentual).toBe(0);
    expect(invalid.desconto).toBe(0);

    const noCupom = aplicarDesconto(1000);
    expect(noCupom.desconto).toBe(0);
  });
});

// =============================================
// Ex18: Dynamic Schemas
// =============================================
describe('Ex18: Dynamic Schemas', () => {
  interface ParamConfig {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array';
    description: string;
    required: boolean;
    enumValues?: string[];
  }

  interface ToolConfig {
    name: string;
    description: string;
    params: ParamConfig[];
    roles: string[];
    handler: (input: Record<string, unknown>) => string;
  }

  const toolConfigs: ToolConfig[] = [
    {
      name: 'listar_usuarios',
      description: 'Lista usuarios do sistema.',
      params: [
        { name: 'status', type: 'string', description: 'Filtrar por status', required: false, enumValues: ['ativo', 'inativo', 'todos'] },
      ],
      roles: ['admin', 'editor', 'viewer'],
      handler: () => JSON.stringify([{ nome: 'Ana' }, { nome: 'Carlos' }]),
    },
    {
      name: 'criar_usuario',
      description: 'Cria um novo usuario.',
      params: [
        { name: 'nome', type: 'string', description: 'Nome completo', required: true },
        { name: 'email', type: 'string', description: 'Email', required: true },
        { name: 'role', type: 'string', description: 'Role', required: true, enumValues: ['admin', 'editor', 'viewer'] },
      ],
      roles: ['admin'],
      handler: (input) => JSON.stringify({ criado: { nome: input.nome, email: input.email } }),
    },
    {
      name: 'deletar_usuario',
      description: 'Remove um usuario do sistema.',
      params: [
        { name: 'id', type: 'string', description: 'ID do usuario', required: true },
      ],
      roles: ['admin'],
      handler: (input) => JSON.stringify({ deletado: input.id }),
    },
    {
      name: 'ver_logs',
      description: 'Visualiza logs de auditoria.',
      params: [
        { name: 'limite', type: 'number', description: 'Max logs', required: false },
      ],
      roles: ['admin'],
      handler: () => JSON.stringify([{ acao: 'login', usuario: 'ana' }]),
    },
    {
      name: 'editar_usuario',
      description: 'Edita dados de um usuario.',
      params: [
        { name: 'id', type: 'string', description: 'ID do usuario', required: true },
        { name: 'nome', type: 'string', description: 'Novo nome', required: false },
      ],
      roles: ['admin', 'editor'],
      handler: (input) => JSON.stringify({ atualizado: input.id }),
    },
  ];

  function gerarToolSchemas(configs: ToolConfig[], userRole: string) {
    return configs
      .filter((config) => config.roles.includes(userRole))
      .map((config) => {
        const properties: Record<string, Record<string, unknown>> = {};
        for (const param of config.params) {
          const prop: Record<string, unknown> = {
            type: param.type,
            description: param.description,
          };
          if (param.enumValues) prop.enum = param.enumValues;
          properties[param.name] = prop;
        }
        return {
          name: config.name,
          description: config.description,
          input_schema: {
            type: 'object' as const,
            properties,
            required: config.params.filter((p) => p.required).map((p) => p.name),
          },
        };
      });
  }

  it('admin gets all tools, viewer gets subset', () => {
    const adminTools = gerarToolSchemas(toolConfigs, 'admin');
    const viewerTools = gerarToolSchemas(toolConfigs, 'viewer');

    expect(adminTools).toHaveLength(5);
    expect(viewerTools).toHaveLength(1);
    expect(viewerTools[0].name).toBe('listar_usuarios');
  });

  it('generated schemas include correct properties and required fields', () => {
    const adminTools = gerarToolSchemas(toolConfigs, 'admin');
    const criarUsuario = adminTools.find((t) => t.name === 'criar_usuario')!;

    expect(criarUsuario.input_schema.type).toBe('object');
    expect(criarUsuario.input_schema.properties.nome).toBeDefined();
    expect(criarUsuario.input_schema.properties.email).toBeDefined();
    expect(criarUsuario.input_schema.properties.role).toBeDefined();
    expect(criarUsuario.input_schema.required).toContain('nome');
    expect(criarUsuario.input_schema.required).toContain('email');
    expect(criarUsuario.input_schema.required).toContain('role');
    expect((criarUsuario.input_schema.properties.role as Record<string, unknown>).enum).toEqual(['admin', 'editor', 'viewer']);
  });

  it('dynamic dispatcher routes to correct handler', () => {
    function criarDispatcher(configs: ToolConfig[]) {
      const handlerMap = new Map(configs.map((c) => [c.name, c.handler]));
      return (name: string, input: Record<string, unknown>) => {
        const handler = handlerMap.get(name);
        if (!handler) return JSON.stringify({ erro: `Tool desconhecida: ${name}` });
        return handler(input);
      };
    }

    const dispatch = criarDispatcher(toolConfigs);

    const result1 = JSON.parse(dispatch('listar_usuarios', {}));
    expect(Array.isArray(result1)).toBe(true);

    const result2 = JSON.parse(dispatch('criar_usuario', { nome: 'Test', email: 'test@t.com' }));
    expect(result2.criado).toBeDefined();
    expect(result2.criado.nome).toBe('Test');

    const result3 = JSON.parse(dispatch('inexistente', {}));
    expect(result3.erro).toContain('desconhecida');
  });
});

// =============================================
// Ex19: Tools for Data Pipeline (ETL)
// =============================================
describe('Ex19: Tools for Data Pipeline', () => {
  const fontes: Record<string, string[]> = {
    vendas_csv: [
      'data,produto,valor,regiao',
      '2026-01-05,Plano Pro,299,Sudeste',
      '2026-01-10,Plano Enterprise,999,Sudeste',
      '2026-01-15,Plano Pro,299,Nordeste',
      '2026-01-25,Plano Starter,49,Sul',
    ],
  };

  function handleExtrair(input: { fonte: string }): Record<string, unknown> {
    const csv = fontes[input.fonte];
    if (!csv) {
      return { erro: `Fonte "${input.fonte}" nao encontrada` };
    }
    const headers = csv[0].split(',');
    const registros = csv.slice(1).map((linha) => {
      const valores = linha.split(',');
      const obj: Record<string, string | number> = {};
      headers.forEach((h, i) => {
        const num = Number(valores[i]);
        obj[h] = isNaN(num) ? valores[i] : num;
      });
      return obj;
    });
    return {
      fonte: input.fonte,
      total_registros: registros.length,
      colunas: headers,
      dados: registros,
    };
  }

  function handleTransformar(input: {
    dados: Array<Record<string, unknown>>;
    operacao: string;
    campo: string;
    campo_soma?: string;
    valor_filtro?: string;
  }): Record<string, unknown> {
    const { dados, operacao, campo } = input;

    if (operacao === 'agrupar_por') {
      const grupos: Record<string, { contagem: number; soma: number }> = {};
      for (const reg of dados) {
        const chave = String(reg[campo]);
        if (!grupos[chave]) grupos[chave] = { contagem: 0, soma: 0 };
        grupos[chave].contagem++;
        if (input.campo_soma && typeof reg[input.campo_soma] === 'number') {
          grupos[chave].soma += reg[input.campo_soma] as number;
        }
      }
      return {
        operacao: 'agrupar_por',
        total_grupos: Object.keys(grupos).length,
        resultado: Object.entries(grupos).map(([chave, info]) => ({
          [campo]: chave,
          contagem: info.contagem,
          soma: input.campo_soma ? info.soma : undefined,
        })),
      };
    }

    if (operacao === 'filtrar') {
      const filtrados = dados.filter(
        (reg) => String(reg[campo]).toLowerCase().includes((input.valor_filtro || '').toLowerCase())
      );
      return {
        operacao: 'filtrar',
        total_original: dados.length,
        total_filtrado: filtrados.length,
        dados: filtrados,
      };
    }

    return { erro: `Operacao "${operacao}" invalida` };
  }

  it('extraction handler parses CSV into structured records', () => {
    const result = handleExtrair({ fonte: 'vendas_csv' });
    expect(result.total_registros).toBe(4);
    expect(result.colunas).toEqual(['data', 'produto', 'valor', 'regiao']);
    const dados = result.dados as Array<Record<string, unknown>>;
    expect(dados[0].produto).toBe('Plano Pro');
    expect(dados[0].valor).toBe(299);
  });

  it('transformation handler groups and sums data correctly', () => {
    const extracted = handleExtrair({ fonte: 'vendas_csv' });
    const dados = extracted.dados as Array<Record<string, unknown>>;

    const result = handleTransformar({
      dados,
      operacao: 'agrupar_por',
      campo: 'regiao',
      campo_soma: 'valor',
    });

    expect(result.operacao).toBe('agrupar_por');
    expect(result.total_grupos).toBe(3); // Sudeste, Nordeste, Sul
    const resultados = result.resultado as Array<Record<string, unknown>>;
    const sudeste = resultados.find((r) => r.regiao === 'Sudeste');
    expect(sudeste!.contagem).toBe(2);
    expect(sudeste!.soma).toBe(299 + 999);
  });

  it('pipeline orchestration chains extract then transform', () => {
    // Step 1: Extract
    const extracted = handleExtrair({ fonte: 'vendas_csv' });
    expect(extracted.erro).toBeUndefined();

    // Step 2: Transform (group by produto)
    const dados = extracted.dados as Array<Record<string, unknown>>;
    const transformed = handleTransformar({
      dados,
      operacao: 'agrupar_por',
      campo: 'produto',
      campo_soma: 'valor',
    });

    expect(transformed.operacao).toBe('agrupar_por');
    const resultados = transformed.resultado as Array<Record<string, unknown>>;
    const pro = resultados.find((r) => r.produto === 'Plano Pro');
    expect(pro!.contagem).toBe(2);
    expect(pro!.soma).toBe(598);
  });
});

// =============================================
// Ex20: Mini Agent
// =============================================
describe('Ex20: Mini Agent', () => {
  it('agent has 5+ tool definitions covering project management', () => {
    const tools = [
      { name: 'listar_projetos', description: 'Lista todos os projetos ativos.' },
      { name: 'ver_tarefas', description: 'Lista tarefas de um projeto.' },
      { name: 'criar_tarefa', description: 'Cria uma nova tarefa.' },
      { name: 'atribuir_tarefa', description: 'Atribui tarefa a um membro.' },
      { name: 'listar_equipe', description: 'Lista membros da equipe.' },
      { name: 'atualizar_tarefa', description: 'Atualiza status de uma tarefa.' },
      { name: 'gerar_relatorio_projeto', description: 'Gera relatorio do projeto.' },
    ];

    expect(tools.length).toBeGreaterThanOrEqual(5);
    const toolNames = tools.map((t) => t.name);
    expect(toolNames).toContain('listar_projetos');
    expect(toolNames).toContain('criar_tarefa');
    expect(toolNames).toContain('atribuir_tarefa');
    expect(toolNames).toContain('listar_equipe');
    expect(toolNames).toContain('gerar_relatorio_projeto');
  });

  it('agent loop continues while stop_reason is tool_use', async () => {
    // Simulate: first call returns tool_use, second returns end_turn
    mockCreate
      .mockResolvedValueOnce(
        mockToolUseResponse('listar_projetos', {}, 'toolu_1')
      )
      .mockResolvedValueOnce(
        mockResponse('Aqui esta o resumo dos projetos.', 200, 150)
      );

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    type MessageParam = { role: string; content: unknown };
    const messages: MessageParam[] = [
      { role: 'user', content: 'Liste os projetos' },
    ];

    let iterations = 0;
    let continueLoop = true;

    while (continueLoop) {
      iterations++;
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        tools: [{ name: 'listar_projetos', description: 'Lista projetos', input_schema: { type: 'object', properties: {}, required: [] } }],
        messages: messages as any,
      });

      if (response.stop_reason === 'tool_use') {
        messages.push({ role: 'assistant', content: response.content });
        messages.push({
          role: 'user',
          content: [{ type: 'tool_result', tool_use_id: 'toolu_1', content: '[]' }],
        });
      } else {
        continueLoop = false;
      }

      // Safety guard
      if (iterations > 10) break;
    }

    expect(iterations).toBe(2);
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it('agent terminates when stop_reason is end_turn', () => {
    const responses = [
      { stop_reason: 'tool_use' },
      { stop_reason: 'tool_use' },
      { stop_reason: 'end_turn' },
    ];

    let iterations = 0;
    for (const response of responses) {
      iterations++;
      if (response.stop_reason !== 'tool_use') break;
    }

    expect(iterations).toBe(3);
  });

  it('agent dispatcher handles all 7 tools correctly', () => {
    function dispatchTool(name: string): string {
      switch (name) {
        case 'listar_projetos':
          return JSON.stringify([{ id: 'proj-1', nome: 'Launch v2' }]);
        case 'ver_tarefas':
          return JSON.stringify({ tarefas: [{ id: 't1', titulo: 'Design' }] });
        case 'criar_tarefa':
          return JSON.stringify({ criada: { id: 't100', titulo: 'Nova Tarefa' } });
        case 'atribuir_tarefa':
          return JSON.stringify({ atribuida: { tarefa: 'Design', responsavel: 'Ana' } });
        case 'listar_equipe':
          return JSON.stringify([{ nome: 'Ana', cargo: 'Backend', disponivel: true }]);
        case 'atualizar_tarefa':
          return JSON.stringify({ atualizada: { id: 't1', status: 'concluida' } });
        case 'gerar_relatorio_projeto':
          return JSON.stringify({ projeto: 'Launch v2', metricas: { total_tarefas: 3, progresso: '66%' } });
        default:
          return `Tool desconhecida: ${name}`;
      }
    }

    const allTools = [
      'listar_projetos', 'ver_tarefas', 'criar_tarefa', 'atribuir_tarefa',
      'listar_equipe', 'atualizar_tarefa', 'gerar_relatorio_projeto',
    ];

    for (const tool of allTools) {
      const result = dispatchTool(tool);
      expect(result).not.toContain('desconhecida');
      const parsed = JSON.parse(result);
      expect(parsed).toBeDefined();
    }

    expect(dispatchTool('inexistente')).toContain('desconhecida');
  });
});
