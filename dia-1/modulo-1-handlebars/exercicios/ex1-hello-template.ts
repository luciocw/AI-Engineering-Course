/**
 * Exercicio 1: Primeiro Template
 *
 * Aprenda o basico do Handlebars: compilar templates e inserir variaveis.
 * Este e o ponto de partida - {{variavel}} e Handlebars.compile().
 * Execute: npx tsx exercicios/ex1-hello-template.ts
 */

import Handlebars from 'handlebars';

// === Dados simples ===
const saudacao = {
  nome: 'Mundo',
};

// === TODO 1: Crie e compile seu primeiro template ===
// 1. Crie uma string de template: "Ola, {{nome}}!"
// 2. Use Handlebars.compile() para compilar o template
// 3. Passe o objeto `saudacao` para o template compilado
// 4. Imprima o resultado com console.log()
//
// Exemplo de output esperado:
// "Ola, Mundo!"

// const template = ...
// const compilado = Handlebars.compile(template);
// const resultado = compilado(saudacao);
// console.log(resultado);

// === TODO 2: Teste com dados diferentes ===
// Passe um objeto diferente para o MESMO template compilado.
// Exemplo: { nome: 'TypeScript' } -> "Ola, TypeScript!"
//
// Dica: voce nao precisa recompilar o template.
// Basta chamar a funcao compilada com novos dados.

// console.log(compilado({ nome: 'TypeScript' }));

// === TODO 3: Template com multiplas variaveis ===
// Crie um NOVO template com 2 variaveis: linguagem e framework.
// Dados: { linguagem: 'TypeScript', framework: 'Handlebars' }
// Template: "Estou aprendendo {{framework}} com {{linguagem}}!"
//
// Exemplo de output esperado:
// "Estou aprendendo Handlebars com TypeScript!"

const aprendizado = {
  linguagem: 'TypeScript',
  framework: 'Handlebars',
};

// const templateAprendizado = ...
// const compiladoAprendizado = ...
// console.log(compiladoAprendizado(aprendizado));

console.log('\n--- Exercicio 1 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex1-hello-template.ts');
