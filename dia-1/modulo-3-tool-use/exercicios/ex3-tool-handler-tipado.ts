/**
 * Exercicio 3: Handlers Tipados
 *
 * Crie handler functions tipadas com TypeScript para tools.
 * Use discriminated unions e um dispatcher com tipagem segura.
 *
 * Dificuldade: Basico
 * Tempo estimado: 15 minutos
 * Execute: npx tsx exercicios/ex3-tool-handler-tipado.ts
 */

import Anthropic from '@anthropic-ai/sdk';

// === CONCEITO ===
// Quando Claude chama uma tool, recebemos name + input.
// Em TypeScript, podemos tipar cada handler individualmente
// e criar um dispatcher que roteia para o handler correto.
// Discriminated unions permitem que o TS infira os tipos automaticamente.

// === TODO 1: Defina os tipos de input para cada tool ===
// Use discriminated union baseada no campo 'tool_name'

// type CalculadoraInput = {
//   tool_name: 'calculadora';
//   operacao: 'soma' | 'subtracao' | 'multiplicacao' | 'divisao';
//   a: number;
//   b: number;
// };

// type TraducaoInput = {
//   tool_name: 'traduzir';
//   texto: string;
//   idioma_destino: string;
// };

// type FormatadorInput = {
//   tool_name: 'formatar_data';
//   data: string;
//   formato: 'curto' | 'longo' | 'iso';
// };

// type ToolInput = CalculadoraInput | TraducaoInput | FormatadorInput;

// === TODO 2: Implemente handlers tipados para cada tool ===
// Cada handler recebe seu tipo especifico e retorna string

// function handleCalculadora(input: CalculadoraInput): string { ... }
// function handleTraduzir(input: TraducaoInput): string { ... }
// function handleFormatarData(input: FormatadorInput): string { ... }

// === TODO 3: Crie o dispatcher com tipagem segura ===
// Use switch no campo tool_name — TypeScript deve inferir o tipo em cada case

// function dispatch(input: ToolInput): string {
//   switch (input.tool_name) {
//     case 'calculadora':
//       return handleCalculadora(input); // TS sabe que e CalculadoraInput
//     case 'traduzir':
//       return handleTraduzir(input);    // TS sabe que e TraducaoInput
//     case 'formatar_data':
//       return handleFormatarData(input); // TS sabe que e FormatadorInput
//     default:
//       // exhaustive check: se adicionar novo tipo, TS reclama aqui
//       const _exhaustive: never = input;
//       return `Tool desconhecida`;
//   }
// }

// === TODO 4: Teste o dispatcher com exemplos ===
// const testes: ToolInput[] = [
//   { tool_name: 'calculadora', operacao: 'soma', a: 10, b: 20 },
//   { tool_name: 'traduzir', texto: 'Hello world', idioma_destino: 'pt' },
//   { tool_name: 'formatar_data', data: '2026-03-15', formato: 'longo' },
// ];
//
// for (const teste of testes) {
//   console.log(`${teste.tool_name}: ${dispatch(teste)}`);
// }

console.log('\n--- Exercicio 3 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex3-tool-handler-tipado.ts');
