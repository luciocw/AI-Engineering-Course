/**
 * Exercicio 3: Propriedades Aninhadas
 *
 * Aprenda a acessar objetos dentro de objetos usando dot-notation.
 * Voce ja sabe usar {{variavel}} (ex1-ex2). Agora acesse {{obj.prop}}.
 * Execute: npx tsx exercicios/ex3-propriedades-aninhadas.ts
 */

import Handlebars from 'handlebars';

// === Dados de uma empresa com estrutura aninhada ===
const empresa = {
  nome: 'AI Solutions',
  endereco: {
    rua: 'Av. Paulista, 1000',
    cidade: 'Sao Paulo',
    estado: 'SP',
  },
  contato: {
    email: 'contato@aisolutions.com',
    telefone: '(11) 99999-0000',
  },
  ceo: {
    nome: 'Carlos Mendes',
    cargo: 'CEO & Fundador',
  },
};

// === TODO 1: Template com dot-notation basico ===
// Acesse propriedades aninhadas usando ponto (.).
// Crie um template que mostre o nome da empresa e a cidade.
//
// Exemplo de output esperado:
// "Empresa: AI Solutions | Cidade: Sao Paulo - SP"
//
// Dica: use {{nome}} para o nome da empresa e {{endereco.cidade}} para a cidade.

const templateEmpresa = `
TODO: Crie template usando dot-notation para nome, endereco.cidade e endereco.estado
`;

// === TODO 2: Template de cartao de visita ===
// Crie um "cartao de visita" acessando dados do CEO e contato.
//
// Exemplo de output esperado:
// "--- Cartao de Visita ---
//  Carlos Mendes
//  CEO & Fundador
//  contato@aisolutions.com
//  AI Solutions"
//
// Dica: use {{ceo.nome}}, {{ceo.cargo}}, {{contato.email}}

const templateCartao = `
TODO: Crie template de cartao de visita com ceo.nome, ceo.cargo, contato.email
`;

// === TODO 3: Acessando propriedade que nao existe ===
// O que acontece quando voce tenta acessar uma propriedade que nao existe?
// Tente acessar {{endereco.cep}} e {{financeiro.receita}} no template.
//
// Crie um template que misture propriedades existentes e inexistentes.
// Observe como Handlebars lida com isso (sem erros, apenas string vazia).
//
// Exemplo de output esperado:
// "Endereco: Av. Paulista, 1000 | CEP:  | Receita: "

const templateInexistente = `
TODO: Crie template acessando propriedades existentes e inexistentes
`;

// === Compile e teste ===
// Descomente e complete o codigo abaixo:

// const compilado1 = Handlebars.compile(templateEmpresa);
// console.log('=== Dados da Empresa ===');
// console.log(compilado1(empresa));

// const compilado2 = Handlebars.compile(templateCartao);
// console.log('\n=== Cartao de Visita ===');
// console.log(compilado2(empresa));

// const compilado3 = Handlebars.compile(templateInexistente);
// console.log('\n=== Propriedades Inexistentes ===');
// console.log(compilado3(empresa));

console.log('\n--- Exercicio 3 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex3-propriedades-aninhadas.ts');
