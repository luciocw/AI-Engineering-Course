import Handlebars from 'handlebars';

export type RunResult = {
  output: string[];
  error: string | null;
  duration: number;
};

export async function runExercise(code: string, moduleSlug: string): Promise<RunResult> {
  if (moduleSlug === 'module-1-handlebars') {
    return runHandlebarsExercise(code);
  }
  return {
    output: ['This exercise requires a local environment to run.', 'Run it with: npx tsx exercises/<file>.ts'],
    error: null,
    duration: 0,
  };
}

async function runHandlebarsExercise(code: string): Promise<RunResult> {
  const logs: string[] = [];
  const start = performance.now();

  const mockConsole = {
    log: (...args: unknown[]) => logs.push(args.map(formatArg).join(' ')),
    error: (...args: unknown[]) => logs.push('[ERROR] ' + args.map(formatArg).join(' ')),
    warn: (...args: unknown[]) => logs.push('[WARN] ' + args.map(formatArg).join(' ')),
    info: (...args: unknown[]) => logs.push('[INFO] ' + args.map(formatArg).join(' ')),
    table: (data: unknown) => logs.push(JSON.stringify(data, null, 2)),
    dir: (obj: unknown) => logs.push(JSON.stringify(obj, null, 2)),
  };

  try {
    // Strip TypeScript imports and type annotations
    let processed = code
      // Remove import statements
      .replace(/import\s+.*?from\s+['"][^'"]+['"];?\s*/g, '')
      .replace(/import\s*{[^}]*}\s*from\s+['"][^'"]+['"];?\s*/g, '')
      // Remove export keywords
      .replace(/export\s+(default\s+)?/g, '')
      // Remove type annotations (basic — covers most cases)
      .replace(/:\s*(string|number|boolean|void|any|unknown|never|Record<[^>]+>|Array<[^>]+>)\s*/g, ' ')
      // Remove "as const" and "as Type"
      .replace(/\s+as\s+const/g, '')
      .replace(/\s+as\s+[A-Z][a-zA-Z<>,\s|]+/g, '')
      // Remove interface/type declarations
      .replace(/(?:interface|type)\s+\w+[^{]*\{[^}]*\}/g, '')
      // Remove standalone type declarations (single line)
      .replace(/^type\s+\w+\s*=\s*[^;]+;/gm, '');

    // Wrap in async function to support top-level await
    const wrappedCode = `
      return (async function() {
        ${processed}
      })();
    `;

    const fn = new Function('Handlebars', 'console', wrappedCode);
    await fn(Handlebars, mockConsole);

    return {
      output: logs,
      error: null,
      duration: Math.round(performance.now() - start),
    };
  } catch (err) {
    return {
      output: logs,
      error: err instanceof Error ? err.message : String(err),
      duration: Math.round(performance.now() - start),
    };
  }
}

function formatArg(arg: unknown): string {
  if (arg === null) return 'null';
  if (arg === undefined) return 'undefined';
  if (typeof arg === 'object') {
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}
