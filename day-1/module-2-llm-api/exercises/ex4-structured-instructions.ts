/**
 * Exercise 4: Structured Instructions
 *
 * Build rich system prompts with role, rules, and output format sections.
 * See how well-structured instructions produce more consistent responses.
 * Run: npx tsx exercises/ex4-instrucoes-estruturadas.ts
 *
 * Estimated time: 15 min
 * Difficulty: beginner
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === TODO 1: Create a structured system prompt with sections ===
// Build a system prompt for an "AI Code Reviewer" with these sections:
//
// [Role]
// You are a senior code reviewer specialized in TypeScript/Node.js.
//
// [Rules]
// 1. Always point out security issues first
// 2. Suggest performance improvements when relevant
// 3. Check error handling
// 4. Limit your review to at most 5 points
// 5. Be direct and objective
//
// [Response Format]
// ## Summary
// (1 sentence about overall quality)
//
// ## Issues Found
// - [SEVERITY] Description of the issue
//   Suggestion: how to fix
//
// ## Positive Points
// - What is good in the code

// const systemPromptReviewer = `...`;

// === TODO 2: Call the API with the structured system prompt ===
// Send a code snippet for review:
const codeForReview = `
async function getUser(id) {
  const response = await fetch('http://api.example.com/users/' + id);
  const data = await response.json();
  return data;
}

app.get('/user/:id', async (req, res) => {
  const user = await getUser(req.params.id);
  res.json(user);
});
`;

// const review = await client.messages.create({ ... });

// === TODO 3: Test with 3 different inputs to check consistency ===
// Send 3 different code snippets using the same system prompt.
// Check if the response format stays consistent.
//
// Code 2: function that saves data without validation
// Code 3: function with inline SQL

const codeWithoutValidation = `
app.post('/save', async (req, res) => {
  const { name, email, age } = req.body;
  await db.collection('users').insertOne({ name, email, age });
  res.json({ success: true });
});
`;

const codeWithSQL = `
async function searchProducts(query) {
  const sql = "SELECT * FROM products WHERE name LIKE '%" + query + "%'";
  const results = await db.execute(sql);
  return results;
}
`;

// for (const [name, code] of Object.entries({ ... })) {
//   const result = await client.messages.create({ ... });
//   console.log(`=== Review: ${name} ===`);
//   console.log(result.content[0].text);
// }

// === TODO 4: Create a second variant of the system prompt and compare ===
// Create an alternative system prompt with a more didactic tone (like a teacher).
// Send the same code and compare the two approaches.

// const systemPromptTeacher = `...`;

console.log('\n--- Exercise 4 complete! ---');
console.log('Hint: see the solution in solutions/ex4-instrucoes-estruturadas.ts');
