/**
 * Exercicio 4: HTML Escaping e Triple-Stash
 *
 * Entenda a diferenca entre {{}} (escapado) e {{{}}} (raw HTML).
 * Seguranca e fundamental - Handlebars escapa HTML por padrao para prevenir XSS.
 * Execute: npx tsx exercicios/ex4-expressoes-seguras.ts
 */

import Handlebars from 'handlebars';

// === Dados com conteudo HTML ===
const conteudo = {
  titulo: 'Aprenda AI Engineering',
  descricao: '<strong>Curso completo</strong> de AI com <em>pratica real</em>',
  scriptMalicioso: '<script>alert("hackeado!")</script>',
  link: '<a href="https://exemplo.com">Clique aqui</a>',
};

// === TODO 1: Use {{descricao}} (escapado) ===
// Crie um template que use {{descricao}} com chaves duplas (padrao).
// Observe que o HTML aparece como texto (entidades HTML).
//
// Exemplo de output esperado:
// "Descricao: &lt;strong&gt;Curso completo&lt;/strong&gt; de AI com &lt;em&gt;pratica real&lt;/em&gt;"
//
// Dica: {{variavel}} ESCAPA o HTML automaticamente. Isso e seguro.

const templateEscapado = `
TODO: Crie template usando {{descricao}} com chaves duplas
`;

// === TODO 2: Use {{{descricao}}} (raw HTML) ===
// Crie um template que use {{{descricao}}} com chaves TRIPLAS.
// Agora o HTML e renderizado como HTML real.
//
// Exemplo de output esperado:
// "Descricao: <strong>Curso completo</strong> de AI com <em>pratica real</em>"
//
// Dica: {{{variavel}}} NAO escapa o HTML. Use com cuidado!

const templateRaw = `
TODO: Crie template usando {{{descricao}}} com chaves triplas
`;

// === TODO 3: Teste de seguranca com script malicioso ===
// Crie DOIS templates para o campo scriptMalicioso:
// 1. Um com {{scriptMalicioso}} (escapado - SEGURO)
// 2. Um com {{{scriptMalicioso}}} (raw - PERIGOSO)
//
// Compare os outputs e entenda por que {{}} e o padrao seguro.
// Em um navegador, o template raw executaria o script malicioso!
//
// Tambem teste com o campo `link` para ver a diferenca.

const templateSeguro = `
TODO: Crie template escapado para scriptMalicioso e link
`;

const templatePerigoso = `
TODO: Crie template raw para scriptMalicioso e link
`;

// === Compile e teste ===
// Descomente e complete o codigo abaixo:

// console.log('=== TODO 1: HTML Escapado (Seguro) ===');
// const comp1 = Handlebars.compile(templateEscapado);
// console.log(comp1(conteudo));

// console.log('\n=== TODO 2: HTML Raw (Sem escape) ===');
// const comp2 = Handlebars.compile(templateRaw);
// console.log(comp2(conteudo));

// console.log('\n=== TODO 3: Seguranca - Script Malicioso ===');
// console.log('Escapado (seguro):');
// const comp3 = Handlebars.compile(templateSeguro);
// console.log(comp3(conteudo));

// console.log('\nRaw (perigoso):');
// const comp4 = Handlebars.compile(templatePerigoso);
// console.log(comp4(conteudo));

console.log('\n--- Exercicio 4 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex4-expressoes-seguras.ts');
