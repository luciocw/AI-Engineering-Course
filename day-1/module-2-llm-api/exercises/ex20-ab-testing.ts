/**
 * Exercise 20: A/B Testing for Prompts (Capstone)
 *
 * Build a complete A/B testing framework to optimize prompts.
 * This is the capstone exercise — you'll combine everything: chaining (ex15),
 * routing (ex16), cost tracking (ex17), LLM-as-judge evaluation (ex18),
 * and versioning (ex19) into an integrated experimentation system.
 *
 * Difficulty: advanced | Estimated time: 30 min
 * Run: npx tsx exercises/ex20-ab-testing.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Types ===

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

type ABTest = {
  name: string;
  variants: PromptVariant[];
  results: VariantResult[];
};

type ABTestSummary = {
  variantName: string;
  avgScore: number;
  avgTokens: number;
  avgLatencyMs: number;
  totalCost: number;
  wins: number;
};

// === Task: Summarize technical texts ===
// Two different strategies for the same task.

// === TODO 1: Create the ABTest class ===
// The class should store:
// - name: experiment name
// - variants: array of PromptVariant
// - results: array of VariantResult
//
// Methods:
// - addVariant(variant: PromptVariant): void
// - addResult(result: VariantResult): void
// - getSummary(): ABTestSummary[]

// class ABTestRunner {
//   private test: ABTest;
//
//   constructor(name: string) { ... }
//   addVariant(variant: PromptVariant): void { ... }
//   ...
// }

// === TODO 2: Create the runner that executes all variants ===
// For each test input:
// 1. Execute all variants
// 2. Measure latency (Date.now before/after)
// 3. Store tokens and response
//
// async function runVariant(variant: PromptVariant, input: string): Promise<{ output: string; inputTokens: number; outputTokens: number; latencyMs: number }> { ... }

// === TODO 3: Create 2 prompt variants for text summarization ===
// Variant A — "Direct": concise system prompt, requests summary in 2-3 sentences
// Variant B — "Structured": detailed system prompt with CoT,
//   requests summary with: main topic, key points, conclusion

// const variantA: PromptVariant = { ... };
// const variantB: PromptVariant = { ... };

// === Test inputs ===
const testInputs = [
  `Kubernetes is an open-source container orchestration system that automates
the deployment, scaling, and management of containerized applications. Created by
Google, it is now maintained by the CNCF. It uses concepts like pods, services, and
deployments to abstract the underlying infrastructure.`,

  `The CQRS (Command Query Responsibility Segregation) pattern separates read
and write operations into distinct models. This allows optimizing each side
independently: queries can use denormalized views for performance,
while commands go through rigorous validation and event sourcing.`,

  `WebAssembly (Wasm) is a binary instruction format for a stack-based virtual machine.
It allows running C, Rust, and Go code in the browser with near-native
performance. Use cases include games, image editors,
and compilation tools running entirely on the client.`,

  `Observability in distributed systems involves three pillars: logs (event
records), metrics (numerical data over time), and traces (request tracking
across services). Tools like OpenTelemetry unify the collection
of these signals to facilitate debugging in complex architectures.`,

  `Transfer Learning is an ML technique where a model pre-trained on a
broad task (such as image classification on ImageNet) is reused as a
starting point for a specific task. This drastically reduces training
time and the amount of data needed.`,
];

// === TODO 4: Use LLM-as-Judge to score each response ===
// The judge (Sonnet) should evaluate from 0-10:
// - overall quality of the summary
// Return JSON: { "score": N, "justification": "..." }
//
// IMPORTANT: The judge should not know which variant generated the response.

// async function judgeResponse(originalInput: string, summary: string): Promise<{ score: number; justification: string }> { ... }

// === TODO 5: Generate statistical report ===
// Format:
// Variant      | Avg Score | Avg Tokens | Avg Latency | Total Cost | Wins
// Direct       | 7.2       | 120        | 350ms       | $0.000XXX  | 2
// Structured   | 8.5       | 185        | 420ms       | $0.000XXX  | 3
//
// "Wins" = in how many inputs this variant had a higher score.
// Declare the winner at the end.

// async function executeABTest() { ... }
// executeABTest();

console.log('\n--- Exercise 20 complete! ---');
console.log('Hint: see the solution in solutions/ex20-ab-testing.ts');
