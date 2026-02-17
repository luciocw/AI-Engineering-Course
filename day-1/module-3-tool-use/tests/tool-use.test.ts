/**
 * Tests for Module 3: Tool Use & Function Calling
 *
 * Tests tool definitions, handlers, validation, tool use loop, and agent logic.
 * API calls are mocked — no real calls are made.
 * Run: npm test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// === Anthropic SDK Mock ===
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
  const getWeatherTool = {
    name: 'get_weather',
    description:
      'Fetches the current temperature and weather condition for a city.',
    input_schema: {
      type: 'object' as const,
      properties: {
        city: {
          type: 'string',
          description: 'Name of the city to fetch the weather for',
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'Temperature unit (default: celsius)',
        },
      },
      required: ['city'],
    },
  };

  const sendEmailTool = {
    name: 'send_email',
    description:
      'Sends an email to a recipient with a specified subject and body.',
    input_schema: {
      type: 'object' as const,
      properties: {
        recipient: {
          type: 'string',
          description: 'Email address of the recipient',
        },
        subject: { type: 'string', description: 'Email subject' },
        body: { type: 'string', description: 'Email body/content' },
        cc: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of CC addresses (optional)',
        },
      },
      required: ['recipient', 'subject', 'body'],
    },
  };

  const queryDatabaseTool = {
    name: 'query_database',
    description:
      'Queries records from a database table with optional filters.',
    input_schema: {
      type: 'object' as const,
      properties: {
        table: { type: 'string', description: 'Name of the table to query' },
        filters: {
          type: 'object',
          properties: {
            field: { type: 'string', description: 'Name of the field to filter' },
            value: { type: 'string', description: 'Filter value' },
          },
          description: 'Optional filters for the query',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of records (default: 10)',
        },
      },
      required: ['table'],
    },
  };

  it('get_weather has correct structure with name, description, input_schema', () => {
    expect(getWeatherTool.name).toBe('get_weather');
    expect(getWeatherTool.description).toBeTruthy();
    expect(getWeatherTool.input_schema).toBeDefined();
    expect(getWeatherTool.input_schema.type).toBe('object');
    expect(getWeatherTool.input_schema.properties).toBeDefined();
    expect(getWeatherTool.input_schema.required).toContain('city');
  });

  it('send_email requires recipient, subject, body', () => {
    expect(sendEmailTool.name).toBe('send_email');
    expect(sendEmailTool.input_schema.type).toBe('object');
    expect(sendEmailTool.input_schema.required).toContain('recipient');
    expect(sendEmailTool.input_schema.required).toContain('subject');
    expect(sendEmailTool.input_schema.required).toContain('body');
    expect(sendEmailTool.input_schema.required).toHaveLength(3);
  });

  it('query_database has nested filters object and optional properties', () => {
    expect(queryDatabaseTool.name).toBe('query_database');
    expect(queryDatabaseTool.input_schema.required).toEqual(['table']);
    const filters = queryDatabaseTool.input_schema.properties.filters as Record<string, unknown>;
    expect(filters.type).toBe('object');
    expect(queryDatabaseTool.input_schema.properties.limit).toBeDefined();
  });

  it('all 3 tools have valid schema structure', () => {
    const tools = [getWeatherTool, sendEmailTool, queryDatabaseTool];
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
// Ex2: First Tool — Calculator
// =============================================
describe('Ex2: First Tool (Calculator)', () => {
  function handleCalculate(input: {
    operation: string;
    a: number;
    b: number;
  }): string {
    switch (input.operation) {
      case 'addition':
        return String(input.a + input.b);
      case 'subtraction':
        return String(input.a - input.b);
      case 'multiplication':
        return String(input.a * input.b);
      case 'division':
        if (input.b === 0) return 'Error: division by zero';
        return String(input.a / input.b);
      default:
        return `Invalid operation: ${input.operation}`;
    }
  }

  it('handles all 4 arithmetic operations correctly', () => {
    expect(handleCalculate({ operation: 'addition', a: 10, b: 5 })).toBe('15');
    expect(handleCalculate({ operation: 'subtraction', a: 10, b: 5 })).toBe('5');
    expect(handleCalculate({ operation: 'multiplication', a: 10, b: 5 })).toBe('50');
    expect(handleCalculate({ operation: 'division', a: 10, b: 5 })).toBe('2');
  });

  it('returns error message on division by zero', () => {
    const result = handleCalculate({ operation: 'division', a: 10, b: 0 });
    expect(result).toContain('zero');
    expect(result).toContain('Error');
  });

  it('detects tool_use stop_reason in API response', () => {
    const toolUseResp = mockToolUseResponse('calculate', {
      operation: 'addition',
      a: 10,
      b: 5,
    });
    expect(toolUseResp.stop_reason).toBe('tool_use');
    expect(toolUseResp.content[0].type).toBe('tool_use');
    expect(toolUseResp.content[0].name).toBe('calculate');

    const endTurnResp = mockResponse('The result is 15.');
    expect(endTurnResp.stop_reason).toBe('end_turn');
  });

  it('sends tools array in API call', async () => {
    mockCreate.mockResolvedValue(mockResponse('The result is 15'));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [
        {
          name: 'calculate',
          description: 'Performs mathematical calculations',
          input_schema: {
            type: 'object',
            properties: {
              operation: { type: 'string', enum: ['addition', 'subtraction', 'multiplication', 'division'] },
              a: { type: 'number' },
              b: { type: 'number' },
            },
            required: ['operation', 'a', 'b'],
          },
        },
      ],
      messages: [{ role: 'user', content: 'What is 10 + 5?' }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: expect.arrayContaining([
          expect.objectContaining({ name: 'calculate' }),
        ]),
      })
    );
  });
});

// =============================================
// Ex3: Typed Handlers (Discriminated Union)
// =============================================
describe('Ex3: Typed Handlers (Discriminated Union)', () => {
  type CalculateInput = {
    tool_name: 'calculate';
    operation: 'addition' | 'subtraction' | 'multiplication' | 'division';
    a: number;
    b: number;
  };

  type TranslateInput = {
    tool_name: 'translate';
    text: string;
    target_language: string;
  };

  type DateFormatterInput = {
    tool_name: 'format_date';
    date: string;
    format: 'short' | 'long' | 'iso';
  };

  type ToolInput = CalculateInput | TranslateInput | DateFormatterInput;

  function handleCalculate(input: CalculateInput): string {
    switch (input.operation) {
      case 'addition': return String(input.a + input.b);
      case 'subtraction': return String(input.a - input.b);
      case 'multiplication': return String(input.a * input.b);
      case 'division':
        if (input.b === 0) return 'Error: division by zero';
        return String(input.a / input.b);
    }
  }

  function handleTranslate(input: TranslateInput): string {
    const translations: Record<string, Record<string, string>> = {
      pt: { 'Hello world': 'Ola mundo', 'Good morning': 'Bom dia' },
      es: { 'Hello world': 'Hola mundo', 'Good morning': 'Buenos dias' },
      fr: { 'Hello world': 'Bonjour le monde', 'Good morning': 'Bonjour' },
    };
    const translated = translations[input.target_language]?.[input.text];
    return translated || `[Simulated translation of "${input.text}" to ${input.target_language}]`;
  }

  function handleFormatDate(input: DateFormatterInput): string {
    const date = new Date(input.date + 'T12:00:00');
    if (isNaN(date.getTime())) return 'Invalid date';

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    switch (input.format) {
      case 'short':
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      case 'long':
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
      case 'iso':
        return date.toISOString().split('T')[0];
    }
  }

  function dispatch(input: ToolInput): string {
    switch (input.tool_name) {
      case 'calculate': return handleCalculate(input);
      case 'translate': return handleTranslate(input);
      case 'format_date': return handleFormatDate(input);
      default:
        return `Unknown tool`;
    }
  }

  it('dispatcher routes calculate correctly', () => {
    expect(dispatch({ tool_name: 'calculate', operation: 'addition', a: 10, b: 20 })).toBe('30');
    expect(dispatch({ tool_name: 'calculate', operation: 'multiplication', a: 7, b: 8 })).toBe('56');
  });

  it('dispatcher routes translate correctly', () => {
    expect(dispatch({ tool_name: 'translate', text: 'Hello world', target_language: 'pt' })).toBe('Ola mundo');
    expect(dispatch({ tool_name: 'translate', text: 'Good morning', target_language: 'es' })).toBe('Buenos dias');
  });

  it('formats dates in short, long, and iso formats', () => {
    const short = dispatch({ tool_name: 'format_date', date: '2026-12-25', format: 'short' });
    expect(short).toBe('25/12/2026');

    const long = dispatch({ tool_name: 'format_date', date: '2026-03-15', format: 'long' });
    expect(long).toBe('March 15, 2026');

    const iso = dispatch({ tool_name: 'format_date', date: '2026-07-04', format: 'iso' });
    expect(iso).toBe('2026-07-04');
  });

  it('returns error for unknown tool_name via exhaustive dispatch', () => {
    const result = dispatch({ tool_name: 'unknown' as never, operation: 'addition', a: 1, b: 2 } as ToolInput);
    expect(result).toContain('Unknown');
  });
});

// =============================================
// Ex4: Multiple Tools (Converter + Dispatcher)
// =============================================
describe('Ex4: Multiple Tools', () => {
  function handleConverter(input: { type: string; value: number }): string {
    const conversions: Record<string, (v: number) => number> = {
      celsius_fahrenheit: (v) => (v * 9) / 5 + 32,
      fahrenheit_celsius: (v) => ((v - 32) * 5) / 9,
      km_miles: (v) => v * 0.621371,
      miles_km: (v) => v / 0.621371,
      kg_pounds: (v) => v * 2.20462,
      pounds_kg: (v) => v / 2.20462,
    };
    const fn = conversions[input.type];
    if (!fn) return `Invalid conversion type: ${input.type}`;
    return String(fn(input.value).toFixed(2));
  }

  it('converts celsius to fahrenheit correctly', () => {
    expect(handleConverter({ type: 'celsius_fahrenheit', value: 0 })).toBe('32.00');
    expect(handleConverter({ type: 'celsius_fahrenheit', value: 100 })).toBe('212.00');
  });

  it('converts km to miles correctly', () => {
    const result = parseFloat(handleConverter({ type: 'km_miles', value: 10 }));
    expect(result).toBeCloseTo(6.21, 1);
  });

  it('dispatcher routes to correct handler by tool name', () => {
    function dispatchTool(name: string, input: Record<string, unknown>): string {
      switch (name) {
        case 'calculate':
          return 'calculate_handler';
        case 'unit_converter':
          return 'converter_handler';
        case 'date_info':
          return 'date_handler';
        default:
          return `Unknown tool: ${name}`;
      }
    }

    expect(dispatchTool('calculate', {})).toBe('calculate_handler');
    expect(dispatchTool('unit_converter', {})).toBe('converter_handler');
    expect(dispatchTool('date_info', {})).toBe('date_handler');
    expect(dispatchTool('nonexistent', {})).toContain('Unknown');
  });

  it('handles invalid conversion type', () => {
    const result = handleConverter({ type: 'meters_yards', value: 10 });
    expect(result).toContain('Invalid');
  });
});

// =============================================
// Ex5: Tool Validation
// =============================================
describe('Ex5: Tool Validation', () => {
  function validateCreateUser(input: unknown): {
    valid: boolean;
    data?: { name: string; email: string; age: number };
    error?: string;
  } {
    if (typeof input !== 'object' || input === null) {
      return { valid: false, error: 'Input must be an object' };
    }
    const obj = input as Record<string, unknown>;

    if (typeof obj.name !== 'string' || obj.name.length < 2) {
      return { valid: false, error: 'name must be a string with at least 2 characters' };
    }
    if (typeof obj.email !== 'string' || !obj.email.includes('@')) {
      return { valid: false, error: 'email must be a valid string containing @' };
    }
    if (typeof obj.age !== 'number' || obj.age < 0 || obj.age > 150) {
      return { valid: false, error: 'age must be a number between 0 and 150' };
    }

    return {
      valid: true,
      data: { name: obj.name, email: obj.email, age: obj.age },
    };
  }

  function validateSearchProducts(input: unknown): {
    valid: boolean;
    data?: { category: string; max_price?: number; sort_by?: 'price' | 'name' | 'rating' };
    error?: string;
  } {
    if (typeof input !== 'object' || input === null) {
      return { valid: false, error: 'Input must be an object' };
    }
    const obj = input as Record<string, unknown>;

    if (typeof obj.category !== 'string' || obj.category.length === 0) {
      return { valid: false, error: 'category is required and must be a non-empty string' };
    }
    if (obj.max_price !== undefined) {
      if (typeof obj.max_price !== 'number' || obj.max_price <= 0) {
        return { valid: false, error: 'max_price must be a positive number' };
      }
    }
    const validSortValues = ['price', 'name', 'rating'];
    if (obj.sort_by !== undefined) {
      if (typeof obj.sort_by !== 'string' || !validSortValues.includes(obj.sort_by)) {
        return { valid: false, error: `sort_by must be one of: ${validSortValues.join(', ')}` };
      }
    }

    return {
      valid: true,
      data: {
        category: obj.category,
        max_price: obj.max_price as number | undefined,
        sort_by: obj.sort_by as 'price' | 'name' | 'rating' | undefined,
      },
    };
  }

  it('validateCreateUser passes with valid data', () => {
    const result = validateCreateUser({ name: 'Ana Silva', email: 'ana@email.com', age: 25 });
    expect(result.valid).toBe(true);
    expect(result.data!.name).toBe('Ana Silva');
    expect(result.data!.email).toBe('ana@email.com');
    expect(result.data!.age).toBe(25);
  });

  it('validateCreateUser rejects invalid name, email, and age', () => {
    const badName = validateCreateUser({ name: '', email: 'ok@ok.com', age: 20 });
    expect(badName.valid).toBe(false);
    expect(badName.error).toContain('name');

    const badEmail = validateCreateUser({ name: 'Ana', email: 'invalid', age: 20 });
    expect(badEmail.valid).toBe(false);
    expect(badEmail.error).toContain('email');

    const badAge = validateCreateUser({ name: 'Ana', email: 'a@b.com', age: 200 });
    expect(badAge.valid).toBe(false);
    expect(badAge.error).toContain('age');
  });

  it('validateSearchProducts passes with valid category and rejects invalid max_price/sort_by', () => {
    const valid = validateSearchProducts({ category: 'electronics', max_price: 1000 });
    expect(valid.valid).toBe(true);
    expect(valid.data!.category).toBe('electronics');

    const badPrice = validateSearchProducts({ category: 'books', max_price: -10 });
    expect(badPrice.valid).toBe(false);
    expect(badPrice.error).toContain('max_price');

    const badSort = validateSearchProducts({ category: 'books', sort_by: 'invalid' });
    expect(badSort.valid).toBe(false);
    expect(badSort.error).toContain('sort_by');
  });

  it('dispatcher with validation returns error messages for invalid input', () => {
    function dispatchWithValidation(name: string, input: unknown): string {
      switch (name) {
        case 'create_user': {
          const result = validateCreateUser(input);
          if (!result.valid) return `Validation error: ${result.error}`;
          return JSON.stringify({ id: 1, ...result.data!, status: 'created' });
        }
        case 'search_products': {
          const result = validateSearchProducts(input);
          if (!result.valid) return `Validation error: ${result.error}`;
          return JSON.stringify([]);
        }
        default:
          return `Unknown tool: ${name}`;
      }
    }

    const errorResult = dispatchWithValidation('create_user', { name: '', email: 'bad', age: -5 });
    expect(errorResult).toContain('Validation error');

    const okResult = dispatchWithValidation('create_user', { name: 'Maria', email: 'maria@test.com', age: 30 });
    expect(okResult).toContain('created');
    expect(okResult).not.toContain('Error');
  });
});

// =============================================
// Ex6: Tool Description Quality
// =============================================
describe('Ex6: Tool Description Quality', () => {
  const poorTools = [
    {
      name: 'search',
      description: 'Searches for things',
      input_schema: {
        type: 'object' as const,
        properties: { q: { type: 'string', description: 'query' } },
        required: ['q'],
      },
    },
    {
      name: 'calculate',
      description: 'Does calculations',
      input_schema: {
        type: 'object' as const,
        properties: { expr: { type: 'string', description: 'expression' } },
        required: ['expr'],
      },
    },
  ];

  const goodTools = [
    {
      name: 'search_documents',
      description:
        'Searches internal company documents by keywords. ' +
        'Searches in the title and content of documents such as policies, manuals, and procedures. ' +
        'Returns a list with the title, summary, and last updated date for each document found. ' +
        'Use when the user asks about company documents, policies, or procedures. ' +
        'DO NOT use for internet searches or external information.',
      input_schema: {
        type: 'object' as const,
        properties: {
          query: {
            type: 'string',
            description:
              'Keywords for search. Examples: "vacation policy", "onboarding manual", "reimbursement procedure"',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results (1-20, default: 5)',
          },
        },
        required: ['query'],
      },
    },
  ];

  it('bad descriptions are vague (short, no context)', () => {
    for (const tool of poorTools) {
      expect(tool.description.length).toBeLessThan(30);
    }
  });

  it('good descriptions include what, when to use, when NOT to use, and return format', () => {
    const description = goodTools[0].description;
    expect(description).toContain('Searches internal company documents');
    expect(description).toContain('Use when');
    expect(description).toContain('DO NOT use');
    expect(description).toContain('Returns');
    expect(description.length).toBeGreaterThan(100);
  });

  it('good property descriptions include examples', () => {
    const queryDescription = goodTools[0].input_schema.properties.query.description;
    expect(queryDescription).toContain('Examples');
    expect(queryDescription).toContain('vacation policy');
  });
});

// =============================================
// Ex7: Real API ViaCEP
// =============================================
describe('Ex7: Real API ViaCEP', () => {
  function cleanZipCode(zipCode: string): string {
    return zipCode.replace(/\D/g, '');
  }

  function validateZipCode(zipCode: string): boolean {
    return cleanZipCode(zipCode).length === 8;
  }

  it('cleans zip code by removing hyphens and dots', () => {
    expect(cleanZipCode('01001-000')).toBe('01001000');
    expect(cleanZipCode('01001000')).toBe('01001000');
    expect(cleanZipCode('01.001-000')).toBe('01001000');
  });

  it('validates zip code length must be 8 digits', () => {
    expect(validateZipCode('01001-000')).toBe(true);
    expect(validateZipCode('01001000')).toBe(true);
    expect(validateZipCode('0100')).toBe(false);
    expect(validateZipCode('010010001')).toBe(false);
  });

  it('handles invalid zip code format gracefully', () => {
    function handleSearchZipCode(zipCode: string): string {
      const cleanedZipCode = cleanZipCode(zipCode);
      if (cleanedZipCode.length !== 8) {
        return 'Invalid zip code: must have 8 digits';
      }
      return `Zip code ${cleanedZipCode} is valid`;
    }

    expect(handleSearchZipCode('123')).toContain('Invalid');
    expect(handleSearchZipCode('01001-000')).toContain('valid');
  });
});

// =============================================
// Ex8: Tools + Handlebars Templates
// =============================================
describe('Ex8: Tools with Templates', () => {
  function templateUser(user: {
    name: string;
    email: string;
    plan: string;
    active: boolean;
    createdAt: string;
  }): string {
    return `
=== User Profile ===
Name: ${user.name}
Email: ${user.email}
Plan: ${user.plan}
Status: ${user.active ? 'Active' : 'Inactive'}
Member since: ${user.createdAt}
    `.trim();
  }

  function templateProductList(
    category: string,
    products: Array<{ name: string; price: number; stock: number }>
  ): string {
    const lines = products.map(
      (p) =>
        `  - ${p.name.padEnd(25)} $ ${p.price.toFixed(2).padStart(10)}   Stock: ${String(p.stock).padStart(4)}`
    );
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const totalItems = products.reduce((sum, p) => sum + p.stock, 0);

    return `
=== Products: ${category.charAt(0).toUpperCase() + category.slice(1)} ===
${lines.join('\n')}

Summary: ${products.length} products | ${totalItems} units in stock | Total value: $ ${totalValue.toFixed(2)}
    `.trim();
  }

  function templateReport(data: {
    title: string;
    period: string;
    metrics: Record<string, number>;
    observations: string[];
  }): string {
    const metricLines = Object.entries(data.metrics)
      .map(([k, v]) => `  ${k}: ${v}`)
      .join('\n');
    const observationLines = data.observations.map((o) => `  - ${o}`).join('\n');

    return `
=== ${data.title} ===
Period: ${data.period}

Metrics:
${metricLines}

Observations:
${observationLines}
    `.trim();
  }

  it('templateUser formats user profile correctly', () => {
    const result = templateUser({
      name: 'Joao Silva',
      email: 'joao@empresa.com',
      plan: 'Pro',
      active: true,
      createdAt: '2025-03-15',
    });

    expect(result).toContain('Joao Silva');
    expect(result).toContain('joao@empresa.com');
    expect(result).toContain('Pro');
    expect(result).toContain('Active');
    expect(result).toContain('User Profile');
  });

  it('templateProductList formats product list with totals', () => {
    const products = [
      { name: 'Notebook Pro 15"', price: 5499, stock: 23 },
      { name: 'Wireless Mouse', price: 149, stock: 156 },
    ];
    const result = templateProductList('electronics', products);

    expect(result).toContain('Electronics');
    expect(result).toContain('Notebook Pro');
    expect(result).toContain('Wireless Mouse');
    expect(result).toContain('2 products');
    expect(result).toContain('179 units');
    const expectedTotal = 5499 * 23 + 149 * 156;
    expect(result).toContain(expectedTotal.toFixed(2));
  });

  it('templateReport formats report with metrics and observations', () => {
    const result = templateReport({
      title: 'Monthly Report',
      period: '2026-01',
      metrics: { 'Active users': 1250, 'New registrations': 89 },
      observations: ['12% growth', 'Revenue above target'],
    });

    expect(result).toContain('Monthly Report');
    expect(result).toContain('2026-01');
    expect(result).toContain('Active users: 1250');
    expect(result).toContain('New registrations: 89');
    expect(result).toContain('12% growth');
    expect(result).toContain('Revenue above target');
  });
});

// =============================================
// Ex9: Rich Results (Dashboard + Client Analysis)
// =============================================
describe('Ex9: Rich Results', () => {
  const dashboardData = {
    sales: {
      today: { total: 15680, orders: 42, average_ticket: 373.33 },
      week: { total: 98450, orders: 287, average_ticket: 343.03 },
      month: { total: 456000, orders: 1250, average_ticket: 364.80 },
    },
    topProducts: [
      { name: 'Enterprise Plan', sales: 45, revenue: 44955 },
      { name: 'Pro Plan', sales: 120, revenue: 35880 },
      { name: 'Starter Plan', sales: 350, revenue: 17150 },
    ],
    alerts: [
      { type: 'warning', msg: 'Low stock: Wireless Mouse', timestamp: '2026-02-16T10:30:00' },
      { type: 'info', msg: 'New sales record', timestamp: '2026-02-16T09:15:00' },
      { type: 'error', msg: 'Payment gateway failure', timestamp: '2026-02-16T14:32:00' },
    ],
  };

  function handleDashboard(input: { period: string; include_alerts?: boolean }): Record<string, unknown> {
    const period = input.period as keyof typeof dashboardData.sales;
    const metrics = dashboardData.sales[period];

    const result: Record<string, unknown> = {
      _meta: {
        source: 'sales_system_v2',
        timestamp: new Date().toISOString(),
        period: input.period,
      },
      metrics: {
        total_revenue: metrics.total,
        total_orders: metrics.orders,
        average_ticket: metrics.average_ticket,
      },
      product_ranking: dashboardData.topProducts.map((p, i) => ({
        position: i + 1,
        product: p.name,
        sales: p.sales,
        revenue: p.revenue,
      })),
    };

    if (input.include_alerts !== false) {
      result.alerts = dashboardData.alerts;
    }

    return result;
  }

  function classifyRisk(health: number): string {
    if (health >= 80) return 'low';
    if (health >= 60) return 'medium';
    return 'high';
  }

  it('dashboard handler returns _meta, metrics, and product_ranking', () => {
    const result = handleDashboard({ period: 'month' });

    expect(result._meta).toBeDefined();
    expect((result._meta as Record<string, unknown>).source).toBe('sales_system_v2');
    expect(result.metrics).toBeDefined();
    expect((result.metrics as Record<string, unknown>).total_revenue).toBe(456000);
    expect(Array.isArray(result.product_ranking)).toBe(true);
    expect((result.product_ranking as unknown[]).length).toBe(3);
  });

  it('client_analysis returns correct health score classification', () => {
    expect(classifyRisk(95)).toBe('low');
    expect(classifyRisk(80)).toBe('low');
    expect(classifyRisk(72)).toBe('medium');
    expect(classifyRisk(60)).toBe('medium');
    expect(classifyRisk(45)).toBe('high');
    expect(classifyRisk(30)).toBe('high');
  });

  it('alert filtering works in dashboard response', () => {
    const withAlerts = handleDashboard({ period: 'today', include_alerts: true });
    expect(withAlerts.alerts).toBeDefined();
    expect((withAlerts.alerts as unknown[]).length).toBe(3);

    const withoutAlerts = handleDashboard({ period: 'today', include_alerts: false });
    expect(withoutAlerts.alerts).toBeUndefined();
  });
});

// =============================================
// Ex10: Tools in Multi-Turn Conversation
// =============================================
describe('Ex10: Tools in Multi-Turn Conversation', () => {
  const ordersDB: Record<string, {
    id: string;
    customer: string;
    items: Array<{ name: string; qty: number; price: number }>;
    status: string;
    date: string;
  }> = {
    'ORD-001': {
      id: 'ORD-001', customer: 'Maria Silva',
      items: [{ name: 'Notebook', qty: 1, price: 4500 }, { name: 'Mouse', qty: 2, price: 89 }],
      status: 'shipped', date: '2026-02-10',
    },
    'ORD-002': {
      id: 'ORD-002', customer: 'Maria Silva',
      items: [{ name: 'Keyboard', qty: 1, price: 350 }],
      status: 'processing', date: '2026-02-15',
    },
    'ORD-003': {
      id: 'ORD-003', customer: 'Joao Santos',
      items: [{ name: 'Monitor', qty: 1, price: 2800 }],
      status: 'delivered', date: '2026-02-01',
    },
  };

  function handleSearchOrders(input: { customer?: string; id?: string }): string {
    if (input.id) {
      const order = ordersDB[input.id];
      if (!order) return JSON.stringify({ error: `Order ${input.id} not found` });
      return JSON.stringify(order);
    }
    if (input.customer) {
      const orders = Object.values(ordersDB).filter(
        (p) => p.customer.toLowerCase().includes(input.customer!.toLowerCase())
      );
      if (orders.length === 0) return JSON.stringify({ error: `No orders found` });
      return JSON.stringify(orders);
    }
    return JSON.stringify({ error: 'Provide customer or id to search' });
  }

  function handleUpdateStatus(input: { id: string; new_status: string }): string {
    const order = ordersDB[input.id];
    if (!order) return JSON.stringify({ error: `Order ${input.id} not found` });
    const previousStatus = order.status;
    order.status = input.new_status;
    return JSON.stringify({ id: input.id, previous_status: previousStatus, new_status: input.new_status });
  }

  function handleCalculateTotal(input: { id: string; discount?: number }): string {
    const order = ordersDB[input.id];
    if (!order) return JSON.stringify({ error: `Order ${input.id} not found` });
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discount = input.discount || 0;
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;
    return JSON.stringify({ order_id: order.id, subtotal, discount: `${discount}%`, total });
  }

  it('looks up orders by customer name', () => {
    const result = JSON.parse(handleSearchOrders({ customer: 'Maria' }));
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0].customer).toContain('Maria');
  });

  it('looks up order by specific ID', () => {
    const result = JSON.parse(handleSearchOrders({ id: 'ORD-003' }));
    expect(result.id).toBe('ORD-003');
    expect(result.customer).toBe('Joao Santos');
  });

  it('update_status changes order status', () => {
    const result = JSON.parse(handleUpdateStatus({ id: 'ORD-002', new_status: 'shipped' }));
    expect(result.previous_status).toBe('processing');
    expect(result.new_status).toBe('shipped');
    expect(ordersDB['ORD-002'].status).toBe('shipped');
  });

  it('calculate_total applies discount correctly', () => {
    const result = JSON.parse(handleCalculateTotal({ id: 'ORD-001', discount: 10 }));
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
  const salesJan = [
    { product: 'Pro Plan', amount: 299, date: '2026-01-05' },
    { product: 'Enterprise Plan', amount: 999, date: '2026-01-12' },
    { product: 'Pro Plan', amount: 299, date: '2026-01-20' },
    { product: 'Starter Plan', amount: 49, date: '2026-01-25' },
  ];

  const salesFeb = [
    { product: 'Enterprise Plan', amount: 999, date: '2026-02-03' },
    { product: 'Pro Plan', amount: 299, date: '2026-02-10' },
    { product: 'Pro Plan', amount: 299, date: '2026-02-14' },
    { product: 'Enterprise Plan', amount: 999, date: '2026-02-20' },
    { product: 'Starter Plan', amount: 49, date: '2026-02-28' },
  ];

  it('calculates metrics from sales data (total, average)', () => {
    const total = salesJan.reduce((sum, v) => sum + v.amount, 0);
    const average = total / salesJan.length;

    expect(total).toBe(1646);
    expect(average).toBeCloseTo(411.5, 1);
  });

  it('groups sales by product', () => {
    const byProduct: Record<string, { count: number; total: number }> = {};
    for (const v of salesJan) {
      if (!byProduct[v.product]) {
        byProduct[v.product] = { count: 0, total: 0 };
      }
      byProduct[v.product].count++;
      byProduct[v.product].total += v.amount;
    }

    expect(byProduct['Pro Plan'].count).toBe(2);
    expect(byProduct['Pro Plan'].total).toBe(598);
    expect(byProduct['Enterprise Plan'].count).toBe(1);
    expect(byProduct['Starter Plan'].count).toBe(1);
  });

  it('computes growth between months', () => {
    const revenueJan = salesJan.reduce((sum, v) => sum + v.amount, 0);
    const revenueFeb = salesFeb.reduce((sum, v) => sum + v.amount, 0);
    const growth = ((revenueFeb - revenueJan) / revenueJan) * 100;

    expect(revenueJan).toBe(1646);
    expect(revenueFeb).toBe(2645);
    expect(growth).toBeCloseTo(60.7, 0);
  });
});

// =============================================
// Ex12: Parallel Tool Execution
// =============================================
describe('Ex12: Parallel Tool Execution', () => {
  it('Promise.all executes multiple tool handlers concurrently', async () => {
    async function getWeather(city: string): Promise<string> {
      return JSON.stringify({ city, temp: 28, condition: 'cloudy' });
    }
    async function getExchangeRate(currency: string): Promise<string> {
      return JSON.stringify({ currency, value_brl: 5.12 });
    }
    async function getNews(topic: string): Promise<string> {
      return JSON.stringify({ topic, news: [{ title: `${topic}: trends` }] });
    }

    const [weather, exchangeRate, news] = await Promise.all([
      getWeather('Sao Paulo'),
      getExchangeRate('USD'),
      getNews('technology'),
    ]);

    expect(JSON.parse(weather).city).toBe('Sao Paulo');
    expect(JSON.parse(exchangeRate).currency).toBe('USD');
    expect(JSON.parse(news).topic).toBe('technology');
  });

  it('collects tool_use blocks from API response', () => {
    const response = {
      content: [
        { type: 'tool_use', id: 'toolu_1', name: 'get_weather', input: { city: 'Sao Paulo' } },
        { type: 'tool_use', id: 'toolu_2', name: 'get_exchange_rate', input: { currency: 'USD' } },
        { type: 'tool_use', id: 'toolu_3', name: 'get_news', input: { topic: 'tech' } },
      ],
      stop_reason: 'tool_use',
    };

    const toolCalls = response.content.filter((b) => b.type === 'tool_use');
    expect(toolCalls).toHaveLength(3);
    expect(toolCalls[0].name).toBe('get_weather');
    expect(toolCalls[1].name).toBe('get_exchange_rate');
    expect(toolCalls[2].name).toBe('get_news');
  });

  it('maps tool results back to correct tool_use_ids', () => {
    const toolCalls = [
      { id: 'toolu_1', name: 'get_weather' },
      { id: 'toolu_2', name: 'get_exchange_rate' },
    ];

    const results = ['{"temp": 28}', '{"value": 5.12}'];

    const toolResults = toolCalls.map((tc, i) => ({
      type: 'tool_result' as const,
      tool_use_id: tc.id,
      content: results[i],
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
    const systemPrompt = `You are a professional and prudent financial assistant.

Tool usage rules:
1. ALWAYS check the balance before suggesting transfers.
2. NEVER execute a transfer without confirming with the user.
3. Format all values in dollars ($) with 2 decimal places.`;

    mockCreate.mockResolvedValue(
      mockToolUseResponse('check_balance', {})
    );

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      tools: [
        { name: 'check_balance', description: 'Checks account balance', input_schema: { type: 'object', properties: {}, required: [] } },
      ],
      messages: [{ role: 'user', content: 'Can I invest more?' }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('ALWAYS check the balance'),
      })
    );
  });

  it('tool_choice any forces tool usage', async () => {
    mockCreate.mockResolvedValue(
      mockToolUseResponse('check_balance', {})
    );

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [
        { name: 'check_balance', description: 'Checks account balance', input_schema: { type: 'object', properties: {}, required: [] } },
      ],
      tool_choice: { type: 'any' },
      messages: [{ role: 'user', content: 'Hi' }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        tool_choice: { type: 'any' },
      })
    );
  });

  it('tool_choice with specific tool name forces that tool', async () => {
    mockCreate.mockResolvedValue(
      mockToolUseResponse('check_investments', {})
    );

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [
        { name: 'check_balance', description: 'Checks account balance', input_schema: { type: 'object', properties: {}, required: [] } },
        { name: 'check_investments', description: 'Checks investments', input_schema: { type: 'object', properties: {}, required: [] } },
      ],
      tool_choice: { type: 'tool', name: 'check_investments' },
      messages: [{ role: 'user', content: 'I want to see my data' }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        tool_choice: { type: 'tool', name: 'check_investments' },
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
      if (attempts < 3) throw new Error('Failure');
      return 'success';
    }

    async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn();
        } catch {
          /* retry */
        }
      }
      throw new Error('All attempts failed');
    }

    const result = await withRetry(unreliable);
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('withRetry throws after max attempts exhausted', async () => {
    async function alwaysFails(): Promise<string> {
      throw new Error('Always fails');
    }

    async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn();
        } catch {
          /* retry */
        }
      }
      throw new Error('All attempts failed');
    }

    await expect(withRetry(alwaysFails)).rejects.toThrow('All attempts failed');
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
      content: '{"product": "laptop", "price": 4500}',
      is_error: false,
    };

    const errorResult = {
      type: 'tool_result' as const,
      tool_use_id: 'toolu_abc',
      content: 'Error: service temporarily unavailable',
      is_error: true,
    };

    expect(successResult.is_error).toBe(false);
    expect(errorResult.is_error).toBe(true);
    expect(errorResult.content).toContain('Error');
  });
});

