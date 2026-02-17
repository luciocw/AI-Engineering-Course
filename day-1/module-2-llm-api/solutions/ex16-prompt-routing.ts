/**
 * Solution 16: Prompt Routing
 *
 * Use Claude to classify the intent of messages and route each one
 * to a specialized prompt.
 * Run: npx tsx solutions/ex16-prompt-routing.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Types ===

type Category = 'technical' | 'sales' | 'support' | 'general';

type Classification = {
  category: Category;
  confidence: number;
  justification: string;
};

type RoutingResult = {
  originalMessage: string;
  classification: Classification;
  specialistResponse: string;
  totalTokens: number;
};

// === Customer messages to classify and route ===
const customerMessages = [
  'My API is returning error 429, how do I solve the rate limiting?',
  'What plans do you offer for companies with more than 500 employees?',
  'I cannot access my account since yesterday, I already tried resetting the password.',
  'Do you have Salesforce integration? I need to connect my CRM.',
  'I want to better understand how your AI works, can you explain?',
];

// Router prompt
function buildRouterPrompt(message: string): string {
  return `Classify the intent of the customer message into one of the categories:
- technical: implementation problems, bugs, errors, API, technical integration
- sales: prices, plans, proposals, comparisons, commercial features
- support: access, account, password, product usage problems
- general: general questions, information, curiosities about the company/product

Return ONLY valid JSON:
{
  "category": "technical|sales|support|general",
  "confidence": 0.0 to 1.0,
  "justification": "brief explanation of the classification"
}

Customer message: "${message}"`;
}

// Specialized system prompts
const systemPrompts: Record<Category, string> = {
  technical: `You are a senior technical specialist. Respond in a detailed and technical manner.
Include code or configuration examples when relevant.
Be precise and direct, referencing documentation when possible.
Limit the response to 3-4 sentences.`,

  sales: `You are an experienced sales consultant. Respond persuasively but honestly.
Focus on the benefits and value of the product for the customer.
Suggest the most suitable plan and mention competitive differentiators.
Limit the response to 3-4 sentences.`,

  support: `You are an empathetic and efficient customer support agent.
Show understanding for the customer's problem.
Provide clear and numbered steps to resolve the issue.
Limit the response to 3-4 sentences.`,

  general: `You are a friendly and informative company representative.
Explain concepts in an accessible way without excessive jargon.
Invite the customer to explore more about the product.
Limit the response to 3-4 sentences.`,
};

// Classify message
async function classifyMessage(message: string): Promise<{ classification: Classification; tokens: number }> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    temperature: 0,
    messages: [{ role: 'user', content: buildRouterPrompt(message) }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const classification: Classification = JSON.parse(text);
  const tokens = response.usage.input_tokens + response.usage.output_tokens;

  return { classification, tokens };
}

// Route to specialist
async function routeToSpecialist(
  message: string,
  category: Category
): Promise<{ response: string; tokens: number }> {
  const apiResponse = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    temperature: 0.3,
    system: systemPrompts[category],
    messages: [{ role: 'user', content: message }],
  });

  const text = apiResponse.content[0].type === 'text' ? apiResponse.content[0].text : '';
  const tokens = apiResponse.usage.input_tokens + apiResponse.usage.output_tokens;

  return { response: text, tokens };
}

// Execute full routing
async function executeRouting() {
  console.log('=== Prompt Routing: Classify -> Route -> Respond ===\n');

  const results: RoutingResult[] = [];
  const categoryCounter: Record<Category, number> = {
    technical: 0,
    sales: 0,
    support: 0,
    general: 0,
  };

  for (const message of customerMessages) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Message: "${message}"`);

    // Step 1: Classify
    const { classification, tokens: classificationTokens } = await classifyMessage(message);
    console.log(`\nClassification: ${classification.category} (confidence: ${(classification.confidence * 100).toFixed(0)}%)`);
    console.log(`Justification: ${classification.justification}`);

    // Step 2: Route to specialist
    const { response, tokens: responseTokens } = await routeToSpecialist(message, classification.category);
    console.log(`\n[Specialist ${classification.category.toUpperCase()}]:`);
    console.log(response);

    categoryCounter[classification.category]++;

    results.push({
      originalMessage: message,
      classification,
      specialistResponse: response,
      totalTokens: classificationTokens + responseTokens,
    });
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('\n=== Routing Summary ===');
  console.log(
    'Category'.padEnd(15) +
      'Count'.padEnd(15) +
      'Avg Tokens'
  );
  console.log('-'.repeat(45));

  for (const [category, count] of Object.entries(categoryCounter)) {
    if (count === 0) continue;
    const categoryTokens = results
      .filter((r) => r.classification.category === category)
      .reduce((sum, r) => sum + r.totalTokens, 0);
    const avg = Math.round(categoryTokens / count);
    console.log(
      category.padEnd(15) +
        String(count).padEnd(15) +
        String(avg)
    );
  }

  const totalTokens = results.reduce((sum, r) => sum + r.totalTokens, 0);
  console.log('-'.repeat(45));
  console.log(`Total tokens: ${totalTokens}`);

  // Estimated cost — Haiku: $0.25/M input, $1.25/M output (simplified)
  const estimatedCost = (totalTokens / 1_000_000) * 0.75; // weighted average
  console.log(`Estimated cost: $${estimatedCost.toFixed(6)}`);
}

executeRouting().then(() => {
  console.log('\n--- Exercise 16 complete! ---');
});
