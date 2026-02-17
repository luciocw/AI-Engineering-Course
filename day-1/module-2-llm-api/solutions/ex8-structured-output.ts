/**
 * Solution 8: Structured JSON Output
 * Difficulty: intermediate | Time: 20 min
 *
 * Extract structured data (JSON) from Claude's responses.
 * Run: npx tsx solutions/ex8-output-estruturado.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Data: product reviews for analysis ===
const reviews = [
  {
    id: 1,
    text:
      'Fantastic product! The material quality is surprising for the price. Fast delivery and impeccable packaging. Highly recommend for anyone looking for value for money.',
  },
  {
    id: 2,
    text:
      'Came with a defective screen, this is the second one I bought with issues. Support took 3 weeks to respond. Not worth the price charged.',
  },
  {
    id: 3,
    text:
      'Works well for basic use. Not the best on the market, but not the worst either. Battery could last longer, but the design is nice.',
  },
];

// === Expected JSON output type ===
type ReviewAnalysis = {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string[];
  summary: string;
};

// Solution TODO 1: Prompt that forces JSON
function buildAnalysisPrompt(reviewText: string): {
  system: string;
  user: string;
} {
  const system = `You are a sentiment analyst. Respond ONLY with valid JSON, no additional text, no markdown.
The JSON must follow exactly this schema:
{
  "sentiment": "positive" | "negative" | "neutral",
  "confidence": <number from 0 to 1>,
  "keywords": [<list of 3-5 relevant keywords>],
  "summary": "<1-sentence summary of the review>"
}`;

  const user = `Analyze the following product review:\n\n"${reviewText}"`;

  return { system, user };
}

// Solution TODO 2: Robust JSON parsing
function parseJsonResponse(text: string): ReviewAnalysis | null {
  // Attempt 1: direct parse
  try {
    return JSON.parse(text) as ReviewAnalysis;
  } catch {
    // continue
  }

  // Attempt 2: extract from ```json ... ``` block
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    try {
      return JSON.parse(jsonBlockMatch[1].trim()) as ReviewAnalysis;
    } catch {
      // continue
    }
  }

  // Attempt 3: find first { ... } in text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]) as ReviewAnalysis;
    } catch {
      // failed
    }
  }

  return null;
}

// Solution TODO 3: Retry function with error context
async function analyzeWithRetry(
  reviewText: string,
  maxRetries = 2
): Promise<ReviewAnalysis | null> {
  const { system, user } = buildAnalysisPrompt(reviewText);

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: user }];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      temperature: 0,
      system,
      messages,
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';

    const parsed = parseJsonResponse(text);

    if (parsed) {
      if (attempt > 0) {
        console.log(`  (success on attempt ${attempt + 1})`);
      }
      return parsed;
    }

    // If failed and still has retries, add error context
    if (attempt < maxRetries) {
      console.log(
        `  Attempt ${attempt + 1} failed to parse. Resending with correction...`
      );
      messages.push({ role: 'assistant', content: text });
      messages.push({
        role: 'user',
        content: `The returned JSON is invalid. Error: could not parse as JSON. Please return ONLY valid JSON, with no text before or after. No markdown code blocks.`,
      });
    }
  }

  console.log('  ERROR: could not obtain valid JSON after retries.');
  return null;
}

// Solution TODO 4: Process reviews and display results
const results: { id: number; analysis: ReviewAnalysis | null }[] = [];

for (const review of reviews) {
  console.log(`\n=== Review #${review.id} ===`);
  console.log(`Text: ${review.text.slice(0, 60)}...`);

  const analysis = await analyzeWithRetry(review.text);
  results.push({ id: review.id, analysis });

  if (analysis) {
    console.log(`  Sentiment: ${analysis.sentiment}`);
    console.log(`  Confidence: ${(analysis.confidence * 100).toFixed(0)}%`);
    console.log(`  Keywords: ${analysis.keywords.join(', ')}`);
    console.log(`  Summary: ${analysis.summary}`);
  }
}

// Summary table
console.log('\n=== Summary Table ===\n');
console.log(
  'Review'.padEnd(8) +
    'Sentiment'.padEnd(12) +
    'Confidence'.padEnd(12) +
    'Keywords'
);
console.log('-'.repeat(70));

for (const r of results) {
  if (r.analysis) {
    console.log(
      `#${r.id}`.padEnd(8) +
        r.analysis.sentiment.padEnd(12) +
        `${(r.analysis.confidence * 100).toFixed(0)}%`.padEnd(12) +
        r.analysis.keywords.slice(0, 3).join(', ')
    );
  } else {
    console.log(`#${r.id}`.padEnd(8) + 'ERROR'.padEnd(12) + '-'.padEnd(12) + '-');
  }
}

console.log('\n--- Exercise 8 complete! ---');
