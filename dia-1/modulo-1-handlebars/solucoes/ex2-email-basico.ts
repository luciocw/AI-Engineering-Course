/**
 * Solucao - Exercicio 2: Template de Email
 */

import Handlebars from 'handlebars';

// Helper para URL-encode seguro (previne parameter pollution)
Handlebars.registerHelper('urlEncode', (value: string) => encodeURIComponent(value));

const usuario = {
  nome: 'Maria Silva',
  email: 'maria@exemplo.com',
  produto: 'Curso AI Engineering',
  preco: 497,
};

// Solucao TODO 1: Template de boas-vindas
const templateEmail = `Ola {{nome}}!

Obrigado por comprar {{produto}}.
Valor: R\${{preco}}.
Enviaremos detalhes para {{email}}.`;

// Solucao TODO 2: Compile e gere resultado
const compilado = Handlebars.compile(templateEmail);
const resultado = compilado(usuario);

console.log('=== Email de Boas-Vindas ===');
console.log(resultado);

// Solucao TODO 3: Template de lembrete
const templateLembrete = `{{nome}}, seu acesso ao {{produto}} expira em 7 dias!

Renove agora para continuar aprendendo.
Link: https://exemplo.com/renovar?email={{urlEncode email}}`;

const compiladoLembrete = Handlebars.compile(templateLembrete);
const resultadoLembrete = compiladoLembrete(usuario);

console.log('\n=== Email de Lembrete ===');
console.log(resultadoLembrete);

// Bonus: template com HTML
const templateHtml = `<div style="font-family: sans-serif;">
  <h1>Bem-vindo, {{nome}}!</h1>
  <p>Seu produto: <strong>{{produto}}</strong></p>
  <p>Valor pago: <strong>R\${{preco}}</strong></p>
  <a href="mailto:{{email}}">Contato</a>
</div>`;

const compiladoHtml = Handlebars.compile(templateHtml);
console.log('\n=== Email HTML ===');
console.log(compiladoHtml(usuario));
