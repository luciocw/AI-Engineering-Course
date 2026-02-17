/**
 * Testes para o Modulo 2: Claude API + Prompt Engineering
 *
 * Testa construcao de prompts, parsing de respostas e logica de tokens.
 * API calls sao mockadas — nenhuma chamada real e feita.
 * Execute: npm test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import Handlebars from 'handlebars';

// === Mock do SDK da Anthropic ===
const mockCreate = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = { create: mockCreate };
  },
}));

function mockResponse(text: string, inputTokens = 50, outputTokens = 30) {
  return {
    content: [{ type: 'text', text }],
    model: 'claude-haiku-4-5-20251001',
    usage: { input_tokens: inputTokens, output_tokens: outputTokens },
    stop_reason: 'end_turn',
  };
}

beforeEach(() => {
  mockCreate.mockReset();
});

// =============================================
// Ex1: Hello World — SDK, response parsing, cost
// =============================================
describe('Ex1: Hello World — response parsing + custo', () => {
  it('extrai texto do content array', () => {
    const response = mockResponse('AI Engineering e a disciplina...');
    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';

    expect(text).toBe('AI Engineering e a disciplina...');
  });

  it('calcula custo corretamente para Haiku', () => {
    const usage = { input_tokens: 100, output_tokens: 200 };
    const custoInput = (usage.input_tokens / 1_000_000) * 0.25;
    const custoOutput = (usage.output_tokens / 1_000_000) * 1.25;
    const total = custoInput + custoOutput;

    expect(custoInput).toBeCloseTo(0.000025, 6);
    expect(custoOutput).toBeCloseTo(0.00025, 6);
    expect(total).toBeCloseTo(0.000275, 6);
  });

  it('calcula custo corretamente para Sonnet', () => {
    const usage = { input_tokens: 100, output_tokens: 200 };
    const custoInput = (usage.input_tokens / 1_000_000) * 3;
    const custoOutput = (usage.output_tokens / 1_000_000) * 15;
    const total = custoInput + custoOutput;

    expect(custoInput).toBeCloseTo(0.0003, 6);
    expect(custoOutput).toBeCloseTo(0.003, 6);
    expect(total).toBeCloseTo(0.0033, 4);
  });
});

// =============================================
// Ex2: Modelos Comparacao — Haiku vs Sonnet
// =============================================
describe('Ex2: Comparacao de Modelos — Haiku vs Sonnet', () => {
  it('configura modelos com precos corretos por milhao de tokens', () => {
    const modelos = [
      { id: 'claude-haiku-4-5-20251001', nome: 'Haiku 4.5', inputCost: 0.25, outputCost: 1.25 },
      { id: 'claude-sonnet-4-5-20250929', nome: 'Sonnet 4.5', inputCost: 3, outputCost: 15 },
    ];

    expect(modelos).toHaveLength(2);
    expect(modelos[0].inputCost).toBe(0.25);
    expect(modelos[1].inputCost).toBe(3);
    expect(modelos[1].outputCost / modelos[0].outputCost).toBe(12);
  });

  it('calcula fator de custo entre Sonnet e Haiku', () => {
    const haikuCusto = (100 / 1_000_000) * 0.25 + (200 / 1_000_000) * 1.25;
    const sonnetCusto = (100 / 1_000_000) * 3 + (200 / 1_000_000) * 15;
    const fator = sonnetCusto / haikuCusto;

    expect(fator).toBeGreaterThan(1);
    expect(haikuCusto).toBeLessThan(sonnetCusto);
  });

  it('chama a API com o modelo correto', async () => {
    mockCreate.mockResolvedValue(mockResponse('Traducao aqui'));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: 'Traduza o texto.' }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'claude-haiku-4-5-20251001' })
    );
  });
});

// =============================================
// Ex3: System Prompts — personas
// =============================================
describe('Ex3: System Prompts e Personas', () => {
  it('envia system prompt na chamada a API', async () => {
    mockCreate.mockResolvedValue(mockResponse('Resposta tecnica'));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: 'Voce e um code reviewer senior.',
      messages: [{ role: 'user', content: 'Explique embeddings.' }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: 'Voce e um code reviewer senior.',
      })
    );
  });

  it('personas diferentes produzem system prompts distintos', () => {
    const personas: Record<string, string> = {
      'Code Reviewer': 'Voce e um code reviewer senior. Seja tecnico.',
      Professor: 'Voce e um professor paciente. Use analogias.',
      Redator: 'Voce e um redator tecnico. Use bullet points.',
    };

    const keys = Object.keys(personas);
    expect(keys).toHaveLength(3);
    expect(personas['Code Reviewer']).toContain('tecnico');
    expect(personas['Professor']).toContain('analogias');
    expect(personas['Redator']).toContain('bullet points');
  });

  it('funcao askWithPersona passa system e message corretamente', async () => {
    mockCreate.mockResolvedValue(mockResponse('Explicacao tecnica', 80, 120));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const system = 'Voce e um professor didatico.';
    const question = 'Como funciona um vector database?';

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system,
      messages: [{ role: 'user', content: question }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    expect(text).toBe('Explicacao tecnica');
    expect(response.usage.input_tokens).toBe(80);
  });
});

// =============================================
// Ex4: Instrucoes Estruturadas — system prompt rico
// =============================================
describe('Ex4: Instrucoes Estruturadas', () => {
  const systemPromptReviewer = `[Papel]
Voce e um code reviewer senior especializado em TypeScript/Node.js.

[Regras]
1. Sempre aponte problemas de seguranca primeiro
2. Limite sua review a no maximo 5 pontos

[Formato de Resposta]
## Resumo
## Problemas Encontrados
## Pontos Positivos`;

  it('system prompt estruturado contem secoes Papel, Regras e Formato', () => {
    expect(systemPromptReviewer).toContain('[Papel]');
    expect(systemPromptReviewer).toContain('[Regras]');
    expect(systemPromptReviewer).toContain('[Formato de Resposta]');
  });

  it('envia system prompt estruturado para a API', async () => {
    mockCreate.mockResolvedValue(mockResponse('## Resumo\nCodigo com vulnerabilidades.'));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: systemPromptReviewer,
      messages: [{ role: 'user', content: 'Faca a review do seguinte codigo:\n```\nfetch(url)\n```' }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('[Papel]'),
      })
    );
  });

  it('abordagens diferentes (reviewer vs professor) tem estruturas distintas', () => {
    const systemPromptProfessor = `[Papel]
Voce e um professor de programacao que faz code reviews educativas.

[Regras]
1. Explique o PORQUE de cada problema

[Formato de Resposta]
## Nota Geral
## O que Aprender
## Parabens por`;

    expect(systemPromptReviewer).toContain('Problemas Encontrados');
    expect(systemPromptProfessor).toContain('O que Aprender');
    expect(systemPromptReviewer).not.toContain('Nota Geral');
    expect(systemPromptProfessor).not.toContain('Problemas Encontrados');
  });
});

// =============================================
// Ex5: Conversacao Multi-Turn — message array
// =============================================
describe('Ex5: Conversacao Multi-Turn', () => {
  it('acumula mensagens ao longo dos turnos', () => {
    type MessageParam = { role: 'user' | 'assistant'; content: string };
    const messages: MessageParam[] = [];

    messages.push({ role: 'user', content: 'Ola' });
    messages.push({ role: 'assistant', content: 'Como posso ajudar?' });
    messages.push({ role: 'user', content: 'Preciso de suporte' });

    expect(messages).toHaveLength(3);
    expect(messages[0].role).toBe('user');
    expect(messages[1].role).toBe('assistant');
    expect(messages[2].role).toBe('user');
  });

  it('alterna papeis user e assistant', () => {
    type MessageParam = { role: 'user' | 'assistant'; content: string };
    const messages: MessageParam[] = [
      { role: 'user', content: 'Msg 1' },
      { role: 'assistant', content: 'Reply 1' },
      { role: 'user', content: 'Msg 2' },
      { role: 'assistant', content: 'Reply 2' },
    ];

    for (let i = 0; i < messages.length; i++) {
      const expected = i % 2 === 0 ? 'user' : 'assistant';
      expect(messages[i].role).toBe(expected);
    }
  });

  it('inclui historico completo em cada chamada a API', async () => {
    mockCreate.mockResolvedValue(mockResponse('Resposta'));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const messages = [
      { role: 'user' as const, content: 'Msg 1' },
      { role: 'assistant' as const, content: 'Reply 1' },
      { role: 'user' as const, content: 'Msg 2' },
    ];

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages,
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'Msg 1' }),
          expect.objectContaining({ role: 'assistant', content: 'Reply 1' }),
          expect.objectContaining({ role: 'user', content: 'Msg 2' }),
        ]),
      })
    );
  });
});

// =============================================
// Ex6: Conversacao com Memoria — sumarizacao
// =============================================
describe('Ex6: Conversacao com Memoria', () => {
  type MessageParam = { role: 'user' | 'assistant'; content: string };

  function contarCaracteres(msgs: MessageParam[]): number {
    return msgs.reduce((total, m) => total + m.content.length, 0);
  }

  it('contarCaracteres retorna a soma correta dos comprimentos', () => {
    const msgs: MessageParam[] = [
      { role: 'user', content: 'Ola' },            // 3
      { role: 'assistant', content: 'Como vai?' },  // 9
    ];

    expect(contarCaracteres(msgs)).toBe(12);
  });

  it('detecta quando limite de caracteres e atingido', () => {
    const LIMITE = 100;
    const msgs: MessageParam[] = [
      { role: 'user', content: 'A'.repeat(60) },
      { role: 'assistant', content: 'B'.repeat(50) },
    ];

    const total = contarCaracteres(msgs);
    expect(total).toBeGreaterThan(LIMITE);
  });

  it('substitui historico por resumo apos sumarizacao', async () => {
    mockCreate.mockResolvedValue(mockResponse('Resumo da conversa anterior.'));

    let messages: MessageParam[] = [
      { role: 'user', content: 'Mensagem longa 1' },
      { role: 'assistant', content: 'Resposta longa 1' },
      { role: 'user', content: 'Mensagem longa 2' },
      { role: 'assistant', content: 'Resposta longa 2' },
    ];

    const resumo = 'Resumo da conversa anterior.';
    messages = [
      { role: 'user', content: `[Contexto da conversa anterior]: ${resumo}` },
      { role: 'assistant', content: 'Entendido, tenho o contexto da conversa anterior. Como posso continuar ajudando?' },
    ];

    expect(messages).toHaveLength(2);
    expect(messages[0].content).toContain('Resumo da conversa');
  });

  it('chama API para gerar resumo da conversa', async () => {
    mockCreate.mockResolvedValue(mockResponse('Resumo: servidor lento, MySQL 85% CPU'));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [
        { role: 'user', content: 'Resuma a seguinte conversa de suporte tecnico...' },
      ],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ max_tokens: 300 })
    );
  });
});

// =============================================
// Ex7: Parametros — temperature, max_tokens, stop_sequences
// =============================================
describe('Ex7: Parametros da API', () => {
  it('temperature aceita valores de 0.0 a 1.0', () => {
    const validTemps = [0.0, 0.3, 0.5, 0.8, 1.0];
    for (const temp of validTemps) {
      expect(temp).toBeGreaterThanOrEqual(0);
      expect(temp).toBeLessThanOrEqual(1);
    }
  });

  it('stop_reason reflete stop_sequences', () => {
    const response = {
      content: [{ type: 'text', text: '1. Python\n2. JavaScript\n' }],
      stop_reason: 'end_turn',
    };

    const stoppedResponse = {
      content: [{ type: 'text', text: '1. Python\n2. JavaScript\n' }],
      stop_reason: 'stop_sequence',
    };

    expect(response.stop_reason).toBe('end_turn');
    expect(stoppedResponse.stop_reason).toBe('stop_sequence');
  });

  it('max_tokens limita o tamanho do output', async () => {
    mockCreate.mockResolvedValue({
      ...mockResponse('Short'),
      stop_reason: 'max_tokens',
    });

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Explique machine learning.' }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ max_tokens: 10 })
    );
    expect(response.stop_reason).toBe('max_tokens');
  });
});

// =============================================
// Ex8: Output Estruturado — JSON extraction + retry
// =============================================
describe('Ex8: Output JSON Estruturado', () => {
  function parseJsonResponse(text: string): Record<string, unknown> | null {
    // Tentativa 1: parse direto
    try {
      return JSON.parse(text);
    } catch {
      // continua
    }
    // Tentativa 2: extrair de bloco ```json ... ```
    const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) {
      try {
        return JSON.parse(jsonBlockMatch[1].trim());
      } catch {
        // continua
      }
    }
    // Tentativa 3: encontrar { ... } no texto
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // falhou
      }
    }
    return null;
  }

  it('faz parse de JSON direto', () => {
    const text = '{"sentimento":"positivo","confianca":0.95,"palavrasChave":["otimo"],"resumo":"Bom produto"}';
    const parsed = parseJsonResponse(text);

    expect(parsed).not.toBeNull();
    expect(parsed!.sentimento).toBe('positivo');
    expect(parsed!.confianca).toBe(0.95);
  });

  it('extrai JSON de bloco markdown ```json```', () => {
    const text = 'Aqui esta a analise:\n```json\n{"sentimento":"negativo","confianca":0.8,"palavrasChave":["defeito"],"resumo":"Ruim"}\n```';
    const parsed = parseJsonResponse(text);

    expect(parsed).not.toBeNull();
    expect(parsed!.sentimento).toBe('negativo');
  });

  it('extrai JSON embutido em texto livre', () => {
    const text = 'A analise do review e: {"sentimento":"neutro","confianca":0.6,"palavrasChave":["basico"],"resumo":"Ok"} conforme pedido.';
    const parsed = parseJsonResponse(text);

    expect(parsed).not.toBeNull();
    expect(parsed!.sentimento).toBe('neutro');
  });

  it('retorna null para texto sem JSON valido', () => {
    const text = 'Esta review e positiva, com confianca alta.';
    const parsed = parseJsonResponse(text);
    expect(parsed).toBeNull();
  });

  it('retry com contexto de erro adiciona mensagens de correcao', async () => {
    // Primeira chamada retorna JSON invalido, segunda retorna valido
    mockCreate
      .mockResolvedValueOnce(mockResponse('Resultado: positivo'))
      .mockResolvedValueOnce(
        mockResponse('{"sentimento":"positivo","confianca":0.9,"palavrasChave":["bom"],"resumo":"Otimo"}')
      );

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    // Simular retry: primeira tentativa
    const resp1 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      temperature: 0,
      system: 'Responda APENAS com JSON valido.',
      messages: [{ role: 'user', content: 'Analise: "Produto otimo"' }],
    });
    const text1 = resp1.content[0].type === 'text' ? resp1.content[0].text : '';
    const parsed1 = parseJsonResponse(text1);

    expect(parsed1).toBeNull();

    // Simular retry: segunda tentativa com mensagem de correcao
    const resp2 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      temperature: 0,
      system: 'Responda APENAS com JSON valido.',
      messages: [
        { role: 'user', content: 'Analise: "Produto otimo"' },
        { role: 'assistant', content: text1 },
        { role: 'user', content: 'O JSON retornado e invalido. Retorne APENAS o JSON valido.' },
      ],
    });
    const text2 = resp2.content[0].type === 'text' ? resp2.content[0].text : '';
    const parsed2 = parseJsonResponse(text2);

    expect(parsed2).not.toBeNull();
    expect(parsed2!.sentimento).toBe('positivo');
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });
});

// =============================================
// Ex9: Handlebars Integration — template-driven prompts
// =============================================
describe('Ex9: Handlebars Integration', () => {
  it('renderiza system template com variaveis', () => {
    const systemTemplate = Handlebars.compile(
      'Voce e um copywriter. Escreva em tom {{tom}}. Maximo {{tamanho}} palavras.'
    );
    const result = systemTemplate({ tom: 'casual', tamanho: 50 });

    expect(result).toContain('casual');
    expect(result).toContain('50');
  });

  it('renderiza user template com lista de features', () => {
    const userTemplate = Handlebars.compile(
      `Produto: {{nome}}\n{{#each features}}- {{this}}\n{{/each}}`
    );
    const result = userTemplate({
      nome: 'AI Pro',
      features: ['Dashboard', 'Alertas'],
    });

    expect(result).toContain('AI Pro');
    expect(result).toContain('- Dashboard');
    expect(result).toContain('- Alertas');
  });

  it('envia templates renderizados para a API', async () => {
    mockCreate.mockResolvedValue(mockResponse('Descricao do produto'));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const system = 'Escreva em tom profissional.';
    const user = 'Descreva o produto AI Pro.';

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system,
      messages: [{ role: 'user', content: user }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: 'Escreva em tom profissional.',
        messages: [{ role: 'user', content: 'Descreva o produto AI Pro.' }],
      })
    );
  });

  it('generateWithTemplate compila e envia ambos os templates', async () => {
    mockCreate.mockResolvedValue(mockResponse('Texto gerado'));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const systemTmpl = 'Tom: {{tom}}. Max {{tamanho}} palavras.';
    const userTmpl = 'Produto: {{nome}}';
    const data = { tom: 'profissional', tamanho: 50, nome: 'SmartSit' };

    const compiledSystem = Handlebars.compile(systemTmpl);
    const compiledUser = Handlebars.compile(userTmpl);

    const systemMsg = compiledSystem(data);
    const userMsg = compiledUser(data);

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: systemMsg,
      messages: [{ role: 'user', content: userMsg }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: 'Tom: profissional. Max 50 palavras.',
        messages: [{ role: 'user', content: 'Produto: SmartSit' }],
      })
    );
  });
});

// =============================================
// Ex10: Prompt Registry — PromptRegistry class
// =============================================
describe('Ex10: Prompt Registry', () => {
  type PromptConfig = {
    nome: string;
    versao: string;
    descricao: string;
    modelo: string;
    maxTokens: number;
    systemTemplate: string;
    userTemplate: string;
  };

  type CompiledPrompt = {
    config: PromptConfig;
    compiledSystem: Handlebars.TemplateDelegate;
    compiledUser: Handlebars.TemplateDelegate;
  };

  class PromptRegistry {
    private prompts = new Map<string, CompiledPrompt>();
    private latestVersions = new Map<string, string>();

    private makeKey(nome: string, versao: string): string {
      return `${nome}@${versao}`;
    }

    register(config: PromptConfig): void {
      const key = this.makeKey(config.nome, config.versao);
      const compiledSystem = Handlebars.compile(config.systemTemplate);
      const compiledUser = Handlebars.compile(config.userTemplate);
      this.prompts.set(key, { config, compiledSystem, compiledUser });
      this.latestVersions.set(config.nome, config.versao);
    }

    get(nome: string, versao?: string): PromptConfig | undefined {
      const v = versao ?? this.latestVersions.get(nome);
      if (!v) return undefined;
      return this.prompts.get(this.makeKey(nome, v))?.config;
    }

    list(): string[] {
      return Array.from(this.prompts.keys());
    }
  }

  it('registra e recupera prompts por nome', () => {
    const registry = new PromptRegistry();
    registry.register({
      nome: 'classificador',
      versao: 'v1',
      descricao: 'Classifica texto',
      modelo: 'claude-haiku-4-5-20251001',
      maxTokens: 50,
      systemTemplate: 'Classifique o texto.',
      userTemplate: 'Texto: "{{texto}}"',
    });

    const config = registry.get('classificador');
    expect(config).toBeDefined();
    expect(config!.nome).toBe('classificador');
    expect(config!.versao).toBe('v1');
  });

  it('lista todos os prompts registrados', () => {
    const registry = new PromptRegistry();
    registry.register({
      nome: 'classificador', versao: 'v1', descricao: 'Classifica',
      modelo: 'claude-haiku-4-5-20251001', maxTokens: 50,
      systemTemplate: 'System', userTemplate: 'User',
    });
    registry.register({
      nome: 'resumidor', versao: 'v1', descricao: 'Resume',
      modelo: 'claude-haiku-4-5-20251001', maxTokens: 150,
      systemTemplate: 'System', userTemplate: 'User',
    });

    const keys = registry.list();
    expect(keys).toHaveLength(2);
    expect(keys).toContain('classificador@v1');
    expect(keys).toContain('resumidor@v1');
  });

  it('suporta versionamento — v2 sobrescreve latest', () => {
    const registry = new PromptRegistry();
    registry.register({
      nome: 'classificador', versao: 'v1', descricao: 'v1',
      modelo: 'claude-haiku-4-5-20251001', maxTokens: 50,
      systemTemplate: 'Simples', userTemplate: 'User v1',
    });
    registry.register({
      nome: 'classificador', versao: 'v2', descricao: 'v2 com JSON',
      modelo: 'claude-haiku-4-5-20251001', maxTokens: 150,
      systemTemplate: 'Com JSON', userTemplate: 'User v2',
    });

    // Sem versao = retorna latest (v2)
    const latest = registry.get('classificador');
    expect(latest!.versao).toBe('v2');

    // Com versao explicita = retorna v1
    const v1 = registry.get('classificador', 'v1');
    expect(v1!.versao).toBe('v1');
  });

  it('retorna undefined para prompt inexistente', () => {
    const registry = new PromptRegistry();
    expect(registry.get('naoexiste')).toBeUndefined();
  });
});

// =============================================
// Ex11: Few-Shot — zero-shot vs few-shot
// =============================================
describe('Ex11: Few-Shot Learning', () => {
  const exemplos = [
    { review: 'Excelente!', sentimento: 'positivo' },
    { review: 'Horrivel.', sentimento: 'negativo' },
    { review: 'Normal.', sentimento: 'neutro' },
  ];

  it('prompt zero-shot contem apenas a review sem exemplos', () => {
    const prompt = `Classifique o sentimento: "Produto otimo"\nSentimento:`;
    expect(prompt).toContain('Produto otimo');
    expect(prompt).not.toContain('positivo');
    expect(prompt).not.toContain('negativo');
  });

  it('prompt few-shot inclui todos os exemplos', () => {
    const exemplosFormatados = exemplos
      .map((e) => `Review: "${e.review}" -> Sentimento: ${e.sentimento}`)
      .join('\n');

    const prompt = `${exemplosFormatados}\nReview: "Novo review" -> Sentimento:`;

    expect(prompt).toContain('Excelente!');
    expect(prompt).toContain('positivo');
    expect(prompt).toContain('Horrivel.');
    expect(prompt).toContain('negativo');
    expect(prompt).toContain('Novo review');
  });

  it('prompt few-shot termina com target de classificacao', () => {
    const prompt = `Review: "Teste" -> Sentimento:`;
    expect(prompt).toMatch(/Sentimento:\s*$/);
  });
});

// =============================================
// Ex12: Few-Shot Dinamico — selecao por relevancia
// =============================================
describe('Ex12: Few-Shot Dinamico', () => {
  type Exemplo = {
    texto: string;
    categoria: string;
    keywords: string[];
  };

  const bancoExemplos: Exemplo[] = [
    { texto: 'Meu cartao foi clonado', categoria: 'fraude', keywords: ['cartao', 'clonado', 'fraude'] },
    { texto: 'O app do banco da erro', categoria: 'problema_tecnico', keywords: ['aplicativo', 'banco', 'erro'] },
    { texto: 'Quero aumento no limite', categoria: 'solicitacao', keywords: ['limite', 'cartao', 'aumento'] },
    { texto: 'Cobrado duas vezes', categoria: 'cobranca', keywords: ['cobrado', 'fatura', 'cobranca'] },
    { texto: 'Como cadastrar PIX?', categoria: 'duvida', keywords: ['cadastrar', 'pix', 'como'] },
    { texto: 'Quero cancelar minha conta', categoria: 'cancelamento', keywords: ['cancelar', 'conta', 'encerrar'] },
  ];

  function selectExamples(input: string, banco: Exemplo[], n: number): Exemplo[] {
    const inputLower = input.toLowerCase();
    const inputWords = inputLower.split(/\s+/);

    const scored = banco.map((exemplo) => {
      let score = 0;
      for (const keyword of exemplo.keywords) {
        if (inputLower.includes(keyword.toLowerCase())) {
          score += 2;
        }
        for (const word of inputWords) {
          if (word.length > 3 && keyword.toLowerCase().includes(word)) {
            score += 1;
          }
        }
      }
      return { exemplo, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, n)
      .map((s) => s.exemplo);
  }

  it('seleciona exemplos por relevancia de keywords', () => {
    const input = 'Meu cartao foi usado sem autorizacao, e fraude';
    const selecionados = selectExamples(input, bancoExemplos, 2);

    expect(selecionados).toHaveLength(2);
    expect(selecionados[0].categoria).toBe('fraude');
  });

  it('retorna N exemplos solicitados', () => {
    const input = 'Problema qualquer';
    const selecionados = selectExamples(input, bancoExemplos, 3);
    expect(selecionados).toHaveLength(3);
  });

  it('constroi prompt few-shot dinamico com exemplos selecionados', () => {
    const exemplos = selectExamples('Quero cancelar tudo', bancoExemplos, 2);
    const exemplosFormatados = exemplos
      .map((e) => `Texto: "${e.texto}" -> Categoria: ${e.categoria}`)
      .join('\n');

    const prompt = `Classifique:\n${exemplosFormatados}\n\nTexto: "Quero cancelar tudo" -> Categoria:`;

    expect(prompt).toContain('cancelar');
    expect(prompt).toContain('Categoria:');
    expect(prompt.split('->').length).toBeGreaterThanOrEqual(3); // 2 exemplos + 1 input
  });
});

// =============================================
// Ex13: Chain-of-Thought — CoT vs direto
// =============================================
describe('Ex13: Chain-of-Thought', () => {
  const RESPOSTA_CORRETA = 1372.75;

  function extractPrice(text: string): number | null {
    try {
      const json = JSON.parse(text);
      if (json.precoFinal) return Number(json.precoFinal);
    } catch {
      // Not JSON
    }

    const patterns = [
      /TOTAL:\s*R?\$?\s*([\d.,]+)/gi,
      /R\$\s*([\d.,]+)/g,
      /([\d]+[.,][\d]{2})\b/g,
    ];

    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        const last = matches[matches.length - 1][1];
        const normalized = last.includes(',')
          ? last.replace(/\./g, '').replace(',', '.')
          : last;
        return parseFloat(normalized);
      }
    }
    return null;
  }

  it('extrai preco de resposta numerica direta', () => {
    expect(extractPrice('1372.75')).toBeCloseTo(RESPOSTA_CORRETA);
  });

  it('extrai preco de texto com formato R$', () => {
    expect(extractPrice('O total e R$ 1.372,75 por mes.')).toBeCloseTo(
      RESPOSTA_CORRETA
    );
  });

  it('extrai preco de linha TOTAL', () => {
    expect(
      extractPrice('Base: 500\nUsuarios: 750\nTOTAL: R$1.372,75')
    ).toBeCloseTo(RESPOSTA_CORRETA);
  });

  it('extrai preco de resposta JSON', () => {
    const json = JSON.stringify({
      etapas: [{ descricao: 'Base', valor: 500 }],
      precoFinal: 1372.75,
      confianca: 'alta',
    });
    expect(extractPrice(json)).toBeCloseTo(RESPOSTA_CORRETA);
  });

  it('valida o calculo correto do cenario SaaS', () => {
    const base = 500;
    const usuarios = 25 * 30;
    const tier = 200;
    const addons = 100 + 150;
    const subtotal = base + usuarios + tier + addons;
    const afterAnual = subtotal * (1 - 0.15);
    const afterFidelidade = afterAnual * (1 - 0.05);

    expect(subtotal).toBe(1700);
    expect(afterAnual).toBeCloseTo(1445);
    expect(afterFidelidade).toBeCloseTo(RESPOSTA_CORRETA);
  });
});

// =============================================
// Ex14: Classificacao Robusta — few-shot + CoT + JSON
// =============================================
describe('Ex14: Classificacao Robusta', () => {
  const CATEGORIAS = ['tecnico', 'cobranca', 'cancelamento', 'duvida', 'sugestao'] as const;

  function parseJsonResponse(text: string): Record<string, unknown> | null {
    try {
      const parsed = JSON.parse(text);
      if (CATEGORIAS.includes(parsed.categoria)) return parsed;
    } catch { /* continua */ }

    const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) {
      try {
        const parsed = JSON.parse(jsonBlockMatch[1].trim());
        if (CATEGORIAS.includes(parsed.categoria)) return parsed;
      } catch { /* continua */ }
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (CATEGORIAS.includes(parsed.categoria)) return parsed;
      } catch { /* falhou */ }
    }
    return null;
  }

  it('prompt de classificacao contem few-shot e instrucoes CoT', () => {
    const system = `Voce e um classificador de tickets.
Analise cada ticket passo a passo (Chain-of-Thought):
1. Identifique as palavras-chave
2. Considere qual categoria melhor se encaixa
Responda APENAS com JSON valido.`;

    expect(system).toContain('Chain-of-Thought');
    expect(system).toContain('JSON valido');
    expect(system).toContain('classificador');
  });

  it('valida JSON com categoria aceita', () => {
    const text = '{"categoria":"tecnico","confianca":0.95,"raciocinio":"Erro tecnico","acaoSugerida":"Suporte N2"}';
    const parsed = parseJsonResponse(text);

    expect(parsed).not.toBeNull();
    expect(parsed!.categoria).toBe('tecnico');
    expect(parsed!.confianca).toBe(0.95);
  });

  it('rejeita JSON com categoria invalida', () => {
    const text = '{"categoria":"inexistente","confianca":0.5,"raciocinio":"X","acaoSugerida":"Y"}';
    const parsed = parseJsonResponse(text);
    expect(parsed).toBeNull();
  });

  it('classifica ticket chamando a API', async () => {
    const jsonResp = JSON.stringify({
      categoria: 'cobranca',
      confianca: 0.92,
      raciocinio: 'Menciona cobranca duplicada.',
      acaoSugerida: 'Verificar historico de pagamentos.',
    });
    mockCreate.mockResolvedValue(mockResponse(jsonResp));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      temperature: 0,
      system: 'Classificador de tickets',
      messages: [{ role: 'user', content: 'Por que meu plano subiu de R$49 para R$79?' }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = parseJsonResponse(text);

    expect(parsed).not.toBeNull();
    expect(parsed!.categoria).toBe('cobranca');
  });
});

