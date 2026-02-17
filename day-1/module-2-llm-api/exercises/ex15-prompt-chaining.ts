/**
 * Exercise 15: Prompt Chaining
 *
 * Chain multiple calls to Claude where the output of each step
 * feeds the input of the next. You already know CoT (ex7) and few-shot (ex6) —
 * now you'll orchestrate sequential calls to transform raw data
 * into refined final content.
 *
 * Difficulty: advanced | Estimated time: 25 min
 * Run: npx tsx exercises/ex15-prompt-chaining.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Types ===

type ExtractedFacts = {
  name: string;
  sector: string;
  founded: string;
  products: string[];
  metrics: string[];
  differentiators: string[];
};

type CompanySummary = {
  title: string;
  summary: string;
  keyPoints: string[];
};

type SocialPost = {
  platform: 'Twitter' | 'LinkedIn' | 'Instagram';
  content: string;
  hashtags: string[];
};

type ChainStep = {
  name: string;
  inputTokens: number;
  outputTokens: number;
  result: string;
};

// === Raw text about the company ===
const companyText = `
NovaTech Solutions was founded in 2019 in Sao Paulo by two former Google
engineers. The company develops AI-powered automation platforms for the
financial sector. Its main product, FinBot Pro, processes over 2 million
transactions per day and already serves 45 banks in Latin America. In 2024,
the company raised a Series B of R$120 million led by SoftBank. NovaTech
differentiates itself by using proprietary language models trained
specifically for banking compliance. The team grew from 15 to 280
employees in 3 years. The product also includes RiskGuard, a real-time
fraud detection tool with 99.7% accuracy. The company plans to expand
to Europe in 2025.
`;

// === TODO 1: Step 1 — Extract structured facts ===
// Call Claude to extract facts from the raw text.
// The prompt should request a JSON in the ExtractedFacts format.
// Use temperature: 0 for consistency.
// Store inputTokens and outputTokens from this step.

// async function step1ExtractFacts(text: string): Promise<{ facts: ExtractedFacts; step: ChainStep }> {
//   ...
// }

// === TODO 2: Step 2 — Generate executive summary ===
// Use the facts extracted in Step 1 as input.
// Ask Claude to generate a 3-4 sentence executive summary.
// The prompt should receive the facts as JSON and return CompanySummary as JSON.

// async function step2GenerateSummary(facts: ExtractedFacts): Promise<{ summary: CompanySummary; step: ChainStep }> {
//   ...
// }

// === TODO 3: Step 3 — Create social media posts ===
// Use the summary from Step 2 as input.
// Request 3 posts: Twitter (max 280 chars), LinkedIn (professional), Instagram (casual).
// Return an array of SocialPost.

// async function step3CreatePosts(summary: CompanySummary): Promise<{ posts: SocialPost[]; step: ChainStep }> {
//   ...
// }

// === TODO 4: Execute complete chain and track costs ===
// 1. Execute the 3 steps in sequence
// 2. Accumulate total tokens (input + output) from all steps
// 3. Calculate total cost (Haiku: $0.25/M input, $1.25/M output)
// 4. Display:
//    - Result from each step
//    - Token table per step
//    - Total accumulated cost

// async function executeChain() {
//   console.log('=== Prompt Chaining: Text -> Facts -> Summary -> Posts ===\n');
//   ...
// }

// executeChain();

console.log('\n--- Exercise 15 complete! ---');
console.log('Hint: see the solution in solutions/ex15-prompt-chaining.ts');
