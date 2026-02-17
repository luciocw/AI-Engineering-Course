/**
 * Solucao - Exercicio 16: Partials e Composicao
 */

import Handlebars from 'handlebars';

// === Dados da pagina ===
const pagina = {
  titulo: 'Dashboard AI',
  usuario: { nome: 'Maria', avatar: 'M', papel: 'admin' },
  notificacoes: [
    { tipo: 'sucesso', mensagem: 'Modelo treinado com sucesso' },
    { tipo: 'alerta', mensagem: 'Uso de tokens acima de 80%' },
    { tipo: 'erro', mensagem: 'Falha ao conectar com API' },
  ],
  metricas: { modelos: 12, requests: 45000, uptime: '99.9%' },
};

// Solucao TODO 1: Partial para cabecalho
Handlebars.registerPartial('cabecalho', '========== {{titulo}} ==========');

// Solucao TODO 2: Partial para notificacao com icone por tipo
Handlebars.registerPartial(
  'notificacao',
  '{{#if (eq tipo "sucesso")}}[OK]{{/if}}{{#if (eq tipo "alerta")}}[!!]{{/if}}{{#if (eq tipo "erro")}}[XX]{{/if}} {{mensagem}}',
);

// Helper eq necessario para os partials
Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);

// Solucao TODO 3: Partial com contexto especifico
Handlebars.registerPartial(
  'userCard',
  '[{{avatar}}] {{nome}}\nPapel: {{papel}}',
);

// Solucao TODO 4: Partials dinamicos
Handlebars.registerPartial(
  'viewAdmin',
  'Painel Admin: {{metricas.modelos}} modelos | {{metricas.requests}} requests | Uptime: {{metricas.uptime}}',
);

Handlebars.registerPartial(
  'viewUser',
  'Bem-vindo! Seus modelos: {{metricas.modelos}}',
);

// Solucao TODO 5: Partial com parametros
Handlebars.registerPartial(
  'metrica',
  '[ {{label}} ]: {{valor}}',
);

// Template principal que usa todos os partials
const templatePagina = `{{> cabecalho}}

--- Usuario ---
{{> userCard usuario}}

--- Notificacoes ---
{{#each notificacoes}}
{{> notificacao}}
{{/each}}

--- Visao ---
{{> (lookup . "tipoParcial")}}

--- Metricas ---
{{> metrica label="Modelos" valor=metricas.modelos}}
{{> metrica label="Requests" valor=metricas.requests}}
{{> metrica label="Uptime" valor=metricas.uptime}}`;

// Compile e teste
const compilado = Handlebars.compile(templatePagina);

const dadosAdmin = { ...pagina, tipoParcial: 'viewAdmin' };
console.log('=== Pagina Completa (Admin) ===');
console.log(compilado(dadosAdmin));

const dadosUser = {
  ...pagina,
  tipoParcial: 'viewUser',
  usuario: { nome: 'Joao', avatar: 'J', papel: 'user' },
};

console.log('\n=== Pagina Completa (User) ===');
console.log(compilado(dadosUser));

// Bonus: partial inline (definido no template)
const templateComInline = `{{#*inline "badge"}}[{{nivel}}]{{/inline}}
{{> badge nivel="PRO"}} {{usuario.nome}} - {{titulo}}`;

const compiladoInline = Handlebars.compile(templateComInline);
console.log('\n=== Partial Inline ===');
console.log(compiladoInline(pagina));
