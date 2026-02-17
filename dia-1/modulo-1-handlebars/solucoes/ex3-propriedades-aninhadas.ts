/**
 * Solucao - Exercicio 3: Propriedades Aninhadas
 */

import Handlebars from 'handlebars';

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

// Solucao TODO 1: Template com dot-notation basico
const templateEmpresa = `Empresa: {{nome}} | Cidade: {{endereco.cidade}} - {{endereco.estado}}`;

const compilado1 = Handlebars.compile(templateEmpresa);
console.log('=== Dados da Empresa ===');
console.log(compilado1(empresa));
// Output: "Empresa: AI Solutions | Cidade: Sao Paulo - SP"

// Solucao TODO 2: Template de cartao de visita
const templateCartao = `--- Cartao de Visita ---
{{ceo.nome}}
{{ceo.cargo}}
{{contato.email}}
{{nome}}`;

const compilado2 = Handlebars.compile(templateCartao);
console.log('\n=== Cartao de Visita ===');
console.log(compilado2(empresa));

// Voce tambem pode acessar o endereco completo:
const templateCompleto = `{{nome}}
{{endereco.rua}}
{{endereco.cidade}} - {{endereco.estado}}
Tel: {{contato.telefone}} | Email: {{contato.email}}`;

const compilado2b = Handlebars.compile(templateCompleto);
console.log('\n=== Endereco Completo ===');
console.log(compilado2b(empresa));

// Solucao TODO 3: Acessando propriedade que nao existe
// Handlebars NAO lanca erro - simplesmente retorna string vazia.
// Isso e uma feature: templates sao resilientes a dados incompletos.
const templateInexistente = `Endereco: {{endereco.rua}} | CEP: {{endereco.cep}} | Receita: {{financeiro.receita}}`;

const compilado3 = Handlebars.compile(templateInexistente);
console.log('\n=== Propriedades Inexistentes ===');
console.log(compilado3(empresa));
// Output: "Endereco: Av. Paulista, 1000 | CEP:  | Receita: "
// Nota: {{endereco.cep}} e {{financeiro.receita}} viram string vazia, sem erro.

// Isso e util para templates de AI onde nem todos os dados estao disponiveis.
// O template renderiza mesmo com dados parciais.
