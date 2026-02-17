/**
 * Exercicio 2: Template de Email
 *
 * Aprenda a usar variaveis do Handlebars para criar emails personalizados.
 * Voce ja sabe compilar um template (ex1). Agora use multiplas variaveis.
 * Execute: npx tsx exercicios/ex2-email-basico.ts
 */

import Handlebars from 'handlebars';

// === Dados do usuario ===
const usuario = {
  nome: 'Maria Silva',
  email: 'maria@exemplo.com',
  produto: 'Curso AI Engineering',
  preco: 497,
};

// === TODO 1: Crie um template de email de boas-vindas ===
// Use {{variavel}} para inserir os dados do usuario.
// O template deve conter: nome, produto e preco.
//
// Exemplo de output esperado:
// "Ola Maria Silva! Obrigado por comprar Curso AI Engineering.
//  Valor: R$497. Enviaremos detalhes para maria@exemplo.com."

const templateEmail = `
TODO: Escreva seu template aqui usando {{nome}}, {{produto}}, {{preco}} e {{email}}
`;

// === TODO 2: Compile o template e gere o resultado ===
// 1. Use Handlebars.compile() para compilar o template
// 2. Passe os dados do usuario para o template compilado
// 3. Imprima o resultado com console.log()

// const compilado = ...
// const resultado = ...
// console.log(resultado);

// === TODO 3: Crie um segundo template para email de lembrete ===
// Reutilize os mesmos dados mas com mensagem diferente.
// Exemplo: "Maria Silva, seu acesso ao Curso AI Engineering expira em 7 dias!"

console.log('\n--- Exercicio 2 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex2-email-basico.ts');
