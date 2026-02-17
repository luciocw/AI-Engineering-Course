/**
 * Exercicio 13: Helpers de Comparacao
 *
 * Construa uma biblioteca de helpers para comparacao e logica condicional.
 * Voce ja domina helpers basicos (ex5, ex8-ex9). Agora crie helpers reutilizaveis.
 * Execute: npx tsx exercicios/ex13-helpers-comparacao.ts
 */

import Handlebars from 'handlebars';

// === Dados dos alunos ===
const alunos = [
  { nome: 'Ana', nota: 9.5, frequencia: 95, projetoFinal: true },
  { nome: 'Bruno', nota: 6.8, frequencia: 72, projetoFinal: true },
  { nome: 'Carla', nota: 7.5, frequencia: 88, projetoFinal: false },
  { nome: 'Diego', nota: 4.2, frequencia: 60, projetoFinal: false },
  { nome: 'Eva', nota: 8.0, frequencia: 91, projetoFinal: true },
];

const NOTA_MINIMA = 7.0;
const FREQUENCIA_MINIMA = 75;

// === TODO 1: Crie helpers de comparacao ===
// Registre os seguintes helpers que recebem dois valores e retornam boolean:
//   eq  - igual (a === b)
//   gt  - maior que (a > b)
//   gte - maior ou igual (a >= b)
//   lt  - menor que (a < b)
//   lte - menor ou igual (a <= b)
//
// Uso no template: {{#if (gt nota 7)}}Aprovado{{/if}}
//
// Dica: Handlebars.registerHelper('gt', (a, b) => a > b)

// TODO: Registre os 5 helpers de comparacao aqui

// === TODO 2: Crie helpers logicos ===
// Registre helpers para combinar condicoes:
//   and - retorna true se AMBOS argumentos forem truthy
//   or  - retorna true se PELO MENOS UM argumento for truthy
//   not - retorna true se o argumento for falsy
//
// Uso no template: {{#if (and (gte nota 7) (gte frequencia 75))}}Aprovado{{/if}}
//
// Dica: Handlebars.registerHelper('and', (a, b) => a && b)

// TODO: Registre os 3 helpers logicos aqui

// === TODO 3: Template de classificacao de alunos ===
// Use os helpers criados para classificar cada aluno:
//
// - "Aprovado com honras" se nota >= 9 AND frequencia >= 90 AND projetoFinal
// - "Aprovado" se nota >= 7 AND frequencia >= 75
// - "Recuperacao" se nota >= 5 mas nao atende todas as condicoes de aprovacao
// - "Reprovado" se nota < 5
//
// Formato de saida para cada aluno:
// "Ana | Nota: 9.5 | Freq: 95% | Status: Aprovado com honras"
//
// Dica: use {{#if (and (gte nota 9) (and (gte frequencia 90) projetoFinal))}}
//       para a condicao de honras

const templateClassificacao = `
TODO: Crie template que classifica cada aluno usando os helpers de comparacao
Use {{#each alunos}} para iterar e os helpers para classificar
`;

// === Compile e teste ===
// TODO: compile o template e exiba o resultado

console.log('=== Classificacao de Alunos ===');
console.log(`Nota minima: ${NOTA_MINIMA} | Frequencia minima: ${FREQUENCIA_MINIMA}%`);
console.log('');
// compile templateClassificacao e exiba

console.log('\n--- Exercicio 13 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex13-helpers-comparacao.ts');
