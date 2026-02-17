/**
 * Solucao 14: Classificacao Robusta
 * Dificuldade: avancado | Tempo: 25 min
 *
 * Combine few-shot + Chain-of-Thought + JSON para classificacao robusta de tickets.
 * Referencia: ex8 (JSON), ex11 (few-shot), ex13 (CoT) — agora tudo junto.
 * Cross-module: este padrao de classificador sera reutilizado em M4 ex12.
 * Execute: npx tsx solucoes/ex14-classificacao-robusta.ts
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

// === Tipo de saida ===
type ClassificacaoTicket = {
  categoria: Categoria;
  confianca: number;
  raciocinio: string;
  acaoSugerida: string;
};

// === Exemplos few-shot ===
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

// === Tickets para classificar ===
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

// Solucao TODO 1 + 2: Pipeline de classificacao
function buildClassificationPrompt(ticket: string): {
  system: string;
  user: string;
} {
  const categoriasDescricao = `Categorias disponiveis:
- tecnico: problemas de sistema, bugs, erros, funcionalidades quebradas
- cobranca: pagamentos, faturas, reembolsos, precos, planos
- cancelamento: pedidos de cancelamento, encerramento de conta
- duvida: perguntas sobre uso, funcionalidades, como fazer algo
- sugestao: ideias, melhorias, pedidos de novas funcionalidades`;

  const exemplosFormatados = exemplosFewShot
    .map(
      (e) =>
        `Ticket: "${e.ticket}"\nClassificacao:\n${JSON.stringify(e.classificacao, null, 2)}`
    )
    .join('\n\n');

  const system = `Voce e um classificador de tickets de suporte ao cliente.

${categoriasDescricao}

Analise cada ticket passo a passo (Chain-of-Thought):
1. Identifique as palavras-chave e o tom do cliente
2. Considere qual categoria melhor se encaixa
3. Avalie sua confianca na classificacao
4. Sugira uma acao concreta

Responda APENAS com JSON valido no formato:
{
  "categoria": "tecnico|cobranca|cancelamento|duvida|sugestao",
  "confianca": 0.0-1.0,
  "raciocinio": "explicacao passo a passo da classificacao",
  "acaoSugerida": "acao concreta recomendada"
}

Sem texto antes ou depois do JSON. Sem blocos de codigo markdown.`;

  const user = `Aqui estao exemplos de classificacoes corretas:

${exemplosFormatados}

Agora classifique este ticket:
"${ticket}"`;

  return { system, user };
}

// Solucao TODO 3: Classificar ticket com parse robusto
function parseJsonResponse(text: string): ClassificacaoTicket | null {
  // Tentativa 1: parse direto
  try {
    const parsed = JSON.parse(text) as ClassificacaoTicket;
    if (CATEGORIAS.includes(parsed.categoria as Categoria)) {
      return parsed;
    }
  } catch {
    // continua
  }

  // Tentativa 2: extrair de bloco markdown
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    try {
      const parsed = JSON.parse(
        jsonBlockMatch[1].trim()
      ) as ClassificacaoTicket;
      if (CATEGORIAS.includes(parsed.categoria as Categoria)) {
        return parsed;
      }
    } catch {
      // continua
    }
  }

  // Tentativa 3: encontrar JSON no texto
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as ClassificacaoTicket;
      if (CATEGORIAS.includes(parsed.categoria as Categoria)) {
        return parsed;
      }
    } catch {
      // falhou
    }
  }

  return null;
}

async function classifyTicket(
  ticket: string
): Promise<ClassificacaoTicket | null> {
  const { system, user } = buildClassificationPrompt(ticket);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    temperature: 0,
    system,
    messages: [{ role: 'user', content: user }],
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';

  const parsed = parseJsonResponse(text);

  if (!parsed) {
    console.log(`  AVISO: falha no parse do ticket "${ticket.slice(0, 40)}..."`);
    console.log(`  Resposta bruta: ${text.slice(0, 100)}`);
  }

  return parsed;
}

// Solucao TODO 4: Processar todos os tickets e gerar relatorio
const resultados: {
  ticket: string;
  classificacao: ClassificacaoTicket | null;
}[] = [];

console.log('=== Classificando Tickets ===\n');

for (const ticket of tickets) {
  const ticketTrunc =
    ticket.length > 55 ? ticket.slice(0, 55) + '...' : ticket;
  process.stdout.write(`Classificando: "${ticketTrunc}"... `);

  const classificacao = await classifyTicket(ticket);
  resultados.push({ ticket, classificacao });

  if (classificacao) {
    console.log(
      `${classificacao.categoria} (${(classificacao.confianca * 100).toFixed(0)}%)`
    );
  } else {
    console.log('ERRO');
  }
}

// Tabela detalhada
console.log('\n=== Resultados Detalhados ===\n');
console.log(
  '#'.padEnd(4) +
    'Ticket'.padEnd(42) +
    'Categoria'.padEnd(16) +
    'Confianca'.padEnd(12) +
    'Acao Sugerida'
);
console.log('-'.repeat(110));

for (let i = 0; i < resultados.length; i++) {
  const r = resultados[i];
  const ticketTrunc =
    r.ticket.length > 39 ? r.ticket.slice(0, 39) + '...' : r.ticket;

  if (r.classificacao) {
    const acaoTrunc =
      r.classificacao.acaoSugerida.length > 40
        ? r.classificacao.acaoSugerida.slice(0, 40) + '...'
        : r.classificacao.acaoSugerida;
    console.log(
      `${i + 1}`.padEnd(4) +
        ticketTrunc.padEnd(42) +
        r.classificacao.categoria.padEnd(16) +
        `${(r.classificacao.confianca * 100).toFixed(0)}%`.padEnd(12) +
        acaoTrunc
    );
  } else {
    console.log(
      `${i + 1}`.padEnd(4) +
        ticketTrunc.padEnd(42) +
        'ERRO'.padEnd(16) +
        '-'.padEnd(12) +
        '-'
    );
  }
}

// Distribuicao por categoria
console.log('\n=== Distribuicao por Categoria ===');
const distribuicao: Record<string, number> = {};
const confiancaPorCategoria: Record<string, number[]> = {};

for (const r of resultados) {
  if (r.classificacao) {
    const cat = r.classificacao.categoria;
    distribuicao[cat] = (distribuicao[cat] || 0) + 1;
    if (!confiancaPorCategoria[cat]) confiancaPorCategoria[cat] = [];
    confiancaPorCategoria[cat].push(r.classificacao.confianca);
  }
}

for (const cat of CATEGORIAS) {
  const count = distribuicao[cat] || 0;
  const confArr = confiancaPorCategoria[cat] || [];
  const confMedia =
    confArr.length > 0
      ? confArr.reduce((a, b) => a + b, 0) / confArr.length
      : 0;
  const barra = '#'.repeat(count * 3);
  console.log(
    `  ${cat.padEnd(15)} ${String(count).padEnd(3)} ${barra}  (confianca media: ${(confMedia * 100).toFixed(0)}%)`
  );
}

// Tickets de baixa confianca
const baixaConfianca = resultados.filter(
  (r) => r.classificacao && r.classificacao.confianca < 0.8
);

if (baixaConfianca.length > 0) {
  console.log('\n=== Tickets com Baixa Confianca (<80%) ===');
  for (const r of baixaConfianca) {
    if (r.classificacao) {
      console.log(
        `  - "${r.ticket.slice(0, 50)}..." -> ${r.classificacao.categoria} (${(r.classificacao.confianca * 100).toFixed(0)}%)`
      );
      console.log(`    Raciocinio: ${r.classificacao.raciocinio.slice(0, 80)}...`);
    }
  }
} else {
  console.log('\nNenhum ticket com confianca abaixo de 80%.');
}

// Metricas gerais
const totalClassificados = resultados.filter((r) => r.classificacao).length;
const confiancaGeral =
  resultados
    .filter((r) => r.classificacao)
    .reduce((acc, r) => acc + (r.classificacao?.confianca || 0), 0) /
  totalClassificados;

console.log('\n=== Metricas Gerais ===');
console.log(`Total de tickets: ${tickets.length}`);
console.log(`Classificados com sucesso: ${totalClassificados}/${tickets.length}`);
console.log(`Confianca media geral: ${(confiancaGeral * 100).toFixed(1)}%`);
console.log(`Tickets baixa confianca: ${baixaConfianca.length}`);

console.log('\n--- Exercicio 14 completo! ---');
