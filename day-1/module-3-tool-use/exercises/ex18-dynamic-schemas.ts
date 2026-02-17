/**
 * Exercise 18: Dynamic Tool Schemas
 *
 * Generate tool definitions dynamically based on configuration.
 * Useful when available tools change depending on context.
 *
 * Difficulty: Expert
 * Estimated time: 25 minutes
 * Run: npx tsx exercises/ex18-tool-schema-dinamico.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEPT ===
// In real systems, available tools can vary:
// - Based on the user (admin vs regular user)
// - Based on context (which page, which flow)
// - Based on external configuration (feature flags)
//
// Instead of defining tools statically, we can generate them
// dynamically from a configuration.

// === TODO 1: Define the tool configuration ===
// A declarative format that describes the tools.

// interface ToolConfig {
//   name: string;
//   description: string;
//   params: Array<{
//     name: string;
//     type: 'string' | 'number' | 'boolean' | 'array';
//     description: string;
//     required: boolean;
//     enum?: string[];
//   }>;
//   roles: string[];  // Which roles can use this tool
//   handler: (input: Record<string, unknown>) => string;
// }

// const toolConfigs: ToolConfig[] = [
//   {
//     name: 'list_users',
//     description: 'Lists system users',
//     params: [
//       { name: 'filter', type: 'string', description: 'Optional filter', required: false },
//     ],
//     roles: ['admin', 'viewer'],
//     handler: (input) => JSON.stringify([{ name: 'Ana' }, { name: 'Carlos' }]),
//   },
//   {
//     name: 'delete_user',
//     description: 'Deletes a user from the system',
//     params: [
//       { name: 'id', type: 'string', description: 'User ID', required: true },
//     ],
//     roles: ['admin'],  // Admin only
//     handler: (input) => JSON.stringify({ deleted: input.id }),
//   },
//   // ... more tools
// ];

// === TODO 2: Create the schema generator ===
// Converts ToolConfig[] to Anthropic.Tool[]

// function generateToolSchemas(configs: ToolConfig[], userRole: string): Anthropic.Tool[] {
//   return configs
//     .filter(config => config.roles.includes(userRole))
//     .map(config => ({
//       name: config.name,
//       description: config.description,
//       input_schema: {
//         type: 'object' as const,
//         properties: Object.fromEntries(
//           config.params.map(p => [p.name, { type: p.type, description: p.description }])
//         ),
//         required: config.params.filter(p => p.required).map(p => p.name),
//       },
//     }));
// }

// === TODO 3: Create the dynamic dispatcher ===
// Uses the config map to find the correct handler.

// function createDispatcher(configs: ToolConfig[]): (name: string, input: Record<string, unknown>) => string {
//   const handlerMap = new Map(configs.map(c => [c.name, c.handler]));
//   return (name, input) => {
//     const handler = handlerMap.get(name);
//     if (!handler) return `Unknown tool: ${name}`;
//     return handler(input);
//   };
// }

// === TODO 4: Test with different roles ===
// Role 'admin': see that more tools are available
// Role 'viewer': see that fewer tools are available

// async function testWithRole(role: string): Promise<void> {
//   const tools = generateToolSchemas(toolConfigs, role);
//   console.log(`\nRole: ${role} — ${tools.length} tools available`);
//   // Run the tool use loop with the generated tools
// }

console.log('\n--- Exercise 18 complete! ---');
console.log('Hint: see the solution in solutions/ex18-tool-schema-dinamico.ts');
