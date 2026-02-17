/**
 * Solution 4: Structured Instructions
 *
 * Rich system prompts with role, rules, and output format sections.
 * Run: npx tsx solutions/ex4-instrucoes-estruturadas.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Structured system prompt for code reviewer
const systemPromptReviewer = `[Role]
You are a senior code reviewer specialized in TypeScript/Node.js with 10 years of experience.

[Rules]
1. Always point out security issues first
2. Suggest performance improvements when relevant
3. Check error handling
4. Limit your review to at most 5 points
5. Be direct and objective

[Response Format]
## Summary
(1 sentence about the overall quality)

## Issues Found
- [SEVERITY] Description of the issue
  Suggestion: how to fix it

## Positive Points
- What is good about the code`;

// Alternative system prompt with didactic tone
const systemPromptProfessor = `[Role]
You are a programming professor who does educational code reviews.
Your goal is to teach best practices, not just point out errors.

[Rules]
1. Explain the WHY of each issue, not just the WHAT
2. Use simple analogies when possible
3. Always suggest a corrected example
4. Encourage what is good
5. Maximum 5 points

[Response Format]
## Overall Grade
(1 sentence summary + grade from 1 to 10)

## What to Learn
- Topic: Didactic explanation
  Before: code with issue
  After: corrected code

## Well Done
- What the student did well`;

// Code snippets for review
const codeForReview: Record<string, string> = {
  'API without error handling': `
async function getUser(id) {
  const response = await fetch('http://api.example.com/users/' + id);
  const data = await response.json();
  return data;
}

app.get('/user/:id', async (req, res) => {
  const user = await getUser(req.params.id);
  res.json(user);
});
`,
  'Insert without validation': `
app.post('/save', async (req, res) => {
  const { name, email, age } = req.body;
  await db.collection('users').insertOne({ name, email, age });
  res.json({ success: true });
});
`,
  'Vulnerable SQL injection': `
async function searchProducts(query) {
  const sql = "SELECT * FROM products WHERE name LIKE '%" + query + "%'";
  const results = await db.execute(sql);
  return results;
}
`,
};

// Helper function to perform review
async function performReview(
  system: string,
  code: string
): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system,
    messages: [
      {
        role: 'user',
        content: `Review the following code:\n\`\`\`\n${code}\n\`\`\``,
      },
    ],
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';
  return text;
}

// Test with the 3 code snippets using the senior reviewer
console.log('========================================');
console.log('  APPROACH 1: Senior Code Reviewer');
console.log('========================================\n');

for (const [name, code] of Object.entries(codeForReview)) {
  console.log(`=== Review: ${name} ===`);
  const review = await performReview(systemPromptReviewer, code);
  console.log(review);
  console.log('\n' + '-'.repeat(50) + '\n');
}

// Comparison: same code with professor approach
console.log('========================================');
console.log('  APPROACH 2: Didactic Professor');
console.log('========================================\n');

const firstCodeName = Object.keys(codeForReview)[0];
const firstCode = codeForReview[firstCodeName];

console.log(`=== Didactic Review: ${firstCodeName} ===`);
const reviewProfessor = await performReview(systemPromptProfessor, firstCode);
console.log(reviewProfessor);

console.log('\n' + '-'.repeat(50));
console.log('\nNote: Compare how the same code receives different reviews');
console.log('depending on the system prompt structure.');
console.log('The response format stays consistent within each approach.');

console.log('\n--- Exercise 4 complete! ---');
