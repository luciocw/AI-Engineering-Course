/**
 * Solucao - Exercicio 5: Condicionais Basicas
 */

import Handlebars from 'handlebars';

const usuarios = [
  { nome: 'Ana', plano: 'premium', ativo: true, creditos: 100 },
  { nome: 'Bruno', plano: 'basico', ativo: true, creditos: 10 },
  { nome: 'Carla', plano: 'premium', ativo: false, creditos: 0 },
  { nome: 'Diego', plano: '', ativo: false, creditos: 0 },
];

// Solucao TODO 1: {{#if}} basico
const templatePlano = `{{#if plano}}Plano: {{plano}}{{else}}Sem plano ativo{{/if}}`;

// Solucao TODO 2: Multiplas condicoes
// Handlebars nao tem && nativo, entao usamos helpers ou ifs aninhados.

// Helper para comparacao de igualdade (type-safe)
Handlebars.registerHelper('eq', (a: unknown, b: unknown) => {
  if (typeof a !== typeof b) return false;
  return a === b;
});

const templateAcesso = `{{#if ativo}}{{#if (eq plano "premium")}}Acesso VIP liberado{{else}}Plano basico ativo{{/if}}{{else}}{{#if (eq plano "premium")}}Renove seu plano premium{{else}}{{#if plano}}Seu plano {{plano}} esta inativo{{else}}Assine agora{{/if}}{{/if}}{{/if}}`;

// Solucao TODO 3: {{#unless}}
const templateCreditos = `{{#unless creditos}}Alerta: voce nao tem creditos! Recarregue agora.{{else}}Creditos disponiveis: {{creditos}}{{/unless}}`;

// Compile e teste com todos usuarios
const compiladoPlano = Handlebars.compile(templatePlano);
const compiladoAcesso = Handlebars.compile(templateAcesso);
const compiladoCreditos = Handlebars.compile(templateCreditos);

for (const usuario of usuarios) {
  console.log(`\n=== ${usuario.nome} ===`);
  console.log(`  Plano: ${compiladoPlano(usuario)}`);
  console.log(`  Acesso: ${compiladoAcesso(usuario)}`);
  console.log(`  Creditos: ${compiladoCreditos(usuario)}`);
}
