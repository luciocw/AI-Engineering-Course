/**
 * Solution - Exercise 17: Template Registry
 */

import Handlebars from 'handlebars';

// === Template configuration type ===
type TemplateConfig = {
  name: string;
  template: string;
  description: string;
};

// Solution TODO 1: TemplateRegistry class
class TemplateRegistry {
  private templates = new Map<
    string,
    { config: TemplateConfig; compiled: Handlebars.TemplateDelegate }
  >();
  private handlebars: typeof Handlebars;

  constructor() {
    // Create isolated instance to avoid polluting global scope
    this.handlebars = Handlebars.create();
  }

  register(config: TemplateConfig): void {
    const compiled = this.handlebars.compile(config.template);
    this.templates.set(config.name, { config, compiled });
  }

  render(name: string, data: Record<string, unknown>): string {
    const entry = this.templates.get(name);
    if (!entry) {
      throw new Error(`Template "${name}" not found. Available: ${this.list().join(', ')}`);
    }
    return entry.compiled(data);
  }

  list(): string[] {
    return Array.from(this.templates.keys());
  }

  has(name: string): boolean {
    return this.templates.has(name);
  }

  // Solution TODO 3: registerHelper delegating to isolated instance
  registerHelper(name: string, fn: Handlebars.HelperDelegate): void {
    this.handlebars.registerHelper(name, fn);
  }

  // Solution TODO 4: renderAll
  renderAll(data: Record<string, unknown>): Record<string, string> {
    const results: Record<string, string> = {};
    for (const [name] of this.templates) {
      results[name] = this.render(name, data);
    }
    return results;
  }
}

// Solution TODO 2: Register 3 templates
const registry = new TemplateRegistry();

registry.register({
  name: 'welcome-email',
  description: 'Welcome email template for new users',
  template: `Hello {{name}}! Welcome to {{company}}.
Your {{plan}} plan is active.
{{#if premium}}You have VIP access!{{/if}}`,
});

registry.register({
  name: 'payment-notification',
  description: 'Payment confirmation notification',
  template: `Payment {{status}}: R$ {{amount}} on {{date}}.
{{#if installments}}Split into {{installments}}x{{/if}}`,
});

registry.register({
  name: 'daily-report',
  description: 'Daily report with metrics and highlights',
  template: `Report {{date}}
New users: {{newUsers}}
Revenue: R$ {{revenue}}
{{#each highlights}}* {{this}}
{{/each}}`,
});

// Solution TODO 3: Register helper currency
registry.registerHelper('currency', (value: number) => {
  return Number(value).toFixed(2).replace('.', ',');
});

// === Test ===

console.log('=== Registered Templates ===');
console.log('Templates:', registry.list());
console.log('Has welcome-email?', registry.has('welcome-email'));
console.log('Has nonexistent?', registry.has('nonexistent'));
console.log('');

// Render email
console.log('=== Welcome Email ===');
console.log(
  registry.render('welcome-email', {
    name: 'Ana Silva',
    company: 'TechAI',
    plan: 'Premium',
    premium: true,
  }),
);

// Render notification
console.log('\n=== Payment Notification ===');
console.log(
  registry.render('payment-notification', {
    status: 'confirmed',
    amount: '497,50',
    date: '01/15/2026',
    installments: 3,
  }),
);

// Render report
console.log('\n=== Daily Report ===');
console.log(
  registry.render('daily-report', {
    date: '01/15/2026',
    newUsers: 42,
    revenue: '12,500.00',
    highlights: [
      'AI Engineering course launch',
      'Record simultaneous users',
      'New Claude API integration',
    ],
  }),
);

// Test renderAll
console.log('\n=== Render All ===');
const allResults = registry.renderAll({
  name: 'Carlos',
  company: 'StartupAI',
  plan: 'Basic',
  premium: false,
  status: 'pending',
  amount: '99.90',
  date: '01/20/2026',
  installments: 0,
  newUsers: 15,
  revenue: '3,200.00',
  highlights: ['First day of operation'],
});

for (const [name, result] of Object.entries(allResults)) {
  console.log(`\n--- ${name} ---`);
  console.log(result);
}

// Error test
console.log('\n=== Error Test ===');
try {
  registry.render('nonexistent-template', {});
} catch (error) {
  console.log('Expected error:', (error as Error).message);
}

// Solution TODO 5: Export
export { TemplateRegistry };
