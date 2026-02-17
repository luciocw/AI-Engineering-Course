/**
 * Solucao 18: Schemas Dinamicos de Tools
 *
 * Geracao dinamica de tools baseada em roles e configuracao.
 * Execute: npx tsx solucoes/ex18-tool-schema-dinamico.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Interface de configuracao ===

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

// === Dados simulados ===

const usuariosDB = [
  { id: 'u1', nome: 'Ana Silva', email: 'ana@empresa.com', role: 'admin', ativo: true },
  { id: 'u2', nome: 'Carlos Lima', email: 'carlos@empresa.com', role: 'editor', ativo: true },
  { id: 'u3', nome: 'Julia Santos', email: 'julia@empresa.com', role: 'viewer', ativo: false },
  { id: 'u4', nome: 'Pedro Costa', email: 'pedro@empresa.com', role: 'editor', ativo: true },
];

const logsDB = [
  { timestamp: '2026-02-16 10:30', acao: 'login', usuario: 'ana@empresa.com' },
  { timestamp: '2026-02-16 10:35', acao: 'editar_doc', usuario: 'carlos@empresa.com' },
  { timestamp: '2026-02-16 11:00', acao: 'deletar_arquivo', usuario: 'ana@empresa.com' },
];

// === Configuracao das tools ===

const toolConfigs: ToolConfig[] = [
  {
    name: 'listar_usuarios',
    description: 'Lista usuarios do sistema com filtro opcional por status (ativo/inativo) ou role.',
    params: [
      { name: 'status', type: 'string', description: 'Filtrar por status: ativo, inativo, todos', required: false, enumValues: ['ativo', 'inativo', 'todos'] },
    ],
    roles: ['admin', 'editor', 'viewer'],
    handler: (input) => {
      let usuarios = usuariosDB;
      if (input.status === 'ativo') usuarios = usuarios.filter((u) => u.ativo);
      if (input.status === 'inativo') usuarios = usuarios.filter((u) => !u.ativo);
      return JSON.stringify(usuarios);
    },
  },
  {
    name: 'buscar_usuario',
    description: 'Busca um usuario especifico por ID ou email.',
    params: [
      { name: 'id', type: 'string', description: 'ID do usuario (ex: u1)', required: false },
      { name: 'email', type: 'string', description: 'Email do usuario', required: false },
    ],
    roles: ['admin', 'editor', 'viewer'],
    handler: (input) => {
      const u = usuariosDB.find((u) => u.id === input.id || u.email === input.email);
      if (!u) return JSON.stringify({ erro: 'Usuario nao encontrado' });
      return JSON.stringify(u);
    },
  },
  {
    name: 'criar_usuario',
    description: 'Cria um novo usuario no sistema. Requer nome, email e role.',
    params: [
      { name: 'nome', type: 'string', description: 'Nome completo', required: true },
      { name: 'email', type: 'string', description: 'Email do usuario', required: true },
      { name: 'role', type: 'string', description: 'Role do usuario', required: true, enumValues: ['admin', 'editor', 'viewer'] },
    ],
    roles: ['admin'],
    handler: (input) => {
      const novo = {
        id: `u${usuariosDB.length + 1}`,
        nome: input.nome as string,
        email: input.email as string,
        role: input.role as string,
        ativo: true,
      };
      usuariosDB.push(novo);
      return JSON.stringify({ criado: novo });
    },
  },
  {
    name: 'deletar_usuario',
    description: 'Remove um usuario do sistema permanentemente. Acao irreversivel.',
    params: [
      { name: 'id', type: 'string', description: 'ID do usuario para deletar', required: true },
    ],
    roles: ['admin'],
    handler: (input) => {
      const idx = usuariosDB.findIndex((u) => u.id === input.id);
      if (idx === -1) return JSON.stringify({ erro: 'Usuario nao encontrado' });
      const removido = usuariosDB.splice(idx, 1)[0];
      return JSON.stringify({ deletado: removido });
    },
  },
  {
    name: 'ver_logs',
    description: 'Visualiza os logs de auditoria do sistema.',
    params: [
      { name: 'limite', type: 'number', description: 'Numero maximo de logs', required: false },
    ],
    roles: ['admin'],
    handler: (input) => {
      const limite = (input.limite as number) || 10;
      return JSON.stringify(logsDB.slice(0, limite));
    },
  },
  {
    name: 'editar_usuario',
    description: 'Edita dados de um usuario existente.',
    params: [
      { name: 'id', type: 'string', description: 'ID do usuario', required: true },
      { name: 'nome', type: 'string', description: 'Novo nome (opcional)', required: false },
      { name: 'ativo', type: 'boolean', description: 'Status ativo (opcional)', required: false },
    ],
    roles: ['admin', 'editor'],
    handler: (input) => {
      const u = usuariosDB.find((u) => u.id === input.id);
      if (!u) return JSON.stringify({ erro: 'Usuario nao encontrado' });
      if (input.nome) u.nome = input.nome as string;
      if (input.ativo !== undefined) u.ativo = input.ativo as boolean;
      return JSON.stringify({ atualizado: u });
    },
  },
];

// === Gerador de schemas ===

function gerarToolSchemas(configs: ToolConfig[], userRole: string): Anthropic.Tool[] {
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

// === Dispatcher dinamico ===

function criarDispatcher(
  configs: ToolConfig[]
): (name: string, input: Record<string, unknown>) => string {
  const handlerMap = new Map(configs.map((c) => [c.name, c.handler]));
  return (name, input) => {
    const handler = handlerMap.get(name);
    if (!handler) return JSON.stringify({ erro: `Tool desconhecida: ${name}` });
    return handler(input);
  };
}

const dispatch = criarDispatcher(toolConfigs);

// === Loop de tool use com role ===

async function runComRole(role: string, question: string): Promise<void> {
  const tools = gerarToolSchemas(toolConfigs, role);
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Role: ${role} — ${tools.length} tools disponiveis`);
  console.log(`Tools: ${tools.map((t) => t.name).join(', ')}`);
  console.log(`Pergunta: "${question}"\n`);

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  let continueLoop = true;

  while (continueLoop) {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `Voce e um assistente de administracao. O usuario atual tem role "${role}". Use apenas as tools disponiveis.`,
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
        console.log(`  [Resultado: ${result.slice(0, 100)}...]`);
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

// === Teste com diferentes roles ===

// Admin: tem acesso a todas as tools (6)
await runComRole('admin', 'Liste todos os usuarios ativos e mostre os logs do sistema.');

// Viewer: tem acesso apenas a leitura (2 tools)
await runComRole('viewer', 'Liste todos os usuarios do sistema.');

console.log('\n--- Exercicio 18 completo! ---');