// =============================================
// Ex15: Human-in-the-Loop Confirmation
// =============================================
describe('Ex15: Human-in-the-Loop Confirmation', () => {
  type ToolRisk = 'safe' | 'sensitive';

  const toolRisks: Record<string, ToolRisk> = {
    list_files: 'safe',
    read_file: 'safe',
    delete_file: 'sensitive',
    send_email: 'sensitive',
    rename_file: 'sensitive',
  };

  function generateActionDescription(name: string, input: Record<string, unknown>): string {
    switch (name) {
      case 'delete_file':
        return `Permanently delete the file "${input.name}"`;
      case 'send_email':
        return `Send email to "${input.to}" with subject "${input.subject}"`;
      case 'rename_file':
        return `Rename file from "${input.current_name}" to "${input.new_name}"`;
      default:
        return `Execute ${name}`;
    }
  }

  it('classifies tools as safe vs sensitive', () => {
    expect(toolRisks['list_files']).toBe('safe');
    expect(toolRisks['read_file']).toBe('safe');
    expect(toolRisks['delete_file']).toBe('sensitive');
    expect(toolRisks['send_email']).toBe('sensitive');
    expect(toolRisks['rename_file']).toBe('sensitive');
  });

  it('safe tools execute without confirmation', () => {
    function processToolCall(name: string): { needsConfirmation: boolean } {
      const risk = toolRisks[name] || 'sensitive';
      return { needsConfirmation: risk === 'sensitive' };
    }

    expect(processToolCall('list_files').needsConfirmation).toBe(false);
    expect(processToolCall('read_file').needsConfirmation).toBe(false);
    expect(processToolCall('delete_file').needsConfirmation).toBe(true);
  });

  it('sensitive tools return CONFIRMATION_REQUIRED', () => {
    function processToolCall(
      name: string,
      input: Record<string, unknown>
    ): string {
      const risk = toolRisks[name] || 'sensitive';
      if (risk === 'sensitive') {
        const description = generateActionDescription(name, input);
        return `CONFIRMATION_REQUIRED: ${description}. Please ask the user to confirm this action.`;
      }
      return 'Executed successfully';
    }

    const result = processToolCall('delete_file', { name: 'draft.txt' });
    expect(result).toContain('CONFIRMATION_REQUIRED');
    expect(result).toContain('draft.txt');
  });

  it('generates human-readable confirmation descriptions', () => {
    expect(generateActionDescription('delete_file', { name: 'test.txt' }))
      .toBe('Permanently delete the file "test.txt"');
    expect(generateActionDescription('send_email', { to: 'a@b.com', subject: 'Hi' }))
      .toBe('Send email to "a@b.com" with subject "Hi"');
    expect(generateActionDescription('rename_file', { current_name: 'old.txt', new_name: 'new.txt' }))
      .toBe('Rename file from "old.txt" to "new.txt"');
  });
});

