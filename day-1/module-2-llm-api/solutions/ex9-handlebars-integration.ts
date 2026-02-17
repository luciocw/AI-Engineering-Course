/**
 * Solution 9: Handlebars + Claude API Integration
 *
 * Dynamic templates with Handlebars feeding the Claude API.
 * Reference: exercises 1-4 (basic API) + M1 (Handlebars).
 * Run: npx tsx solutions/ex9-handlebars-integration.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import Handlebars from 'handlebars';

const client = new Anthropic();

const products = [
  {
    name: 'AI Analytics Pro',
    features: [
      'Real-time dashboard',
      'Smart alerts',
      'Slack integration',
    ],
    targetAudience: 'product managers at startups',
    tone: 'professional and enthusiastic',
    length: 50,
  },
  {
    name: 'SmartSit Ergonomic Chair',
    features: [
      'Automatic lumbar adjustment',
      'Posture sensors',
      'Companion app',
    ],
    targetAudience: 'developers who work 8+ hours sitting',
    tone: 'casual and fun',
    length: 60,
  },
];

const systemTemplate =
  'You are a copywriter specialized in e-commerce. Write in a {{tone}} tone. Maximum {{length}} words. Respond only with the description, no introductions.';

const userTemplate = `Create a description for the product "{{name}}" with the following features:
{{#each features}}
- {{this}}
{{/each}}

Target audience: {{targetAudience}}`;

async function generateWithTemplate(
  systemTmpl: string,
  userTmpl: string,
  data: Record<string, unknown>
): Promise<string> {
  const compiledSystem = Handlebars.compile(systemTmpl);
  const compiledUser = Handlebars.compile(userTmpl);

  const systemMsg = compiledSystem(data);
  const userMsg = compiledUser(data);

  console.log(`  [System] ${systemMsg.slice(0, 80)}...`);
  console.log(`  [User]   ${userMsg.slice(0, 80)}...`);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: systemMsg,
    messages: [{ role: 'user', content: userMsg }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

for (const product of products) {
  console.log(`\n=== ${product.name} ===`);
  const result = await generateWithTemplate(
    systemTemplate,
    userTemplate,
    product
  );
  console.log(`\n  Generated description:\n  ${result}\n`);
}

console.log('\n--- Exercise 9 complete! ---');
