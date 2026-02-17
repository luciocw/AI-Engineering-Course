/**
 * Solucao - Exercicio 17: Registry de Templates
 */

import Handlebars from 'handlebars';

// === Tipo de configuracao de template ===
type TemplateConfig = {
  nome: string;
  template: string;
  descricao: string;
};

// Solucao TODO 1: Classe TemplateRegistry
class TemplateRegistry {
  private templates = new Map<
    string,
    { config: TemplateConfig; compilado: Handlebars.TemplateDelegate }
  >();
  private handlebars: typeof Handlebars;

  constructor() {
    // Cria instancia isolada para nao poluir o escopo global
    this.handlebars = Handlebars.create();
  }

  register(config: TemplateConfig): void {
    const compilado = this.handlebars.compile(config.template);
    this.templates.set(config.nome, { config, compilado });
  }

  render(nome: string, dados: Record<string, unknown>): string {
    const entry = this.templates.get(nome);
    if (!entry) {
      throw new Error(`Template "${nome}" nao encontrado. Disponiveis: ${this.list().join(', ')}`);
    }
    return entry.compilado(dados);
  }

  list(): string[] {
    return Array.from(this.templates.keys());
  }

  has(nome: string): boolean {
    return this.templates.has(nome);
  }

  // Solucao TODO 3: registerHelper delegando para instancia isolada
  registerHelper(name: string, fn: Handlebars.HelperDelegate): void {
    this.handlebars.registerHelper(name, fn);
  }

  // Solucao TODO 4: renderAll
  renderAll(dados: Record<string, unknown>): Record<string, string> {
    const resultados: Record<string, string> = {};
    for (const [nome] of this.templates) {
      resultados[nome] = this.render(nome, dados);
    }
    return resultados;
  }
}

// Solucao TODO 2: Registrar 3 templates
const registry = new TemplateRegistry();

registry.register({
  nome: 'email-boas-vindas',
  descricao: 'Template de email de boas-vindas para novos usuarios',
  template: `Ola {{nome}}! Bem-vindo a {{empresa}}.
Seu plano {{plano}} esta ativo.
{{#if premium}}Voce tem acesso VIP!{{/if}}`,
});

registry.register({
  nome: 'notificacao-pagamento',
  descricao: 'Notificacao de confirmacao de pagamento',
  template: `Pagamento {{status}}: R$ {{valor}} em {{data}}.
{{#if parcelas}}Parcelado em {{parcelas}}x{{/if}}`,
});

registry.register({
  nome: 'relatorio-diario',
  descricao: 'Relatorio diario com metricas e destaques',
  template: `Relatorio {{data}}
Novos usuarios: {{novosUsuarios}}
Receita: R$ {{receita}}
{{#each destaques}}* {{this}}
{{/each}}`,
});

// Solucao TODO 3: Registrar helper currency
registry.registerHelper('currency', (valor: number) => {
  return Number(valor).toFixed(2).replace('.', ',');
});

// === Teste ===

console.log('=== Templates Registrados ===');
console.log('Templates:', registry.list());
console.log('Tem email-boas-vindas?', registry.has('email-boas-vindas'));
console.log('Tem inexistente?', registry.has('inexistente'));
console.log('');

// Renderizar email
console.log('=== Email de Boas-Vindas ===');
console.log(
  registry.render('email-boas-vindas', {
    nome: 'Ana Silva',
    empresa: 'TechAI',
    plano: 'Premium',
    premium: true,
  }),
);

// Renderizar notificacao
console.log('\n=== Notificacao de Pagamento ===');
console.log(
  registry.render('notificacao-pagamento', {
    status: 'confirmado',
    valor: '497,50',
    data: '15/01/2026',
    parcelas: 3,
  }),
);

// Renderizar relatorio
console.log('\n=== Relatorio Diario ===');
console.log(
  registry.render('relatorio-diario', {
    data: '15/01/2026',
    novosUsuarios: 42,
    receita: '12.500,00',
    destaques: [
      'Lancamento do curso de AI Engineering',
      'Recorde de acessos simultaneos',
      'Nova integracao com Claude API',
    ],
  }),
);

// Teste renderAll
console.log('\n=== Render All ===');
const todosResultados = registry.renderAll({
  nome: 'Carlos',
  empresa: 'StartupAI',
  plano: 'Basico',
  premium: false,
  status: 'pendente',
  valor: '99,90',
  data: '20/01/2026',
  parcelas: 0,
  novosUsuarios: 15,
  receita: '3.200,00',
  destaques: ['Primeiro dia de operacao'],
});

for (const [nome, resultado] of Object.entries(todosResultados)) {
  console.log(`\n--- ${nome} ---`);
  console.log(resultado);
}

// Teste de erro
console.log('\n=== Teste de Erro ===');
try {
  registry.render('template-inexistente', {});
} catch (error) {
  console.log('Erro esperado:', (error as Error).message);
}

// Solucao TODO 5: Export
export { TemplateRegistry };