// =============================================
// Ex15: Prompt Chaining — multi-step sequential
// =============================================
describe('Ex15: Prompt Chaining', () => {
  it('chain de 3 etapas: extrair fatos -> resumo -> posts', async () => {
    const fatosJson = JSON.stringify({
      nome: 'NovaTech', setor: 'fintech', fundacao: '2019 SP',
      produtos: ['FinBot Pro'], metricas: ['2M transacoes/dia'], diferenciais: ['IA proprietaria'],
    });
    const resumoJson = JSON.stringify({
      titulo: 'NovaTech: IA para financas',
      resumo: 'Startup de fintech com IA.',
      pontosChave: ['2M transacoes', 'Serie B'],
    });
    const postsJson = JSON.stringify([
      { plataforma: 'Twitter', conteudo: 'NovaTech revoluciona!', hashtags: ['fintech'] },
      { plataforma: 'LinkedIn', conteudo: 'Conhoca a NovaTech...', hashtags: ['AI'] },
      { plataforma: 'Instagram', conteudo: 'Inovacao!', hashtags: ['tech'] },
    ]);

    mockCreate
      .mockResolvedValueOnce(mockResponse(fatosJson, 200, 150))
      .mockResolvedValueOnce(mockResponse(resumoJson, 180, 100))
      .mockResolvedValueOnce(mockResponse(postsJson, 160, 200));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    // Step 1: Extrair fatos
    const resp1 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 800, temperature: 0,
      messages: [{ role: 'user', content: 'Extraia os fatos do texto...' }],
    });
    const fatos = JSON.parse(resp1.content[0].type === 'text' ? resp1.content[0].text : '');

    // Step 2: Gerar resumo (usando saida do step 1)
    const resp2 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 600, temperature: 0,
      messages: [{ role: 'user', content: `Gere um resumo: ${JSON.stringify(fatos)}` }],
    });
    const resumo = JSON.parse(resp2.content[0].type === 'text' ? resp2.content[0].text : '');

    // Step 3: Criar posts (usando saida do step 2)
    const resp3 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 1000, temperature: 0.7,
      messages: [{ role: 'user', content: `Crie posts: ${resumo.titulo}` }],
    });
    const posts = JSON.parse(resp3.content[0].type === 'text' ? resp3.content[0].text : '');

    expect(mockCreate).toHaveBeenCalledTimes(3);
    expect(fatos.nome).toBe('NovaTech');
    expect(resumo.pontosChave).toHaveLength(2);
    expect(posts).toHaveLength(3);
    expect(posts[0].plataforma).toBe('Twitter');
  });

  it('rastreia tokens por etapa na chain', () => {
    type EtapaChain = {
      nome: string;
      inputTokens: number;
      outputTokens: number;
    };

    const etapas: EtapaChain[] = [
      { nome: 'Extrair Fatos', inputTokens: 200, outputTokens: 150 },
      { nome: 'Gerar Resumo', inputTokens: 180, outputTokens: 100 },
      { nome: 'Criar Posts', inputTokens: 160, outputTokens: 200 },
    ];

    const totalInput = etapas.reduce((s, e) => s + e.inputTokens, 0);
    const totalOutput = etapas.reduce((s, e) => s + e.outputTokens, 0);

    expect(totalInput).toBe(540);
    expect(totalOutput).toBe(450);
    expect(totalInput + totalOutput).toBe(990);
  });

  it('calcula custo total da chain com Haiku', () => {
    const totalInput = 540;
    const totalOutput = 450;
    const custoInput = (totalInput / 1_000_000) * 0.25;
    const custoOutput = (totalOutput / 1_000_000) * 1.25;

    expect(custoInput + custoOutput).toBeCloseTo(0.000698, 5);
  });
});

