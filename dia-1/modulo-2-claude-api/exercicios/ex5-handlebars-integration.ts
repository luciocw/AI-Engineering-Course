/**
 * Exercicio 5: Integracao Handlebars + Claude API
 *
 * Conecte o Modulo 1 (templates) com o Modulo 2 (API).
 * Crie prompts dinamicos e reutilizaveis.
 * Execute: npx tsx exercicios/ex5-handlebars-integration.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import Handlebars from 'handlebars';

const client = new Anthropic();

// === Cenario: gerar descricoes de produtos para e-commerce ===
const produtos = [
  {
    nome: 'AI Analytics Pro',
    features: ['Dashboard em tempo real', 'Alertas inteligentes', 'Integracao com Slack'],
    publicoAlvo: 'gestores de produto em startups',
    tom: 'profissional e entusiasmado',
    tamanho: 50,
  },
  {
    nome: 'Cadeira Ergonomica SmartSit',
    features: ['Ajuste lombar automatico', 'Sensores de postura', 'App companion'],
    publicoAlvo: 'desenvolvedores que trabalham 8h+ sentados',
    tom: 'casual e divertido',
    tamanho: 60,
  },
];

// === TODO 1: Crie um template de system prompt com Handlebars ===
// Variaveis: {{tom}}, {{tamanho}}
// Exemplo: "Voce e um copywriter. Escreva em tom {{tom}}. Maximo {{tamanho}} palavras."

// const systemTemplate = '...';

// === TODO 2: Crie um template de user prompt com Handlebars ===
// Variaveis: {{nome}}, {{#each features}}, {{publicoAlvo}}
// O template deve injetar features como lista.

// const userTemplate = '...';

// === TODO 3: Implemente generateWithTemplate() ===
// Recebe: systemTemplate, userTemplate, data
// 1. Compila os templates com Handlebars
// 2. Renderiza com os dados
// 3. Chama a Claude API
// 4. Retorna o texto

// async function generateWithTemplate(
//   systemTmpl: string,
//   userTmpl: string,
//   data: Record<string, unknown>
// ): Promise<string> { ... }

// === TODO 4: Teste com os 2 produtos ===
// Mostre: template renderizado + resposta do Claude

// for (const produto of produtos) {
//   console.log(`\n=== ${produto.nome} ===`);
//   const result = await generateWithTemplate(systemTemplate, userTemplate, produto);
//   console.log(result);
// }

console.log('\n--- Exercicio 5 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex5-handlebars-integration.ts');
