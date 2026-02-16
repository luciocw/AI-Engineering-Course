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
// Ex1: Hello World — response parsing + cost
// =============================================
describe('Ex1: Response Parsing', () => {
  it('extracts text from content array', () => {
    const response = mockResponse('AI Engineering e a disciplina...');
    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';

    expect(text).toBe('AI Engineering e a disciplina...');
  });

  it('calculates cost correctly for Haiku', () => {
    const usage = { input_tokens: 100, output_tokens: 200 };
    const custoInput = (usage.input_tokens / 1_000_000) * 0.25;
    const custoOutput = (usage.output_tokens / 1_000_000) * 1.25;
    const total = custoInput + custoOutput;

    expect(custoInput).toBeCloseTo(0.000025, 6);
    expect(custoOutput).toBeCloseTo(0.00025, 6);
    expect(total).toBeCloseTo(0.000275, 6);
  });

  it('calculates cost correctly for Sonnet', () => {
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
// Ex2: System Prompts — persona construction
// =============================================
describe('Ex2: System Prompts', () => {
  it('passes system prompt to API call', async () => {
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

  it('different personas produce different system prompts', () => {
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
});

// =============================================
// Ex3: Multi-turn — message array building
// =============================================
describe('Ex3: Multi-turn Conversation', () => {
  it('accumulates messages across turns', () => {
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

  it('alternates user and assistant roles', () => {
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

  it('includes full history in each API call', async () => {
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
// Ex4: Parameters — validation
// =============================================
describe('Ex4: API Parameters', () => {
  it('temperature range is 0.0 to 1.0', () => {
    const validTemps = [0.0, 0.3, 0.5, 0.8, 1.0];
    for (const temp of validTemps) {
      expect(temp).toBeGreaterThanOrEqual(0);
      expect(temp).toBeLessThanOrEqual(1);
    }
  });

  it('stop_reason reflects stop_sequences', () => {
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

  it('max_tokens limits output length', async () => {
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
// Ex5: Handlebars + API — template rendering
// =============================================
describe('Ex5: Handlebars Integration', () => {
  it('renders system template with variables', () => {
    const systemTemplate = Handlebars.compile(
      'Voce e um copywriter. Escreva em tom {{tom}}. Maximo {{tamanho}} palavras.'
    );
    const result = systemTemplate({ tom: 'casual', tamanho: 50 });

    expect(result).toContain('casual');
    expect(result).toContain('50');
  });

  it('renders user template with features list', () => {
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

  it('passes rendered templates to API', async () => {
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
});

// =============================================
// Ex6: Few-shot — prompt construction
// =============================================
describe('Ex6: Few-Shot Prompts', () => {
  const exemplos = [
    { review: 'Excelente!', sentimento: 'positivo' },
    { review: 'Horrivel.', sentimento: 'negativo' },
    { review: 'Normal.', sentimento: 'neutro' },
  ];

  it('zero-shot prompt contains only the review', () => {
    const prompt = `Classifique o sentimento: "Produto otimo"\nSentimento:`;
    expect(prompt).toContain('Produto otimo');
    expect(prompt).not.toContain('positivo');
    expect(prompt).not.toContain('negativo');
  });

  it('few-shot prompt includes all examples', () => {
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

  it('few-shot prompt ends with classification target', () => {
    const prompt = `Review: "Teste" -> Sentimento:`;
    expect(prompt).toMatch(/Sentimento:\s*$/);
  });
});

// =============================================
// Ex7: Chain-of-Thought — price extraction
// =============================================
describe('Ex7: Chain-of-Thought', () => {
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

  it('extracts price from direct numeric response', () => {
    expect(extractPrice('1372.75')).toBeCloseTo(RESPOSTA_CORRETA);
  });

  it('extracts price from R$ formatted text', () => {
    expect(extractPrice('O total e R$ 1.372,75 por mes.')).toBeCloseTo(
      RESPOSTA_CORRETA
    );
  });

  it('extracts price from TOTAL line', () => {
    expect(
      extractPrice('Base: 500\nUsuarios: 750\nTOTAL: R$1.372,75')
    ).toBeCloseTo(RESPOSTA_CORRETA);
  });

  it('extracts price from JSON response', () => {
    const json = JSON.stringify({
      etapas: [{ descricao: 'Base', valor: 500 }],
      precoFinal: 1372.75,
      confianca: 'alta',
    });
    expect(extractPrice(json)).toBeCloseTo(RESPOSTA_CORRETA);
  });

  it('validates the correct calculation', () => {
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