// =============================================
// Ex16: Cost-Aware Tools
// =============================================
describe('Ex16: Cost-Aware Tools', () => {
  const INPUT_PRICE_PER_MILLION = 1.0;
  const OUTPUT_PRICE_PER_MILLION = 5.0;

  class CostTracker {
    private calls: Array<{
      iteration: number;
      inputTokens: number;
      outputTokens: number;
      inputCost: number;
      outputCost: number;
      toolsCalled: string[];
    }> = [];
    private maxBudget: number;

    constructor(maxBudget: number = 0.10) {
      this.maxBudget = maxBudget;
    }

    record(usage: { input_tokens: number; output_tokens: number }, toolsCalled: string[] = []): void {
      const inputTokens = usage.input_tokens;
      const outputTokens = usage.output_tokens;
      const inputCost = (inputTokens / 1_000_000) * INPUT_PRICE_PER_MILLION;
      const outputCost = (outputTokens / 1_000_000) * OUTPUT_PRICE_PER_MILLION;

      this.calls.push({
        iteration: this.calls.length + 1,
        inputTokens,
        outputTokens,
        inputCost,
        outputCost,
        toolsCalled,
      });
    }

    getTotalCost(): number {
      return this.calls.reduce((sum, c) => sum + c.inputCost + c.outputCost, 0);
    }

    getTotalTokens(): { input: number; output: number } {
      return {
        input: this.calls.reduce((sum, c) => sum + c.inputTokens, 0),
        output: this.calls.reduce((sum, c) => sum + c.outputTokens, 0),
      };
    }

    getTotalCalls(): number {
      return this.calls.length;
    }

    exceededBudget(): boolean {
      return this.getTotalCost() >= this.maxBudget;
    }

    summary(): string {
      const tokens = this.getTotalTokens();
      const totalCost = this.getTotalCost();
      return [
        `API calls: ${this.calls.length}`,
        `Input tokens: ${tokens.input}`,
        `Output tokens: ${tokens.output}`,
        `Total cost: $${totalCost.toFixed(6)}`,
        `Max budget: $${this.maxBudget.toFixed(6)}`,
        `Budget usage: ${((totalCost / this.maxBudget) * 100).toFixed(1)}%`,
      ].join('\n');
    }
  }

  it('record() accumulates costs from usage data', () => {
    const tracker = new CostTracker();
    tracker.record({ input_tokens: 100, output_tokens: 50 }, ['fetch_data']);
    tracker.record({ input_tokens: 200, output_tokens: 100 }, ['compute_statistics']);

    expect(tracker.getTotalCalls()).toBe(2);
    const tokens = tracker.getTotalTokens();
    expect(tokens.input).toBe(300);
    expect(tokens.output).toBe(150);
  });

  it('getTotalCost() sums all iterations correctly', () => {
    const tracker = new CostTracker();
    tracker.record({ input_tokens: 1000, output_tokens: 500 });
    tracker.record({ input_tokens: 2000, output_tokens: 1000 });

    const expectedCost1 = (1000 / 1_000_000) * 1.0 + (500 / 1_000_000) * 5.0;
    const expectedCost2 = (2000 / 1_000_000) * 1.0 + (1000 / 1_000_000) * 5.0;
    expect(tracker.getTotalCost()).toBeCloseTo(expectedCost1 + expectedCost2, 8);
  });

  it('exceededBudget() triggers at budget limit', () => {
    const tracker = new CostTracker(0.001);
    tracker.record({ input_tokens: 100, output_tokens: 50 });
    expect(tracker.exceededBudget()).toBe(false);

    tracker.record({ input_tokens: 100000, output_tokens: 50000 });
    expect(tracker.exceededBudget()).toBe(true);
  });

  it('summary() returns formatted report with all fields', () => {
    const tracker = new CostTracker(0.05);
    tracker.record({ input_tokens: 500, output_tokens: 200 }, ['fetch_data']);

    const report = tracker.summary();
    expect(report).toContain('API calls: 1');
    expect(report).toContain('Input tokens: 500');
    expect(report).toContain('Output tokens: 200');
    expect(report).toContain('Total cost: $');
    expect(report).toContain('Max budget: $');
    expect(report).toContain('Budget usage:');
  });
});

