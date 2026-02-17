/**
 * Solution 19: Prompt Versioning
 *
 * Manage and compare prompt versions over time.
 * Run: npx tsx solutions/ex19-prompt-versioning.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Types ===

type PromptVersion = {
  version: string;
  template: string;
  changelog: string;
  createdAt: Date;
};

type TestResult = {
  version: string;
  input: string;
  output: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
};

type VersionComparison = {
  version: string;
  avgTokens: number;
  avgLatencyMs: number;
  results: string[];
};

// === PromptVersionManager Class ===

class PromptVersionManager {
  private versions: PromptVersion[] = [];

  addVersion(version: string, template: string, changelog: string): void {
    this.versions.push({
      version,
      template,
      changelog,
      createdAt: new Date(),
    });
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

// === 3 progressive versions of a classification prompt ===

const manager = new PromptVersionManager();

// v1.0 — Basic
manager.addVersion(
  'v1.0',
  `Classify the following support ticket into one of the categories: bug, feature, question, urgent.
Respond only with the category.

Ticket: {{INPUT}}`,
  'Initial version — basic classification without examples'
);

// v1.1 — With few-shot examples
manager.addVersion(
  'v1.1',
  `Classify the following support ticket into one of the categories: bug, feature, question, urgent.

Examples:
- "The app closes by itself when opening settings" -> bug
- "I would like to be able to export in CSV" -> feature
- "Where do I find the billing page?" -> question
- "SYSTEM DOWN, customers without access!" -> urgent

Respond only with the category.

Ticket: {{INPUT}}`,
  'Added few-shot examples for each category'
);

// v2.0 — Structured with JSON
manager.addVersion(
  'v2.0',
  `Classify the following support ticket. Carefully analyze the context and urgency.

Available categories:
- bug: defects, errors, unexpected system behavior
- feature: requests for new features or improvements
- question: questions about usage, documentation, how to do something
- urgent: critical issues affecting production or many users

Examples:
- "The app closes by itself when opening settings" -> bug
- "I would like to be able to export in CSV" -> feature
- "Where do I find the billing page?" -> question
- "SYSTEM DOWN, customers without access!" -> urgent

Return ONLY valid JSON:
{
  "category": "bug|feature|question|urgent",
  "confidence": 0.0 to 1.0,
  "justification": "brief explanation"
}

Ticket: {{INPUT}}`,
  'Structured JSON output with confidence and justification'
);

// === Test inputs ===
const testTickets = [
  'The system froze when I tried to export the report as PDF.',
  'It would be great to have Slack integration for notifications.',
  'How do I change the interface language?',
  'URGENT: All production data was deleted!',
  'The save button does not respond in Firefox.',
];

// Test a version against all inputs
async function testVersion(version: PromptVersion, inputs: string[]): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const input of inputs) {
    const prompt = version.template.replace('{{INPUT}}', input);
    const start = Date.now();

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
    });

    const latencyMs = Date.now() - start;
    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    results.push({
      version: version.version,
      input,
      output: text.trim(),
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      latencyMs,
    });
  }

  return results;
}

// Execute comparison
async function executeComparison() {
  console.log('=== Prompt Versioning: Ticket Classification ===\n');

  // List versions
  console.log('--- Registered Versions ---');
  for (const v of manager.listVersions()) {
    console.log(`  ${v.version}: ${v.changelog}`);
  }

  // Test all versions
  const allResults: TestResult[] = [];
  const comparisons: VersionComparison[] = [];

  for (const version of manager.listVersions()) {
    console.log(`\n--- Testing ${version.version}... ---`);
    const results = await testVersion(version, testTickets);
    allResults.push(...results);

    const totalTokens = results.reduce((s, r) => s + r.inputTokens + r.outputTokens, 0);
    const totalLatency = results.reduce((s, r) => s + r.latencyMs, 0);

    comparisons.push({
      version: version.version,
      avgTokens: Math.round(totalTokens / results.length),
      avgLatencyMs: Math.round(totalLatency / results.length),
      results: results.map((r) => r.output),
    });
  }

  // Summary table by version
  console.log('\n=== Summary by Version ===');
  console.log(
    'Version'.padEnd(10) +
      'Avg Tokens'.padEnd(14) +
      'Avg Latency'.padEnd(16) +
      'Changelog'
  );
  console.log('-'.repeat(75));

  for (const comp of comparisons) {
    const version = manager.getVersion(comp.version)!;
    console.log(
      comp.version.padEnd(10) +
        String(comp.avgTokens).padEnd(14) +
        `${comp.avgLatencyMs}ms`.padEnd(16) +
        version.changelog
    );
  }

  // Responses side by side
  console.log('\n=== Responses by Input ===');

  for (let i = 0; i < testTickets.length; i++) {
    const ticketShort = testTickets[i].length > 55
      ? testTickets[i].slice(0, 55) + '...'
      : testTickets[i];
    console.log(`\nTicket: "${ticketShort}"`);

    for (const comp of comparisons) {
      const output = comp.results[i];
      const outputShort = output.length > 60 ? output.slice(0, 60) + '...' : output;
      console.log(`  ${comp.version}: ${outputShort}`);
    }
  }

  // Recommendation
  console.log('\n=== Recommendation ===');
  const latest = manager.getLatest()!;
  console.log(`Most recent version: ${latest.version}`);
  console.log(`Version ${latest.version} offers structured JSON output that facilitates`);
  console.log(`programmatic integration, but consumes more tokens.`);
  console.log(`Consider v1.1 for simple classification and v2.0 for automated pipelines.`);
}

executeComparison().then(() => {
  console.log('\n--- Exercise 19 complete! ---');
});
