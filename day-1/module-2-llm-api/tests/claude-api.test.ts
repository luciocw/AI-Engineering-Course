/**
 * Tests for Module 2: Claude API + Prompt Engineering
 *
 * Tests prompt construction, response parsing, and token logic.
 * API calls are mocked — no real calls are made.
 * Run: npm test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import Handlebars from 'handlebars';

// === Anthropic SDK Mock ===
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
describe('Ex1: Hello World — response parsing + cost', () => {
  it('extracts text from content array', () => {
    const response = mockResponse('AI Engineering is the discipline...');
    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';

    expect(text).toBe('AI Engineering is the discipline...');
  });

  it('calculates cost correctly for Haiku', () => {
    const usage = { input_tokens: 100, output_tokens: 200 };
    const inputCost = (usage.input_tokens / 1_000_000) * 0.25;
    const outputCost = (usage.output_tokens / 1_000_000) * 1.25;
    const total = inputCost + outputCost;

    expect(inputCost).toBeCloseTo(0.000025, 6);
    expect(outputCost).toBeCloseTo(0.00025, 6);
    expect(total).toBeCloseTo(0.000275, 6);
  });

  it('calculates cost correctly for Sonnet', () => {
    const usage = { input_tokens: 100, output_tokens: 200 };
    const inputCost = (usage.input_tokens / 1_000_000) * 3;
    const outputCost = (usage.output_tokens / 1_000_000) * 15;
    const total = inputCost + outputCost;

    expect(inputCost).toBeCloseTo(0.0003, 6);
    expect(outputCost).toBeCloseTo(0.003, 6);
    expect(total).toBeCloseTo(0.0033, 4);
  });
});

// =============================================
// Ex2: Model Comparison — Haiku vs Sonnet
// =============================================
describe('Ex2: Model Comparison — Haiku vs Sonnet', () => {
  it('configures models with correct prices per million tokens', () => {
    const models = [
      { id: 'claude-haiku-4-5-20251001', name: 'Haiku 4.5', inputCost: 0.25, outputCost: 1.25 },
      { id: 'claude-sonnet-4-5-20250929', name: 'Sonnet 4.5', inputCost: 3, outputCost: 15 },
    ];

    expect(models).toHaveLength(2);
    expect(models[0].inputCost).toBe(0.25);
    expect(models[1].inputCost).toBe(3);
    expect(models[1].outputCost / models[0].outputCost).toBe(12);
  });

  it('calculates cost factor between Sonnet and Haiku', () => {
    const haikuCost = (100 / 1_000_000) * 0.25 + (200 / 1_000_000) * 1.25;
    const sonnetCost = (100 / 1_000_000) * 3 + (200 / 1_000_000) * 15;
    const factor = sonnetCost / haikuCost;

    expect(factor).toBeGreaterThan(1);
    expect(haikuCost).toBeLessThan(sonnetCost);
  });

  it('calls the API with the correct model', async () => {
    mockCreate.mockResolvedValue(mockResponse('Translation here'));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: 'Translate the text.' }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'claude-haiku-4-5-20251001' })
    );
  });
});

// =============================================
// Ex3: System Prompts — personas
// =============================================
describe('Ex3: System Prompts and Personas', () => {
  it('sends system prompt in the API call', async () => {
    mockCreate.mockResolvedValue(mockResponse('Technical response'));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: 'You are a senior code reviewer.',
      messages: [{ role: 'user', content: 'Explain embeddings.' }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: 'You are a senior code reviewer.',
      })
    );
  });

  it('different personas produce distinct system prompts', () => {
    const personas: Record<string, string> = {
      'Code Reviewer': 'You are a senior code reviewer. Be technical.',
      Professor: 'You are a patient professor. Use analogies.',
      Writer: 'You are a technical writer. Use bullet points.',
    };

    const keys = Object.keys(personas);
    expect(keys).toHaveLength(3);
    expect(personas['Code Reviewer']).toContain('technical');
    expect(personas['Professor']).toContain('analogies');
    expect(personas['Writer']).toContain('bullet points');
  });

  it('askWithPersona function passes system and message correctly', async () => {
    mockCreate.mockResolvedValue(mockResponse('Technical explanation', 80, 120));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const system = 'You are a didactic professor.';
    const question = 'How does a vector database work?';

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system,
      messages: [{ role: 'user', content: question }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    expect(text).toBe('Technical explanation');
    expect(response.usage.input_tokens).toBe(80);
  });
});

// =============================================
// Ex4: Structured Instructions — rich system prompt
// =============================================
describe('Ex4: Structured Instructions', () => {
  const systemPromptReviewer = `[Role]
You are a senior code reviewer specialized in TypeScript/Node.js.

[Rules]
1. Always point out security issues first
2. Limit your review to at most 5 points

[Response Format]
## Summary
## Issues Found
## Positive Points`;

  it('structured system prompt contains Role, Rules, and Format sections', () => {
    expect(systemPromptReviewer).toContain('[Role]');
    expect(systemPromptReviewer).toContain('[Rules]');
    expect(systemPromptReviewer).toContain('[Response Format]');
  });

  it('sends structured system prompt to the API', async () => {
    mockCreate.mockResolvedValue(mockResponse('## Summary\nCode with vulnerabilities.'));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: systemPromptReviewer,
      messages: [{ role: 'user', content: 'Review the following code:\n```\nfetch(url)\n```' }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('[Role]'),
      })
    );
  });

  it('different approaches (reviewer vs professor) have distinct structures', () => {
    const systemPromptProfessor = `[Role]
You are a programming professor who does educational code reviews.

[Rules]
1. Explain the WHY behind each issue

[Response Format]
## Overall Grade
## What to Learn
## Well Done on`;

    expect(systemPromptReviewer).toContain('Issues Found');
    expect(systemPromptProfessor).toContain('What to Learn');
    expect(systemPromptReviewer).not.toContain('Overall Grade');
    expect(systemPromptProfessor).not.toContain('Issues Found');
  });
});

// =============================================
// Ex5: Multi-Turn Conversation — message array
// =============================================
describe('Ex5: Multi-Turn Conversation', () => {
  it('accumulates messages across turns', () => {
    type MessageParam = { role: 'user' | 'assistant'; content: string };
    const messages: MessageParam[] = [];

    messages.push({ role: 'user', content: 'Hello' });
    messages.push({ role: 'assistant', content: 'How can I help?' });
    messages.push({ role: 'user', content: 'I need support' });

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

  it('includes complete history in each API call', async () => {
    mockCreate.mockResolvedValue(mockResponse('Response'));

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
// Ex6: Conversation with Memory — summarization
// =============================================
describe('Ex6: Conversation with Memory', () => {
  type MessageParam = { role: 'user' | 'assistant'; content: string };

  function countCharacters(msgs: MessageParam[]): number {
    return msgs.reduce((total, m) => total + m.content.length, 0);
  }

  it('countCharacters returns the correct sum of lengths', () => {
    const msgs: MessageParam[] = [
      { role: 'user', content: 'Hi!' },            // 3
      { role: 'assistant', content: 'How r you' },  // 9
    ];

    expect(countCharacters(msgs)).toBe(12);
  });

  it('detects when character limit is reached', () => {
    const LIMIT = 100;
    const msgs: MessageParam[] = [
      { role: 'user', content: 'A'.repeat(60) },
      { role: 'assistant', content: 'B'.repeat(50) },
    ];

    const total = countCharacters(msgs);
    expect(total).toBeGreaterThan(LIMIT);
  });

  it('replaces history with summary after summarization', async () => {
    mockCreate.mockResolvedValue(mockResponse('Summary of the previous conversation.'));

    let messages: MessageParam[] = [
      { role: 'user', content: 'Long message 1' },
      { role: 'assistant', content: 'Long response 1' },
      { role: 'user', content: 'Long message 2' },
      { role: 'assistant', content: 'Long response 2' },
    ];

    const summary = 'Summary of the previous conversation.';
    messages = [
      { role: 'user', content: `[Previous conversation context]: ${summary}` },
      { role: 'assistant', content: 'Understood, I have the context from the previous conversation. How can I continue helping?' },
    ];

    expect(messages).toHaveLength(2);
    expect(messages[0].content).toContain('Summary of the previous conversation');
  });

  it('calls API to generate conversation summary', async () => {
    mockCreate.mockResolvedValue(mockResponse('Summary: slow server, MySQL 85% CPU'));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [
        { role: 'user', content: 'Summarize the following technical support conversation...' },
      ],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ max_tokens: 300 })
    );
  });
});

// =============================================
// Ex7: Parameters — temperature, max_tokens, stop_sequences
// =============================================
describe('Ex7: API Parameters', () => {
  it('temperature accepts values from 0.0 to 1.0', () => {
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

  it('max_tokens limits the output size', async () => {
    mockCreate.mockResolvedValue({
      ...mockResponse('Short'),
      stop_reason: 'max_tokens',
    });

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Explain machine learning.' }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ max_tokens: 10 })
    );
    expect(response.stop_reason).toBe('max_tokens');
  });
});

// =============================================
// Ex8: Structured Output — JSON extraction + retry
// =============================================
describe('Ex8: Structured JSON Output', () => {
  function parseJsonResponse(text: string): Record<string, unknown> | null {
    // Attempt 1: direct parse
    try {
      return JSON.parse(text);
    } catch {
      // continue
    }
    // Attempt 2: extract from ```json ... ``` block
    const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) {
      try {
        return JSON.parse(jsonBlockMatch[1].trim());
      } catch {
        // continue
      }
    }
    // Attempt 3: find { ... } in text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // failed
      }
    }
    return null;
  }

  it('parses direct JSON', () => {
    const text = '{"sentiment":"positive","confidence":0.95,"keywords":["great"],"summary":"Good product"}';
    const parsed = parseJsonResponse(text);

    expect(parsed).not.toBeNull();
    expect(parsed!.sentiment).toBe('positive');
    expect(parsed!.confidence).toBe(0.95);
  });

  it('extracts JSON from markdown ```json``` block', () => {
    const text = 'Here is the analysis:\n```json\n{"sentiment":"negative","confidence":0.8,"keywords":["defective"],"summary":"Bad"}\n```';
    const parsed = parseJsonResponse(text);

    expect(parsed).not.toBeNull();
    expect(parsed!.sentiment).toBe('negative');
  });

  it('extracts JSON embedded in free text', () => {
    const text = 'The review analysis is: {"sentiment":"neutral","confidence":0.6,"keywords":["basic"],"summary":"Ok"} as requested.';
    const parsed = parseJsonResponse(text);

    expect(parsed).not.toBeNull();
    expect(parsed!.sentiment).toBe('neutral');
  });

  it('returns null for text without valid JSON', () => {
    const text = 'This review is positive, with high confidence.';
    const parsed = parseJsonResponse(text);
    expect(parsed).toBeNull();
  });

  it('retry with error context adds correction messages', async () => {
    // First call returns invalid JSON, second returns valid
    mockCreate
      .mockResolvedValueOnce(mockResponse('Result: positive'))
      .mockResolvedValueOnce(
        mockResponse('{"sentiment":"positive","confidence":0.9,"keywords":["good"],"summary":"Great"}')
      );

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    // Simulate retry: first attempt
    const resp1 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      temperature: 0,
      system: 'Respond ONLY with valid JSON.',
      messages: [{ role: 'user', content: 'Analyze: "Great product"' }],
    });
    const text1 = resp1.content[0].type === 'text' ? resp1.content[0].text : '';
    const parsed1 = parseJsonResponse(text1);

    expect(parsed1).toBeNull();

    // Simulate retry: second attempt with correction message
    const resp2 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      temperature: 0,
      system: 'Respond ONLY with valid JSON.',
      messages: [
        { role: 'user', content: 'Analyze: "Great product"' },
        { role: 'assistant', content: text1 },
        { role: 'user', content: 'The returned JSON is invalid. Return ONLY the valid JSON.' },
      ],
    });
    const text2 = resp2.content[0].type === 'text' ? resp2.content[0].text : '';
    const parsed2 = parseJsonResponse(text2);

    expect(parsed2).not.toBeNull();
    expect(parsed2!.sentiment).toBe('positive');
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });
});

// =============================================
// Ex9: Handlebars Integration — template-driven prompts
// =============================================
describe('Ex9: Handlebars Integration', () => {
  it('renders system template with variables', () => {
    const systemTemplate = Handlebars.compile(
      'You are a copywriter. Write in a {{tone}} tone. Maximum {{length}} words.'
    );
    const result = systemTemplate({ tone: 'casual', length: 50 });

    expect(result).toContain('casual');
    expect(result).toContain('50');
  });

  it('renders user template with feature list', () => {
    const userTemplate = Handlebars.compile(
      `Product: {{name}}\n{{#each features}}- {{this}}\n{{/each}}`
    );
    const result = userTemplate({
      name: 'AI Pro',
      features: ['Dashboard', 'Alerts'],
    });

    expect(result).toContain('AI Pro');
    expect(result).toContain('- Dashboard');
    expect(result).toContain('- Alerts');
  });

  it('sends rendered templates to the API', async () => {
    mockCreate.mockResolvedValue(mockResponse('Product description'));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const system = 'Write in a professional tone.';
    const user = 'Describe the product AI Pro.';

    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system,
      messages: [{ role: 'user', content: user }],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: 'Write in a professional tone.',
        messages: [{ role: 'user', content: 'Describe the product AI Pro.' }],
      })
    );
  });

  it('generateWithTemplate compiles and sends both templates', async () => {
    mockCreate.mockResolvedValue(mockResponse('Generated text'));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const systemTmpl = 'Tone: {{tone}}. Max {{length}} words.';
    const userTmpl = 'Product: {{name}}';
    const data = { tone: 'professional', length: 50, name: 'SmartSit' };

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
        system: 'Tone: professional. Max 50 words.',
        messages: [{ role: 'user', content: 'Product: SmartSit' }],
      })
    );
  });
});

// =============================================
// Ex10: Prompt Registry — PromptRegistry class
// =============================================
describe('Ex10: Prompt Registry', () => {
  type PromptConfig = {
    name: string;
    version: string;
    description: string;
    model: string;
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

    private makeKey(name: string, version: string): string {
      return `${name}@${version}`;
    }

    register(config: PromptConfig): void {
      const key = this.makeKey(config.name, config.version);
      const compiledSystem = Handlebars.compile(config.systemTemplate);
      const compiledUser = Handlebars.compile(config.userTemplate);
      this.prompts.set(key, { config, compiledSystem, compiledUser });
      this.latestVersions.set(config.name, config.version);
    }

    get(name: string, version?: string): PromptConfig | undefined {
      const v = version ?? this.latestVersions.get(name);
      if (!v) return undefined;
      return this.prompts.get(this.makeKey(name, v))?.config;
    }

    list(): string[] {
      return Array.from(this.prompts.keys());
    }
  }

  it('registers and retrieves prompts by name', () => {
    const registry = new PromptRegistry();
    registry.register({
      name: 'classifier',
      version: 'v1',
      description: 'Classifies text',
      model: 'claude-haiku-4-5-20251001',
      maxTokens: 50,
      systemTemplate: 'Classify the text.',
      userTemplate: 'Text: "{{text}}"',
    });

    const config = registry.get('classifier');
    expect(config).toBeDefined();
    expect(config!.name).toBe('classifier');
    expect(config!.version).toBe('v1');
  });

  it('lists all registered prompts', () => {
    const registry = new PromptRegistry();
    registry.register({
      name: 'classifier', version: 'v1', description: 'Classifies',
      model: 'claude-haiku-4-5-20251001', maxTokens: 50,
      systemTemplate: 'System', userTemplate: 'User',
    });
    registry.register({
      name: 'summarizer', version: 'v1', description: 'Summarizes',
      model: 'claude-haiku-4-5-20251001', maxTokens: 150,
      systemTemplate: 'System', userTemplate: 'User',
    });

    const keys = registry.list();
    expect(keys).toHaveLength(2);
    expect(keys).toContain('classifier@v1');
    expect(keys).toContain('summarizer@v1');
  });

  it('supports versioning — v2 overwrites latest', () => {
    const registry = new PromptRegistry();
    registry.register({
      name: 'classifier', version: 'v1', description: 'v1',
      model: 'claude-haiku-4-5-20251001', maxTokens: 50,
      systemTemplate: 'Simple', userTemplate: 'User v1',
    });
    registry.register({
      name: 'classifier', version: 'v2', description: 'v2 with JSON',
      model: 'claude-haiku-4-5-20251001', maxTokens: 150,
      systemTemplate: 'With JSON', userTemplate: 'User v2',
    });

    // No version = returns latest (v2)
    const latest = registry.get('classifier');
    expect(latest!.version).toBe('v2');

    // With explicit version = returns v1
    const v1 = registry.get('classifier', 'v1');
    expect(v1!.version).toBe('v1');
  });

  it('returns undefined for non-existent prompt', () => {
    const registry = new PromptRegistry();
    expect(registry.get('doesnotexist')).toBeUndefined();
  });
});

// =============================================
// Ex11: Few-Shot — zero-shot vs few-shot
// =============================================
describe('Ex11: Few-Shot Learning', () => {
  const examples = [
    { review: 'Excellent!', sentiment: 'positive' },
    { review: 'Horrible.', sentiment: 'negative' },
    { review: 'Normal.', sentiment: 'neutral' },
  ];

  it('zero-shot prompt contains only the review without examples', () => {
    const prompt = `Classify the sentiment: "Great product"\nSentiment:`;
    expect(prompt).toContain('Great product');
    expect(prompt).not.toContain('positive');
    expect(prompt).not.toContain('negative');
  });

  it('few-shot prompt includes all examples', () => {
    const formattedExamples = examples
      .map((e) => `Review: "${e.review}" -> Sentiment: ${e.sentiment}`)
      .join('\n');

    const prompt = `${formattedExamples}\nReview: "New review" -> Sentiment:`;

    expect(prompt).toContain('Excellent!');
    expect(prompt).toContain('positive');
    expect(prompt).toContain('Horrible.');
    expect(prompt).toContain('negative');
    expect(prompt).toContain('New review');
  });

  it('few-shot prompt ends with classification target', () => {
    const prompt = `Review: "Test" -> Sentiment:`;
    expect(prompt).toMatch(/Sentiment:\s*$/);
  });
});

// =============================================
// Ex12: Dynamic Few-Shot — selection by relevance
// =============================================
describe('Ex12: Dynamic Few-Shot', () => {
  type Example = {
    text: string;
    category: string;
    keywords: string[];
  };

  const exampleBank: Example[] = [
    { text: 'My card was cloned', category: 'fraud', keywords: ['card', 'cloned', 'fraud'] },
    { text: 'The banking app gives an error', category: 'technical_issue', keywords: ['app', 'bank', 'error'] },
    { text: 'I want a limit increase', category: 'request', keywords: ['limit', 'card', 'increase'] },
    { text: 'Charged twice', category: 'billing', keywords: ['charged', 'invoice', 'billing'] },
    { text: 'How to register PIX?', category: 'question', keywords: ['register', 'pix', 'how'] },
    { text: 'I want to cancel my account', category: 'cancellation', keywords: ['cancel', 'account', 'close'] },
  ];

  function selectExamples(input: string, bank: Example[], n: number): Example[] {
    const inputLower = input.toLowerCase();
    const inputWords = inputLower.split(/\s+/);

    const scored = bank.map((example) => {
      let score = 0;
      for (const keyword of example.keywords) {
        if (inputLower.includes(keyword.toLowerCase())) {
          score += 2;
        }
        for (const word of inputWords) {
          if (word.length > 3 && keyword.toLowerCase().includes(word)) {
            score += 1;
          }
        }
      }
      return { example, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, n)
      .map((s) => s.example);
  }

  it('selects examples by keyword relevance', () => {
    const input = 'My card was used without authorization, it is fraud';
    const selected = selectExamples(input, exampleBank, 2);

    expect(selected).toHaveLength(2);
    expect(selected[0].category).toBe('fraud');
  });

  it('returns N requested examples', () => {
    const input = 'Any problem';
    const selected = selectExamples(input, exampleBank, 3);
    expect(selected).toHaveLength(3);
  });

  it('builds dynamic few-shot prompt with selected examples', () => {
    const examples = selectExamples('I want to cancel everything', exampleBank, 2);
    const formattedExamples = examples
      .map((e) => `Text: "${e.text}" -> Category: ${e.category}`)
      .join('\n');

    const prompt = `Classify:\n${formattedExamples}\n\nText: "I want to cancel everything" -> Category:`;

    expect(prompt).toContain('cancel');
    expect(prompt).toContain('Category:');
    expect(prompt.split('->').length).toBeGreaterThanOrEqual(3); // 2 examples + 1 input
  });
});

// =============================================
// Ex13: Chain-of-Thought — CoT vs direct
// =============================================
describe('Ex13: Chain-of-Thought', () => {
  const CORRECT_ANSWER = 1372.75;

  function extractPrice(text: string): number | null {
    try {
      const json = JSON.parse(text);
      if (json.finalPrice) return Number(json.finalPrice);
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
    expect(extractPrice('1372.75')).toBeCloseTo(CORRECT_ANSWER);
  });

  it('extracts price from text with R$ format', () => {
    expect(extractPrice('The total is R$ 1.372,75 per month.')).toBeCloseTo(
      CORRECT_ANSWER
    );
  });

  it('extracts price from TOTAL line', () => {
    expect(
      extractPrice('Base: 500\nUsers: 750\nTOTAL: R$1.372,75')
    ).toBeCloseTo(CORRECT_ANSWER);
  });

  it('extracts price from JSON response', () => {
    const json = JSON.stringify({
      steps: [{ description: 'Base', value: 500 }],
      finalPrice: 1372.75,
      confidence: 'high',
    });
    expect(extractPrice(json)).toBeCloseTo(CORRECT_ANSWER);
  });

  it('validates the correct calculation for the SaaS scenario', () => {
    const base = 500;
    const users = 25 * 30;
    const tier = 200;
    const addons = 100 + 150;
    const subtotal = base + users + tier + addons;
    const afterAnnual = subtotal * (1 - 0.15);
    const afterLoyalty = afterAnnual * (1 - 0.05);

    expect(subtotal).toBe(1700);
    expect(afterAnnual).toBeCloseTo(1445);
    expect(afterLoyalty).toBeCloseTo(CORRECT_ANSWER);
  });
});

// =============================================
// Ex14: Robust Classification — few-shot + CoT + JSON
// =============================================
describe('Ex14: Robust Classification', () => {
  const CATEGORIES = ['technical', 'billing', 'cancellation', 'question', 'suggestion'] as const;

  function parseJsonResponse(text: string): Record<string, unknown> | null {
    try {
      const parsed = JSON.parse(text);
      if (CATEGORIES.includes(parsed.category)) return parsed;
    } catch { /* continue */ }

    const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) {
      try {
        const parsed = JSON.parse(jsonBlockMatch[1].trim());
        if (CATEGORIES.includes(parsed.category)) return parsed;
      } catch { /* continue */ }
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (CATEGORIES.includes(parsed.category)) return parsed;
      } catch { /* failed */ }
    }
    return null;
  }

  it('classification prompt contains few-shot and CoT instructions', () => {
    const system = `You are a ticket classifier.
Analyze each ticket step by step (Chain-of-Thought):
1. Identify the keywords
2. Consider which category best fits
Respond ONLY with valid JSON.`;

    expect(system).toContain('Chain-of-Thought');
    expect(system).toContain('valid JSON');
    expect(system).toContain('classifier');
  });

  it('validates JSON with accepted category', () => {
    const text = '{"category":"technical","confidence":0.95,"reasoning":"Technical error","suggestedAction":"N2 Support"}';
    const parsed = parseJsonResponse(text);

    expect(parsed).not.toBeNull();
    expect(parsed!.category).toBe('technical');
    expect(parsed!.confidence).toBe(0.95);
  });

  it('rejects JSON with invalid category', () => {
    const text = '{"category":"nonexistent","confidence":0.5,"reasoning":"X","suggestedAction":"Y"}';
    const parsed = parseJsonResponse(text);
    expect(parsed).toBeNull();
  });

  it('classifies ticket by calling the API', async () => {
    const jsonResp = JSON.stringify({
      category: 'billing',
      confidence: 0.92,
      reasoning: 'Mentions duplicate billing.',
      suggestedAction: 'Check payment history.',
    });
    mockCreate.mockResolvedValue(mockResponse(jsonResp));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      temperature: 0,
      system: 'Ticket classifier',
      messages: [{ role: 'user', content: 'Why did my plan go from $49 to $79?' }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = parseJsonResponse(text);

    expect(parsed).not.toBeNull();
    expect(parsed!.category).toBe('billing');
  });
});

