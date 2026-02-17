/**
 * Solucao - Exercicio 9: Loops Aninhados
 */

import Handlebars from 'handlebars';

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

// Solucao TODO 1: Loops aninhados
const templateAninhado = `{{#each turmas}}{{nome}}:
{{#each alunos}}  - {{nome}} (nota: {{nota}})
{{/each}}
{{/each}}`;

// Solucao TODO 2: Contexto pai com ../
const templateContextoPai = `{{#each turmas}}{{nome}}:
{{#each alunos}}  Aluno {{nome}} ({{../professor}})
{{/each}}
{{/each}}`;

// Solucao TODO 3: Contexto raiz com ../../
const templateContextoRaiz = `{{#each turmas}}{{#each alunos}}{{nome}} estuda na {{../../nome}}
{{/each}}{{/each}}`;

// Solucao TODO 4: Helper 'aprovado'
Handlebars.registerHelper('aprovado', function (nota: number) {
  return nota >= 7 ? 'Aprovado' : 'Reprovado';
});

// Template combinando tudo: loops aninhados + contexto pai + helper
const templateAprovacao = `=== Relatorio {{nome}} ===
{{#each turmas}}
{{nome}} ({{professor}}):
{{#each alunos}}  {{nome}} - {{nota}} - {{aprovado nota}} [Escola: {{../../nome}}]
{{/each}}{{/each}}`;

// Compile e teste
const compiladoAninhado = Handlebars.compile(templateAninhado);
console.log('=== Loops Aninhados ===');
console.log(compiladoAninhado(escola));

const compiladoContextoPai = Handlebars.compile(templateContextoPai);
console.log('=== Contexto Pai (../) ===');
console.log(compiladoContextoPai(escola));

const compiladoContextoRaiz = Handlebars.compile(templateContextoRaiz);
console.log('=== Contexto Raiz (../../) ===');
console.log(compiladoContextoRaiz(escola));

const compiladoAprovacao = Handlebars.compile(templateAprovacao);
console.log('=== Aprovacao ===');
console.log(compiladoAprovacao(escola));
