/**
 * Solution 10: Prompt Registry
 * Difficulty: intermediate | Time: 20 min
 *
 * PromptRegistry: manages prompt templates with versioning.
 * Bridge with M1 ex17 (TemplateRegistry) — now templates become executable prompts.
 * Run: npx tsx solutions/ex10-prompt-registry.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import Handlebars from 'handlebars';

const client = new Anthropic();

// === Types ===
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

// Solution TODO 1: PromptRegistry class
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

  async execute(
    name: string,
    data: Record<string, unknown>,
    version?: string
  ): Promise<string> {
    const v = version ?? this.latestVersions.get(name);
    if (!v) throw new Error(`Prompt "${name}" not found.`);

    const key = this.makeKey(name, v);
    const entry = this.prompts.get(key);
    if (!entry) throw new Error(`Prompt "${key}" not found.`);

    const systemMsg = entry.compiledSystem(data);
    const userMsg = entry.compiledUser(data);

    const response = await client.messages.create({
      model: entry.config.model,
      max_tokens: entry.config.maxTokens,
      system: systemMsg,
      messages: [{ role: 'user', content: userMsg }],
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }
}

// Solution TODO 2 + 3: Instantiate and register prompts with Handlebars templates
const registry = new PromptRegistry();

registry.register({
  name: 'classifier',
  version: 'v1',
  description: 'Classifies text into predefined categories',
  model: 'claude-haiku-4-5-20251001',
  maxTokens: 50,
  systemTemplate:
    'You are a text classifier. Respond ONLY with the category name.',
  userTemplate: `Classify the text below into one of these categories:
{{#each categorias}}
- {{this}}
{{/each}}

Text: "{{texto}}"

Category:`,
});

registry.register({
  name: 'summarizer',
  version: 'v1',
  description: 'Summarizes text with controllable length',
  model: 'claude-haiku-4-5-20251001',
  maxTokens: 150,
  systemTemplate:
    'You are an assistant that creates concise summaries. Maximum {{maxPalavras}} words. Respond only with the summary.',
  userTemplate: 'Summarize the following text:\n\n"{{texto}}"',
});

registry.register({
  name: 'translator',
  version: 'v1',
  description: 'Translates text to the target language',
  model: 'claude-haiku-4-5-20251001',
  maxTokens: 300,
  systemTemplate:
    'You are a professional translator. Translate to {{idiomaAlvo}}. Respond only with the translation, no explanations.',
  userTemplate: 'Translate the following text:\n\n"{{texto}}"',
});

// Display registered prompts
console.log('=== Registered Prompts ===');
console.log(registry.list().join(', '));

// Solution TODO 4: Execute each prompt
const testText =
  'Artificial intelligence is transforming the financial market with automated trading algorithms, real-time risk analysis, and fraud detection.';

console.log(`\nTest text: "${testText.slice(0, 60)}..."`);

console.log('\n--- Classifier ---');
const classifierResult = await registry.execute('classifier', {
  categorias: ['technology', 'finance', 'health', 'education'],
  texto: testText,
});
console.log(`Category: ${classifierResult}`);

console.log('\n--- Summarizer ---');
const summarizerResult = await registry.execute('summarizer', {
  maxPalavras: 20,
  texto: testText,
});
console.log(`Summary: ${summarizerResult}`);

console.log('\n--- Translator ---');
const translatorResult = await registry.execute('translator', {
  idiomaAlvo: 'French',
  texto: testText,
});
console.log(`Translation: ${translatorResult}`);

// Solution TODO 5: Versioning — v2 of classifier with improved prompt
registry.register({
  name: 'classifier',
  version: 'v2',
  description: 'Classifier v2 — with justification and confidence',
  model: 'claude-haiku-4-5-20251001',
  maxTokens: 150,
  systemTemplate:
    'You are a specialist text classifier. Respond in JSON: { "category": "...", "confidence": 0.0-1.0, "justification": "..." }',
  userTemplate: `Classify the text below into one of these categories:
{{#each categorias}}
- {{this}}
{{/each}}

Text: "{{texto}}"`,
});

console.log('\n=== Comparison v1 vs v2 (classifier) ===');

const classificationData = {
  categorias: ['technology', 'finance', 'health', 'education'],
  texto: testText,
};

const resultV1 = await registry.execute(
  'classifier',
  classificationData,
  'v1'
);
const resultV2 = await registry.execute(
  'classifier',
  classificationData,
  'v2'
);

console.log(`v1 (simple): ${resultV1}`);
console.log(`v2 (detailed): ${resultV2}`);

console.log('\nRegistered prompts now:', registry.list().join(', '));

console.log('\n--- Exercise 10 complete! ---');
