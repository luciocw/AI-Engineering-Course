/**
 * Exercise 19: Prompt Versioning
 *
 * Manage and compare prompt versions over time.
 * You already know quality evaluation (ex18) and cost tracking (ex17) —
 * now you'll create a system to version, test, and compare prompts.
 *
 * Difficulty: advanced | Estimated time: 25 min
 * Run: npx tsx exercises/ex19-prompt-versioning.ts
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

// === TODO 1: Create the PromptVersion type and PromptVersionManager class ===
// The class should store an array of PromptVersion.
// Methods:
// - addVersion(version, template, changelog): adds a new version
// - getVersion(version): returns a specific version
// - getLatest(): returns the most recent version
// - listVersions(): returns all versions with changelog
// - compareVersions(v1, v2, inputs): tests both versions against the same inputs

// class PromptVersionManager {
//   private versions: PromptVersion[] = [];
//
//   addVersion(version: string, template: string, changelog: string): void { ... }
//   getVersion(version: string): PromptVersion | undefined { ... }
//   getLatest(): PromptVersion | undefined { ... }
//   listVersions(): PromptVersion[] { ... }
// }

// === TODO 2: Create 3 versions of a classification prompt ===
// Task: classify support tickets into categories (bug, feature, question, urgent)
//
// v1.0 — Basic: "Classify the ticket into the correct category."
// v1.1 — With examples: adds few-shot examples
// v2.0 — Structured: requests JSON with category, confidence, and justification
//
// Each version should be progressively better.

// === TODO 3: Create test inputs ===
// 5 support tickets to test all versions:
// const testTickets = [
//   'The system crashed when I tried to export the report as PDF.',
//   'It would be great to have Slack integration for notifications.',
//   'How do I change the interface language?',
//   'URGENT: All production data has been deleted!',
//   'The save button doesn\'t respond in Firefox.',
// ];

// === TODO 4: Test all versions against the same inputs ===
// For each version and each input:
// 1. Replace the placeholder in the template with the input
// 2. Call the API and measure latency (Date.now before and after)
// 3. Store TestResult

// async function testVersion(version: PromptVersion, inputs: string[]): Promise<TestResult[]> { ... }

// === TODO 5: Generate version comparison report ===
// Format:
// Version | Avg Tokens | Avg Latency | Changelog
// v1.0    | 45         | 320ms       | Initial version
// v1.1    | 52         | 350ms       | Added examples
// v2.0    | 78         | 410ms       | Structured JSON output
//
// Also show the responses side by side for each input.

// async function executeComparison() { ... }
// executeComparison();

console.log('\n--- Exercise 19 complete! ---');
console.log('Hint: see the solution in solutions/ex19-prompt-versioning.ts');
