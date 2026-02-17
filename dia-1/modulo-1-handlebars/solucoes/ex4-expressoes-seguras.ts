/**
 * Solucao - Exercicio 4: HTML Escaping e Triple-Stash
 */

import Handlebars from 'handlebars';

const conteudo = {
  titulo: 'Aprenda AI Engineering',
  descricao: '<strong>Curso completo</strong> de AI com <em>pratica real</em>',
  scriptMalicioso: '<script>alert("hackeado!")</script>',
  link: '<a href="https://exemplo.com">Clique aqui</a>',
};

// Solucao TODO 1: {{descricao}} - HTML escapado (SEGURO)
// Chaves duplas {{}} escapam automaticamente caracteres HTML.
// < vira &lt;  > vira &gt;  " vira &quot;  & vira &amp;
const templateEscapado = `Titulo: {{titulo}}
Descricao: {{descricao}}`;

console.log('=== TODO 1: HTML Escapado (Seguro) ===');
const comp1 = Handlebars.compile(templateEscapado);
console.log(comp1(conteudo));
// O HTML aparece como texto - tags sao visiveis mas nao executadas.

// Solucao TODO 2: {{{descricao}}} - HTML raw (sem escape)
// Chaves triplas {{{}}} renderizam o HTML como esta.
// Use APENAS quando voce confia na fonte dos dados.
const templateRaw = `Titulo: {{titulo}}
Descricao: {{{descricao}}}`;

console.log('\n=== TODO 2: HTML Raw (Sem escape) ===');
const comp2 = Handlebars.compile(templateRaw);
console.log(comp2(conteudo));
// O HTML aparece como HTML real - tags sao interpretadas.

// Solucao TODO 3: Teste de seguranca
// IMPORTANTE: Essa e a razao principal do escape automatico.
// Se um usuario injetasse um <script>, ele seria executado em um navegador!

const templateSeguro = `Script (escapado): {{scriptMalicioso}}
Link (escapado): {{link}}`;

const templatePerigoso = `Script (raw): {{{scriptMalicioso}}}
Link (raw): {{{link}}}`;

console.log('\n=== TODO 3: Comparacao de Seguranca ===');

console.log('\n--- ESCAPADO (seguro) ---');
const comp3 = Handlebars.compile(templateSeguro);
console.log(comp3(conteudo));
// O script aparece como texto inofensivo: &lt;script&gt;alert(...)&lt;/script&gt;

console.log('\n--- RAW (perigoso) ---');
const comp4 = Handlebars.compile(templatePerigoso);
console.log(comp4(conteudo));
// O script aparece como HTML real: <script>alert("hackeado!")</script>
// Em um navegador, isso EXECUTARIA o JavaScript malicioso!

// === Resumo de Seguranca ===
console.log('\n=== Resumo ===');
console.log('{{variavel}}   -> Escapa HTML (SEGURO - use por padrao)');
console.log('{{{variavel}}} -> HTML raw (PERIGOSO - use apenas com dados confiaveis)');
console.log('');
console.log('Regra: SEMPRE use {{}} a menos que voce tenha certeza absoluta');
console.log('de que o conteudo e seguro e voce PRECISA do HTML renderizado.');
console.log('Isso previne ataques XSS (Cross-Site Scripting).');
