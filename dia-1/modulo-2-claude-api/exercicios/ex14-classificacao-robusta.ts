/**
 * Exercicio 14: Classificacao Robusta
 * Dificuldade: avancado | Tempo: 25 min
 *
 * Combine few-shot + Chain-of-Thought + JSON para classificacao robusta de tickets.
 * Referencia: ex8 (JSON), ex11 (few-shot), ex13 (CoT) — agora tudo junto.
 * Cross-module: este padrao de classificador sera reutilizado em M4 ex12.
 * Execute: npx tsx exercicios/ex14-classificacao-robusta.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Categorias de classificacao ===
const CATEGORIAS = [
  'tecnico',
  'cobranca',
  'cancelamento',
  'duvida',
  'sugestao',
] as const;

type Categoria = (typeof CATEGORIAS)[number];

// === Tipo de saida esperado ===
type ClassificacaoTicket = {
  categoria: Categoria;
  confianca: number; // 0 a 1
  raciocinio: string; // CoT — por que esta categoria?
  acaoSugerida: string;
};

// === Exemplos few-shot (treinamento) ===
const exemplosFewShot = [
  {
    ticket: 'O sistema da erro 403 quando tento acessar o painel de admin',
    classificacao: {
      categoria: 'tecnico',
      confianca: 0.95,
      raciocinio:
        'O cliente reporta um erro HTTP especifico (403 Forbidden) ao acessar funcionalidade do sistema. Trata-se de um problema tecnico de permissao ou configuracao.',
      acaoSugerida:
        'Encaminhar para equipe de suporte tecnico nivel 2 para verificar permissoes do usuario.',
    },
  },
  {
    ticket:
      'Fui cobrado duas vezes este mes e quero meu dinheiro de volta imediatamente',
    classificacao: {
      categoria: 'cobranca',
      confianca: 0.92,
      raciocinio:
        'O cliente relata cobranca duplicada e solicita reembolso. E claramente um problema de faturamento/cobranca.',
      acaoSugerida:
        'Verificar historico de pagamentos e iniciar processo de estorno se confirmada a duplicidade.',
    },
  },
  {
    ticket:
      'Quero cancelar minha assinatura, nao uso mais o servico desde marco',
    classificacao: {
      categoria: 'cancelamento',
      confianca: 0.98,
      raciocinio:
        'O cliente solicita explicitamente o cancelamento da assinatura, indicando desuso prolongado.',
      acaoSugerida:
        'Iniciar fluxo de retencao e, se mantida a decisao, processar cancelamento.',
    },
  },
];

// === Tickets para classificar (10) ===
const tickets = [
  'A pagina de relatorios nao carrega, fica em branco ha 2 dias',
  'Por que meu plano subiu de R$49 para R$79 sem aviso?',
  'Quero encerrar minha conta e apagar todos os meus dados',
  'Como faco para exportar meus dados em formato CSV?',
  'Seria otimo ter integracao com o Google Calendar no app',
  'O botao de salvar nao funciona no navegador Firefox',
  'Recebi cobranca de um servico que ja cancelei mes passado',
  'Gostaria de saber se existe plano para equipes com desconto',
  'Voces poderiam adicionar modo escuro na interface?',
  'Nao consigo redefinir minha senha, o email de recuperacao nao chega',
];

// === TODO 1: Crie o pipeline de classificacao ===
// Combine em um unico prompt:
// a) Few-shot examples (os 3 exemplos acima formatados em JSON)
// b) Instrucao de CoT: "Analise o ticket passo a passo antes de classificar"
// c) Schema JSON de saida: { categoria, confianca, raciocinio, acaoSugerida }
//
// function buildClassificationPrompt(ticket: string): {
//   system: string;
//   user: string;
// } { ... }

// === TODO 2: Defina as categorias no system prompt ===
// Categorias: tecnico, cobranca, cancelamento, duvida, sugestao
// Para cada categoria, inclua uma descricao curta para guiar o modelo.
// Exemplo:
//   - tecnico: problemas de sistema, bugs, erros
//   - cobranca: pagamentos, faturas, reembolsos
//   - ...

// === TODO 3: Para cada ticket, classifique e extraia JSON ===
// 1. Chame a API com o prompt
// 2. Parse o JSON da resposta (reutilize logica do ex8)
// 3. Valide que a categoria esta na lista valida
// 4. Armazene o resultado
//
// async function classifyTicket(ticket: string): Promise<ClassificacaoTicket | null> { ... }

// === TODO 4: Gere relatorio resumo com metricas ===
// Exiba:
// 1. Tabela: Ticket | Categoria | Confianca | Acao
// 2. Distribuicao por categoria (contagem)
// 3. Confianca media por categoria
// 4. Tickets de baixa confianca (<0.8)
//
// for (const ticket of tickets) {
//   const result = await classifyTicket(ticket);
//   ...
// }

console.log('\n--- Exercicio 14 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex14-classificacao-robusta.ts');
