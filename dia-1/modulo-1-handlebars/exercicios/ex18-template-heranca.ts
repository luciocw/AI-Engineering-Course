/**
 * Exercicio 18: Template Inheritance (Heranca de Templates)
 *
 * Aprenda a criar um layout system usando partials + @partial-block.
 * Voce ja domina partials e helpers (ex10-ex17). Agora construa layouts reutilizaveis.
 * Execute: npx tsx exercicios/ex18-template-heranca.ts
 */

import Handlebars from 'handlebars';

// === Layout system: um padrao comum em engines de template ===
// Handlebars suporta "heranca" via partials + @partial-block.
// Isso permite definir uma estrutura de pagina (layout) e injetar
// conteudo diferente em cada pagina, mantendo header/footer consistentes.

// === Dados da pagina Home ===
const paginaHome = {
  titulo: 'AI Engineering Course',
  descricao: 'Aprenda AI Engineering na pratica',
  conteudo: [
    { tipo: 'hero', texto: 'Domine AI Engineering em 15 dias' },
    { tipo: 'features', itens: ['Handlebars', 'Claude API', 'Tool Use', 'Data Pipelines'] },
    { tipo: 'cta', texto: 'Comece Gratis', link: '/cadastro' },
  ],
  footer: { ano: 2026, empresa: 'AI Engineering Co.' },
};

// === Dados da pagina Curso ===
const paginaCurso = {
  titulo: 'Modulo 1 - Handlebars',
  descricao: 'Templates dinamicos para AI',
  conteudo: [
    { tipo: 'breadcrumb', caminho: ['Home', 'Dia 1', 'Modulo 1'] },
    { tipo: 'licao', titulo: 'Exercicio 1', progresso: 65 },
  ],
  footer: { ano: 2026, empresa: 'AI Engineering Co.' },
};

// === TODO 1: Registre o partial "layout" ===
// O layout define a estrutura HTML da pagina.
// Use {{> @partial-block}} para indicar onde o conteudo sera injetado.
//
// Estrutura esperada:
// <!DOCTYPE html>
// <html>
// <head><title>{{titulo}}</title></head>
// <body>
//   <header>{{titulo}}</header>
//   <main>{{> @partial-block}}</main>
//   <footer>(c) {{footer.ano}} {{footer.empresa}}</footer>
// </body>
// </html>
//
// Dica: Handlebars.registerPartial('layout', `...`)

// TODO: Registre o partial 'layout' aqui

// === TODO 2: Registre partials de conteudo para cada tipo ===
// Crie um partial para cada tipo de bloco de conteudo:
//
// - "hero": exibe o texto em destaque
//   Formato: <section class="hero"><h1>{{texto}}</h1></section>
//
// - "features": lista os itens como <ul><li>
//   Formato: <section class="features"><ul>{{#each itens}}<li>{{this}}</li>{{/each}}</ul></section>
//
// - "cta": botao de call-to-action
//   Formato: <section class="cta"><a href="{{link}}">{{texto}}</a></section>
//
// - "breadcrumb": caminho de navegacao
//   Formato: <nav>{{#each caminho}}{{#unless @first}} > {{/unless}}{{this}}{{/each}}</nav>
//
// - "licao": progresso da licao
//   Formato: <section class="licao"><h2>{{titulo}}</h2><progress value="{{progresso}}" max="100"></progress> {{progresso}}%</section>
//
// Dica: Handlebars.registerPartial('hero', `...`) para cada tipo

// TODO: Registre os partials de conteudo aqui

// === TODO 3: Crie um helper para renderizar blocos de conteudo ===
// O helper "renderBloco" recebe um bloco de conteudo e renderiza
// o partial correspondente ao seu tipo.
//
// Dica: Handlebars.registerHelper('renderBloco', function(bloco) {
//   const partial = Handlebars.partials[bloco.tipo];
//   if (partial) {
//     const template = Handlebars.compile(partial);
//     return new Handlebars.SafeString(template(bloco));
//   }
//   return '';
// });

// TODO: Registre o helper 'renderBloco' aqui

// === TODO 4: Renderize a pagina Home usando o layout ===
// Use {{#> layout}} para "herdar" o layout e injetar conteudo.
// Dentro do bloco, itere sobre conteudo e use o helper renderBloco.
//
// Formato:
// {{#> layout}}
//   {{#each conteudo}}
//     {{{renderBloco this}}}
//   {{/each}}
// {{/> layout}}
//
// Dica: note o uso de {{{ }}} (triple-stache) para nao escapar HTML

const templateHome = `
TODO: Crie template da pagina Home usando {{#> layout}}
`;

// === TODO 5: Renderize a pagina Curso com o MESMO layout ===
// Demonstre a reutilizacao: mesma estrutura, conteudo diferente.

const templateCurso = `
TODO: Crie template da pagina Curso usando {{#> layout}}
`;

// === Compile e teste ===

console.log('=== Pagina Home ===');
// TODO: compile templateHome e renderize com paginaHome

console.log('\n=== Pagina Curso ===');
// TODO: compile templateCurso e renderize com paginaCurso

console.log('\n--- Exercicio 18 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex18-template-heranca.ts');
