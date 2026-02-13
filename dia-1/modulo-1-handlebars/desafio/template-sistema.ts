/**
 * Desafio: Sistema de Templates Completo
 *
 * Construa um sistema que gerencia e renderiza templates de prompt.
 * Execute: npx tsx desafio/template-sistema.ts
 */

import Handlebars from 'handlebars';

// === Tipos ===
type TemplateConfig = {
  name: string;
  description: string;
  template: string;
  requiredFields: string[];
};

type TemplateRegistry = Map<string, TemplateConfig>;

// === TODO 1: Registre helpers globais ===
// Crie pelo menos 3 helpers uteis para prompts de AI:
// - uppercase
// - formatList (array -> "item1, item2 e item3")
// - limitWords (corta em N palavras)

// === TODO 2: Crie 3 templates ===
// Preencha os templates abaixo com Handlebars valido.

const templates: TemplateConfig[] = [
  {
    name: 'suporte-tecnico',
    description: 'System prompt para assistente de suporte',
    template: `TODO: crie template de suporte tecnico`,
    requiredFields: ['empresa', 'produto', 'idioma'],
  },
  {
    name: 'analista-dados',
    description: 'System prompt para analista de dados',
    template: `TODO: crie template de analista de dados`,
    requiredFields: ['dataset', 'objetivo', 'formato'],
  },
  {
    name: 'tradutor',
    description: 'System prompt para tradutor multilingue',
    template: `TODO: crie template de tradutor`,
    requiredFields: ['idiomaOrigem', 'idiomaDestino', 'contexto'],
  },
];

// === TODO 3: Implemente o TemplateManager ===

class TemplateManager {
  private registry: TemplateRegistry = new Map();

  register(config: TemplateConfig): void {
    // TODO: registre o template no registry
  }

  renderPrompt(templateName: string, data: Record<string, unknown>): string {
    // TODO:
    // 1. Busque o template pelo nome
    // 2. Valide campos obrigatorios
    // 3. Compile e renderize
    // 4. Retorne o resultado
    return 'TODO';
  }

  listTemplates(): string[] {
    // TODO: retorne nomes de todos templates registrados
    return [];
  }
}

// === TODO 4: Teste o sistema ===

const manager = new TemplateManager();

// Registre os templates
for (const tmpl of templates) {
  manager.register(tmpl);
}

// Liste templates disponiveis
console.log('Templates disponiveis:', manager.listTemplates());

// Renderize cada template com dados de exemplo
// TODO: adicione chamadas de renderPrompt com dados reais

console.log('\n--- Desafio completo! ---');