// =============================================
// Ex17: Tool Composition
// =============================================
describe('Ex17: Tool Composition', () => {
  const inventoryDB: Record<string, { price: number; quantity: number }> = {
    notebook: { price: 4500, quantity: 15 },
    mouse: { price: 89, quantity: 200 },
    keyboard: { price: 250, quantity: 45 },
    monitor: { price: 2800, quantity: 8 },
  };

  const shippingByCity: Record<string, number> = {
    'sao paulo': 15,
    'rio de janeiro': 25,
    'belo horizonte': 30,
    curitiba: 35,
  };

  const couponsDB: Record<string, number> = {
    DISCOUNT10: 10,
    DISCOUNT20: 20,
    FIRSTPURCHASE: 15,
  };

  function validateStock(product: string, quantity: number): { ok: boolean; msg: string; price?: number } {
    const item = inventoryDB[product.toLowerCase()];
    if (!item) return { ok: false, msg: `Product "${product}" not found` };
    if (item.quantity < quantity) {
      return { ok: false, msg: `Insufficient stock: ${product} has ${item.quantity}, requested ${quantity}` };
    }
    return { ok: true, msg: 'OK', price: item.price };
  }

  function calculateShipping(city: string): { cost: number; delivery_time: string } {
    const shipping = shippingByCity[city.toLowerCase()];
    if (shipping === undefined) return { cost: 50, delivery_time: '10-15 business days' };
    return { cost: shipping, delivery_time: shipping <= 20 ? '3-5 business days' : '5-8 business days' };
  }

  function applyDiscount(total: number, coupon?: string): { discount: number; percentage: number } {
    if (!coupon) return { discount: 0, percentage: 0 };
    const percentage = couponsDB[coupon.toUpperCase()];
    if (!percentage) return { discount: 0, percentage: 0 };
    return { discount: total * (percentage / 100), percentage };
  }

  it('validateStock returns ok for existing product with sufficient stock', () => {
    const result = validateStock('notebook', 5);
    expect(result.ok).toBe(true);
    expect(result.price).toBe(4500);
  });

  it('validateStock returns error for missing product or insufficient stock', () => {
    const missing = validateStock('tablet', 1);
    expect(missing.ok).toBe(false);
    expect(missing.msg).toContain('not found');

    const insufficient = validateStock('monitor', 100);
    expect(insufficient.ok).toBe(false);
    expect(insufficient.msg).toContain('Insufficient');
  });

  it('calculateShipping returns correct values by city', () => {
    expect(calculateShipping('Sao Paulo').cost).toBe(15);
    expect(calculateShipping('Sao Paulo').delivery_time).toBe('3-5 business days');
    expect(calculateShipping('Curitiba').cost).toBe(35);
    expect(calculateShipping('Curitiba').delivery_time).toBe('5-8 business days');
    expect(calculateShipping('Manaus').cost).toBe(50); // unknown city = default shipping
  });

  it('applyDiscount applies valid coupons and ignores invalid ones', () => {
    const valid = applyDiscount(1000, 'DISCOUNT10');
    expect(valid.percentage).toBe(10);
    expect(valid.discount).toBe(100);

    const invalid = applyDiscount(1000, 'INVALID');
    expect(invalid.percentage).toBe(0);
    expect(invalid.discount).toBe(0);

    const noCoupon = applyDiscount(1000);
    expect(noCoupon.discount).toBe(0);
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
      name: 'list_users',
      description: 'Lists system users.',
      params: [
        { name: 'status', type: 'string', description: 'Filter by status', required: false, enumValues: ['active', 'inactive', 'all'] },
      ],
      roles: ['admin', 'editor', 'viewer'],
      handler: () => JSON.stringify([{ name: 'Ana' }, { name: 'Carlos' }]),
    },
    {
      name: 'create_user',
      description: 'Creates a new user.',
      params: [
        { name: 'name', type: 'string', description: 'Full name', required: true },
        { name: 'email', type: 'string', description: 'Email', required: true },
        { name: 'role', type: 'string', description: 'Role', required: true, enumValues: ['admin', 'editor', 'viewer'] },
      ],
      roles: ['admin'],
      handler: (input) => JSON.stringify({ created: { name: input.name, email: input.email } }),
    },
    {
      name: 'delete_user',
      description: 'Removes a user from the system.',
      params: [
        { name: 'id', type: 'string', description: 'User ID', required: true },
      ],
      roles: ['admin'],
      handler: (input) => JSON.stringify({ deleted: input.id }),
    },
    {
      name: 'view_logs',
      description: 'Views audit logs.',
      params: [
        { name: 'limit', type: 'number', description: 'Max logs', required: false },
      ],
      roles: ['admin'],
      handler: () => JSON.stringify([{ action: 'login', user: 'ana' }]),
    },
    {
      name: 'edit_user',
      description: 'Edits user data.',
      params: [
        { name: 'id', type: 'string', description: 'User ID', required: true },
        { name: 'name', type: 'string', description: 'New name', required: false },
      ],
      roles: ['admin', 'editor'],
      handler: (input) => JSON.stringify({ updated: input.id }),
    },
  ];

  function generateToolSchemas(configs: ToolConfig[], userRole: string) {
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
    const adminTools = generateToolSchemas(toolConfigs, 'admin');
    const viewerTools = generateToolSchemas(toolConfigs, 'viewer');

    expect(adminTools).toHaveLength(5);
    expect(viewerTools).toHaveLength(1);
    expect(viewerTools[0].name).toBe('list_users');
  });

  it('generated schemas include correct properties and required fields', () => {
    const adminTools = generateToolSchemas(toolConfigs, 'admin');
    const createUser = adminTools.find((t) => t.name === 'create_user')!;

    expect(createUser.input_schema.type).toBe('object');
    expect(createUser.input_schema.properties.name).toBeDefined();
    expect(createUser.input_schema.properties.email).toBeDefined();
    expect(createUser.input_schema.properties.role).toBeDefined();
    expect(createUser.input_schema.required).toContain('name');
    expect(createUser.input_schema.required).toContain('email');
    expect(createUser.input_schema.required).toContain('role');
    expect((createUser.input_schema.properties.role as Record<string, unknown>).enum).toEqual(['admin', 'editor', 'viewer']);
  });

  it('dynamic dispatcher routes to correct handler', () => {
    function createDispatcher(configs: ToolConfig[]) {
      const handlerMap = new Map(configs.map((c) => [c.name, c.handler]));
      return (name: string, input: Record<string, unknown>) => {
        const handler = handlerMap.get(name);
        if (!handler) return JSON.stringify({ error: `Unknown tool: ${name}` });
        return handler(input);
      };
    }

    const dispatch = createDispatcher(toolConfigs);

    const result1 = JSON.parse(dispatch('list_users', {}));
    expect(Array.isArray(result1)).toBe(true);

    const result2 = JSON.parse(dispatch('create_user', { name: 'Test', email: 'test@t.com' }));
    expect(result2.created).toBeDefined();
    expect(result2.created.name).toBe('Test');

    const result3 = JSON.parse(dispatch('nonexistent', {}));
    expect(result3.error).toContain('Unknown');
  });
});

