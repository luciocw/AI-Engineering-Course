/**
 * Exercicio 9: Loops Aninhados
 *
 * Aprenda a usar {{#each}} aninhado e acessar contexto pai com ../ .
 * Voce ja domina loops simples e iteracao de objetos (ex7-ex8). Agora combine niveis.
 * Execute: npx tsx exercicios/ex9-loops-aninhados.ts
 */

import Handlebars from 'handlebars';

// === Dados da escola ===
const escola = {
  nome: 'AI Academy',
  turmas: [
    {
      nome: 'Turma A - Iniciantes',
      professor: 'Prof. Ana',
      alunos: [
        { nome: 'Carlos', nota: 8.5 },
        { nome: 'Diana', nota: 9.2 },
        { nome: 'Eduardo', nota: 7.0 },
      ],
    },
    {
      nome: 'Turma B - Avancados',
      professor: 'Prof. Bruno',
      alunos: [
        { nome: 'Fernanda', nota: 9.8 },
        { nome: 'Gabriel', nota: 8.9 },
      ],
    },
  ],
};

// === TODO 1: Template com loops aninhados ===
// Para cada turma, liste os alunos com nome e nota.
// Use {{#each turmas}} e dentro dele {{#each alunos}}.
//
// Exemplo de output:
// "Turma A - Iniciantes:
//   - Carlos (nota: 8.5)
//   - Diana (nota: 9.2)
//   - Eduardo (nota: 7.0)"
//
// Dica: {{#each turmas}}...{{#each alunos}}...{{/each}}{{/each}}

const templateAninhado = `
TODO: Crie template com loops aninhados para turmas e alunos
`;

// === TODO 2: Acessando contexto pai com ../ ===
// Dentro do loop de alunos, acesse o professor da turma usando ../ .
// Formato: "Aluno Carlos (Prof. Ana)"
//
// Dica: dentro de {{#each alunos}}, use {{../professor}} para acessar
// a propriedade professor do nivel acima (turma)

const templateContextoPai = `
TODO: Crie template que acessa contexto pai com ../
`;

// === TODO 3: Acessando contexto raiz com ../../ ===
// Dentro do loop de alunos (2 niveis abaixo), acesse o nome da escola.
// Formato: "Carlos estuda na AI Academy"
//
// Dica: cada ../ sobe um nivel. De dentro de alunos (nivel 2),
// use ../../nome para chegar ao nome da escola (nivel 0)

const templateContextoRaiz = `
TODO: Crie template que acessa contexto raiz com ../../
`;

// === TODO 4: Helper 'aprovado' ===
// Crie um helper que recebe a nota e retorna "Aprovado" se >= 7,
// caso contrario retorna "Reprovado".
//
// Dica: Handlebars.registerHelper('aprovado', function(nota) { ... })

// TODO: Registre o helper 'aprovado' aqui

// Template usando o helper aprovado:
const templateAprovacao = `
TODO: Crie template que usa o helper aprovado para cada aluno
Formato: "Carlos - 8.5 - Aprovado"
`;

// === Compile e teste ===
// TODO: compile cada template e exiba os resultados

console.log('=== Loops Aninhados ===');
// compile templateAninhado

console.log('\n=== Contexto Pai (../) ===');
// compile templateContextoPai

console.log('\n=== Contexto Raiz (../../) ===');
// compile templateContextoRaiz

console.log('\n=== Aprovacao ===');
// compile templateAprovacao

console.log('\n--- Exercicio 9 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex9-loops-aninhados.ts');
