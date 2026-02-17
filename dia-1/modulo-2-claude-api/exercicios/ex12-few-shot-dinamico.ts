/**
 * Exercicio 12: Few-Shot Dinamico
 * Dificuldade: intermediario | Tempo: 20 min
 *
 * Selecione exemplos few-shot dinamicamente com base na similaridade do input.
 * Referencia: exercicio 11 (few-shot fixo) — agora os exemplos sao escolhidos por relevancia.
 * Execute: npx tsx exercicios/ex12-few-shot-dinamico.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Banco de exemplos rotulados (10+) ===
type Exemplo = {
  texto: string;
  categoria: string;
  keywords: string[]; // palavras-chave para matching
};

const bancoExemplos: Exemplo[] = [
  {
    texto: 'Meu cartao foi clonado e fizeram compras sem minha autorizacao',
    categoria: 'fraude',
    keywords: ['cartao', 'clonado', 'compras', 'autorizacao', 'fraude'],
  },
  {
    texto: 'O aplicativo do banco nao abre desde ontem, da erro 500',
    categoria: 'problema_tecnico',
    keywords: ['aplicativo', 'banco', 'erro', 'abre', 'bug'],
  },
  {
    texto: 'Quero solicitar um aumento no limite do meu cartao de credito',
    categoria: 'solicitacao',
    keywords: ['limite', 'cartao', 'credito', 'aumento', 'solicitar'],
  },
  {
    texto: 'Fui cobrado duas vezes na mesma fatura do cartao',
    categoria: 'cobranca',
    keywords: ['cobrado', 'fatura', 'cartao', 'duplicada', 'cobranca'],
  },
  {
    texto: 'Como faco para cadastrar minha chave PIX no aplicativo?',
    categoria: 'duvida',
    keywords: ['cadastrar', 'pix', 'aplicativo', 'como', 'chave'],
  },
  {
    texto: 'Gostaria de cancelar minha conta corrente neste banco',
    categoria: 'cancelamento',
    keywords: ['cancelar', 'conta', 'corrente', 'encerrar', 'banco'],
  },
  {
    texto: 'Recebi uma ligacao pedindo minha senha, e do banco mesmo?',
    categoria: 'fraude',
    keywords: ['ligacao', 'senha', 'golpe', 'banco', 'pedindo'],
  },
  {
    texto: 'A transferencia que fiz ontem ainda nao caiu na outra conta',
    categoria: 'problema_tecnico',
    keywords: ['transferencia', 'caiu', 'conta', 'pendente', 'demora'],
  },
  {
    texto: 'Quero trocar meu plano de conta para o pacote premium',
    categoria: 'solicitacao',
    keywords: ['trocar', 'plano', 'conta', 'premium', 'pacote'],
  },
  {
    texto: 'Estao cobrando tarifa de manutencao que nao existia antes',
    categoria: 'cobranca',
    keywords: ['tarifa', 'manutencao', 'cobrando', 'taxa', 'antes'],
  },
  {
    texto: 'Qual e o horario de atendimento da agencia central?',
    categoria: 'duvida',
    keywords: ['horario', 'atendimento', 'agencia', 'funciona', 'central'],
  },
  {
    texto: 'Quero encerrar meu cartao de credito e todas as suas funcoes',
    categoria: 'cancelamento',
    keywords: ['encerrar', 'cartao', 'credito', 'cancelar', 'funcoes'],
  },
];

// === Inputs de teste ===
const inputsTeste = [
  'Alguem usou meu cartao para comprar coisas na internet sem eu saber',
  'Nao consigo fazer login no app do banco, fica carregando',
  'Quero saber como funciona o programa de pontos do cartao',
  'Me cobraram uma anuidade que era pra ser isenta',
  'Preciso fechar minha conta poupanca urgente',
];

// === TODO 1: Crie o banco de exemplos com categorias ===
// Ja fornecido acima. Examine a estrutura e entenda o campo `keywords`.

// === TODO 2: Crie selectExamples(input, banco, n) ===
// Seleciona N exemplos mais relevantes do banco para o input.
// Estrategia: conte quantas keywords de cada exemplo aparecem no input.
// Ordene por relevancia (mais keywords em comum = mais relevante).
// Retorne os top N.
//
// function selectExamples(input: string, banco: Exemplo[], n: number): Exemplo[] { ... }

// === TODO 3: Monte o prompt few-shot dinamico ===
// Use selectExamples para escolher 3 exemplos relevantes.
// Monte o prompt no formato:
//   Exemplos:
//   Texto: "..." -> Categoria: fraude
//   Texto: "..." -> Categoria: problema_tecnico
//   Texto: "..." -> Categoria: cobranca
//
//   Texto: "[input]" -> Categoria:
//
// function buildDynamicFewShotPrompt(input: string): string { ... }

// === TODO 4: Compare few-shot fixo vs dinamico ===
// Few-shot fixo: sempre usa os mesmos 3 primeiros exemplos do banco.
// Few-shot dinamico: seleciona 3 exemplos por relevancia.
// Para cada input de teste:
//   1. Classifique com few-shot fixo
//   2. Classifique com few-shot dinamico
//   3. Registre quais exemplos foram selecionados
// Exiba tabela comparativa e mostre quais exemplos foram escolhidos.

// for (const input of inputsTeste) {
//   const exemplosDinamicos = selectExamples(input, bancoExemplos, 3);
//   ...
// }

console.log('\n--- Exercicio 12 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex12-few-shot-dinamico.ts');
