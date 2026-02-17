/**
 * Solucao 10: Registry de Prompts
 * Dificuldade: intermediario | Tempo: 20 min
 *
 * PromptRegistry: gerencia templates de prompts com versionamento.
 * Ponte com M1 ex17 (TemplateRegistry) — agora os templates viram prompts executaveis.
 * Execute: npx tsx solucoes/ex10-prompt-registry.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import Handlebars from 'handlebars';

const client = new Anthropic();

// === Tipos ===
type PromptConfig = {
  nome: string;
  versao: string;
  descricao: string;
  modelo: string;
  maxTokens: number;
  systemTemplate: string;
  userTemplate: string;
};

type CompiledPrompt = {
  config: PromptConfig;
  compiledSystem: Handlebars.TemplateDelegate;
  compiledUser: Handlebars.TemplateDelegate;
};

// Solucao TODO 1: Classe PromptRegistry
class PromptRegistry {
  private prompts = new Map<string, CompiledPrompt>();
  private latestVersions = new Map<string, string>();

  private makeKey(nome: string, versao: string): string {
    return `${nome}@${versao}`;
  }

  register(config: PromptConfig): void {
    const key = this.makeKey(config.nome, config.versao);
    const compiledSystem = Handlebars.compile(config.systemTemplate);
    const compiledUser = Handlebars.compile(config.userTemplate);

    this.prompts.set(key, { config, compiledSystem, compiledUser });
    this.latestVersions.set(config.nome, config.versao);
  }

  get(nome: string, versao?: string): PromptConfig | undefined {
    const v = versao ?? this.latestVersions.get(nome);
    if (!v) return undefined;
    return this.prompts.get(this.makeKey(nome, v))?.config;
  }

  list(): string[] {
    return Array.from(this.prompts.keys());
  }

  async execute(
    nome: string,
    dados: Record<string, unknown>,
    versao?: string
  ): Promise<string> {
    const v = versao ?? this.latestVersions.get(nome);
    if (!v) throw new Error(`Prompt "${nome}" nao encontrado.`);

    const key = this.makeKey(nome, v);
    const entry = this.prompts.get(key);
    if (!entry) throw new Error(`Prompt "${key}" nao encontrado.`);

    const systemMsg = entry.compiledSystem(dados);
    const userMsg = entry.compiledUser(dados);

    const response = await client.messages.create({
      model: entry.config.modelo,
      max_tokens: entry.config.maxTokens,
      system: systemMsg,
      messages: [{ role: 'user', content: userMsg }],
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }
}

// Solucao TODO 2 + 3: Instanciar e registrar prompts com templates Handlebars
const registry = new PromptRegistry();

registry.register({
  nome: 'classificador',
  versao: 'v1',
  descricao: 'Classifica texto em categorias predefinidas',
  modelo: 'claude-haiku-4-5-20251001',
  maxTokens: 50,
  systemTemplate:
    'Voce e um classificador de texto. Responda APENAS com o nome da categoria.',
  userTemplate: `Classifique o texto abaixo em uma destas categorias:
{{#each categorias}}
- {{this}}
{{/each}}

Texto: "{{texto}}"

Categoria:`,
});

registry.register({
  nome: 'resumidor',
  versao: 'v1',
  descricao: 'Resume texto com tamanho controlavel',
  modelo: 'claude-haiku-4-5-20251001',
  maxTokens: 150,
  systemTemplate:
    'Voce e um assistente que cria resumos concisos. Maximo {{maxPalavras}} palavras. Responda apenas com o resumo.',
  userTemplate: 'Resume o seguinte texto:\n\n"{{texto}}"',
});

registry.register({
  nome: 'tradutor',
  versao: 'v1',
  descricao: 'Traduz texto para o idioma alvo',
  modelo: 'claude-haiku-4-5-20251001',
  maxTokens: 300,
  systemTemplate:
    'Voce e um tradutor profissional. Traduza para {{idiomaAlvo}}. Responda apenas com a traducao, sem explicacoes.',
  userTemplate: 'Traduza o seguinte texto:\n\n"{{texto}}"',
});

// Exibir prompts registrados
console.log('=== Prompts Registrados ===');
console.log(registry.list().join(', '));

// Solucao TODO 4: Executar cada prompt
const textoTeste =
  'A inteligencia artificial esta transformando o mercado financeiro com algoritmos de trading automatizado, analise de risco em tempo real e deteccao de fraudes.';

console.log(`\nTexto de teste: "${textoTeste.slice(0, 60)}..."`);

console.log('\n--- Classificador ---');
const resultClassificador = await registry.execute('classificador', {
  categorias: ['tecnologia', 'financas', 'saude', 'educacao'],
  texto: textoTeste,
});
console.log(`Categoria: ${resultClassificador}`);

console.log('\n--- Resumidor ---');
const resultResumidor = await registry.execute('resumidor', {
  maxPalavras: 20,
  texto: textoTeste,
});
console.log(`Resumo: ${resultResumidor}`);

console.log('\n--- Tradutor ---');
const resultTradutor = await registry.execute('tradutor', {
  idiomaAlvo: 'ingles',
  texto: textoTeste,
});
console.log(`Traducao: ${resultTradutor}`);

// Solucao TODO 5: Versionamento — v2 do classificador com prompt melhorado
registry.register({
  nome: 'classificador',
  versao: 'v2',
  descricao: 'Classificador v2 — com justificativa e confianca',
  modelo: 'claude-haiku-4-5-20251001',
  maxTokens: 150,
  systemTemplate:
    'Voce e um classificador de texto especialista. Responda em JSON: { "categoria": "...", "confianca": 0.0-1.0, "justificativa": "..." }',
  userTemplate: `Classifique o texto abaixo em uma destas categorias:
{{#each categorias}}
- {{this}}
{{/each}}

Texto: "{{texto}}"`,
});

console.log('\n=== Comparacao v1 vs v2 (classificador) ===');

const dadosClassificacao = {
  categorias: ['tecnologia', 'financas', 'saude', 'educacao'],
  texto: textoTeste,
};

const resultV1 = await registry.execute(
  'classificador',
  dadosClassificacao,
  'v1'
);
const resultV2 = await registry.execute(
  'classificador',
  dadosClassificacao,
  'v2'
);

console.log(`v1 (simples): ${resultV1}`);
console.log(`v2 (detalhado): ${resultV2}`);

console.log('\nPrompts registrados agora:', registry.list().join(', '));

console.log('\n--- Exercicio 10 completo! ---');
