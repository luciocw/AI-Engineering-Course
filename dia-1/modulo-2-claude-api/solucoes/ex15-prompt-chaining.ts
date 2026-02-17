/**
 * Solucao 15: Prompt Chaining
 *
 * Encadeie multiplas chamadas a Claude onde a saida de cada etapa
 * alimenta a entrada da proxima.
 * Execute: npx tsx solucoes/ex15-prompt-chaining.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Tipos ===

type FatosExtraidos = {
  nome: string;
  setor: string;
  fundacao: string;
  produtos: string[];
  metricas: string[];
  diferenciais: string[];
};

type ResumoEmpresa = {
  titulo: string;
  resumo: string;
  pontosChave: string[];
};

type PostSocial = {
  plataforma: 'Twitter' | 'LinkedIn' | 'Instagram';
  conteudo: string;
  hashtags: string[];
};

type EtapaChain = {
  nome: string;
  inputTokens: number;
  outputTokens: number;
  resultado: string;
};

// === Texto bruto sobre a empresa ===
const textoEmpresa = `
A NovaTech Solutions foi fundada em 2019 em Sao Paulo por dois engenheiros
ex-Google. A empresa desenvolve plataformas de automacao com IA para o setor
financeiro. Seu principal produto, o FinBot Pro, processa mais de 2 milhoes
de transacoes por dia e ja atende 45 bancos na America Latina. Em 2024, a
empresa captou uma Serie B de R$120 milhoes liderada pelo SoftBank. A NovaTech
se diferencia por usar modelos de linguagem proprietarios treinados
especificamente para compliance bancario. A equipe cresceu de 15 para 280
funcionarios em 3 anos. O produto tambem inclui o RiskGuard, uma ferramenta
de deteccao de fraudes em tempo real com precisao de 99.7%. A empresa planeja
expansao para Europa em 2025.
`;

// Step 1 — Extrair fatos estruturados
async function step1ExtrairFatos(texto: string): Promise<{ fatos: FatosExtraidos; etapa: EtapaChain }> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: `Extraia os fatos principais do texto abaixo e retorne APENAS um JSON valido no formato:
{
  "nome": "nome da empresa",
  "setor": "setor de atuacao",
  "fundacao": "ano e local",
  "produtos": ["produto1", "produto2"],
  "metricas": ["metrica1", "metrica2"],
  "diferenciais": ["diferencial1", "diferencial2"]
}

Texto:
${texto}`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const fatos: FatosExtraidos = JSON.parse(text);

  return {
    fatos,
    etapa: {
      nome: 'Step 1: Extrair Fatos',
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      resultado: text,
    },
  };
}

// Step 2 — Gerar resumo executivo
async function step2GerarResumo(fatos: FatosExtraidos): Promise<{ resumo: ResumoEmpresa; etapa: EtapaChain }> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: `Com base nos fatos extraidos abaixo, gere um resumo executivo.
Retorne APENAS um JSON valido no formato:
{
  "titulo": "titulo chamativo para o resumo",
  "resumo": "resumo executivo de 3-4 frases",
  "pontosChave": ["ponto1", "ponto2", "ponto3"]
}

Fatos:
${JSON.stringify(fatos, null, 2)}`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const resumo: ResumoEmpresa = JSON.parse(text);

  return {
    resumo,
    etapa: {
      nome: 'Step 2: Gerar Resumo',
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      resultado: text,
    },
  };
}

// Step 3 — Criar posts para redes sociais
async function step3CriarPosts(resumo: ResumoEmpresa): Promise<{ posts: PostSocial[]; etapa: EtapaChain }> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    temperature: 0.7,
    messages: [
      {
        role: 'user',
        content: `Com base no resumo abaixo, crie 3 posts para redes sociais.
Retorne APENAS um JSON valido — um array com 3 objetos no formato:
[
  {
    "plataforma": "Twitter",
    "conteudo": "texto do post (max 280 caracteres para Twitter)",
    "hashtags": ["hash1", "hash2"]
  },
  {
    "plataforma": "LinkedIn",
    "conteudo": "texto profissional e detalhado",
    "hashtags": ["hash1", "hash2"]
  },
  {
    "plataforma": "Instagram",
    "conteudo": "texto casual e engajante com emojis",
    "hashtags": ["hash1", "hash2"]
  }
]

Resumo:
Titulo: ${resumo.titulo}
${resumo.resumo}
Pontos-chave: ${resumo.pontosChave.join(', ')}`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const posts: PostSocial[] = JSON.parse(text);

  return {
    posts,
    etapa: {
      nome: 'Step 3: Criar Posts',
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      resultado: text,
    },
  };
}

// Executar chain completa
async function executarChain() {
  console.log('=== Prompt Chaining: Texto -> Fatos -> Resumo -> Posts ===\n');

  const etapas: EtapaChain[] = [];

  // Step 1
  console.log('--- Step 1: Extraindo fatos... ---');
  const { fatos, etapa: etapa1 } = await step1ExtrairFatos(textoEmpresa);
  etapas.push(etapa1);
  console.log('Fatos extraidos:');
  console.log(JSON.stringify(fatos, null, 2));

  // Step 2
  console.log('\n--- Step 2: Gerando resumo... ---');
  const { resumo, etapa: etapa2 } = await step2GerarResumo(fatos);
  etapas.push(etapa2);
  console.log(`Titulo: ${resumo.titulo}`);
  console.log(`Resumo: ${resumo.resumo}`);
  console.log(`Pontos-chave: ${resumo.pontosChave.join(' | ')}`);

  // Step 3
  console.log('\n--- Step 3: Criando posts... ---');
  const { posts, etapa: etapa3 } = await step3CriarPosts(resumo);
  etapas.push(etapa3);

  for (const post of posts) {
    console.log(`\n[${post.plataforma}]`);
    console.log(post.conteudo);
    console.log(`Hashtags: ${post.hashtags.map((h) => `#${h}`).join(' ')}`);
  }

  // Tabela de tokens por etapa
  console.log('\n=== Rastreamento de Tokens ===');
  console.log(
    'Etapa'.padEnd(28) +
      'Input'.padEnd(10) +
      'Output'.padEnd(10) +
      'Total'
  );
  console.log('-'.repeat(55));

  let totalInput = 0;
  let totalOutput = 0;

  for (const etapa of etapas) {
    const total = etapa.inputTokens + etapa.outputTokens;
    totalInput += etapa.inputTokens;
    totalOutput += etapa.outputTokens;
    console.log(
      etapa.nome.padEnd(28) +
        String(etapa.inputTokens).padEnd(10) +
        String(etapa.outputTokens).padEnd(10) +
        String(total)
    );
  }

  console.log('-'.repeat(55));
  console.log(
    'TOTAL'.padEnd(28) +
      String(totalInput).padEnd(10) +
      String(totalOutput).padEnd(10) +
      String(totalInput + totalOutput)
  );

  // Custo total — Haiku: $0.25/M input, $1.25/M output
  const custoInput = (totalInput / 1_000_000) * 0.25;
  const custoOutput = (totalOutput / 1_000_000) * 1.25;
  const custoTotal = custoInput + custoOutput;

  console.log(`\n=== Custo Total da Chain ===`);
  console.log(`  Input:  $${custoInput.toFixed(6)}`);
  console.log(`  Output: $${custoOutput.toFixed(6)}`);
  console.log(`  Total:  $${custoTotal.toFixed(6)}`);
}

executarChain().then(() => {
  console.log('\n--- Exercicio 15 completo! ---');
});