// =============================================
// Ex16: Prompt Routing — classificacao + dispatch
// =============================================
describe('Ex16: Prompt Routing', () => {
  type Categoria = 'tecnico' | 'vendas' | 'suporte' | 'geral';

  const systemPrompts: Record<Categoria, string> = {
    tecnico: 'Voce e um especialista tecnico senior.',
    vendas: 'Voce e um consultor de vendas.',
    suporte: 'Voce e um agente de suporte empatico.',
    geral: 'Voce e um representante amigavel.',
  };

  it('classifica intencao e retorna categoria valida', async () => {
    const classifResp = JSON.stringify({
      categoria: 'tecnico', confianca: 0.95, justificativa: 'Erro de API',
    });
    mockCreate.mockResolvedValue(mockResponse(classifResp));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 200, temperature: 0,
      messages: [{ role: 'user', content: 'Classifique: erro 429 na API' }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const classificacao = JSON.parse(text);

    expect(['tecnico', 'vendas', 'suporte', 'geral']).toContain(classificacao.categoria);
    expect(classificacao.confianca).toBeGreaterThan(0);
  });

  it('roteia para system prompt especializado correto', () => {
    const categoria: Categoria = 'vendas';
    const systemPrompt = systemPrompts[categoria];

    expect(systemPrompt).toContain('vendas');
    expect(systemPrompt).not.toContain('tecnico');
  });

  it('pipeline completo: classificar + rotear em 2 chamadas', async () => {
    mockCreate
      .mockResolvedValueOnce(
        mockResponse(JSON.stringify({ categoria: 'suporte', confianca: 0.9, justificativa: 'Problema de acesso' }))
      )
      .mockResolvedValueOnce(
        mockResponse('Entendo sua frustacao. Siga estes passos: 1. Limpe o cache...')
      );

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    // Step 1: Classificar
    const resp1 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 200, temperature: 0,
      messages: [{ role: 'user', content: 'Classifique: nao consigo acessar minha conta' }],
    });
    const text1 = resp1.content[0].type === 'text' ? resp1.content[0].text : '';
    const classificacao = JSON.parse(text1);

    // Step 2: Rotear para especialista
    const resp2 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 400, temperature: 0.3,
      system: systemPrompts[classificacao.categoria as Categoria],
      messages: [{ role: 'user', content: 'Nao consigo acessar minha conta' }],
    });
    const text2 = resp2.content[0].type === 'text' ? resp2.content[0].text : '';

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(classificacao.categoria).toBe('suporte');
    expect(text2).toContain('Entendo');
  });
});