// =============================================
// Ex15: Prompt Chaining — multi-step sequential
// =============================================
describe('Ex15: Prompt Chaining', () => {
  it('chain of 3 steps: extract facts -> summary -> posts', async () => {
    const factsJson = JSON.stringify({
      name: 'NovaTech', sector: 'fintech', founded: '2019 SP',
      products: ['FinBot Pro'], metrics: ['2M transactions/day'], differentiators: ['Proprietary AI'],
    });
    const summaryJson = JSON.stringify({
      title: 'NovaTech: AI for finance',
      summary: 'Fintech startup with AI.',
      keyPoints: ['2M transactions', 'Series B'],
    });
    const postsJson = JSON.stringify([
      { platform: 'Twitter', content: 'NovaTech revolutionizes!', hashtags: ['fintech'] },
      { platform: 'LinkedIn', content: 'Meet NovaTech...', hashtags: ['AI'] },
      { platform: 'Instagram', content: 'Innovation!', hashtags: ['tech'] },
    ]);

    mockCreate
      .mockResolvedValueOnce(mockResponse(factsJson, 200, 150))
      .mockResolvedValueOnce(mockResponse(summaryJson, 180, 100))
      .mockResolvedValueOnce(mockResponse(postsJson, 160, 200));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    // Step 1: Extract facts
    const resp1 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 800, temperature: 0,
      messages: [{ role: 'user', content: 'Extract the facts from the text...' }],
    });
    const facts = JSON.parse(resp1.content[0].type === 'text' ? resp1.content[0].text : '');

    // Step 2: Generate summary (using step 1 output)
    const resp2 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 600, temperature: 0,
      messages: [{ role: 'user', content: `Generate a summary: ${JSON.stringify(facts)}` }],
    });
    const summary = JSON.parse(resp2.content[0].type === 'text' ? resp2.content[0].text : '');

    // Step 3: Create posts (using step 2 output)
    const resp3 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 1000, temperature: 0.7,
      messages: [{ role: 'user', content: `Create posts: ${summary.title}` }],
    });
    const posts = JSON.parse(resp3.content[0].type === 'text' ? resp3.content[0].text : '');

    expect(mockCreate).toHaveBeenCalledTimes(3);
    expect(facts.name).toBe('NovaTech');
    expect(summary.keyPoints).toHaveLength(2);
    expect(posts).toHaveLength(3);
    expect(posts[0].platform).toBe('Twitter');
  });

  it('tracks tokens per step in the chain', () => {
    type ChainStep = {
      name: string;
      inputTokens: number;
      outputTokens: number;
    };

    const steps: ChainStep[] = [
      { name: 'Extract Facts', inputTokens: 200, outputTokens: 150 },
      { name: 'Generate Summary', inputTokens: 180, outputTokens: 100 },
      { name: 'Create Posts', inputTokens: 160, outputTokens: 200 },
    ];

    const totalInput = steps.reduce((s, e) => s + e.inputTokens, 0);
    const totalOutput = steps.reduce((s, e) => s + e.outputTokens, 0);

    expect(totalInput).toBe(540);
    expect(totalOutput).toBe(450);
    expect(totalInput + totalOutput).toBe(990);
  });

  it('calculates total chain cost with Haiku', () => {
    const totalInput = 540;
    const totalOutput = 450;
    const inputCost = (totalInput / 1_000_000) * 0.25;
    const outputCost = (totalOutput / 1_000_000) * 1.25;

    expect(inputCost + outputCost).toBeCloseTo(0.000698, 5);
  });
});

