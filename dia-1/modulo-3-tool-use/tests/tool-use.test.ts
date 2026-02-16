/**
 * Testes para o Modulo 3: Tool Use & Function Calling
 *
 * Testa definicao de tools, handlers e logica de loop.
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

// =============================================
// Ex1: Tool schema definition
// =============================================
describe('Ex1: Tool Schema', () => {
  it('calculator tool has correct schema structure', () => {
    const tool = {
      name: 'calculadora',
      description: 'Faz calculos matematicos',
      input_schema: {
        type: 'object',
        properties: {
          operacao: {
            type: 'string',
            enum: ['soma', 'subtracao', 'multiplicacao', 'divisao'],
          },
          a: { type: 'number' },
          b: { type: 'number' },
        },
        required: ['operacao', 'a', 'b'],
      },
    };

    expect(tool.name).toBe('calculadora');
    expect(tool.input_schema.type).toBe('object');
    expect(tool.input_schema.required).toContain('operacao');
    expect(tool.input_schema.required).toContain('a');
    expect(tool.input_schema.required).toContain('b');
  });

  it('calculator handler computes correctly', () => {
    function handleCalculadora(input: { operacao: string; a: number; b: number }): string {
      switch (input.operacao) {
        case 'soma': return String(input.a + input.b);
        case 'subtracao': return String(input.a - input.b);
        case 'multiplicacao': return String(input.a * input.b);
        case 'divisao': return input.b === 0 ? 'Erro: divisao por zero' : String(input.a / input.b);
        default: return 'Operacao invalida';
      }
    }

    expect(handleCalculadora({ operacao: 'soma', a: 10, b: 5 })).toBe('15');
    expect(handleCalculadora({ operacao: 'subtracao', a: 10, b: 5 })).toBe('5');
    expect(handleCalculadora({ operacao: 'multiplicacao', a: 10, b: 5 })).toBe('50');
    expect(handleCalculadora({ operacao: 'divisao', a: 10, b: 5 })).toBe('2');
    expect(handleCalculadora({ operacao: 'divisao', a: 10, b: 0 })).toContain('zero');
  });
});

// =============================================
// Ex2: Multiple tools dispatch
// =============================================
describe('Ex2: Multiple Tools', () => {
  function handleConversor(input: { tipo: string; valor: number }): string {
    const conversoes: Record<string, (v: number) => number> = {
      celsius_fahrenheit: (v) => (v * 9) / 5 + 32,
      fahrenheit_celsius: (v) => ((v - 32) * 5) / 9,
      km_milhas: (v) => v * 0.621371,
      milhas_km: (v) => v / 0.621371,
    };
    const fn = conversoes[input.tipo];
    if (!fn) return 'Tipo invalido';
    return String(fn(input.valor).toFixed(2));
  }

  it('converts celsius to fahrenheit', () => {
    expect(handleConversor({ tipo: 'celsius_fahrenheit', valor: 0 })).toBe('32.00');
    expect(handleConversor({ tipo: 'celsius_fahrenheit', valor: 100 })).toBe('212.00');
  });

  it('converts km to miles', () => {
    const result = parseFloat(handleConversor({ tipo: 'km_milhas', valor: 10 }));
    expect(result).toBeCloseTo(6.21, 1);
  });

  it('handles invalid conversion type', () => {
    expect(handleConversor({ tipo: 'invalid', valor: 10 })).toBe('Tipo invalido');
  });

  it('dispatcher routes to correct handler', () => {
    function dispatch(name: string): string {
      switch (name) {
        case 'calculadora': return 'calc';
        case 'conversor_unidades': return 'conv';
        case 'data_info': return 'data';
        default: return 'unknown';
      }
    }

    expect(dispatch('calculadora')).toBe('calc');
    expect(dispatch('conversor_unidades')).toBe('conv');
    expect(dispatch('data_info')).toBe('data');
    expect(dispatch('other')).toBe('unknown');
  });
});

// =============================================
// Ex3: API tool handler
// =============================================
describe('Ex3: API Tool', () => {
  it('cleans CEP format correctly', () => {
    const clean = (cep: string) => cep.replace(/\D/g, '');

    expect(clean('01001-000')).toBe('01001000');
    expect(clean('01001000')).toBe('01001000');
    expect(clean('01.001-000')).toBe('01001000');
  });

  it('validates CEP length', () => {
    const isValid = (cep: string) => cep.replace(/\D/g, '').length === 8;

    expect(isValid('01001-000')).toBe(true);
    expect(isValid('0100')).toBe(false);
    expect(isValid('010010001')).toBe(false);
  });
});

// =============================================
// Ex4: Tool chaining logic
// =============================================
describe('Ex4: Tool Chaining', () => {
  const vendasJan = [
    { produto: 'Pro', valor: 299 },
    { produto: 'Enterprise', valor: 999 },
    { produto: 'Pro', valor: 299 },
  ];

  it('calculates metrics from sales data', () => {
    const total = vendasJan.reduce((sum, v) => sum + v.valor, 0);
    const media = total / vendasJan.length;

    expect(total).toBe(1597);
    expect(media).toBeCloseTo(532.33, 1);
  });

  it('groups sales by product', () => {
    const porProduto: Record<string, number> = {};
    for (const v of vendasJan) {
      porProduto[v.produto] = (porProduto[v.produto] || 0) + 1;
    }

    expect(porProduto['Pro']).toBe(2);
    expect(porProduto['Enterprise']).toBe(1);
  });

  it('computes growth between months', () => {
    const receitaJan = 1597;
    const receitaFev = 2645;
    const crescimento = ((receitaFev - receitaJan) / receitaJan) * 100;

    expect(crescimento).toBeCloseTo(65.6, 0);
  });
});

// =============================================
// Ex5: Error handling patterns
// =============================================
describe('Ex5: Error Handling', () => {
  it('retry succeeds after initial failures', async () => {
    let attempts = 0;
    async function unreliable(): Promise<string> {
      attempts++;
      if (attempts < 3) throw new Error('Falha');
      return 'sucesso';
    }

    async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
      for (let i = 0; i < maxRetries; i++) {
        try { return await fn(); }
        catch { /* retry */ }
      }
      throw new Error('Todas falharam');
    }

    const result = await withRetry(unreliable);
    expect(result).toBe('sucesso');
    expect(attempts).toBe(3);
  });

  it('retry throws after max attempts', async () => {
    async function alwaysFails(): Promise<string> {
      throw new Error('Sempre falha');
    }

    async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
      for (let i = 0; i < maxRetries; i++) {
        try { return await fn(); }
        catch { /* retry */ }
      }
      throw new Error('Todas falharam');
    }

    await expect(withRetry(alwaysFails)).rejects.toThrow('Todas falharam');
  });

  it('timeout rejects slow operations', async () => {
    async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), ms)
      );
      return Promise.race([promise, timeout]);
    }

    const slow = new Promise<string>((resolve) => setTimeout(() => resolve('ok'), 5000));
    await expect(withTimeout(slow, 50)).rejects.toThrow('Timeout');
  });

  it('tool_result supports is_error flag', () => {
    const successResult = {
      type: 'tool_result' as const,
      tool_use_id: 'abc',
      content: 'resultado',
      is_error: false,
    };

    const errorResult = {
      type: 'tool_result' as const,
      tool_use_id: 'abc',
      content: 'Erro: servico indisponivel',
      is_error: true,
    };

    expect(successResult.is_error).toBe(false);
    expect(errorResult.is_error).toBe(true);
    expect(errorResult.content).toContain('Erro');
  });
});

// =============================================
// Tool use loop logic
// =============================================
describe('Tool Use Loop', () => {
  it('sends tools array in API call', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Resposta' }],
      stop_reason: 'end_turn',
    });

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [{ name: 'calc', description: 'Calc', input_schema: { type: 'object', properties: {} } }],
      messages: [{ role: 'user', content: 'test' }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: expect.arrayContaining([
          expect.objectContaining({ name: 'calc' }),
        ]),
      })
    );
  });

  it('detects tool_use stop reason', () => {
    const response = { stop_reason: 'tool_use' };
    expect(response.stop_reason === 'tool_use').toBe(true);

    const endResponse = { stop_reason: 'end_turn' };
    expect(endResponse.stop_reason === 'tool_use').toBe(false);
  });
});
