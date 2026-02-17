/**
 * Exercise 20: Mini Autonomous Agent (Capstone)
 *
 * Build a mini agent that uses tools to complete complex tasks
 * autonomously, making decisions about which tools to use
 * and in what order.
 *
 * Difficulty: Expert
 * Estimated time: 30 minutes
 * Run: npx tsx exercises/ex20-mini-agent.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEPT ===
// An autonomous agent:
// 1. Receives a goal in natural language
// 2. Plans which tools to use
// 3. Executes tools iteratively
// 4. Evaluates whether the goal has been achieved
// 5. Can change the plan based on results
//
// The loop continues until the agent decides it's done (stop_reason !== 'tool_use').
// The system prompt defines the agent's persona and decision rules.

// === TODO 1: Define the agent's environment ===
// Simulate a project management system with:
// - Projects with tasks
// - Team members
// - Deadlines and priorities

// === TODO 2: Define 5+ tools for the agent ===
// Tool 1: list_projects — lists active projects
// Tool 2: get_tasks — lists tasks for a project
// Tool 3: create_task — creates a new task in a project
// Tool 4: assign_task — assigns a task to a team member
// Tool 5: list_team — lists available team members
// Tool 6: update_task — changes status/priority
// Tool 7: generate_project_report — project summary

// === TODO 3: Write the agent's system prompt ===
// Define:
// - Persona: AI project manager
// - Rules: always check projects before creating tasks
// - Strategy: consult team before assigning
// - Format: respond with action plan

// === TODO 4: Implement the agent loop ===
// The loop should:
// - Have a maximum iteration limit (safety)
// - Log each agent decision
// - Handle errors gracefully
// - Support complex multi-step tasks

// async function runAgent(goal: string, maxIterations = 10): Promise<void> {
//   const messages: Anthropic.MessageParam[] = [
//     { role: 'user', content: goal },
//   ];
//   for (let i = 0; i < maxIterations; i++) {
//     // Call the API, process tools, check if done
//   }
// }

// === TODO 5: Test with complex goals ===
// Goal: "Organize the 'Launch v2' project: create tasks for backend,
//           frontend, and QA, assign to available members, and generate
//           a project status report."

console.log('\n--- Exercise 20 complete! ---');
console.log('Hint: see the solution in solutions/ex20-mini-agent.ts');
