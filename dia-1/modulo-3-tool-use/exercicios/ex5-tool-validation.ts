/**
 * Exercicio 5: Validacao de Inputs com Zod
 *
 * Valide os inputs recebidos das tools antes de processar.
 * Use Zod para garantir tipagem em runtime e retornar erros claros.
 *
 * Dificuldade: Basico
 * Tempo estimado: 15 minutos
 * Execute: npx tsx exercicios/ex5-tool-validation.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEITO ===
// Quando Claude chama uma tool, os inputs vem como `unknown`.
// Precisamos validar antes de usar para evitar erros em runtime.
// Zod e uma biblioteca popular para validacao de schemas em TypeScript.
// Aqui vamos implementar validacao manual (sem dependencia externa).

// === TODO 1: Crie funcoes de validacao para cada tipo ===
// Valide que os campos existem, tem o tipo correto, e estao dentro dos limites.

// function validarCriarUsuario(input: unknown): {
//   valido: boolean;
//   dados?: { nome: string; email: string; idade: number };
//   erro?: string;
// } {
//   if (typeof input !== 'object' || input === null) {
//     return { valido: false, erro: 'Input deve ser um objeto' };
//   }
//   const obj = input as Record<string, unknown>;
//   // Verifique nome (string, min 2 chars)
//   // Verifique email (string, contem @)
//   // Verifique idade (number, 0-150)
//   // Retorne { valido: true, dados: { nome, email, idade } }
// }

// function validarBuscarProdutos(input: unknown): {
//   valido: boolean;
//   dados?: { categoria: string; preco_max?: number; ordenar?: 'preco' | 'nome' | 'avaliacao' };
//   erro?: string;
// } {
//   // Verifique categoria (string, obrigatorio)
//   // Verifique preco_max (number, opcional, > 0)
//   // Verifique ordenar (string, opcional, deve ser um dos valores permitidos)
// }

// === TODO 2: Defina as tools com schemas detalhados ===

// const tools: Anthropic.Tool[] = [
//   {
//     name: 'criar_usuario',
//     description: 'Cria um novo usuario no sistema com nome, email e idade.',
//     input_schema: { ... },
//   },
//   {
//     name: 'buscar_produtos',
//     description: 'Busca produtos por categoria com filtros opcionais.',
//     input_schema: { ... },
//   },
// ];

// === TODO 3: Implemente o dispatcher com validacao ===
// Antes de executar o handler, valide o input.
// Se a validacao falhar, retorne o erro como tool_result.

// function dispatchComValidacao(name: string, input: unknown): string {
//   switch (name) {
//     case 'criar_usuario': {
//       const resultado = validarCriarUsuario(input);
//       if (!resultado.valido) return `Erro de validacao: ${resultado.erro}`;
//       // Processar com resultado.dados (tipado!)
//       return JSON.stringify({ id: 1, ...resultado.dados, status: 'criado' });
//     }
//     case 'buscar_produtos': {
//       const resultado = validarBuscarProdutos(input);
//       if (!resultado.valido) return `Erro de validacao: ${resultado.erro}`;
//       // Simular busca
//       return JSON.stringify([{ nome: 'Produto A', preco: 99 }]);
//     }
//     default:
//       return `Tool desconhecida: ${name}`;
//   }
// }

// === TODO 4: Teste a validacao com inputs corretos e incorretos ===
// Teste com inputs validos e invalidos para verificar que a validacao funciona.

// const testesValidacao = [
//   { tool: 'criar_usuario', input: { nome: 'Ana', email: 'ana@email.com', idade: 25 } },
//   { tool: 'criar_usuario', input: { nome: '', email: 'invalido', idade: -5 } },
//   { tool: 'buscar_produtos', input: { categoria: 'eletronicos', preco_max: 1000 } },
//   { tool: 'buscar_produtos', input: { preco_max: -10 } }, // sem categoria
// ];
//
// for (const teste of testesValidacao) {
//   console.log(`\n${teste.tool}(${JSON.stringify(teste.input)}):`);
//   console.log(`  -> ${dispatchComValidacao(teste.tool, teste.input)}`);
// }

console.log('\n--- Exercicio 5 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex5-tool-validation.ts');
