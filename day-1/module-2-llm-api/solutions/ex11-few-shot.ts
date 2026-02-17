/**
 * Solution 11: Few-Shot Learning
 *
 * Compare zero-shot vs few-shot for sentiment classification.
 * Reference: exercise 8 (structured output) for response parsing.
 * Run: npx tsx solutions/ex11-few-shot.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const examples = [
  { review: 'Excellent product, exceeded expectations!', sentiment: 'positive' },
  { review: 'Did not work, requested a refund.', sentiment: 'negative' },
  { review: 'Does the basics, nothing exceptional.', sentiment: 'neutral' },
  { review: 'Terrible service, will never buy again.', sentiment: 'negative' },
];

const testReviews = [
  'Fast delivery and quality product!',
  'Came with a defect, very disappointed.',
  'Ok, it works but the price is high.',
  'Delivery was late but the product is good.',
  'Best purchase I ever made, highly recommend!',
];

function buildZeroShotPrompt(review: string): string {
  return `Classify the sentiment of the review below as "positive", "negative", or "neutral".
Respond ONLY with the classification, a single word.

Review: "${review}"
Sentiment:`;
}

function buildFewShotPrompt(review: string): string {
  const formattedExamples = examples
    .map((e) => `Review: "${e.review}" -> Sentiment: ${e.sentiment}`)
    .join('\n');

  return `Classify the sentiment of the review as "positive", "negative", or "neutral".
Respond ONLY with the classification, a single word.

${formattedExamples}

Review: "${review}" -> Sentiment:`;
}

async function classify(prompt: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 10,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
  });
  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';
  return text.trim().toLowerCase();
}

type Result = {
  review: string;
  zeroShot: string;
  fewShot: string;
};

const results: Result[] = [];

for (const review of testReviews) {
  const zeroShot = await classify(buildZeroShotPrompt(review));
  const fewShot = await classify(buildFewShotPrompt(review));
  results.push({ review, zeroShot, fewShot });
}

// Comparison table
console.log('=== Comparison: Zero-Shot vs Few-Shot ===\n');
console.log(
  'Review'.padEnd(45) +
    'Zero-Shot'.padEnd(12) +
    'Few-Shot'.padEnd(12) +
    'Match?'
);
console.log('-'.repeat(75));

for (const r of results) {
  const reviewTrunc =
    r.review.length > 42 ? r.review.slice(0, 42) + '...' : r.review;
  const match = r.zeroShot === r.fewShot ? 'Yes' : 'NO';
  console.log(
    reviewTrunc.padEnd(45) +
      r.zeroShot.padEnd(12) +
      r.fewShot.padEnd(12) +
      match
  );
}

console.log('\n--- Exercise 11 complete! ---');
