/**
 * Exercicio 14: Block Helpers
 *
 * Aprenda a criar block helpers com options.fn(), options.inverse() e options.hash.
 * Voce ja domina helpers simples (ex13). Agora crie helpers que controlam blocos inteiros.
 * Execute: npx tsx exercicios/ex14-block-helpers.ts
 */

import Handlebars from 'handlebars';

// === Dados da aplicacao ===
const dados = {
  usuario: { nome: 'Pedro', papel: 'admin', autenticado: true },
  itens: [
    { nome: 'Laptop', preco: 4500, disponivel: true },
    { nome: 'Monitor', preco: 2200, disponivel: false },
    { nome: 'Teclado', preco: 350, disponivel: true },
    { nome: 'Mouse', preco: 150, disponivel: true },
  ],
  config: { debug: false, tema: 'escuro' },
};

// === TODO 1: Block helper #autorizado ===
// Crie um block helper que renderiza o conteudo somente se o usuario
// tiver o papel (role) especificado via hash.
// Se nao tiver, renderiza o bloco {{else}}.
//
// Uso no template:
//   {{#autorizado usuario papel="admin"}}
//     Painel administrativo: Bem-vindo, {{usuario.nome}}!
//   {{else}}
//     Acesso negado. Papel necessario: admin
//   {{/autorizado}}
//
// Dica: o primeiro argumento e o objeto usuario.
// options.hash.papel contem o papel exigido.
// Use options.fn(this) para renderizar o bloco principal.
// Use options.inverse(this) para renderizar o bloco {{else}}.

// TODO: Registre o block helper 'autorizado' aqui

// === TODO 2: Block helper #lista ===
// Crie um block helper que envolve itens em uma lista formatada
// com cabecalho e rodape.
//
// Uso no template:
//   {{#lista itens titulo="Produtos"}}
//     - {{nome}} - R${{preco}}
//   {{/lista}}
//
// Saida esperada:
//   === Produtos (4 itens) ===
//   - Laptop - R$4500
//   - Monitor - R$2200
//   - Teclado - R$350
//   - Mouse - R$150
//   === Fim ===
//
// Dica: itere sobre o array manualmente dentro do helper.
// Para cada item, chame options.fn(item) para renderizar o bloco.
// Concatene os resultados com cabecalho e rodape.

// TODO: Registre o block helper 'lista' aqui

// === TODO 3: Block helper #repetir ===
// Crie um block helper que repete o conteudo N vezes.
// Disponibilize @index como variavel de dados dentro do bloco.
//
// Uso no template:
//   {{#repetir 3}}
//     Linha {{@index}}
//   {{/repetir}}
//
// Saida esperada:
//   Linha 0
//   Linha 1
//   Linha 2
//
// Dica: use um loop for de 0 ate n.
// Para injetar @index, crie um objeto data:
//   const data = Handlebars.createFrame(options.data);
//   data.index = i;
//   resultado += options.fn(this, { data });

// TODO: Registre o block helper 'repetir' aqui

// === TODO 4: Block helper #filtrarPor ===
// Crie um block helper que filtra um array e renderiza apenas os itens
// que correspondem ao criterio.
//
// Uso no template:
//   {{#filtrarPor itens "disponivel" true}}
//     {{nome}} - disponivel
//   {{/filtrarPor}}
//
// Saida esperada (apenas itens com disponivel === true):
//   Laptop - disponivel
//   Teclado - disponivel
//   Mouse - disponivel
//
// Dica: o primeiro argumento e o array, o segundo e o nome da propriedade,
// o terceiro e o valor esperado.
// Filtre o array e chame options.fn(item) para cada item que passa no filtro.
// Se nenhum item passar, use options.inverse(this).

// TODO: Registre o block helper 'filtrarPor' aqui

// === Template principal que usa todos os block helpers ===
const templatePrincipal = `
TODO: Crie um template que use todos os 4 block helpers:
1. {{#autorizado}} para verificar acesso
2. {{#lista}} para exibir os itens
3. {{#repetir}} para repetir um separador
4. {{#filtrarPor}} para mostrar apenas itens disponiveis
`;

// === Compile e teste ===
// TODO: compile o template e exiba o resultado

console.log('=== Block Helpers ===');
// compile templatePrincipal e exiba

// Teste com usuario sem permissao
const dadosSemPermissao = {
  ...dados,
  usuario: { nome: 'Julia', papel: 'viewer', autenticado: true },
};

console.log('\n=== Teste sem Permissao ===');
// compile templatePrincipal com dadosSemPermissao e exiba

console.log('\n--- Exercicio 14 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex14-block-helpers.ts');
