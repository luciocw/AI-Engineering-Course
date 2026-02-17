/**
 * Solution 15: Prompt Chaining
 *
 * Chain multiple calls to Claude where the output of each step
 * feeds the input of the next.
 * Run: npx tsx solutions/ex15-prompt-chaining.ts
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
NovaTech Solutions was founded in 2019 in Sao Paulo by two former Google engineers.
The company develops AI-powered automation platforms for the financial sector.
Its main product, FinBot Pro, processes over 2 million transactions per day and
already serves 45 banks in Latin America. In 2024, the company raised a Series B
of $25 million led by SoftBank. NovaTech differentiates itself by using proprietary
language models trained specifically for banking compliance. The team grew from 15
to 280 employees in 3 years. The product also includes RiskGuard, a real-time
fraud detection tool with 99.7% accuracy. The company plans expansion to Europe
in 2025.
`;

// Step 1 — Extract structured facts
async function step1ExtractFacts(text: string): Promise<{ facts: ExtractedFacts; step: ChainStep }> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: `Extract the main facts from the text below and return ONLY valid JSON in the format:
{
  "name": "company name",
  "sector": "industry sector",
  "founded": "year and location",
  "products": ["product1", "product2"],
  "metrics": ["metric1", "metric2"],
  "differentiators": ["differentiator1", "differentiator2"]
}

Text:
${text}`,
      },
    ],
  });

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
  const facts: ExtractedFacts = JSON.parse(responseText);

  return {
    facts,
    step: {
      name: 'Step 1: Extract Facts',
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      result: responseText,
    },
  };
}

// Step 2 — Generate executive summary
async function step2GenerateSummary(facts: ExtractedFacts): Promise<{ summary: CompanySummary; step: ChainStep }> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: `Based on the extracted facts below, generate an executive summary.
Return ONLY valid JSON in the format:
{
  "title": "catchy title for the summary",
  "summary": "executive summary of 3-4 sentences",
  "keyPoints": ["point1", "point2", "point3"]
}

Facts:
${JSON.stringify(facts, null, 2)}`,
      },
    ],
  });

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
  const summary: CompanySummary = JSON.parse(responseText);

  return {
    summary,
    step: {
      name: 'Step 2: Generate Summary',
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      result: responseText,
    },
  };
}

// Step 3 — Create social media posts
async function step3CreatePosts(summary: CompanySummary): Promise<{ posts: SocialPost[]; step: ChainStep }> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    temperature: 0.7,
    messages: [
      {
        role: 'user',
        content: `Based on the summary below, create 3 social media posts.
Return ONLY valid JSON — an array with 3 objects in the format:
[
  {
    "platform": "Twitter",
    "content": "post text (max 280 characters for Twitter)",
    "hashtags": ["hash1", "hash2"]
  },
  {
    "platform": "LinkedIn",
    "content": "professional and detailed text",
    "hashtags": ["hash1", "hash2"]
  },
  {
    "platform": "Instagram",
    "content": "casual and engaging text with emojis",
    "hashtags": ["hash1", "hash2"]
  }
]

Summary:
Title: ${summary.title}
${summary.summary}
Key points: ${summary.keyPoints.join(', ')}`,
      },
    ],
  });

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
  const posts: SocialPost[] = JSON.parse(responseText);

  return {
    posts,
    step: {
      name: 'Step 3: Create Posts',
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      result: responseText,
    },
  };
}

// Execute full chain
async function executeChain() {
  console.log('=== Prompt Chaining: Text -> Facts -> Summary -> Posts ===\n');

  const steps: ChainStep[] = [];

  // Step 1
  console.log('--- Step 1: Extracting facts... ---');
  const { facts, step: step1 } = await step1ExtractFacts(companyText);
  steps.push(step1);
  console.log('Extracted facts:');
  console.log(JSON.stringify(facts, null, 2));

  // Step 2
  console.log('\n--- Step 2: Generating summary... ---');
  const { summary, step: step2 } = await step2GenerateSummary(facts);
  steps.push(step2);
  console.log(`Title: ${summary.title}`);
  console.log(`Summary: ${summary.summary}`);
  console.log(`Key points: ${summary.keyPoints.join(' | ')}`);

  // Step 3
  console.log('\n--- Step 3: Creating posts... ---');
  const { posts, step: step3 } = await step3CreatePosts(summary);
  steps.push(step3);

  for (const post of posts) {
    console.log(`\n[${post.platform}]`);
    console.log(post.content);
    console.log(`Hashtags: ${post.hashtags.map((h) => `#${h}`).join(' ')}`);
  }

  // Token tracking table by step
  console.log('\n=== Token Tracking ===');
  console.log(
    'Step'.padEnd(28) +
      'Input'.padEnd(10) +
      'Output'.padEnd(10) +
      'Total'
  );
  console.log('-'.repeat(55));

  let totalInput = 0;
  let totalOutput = 0;

  for (const step of steps) {
    const total = step.inputTokens + step.outputTokens;
    totalInput += step.inputTokens;
    totalOutput += step.outputTokens;
    console.log(
      step.name.padEnd(28) +
        String(step.inputTokens).padEnd(10) +
        String(step.outputTokens).padEnd(10) +
        String(total)
    );
  }

  console.log('-'.repeat(55));
  console.log(
    'TOTAL'.padEnd(28) +
      String(totalInput).padEnd(10) +
      String(totalOutput).padEnd(10) +
      String(totalInput + totalOutput)
  );

  // Total cost — Haiku: $0.25/M input, $1.25/M output
  const costInput = (totalInput / 1_000_000) * 0.25;
  const costOutput = (totalOutput / 1_000_000) * 1.25;
  const costTotal = costInput + costOutput;

  console.log(`\n=== Total Chain Cost ===`);
  console.log(`  Input:  $${costInput.toFixed(6)}`);
  console.log(`  Output: $${costOutput.toFixed(6)}`);
  console.log(`  Total:  $${costTotal.toFixed(6)}`);
}

executeChain().then(() => {
  console.log('\n--- Exercise 15 complete! ---');
});
