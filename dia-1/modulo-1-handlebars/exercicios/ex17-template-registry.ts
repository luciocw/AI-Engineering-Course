/**
 * Exercicio 17: Registry de Templates
 *
 * Crie uma classe TemplateRegistry para gerenciar templates Handlebars.
 * Voce ja domina partials e composicao (ex16). Agora encapsule tudo em um padrao reutilizavel.
 * Este padrao sera reutilizado no Modulo 2 para gerenciar prompts de AI.
 * Execute: npx tsx exercicios/ex17-template-registry.ts
 */

import Handlebars from 'handlebars';

// === Tipo de configuracao de template ===
type TemplateConfig = {
  nome: string;
  template: string;
  descricao: string;
};

// === TODO 1: Crie a classe TemplateRegistry ===
// A classe deve ter os seguintes metodos:
//
//   register(config: TemplateConfig): void
//     - Registra um template no registry
//     - Compila o template com Handlebars.compile()
//     - Armazena a configuracao e o template compilado
//
//   render(nome: string, dados: Record<string, unknown>): string
//     - Renderiza o template com o nome especificado usando os dados
//     - Lanca erro se o template nao existir
//
//   list(): string[]
//     - Retorna array com os nomes de todos os templates registrados
//
//   has(nome: string): boolean
//     - Retorna true se o template com o nome especificado existe
//
// Dica: use um Map<string, { config: TemplateConfig; compilado: HandlebarsTemplateDelegate }>
// para armazenar os templates.

class TemplateRegistry {
  // TODO: implemente a classe
}

// === TODO 2: Registre 3 templates ===
// Crie uma instancia do registry e registre:
//
// 1. "email-boas-vindas" - Template de email de boas-vindas
//    Template: "Ola {{nome}}! Bem-vindo a {{empresa}}.
//              Seu plano {{plano}} esta ativo.
//              {{#if premium}}Voce tem acesso VIP!{{/if}}"
//
// 2. "notificacao-pagamento" - Notificacao de pagamento
//    Template: "Pagamento {{status}}: R$ {{valor}} em {{data}}.
//              {{#if parcelas}}Parcelado em {{parcelas}}x{{/if}}"
//
// 3. "relatorio-diario" - Relatorio diario
//    Template: "Relatorio {{data}}
//              Novos usuarios: {{novosUsuarios}}
//              Receita: R$ {{receita}}
//              {{#each destaques}}* {{this}}
//              {{/each}}"

const registry = new TemplateRegistry();

// TODO: registre os 3 templates aqui

// === TODO 3: Adicione registerHelper ao registry ===
// Adicione um metodo que delega para Handlebars.registerHelper():
//
//   registerHelper(name: string, fn: Handlebars.HelperDelegate): void
//
// Use este metodo para registrar um helper 'currency' que formata valores.
//
// Dica: this.handlebars pode ser uma instancia isolada de Handlebars
// (Handlebars.create()) para evitar poluir o escopo global.
// Ou simplesmente delegue para Handlebars.registerHelper().

// TODO: adicione o metodo registerHelper e registre o helper 'currency'

// === TODO 4: Adicione renderAll ao registry ===
// Adicione um metodo que renderiza todos os templates com os mesmos dados:
//
//   renderAll(dados: Record<string, unknown>): Record<string, string>
//     - Retorna um objeto com { nomeTemplate: resultadoRenderizado }
//
// Dica: itere sobre todos os templates registrados e renderize cada um.

// TODO: adicione o metodo renderAll

// === TODO 5: Exporte a classe ===
// No final do arquivo, exporte a classe para uso no Modulo 2.
// export { TemplateRegistry };

// === Teste ===

// Teste individual
console.log('=== Templates Registrados ===');
console.log('Templates:', registry.list());
console.log('');

// Renderizar email
console.log('=== Email de Boas-Vindas ===');
// TODO: use registry.render('email-boas-vindas', { ... }) e exiba

// Renderizar notificacao
console.log('\n=== Notificacao de Pagamento ===');
// TODO: use registry.render('notificacao-pagamento', { ... }) e exiba

// Renderizar relatorio
console.log('\n=== Relatorio Diario ===');
// TODO: use registry.render('relatorio-diario', { ... }) e exiba

// Teste renderAll
console.log('\n=== Render All ===');
// TODO: use registry.renderAll({ ... }) e exiba todos os resultados

// Teste de erro
console.log('\n=== Teste de Erro ===');
try {
  registry.render('template-inexistente', {});
} catch (error) {
  console.log('Erro esperado:', (error as Error).message);
}

console.log('\n--- Exercicio 17 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex17-template-registry.ts');
