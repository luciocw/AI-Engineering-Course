/**
 * Exercise 10: Prompt Registry
 * Difficulty: intermediate | Time: 20 min
 *
 * Build a PromptRegistry that manages prompt templates.
 * Bridge with M1 ex17 (TemplateRegistry) — now templates become executable prompts.
 * Run: npx tsx exercises/ex10-prompt-registry.ts
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

// === TODO 1: Create the PromptRegistry class ===
// Methods:
//   register(config: PromptConfig): void
//     - Compile the Handlebars templates
//     - Store with key "name@version" (e.g., "classifier@v1")
//   get(name: string, version?: string): PromptConfig | undefined
//     - If version not provided, return the latest registered for the name
//   list(): string[]
//     - Return all registered keys
//   execute(name: string, data: Record<string, unknown>, version?: string): Promise<string>
//     - Render the templates with the data
//     - Call the Claude API with the rendered templates
//     - Return the response text

// class PromptRegistry {
//   private prompts = new Map<string, { config: PromptConfig; compiledSystem: ...; compiledUser: ... }>();
//   private latestVersions = new Map<string, string>();
//   ...
// }

// === TODO 2: Instantiate the registry and register 3 prompts ===
// Prompt 1 — classifier: classifies text into categories
// Prompt 2 — summarizer: summarizes text with controllable length
// Prompt 3 — translator: translates text to a target language

// const registry = new PromptRegistry();
// registry.register({ name: 'classifier', version: 'v1', ... });
// registry.register({ name: 'summarizer', version: 'v1', ... });
// registry.register({ name: 'translator', version: 'v1', ... });

// === TODO 3: Templates with Handlebars ===
// Each prompt should use Handlebars variables:
// - classifier: {{categories}}, {{text}}
// - summarizer: {{maxWords}}, {{text}}
// - translator: {{targetLanguage}}, {{text}}
// Hint: use {{#each}} to list categories.

// === TODO 4: Execute each prompt with test data ===
// Test text: "Artificial intelligence is transforming the financial market..."
// - classifier: categories [technology, finance, health, education]
// - summarizer: maxWords 20
// - translator: targetLanguage "English"

// const testText = '...';
// const classifierResult = await registry.execute('classifier', { ... });
// const summarizerResult = await registry.execute('summarizer', { ... });
// const translatorResult = await registry.execute('translator', { ... });

// === TODO 5: Add versioning ===
// Register a v2 of the classifier with an improved (more detailed) prompt.
// Execute v1 and v2 with the same input and compare.

// registry.register({ name: 'classifier', version: 'v2', ... });
// const resultV1 = await registry.execute('classifier', data, 'v1');
// const resultV2 = await registry.execute('classifier', data, 'v2');

console.log('\n--- Exercise 10 complete! ---');
console.log('Hint: see the solution in solutions/ex10-prompt-registry.ts');
