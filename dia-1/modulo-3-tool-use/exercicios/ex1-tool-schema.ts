/**
 * Exercicio 1: Definindo Tool Schemas
 *
 * Aprenda a estrutura de uma tool definition da Anthropic.
 * Defina 3 tools com nome, descricao e input_schema corretos.
 * Nao precisa chamar a API — apenas defina os schemas e valide-os.
 *
 * Dificuldade: Basico
 * Tempo estimado: 10 minutos
 * Execute: npx tsx exercicios/ex1-tool-schema.ts
 */

import Anthropic from '@anthropic-ai/sdk';

// === CONCEITO ===
// Uma tool na API da Anthropic tem 3 campos obrigatorios:
// - name: identificador unico (snake_case)
// - description: texto claro explicando o que a tool faz
// - input_schema: JSON Schema descrevendo os parametros
//
// O tipo TypeScript correspondente e Anthropic.Tool

// === TODO 1: Defina a tool "buscar_clima" ===
// Recebe: cidade (string, obrigatorio), unidade ('celsius' | 'fahrenheit', opcional, default 'celsius')
// Retorna: temperatura e condicao climatica
//
// const buscarClimaTool: Anthropic.Tool = {
//   name: 'buscar_clima',
//   description: '...',
//   input_schema: {
//     type: 'object' as const,
//     properties: {
//       cidade: { type: 'string', description: '...' },
//       unidade: { type: 'string', enum: ['celsius', 'fahrenheit'], description: '...' },
//     },
//     required: ['cidade'],
//   },
// };

// === TODO 2: Defina a tool "enviar_email" ===
// Recebe: destinatario (string, obrigatorio), assunto (string, obrigatorio),
//         corpo (string, obrigatorio), cc (array de strings, opcional)
//
// const enviarEmailTool: Anthropic.Tool = { ... };

// === TODO 3: Defina a tool "consultar_banco" ===
// Recebe: tabela (string, obrigatorio), filtros (object com campo e valor, opcional),
//         limite (number, opcional, default 10)
//
// const consultarBancoTool: Anthropic.Tool = { ... };

// === TODO 4: Valide que todas as tools tem a estrutura correta ===
// Crie um array com as 3 tools e verifique:
// - Todas tem 'name', 'description', 'input_schema'
// - Todos os input_schema tem 'type' === 'object'
// - Todos os input_schema tem 'properties'
// - Todos os input_schema tem 'required' (array)

// const tools: Anthropic.Tool[] = [buscarClimaTool, enviarEmailTool, consultarBancoTool];

// function validarTools(tools: Anthropic.Tool[]): void {
//   for (const tool of tools) {
//     console.log(`\nValidando tool: ${tool.name}`);
//     // Verifique os campos...
//     console.log(`  ✓ name: ${tool.name}`);
//     console.log(`  ✓ description: ${tool.description.slice(0, 50)}...`);
//     console.log(`  ✓ input_schema.type: ${tool.input_schema.type}`);
//     // Verifique properties e required...
//   }
// }

// validarTools(tools);

console.log('\n--- Exercicio 1 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex1-tool-schema.ts');
