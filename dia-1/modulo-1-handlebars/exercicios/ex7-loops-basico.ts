/**
 * Exercicio 7: Loops com Each
 *
 * Aprenda a iterar sobre arrays com {{#each}}, usando @index, @first e @last.
 * Voce ja domina condicionais (ex5-ex6). Agora itere sobre listas.
 * Execute: npx tsx exercicios/ex7-loops-basico.ts
 */

import Handlebars from 'handlebars';

// === Dados do catalogo ===
const catalogo = {
  loja: 'AI Tools Store',
  produtos: [
    { nome: 'Claude API Credits', preco: 50, estoque: true, tags: ['ai', 'api'] },
    { nome: 'Vector DB Hosting', preco: 70, estoque: true, tags: ['database', 'cloud'] },
    { nome: 'GPU Training Hours', preco: 200, estoque: false, tags: ['training', 'gpu'] },
    { nome: 'LangSmith Pro', preco: 35, estoque: true, tags: ['monitoring', 'observability'] },
  ],
};

// === TODO 1: Liste produtos com {{#each}} e {{@index}} ===
// Crie um template que liste todos os produtos com numero (indice).
// Use {{@index}} para acessar o indice do item atual (comeca em 0).
//
// Exemplo de output esperado:
// "Catalogo: AI Tools Store
//  0. Claude API Credits - R$50
//  1. Vector DB Hosting - R$70
//  2. GPU Training Hours - R$200
//  3. LangSmith Pro - R$35"
//
// Dica: dentro de {{#each produtos}}, use {{@index}} para o numero
// e {{nome}}, {{preco}} para os dados do produto.

const templateLista = `
TODO: Crie template listando produtos com @index
`;

// === TODO 2: Filtre com {{#if}} dentro de {{#each}} ===
// Combine each + if para mostrar apenas produtos em estoque.
//
// Exemplo de output esperado:
// "Produtos disponiveis:
//  - Claude API Credits (R$50) - EM ESTOQUE
//  - Vector DB Hosting (R$70) - EM ESTOQUE
//  - LangSmith Pro (R$35) - EM ESTOQUE
//  Produtos esgotados:
//  - GPU Training Hours (R$200) - ESGOTADO"
//
// Dica: use {{#if estoque}} dentro de {{#each produtos}}

const templateFiltrado = `
TODO: Crie template combinando each + if para filtrar por estoque
`;

// === TODO 3: Use {{@first}} e {{@last}} para formatacao especial ===
// Adicione marcadores especiais no primeiro e ultimo item.
//
// Exemplo de output esperado:
// "[DESTAQUE] Claude API Credits - R$50
//  Vector DB Hosting - R$70
//  GPU Training Hours - R$200
//  [ULTIMO] LangSmith Pro - R$35"
//
// Dica: {{#if @first}}[DESTAQUE]{{/if}} e {{#if @last}}[ULTIMO]{{/if}}

const templateFormatado = `
TODO: Crie template usando @first e @last
`;

// === TODO 4: {{else}} dentro de {{#each}} para array vazia ===
// O que acontece quando a lista esta vazia?
// Use {{else}} dentro de {{#each}} como fallback.
//
// Exemplo de output esperado (com array vazia):
// "Nenhum produto encontrado."
//
// Dica: {{#each itens}}...{{else}}Nenhum item.{{/each}}

const catalogoVazio = {
  loja: 'Loja Nova',
  produtos: [],
};

const templateComElse = `
TODO: Crie template com {{else}} dentro de {{#each}} para lista vazia
`;

// === Compile e teste ===
// Descomente e complete o codigo abaixo:

// console.log('=== TODO 1: Lista com @index ===');
// const comp1 = Handlebars.compile(templateLista);
// console.log(comp1(catalogo));

// console.log('\n=== TODO 2: Filtrado por estoque ===');
// const comp2 = Handlebars.compile(templateFiltrado);
// console.log(comp2(catalogo));

// console.log('\n=== TODO 3: @first e @last ===');
// const comp3 = Handlebars.compile(templateFormatado);
// console.log(comp3(catalogo));

// console.log('\n=== TODO 4: Array vazia ===');
// const comp4 = Handlebars.compile(templateComElse);
// console.log('Com produtos:', comp4(catalogo));
// console.log('Sem produtos:', comp4(catalogoVazio));

console.log('\n--- Exercicio 7 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex7-loops-basico.ts');
