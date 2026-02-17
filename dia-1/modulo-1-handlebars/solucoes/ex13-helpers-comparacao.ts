/**
 * Solucao - Exercicio 13: Helpers de Comparacao
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

// Solucao TODO 1: Helpers de comparacao
Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
Handlebars.registerHelper('gte', (a: number, b: number) => a >= b);
Handlebars.registerHelper('lt', (a: number, b: number) => a < b);
Handlebars.registerHelper('lte', (a: number, b: number) => a <= b);

// Solucao TODO 2: Helpers logicos
Handlebars.registerHelper('and', (a: unknown, b: unknown) => a && b);
Handlebars.registerHelper('or', (a: unknown, b: unknown) => a || b);
Handlebars.registerHelper('not', (a: unknown) => !a);

// Solucao TODO 3: Template de classificacao
const templateClassificacao = `=== Boletim da Turma ===
{{#each alunos}}
{{nome}} | Nota: {{nota}} | Freq: {{frequencia}}% | Status: {{#if (and (gte nota 9) (and (gte frequencia 90) projetoFinal))}}Aprovado com honras{{else}}{{#if (and (gte nota 7) (gte frequencia 75))}}Aprovado{{else}}{{#if (gte nota 5)}}Recuperacao{{else}}Reprovado{{/if}}{{/if}}{{/if}}
{{/each}}`;

// Compile e teste
const compilado = Handlebars.compile(templateClassificacao);
const resultado = compilado({ alunos });

console.log('=== Classificacao de Alunos ===');
console.log(`Nota minima: ${NOTA_MINIMA} | Frequencia minima: ${FREQUENCIA_MINIMA}%`);
console.log('');
console.log(resultado);

// Resumo estatistico usando helpers
const templateResumo = `=== Resumo ===
{{#each alunos}}{{#if (gte nota 9)}}[Destaque] {{nome}} - nota {{nota}}
{{/if}}{{/each}}
Alunos abaixo da media:
{{#each alunos}}{{#if (lt nota 7)}}  - {{nome}} ({{nota}})
{{/if}}{{/each}}`;

const compiladoResumo = Handlebars.compile(templateResumo);
console.log(compiladoResumo({ alunos }));
