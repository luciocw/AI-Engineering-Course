/**
 * Exercise 11: Few-Shot Learning
 *
 * Compare zero-shot vs few-shot for sentiment classification.
 * Reference: exercise 8 (structured output) for response parsing.
 * Run: npx tsx exercises/ex11-few-shot.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Examples for few-shot (training) ===
const examples = [
  { review: 'Excellent product, exceeded expectations!', sentiment: 'positive' },
  { review: 'Didn\'t work, requested a refund.', sentiment: 'negative' },
  { review: 'Does the basics, nothing exceptional.', sentiment: 'neutral' },
  { review: 'Terrible customer service, never buying again.', sentiment: 'negative' },
];

// === Reviews to classify ===
const testReviews = [
  'Fast delivery and quality product!',
  'Arrived with a defect, very disappointed.',
  'Ok, it works but the price is high.',
  'Delivery was late but the product is good.',
  'Best purchase I ever made, highly recommend!',
];

// === TODO 1: Create a zero-shot prompt ===
// Just instruct: "Classify the sentiment as positive, negative, or neutral."
// No examples.

// function buildZeroShotPrompt(review: string): string { ... }

// === TODO 2: Create a few-shot prompt ===
// Include the examples before the review to classify.
// Format:
// Review: "..." -> Sentiment: positive
// Review: "..." -> Sentiment: negative
// ...
// Review: "[test review]" -> Sentiment:

// function buildFewShotPrompt(review: string): string { ... }

// === TODO 3: Classify each review with both approaches ===
// For each test review:
// 1. Call API with zero-shot
// 2. Call API with few-shot
// 3. Store the results

// === TODO 4: Display comparison table ===
// | Review | Zero-Shot | Few-Shot |
// |--------|-----------|---------|
// | ...    | positive  | positive|

console.log('\n--- Exercise 11 complete! ---');
console.log('Hint: see the solution in solutions/ex11-few-shot.ts');
