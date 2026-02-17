/**
 * Solucao - Exercicio 18: Template Inheritance (Heranca de Templates)
 */

import Handlebars from 'handlebars';

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

// Solucao TODO 1: Partial "layout"
Handlebars.registerPartial(
  'layout',
  `<!DOCTYPE html>
<html>
<head><title>{{titulo}}</title></head>
<body>
  <header>{{titulo}}</header>
  <main>{{> @partial-block}}</main>
  <footer>(c) {{footer.ano}} {{footer.empresa}}</footer>
</body>
</html>`
);

// Solucao TODO 2: Partials de conteudo para cada tipo
Handlebars.registerPartial(
  'hero',
  `<section class="hero"><h1>{{texto}}</h1></section>`
);

Handlebars.registerPartial(
  'features',
  `<section class="features"><ul>{{#each itens}}<li>{{this}}</li>{{/each}}</ul></section>`
);

Handlebars.registerPartial(
  'cta',
  `<section class="cta"><a href="{{link}}">{{texto}}</a></section>`
);

Handlebars.registerPartial(
  'breadcrumb',
  `<nav>{{#each caminho}}{{#unless @first}} > {{/unless}}{{this}}{{/each}}</nav>`
);

Handlebars.registerPartial(
  'licao',
  `<section class="licao"><h2>{{titulo}}</h2><progress value="{{progresso}}" max="100"></progress> {{progresso}}%</section>`
);

// Solucao TODO 3: Helper para renderizar blocos de conteudo
Handlebars.registerHelper('renderBloco', function (bloco: { tipo: string }) {
  const partial = Handlebars.partials[bloco.tipo];
  if (partial) {
    const template = typeof partial === 'string' ? Handlebars.compile(partial) : partial;
    return new Handlebars.SafeString(template(bloco));
  }
  return '';
});

// Solucao TODO 4: Template da pagina Home usando o layout
const templateHome = `{{#> layout}}
{{#each conteudo}}
    {{{renderBloco this}}}
{{/each}}
{{/layout}}`;

// Solucao TODO 5: Template da pagina Curso usando o mesmo layout
const templateCurso = `{{#> layout}}
{{#each conteudo}}
    {{{renderBloco this}}}
{{/each}}
{{/layout}}`;

// Compile e teste
const compiladoHome = Handlebars.compile(templateHome);
console.log('=== Pagina Home ===');
console.log(compiladoHome(paginaHome));

const compiladoCurso = Handlebars.compile(templateCurso);
console.log('\n=== Pagina Curso ===');
console.log(compiladoCurso(paginaCurso));

// Demonstracao: a mesma estrutura (layout) com conteudo diferente
console.log('\n=== Demonstracao de Reutilizacao ===');
console.log('Ambas as paginas usam o mesmo layout partial.');
console.log('O layout define header, main e footer.');
console.log('O conteudo e injetado via @partial-block.');
console.log('Cada tipo de bloco (hero, features, cta, breadcrumb, licao) e um partial independente.');