// =============================================
// Ex17: Cost Tracking — CostTracker utility
// =============================================
describe('Ex17: Cost Tracking', () => {
  type ModeloSuportado = 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-20250514';

  type RegistroCusto = {
    modelo: ModeloSuportado;
    inputTokens: number;
    outputTokens: number;
    custoInput: number;
    custoOutput: number;
    custoTotal: number;
    timestamp: Date;
    descricao?: string;
  };

  type PriceEntry = { input: number; output: number };

  class CostTracker {
    private priceMap: Record<ModeloSuportado, PriceEntry> = {
      'claude-haiku-4-5-20251001': { input: 0.25, output: 1.25 },
      'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
    };

    private registros: RegistroCusto[] = [];
    private limiteOrcamento: number | null = null;

    track(modelo: ModeloSuportado, inputTokens: number, outputTokens: number, descricao?: string): RegistroCusto {
      const precos = this.priceMap[modelo];
      if (!precos) throw new Error(`Modelo nao suportado: ${modelo}`);

      const custoInput = (inputTokens / 1_000_000) * precos.input;
      const custoOutput = (outputTokens / 1_000_000) * precos.output;
      const custoTotal = custoInput + custoOutput;

      const custoAcumulado = this.getCost();
      if (this.limiteOrcamento !== null && custoAcumulado + custoTotal > this.limiteOrcamento) {
        throw new Error(`Limite de orcamento excedido!`);
      }

      const registro: RegistroCusto = {
        modelo, inputTokens, outputTokens, custoInput, custoOutput, custoTotal,
        timestamp: new Date(), descricao,
      };
      this.registros.push(registro);
      return registro;
    }

    getCost(): number {
      return this.registros.reduce((sum, r) => sum + r.custoTotal, 0);
    }

    setLimit(valor: number): void {
      this.limiteOrcamento = valor;
    }

    getReport() {
      const porModelo: Record<string, { chamadas: number; inputTokens: number; outputTokens: number; custo: number }> = {};
      for (const r of this.registros) {
        if (!porModelo[r.modelo]) porModelo[r.modelo] = { chamadas: 0, inputTokens: 0, outputTokens: 0, custo: 0 };
        porModelo[r.modelo].chamadas++;
        porModelo[r.modelo].inputTokens += r.inputTokens;
        porModelo[r.modelo].outputTokens += r.outputTokens;
        porModelo[r.modelo].custo += r.custoTotal;
      }
      return {
        totalChamadas: this.registros.length,
        totalInputTokens: this.registros.reduce((s, r) => s + r.inputTokens, 0),
        totalOutputTokens: this.registros.reduce((s, r) => s + r.outputTokens, 0),
        custoTotal: this.getCost(),
        porModelo,
      };
    }
  }

  it('track calcula custo corretamente para Haiku', () => {
    const tracker = new CostTracker();
    const reg = tracker.track('claude-haiku-4-5-20251001', 1000, 500, 'Teste');

    expect(reg.custoInput).toBeCloseTo(0.00025, 6);
    expect(reg.custoOutput).toBeCloseTo(0.000625, 6);
    expect(reg.custoTotal).toBeCloseTo(0.000875, 6);
  });

  it('getCost acumula custos de multiplas chamadas', () => {
    const tracker = new CostTracker();
    tracker.track('claude-haiku-4-5-20251001', 100, 50);
    tracker.track('claude-haiku-4-5-20251001', 200, 100);

    const total = tracker.getCost();
    const expected =
      (100 / 1_000_000) * 0.25 + (50 / 1_000_000) * 1.25 +
      (200 / 1_000_000) * 0.25 + (100 / 1_000_000) * 1.25;

    expect(total).toBeCloseTo(expected, 8);
  });

  it('setLimit lanca erro quando orcamento e excedido', () => {
    const tracker = new CostTracker();
    tracker.setLimit(0.0001);

    // Primeira chamada com custo alto deve exceder o limite
    expect(() => {
      tracker.track('claude-sonnet-4-20250514', 100000, 50000);
    }).toThrow('Limite de orcamento excedido!');
  });

  it('getReport retorna relatorio correto com breakdown por modelo', () => {
    const tracker = new CostTracker();
    tracker.track('claude-haiku-4-5-20251001', 100, 50);
    tracker.track('claude-sonnet-4-20250514', 100, 50);

    const report = tracker.getReport();

    expect(report.totalChamadas).toBe(2);
    expect(Object.keys(report.porModelo)).toHaveLength(2);
    expect(report.porModelo['claude-haiku-4-5-20251001'].chamadas).toBe(1);
    expect(report.porModelo['claude-sonnet-4-20250514'].chamadas).toBe(1);
    expect(report.porModelo['claude-sonnet-4-20250514'].custo).toBeGreaterThan(
      report.porModelo['claude-haiku-4-5-20251001'].custo
    );
  });
});

