/**
 * Exercicio 3: Loops com {{#each}}
 *
 * Aprenda a iterar sobre arrays e objetos com Handlebars.
 * Execute: npx tsx exercicios/ex3-loops.ts
 */

import Handlebars from 'handlebars';

// === Dados: catalogo de produtos ===
const catalogo = {
  loja: 'AI Tools Store',
  produtos: [
    { nome: 'Claude API Credits', preco: 50, estoque: true, tags: ['ai', 'api'] },
    { nome: 'Vector DB Hosting', preco: 70, estoque: true, tags: ['database', 'cloud'] },
    { nome: 'GPU Training Hours', preco: 200, estoque: false, tags: ['training', 'gpu'] },
    { nome: 'LangSmith Pro', preco: 35, estoque: true, tags: ['monitoring', 'observability'] },
  ],
  categorias: {
    ai: 'Inteligencia Artificial',
    database: 'Banco de Dados',
    training: 'Treinamento',
    monitoring: 'Monitoramento',
  },
};

// === TODO 1: Liste todos os produtos ===
// Use {{#each produtos}} para iterar.
// Mostre nome e preco de cada produto.
// Use {{@index}} para numero da linha.
//
// Output esperado:
// "1. Claude API Credits - R$50"
// "2. Vector DB Hosting - R$70"
// ...

const templateLista = `
TODO: Crie template com each para listar produtos
`;

// === TODO 2: Filtre produtos em estoque ===
// Use {{#if estoque}} dentro do {{#each}} para mostrar
// apenas produtos disponiveis.

const templateEstoque = `
TODO: Crie template combinando each + if
`;

// === TODO 3: Loop aninhado - mostre tags de cada produto ===
// Para cada produto, itere sobre suas tags.
//
// Output esperado:
// "Claude API Credits: [ai] [api]"
// "Vector DB Hosting: [database] [cloud]"

const templateTags = `
TODO: Crie template com loops aninhados
`;

// === TODO 4: Itere sobre objeto (categorias) ===
// Use {{#each categorias}} com {{@key}} e {{this}}.
//
// Output esperado:
// "ai -> Inteligencia Artificial"
// "database -> Banco de Dados"

const templateCategorias = `
TODO: Crie template iterando sobre objeto
`;

// === Compile e teste ===
// TODO: compile cada template e exiba o resultado

console.log('\n--- Exercicio 3 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex3-loops.ts');