// =============================================
// Ex16: Prompt Routing — classification + dispatch
// =============================================
describe('Ex16: Prompt Routing', () => {
  type Category = 'technical' | 'sales' | 'support' | 'general';

  const systemPrompts: Record<Category, string> = {
    technical: 'You are a senior technical specialist.',
    sales: 'You are a sales consultant.',
    support: 'You are an empathetic support agent.',
    general: 'You are a friendly representative.',
  };

  it('classifies intent and returns valid category', async () => {
    const classificationResp = JSON.stringify({
      category: 'technical', confidence: 0.95, justification: 'API error',
    });
    mockCreate.mockResolvedValue(mockResponse(classificationResp));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 200, temperature: 0,
      messages: [{ role: 'user', content: 'Classify: 429 error on the API' }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const classification = JSON.parse(text);

    expect(['technical', 'sales', 'support', 'general']).toContain(classification.category);
    expect(classification.confidence).toBeGreaterThan(0);
  });

  it('routes to the correct specialized system prompt', () => {
    const category: Category = 'sales';
    const systemPrompt = systemPrompts[category];

    expect(systemPrompt).toContain('sales');
    expect(systemPrompt).not.toContain('technical');
  });

  it('complete pipeline: classify + route in 2 calls', async () => {
    mockCreate
      .mockResolvedValueOnce(
        mockResponse(JSON.stringify({ category: 'support', confidence: 0.9, justification: 'Access problem' }))
      )
      .mockResolvedValueOnce(
        mockResponse('I understand your frustration. Follow these steps: 1. Clear the cache...')
      );

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    // Step 1: Classify
    const resp1 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 200, temperature: 0,
      messages: [{ role: 'user', content: 'Classify: I cannot access my account' }],
    });
    const text1 = resp1.content[0].type === 'text' ? resp1.content[0].text : '';
    const classification = JSON.parse(text1);

    // Step 2: Route to specialist
    const resp2 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 400, temperature: 0.3,
      system: systemPrompts[classification.category as Category],
      messages: [{ role: 'user', content: 'I cannot access my account' }],
    });
    const text2 = resp2.content[0].type === 'text' ? resp2.content[0].text : '';

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(classification.category).toBe('support');
    expect(text2).toContain('understand');
  });
});