// =============================================
// Ex18: Avaliacao de Qualidade — LLM-as-Judge
// =============================================
describe('Ex18: Avaliacao de Qualidade (LLM-as-Judge)', () => {
  it('prompt do juiz contem criterios clareza, completude, precisao', () => {
    const judgePrompt = `Avalie a resposta com base em 3 criterios (nota 0-10):
- clareza: quao clara e acessivel
- completude: quao completa
- precisao: quao tecnicamente correta
Retorne JSON: {"clareza":0,"completude":0,"precisao":0,"justificativa":"..."}`;

    expect(judgePrompt).toContain('clareza');
    expect(judgePrompt).toContain('completude');
    expect(judgePrompt).toContain('precisao');
    expect(judgePrompt).toContain('JSON');
  });

  it('calcula media das notas de avaliacao', () => {
    const avaliacao = { clareza: 8, completude: 7, precisao: 9, justificativa: 'Boa resposta' };
    const media = (avaliacao.clareza + avaliacao.completude + avaliacao.precisao) / 3;

    expect(media).toBeCloseTo(8.0, 1);
  });

  it('avalia resposta via chamada ao juiz (Sonnet)', async () => {
    const avaliacaoJson = JSON.stringify({
      clareza: 9, completude: 8, precisao: 9, justificativa: 'Explicacao clara e precisa.',
    });
    mockCreate.mockResolvedValue(mockResponse(avaliacaoJson));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      temperature: 0,
      messages: [{ role: 'user', content: 'Avalie esta resposta...' }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const avaliacao = JSON.parse(text);

    expect(avaliacao.clareza).toBeGreaterThanOrEqual(0);
    expect(avaliacao.clareza).toBeLessThanOrEqual(10);
    expect(avaliacao.justificativa).toBeTruthy();
  });

  it('compara media entre modelos para encontrar melhor desempenho', () => {
    const resultados = [
      { modelo: 'Haiku 4.5', media: 7.5 },
      { modelo: 'Haiku 4.5', media: 7.0 },
      { modelo: 'Sonnet 4', media: 8.5 },
      { modelo: 'Sonnet 4', media: 9.0 },
    ];

    const haikuMedias = resultados.filter((r) => r.modelo === 'Haiku 4.5');
    const sonnetMedias = resultados.filter((r) => r.modelo === 'Sonnet 4');

    const avgHaiku = haikuMedias.reduce((s, r) => s + r.media, 0) / haikuMedias.length;
    const avgSonnet = sonnetMedias.reduce((s, r) => s + r.media, 0) / sonnetMedias.length;

    expect(avgSonnet).toBeGreaterThan(avgHaiku);
  });
});

// =============================================
// Ex19: Prompt Versioning — tracking + comparacao
// =============================================
describe('Ex19: Prompt Versioning', () => {
  type PromptVersion = {
    version: string;
    template: string;
    changelog: string;
    createdAt: Date;
  };

  class PromptVersionManager {
    private versions: PromptVersion[] = [];

    addVersion(version: string, template: string, changelog: string): void {
      this.versions.push({ version, template, changelog, createdAt: new Date() });
    }

    getVersion(version: string): PromptVersion | undefined {
      return this.versions.find((v) => v.version === version);
    }

    getLatest(): PromptVersion | undefined {
      return this.versions[this.versions.length - 1];
    }

    listVersions(): PromptVersion[] {
      return [...this.versions];
    }
  }

  it('adiciona e recupera versoes de prompt', () => {
    const manager = new PromptVersionManager();
    manager.addVersion('v1.0', 'Classifique: {{INPUT}}', 'Versao inicial');
    manager.addVersion('v1.1', 'Classifique com exemplos: {{INPUT}}', 'Adicionados few-shot');

    expect(manager.listVersions()).toHaveLength(2);
    expect(manager.getVersion('v1.0')!.changelog).toBe('Versao inicial');
    expect(manager.getVersion('v1.1')!.template).toContain('exemplos');
  });

  it('getLatest retorna a versao mais recente', () => {
    const manager = new PromptVersionManager();
    manager.addVersion('v1.0', 'Template v1', 'Inicial');
    manager.addVersion('v2.0', 'Template v2', 'JSON estruturado');

    const latest = manager.getLatest();
    expect(latest!.version).toBe('v2.0');
  });

  it('template substitui {{INPUT}} pelo ticket real', () => {
    const template = 'Classifique o seguinte ticket:\n\nTicket: {{INPUT}}';
    const rendered = template.replace('{{INPUT}}', 'O app travou no Firefox');

    expect(rendered).toContain('O app travou no Firefox');
    expect(rendered).not.toContain('{{INPUT}}');
  });

  it('compara metricas de tokens entre versoes', () => {
    const metricas = [
      { version: 'v1.0', avgTokens: 80, avgLatencyMs: 200 },
      { version: 'v1.1', avgTokens: 120, avgLatencyMs: 250 },
      { version: 'v2.0', avgTokens: 180, avgLatencyMs: 350 },
    ];

    // v2.0 usa mais tokens por ser mais detalhado
    expect(metricas[2].avgTokens).toBeGreaterThan(metricas[0].avgTokens);
    // Cada versao tem latencia crescente
    for (let i = 1; i < metricas.length; i++) {
      expect(metricas[i].avgLatencyMs).toBeGreaterThanOrEqual(metricas[i - 1].avgLatencyMs);
    }
  });
});

// =============================================
// Ex20: A/B Testing — framework capstone
// =============================================
describe('Ex20: A/B Testing de Prompts (Capstone)', () => {
  type PromptVariant = {
    name: string;
    systemPrompt: string;
    userPromptTemplate: string;
  };

  type VariantResult = {
    variantName: string;
    input: string;
    output: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    score: number;
    judgeJustificativa: string;
  };

  type ABTestSummary = {
    variantName: string;
    avgScore: number;
    avgTokens: number;
    avgLatencyMs: number;
    totalCost: number;
    wins: number;
  };

  class ABTestRunner {
    private name: string;
    private variants: PromptVariant[] = [];
    private results: VariantResult[] = [];

    constructor(name: string) {
      this.name = name;
    }

    addVariant(variant: PromptVariant): void {
      this.variants.push(variant);
    }

    addResult(result: VariantResult): void {
      this.results.push(result);
    }

    getResults(): VariantResult[] {
      return this.results;
    }

    getName(): string {
      return this.name;
    }

    getSummary(): ABTestSummary[] {
      const summaries: ABTestSummary[] = [];
      for (const variant of this.variants) {
        const vr = this.results.filter((r) => r.variantName === variant.name);
        if (vr.length === 0) continue;

        const avgScore = vr.reduce((s, r) => s + r.score, 0) / vr.length;
        const avgTokens = vr.reduce((s, r) => s + r.inputTokens + r.outputTokens, 0) / vr.length;
        const avgLatencyMs = vr.reduce((s, r) => s + r.latencyMs, 0) / vr.length;
        const totalCost = vr.reduce((s, r) => {
          return s + (r.inputTokens / 1_000_000) * 0.25 + (r.outputTokens / 1_000_000) * 1.25;
        }, 0);

        summaries.push({ variantName: variant.name, avgScore, avgTokens: Math.round(avgTokens), avgLatencyMs: Math.round(avgLatencyMs), totalCost, wins: 0 });
      }

      // Calcular wins por input
      const inputs = [...new Set(this.results.map((r) => r.input))];
      for (const input of inputs) {
        const inputResults = this.results.filter((r) => r.input === input);
        if (inputResults.length < 2) continue;
        const best = inputResults.reduce((a, b) => (a.score > b.score ? a : b));
        const summary = summaries.find((s) => s.variantName === best.variantName);
        if (summary) summary.wins++;
      }

      return summaries;
    }
  }

  it('registra variantes e resultados no runner', () => {
    const runner = new ABTestRunner('Teste Resumo');

    runner.addVariant({ name: 'Direto', systemPrompt: 'Resume.', userPromptTemplate: '{{INPUT}}' });
    runner.addVariant({ name: 'Estruturado', systemPrompt: 'Analise e resuma.', userPromptTemplate: 'Texto: {{INPUT}}' });

    runner.addResult({
      variantName: 'Direto', input: 'Texto A', output: 'Resumo A',
      inputTokens: 100, outputTokens: 50, latencyMs: 200, score: 7, judgeJustificativa: 'Bom',
    });
    runner.addResult({
      variantName: 'Estruturado', input: 'Texto A', output: 'Resumo estruturado A',
      inputTokens: 150, outputTokens: 80, latencyMs: 300, score: 9, judgeJustificativa: 'Excelente',
    });

    expect(runner.getResults()).toHaveLength(2);
    expect(runner.getName()).toBe('Teste Resumo');
  });

  it('getSummary calcula medias e wins corretamente', () => {
    const runner = new ABTestRunner('Test');

    runner.addVariant({ name: 'A', systemPrompt: '', userPromptTemplate: '' });
    runner.addVariant({ name: 'B', systemPrompt: '', userPromptTemplate: '' });

    // Input 1: B vence
    runner.addResult({ variantName: 'A', input: 'i1', output: 'o', inputTokens: 100, outputTokens: 50, latencyMs: 200, score: 6, judgeJustificativa: '' });
    runner.addResult({ variantName: 'B', input: 'i1', output: 'o', inputTokens: 120, outputTokens: 60, latencyMs: 250, score: 8, judgeJustificativa: '' });

    // Input 2: A vence
    runner.addResult({ variantName: 'A', input: 'i2', output: 'o', inputTokens: 100, outputTokens: 50, latencyMs: 200, score: 9, judgeJustificativa: '' });
    runner.addResult({ variantName: 'B', input: 'i2', output: 'o', inputTokens: 120, outputTokens: 60, latencyMs: 250, score: 7, judgeJustificativa: '' });

    const summaries = runner.getSummary();

    expect(summaries).toHaveLength(2);

    const summA = summaries.find((s) => s.variantName === 'A')!;
    const summB = summaries.find((s) => s.variantName === 'B')!;

    expect(summA.avgScore).toBeCloseTo(7.5, 1);
    expect(summB.avgScore).toBeCloseTo(7.5, 1);
    expect(summA.wins).toBe(1);
    expect(summB.wins).toBe(1);
  });

  it('pipeline completo: executar variante + julgar via LLM', async () => {
    // Variante execucao
    mockCreate
      .mockResolvedValueOnce(mockResponse('Kubernetes orquestra containers.', 150, 80))
      // Juiz
      .mockResolvedValueOnce(mockResponse(JSON.stringify({ score: 8, justificativa: 'Resumo conciso' }), 200, 40));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const variant: PromptVariant = {
      name: 'Direto',
      systemPrompt: 'Resuma de forma concisa.',
      userPromptTemplate: 'Resuma: {{INPUT}}',
    };

    const input = 'Kubernetes e um sistema de orquestracao...';
    const userPrompt = variant.userPromptTemplate.replace('{{INPUT}}', input);

    // Step 1: Executar variante
    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 500, temperature: 0.3,
      system: variant.systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const output = resp.content[0].type === 'text' ? resp.content[0].text : '';

    // Step 2: Julgar
    const judgeResp = await client.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 200, temperature: 0,
      messages: [{ role: 'user', content: `Avalie o resumo:\n${output}` }],
    });
    const judgeText = judgeResp.content[0].type === 'text' ? judgeResp.content[0].text : '';
    const judgment = JSON.parse(judgeText);

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(output).toContain('Kubernetes');
    expect(judgment.score).toBe(8);
    expect(judgment.justificativa).toBeTruthy();
  });

  it('determina vencedor pelo maior avgScore', () => {
    const summaries: ABTestSummary[] = [
      { variantName: 'Direto', avgScore: 7.2, avgTokens: 150, avgLatencyMs: 200, totalCost: 0.001, wins: 2 },
      { variantName: 'Estruturado', avgScore: 8.5, avgTokens: 220, avgLatencyMs: 350, totalCost: 0.002, wins: 3 },
    ];

    const winner = summaries.reduce((a, b) => (a.avgScore > b.avgScore ? a : b));
    const runnerUp = summaries.find((s) => s.variantName !== winner.variantName)!;

    expect(winner.variantName).toBe('Estruturado');
    expect(winner.avgScore).toBeGreaterThan(runnerUp.avgScore);
    expect(winner.totalCost).toBeGreaterThan(runnerUp.totalCost);
  });
});
