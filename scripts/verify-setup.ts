/**
 * Verifica se o ambiente esta configurado corretamente para o curso.
 * Execute: npx tsx scripts/verify-setup.ts
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

type Check = {
  name: string;
  check: () => boolean;
  fix: string;
};

const checks: Check[] = [
  {
    name: 'Node.js >= 20',
    check: () => {
      const version = process.version.slice(1).split('.').map(Number);
      return version[0] >= 20;
    },
    fix: 'Instale Node.js 20+: https://nodejs.org',
  },
  {
    name: 'Git instalado',
    check: () => {
      try {
        execSync('git --version', { stdio: 'pipe' });
        return true;
      } catch {
        return false;
      }
    },
    fix: 'Instale Git: https://git-scm.com',
  },
  {
    name: 'Arquivo .env existe',
    check: () => existsSync(resolve(process.cwd(), '.env')),
    fix: 'Execute: cp .env.example .env && edite com suas keys',
  },
  {
    name: 'ANTHROPIC_API_KEY configurada',
    check: () => {
      const key = process.env.ANTHROPIC_API_KEY ?? '';
      return key.length > 0 && key !== 'sk-ant-your-key-here';
    },
    fix: 'Adicione sua ANTHROPIC_API_KEY no arquivo .env',
  },
];

console.log('\n=== AI Engineering Course - Setup Check ===\n');

let allPassed = true;

for (const { name, check, fix } of checks) {
  const passed = check();
  const icon = passed ? 'OK' : 'FALHOU';
  console.log(`[${icon}] ${name}`);

  if (!passed) {
    console.log(`      -> ${fix}`);
    allPassed = false;
  }
}

console.log();

if (allPassed) {
  console.log('Tudo pronto! Comece com: cd dia-1/modulo-1-handlebars\n');
} else {
  console.log('Corrija os itens acima antes de comecar.\n');
  process.exit(1);
}