// =============================================
// Ex19: Tools for Data Pipeline (ETL)
// =============================================
describe('Ex19: Tools for Data Pipeline', () => {
  const sources: Record<string, string[]> = {
    sales_csv: [
      'date,product,amount,region',
      '2026-01-05,Pro Plan,299,Southeast',
      '2026-01-10,Enterprise Plan,999,Southeast',
      '2026-01-15,Pro Plan,299,Northeast',
      '2026-01-25,Starter Plan,49,South',
    ],
  };

  function handleExtract(input: { source: string }): Record<string, unknown> {
    const csv = sources[input.source];
    if (!csv) {
      return { error: `Source "${input.source}" not found` };
    }
    const headers = csv[0].split(',');
    const records = csv.slice(1).map((line) => {
      const values = line.split(',');
      const obj: Record<string, string | number> = {};
      headers.forEach((h, i) => {
        const num = Number(values[i]);
        obj[h] = isNaN(num) ? values[i] : num;
      });
      return obj;
    });
    return {
      source: input.source,
      total_records: records.length,
      columns: headers,
      data: records,
    };
  }

  function handleTransform(input: {
    data: Array<Record<string, unknown>>;
    operation: string;
    field: string;
    sum_field?: string;
    filter_value?: string;
  }): Record<string, unknown> {
    const { data, operation, field } = input;

    if (operation === 'group_by') {
      const groups: Record<string, { count: number; sum: number }> = {};
      for (const record of data) {
        const key = String(record[field]);
        if (!groups[key]) groups[key] = { count: 0, sum: 0 };
        groups[key].count++;
        if (input.sum_field && typeof record[input.sum_field] === 'number') {
          groups[key].sum += record[input.sum_field] as number;
        }
      }
      return {
        operation: 'group_by',
        total_groups: Object.keys(groups).length,
        result: Object.entries(groups).map(([key, info]) => ({
          [field]: key,
          count: info.count,
          sum: input.sum_field ? info.sum : undefined,
        })),
      };
    }

    if (operation === 'filter') {
      const filtered = data.filter(
        (record) => String(record[field]).toLowerCase().includes((input.filter_value || '').toLowerCase())
      );
      return {
        operation: 'filter',
        total_original: data.length,
        total_filtered: filtered.length,
        data: filtered,
      };
    }

    return { error: `Invalid operation "${operation}"` };
  }

  it('extraction handler parses CSV into structured records', () => {
    const result = handleExtract({ source: 'sales_csv' });
    expect(result.total_records).toBe(4);
    expect(result.columns).toEqual(['date', 'product', 'amount', 'region']);
    const data = result.data as Array<Record<string, unknown>>;
    expect(data[0].product).toBe('Pro Plan');
    expect(data[0].amount).toBe(299);
  });

  it('transformation handler groups and sums data correctly', () => {
    const extracted = handleExtract({ source: 'sales_csv' });
    const data = extracted.data as Array<Record<string, unknown>>;

    const result = handleTransform({
      data,
      operation: 'group_by',
      field: 'region',
      sum_field: 'amount',
    });

    expect(result.operation).toBe('group_by');
    expect(result.total_groups).toBe(3); // Southeast, Northeast, South
    const results = result.result as Array<Record<string, unknown>>;
    const southeast = results.find((r) => r.region === 'Southeast');
    expect(southeast!.count).toBe(2);
    expect(southeast!.sum).toBe(299 + 999);
  });

  it('pipeline orchestration chains extract then transform', () => {
    // Step 1: Extract
    const extracted = handleExtract({ source: 'sales_csv' });
    expect(extracted.error).toBeUndefined();

    // Step 2: Transform (group by product)
    const data = extracted.data as Array<Record<string, unknown>>;
    const transformed = handleTransform({
      data,
      operation: 'group_by',
      field: 'product',
      sum_field: 'amount',
    });

    expect(transformed.operation).toBe('group_by');
    const results = transformed.result as Array<Record<string, unknown>>;
    const pro = results.find((r) => r.product === 'Pro Plan');
    expect(pro!.count).toBe(2);
    expect(pro!.sum).toBe(598);
  });
});

