/**
 * Exercise 8: Structured JSON Output
 * Difficulty: intermediate | Time: 20 min
 *
 * Extract structured data (JSON) from Claude's responses.
 * Learn to force format, parse, and handle errors.
 * Run: npx tsx exercises/ex8-output-estruturado.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Data: product reviews for analysis ===
const reviews = [
  {
    id: 1,
    text:
      'Fantastic product! The material quality is surprising for the price. Fast delivery and flawless packaging. Highly recommend for anyone looking for cost-effectiveness.',
  },
  {
    id: 2,
    text:
      'Arrived with a screen defect, this is the second one I bought with issues. Support took 3 weeks to respond. Not worth the price charged.',
  },
  {
    id: 3,
    text:
      'Works fine for the basics. Not the best on the market, but also not the worst. The battery could last longer, but the design is nice.',
  },
];

// === Expected JSON output type ===
type ReviewAnalysis = {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0 to 1
  keywords: string[];
  summary: string;
};

// === TODO 1: Create the prompt that forces a JSON response ===
// The prompt should:
// - Instruct Claude to respond ONLY with valid JSON
// - Specify the exact schema: { sentiment, confidence, keywords, summary }
// - Include the review to be analyzed
// Hint: use system prompt to define the format + user prompt with the review.

// function buildAnalysisPrompt(reviewText: string): {
//   system: string;
//   user: string;
// } { ... }

// === TODO 2: Parse the JSON response with error handling ===
// The function should:
// - Try JSON.parse on the text
// - If it fails, try to extract JSON from within ```json ... ``` blocks
// - Return the parsed object or null on error

// function parseJsonResponse(text: string): ReviewAnalysis | null { ... }

// === TODO 3: Create a retry function ===
// If the JSON is invalid:
// - Re-send the prompt with the error message
// - Use the conversation history (messages) to provide context
// - Maximum 2 attempts
// Hint: build a messages array with user -> assistant -> user (correction)

// async function analyzeWithRetry(reviewText: string): Promise<ReviewAnalysis | null> { ... }

// === TODO 4: Process the 3 reviews and display a results table ===
// For each review:
// 1. Call analyzeWithRetry
// 2. Display the formatted result
// At the end, show a summary table:
// | Review | Sentiment | Confidence | Keywords |

// for (const review of reviews) {
//   console.log(`\n=== Review #${review.id} ===`);
//   console.log(`Text: ${review.text.slice(0, 60)}...`);
//   const result = await analyzeWithRetry(review.text);
//   if (result) {
//     console.log(`Sentiment: ${result.sentiment}`);
//     console.log(`Confidence: ${(result.confidence * 100).toFixed(0)}%`);
//     console.log(`Keywords: ${result.keywords.join(', ')}`);
//     console.log(`Summary: ${result.summary}`);
//   }
// }

console.log('\n--- Exercise 8 complete! ---');
console.log('Hint: see the solution in solutions/ex8-output-estruturado.ts');
