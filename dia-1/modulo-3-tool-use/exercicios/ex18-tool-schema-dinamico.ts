/**
 * Exercicio 18: Schemas Dinamicos de Tools
 *
 * Gere tool definitions dinamicamente baseadas em configuracao.
 * Util quando as tools disponiveis mudam conforme o contexto.
 *
 * Dificuldade: Expert
 * Tempo estimado: 25 minutos
 * Execute: npx tsx exercicios/ex18-tool-schema-dinamico.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEITO ===
// Em sistemas reais, as tools disponiveis podem variar:
// - Baseado no usuario (admin vs usuario normal)
// - Baseado no contexto (qual pagina, qual fluxo)
// - Baseado em configuracao externa (feature flags)
//
// Em vez de definir tools estaticamente, podemos gera-las
// dinamicamente a partir de uma configuracao.

// === TODO 1: Defina a configuracao de tools ===
// Um formato declarativo que descreve as tools.

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
//   roles: string[];  // Quais roles podem usar esta tool
//   handler: (input: Record<string, unknown>) => string;
// }

// const toolConfigs: ToolConfig[] = [
//   {
//     name: 'listar_usuarios',
//     description: 'Lista usuarios do sistema',
//     params: [
//       { name: 'filtro', type: 'string', description: 'Filtro opcional', required: false },
//     ],
//     roles: ['admin', 'viewer'],
//     handler: (input) => JSON.stringify([{ nome: 'Ana' }, { nome: 'Carlos' }]),
//   },
//   {
//     name: 'deletar_usuario',
//     description: 'Deleta um usuario do sistema',
//     params: [
//       { name: 'id', type: 'string', description: 'ID do usuario', required: true },
//     ],
//     roles: ['admin'],  // Apenas admin
//     handler: (input) => JSON.stringify({ deletado: input.id }),
//   },
//   // ... mais tools
// ];

// === TODO 2: Crie o gerador de schemas ===
// Converte ToolConfig[] em Anthropic.Tool[]

// function gerarToolSchemas(configs: ToolConfig[], userRole: string): Anthropic.Tool[] {
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

// === TODO 3: Crie o dispatcher dinamico ===
// Usa o map de configs para encontrar o handler correto.

// function criarDispatcher(configs: ToolConfig[]): (name: string, input: Record<string, unknown>) => string {
//   const handlerMap = new Map(configs.map(c => [c.name, c.handler]));
//   return (name, input) => {
//     const handler = handlerMap.get(name);
//     if (!handler) return `Tool desconhecida: ${name}`;
//     return handler(input);
//   };
// }

// === TODO 4: Teste com diferentes roles ===
// Role 'admin': veja que tem mais tools disponiveis
// Role 'viewer': veja que tem menos tools

// async function testarComRole(role: string): Promise<void> {
//   const tools = gerarToolSchemas(toolConfigs, role);
//   console.log(`\nRole: ${role} — ${tools.length} tools disponiveis`);
//   // Rode o loop de tool use com as tools geradas
// }

console.log('\n--- Exercicio 18 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex18-tool-schema-dinamico.ts');
