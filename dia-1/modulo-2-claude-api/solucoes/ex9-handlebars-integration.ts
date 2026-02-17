/**
 * Solucao 9: Integracao Handlebars + Claude API
 *
 * Templates dinamicos com Handlebars alimentando a Claude API.
 * Referencia: exercicios 1-4 (API basica) + M1 (Handlebars).
 * Execute: npx tsx solucoes/ex9-handlebars-integration.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import Handlebars from 'handlebars';

const client = new Anthropic();

const produtos = [
  {
    nome: 'AI Analytics Pro',
    features: [
      'Dashboard em tempo real',
      'Alertas inteligentes',
      'Integracao com Slack',
    ],
    publicoAlvo: 'gestores de produto em startups',
    tom: 'profissional e entusiasmado',
    tamanho: 50,
  },
  {
    nome: 'Cadeira Ergonomica SmartSit',
    features: [
      'Ajuste lombar automatico',
      'Sensores de postura',
      'App companion',
    ],
    publicoAlvo: 'desenvolvedores que trabalham 8h+ sentados',
    tom: 'casual e divertido',
    tamanho: 60,
  },
];

const systemTemplate =
  'Voce e um copywriter especialista em e-commerce. Escreva em tom {{tom}}. Maximo {{tamanho}} palavras. Responda apenas com a descricao, sem introducoes.';

const userTemplate = `Crie uma descricao para o produto "{{nome}}" com as seguintes features:
{{#each features}}
- {{this}}
{{/each}}

Publico-alvo: {{publicoAlvo}}`;

async function generateWithTemplate(
  systemTmpl: string,
  userTmpl: string,
  data: Record<string, unknown>
): Promise<string> {
  const compiledSystem = Handlebars.compile(systemTmpl);
  const compiledUser = Handlebars.compile(userTmpl);

  const systemMsg = compiledSystem(data);
  const userMsg = compiledUser(data);

  console.log(`  [System] ${systemMsg.slice(0, 80)}...`);
  console.log(`  [User]   ${userMsg.slice(0, 80)}...`);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: systemMsg,
    messages: [{ role: 'user', content: userMsg }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

for (const produto of produtos) {
  console.log(`\n=== ${produto.nome} ===`);
  const result = await generateWithTemplate(
    systemTemplate,
    userTemplate,
    produto
  );
  console.log(`\n  Descricao gerada:\n  ${result}\n`);
}

console.log('\n--- Exercicio 9 completo! ---');
