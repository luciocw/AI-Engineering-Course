/**
 * Exercicio 5: Templates para Prompts de AI
 *
 * Aplique Handlebars para criar prompts dinamicos e reutilizaveis.
 * Este e o exercicio mais importante - conecta Handlebars com AI Engineering.
 * Execute: npx tsx exercicios/ex5-prompt-ai.ts
 */

import Handlebars from 'handlebars';

// === Cenario: Voce esta construindo um sistema de suporte ao cliente ===
// O sistema usa Claude API para responder perguntas.
// Os prompts precisam ser dinamicos baseados no contexto.

// === Dados de contexto ===
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
  tomDeVoz: 'profissional e empatitico',
};

// === TODO 1: Template de System Prompt ===
// Crie um system prompt que configure o comportamento do AI.
// Inclua: empresa, tom de voz, idioma, e regras.
//
// Exemplo:
// "Voce e um assistente de suporte da TechStore.
//  Responda em portugues com tom profissional e empatitico.
//  Regras: ..."

const systemPromptTemplate = `
TODO: Crie o system prompt template
`;

// === TODO 2: Template de User Prompt com Few-Shot ===
// Inclua exemplos de FAQ como "few-shot examples" no prompt.
// Use {{#each faq}} para injetar os exemplos.
//
// Formato:
// "Contexto do cliente: [dados]
//  Exemplos de respostas:
//  P: [pergunta FAQ] -> R: [resposta FAQ]
//  ...
//  Pergunta atual: [pergunta do cliente]"

const userPromptTemplate = `
TODO: Crie o user prompt template com few-shot examples
`;

// === TODO 3: Template condicional por tipo de plano ===
// Se o cliente e premium, adicione instrucao especial:
// "Este cliente e premium (12 compras). Priorize atendimento."
// Se basico: "Cliente basico. Sugira upgrade se apropriado."

const contextTemplate = `
TODO: Crie template condicional baseado no plano
`;

// === TODO 4: Junte tudo - Prompt Builder ===
// Crie uma funcao que recebe dados e retorna o prompt completo.
// Use os 3 templates acima.

type PromptContext = typeof contexto;

function buildPrompt(_context: PromptContext): { system: string; user: string } {
  // TODO: compile os templates e retorne o prompt completo
  return {
    system: 'TODO',
    user: 'TODO',
  };
}

// === Teste ===
const prompt = buildPrompt(contexto);
console.log('=== SYSTEM PROMPT ===');
console.log(prompt.system);
console.log('\n=== USER PROMPT ===');
console.log(prompt.user);

// Teste com cliente basico
const contextoBasico = {
  ...contexto,
  cliente: { nome: 'Julia Lima', plano: 'basico', historicoCompras: 1 },
  pergunta: 'Quanto custa a garantia estendida?',
};

const promptBasico = buildPrompt(contextoBasico);
console.log('\n=== PROMPT CLIENTE BASICO ===');
console.log(promptBasico.user);

console.log('\n--- Exercicio 5 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex5-prompt-ai.ts');
