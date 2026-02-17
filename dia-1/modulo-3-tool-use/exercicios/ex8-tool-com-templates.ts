/**
 * Exercicio 8: Tools com Templates de Resultado
 *
 * Use templates para formatar os resultados das tools de forma
 * consistente e legivel antes de enviar de volta para Claude.
 *
 * Dificuldade: Intermediario
 * Tempo estimado: 20 minutos
 * Execute: npx tsx exercicios/ex8-tool-com-templates.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEITO ===
// Em vez de retornar JSON cru, podemos usar templates para formatar
// os resultados das tools. Isso ajuda Claude a interpretar os dados
// e gerar respostas mais naturais.
//
// Templates sao funcoes que recebem dados e retornam texto formatado.

// === TODO 1: Crie funcoes de template ===
// Cada template recebe dados tipados e retorna string formatada.

// function templateUsuario(usuario: {
//   nome: string;
//   email: string;
//   plano: string;
//   ativo: boolean;
//   criadoEm: string;
// }): string {
//   return `
// === Perfil do Usuario ===
// Nome: ${usuario.nome}
// Email: ${usuario.email}
// Plano: ${usuario.plano}
// Status: ${usuario.ativo ? 'Ativo' : 'Inativo'}
// Membro desde: ${usuario.criadoEm}
//   `.trim();
// }

// function templateListaProdutos(produtos: Array<{
//   nome: string;
//   preco: number;
//   estoque: number;
// }>): string {
//   // Formate como tabela textual
//   // Inclua total de itens e valor total do estoque
// }

// function templateRelatorio(dados: {
//   titulo: string;
//   periodo: string;
//   metricas: Record<string, number>;
//   observacoes: string[];
// }): string {
//   // Formate como relatorio estruturado
// }

// === TODO 2: Defina as tools ===
// Tool 1: buscar_usuario — retorna dados do usuario
// Tool 2: listar_produtos — retorna lista de produtos
// Tool 3: gerar_relatorio_mensal — retorna relatorio de metricas

// const tools: Anthropic.Tool[] = [ ... ];

// === TODO 3: Implemente handlers que usam templates ===
// Cada handler busca dados (simulados) e formata com o template.

// function handleBuscarUsuario(input: { email: string }): string {
//   const usuario = usuariosDB[input.email];
//   if (!usuario) return 'Usuario nao encontrado';
//   return templateUsuario(usuario);
// }

// === TODO 4: Rode o loop de tool use ===
// Pergunta: "Busque o perfil do usuario joao@empresa.com e liste os produtos de eletronicos"

console.log('\n--- Exercicio 8 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex8-tool-com-templates.ts');
