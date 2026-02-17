/**
 * Exercicio 8: Iterando Objetos
 *
 * Aprenda a usar {{#each}} com objetos e acessar chaves com {{@key}}.
 * Voce ja domina loops com arrays (ex7). Agora itere sobre propriedades de objetos.
 * Execute: npx tsx exercicios/ex8-loops-objetos.ts
 */

import Handlebars from 'handlebars';

// === Dados de configuracao de dashboard ===
const dashboardConfig = {
  metricas: {
    usuariosAtivos: 1250,
    receitaMensal: 45000,
    ticketsAbertos: 23,
    tempoMedioResposta: '2.5h',
    satisfacao: '94%',
  },
  labels: {
    usuariosAtivos: 'Usuarios Ativos',
    receitaMensal: 'Receita Mensal (R$)',
    ticketsAbertos: 'Tickets Abertos',
    tempoMedioResposta: 'Tempo Medio de Resposta',
    satisfacao: 'Satisfacao do Cliente',
  },
};

// === TODO 1: Template iterando sobre objeto com {{#each}} e {{@key}} ===
// Use {{#each metricas}} para iterar sobre as propriedades do objeto.
// Dentro do loop, {{@key}} retorna o nome da propriedade e {{this}} o valor.
//
// Exemplo de output:
// "usuariosAtivos: 1250"
// "receitaMensal: 45000"
//
// Dica: {{#each metricas}}{{@key}}: {{this}}{{/each}}

const templateBasico = `
TODO: Crie template iterando sobre metricas com @key e this
`;

// === TODO 2: Helper 'label' para buscar o nome amigavel da metrica ===
// Crie um helper que recebe a chave (ex: "usuariosAtivos") e retorna
// o label correspondente (ex: "Usuarios Ativos").
// O helper precisa acessar o objeto labels do contexto raiz.
//
// Dica: use options.data.root para acessar o contexto raiz dentro do helper
// Handlebars.registerHelper('label', function(key, options) { ... })

// TODO: Registre o helper 'label' aqui

// === TODO 3: Template com formato de tabela ===
// Combine o helper 'label' com {{#each}} para criar uma tabela formatada.
// Formato de cada linha: "| Usuarios Ativos          | 1250    |"
//
// Dica: use o helper label com {{label @key}} dentro do each

const templateTabela = `
TODO: Crie template com formato de tabela usando o helper label
`;

// === Compile e teste ===
// TODO: compile e exiba os resultados dos templates

console.log('=== Iteracao Basica ===');
// compile templateBasico e exiba

console.log('\n=== Tabela Formatada ===');
// compile templateTabela e exiba

console.log('\n--- Exercicio 8 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex8-loops-objetos.ts');
