/**
 * Solucao - Exercicio 8: Iterando Objetos
 */

import Handlebars from 'handlebars';

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

// Solucao TODO 1: Iteracao basica com @key e this
const templateBasico = `{{#each metricas}}{{@key}}: {{this}}
{{/each}}`;

// Solucao TODO 2: Helper 'label' para buscar nome amigavel
Handlebars.registerHelper('label', function (key: string, options: Handlebars.HelperOptions) {
  const labels = options.data.root.labels as Record<string, string>;
  return labels[key] || key;
});

// Solucao TODO 3: Template com formato de tabela
const templateTabela = `=== Dashboard de Metricas ===
+-------------------------------+------------------+
{{#each metricas}}| {{label @key}}{{padRight (label @key) 30}}| {{this}}{{padRight this 17}}|
{{/each}}+-------------------------------+------------------+`;

// Helper auxiliar para padding (alinhamento de tabela)
Handlebars.registerHelper('padRight', function (text: string | number, width: number) {
  const str = String(text);
  const padding = width - str.length;
  return padding > 0 ? ' '.repeat(padding) : '';
});

// Compile e teste
const compiladoBasico = Handlebars.compile(templateBasico);
console.log('=== Iteracao Basica ===');
console.log(compiladoBasico(dashboardConfig));

const compiladoTabela = Handlebars.compile(templateTabela);
console.log('\n=== Tabela Formatada ===');
console.log(compiladoTabela(dashboardConfig));

// Bonus: iteracao com @index e @first/@last
Handlebars.registerHelper('comVirgula', function (options: Handlebars.HelperOptions) {
  const data = options.data;
  return data.last ? '' : ', ';
});

const templateLista = `Metricas monitoradas: {{#each metricas}}{{label @key}}{{comVirgula}}{{/each}}`;
const compiladoLista = Handlebars.compile(templateLista);
console.log('\n=== Lista Inline ===');
console.log(compiladoLista(dashboardConfig));
