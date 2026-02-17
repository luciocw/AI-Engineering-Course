/**
 * Exercise 3: System Prompts and Personas
 *
 * Learn how system prompts completely change Claude's behavior.
 * Run: npx tsx exercises/ex3-system-prompt.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === The same question for 3 different personas ===
const question = 'How does a vector database work?';

// === TODO 1: Define 3 system prompts with distinct personas ===
// Persona 1: Senior code reviewer (technical, critical, direct)
// Persona 2: Patient teacher (didactic, uses analogies)
// Persona 3: Technical writer (concise, bullet points, structured)

const personas: Record<string, string> = {
  // 'Code Reviewer': '...',
  // 'Teacher': '...',
  // 'Technical Writer': '...',
};

// === TODO 2: Create a function that makes a call with a system prompt ===
// Receives: system (string), question (string)
// Returns: response text

// async function askWithPersona(system: string, question: string): Promise<string> { ... }

// === TODO 3: Call the function with each persona ===
// Use a loop over the personas and display the result of each one.

// for (const [name, system] of Object.entries(personas)) {
//   const response = await askWithPersona(system, question);
//   console.log(`\n=== Persona: ${name} ===`);
//   console.log(response);
// }

console.log('\n--- Exercise 3 complete! ---');
console.log('Hint: see the solution in solutions/ex3-system-prompt.ts');
