/**
 * Solucao - Exercicio 19: Sanitizacao e Seguranca
 */

// Nota: zod deve estar instalado no projeto.
// Se nao estiver, execute: npm install zod
import Handlebars from 'handlebars';
import { z } from 'zod';

// === Dados seguros (validos) ===
const dadosSeguros = {
  nome: 'Maria Silva',
  email: 'maria@exemplo.com',
  bio: 'Desenvolvedora com 5 anos de experiencia em AI.',
  website: 'https://maria.dev',
};

// === Dados inseguros (invalidos ou maliciosos) ===
const dadosInseguros = {
  nome: '<script>alert("xss")</script>',
  email: 'invalido-sem-arroba',
  bio: '<img src=x onerror=alert("hack")>Texto normal',
  website: 'javascript:alert(1)',
};

// Solucao TODO 1: Schema Zod para validacao de perfil
const perfilSchema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email(),
  bio: z.string().max(500),
  website: z.string().url().startsWith('https://'),
});

type Perfil = z.infer<typeof perfilSchema>;

// Solucao TODO 2: Funcao renderSeguro
function renderSeguro<T>(
  schema: z.ZodSchema<T>,
  templateStr: string,
  dados: unknown,
): { sucesso: boolean; resultado?: string; erros?: string[] } {
  // Passo 1: Validar dados com Zod
  const validacao = schema.safeParse(dados);

  if (!validacao.success) {
    // Passo 2: Se falhar, retornar erros formatados
    const erros = validacao.error.issues.map(
      (issue) => `[${issue.path.join('.')}] ${issue.message}`
    );
    return { sucesso: false, erros };
  }

  // Passo 3: Se passar, compilar e renderizar
  const template = Handlebars.compile(templateStr);
  const resultado = template(validacao.data);
  return { sucesso: true, resultado };
}

// Solucao TODO 3: Helper "sanitizar" que remove tags HTML
Handlebars.registerHelper('sanitizar', function (texto: unknown) {
  if (typeof texto === 'string') {
    return texto.replace(/<[^>]*>/g, '');
  }
  return texto;
});

// Template de perfil de usuario
const templatePerfil = `=== Perfil de Usuario ===
Nome: {{nome}}
Email: {{email}}
Bio: {{bio}}
Website: {{website}}`;

// Template com sanitizacao explicita
const templatePerfilSanitizado = `=== Perfil de Usuario (Sanitizado) ===
Nome: {{sanitizar nome}}
Email: {{sanitizar email}}
Bio: {{sanitizar bio}}
Website: {{sanitizar website}}`;

// Solucao TODO 4: Teste com dados seguros e inseguros
console.log('=== Teste com dados SEGUROS ===');
const resultadoSeguro = renderSeguro(perfilSchema, templatePerfil, dadosSeguros);
if (resultadoSeguro.sucesso) {
  console.log('Validacao: PASSOU');
  console.log(resultadoSeguro.resultado);
} else {
  console.log('Validacao: FALHOU');
  console.log('Erros:', resultadoSeguro.erros);
}

console.log('\n=== Teste com dados INSEGUROS ===');
const resultadoInseguro = renderSeguro(perfilSchema, templatePerfil, dadosInseguros);
if (resultadoInseguro.sucesso) {
  console.log('Validacao: PASSOU');
  console.log(resultadoInseguro.resultado);
} else {
  console.log('Validacao: FALHOU');
  resultadoInseguro.erros?.forEach((erro) => console.log(`  - ${erro}`));
}

// Demonstracao: Handlebars ja escapa HTML por padrao com {{ }}
console.log('\n=== Demonstracao: Escape padrao do Handlebars ===');
const templateEscape = Handlebars.compile('Nome: {{nome}}');
console.log('Input: <script>alert("xss")</script>');
console.log('Output:', templateEscape({ nome: '<script>alert("xss")</script>' }));
console.log('Handlebars escapa automaticamente com {{ }}, mas validacao Zod impede dados invalidos ANTES.');

// Demonstracao: Helper sanitizar como camada extra
console.log('\n=== Demonstracao: Helper sanitizar ===');
const templateSanitizar = Handlebars.compile('Bio: {{sanitizar bio}}');
console.log('Input: <img src=x onerror=alert("hack")>Texto normal');
console.log('Output:', templateSanitizar({ bio: '<img src=x onerror=alert("hack")>Texto normal' }));

// Solucao TODO 5: Padrao "Safe Template"
function criarTemplateSafe<T>(config: {
  schema: z.ZodSchema<T>;
  template: string;
  helpers?: Record<string, (...args: unknown[]) => unknown>;
}): (dados: unknown) => { sucesso: boolean; resultado?: string; erros?: string[] } {
  // Registrar helpers se fornecidos
  if (config.helpers) {
    for (const [nome, fn] of Object.entries(config.helpers)) {
      Handlebars.registerHelper(nome, fn);
    }
  }

  // Retornar funcao de renderizacao que valida + renderiza
  return (dados: unknown) => {
    return renderSeguro(config.schema, config.template, dados);
  };
}

// Uso do padrao Safe Template
console.log('\n=== Teste com Safe Template Pattern ===');

const renderPerfil = criarTemplateSafe({
  schema: perfilSchema,
  template: templatePerfilSanitizado,
  helpers: {
    uppercase: (texto: unknown) => (typeof texto === 'string' ? texto.toUpperCase() : texto),
  },
});

// Teste com dados validos
const safeResultado = renderPerfil(dadosSeguros);
console.log('Dados seguros:', safeResultado.sucesso ? 'PASSOU' : 'FALHOU');
if (safeResultado.sucesso) {
  console.log(safeResultado.resultado);
}

// Teste com dados invalidos
const unsafeResultado = renderPerfil(dadosInseguros);
console.log('\nDados inseguros:', unsafeResultado.sucesso ? 'PASSOU' : 'FALHOU');
if (!unsafeResultado.sucesso) {
  unsafeResultado.erros?.forEach((erro) => console.log(`  - ${erro}`));
}

// Teste com dados parcialmente invalidos
console.log('\n=== Teste com dados parcialmente invalidos ===');
const dadosParciais = {
  nome: 'Jo', // valido (minimo 2)
  email: 'joao@test.com',
  bio: 'Dev',
  website: 'http://joao.dev', // invalido (nao e https)
};

const parcialResultado = renderPerfil(dadosParciais);
console.log('Dados parciais:', parcialResultado.sucesso ? 'PASSOU' : 'FALHOU');
if (!parcialResultado.sucesso) {
  parcialResultado.erros?.forEach((erro) => console.log(`  - ${erro}`));
}

console.log('\n=== Resumo de Seguranca ===');
console.log('1. Zod valida dados ANTES da renderizacao (schema-first)');
console.log('2. Handlebars escapa HTML automaticamente com {{ }}');
console.log('3. Helper sanitizar remove tags como camada extra');
console.log('4. Padrao Safe Template compoe schema + template + helpers');
console.log('5. Esses padroes serao reutilizados no Modulo 3 (Tool Use) e Modulo 4 (Data Pipelines)');