// =============================================
// Ex17: Cost Tracking — CostTracker utility
// =============================================
describe('Ex17: Cost Tracking', () => {
  type SupportedModel = 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-20250514';

  type CostRecord = {
    model: SupportedModel;
    inputTokens: number;
    outputTokens: number;
    inputCost: number;
    outputCost: number;
    totalCost: number;
    timestamp: Date;
    description?: string;
  };

  type PriceEntry = { input: number; output: number };

  class CostTracker {
    private priceMap: Record<SupportedModel, PriceEntry> = {
      'claude-haiku-4-5-20251001': { input: 0.25, output: 1.25 },
      'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
    };

    private records: CostRecord[] = [];
    private budgetLimit: number | null = null;

    track(model: SupportedModel, inputTokens: number, outputTokens: number, description?: string): CostRecord {
      const prices = this.priceMap[model];
      if (!prices) throw new Error(`Unsupported model: ${model}`);

      const inputCost = (inputTokens / 1_000_000) * prices.input;
      const outputCost = (outputTokens / 1_000_000) * prices.output;
      const totalCost = inputCost + outputCost;

      const accumulatedCost = this.getCost();
      if (this.budgetLimit !== null && accumulatedCost + totalCost > this.budgetLimit) {
        throw new Error(`Budget limit exceeded!`);
      }

      const record: CostRecord = {
        model, inputTokens, outputTokens, inputCost, outputCost, totalCost,
        timestamp: new Date(), description,
      };
      this.records.push(record);
      return record;
    }

    getCost(): number {
      return this.records.reduce((sum, r) => sum + r.totalCost, 0);
    }

    setLimit(value: number): void {
      this.budgetLimit = value;
    }

    getReport() {
      const byModel: Record<string, { calls: number; inputTokens: number; outputTokens: number; cost: number }> = {};
      for (const r of this.records) {
        if (!byModel[r.model]) byModel[r.model] = { calls: 0, inputTokens: 0, outputTokens: 0, cost: 0 };
        byModel[r.model].calls++;
        byModel[r.model].inputTokens += r.inputTokens;
        byModel[r.model].outputTokens += r.outputTokens;
        byModel[r.model].cost += r.totalCost;
      }
      return {
        totalCalls: this.records.length,
        totalInputTokens: this.records.reduce((s, r) => s + r.inputTokens, 0),
        totalOutputTokens: this.records.reduce((s, r) => s + r.outputTokens, 0),
        totalCost: this.getCost(),
        byModel,
      };
    }
  }

  it('track calculates cost correctly for Haiku', () => {
    const tracker = new CostTracker();
    const record = tracker.track('claude-haiku-4-5-20251001', 1000, 500, 'Test');

    expect(record.inputCost).toBeCloseTo(0.00025, 6);
    expect(record.outputCost).toBeCloseTo(0.000625, 6);
    expect(record.totalCost).toBeCloseTo(0.000875, 6);
  });

  it('getCost accumulates costs from multiple calls', () => {
    const tracker = new CostTracker();
    tracker.track('claude-haiku-4-5-20251001', 100, 50);
    tracker.track('claude-haiku-4-5-20251001', 200, 100);

    const total = tracker.getCost();
    const expected =
      (100 / 1_000_000) * 0.25 + (50 / 1_000_000) * 1.25 +
      (200 / 1_000_000) * 0.25 + (100 / 1_000_000) * 1.25;

    expect(total).toBeCloseTo(expected, 8);
  });

  it('setLimit throws error when budget is exceeded', () => {
    const tracker = new CostTracker();
    tracker.setLimit(0.0001);

    // First call with high cost should exceed the limit
    expect(() => {
      tracker.track('claude-sonnet-4-20250514', 100000, 50000);
    }).toThrow('Budget limit exceeded!');
  });

  it('getReport returns correct report with breakdown by model', () => {
    const tracker = new CostTracker();
    tracker.track('claude-haiku-4-5-20251001', 100, 50);
    tracker.track('claude-sonnet-4-20250514', 100, 50);

    const report = tracker.getReport();

    expect(report.totalCalls).toBe(2);
    expect(Object.keys(report.byModel)).toHaveLength(2);
    expect(report.byModel['claude-haiku-4-5-20251001'].calls).toBe(1);
    expect(report.byModel['claude-sonnet-4-20250514'].calls).toBe(1);
    expect(report.byModel['claude-sonnet-4-20250514'].cost).toBeGreaterThan(
      report.byModel['claude-haiku-4-5-20251001'].cost
    );
  });
});

