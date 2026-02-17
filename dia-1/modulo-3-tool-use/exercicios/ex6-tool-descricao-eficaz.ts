/**
 * Exercicio 6: Descricoes Eficazes para Tools
 *
 * A qualidade da descricao impacta diretamente a capacidade do Claude
 * de escolher e usar a tool corretamente. Pratique escrever descricoes
 * claras, especificas e com exemplos.
 *
 * Dificuldade: Intermediario
 * Tempo estimado: 15 minutos
 * Execute: npx tsx exercicios/ex6-tool-descricao-eficaz.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEITO ===
// Boas descricoes de tools devem:
// 1. Explicar O QUE a tool faz (nao como)
// 2. Especificar QUANDO usar (e quando NAO usar)
// 3. Descrever os PARAMETROS com exemplos
// 4. Indicar o FORMATO do retorno
//
// Descricoes ruins levam a tool calls incorretas ou desnecessarias.

// === TODO 1: Melhore estas descricoes RUINS ===
// Reescreva cada tool com descricoes melhores.

// RUIM — muito vaga:
// const toolRuim1: Anthropic.Tool = {
//   name: 'buscar',
//   description: 'Busca coisas',
//   input_schema: {
//     type: 'object' as const,
//     properties: {
//       q: { type: 'string', description: 'query' },
//     },
//     required: ['q'],
//   },
// };

// BOM — reescreva com descricao eficaz:
// const toolBoa1: Anthropic.Tool = {
//   name: 'buscar_documentos',
//   description: '...',    // Descreva o que busca, onde, formato do retorno
//   input_schema: {
//     type: 'object' as const,
//     properties: {
//       query: { type: 'string', description: '...' },  // Exemplos!
//       limite: { type: 'number', description: '...' },
//     },
//     required: ['query'],
//   },
// };

// RUIM — muito tecnica, sem contexto:
// const toolRuim2 = {
//   name: 'db_query',
//   description: 'SELECT * FROM table WHERE condition',
//   ...
// };

// BOM — reescreva:
// const toolBoa2: Anthropic.Tool = { ... };

// RUIM — nao diz quando usar vs nao usar:
// const toolRuim3 = {
//   name: 'calcular',
//   description: 'Faz calculos',
//   ...
// };

// BOM — reescreva:
// const toolBoa3: Anthropic.Tool = { ... };

// === TODO 2: Crie 2 tools com descricoes ambiguas propositalmente ===
// E depois uma versao melhorada de cada uma.
// Objetivo: ver como descricoes ruins afetam a escolha da tool.

// === TODO 3: Teste com Claude ===
// Envie a mesma pergunta com as tools ruins e depois com as tools boas.
// Compare se Claude escolhe a tool correta em cada caso.

// const pergunta = 'Preciso encontrar o documento sobre politica de ferias da empresa';

// async function testarDescricoes(tools: Anthropic.Tool[], label: string): Promise<void> {
//   console.log(`\n=== Teste: ${label} ===`);
//   const response = await client.messages.create({
//     model: 'claude-haiku-4-5-20251001',
//     max_tokens: 1024,
//     tools,
//     messages: [{ role: 'user', content: pergunta }],
//   });
//   for (const block of response.content) {
//     if (block.type === 'tool_use') {
//       console.log(`  Tool escolhida: ${block.name}`);
//       console.log(`  Input: ${JSON.stringify(block.input)}`);
//     }
//   }
// }

console.log('\n--- Exercicio 6 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex6-tool-descricao-eficaz.ts');
