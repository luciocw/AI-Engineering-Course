/**
 * Solucao 18: Avaliacao de Qualidade (LLM-as-Judge)
 *
 * Use Claude como juiz para avaliar a qualidade das proprias respostas.
 * Execute: npx tsx solucoes/ex18-avaliacao-qualidade.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Tipos ===

type Avaliacao = {
  clareza: number;
  completude: number;
  precisao: number;
  justificativa: string;
};

type RespostaModelo = {
  modelo: string;
  modeloNome: string;
  prompt: string;
  resposta: string;
  inputTokens: number;
  outputTokens: number;
};

type ResultadoAvaliacao = {
  prompt: string;
  modelo: string;
  resposta: string;
  avaliacao: Avaliacao;
  media: number;
};

// === Prompts de teste ===
const promptsTeste = [
  'Explique o conceito de recursao em programacao para um iniciante.',
  'Quais sao as vantagens e desvantagens de microservicos vs monolito?',
  'Como funciona o garbage collector em linguagens como Java e Go?',
];

// === Modelos para comparar ===
const modelos: Array<{ id: string; nome: string }> = [
  { id: 'claude-haiku-4-5-20251001', nome: 'Haiku 4.5' },
  { id: 'claude-sonnet-4-20250514', nome: 'Sonnet 4' },
];

// Gerar respostas de ambos os modelos
async function gerarRespostas(): Promise<RespostaModelo[]> {
  const respostas: RespostaModelo[] = [];

  for (const prompt of promptsTeste) {
    for (const modelo of modelos) {
      console.log(`Gerando resposta: ${modelo.nome} -> "${prompt.slice(0, 40)}..."`);

      const response = await client.messages.create({
        model: modelo.id,
        max_tokens: 500,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: `${prompt} Responda em portugues de forma concisa (max 3-4 frases).`,
          },
        ],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';

      respostas.push({
        modelo: modelo.id,
        modeloNome: modelo.nome,
        prompt,
        resposta: text,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      });
    }
  }

  return respostas;
}

// Prompt do juiz
function buildJudgePrompt(promptOriginal: string, resposta: string): string {
  return `Voce e um avaliador especialista em qualidade de respostas de IA.
Avalie a resposta abaixo com base em 3 criterios, dando uma nota de 0 a 10 para cada:

- clareza: quao clara, bem estruturada e acessivel e a explicacao
- completude: quao completa e abrangente e a resposta (cobre os pontos importantes?)
- precisao: quao precisa e tecnicamente correta e a informacao

Retorne APENAS um JSON valido:
{
  "clareza": 0,
  "completude": 0,
  "precisao": 0,
  "justificativa": "breve explicacao da avaliacao em 1-2 frases"
}

Pergunta original: "${promptOriginal}"

Resposta a avaliar:
${resposta}`;
}

// Avaliar uma resposta usando Sonnet como juiz
async function avaliarResposta(promptOriginal: string, resposta: string): Promise<Avaliacao> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    temperature: 0,
    messages: [{ role: 'user', content: buildJudgePrompt(promptOriginal, resposta) }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return JSON.parse(text);
}

// Executar avaliacao completa
async function executarAvaliacao() {
  console.log('=== LLM-as-Judge: Avaliacao de Qualidade ===\n');

  // Step 1: Gerar respostas
  console.log('--- Gerando respostas dos modelos ---');
  const respostas = await gerarRespostas();
  console.log(`\n${respostas.length} respostas geradas.\n`);

  // Step 2: Avaliar cada resposta
  console.log('--- Avaliando com Sonnet (juiz) ---');
  const resultados: ResultadoAvaliacao[] = [];

  for (const resp of respostas) {
    console.log(`Avaliando: ${resp.modeloNome} -> "${resp.prompt.slice(0, 40)}..."`);

    const avaliacao = await avaliarResposta(resp.prompt, resp.resposta);
    const media = Number(((avaliacao.clareza + avaliacao.completude + avaliacao.precisao) / 3).toFixed(1));

    resultados.push({
      prompt: resp.prompt,
      modelo: resp.modeloNome,
      resposta: resp.resposta,
      avaliacao,
      media,
    });
  }

  // Step 3: Tabela comparativa
  console.log('\n=== Tabela de Avaliacao ===');
  console.log(
    'Prompt'.padEnd(22) +
      'Modelo'.padEnd(14) +
      'Clareza'.padEnd(10) +
      'Complet.'.padEnd(10) +
      'Precisao'.padEnd(10) +
      'Media'
  );
  console.log('-'.repeat(70));

  for (const r of resultados) {
    const promptCurto = r.prompt.length > 19
      ? r.prompt.slice(0, 19) + '...'
      : r.prompt;
    console.log(
      promptCurto.padEnd(22) +
        r.modelo.padEnd(14) +
        String(r.avaliacao.clareza).padEnd(10) +
        String(r.avaliacao.completude).padEnd(10) +
        String(r.avaliacao.precisao).padEnd(10) +
        String(r.media)
    );
  }

  // Media geral por modelo
  console.log('\n=== Media Geral por Modelo ===');
  console.log(
    'Modelo'.padEnd(14) +
      'Clareza'.padEnd(10) +
      'Complet.'.padEnd(10) +
      'Precisao'.padEnd(10) +
      'Media'
  );
  console.log('-'.repeat(50));

  for (const modelo of modelos) {
    const modeloResultados = resultados.filter((r) => r.modelo === modelo.nome);
    const avgClareza = modeloResultados.reduce((s, r) => s + r.avaliacao.clareza, 0) / modeloResultados.length;
    const avgCompletude = modeloResultados.reduce((s, r) => s + r.avaliacao.completude, 0) / modeloResultados.length;
    const avgPrecisao = modeloResultados.reduce((s, r) => s + r.avaliacao.precisao, 0) / modeloResultados.length;
    const avgMedia = modeloResultados.reduce((s, r) => s + r.media, 0) / modeloResultados.length;

    console.log(
      modelo.nome.padEnd(14) +
        avgClareza.toFixed(1).padEnd(10) +
        avgCompletude.toFixed(1).padEnd(10) +
        avgPrecisao.toFixed(1).padEnd(10) +
        avgMedia.toFixed(1)
    );
  }

  // Justificativas
  console.log('\n=== Justificativas do Juiz ===');
  for (const r of resultados) {
    const promptCurto = r.prompt.length > 40 ? r.prompt.slice(0, 40) + '...' : r.prompt;
    console.log(`\n[${r.modelo}] "${promptCurto}"`);
    console.log(`  ${r.avaliacao.justificativa}`);
  }
}

executarAvaliacao().then(() => {
  console.log('\n--- Exercicio 18 completo! ---');
});
