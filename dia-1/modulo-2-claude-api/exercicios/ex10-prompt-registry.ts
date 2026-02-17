/**
 * Exercicio 10: Registry de Prompts
 * Dificuldade: intermediario | Tempo: 20 min
 *
 * Construa um PromptRegistry que gerencia templates de prompts.
 * Ponte com M1 ex17 (TemplateRegistry) — agora os templates viram prompts executaveis.
 * Execute: npx tsx exercicios/ex10-prompt-registry.ts
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

// === TODO 1: Crie a classe PromptRegistry ===
// Metodos:
//   register(config: PromptConfig): void
//     - Compila os templates Handlebars
//     - Armazena com chave "nome@versao" (ex: "classificador@v1")
//   get(nome: string, versao?: string): PromptConfig | undefined
//     - Se versao nao informada, retorna a ultima registrada para o nome
//   list(): string[]
//     - Retorna todas as chaves registradas
//   execute(nome: string, dados: Record<string, unknown>, versao?: string): Promise<string>
//     - Renderiza os templates com os dados
//     - Chama a Claude API com os templates renderizados
//     - Retorna o texto da resposta

// class PromptRegistry {
//   private prompts = new Map<string, { config: PromptConfig; compiledSystem: ...; compiledUser: ... }>();
//   private latestVersions = new Map<string, string>();
//   ...
// }

// === TODO 2: Instancie o registry e registre 3 prompts ===
// Prompt 1 — classificador: classifica texto em categorias
// Prompt 2 — resumidor: resume texto com tamanho controlavel
// Prompt 3 — tradutor: traduz texto para idioma alvo

// const registry = new PromptRegistry();
// registry.register({ nome: 'classificador', versao: 'v1', ... });
// registry.register({ nome: 'resumidor', versao: 'v1', ... });
// registry.register({ nome: 'tradutor', versao: 'v1', ... });

// === TODO 3: Templates com Handlebars ===
// Cada prompt deve usar variaveis Handlebars:
// - classificador: {{categorias}}, {{texto}}
// - resumidor: {{maxPalavras}}, {{texto}}
// - tradutor: {{idiomaAlvo}}, {{texto}}
// Dica: use {{#each}} para listar categorias.

// === TODO 4: Execute cada prompt com dados de teste ===
// Texto de teste: "A inteligencia artificial esta transformando o mercado financeiro..."
// - classificador: categorias [tecnologia, financas, saude, educacao]
// - resumidor: maxPalavras 20
// - tradutor: idiomaAlvo "ingles"

// const textoTeste = '...';
// const resultClassificador = await registry.execute('classificador', { ... });
// const resultResumidor = await registry.execute('resumidor', { ... });
// const resultTradutor = await registry.execute('tradutor', { ... });

// === TODO 5: Adicione versionamento ===
// Registre uma v2 do classificador com prompt melhorado (mais detalhado).
// Execute v1 e v2 com o mesmo input e compare.

// registry.register({ nome: 'classificador', versao: 'v2', ... });
// const resultV1 = await registry.execute('classificador', dados, 'v1');
// const resultV2 = await registry.execute('classificador', dados, 'v2');

console.log('\n--- Exercicio 10 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex10-prompt-registry.ts');
