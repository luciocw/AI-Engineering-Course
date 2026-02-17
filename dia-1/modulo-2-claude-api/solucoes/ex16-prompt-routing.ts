/**
 * Solucao 16: Prompt Routing
 *
 * Use Claude para classificar a intencao de mensagens e roteie cada uma
 * para um prompt especializado.
 * Execute: npx tsx solucoes/ex16-prompt-routing.ts
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

// Router prompt
function buildRouterPrompt(mensagem: string): string {
  return `Classifique a intencao da mensagem do cliente em uma das categorias:
- tecnico: problemas de implementacao, bugs, erros, API, integracao tecnica
- vendas: precos, planos, propostas, comparacoes, funcionalidades comerciais
- suporte: acesso, conta, senha, problemas de uso do produto
- geral: duvidas gerais, informacoes, curiosidades sobre a empresa/produto

Retorne APENAS um JSON valido:
{
  "categoria": "tecnico|vendas|suporte|geral",
  "confianca": 0.0 a 1.0,
  "justificativa": "breve explicacao da classificacao"
}

Mensagem do cliente: "${mensagem}"`;
}

// System prompts especializados
const systemPrompts: Record<Categoria, string> = {
  tecnico: `Voce e um especialista tecnico senior. Responda de forma detalhada e tecnica.
Inclua exemplos de codigo ou configuracao quando relevante.
Seja preciso e direto, referenciando documentacao quando possivel.
Responda em portugues. Limite a resposta a 3-4 frases.`,

  vendas: `Voce e um consultor de vendas experiente. Responda de forma persuasiva mas honesta.
Foque nos beneficios e valor do produto para o cliente.
Sugira o plano mais adequado e mencione diferenciais competitivos.
Responda em portugues. Limite a resposta a 3-4 frases.`,

  suporte: `Voce e um agente de suporte ao cliente empatico e eficiente.
Demonstre compreensao pelo problema do cliente.
Forneca passos claros e numerados para resolver a questao.
Responda em portugues. Limite a resposta a 3-4 frases.`,

  geral: `Voce e um representante amigavel e informativo da empresa.
Explique conceitos de forma acessivel e sem jargao excessivo.
Convide o cliente a explorar mais sobre o produto.
Responda em portugues. Limite a resposta a 3-4 frases.`,
};

// Classificar mensagem
async function classificarMensagem(mensagem: string): Promise<{ classificacao: Classificacao; tokens: number }> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    temperature: 0,
    messages: [{ role: 'user', content: buildRouterPrompt(mensagem) }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const classificacao: Classificacao = JSON.parse(text);
  const tokens = response.usage.input_tokens + response.usage.output_tokens;

  return { classificacao, tokens };
}

// Rotear para especialista
async function rotearParaEspecialista(
  mensagem: string,
  categoria: Categoria
): Promise<{ resposta: string; tokens: number }> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    temperature: 0.3,
    system: systemPrompts[categoria],
    messages: [{ role: 'user', content: mensagem }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const tokens = response.usage.input_tokens + response.usage.output_tokens;

  return { resposta: text, tokens };
}

// Executar routing completo
async function executarRouting() {
  console.log('=== Prompt Routing: Classificar -> Rotear -> Responder ===\n');

  const resultados: ResultadoRouting[] = [];
  const contadorCategorias: Record<Categoria, number> = {
    tecnico: 0,
    vendas: 0,
    suporte: 0,
    geral: 0,
  };

  for (const mensagem of mensagensClientes) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Mensagem: "${mensagem}"`);

    // Step 1: Classificar
    const { classificacao, tokens: tokensClassificacao } = await classificarMensagem(mensagem);
    console.log(`\nClassificacao: ${classificacao.categoria} (confianca: ${(classificacao.confianca * 100).toFixed(0)}%)`);
    console.log(`Justificativa: ${classificacao.justificativa}`);

    // Step 2: Rotear para especialista
    const { resposta, tokens: tokensResposta } = await rotearParaEspecialista(mensagem, classificacao.categoria);
    console.log(`\n[Especialista ${classificacao.categoria.toUpperCase()}]:`);
    console.log(resposta);

    contadorCategorias[classificacao.categoria]++;

    resultados.push({
      mensagemOriginal: mensagem,
      classificacao,
      respostaEspecialista: resposta,
      tokensTotal: tokensClassificacao + tokensResposta,
    });
  }

  // Resumo
  console.log(`\n${'='.repeat(60)}`);
  console.log('\n=== Resumo do Routing ===');
  console.log(
    'Categoria'.padEnd(15) +
      'Quantidade'.padEnd(15) +
      'Tokens Medios'
  );
  console.log('-'.repeat(45));

  for (const [categoria, count] of Object.entries(contadorCategorias)) {
    if (count === 0) continue;
    const tokensCategoria = resultados
      .filter((r) => r.classificacao.categoria === categoria)
      .reduce((sum, r) => sum + r.tokensTotal, 0);
    const media = Math.round(tokensCategoria / count);
    console.log(
      categoria.padEnd(15) +
        String(count).padEnd(15) +
        String(media)
    );
  }

  const tokensTotal = resultados.reduce((sum, r) => sum + r.tokensTotal, 0);
  console.log('-'.repeat(45));
  console.log(`Total de tokens: ${tokensTotal}`);

  // Custo estimado — Haiku: $0.25/M input, $1.25/M output (simplificado)
  const custoEstimado = (tokensTotal / 1_000_000) * 0.75; // media ponderada
  console.log(`Custo estimado: $${custoEstimado.toFixed(6)}`);
}

executarRouting().then(() => {
  console.log('\n--- Exercicio 16 completo! ---');
});
