/**
 * Exercise 18: Quality Evaluation (LLM-as-Judge)
 *
 * Use Claude as a judge to evaluate the quality of its own responses.
 * You already know multiple calls (ex15) and routing (ex16) —
 * now you'll implement the LLM-as-Judge pattern to compare models.
 *
 * Difficulty: advanced | Estimated time: 25 min
 * Run: npx tsx exercises/ex18-avaliacao-qualidade.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Types ===

type Evaluation = {
  clarity: number;       // 0-10
  completeness: number;  // 0-10
  accuracy: number;      // 0-10
  justification: string;
};

type ModelResponse = {
  model: string;
  prompt: string;
  response: string;
  inputTokens: number;
  outputTokens: number;
};

type EvaluationResult = {
  prompt: string;
  model: string;
  response: string;
  evaluation: Evaluation;
  average: number;
};

// === Test prompts ===
const testPrompts = [
  'Explain the concept of recursion in programming for a beginner.',
  'What are the advantages and disadvantages of microservices vs monolith?',
  'How does the garbage collector work in languages like Java and Go?',
];

// === Models to compare ===
const models: Array<{ id: string; name: string }> = [
  { id: 'claude-haiku-4-5-20251001', name: 'Haiku 4.5' },
  { id: 'claude-sonnet-4-20250514', name: 'Sonnet 4' },
];

// === TODO 1: Generate responses from both models ===
// For each test prompt, call both models.
// Store the response, model, and tokens used.
// Use max_tokens: 500 and temperature: 0.3.

// async function generateResponses(): Promise<ModelResponse[]> {
//   const responses: ModelResponse[] = [];
//   for (const prompt of testPrompts) {
//     for (const model of models) {
//       // Call client.messages.create({ model: model.id, ... })
//       // Store in responses
//     }
//   }
//   return responses;
// }

// === TODO 2: Create the judge prompt ===
// The judge should evaluate each response on 3 criteria (0-10):
// - clarity: how clear and accessible the explanation is
// - completeness: how complete and comprehensive the response is
// - accuracy: how precise and technically correct the response is
//
// Return JSON: { "clarity": N, "completeness": N, "accuracy": N, "justification": "..." }
// IMPORTANT: The judge should NOT know which model generated the response.

// function buildJudgePrompt(prompt: string, response: string): string { ... }

// === TODO 3: Use Sonnet as judge to evaluate all responses ===
// For each generated response, call the judge (Sonnet) to evaluate.
// Parse the evaluation JSON.
// Calculate the average of the 3 criteria.

// async function evaluateResponse(prompt: string, response: string): Promise<Evaluation> { ... }

// === TODO 4: Generate comparison table ===
// Format:
// Prompt (summary) | Model     | Clarity | Completeness | Accuracy | Average
// Recursion        | Haiku 4.5 | 8       | 7            | 9        | 8.0
// Recursion        | Sonnet 4  | 9       | 9            | 10       | 9.3
// ...
// At the end, show the overall average per model.

// async function executeEvaluation() { ... }
// executeEvaluation();

console.log('\n--- Exercise 18 complete! ---');
console.log('Hint: see the solution in solutions/ex18-avaliacao-qualidade.ts');
