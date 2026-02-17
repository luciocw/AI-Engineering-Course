/**
 * Solucao - Exercicio 1: Primeiro Template
 */

import Handlebars from 'handlebars';

const saudacao = {
  nome: 'Mundo',
};

// Solucao TODO 1: Crie e compile seu primeiro template
const template = 'Ola, {{nome}}!';
const compilado = Handlebars.compile(template);
const resultado = compilado(saudacao);

console.log('=== TODO 1: Primeiro Template ===');
console.log(resultado);
// Output: "Ola, Mundo!"

// Solucao TODO 2: Reutilize o template com dados diferentes
console.log('\n=== TODO 2: Reutilizando o Template ===');
console.log(compilado({ nome: 'TypeScript' }));
// Output: "Ola, TypeScript!"

console.log(compilado({ nome: 'AI Engineering' }));
// Output: "Ola, AI Engineering!"

// Nota: o template foi compilado UMA vez e reutilizado varias vezes.
// Isso e eficiente - compile uma vez, use quantas vezes quiser.

// Solucao TODO 3: Template com multiplas variaveis
const aprendizado = {
  linguagem: 'TypeScript',
  framework: 'Handlebars',
};

const templateAprendizado = 'Estou aprendendo {{framework}} com {{linguagem}}!';
const compiladoAprendizado = Handlebars.compile(templateAprendizado);

console.log('\n=== TODO 3: Multiplas Variaveis ===');
console.log(compiladoAprendizado(aprendizado));
// Output: "Estou aprendendo Handlebars com TypeScript!"

// Bonus: o que acontece quando uma variavel nao existe nos dados?
console.log('\n=== Bonus: Variavel ausente ===');
console.log(compilado({}));
// Output: "Ola, !" - Handlebars simplesmente ignora variaveis ausentes
