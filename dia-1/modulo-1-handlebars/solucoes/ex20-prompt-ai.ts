/**
 * Solucao - Exercicio 20: Templates para Prompts de AI (Capstone)
 */

import Handlebars from 'handlebars';

const contexto = {
  empresa: 'TechStore',
  produto: 'SmartWatch X1',
  cliente: {
    nome: 'Pedro Costa',
    plano: 'premium',
    historicoCompras: 12,
  },
  pergunta: 'Meu relogio nao esta sincronizando com o app',
  faq: [
    { pergunta: 'Como sincronizar?', resposta: 'Abra o app > Configuracoes > Bluetooth > Sincronizar' },
    { pergunta: 'Resetar dispositivo?', resposta: 'Segure botao lateral por 10 segundos' },
  ],
  idioma: 'portugues',
  tomDeVoz: 'profissional e empatico',
};

// Helper de comparacao
Handlebars.registerHelper('eq', (a: string, b: string) => a === b);

// Solucao TODO 1: System Prompt Template
const systemPromptTemplate = `Voce e um assistente de suporte da {{empresa}}.
Responda sempre em {{idioma}} com tom {{tomDeVoz}}.

Regras:
- Seja conciso e direto
- Ofereca solucoes praticas
- Se nao souber a resposta, encaminhe para suporte humano
- Nunca invente informacoes sobre o produto
- Cite passos numerados quando aplicavel`;

// Solucao TODO 2: User Prompt com Few-Shot
const userPromptTemplate = `Contexto do cliente:
- Nome: {{cliente.nome}}
- Plano: {{cliente.plano}}
- Historico: {{cliente.historicoCompras}} compras
- Produto: {{produto}}

{{#if faq.length}}
Exemplos de perguntas e respostas anteriores:
{{#each faq}}
P: {{this.pergunta}}
R: {{this.resposta}}
{{/each}}
{{/if}}

{{#if (eq cliente.plano "premium")}}
NOTA: Este cliente e premium ({{cliente.historicoCompras}} compras). Priorize o atendimento e ofereca solucoes avancadas.
{{else}}
NOTA: Cliente com plano basico. Sugira upgrade para premium se apropriado.
{{/if}}

Pergunta do cliente: {{pergunta}}

Responda de forma clara e objetiva:`;

// Solucao TODO 4: Prompt Builder
type PromptContext = typeof contexto;

function buildPrompt(context: PromptContext): { system: string; user: string } {
  const compiledSystem = Handlebars.compile(systemPromptTemplate);
  const compiledUser = Handlebars.compile(userPromptTemplate);

  return {
    system: compiledSystem(context),
    user: compiledUser(context),
  };
}

// Teste com cliente premium
const prompt = buildPrompt(contexto);
console.log('=== SYSTEM PROMPT ===');
console.log(prompt.system);
console.log('\n=== USER PROMPT (Premium) ===');
console.log(prompt.user);

// Teste com cliente basico
const contextoBasico: PromptContext = {
  ...contexto,
  cliente: { nome: 'Julia Lima', plano: 'basico', historicoCompras: 1 },
  pergunta: 'Quanto custa a garantia estendida?',
};

const promptBasico = buildPrompt(contextoBasico);
console.log('\n=== USER PROMPT (Basico) ===');
console.log(promptBasico.user);

// Demonstracao: como isso seria usado com Claude API
console.log('\n=== Como usar com Claude API ===');
console.log(`
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();
const response = await client.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 500,
  system: prompt.system,
  messages: [{ role: 'user', content: prompt.user }],
});
`);
