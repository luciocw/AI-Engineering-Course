/**
 * Solucao - Exercicio 14: Block Helpers
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

// Solucao TODO 1: Block helper #autorizado
Handlebars.registerHelper('autorizado', function (
  this: unknown,
  usuario: { papel: string },
  options: Handlebars.HelperOptions,
) {
  const papelExigido = options.hash.papel as string;
  if (usuario && usuario.papel === papelExigido) {
    return options.fn(this);
  }
  return options.inverse(this);
});

// Solucao TODO 2: Block helper #lista
Handlebars.registerHelper('lista', function (
  this: unknown,
  itens: unknown[],
  options: Handlebars.HelperOptions,
) {
  const titulo = (options.hash.titulo as string) || 'Lista';
  let resultado = `=== ${titulo} (${itens.length} itens) ===\n`;

  for (const item of itens) {
    resultado += options.fn(item);
  }

  resultado += '=== Fim ===';
  return resultado;
});

// Solucao TODO 3: Block helper #repetir
Handlebars.registerHelper('repetir', function (
  this: unknown,
  n: number,
  options: Handlebars.HelperOptions,
) {
  let resultado = '';
  for (let i = 0; i < n; i++) {
    const data = Handlebars.createFrame(options.data);
    data.index = i;
    resultado += options.fn(this, { data });
  }
  return resultado;
});

// Solucao TODO 4: Block helper #filtrarPor
Handlebars.registerHelper('filtrarPor', function (
  this: unknown,
  itens: Record<string, unknown>[],
  propriedade: string,
  valor: unknown,
  options: Handlebars.HelperOptions,
) {
  const filtrados = itens.filter((item) => item[propriedade] === valor);

  if (filtrados.length > 0) {
    let resultado = '';
    for (const item of filtrados) {
      resultado += options.fn(item);
    }
    return resultado;
  }
  return options.inverse(this);
});

// Template principal que usa todos os block helpers
const templatePrincipal = `{{#autorizado usuario papel="admin"}}Painel Administrativo - Bem-vindo, {{usuario.nome}}!

{{#lista itens titulo="Produtos"}}  - {{nome}} - R${{preco}}
{{/lista}}

Separador:
{{#repetir 3}}---[{{@index}}]---
{{/repetir}}
Itens disponiveis:
{{#filtrarPor itens "disponivel" true}}  [OK] {{nome}} - R${{preco}}
{{else}}  Nenhum item disponivel.
{{/filtrarPor}}{{else}}Acesso negado. Papel necessario: admin
Voce esta logado como: {{usuario.nome}} ({{usuario.papel}}){{/autorizado}}`;

// Compile e teste
const compilado = Handlebars.compile(templatePrincipal);

console.log('=== Block Helpers ===');
console.log(compilado(dados));

// Teste com usuario sem permissao
const dadosSemPermissao = {
  ...dados,
  usuario: { nome: 'Julia', papel: 'viewer', autenticado: true },
};

console.log('\n=== Teste sem Permissao ===');
console.log(compilado(dadosSemPermissao));

// Teste filtrarPor com nenhum resultado
const dadosSemDisponiveis = {
  ...dados,
  itens: dados.itens.map((item) => ({ ...item, disponivel: false })),
};

console.log('\n=== Teste Nenhum Disponivel ===');
const templateFiltro = `{{#filtrarPor itens "disponivel" true}}  [OK] {{nome}}
{{else}}  Nenhum item disponivel no momento.
{{/filtrarPor}}`;
const compiladoFiltro = Handlebars.compile(templateFiltro);
console.log(compiladoFiltro(dadosSemDisponiveis));