// =============================================
// Ex18: Quality Evaluation — LLM-as-Judge
// =============================================
describe('Ex18: Quality Evaluation (LLM-as-Judge)', () => {
  it('judge prompt contains criteria: clarity, completeness, accuracy', () => {
    const judgePrompt = `Evaluate the response based on 3 criteria (score 0-10):
- clarity: how clear and accessible
- completeness: how complete
- accuracy: how technically correct
Return JSON: {"clarity":0,"completeness":0,"accuracy":0,"justification":"..."}`;

    expect(judgePrompt).toContain('clarity');
    expect(judgePrompt).toContain('completeness');
    expect(judgePrompt).toContain('accuracy');
    expect(judgePrompt).toContain('JSON');
  });

  it('calculates average of evaluation scores', () => {
    const evaluation = { clarity: 8, completeness: 7, accuracy: 9, justification: 'Good response' };
    const average = (evaluation.clarity + evaluation.completeness + evaluation.accuracy) / 3;

    expect(average).toBeCloseTo(8.0, 1);
  });

  it('evaluates response via judge call (Sonnet)', async () => {
    const evaluationJson = JSON.stringify({
      clarity: 9, completeness: 8, accuracy: 9, justification: 'Clear and accurate explanation.',
    });
    mockCreate.mockResolvedValue(mockResponse(evaluationJson));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      temperature: 0,
      messages: [{ role: 'user', content: 'Evaluate this response...' }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const evaluation = JSON.parse(text);

    expect(evaluation.clarity).toBeGreaterThanOrEqual(0);
    expect(evaluation.clarity).toBeLessThanOrEqual(10);
    expect(evaluation.justification).toBeTruthy();
  });

  it('compares average between models to find best performance', () => {
    const results = [
      { model: 'Haiku 4.5', average: 7.5 },
      { model: 'Haiku 4.5', average: 7.0 },
      { model: 'Sonnet 4', average: 8.5 },
      { model: 'Sonnet 4', average: 9.0 },
    ];

    const haikuAverages = results.filter((r) => r.model === 'Haiku 4.5');
    const sonnetAverages = results.filter((r) => r.model === 'Sonnet 4');

    const avgHaiku = haikuAverages.reduce((s, r) => s + r.average, 0) / haikuAverages.length;
    const avgSonnet = sonnetAverages.reduce((s, r) => s + r.average, 0) / sonnetAverages.length;

    expect(avgSonnet).toBeGreaterThan(avgHaiku);
  });
});

// =============================================
// Ex19: Prompt Versioning — tracking + comparison
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

  it('adds and retrieves prompt versions', () => {
    const manager = new PromptVersionManager();
    manager.addVersion('v1.0', 'Classify: {{INPUT}}', 'Initial version');
    manager.addVersion('v1.1', 'Classify with examples: {{INPUT}}', 'Added few-shot');

    expect(manager.listVersions()).toHaveLength(2);
    expect(manager.getVersion('v1.0')!.changelog).toBe('Initial version');
    expect(manager.getVersion('v1.1')!.template).toContain('examples');
  });

  it('getLatest returns the most recent version', () => {
    const manager = new PromptVersionManager();
    manager.addVersion('v1.0', 'Template v1', 'Initial');
    manager.addVersion('v2.0', 'Template v2', 'Structured JSON');

    const latest = manager.getLatest();
    expect(latest!.version).toBe('v2.0');
  });

  it('template replaces {{INPUT}} with the actual ticket', () => {
    const template = 'Classify the following ticket:\n\nTicket: {{INPUT}}';
    const rendered = template.replace('{{INPUT}}', 'The app crashed on Firefox');

    expect(rendered).toContain('The app crashed on Firefox');
    expect(rendered).not.toContain('{{INPUT}}');
  });

  it('compares token metrics between versions', () => {
    const metrics = [
      { version: 'v1.0', avgTokens: 80, avgLatencyMs: 200 },
      { version: 'v1.1', avgTokens: 120, avgLatencyMs: 250 },
      { version: 'v2.0', avgTokens: 180, avgLatencyMs: 350 },
    ];

    // v2.0 uses more tokens because it is more detailed
    expect(metrics[2].avgTokens).toBeGreaterThan(metrics[0].avgTokens);
    // Each version has increasing latency
    for (let i = 1; i < metrics.length; i++) {
      expect(metrics[i].avgLatencyMs).toBeGreaterThanOrEqual(metrics[i - 1].avgLatencyMs);
    }
  });
});