// =============================================
// Ex20: Mini Agent
// =============================================
describe('Ex20: Mini Agent', () => {
  it('agent has 5+ tool definitions covering project management', () => {
    const tools = [
      { name: 'list_projects', description: 'Lists all active projects.' },
      { name: 'view_tasks', description: 'Lists tasks for a project.' },
      { name: 'create_task', description: 'Creates a new task.' },
      { name: 'assign_task', description: 'Assigns a task to a member.' },
      { name: 'list_team', description: 'Lists team members.' },
      { name: 'update_task', description: 'Updates the status of a task.' },
      { name: 'generate_project_report', description: 'Generates a project report.' },
    ];

    expect(tools.length).toBeGreaterThanOrEqual(5);
    const toolNames = tools.map((t) => t.name);
    expect(toolNames).toContain('list_projects');
    expect(toolNames).toContain('create_task');
    expect(toolNames).toContain('assign_task');
    expect(toolNames).toContain('list_team');
    expect(toolNames).toContain('generate_project_report');
  });

  it('agent loop continues while stop_reason is tool_use', async () => {
    // Simulate: first call returns tool_use, second returns end_turn
    mockCreate
      .mockResolvedValueOnce(
        mockToolUseResponse('list_projects', {}, 'toolu_1')
      )
      .mockResolvedValueOnce(
        mockResponse('Here is the project summary.', 200, 150)
      );

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    type MessageParam = { role: string; content: unknown };
    const messages: MessageParam[] = [
      { role: 'user', content: 'List the projects' },
    ];

    let iterations = 0;
    let continueLoop = true;

    while (continueLoop) {
      iterations++;
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        tools: [{ name: 'list_projects', description: 'Lists projects', input_schema: { type: 'object', properties: {}, required: [] } }],
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
        case 'list_projects':
          return JSON.stringify([{ id: 'proj-1', name: 'Launch v2' }]);
        case 'view_tasks':
          return JSON.stringify({ tasks: [{ id: 't1', title: 'Design' }] });
        case 'create_task':
          return JSON.stringify({ created: { id: 't100', title: 'New Task' } });
        case 'assign_task':
          return JSON.stringify({ assigned: { task: 'Design', assignee: 'Ana' } });
        case 'list_team':
          return JSON.stringify([{ name: 'Ana', role: 'Backend', available: true }]);
        case 'update_task':
          return JSON.stringify({ updated: { id: 't1', status: 'completed' } });
        case 'generate_project_report':
          return JSON.stringify({ project: 'Launch v2', metrics: { total_tasks: 3, progress: '66%' } });
        default:
          return `Unknown tool: ${name}`;
      }
    }

    const allTools = [
      'list_projects', 'view_tasks', 'create_task', 'assign_task',
      'list_team', 'update_task', 'generate_project_report',
    ];

    for (const tool of allTools) {
      const result = dispatchTool(tool);
      expect(result).not.toContain('Unknown');
      const parsed = JSON.parse(result);
      expect(parsed).toBeDefined();
    }

    expect(dispatchTool('nonexistent')).toContain('Unknown');
  });
});
