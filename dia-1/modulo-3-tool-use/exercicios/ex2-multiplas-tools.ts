/**
 * Exercicio 2: Multiplas Tools
 *
 * Disponibilize 3 tools e deixe Claude escolher qual usar.
 * Execute: npx tsx exercicios/ex2-multiplas-tools.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === TODO 1: Defina 3 tools ===
// Tool 1: calculadora — operacoes matematicas (do ex1)
// Tool 2: conversor_unidades — converte celsius/fahrenheit, km/milhas, kg/libras
// Tool 3: data_info — retorna dia da semana, dias ate uma data, diferenca entre datas

// const tools = [ ... ];

// === TODO 2: Implemente os handlers ===
// Um handler para cada tool.

// function handleCalculadora(input: {...}): string { ... }
// function handleConversor(input: {...}): string { ... }
// function handleDataInfo(input: {...}): string { ... }

// === TODO 3: Crie um dispatcher de tools ===
// Recebe o nome da tool + input, despacha para o handler correto.

// function dispatchTool(name: string, input: Record<string, unknown>): string {
//   switch (name) {
//     case 'calculadora': return handleCalculadora(input);
//     case 'conversor_unidades': return handleConversor(input);
//     case 'data_info': return handleDataInfo(input);
//     default: return `Tool ${name} nao encontrada`;
//   }
// }

// === TODO 4: Teste com perguntas que usam tools diferentes ===
// Pergunta 1: "Quanto e 25 graus Celsius em Fahrenheit?"
// Pergunta 2: "Que dia da semana sera 25/12/2026?"
// Pergunta 3: "Calcule 15% de 2500 e converta o resultado de km para milhas"

// Para cada pergunta, rode o loop de tool use completo.

console.log('\n--- Exercicio 2 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex2-multiplas-tools.ts');
