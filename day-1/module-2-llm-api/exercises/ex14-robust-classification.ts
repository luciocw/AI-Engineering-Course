/**
 * Exercise 14: Robust Classification
 * Difficulty: advanced | Time: 25 min
 *
 * Combine few-shot + Chain-of-Thought + JSON for robust ticket classification.
 * Reference: ex8 (JSON), ex11 (few-shot), ex13 (CoT) — now everything together.
 * Cross-module: this classifier pattern will be reused in M4 ex12.
 * Run: npx tsx exercises/ex14-classificacao-robusta.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Classification categories ===
const CATEGORIES = [
  'technical',
  'billing',
  'cancellation',
  'question',
  'suggestion',
] as const;

type Category = (typeof CATEGORIES)[number];

// === Expected output type ===
type TicketClassification = {
  category: Category;
  confidence: number; // 0 to 1
  reasoning: string; // CoT — why this category?
  suggestedAction: string;
};

// === Few-shot examples (training) ===
const fewShotExamples = [
  {
    ticket: 'The system gives error 403 when I try to access the admin panel',
    classification: {
      category: 'technical',
      confidence: 0.95,
      reasoning:
        'The customer reports a specific HTTP error (403 Forbidden) when accessing a system feature. This is a technical permission or configuration issue.',
      suggestedAction:
        'Forward to level 2 technical support team to check user permissions.',
    },
  },
  {
    ticket:
      'I was charged twice this month and I want my money back immediately',
    classification: {
      category: 'billing',
      confidence: 0.92,
      reasoning:
        'The customer reports a duplicate charge and requests a refund. This is clearly a billing/payment issue.',
      suggestedAction:
        'Check payment history and initiate chargeback process if the duplication is confirmed.',
    },
  },
  {
    ticket:
      'I want to cancel my subscription, I haven\'t used the service since March',
    classification: {
      category: 'cancellation',
      confidence: 0.98,
      reasoning:
        'The customer explicitly requests subscription cancellation, indicating prolonged disuse.',
      suggestedAction:
        'Initiate retention flow and, if the decision is maintained, process cancellation.',
    },
  },
];

// === Tickets to classify (10) ===
const tickets = [
  'The reports page doesn\'t load, it\'s been blank for 2 days',
  'Why did my plan go from $49 to $79 without notice?',
  'I want to close my account and delete all my data',
  'How do I export my data in CSV format?',
  'It would be great to have Google Calendar integration in the app',
  'The save button doesn\'t work in Firefox browser',
  'I received a charge for a service I already cancelled last month',
  'I\'d like to know if there\'s a discounted plan for teams',
  'Could you add dark mode to the interface?',
  'I can\'t reset my password, the recovery email doesn\'t arrive',
];

// === TODO 1: Create the classification pipeline ===
// Combine in a single prompt:
// a) Few-shot examples (the 3 examples above formatted as JSON)
// b) CoT instruction: "Analyze the ticket step by step before classifying"
// c) JSON output schema: { category, confidence, reasoning, suggestedAction }
//
// function buildClassificationPrompt(ticket: string): {
//   system: string;
//   user: string;
// } { ... }

// === TODO 2: Define the categories in the system prompt ===
// Categories: technical, billing, cancellation, question, suggestion
// For each category, include a short description to guide the model.
// Example:
//   - technical: system issues, bugs, errors
//   - billing: payments, invoices, refunds
//   - ...

// === TODO 3: For each ticket, classify and extract JSON ===
// 1. Call the API with the prompt
// 2. Parse the JSON from the response (reuse logic from ex8)
// 3. Validate that the category is in the valid list
// 4. Store the result
//
// async function classifyTicket(ticket: string): Promise<TicketClassification | null> { ... }

// === TODO 4: Generate summary report with metrics ===
// Display:
// 1. Table: Ticket | Category | Confidence | Action
// 2. Distribution by category (count)
// 3. Average confidence per category
// 4. Low confidence tickets (<0.8)
//
// for (const ticket of tickets) {
//   const result = await classifyTicket(ticket);
//   ...
// }

console.log('\n--- Exercise 14 complete! ---');
console.log('Hint: see the solution in solutions/ex14-classificacao-robusta.ts');
