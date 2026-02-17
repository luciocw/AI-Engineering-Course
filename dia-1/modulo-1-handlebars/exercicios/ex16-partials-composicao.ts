/**
 * Exercicio 16: Partials e Composicao
 *
 * Aprenda a usar registerPartial(), partials dinamicos e passagem de contexto.
 * Voce ja domina helpers e subexpressoes (ex13-ex15). Agora componha templates reutilizaveis.
 * Execute: npx tsx exercicios/ex16-partials-composicao.ts
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

// === TODO 1: Registre um partial para cabecalho ===
// Crie um partial chamado 'cabecalho' que exibe o titulo da pagina.
//
// Uso no template: {{> cabecalho}}
// Saida: "========== Dashboard AI =========="
//
// Dica: Handlebars.registerPartial('cabecalho', '========== {{titulo}} ==========')

// TODO: Registre o partial 'cabecalho' aqui

// === TODO 2: Registre um partial para notificacao ===
// Crie um partial chamado 'notificacao' que exibe cada notificacao
// com um icone diferente baseado no tipo:
//   sucesso -> [OK]
//   alerta  -> [!!]
//   erro    -> [XX]
//
// Uso: {{#each notificacoes}}{{> notificacao}}{{/each}}
// Saida: "[OK] Modelo treinado com sucesso"
//
// Dica: use {{#if}} dentro do partial para verificar o tipo.
// Handlebars.registerPartial('notificacao', '{{#if ...}}...')

// TODO: Registre o partial 'notificacao' aqui

// === TODO 3: Registre um partial com contexto especifico ===
// Crie um partial chamado 'userCard' que exibe dados do usuario.
// O partial recebe o objeto usuario como contexto.
//
// Uso: {{> userCard usuario}}
// Saida:
//   "[M] Maria"
//   "Papel: admin"
//
// Dica: quando voce passa {{> userCard usuario}}, dentro do partial
// 'this' se refere ao objeto usuario. Use {{nome}}, {{avatar}}, {{papel}}.

// TODO: Registre o partial 'userCard' aqui

// === TODO 4: Partial dinamico ===
// Partials dinamicos permitem escolher qual partial renderizar em tempo de execucao.
// Use {{> (lookup . "tipoParcial")}} para selecionar o partial baseado em uma propriedade.
//
// Crie dois partials: 'viewAdmin' e 'viewUser'.
// - viewAdmin: "Painel Admin: {{metricas.modelos}} modelos | {{metricas.requests}} requests"
// - viewUser: "Bem-vindo! Seus modelos: {{metricas.modelos}}"
//
// No template, use a propriedade tipoParcial para decidir qual renderizar.
//
// Dica: adicione tipoParcial aos dados:
//   const dadosComTipo = { ...pagina, tipoParcial: 'viewAdmin' };

// TODO: Registre os partials 'viewAdmin' e 'viewUser' aqui

// === TODO 5: Partial com parametros ===
// Partials podem receber parametros inline usando a sintaxe:
//   {{> nomePartial param1="valor1" param2=variavel}}
//
// Crie um partial chamado 'metrica' que exibe um label e valor formatados.
// Uso:
//   {{> metrica label="Modelos" valor=metricas.modelos}}
//   {{> metrica label="Requests" valor=metricas.requests}}
//   {{> metrica label="Uptime" valor=metricas.uptime}}
//
// Saida:
//   "[ Modelos ]: 12"
//   "[ Requests ]: 45000"
//   "[ Uptime ]: 99.9%"
//
// Dica: dentro do partial, os parametros ficam disponiveis como {{label}} e {{valor}}.

// TODO: Registre o partial 'metrica' aqui

// === Template principal que usa todos os partials ===
const templatePagina = `
TODO: Crie um template que combina todos os partials:
1. {{> cabecalho}} no topo
2. {{> userCard usuario}} para o cartao do usuario
3. {{#each notificacoes}}{{> notificacao}}{{/each}} para notificacoes
4. {{> (lookup . "tipoParcial")}} para a view dinamica
5. {{> metrica label="..." valor=...}} para cada metrica
`;

// === Compile e teste ===

const dadosComTipo = { ...pagina, tipoParcial: 'viewAdmin' };

console.log('=== Pagina Completa (Admin) ===');
// TODO: compile templatePagina com dadosComTipo e exiba

const dadosUser = { ...pagina, tipoParcial: 'viewUser', usuario: { nome: 'Joao', avatar: 'J', papel: 'user' } };

console.log('\n=== Pagina Completa (User) ===');
// TODO: compile templatePagina com dadosUser e exiba

console.log('\n--- Exercicio 16 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex16-partials-composicao.ts');
