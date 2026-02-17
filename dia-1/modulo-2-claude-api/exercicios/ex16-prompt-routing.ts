/**
 * Exercicio 16: Prompt Routing
 *
 * Use Claude para classificar a intencao de mensagens e roteie cada uma
 * para um prompt especializado. Voce ja domina prompt chaining (ex15) —
 * agora vai adicionar logica de roteamento condicional entre etapas.
 *
 * Dificuldade: avancado | Tempo estimado: 20 min
 * Execute: npx tsx exercicios/ex16-prompt-routing.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Tipos ===

type Categoria = 'tecnico' | 'vendas' | 'suporte' | 'geral';

type Classificacao = {
  categoria: Categoria;
  confianca: number;
  justificativa: string;
};

type ResultadoRouting = {
  mensagemOriginal: string;
  classificacao: Classificacao;
  respostaEspecialista: string;
  tokensTotal: number;
};

// === Mensagens de clientes para classificar e rotear ===
const mensagensClientes = [
  'Minha API esta retornando erro 429, como resolvo o rate limiting?',
  'Quais planos voces oferecem para empresas com mais de 500 funcionarios?',
  'Nao consigo acessar minha conta desde ontem, ja tentei resetar a senha.',
  'Voces tem integracao com Salesforce? Preciso conectar meu CRM.',
  'Quero entender melhor como a IA de voces funciona, podem explicar?',
];

// === TODO 1: Crie o prompt do roteador ===
// O roteador deve classificar a mensagem em uma das 4 categorias:
// - tecnico: problemas de implementacao, bugs, erros, API
// - vendas: precos, planos, propostas, comparacoes
// - suporte: acesso, conta, senha, problemas de uso
// - geral: duvidas gerais, informacoes, curiosidades
//
// Retorne JSON: { "categoria": "...", "confianca": 0.0-1.0, "justificativa": "..." }

// function buildRouterPrompt(mensagem: string): string { ... }

// === TODO 2: Crie 4 system prompts especializados ===
// Um para cada categoria. Cada especialista deve:
// - Ter um tom e abordagem proprios
// - tecnico: detalhado, com exemplos de codigo/config
// - vendas: persuasivo, focado em beneficios
// - suporte: empatico, com passos claros
// - geral: informativo, acessivel

// const systemPrompts: Record<Categoria, string> = { ... };

// === TODO 3: Para cada mensagem, classifique e roteie ===
// 1. Chame Claude com o router prompt para classificar
// 2. Parse o JSON da classificacao
// 3. Use a categoria para selecionar o system prompt correto
// 4. Chame Claude novamente com o system prompt especializado
// 5. Armazene o resultado completo

// async function classificarMensagem(mensagem: string): Promise<Classificacao> { ... }
// async function rotearParaEspecialista(mensagem: string, categoria: Categoria): Promise<string> { ... }

// === TODO 4: Exiba o fluxo completo ===
// Para cada mensagem, mostre:
// - Mensagem original
// - Classificacao (categoria + confianca)
// - Resposta do especialista
// No final, exiba um resumo: quantas mensagens por categoria

// async function executarRouting() { ... }
// executarRouting();

console.log('\n--- Exercicio 16 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex16-prompt-routing.ts');
