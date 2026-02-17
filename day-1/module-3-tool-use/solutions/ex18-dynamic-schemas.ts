/**
 * Solution 18: Dynamic Tool Schemas
 *
 * Dynamic tool generation based on roles and configuration.
 * Run: npx tsx solutions/ex18-dynamic-schemas.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Configuration interface ===

interface ParamConfig {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  description: string;
  required: boolean;
  enumValues?: string[];
}

interface ToolConfig {
  name: string;
  description: string;
  params: ParamConfig[];
  roles: string[];
  handler: (input: Record<string, unknown>) => string;
}

// === Simulated data ===

const usersDB = [
  { id: 'u1', name: 'Ana Silva', email: 'ana@company.com', role: 'admin', active: true },
  { id: 'u2', name: 'Carlos Lima', email: 'carlos@company.com', role: 'editor', active: true },
  { id: 'u3', name: 'Julia Santos', email: 'julia@company.com', role: 'viewer', active: false },
  { id: 'u4', name: 'Pedro Costa', email: 'pedro@company.com', role: 'editor', active: true },
];

const logsDB = [
  { timestamp: '2026-02-16 10:30', action: 'login', user: 'ana@company.com' },
  { timestamp: '2026-02-16 10:35', action: 'edit_doc', user: 'carlos@company.com' },
  { timestamp: '2026-02-16 11:00', action: 'delete_file', user: 'ana@company.com' },
];

// === Tool configurations ===

const toolConfigs: ToolConfig[] = [
  {
    name: 'list_users',
    description: 'Lists system users with optional filter by status (active/inactive) or role.',
    params: [
      { name: 'status', type: 'string', description: 'Filter by status: active, inactive, all', required: false, enumValues: ['active', 'inactive', 'all'] },
    ],
    roles: ['admin', 'editor', 'viewer'],
    handler: (input) => {
      let users = usersDB;
      if (input.status === 'active') users = users.filter((u) => u.active);
      if (input.status === 'inactive') users = users.filter((u) => !u.active);
      return JSON.stringify(users);
    },
  },
  {
    name: 'search_user',
    description: 'Searches for a specific user by ID or email.',
    params: [
      { name: 'id', type: 'string', description: 'User ID (e.g.: u1)', required: false },
      { name: 'email', type: 'string', description: 'User email', required: false },
    ],
    roles: ['admin', 'editor', 'viewer'],
    handler: (input) => {
      const u = usersDB.find((u) => u.id === input.id || u.email === input.email);
      if (!u) return JSON.stringify({ error: 'User not found' });
      return JSON.stringify(u);
    },
  },
  {
    name: 'create_user',
    description: 'Creates a new user in the system. Requires name, email, and role.',
    params: [
      { name: 'name', type: 'string', description: 'Full name', required: true },
      { name: 'email', type: 'string', description: 'User email', required: true },
      { name: 'role', type: 'string', description: 'User role', required: true, enumValues: ['admin', 'editor', 'viewer'] },
    ],
    roles: ['admin'],
    handler: (input) => {
      const newUser = {
        id: `u${usersDB.length + 1}`,
        name: input.name as string,
        email: input.email as string,
        role: input.role as string,
        active: true,
      };
      usersDB.push(newUser);
      return JSON.stringify({ created: newUser });
    },
  },
  {
    name: 'delete_user',
    description: 'Permanently removes a user from the system. Irreversible action.',
    params: [
      { name: 'id', type: 'string', description: 'User ID to delete', required: true },
    ],
    roles: ['admin'],
    handler: (input) => {
      const idx = usersDB.findIndex((u) => u.id === input.id);
      if (idx === -1) return JSON.stringify({ error: 'User not found' });
      const removed = usersDB.splice(idx, 1)[0];
      return JSON.stringify({ deleted: removed });
    },
  },
  {
    name: 'view_logs',
    description: 'Views the system audit logs.',
    params: [
      { name: 'limit', type: 'number', description: 'Maximum number of logs', required: false },
    ],
    roles: ['admin'],
    handler: (input) => {
      const limit = (input.limit as number) || 10;
      return JSON.stringify(logsDB.slice(0, limit));
    },
  },
  {
    name: 'edit_user',
    description: 'Edits an existing user\'s data.',
    params: [
      { name: 'id', type: 'string', description: 'User ID', required: true },
      { name: 'name', type: 'string', description: 'New name (optional)', required: false },
      { name: 'active', type: 'boolean', description: 'Active status (optional)', required: false },
    ],
    roles: ['admin', 'editor'],
    handler: (input) => {
      const u = usersDB.find((u) => u.id === input.id);
      if (!u) return JSON.stringify({ error: 'User not found' });
      if (input.name) u.name = input.name as string;
      if (input.active !== undefined) u.active = input.active as boolean;
      return JSON.stringify({ updated: u });
    },
  },
];

// === Schema generator ===

function generateToolSchemas(configs: ToolConfig[], userRole: string): Anthropic.Tool[] {
  return configs
    .filter((config) => config.roles.includes(userRole))
    .map((config) => {
      const properties: Record<string, Record<string, unknown>> = {};

      for (const param of config.params) {
        const prop: Record<string, unknown> = {
          type: param.type,
          description: param.description,
        };
        if (param.enumValues) {
          prop.enum = param.enumValues;
        }
        properties[param.name] = prop;
      }

      return {
        name: config.name,
        description: config.description,
        input_schema: {
          type: 'object' as const,
          properties,
          required: config.params.filter((p) => p.required).map((p) => p.name),
        },
      };
    });
}

// === Dynamic dispatcher ===

function createDispatcher(
  configs: ToolConfig[]
): (name: string, input: Record<string, unknown>) => string {
  const handlerMap = new Map(configs.map((c) => [c.name, c.handler]));
  return (name, input) => {
    const handler = handlerMap.get(name);
    if (!handler) return JSON.stringify({ error: `Unknown tool: ${name}` });
    return handler(input);
  };
}

const dispatch = createDispatcher(toolConfigs);

// === Tool use loop with role ===

async function runWithRole(role: string, question: string): Promise<void> {
  const tools = generateToolSchemas(toolConfigs, role);
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Role: ${role} — ${tools.length} tools available`);
  console.log(`Tools: ${tools.map((t) => t.name).join(', ')}`);
  console.log(`Question: "${question}"\n`);

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  let continueLoop = true;

  while (continueLoop) {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `You are an administration assistant. The current user has role "${role}". Use only the available tools.`,
      tools,
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [Tool: ${block.name}(${JSON.stringify(block.input)})]`);
        const result = dispatch(block.name, block.input as Record<string, unknown>);
        console.log(`  [Result: ${result.slice(0, 100)}...]`);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });
    } else {
      continueLoop = false;
    }
  }
}

// === Test with different roles ===

// Admin: has access to all tools (6)
await runWithRole('admin', 'List all active users and show the system logs.');

// Viewer: has read-only access (2 tools)
await runWithRole('viewer', 'List all system users.');

console.log('\n--- Exercise 18 complete! ---');