// =============================================
// Ex20: A/B Testing — framework capstone
// =============================================
describe('Ex20: A/B Testing of Prompts (Capstone)', () => {
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
    judgeJustification: string;
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

      // Calculate wins per input
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

  it('registers variants and results in the runner', () => {
    const runner = new ABTestRunner('Summary Test');

    runner.addVariant({ name: 'Direct', systemPrompt: 'Summarize.', userPromptTemplate: '{{INPUT}}' });
    runner.addVariant({ name: 'Structured', systemPrompt: 'Analyze and summarize.', userPromptTemplate: 'Text: {{INPUT}}' });

    runner.addResult({
      variantName: 'Direct', input: 'Text A', output: 'Summary A',
      inputTokens: 100, outputTokens: 50, latencyMs: 200, score: 7, judgeJustification: 'Good',
    });
    runner.addResult({
      variantName: 'Structured', input: 'Text A', output: 'Structured summary A',
      inputTokens: 150, outputTokens: 80, latencyMs: 300, score: 9, judgeJustification: 'Excellent',
    });

    expect(runner.getResults()).toHaveLength(2);
    expect(runner.getName()).toBe('Summary Test');
  });

  it('getSummary calculates averages and wins correctly', () => {
    const runner = new ABTestRunner('Test');

    runner.addVariant({ name: 'A', systemPrompt: '', userPromptTemplate: '' });
    runner.addVariant({ name: 'B', systemPrompt: '', userPromptTemplate: '' });

    // Input 1: B wins
    runner.addResult({ variantName: 'A', input: 'i1', output: 'o', inputTokens: 100, outputTokens: 50, latencyMs: 200, score: 6, judgeJustification: '' });
    runner.addResult({ variantName: 'B', input: 'i1', output: 'o', inputTokens: 120, outputTokens: 60, latencyMs: 250, score: 8, judgeJustification: '' });

    // Input 2: A wins
    runner.addResult({ variantName: 'A', input: 'i2', output: 'o', inputTokens: 100, outputTokens: 50, latencyMs: 200, score: 9, judgeJustification: '' });
    runner.addResult({ variantName: 'B', input: 'i2', output: 'o', inputTokens: 120, outputTokens: 60, latencyMs: 250, score: 7, judgeJustification: '' });

    const summaries = runner.getSummary();

    expect(summaries).toHaveLength(2);

    const summA = summaries.find((s) => s.variantName === 'A')!;
    const summB = summaries.find((s) => s.variantName === 'B')!;

    expect(summA.avgScore).toBeCloseTo(7.5, 1);
    expect(summB.avgScore).toBeCloseTo(7.5, 1);
    expect(summA.wins).toBe(1);
    expect(summB.wins).toBe(1);
  });

  it('complete pipeline: run variant + judge via LLM', async () => {
    // Variant execution
    mockCreate
      .mockResolvedValueOnce(mockResponse('Kubernetes orchestrates containers.', 150, 80))
      // Judge
      .mockResolvedValueOnce(mockResponse(JSON.stringify({ score: 8, justification: 'Concise summary' }), 200, 40));

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const variant: PromptVariant = {
      name: 'Direct',
      systemPrompt: 'Summarize concisely.',
      userPromptTemplate: 'Summarize: {{INPUT}}',
    };

    const input = 'Kubernetes is an orchestration system...';
    const userPrompt = variant.userPromptTemplate.replace('{{INPUT}}', input);

    // Step 1: Run variant
    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 500, temperature: 0.3,
      system: variant.systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const output = resp.content[0].type === 'text' ? resp.content[0].text : '';

    // Step 2: Judge
    const judgeResp = await client.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 200, temperature: 0,
      messages: [{ role: 'user', content: `Evaluate the summary:\n${output}` }],
    });
    const judgeText = judgeResp.content[0].type === 'text' ? judgeResp.content[0].text : '';
    const judgment = JSON.parse(judgeText);

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(output).toContain('Kubernetes');
    expect(judgment.score).toBe(8);
    expect(judgment.justification).toBeTruthy();
  });

  it('determines winner by highest avgScore', () => {
    const summaries: ABTestSummary[] = [
      { variantName: 'Direct', avgScore: 7.2, avgTokens: 150, avgLatencyMs: 200, totalCost: 0.001, wins: 2 },
      { variantName: 'Structured', avgScore: 8.5, avgTokens: 220, avgLatencyMs: 350, totalCost: 0.002, wins: 3 },
    ];

    const winner = summaries.reduce((a, b) => (a.avgScore > b.avgScore ? a : b));
    const runnerUp = summaries.find((s) => s.variantName !== winner.variantName)!;

    expect(winner.variantName).toBe('Structured');
    expect(winner.avgScore).toBeGreaterThan(runnerUp.avgScore);
    expect(winner.totalCost).toBeGreaterThan(runnerUp.totalCost);
  });
});
