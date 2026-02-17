type Exercise = {
  slug: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  isFree: boolean;
};

type Module = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  exercises: Exercise[];
};

type Day = {
  slug: string;
  title: string;
  description: string;
  isFree: boolean;
  modules: Module[];
};

export type { Exercise, Module, Day };

export const COURSE_MANIFEST: Day[] = [
  {
    slug: 'day-1',
    title: 'Day 1: Foundations',
    description: 'From templates to data pipelines. Build your first AI-powered customer support system.',
    isFree: true,
    modules: [
      {
        slug: 'module-1-handlebars',
        title: 'Handlebars Templates',
        description: 'Dynamic prompt templates for AI applications. Variables, helpers, partials, and a full template registry.',
        icon: '{}',
        exercises: [
          { slug: 'ex1-hello-template', title: 'Hello Template', description: 'Your first Handlebars template with variables.', difficulty: 'beginner', estimatedMinutes: 10, isFree: true },
          { slug: 'ex2-variaveis-contexto', title: 'Context Variables', description: 'Dot-notation access and nested objects.', difficulty: 'beginner', estimatedMinutes: 10, isFree: true },
          { slug: 'ex3-html-escaping', title: 'HTML Escaping', description: 'Safe vs raw output with triple-stash.', difficulty: 'beginner', estimatedMinutes: 10, isFree: true },
          { slug: 'ex4-condicionais', title: 'Conditionals', description: 'If/else and unless blocks.', difficulty: 'beginner', estimatedMinutes: 15, isFree: true },
          { slug: 'ex5-each-basico', title: 'Basic Each', description: 'Loop through arrays with #each.', difficulty: 'beginner', estimatedMinutes: 15, isFree: true },
          { slug: 'ex6-each-avancado', title: 'Advanced Each', description: '@index, @key, @first, @last, parent context.', difficulty: 'intermediate', estimatedMinutes: 15, isFree: true },
          { slug: 'ex7-custom-helpers', title: 'Custom Helpers', description: 'Create reusable template functions.', difficulty: 'intermediate', estimatedMinutes: 15, isFree: true },
          { slug: 'ex8-helpers-comparacao', title: 'Comparison Helpers', description: 'Eq, gte, and, or logical helpers.', difficulty: 'intermediate', estimatedMinutes: 15, isFree: true },
          { slug: 'ex9-helpers-formatacao', title: 'Formatting Helpers', description: 'Date, currency, and text formatting.', difficulty: 'intermediate', estimatedMinutes: 15, isFree: true },
          { slug: 'ex10-block-helpers', title: 'Block Helpers', description: 'Create block-level helper functions.', difficulty: 'intermediate', estimatedMinutes: 20, isFree: true },
          { slug: 'ex11-subexpressions', title: 'Subexpressions', description: 'Compose helpers inside helpers.', difficulty: 'intermediate', estimatedMinutes: 15, isFree: true },
          { slug: 'ex12-partials-basico', title: 'Basic Partials', description: 'Reusable template fragments.', difficulty: 'intermediate', estimatedMinutes: 15, isFree: true },
          { slug: 'ex13-partials-parametros', title: 'Partial Parameters', description: 'Pass data to partials with hash.', difficulty: 'intermediate', estimatedMinutes: 15, isFree: true },
          { slug: 'ex14-partial-block', title: 'Partial Blocks', description: '@partial-block for slot-based composition.', difficulty: 'advanced', estimatedMinutes: 20, isFree: true },
          { slug: 'ex15-template-dinamico', title: 'Dynamic Templates', description: 'Compile templates at runtime.', difficulty: 'advanced', estimatedMinutes: 20, isFree: true },
          { slug: 'ex16-iteracao-objetos', title: 'Object Iteration', description: 'Iterate over object keys and values.', difficulty: 'intermediate', estimatedMinutes: 15, isFree: true },
          { slug: 'ex17-template-registry', title: 'Template Registry', description: 'Build a TemplateRegistry class.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex18-email-templates', title: 'Email Templates', description: 'Multi-section email with partials.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex19-validacao-zod', title: 'Zod Validation', description: 'Validate template context with Zod.', difficulty: 'advanced', estimatedMinutes: 20, isFree: true },
          { slug: 'ex20-prompt-ai', title: 'AI Prompt Builder', description: 'Capstone: full prompt composition system.', difficulty: 'advanced', estimatedMinutes: 30, isFree: true },
        ],
      },
      {
        slug: 'module-2-llm-api',
        title: 'LLM API',
        description: 'Direct API calls, system prompts, multi-turn conversations, prompt engineering, and cost optimization.',
        icon: 'AI',
        exercises: [
          { slug: 'ex1-hello-world', title: 'Hello World', description: 'Your first Claude API call and cost math.', difficulty: 'beginner', estimatedMinutes: 10, isFree: true },
          { slug: 'ex2-modelos-comparacao', title: 'Model Comparison', description: 'Haiku vs Sonnet tradeoffs.', difficulty: 'beginner', estimatedMinutes: 15, isFree: true },
          { slug: 'ex3-system-prompt', title: 'System Prompts', description: 'Control behavior with personas.', difficulty: 'beginner', estimatedMinutes: 15, isFree: true },
          { slug: 'ex4-instrucoes-estruturadas', title: 'Structured Instructions', description: 'Structured system prompt format.', difficulty: 'intermediate', estimatedMinutes: 15, isFree: true },
          { slug: 'ex5-conversacao', title: 'Multi-turn Conversations', description: 'Maintain context across messages.', difficulty: 'intermediate', estimatedMinutes: 20, isFree: true },
          { slug: 'ex6-conversacao-memoria', title: 'Conversation Memory', description: 'Summarization for long conversations.', difficulty: 'intermediate', estimatedMinutes: 20, isFree: true },
          { slug: 'ex7-parametros', title: 'API Parameters', description: 'Temperature, max_tokens, stop_sequences.', difficulty: 'intermediate', estimatedMinutes: 20, isFree: true },
          { slug: 'ex8-output-estruturado', title: 'Structured Output', description: 'JSON extraction with retry-with-reminder.', difficulty: 'intermediate', estimatedMinutes: 25, isFree: true },
          { slug: 'ex9-handlebars-integration', title: 'Template Integration', description: 'Handlebars-driven prompt templates.', difficulty: 'intermediate', estimatedMinutes: 20, isFree: true },
          { slug: 'ex10-prompt-registry', title: 'Prompt Registry', description: 'PromptRegistry class from M1 patterns.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex11-few-shot', title: 'Few-Shot Learning', description: 'Zero-shot vs few-shot comparison.', difficulty: 'intermediate', estimatedMinutes: 20, isFree: true },
          { slug: 'ex12-few-shot-dinamico', title: 'Dynamic Few-Shot', description: 'Select examples by relevance.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex13-chain-of-thought', title: 'Chain of Thought', description: 'Step-by-step reasoning with extraction.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex14-classificacao-robusta', title: 'Robust Classification', description: 'Few-shot + CoT + JSON combined.', difficulty: 'advanced', estimatedMinutes: 30, isFree: true },
          { slug: 'ex15-prompt-chaining', title: 'Prompt Chaining', description: 'Multi-step sequential LLM calls.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex16-prompt-routing', title: 'Prompt Routing', description: 'Intent classification and dispatch.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex17-cost-tracking', title: 'Cost Tracking', description: 'CostTracker utility for M3/M4 reuse.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex18-avaliacao-qualidade', title: 'Quality Evaluation', description: 'LLM-as-judge pattern.', difficulty: 'advanced', estimatedMinutes: 30, isFree: true },
          { slug: 'ex19-prompt-versioning', title: 'Prompt Versioning', description: 'Track and compare prompt versions.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex20-ab-testing', title: 'A/B Testing', description: 'Full A/B framework capstone.', difficulty: 'advanced', estimatedMinutes: 30, isFree: true },
        ],
      },
      {
        slug: 'module-3-tool-use',
        title: 'Tool Use',
        description: 'Give LLMs tools: calculators, APIs, search. Build agent loops with error handling and composition.',
        icon: 'fn',
        exercises: [
          { slug: 'ex1-tool-schema', title: 'Tool Schema', description: 'Define tool schemas with JSON Schema.', difficulty: 'beginner', estimatedMinutes: 15, isFree: true },
          { slug: 'ex2-primeira-tool', title: 'First Tool', description: 'Your first working tool with Claude.', difficulty: 'beginner', estimatedMinutes: 15, isFree: true },
          { slug: 'ex3-tool-handler-tipado', title: 'Typed Handlers', description: 'TypeScript discriminated unions for tools.', difficulty: 'beginner', estimatedMinutes: 15, isFree: true },
          { slug: 'ex4-multiplas-tools', title: 'Multiple Tools', description: 'Register and dispatch multiple tools.', difficulty: 'intermediate', estimatedMinutes: 20, isFree: true },
          { slug: 'ex5-tool-validation', title: 'Tool Validation', description: 'Zod validation on tool inputs.', difficulty: 'intermediate', estimatedMinutes: 20, isFree: true },
          { slug: 'ex6-tool-descricao-eficaz', title: 'Effective Descriptions', description: 'Write descriptions that guide Claude.', difficulty: 'intermediate', estimatedMinutes: 15, isFree: true },
          { slug: 'ex7-api-real', title: 'Real API Tool', description: 'External API calls via tools.', difficulty: 'intermediate', estimatedMinutes: 25, isFree: true },
          { slug: 'ex8-tool-com-templates', title: 'Tools + Templates', description: 'Handlebars templates for tool results.', difficulty: 'intermediate', estimatedMinutes: 20, isFree: true },
          { slug: 'ex9-tool-resultados-ricos', title: 'Rich Results', description: 'Formatted tool responses.', difficulty: 'intermediate', estimatedMinutes: 20, isFree: true },
          { slug: 'ex10-tool-conversacao', title: 'Tools in Conversation', description: 'Tools in multi-turn context.', difficulty: 'intermediate', estimatedMinutes: 25, isFree: true },
          { slug: 'ex11-tool-encadeada', title: 'Tool Chaining', description: 'Sequential tool calls: data -> metrics -> report.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex12-tool-paralela', title: 'Parallel Tools', description: 'Execute multiple tools concurrently.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex13-tool-prompt-engineering', title: 'Tool Prompt Engineering', description: 'Optimize prompts for tool use.', difficulty: 'advanced', estimatedMinutes: 20, isFree: true },
          { slug: 'ex14-error-handling', title: 'Error Handling', description: 'Retry, timeout, graceful degradation.', difficulty: 'advanced', estimatedMinutes: 30, isFree: true },
          { slug: 'ex15-tool-confirmacao', title: 'User Confirmation', description: 'Confirm before executing tools.', difficulty: 'advanced', estimatedMinutes: 20, isFree: true },
          { slug: 'ex16-tool-cost-aware', title: 'Cost-Aware Tools', description: 'CostTracker integration with tools.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex17-tool-composicao', title: 'Tool Composition', description: 'Compose tools into higher-level operations.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex18-tool-schema-dinamico', title: 'Dynamic Schemas', description: 'Generate tool schemas at runtime.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex19-tool-data-pipeline', title: 'Tools + Data Pipeline', description: 'Feed tool results into pipelines.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex20-mini-agent', title: 'Mini Agent', description: 'Capstone: autonomous agent with tools.', difficulty: 'advanced', estimatedMinutes: 30, isFree: true },
        ],
      },
      {
        slug: 'module-4-data-pipelines',
        title: 'Data Pipelines',
        description: 'CSV processing, JSON transforms, Zod validation, ETL pipelines, and AI-powered data enrichment.',
        icon: 'ETL',
        exercises: [
          { slug: 'ex1-csv-basico', title: 'CSV Basics', description: 'Parse and type CSV data.', difficulty: 'beginner', estimatedMinutes: 10, isFree: true },
          { slug: 'ex2-csv-processing', title: 'CSV Processing', description: 'Filter, aggregate, and analyze CSV.', difficulty: 'beginner', estimatedMinutes: 15, isFree: true },
          { slug: 'ex3-csv-avancado', title: 'Advanced CSV', description: 'Group, sort, and compute metrics.', difficulty: 'intermediate', estimatedMinutes: 20, isFree: true },
          { slug: 'ex4-json-transform', title: 'JSON Transform', description: 'Normalize and merge multi-source data.', difficulty: 'intermediate', estimatedMinutes: 20, isFree: true },
          { slug: 'ex5-data-validation', title: 'Data Validation', description: 'Zod schemas with XSS detection.', difficulty: 'intermediate', estimatedMinutes: 25, isFree: true },
          { slug: 'ex6-schema-complexo', title: 'Complex Schemas', description: 'Nested Zod schemas with transforms.', difficulty: 'intermediate', estimatedMinutes: 20, isFree: true },
          { slug: 'ex7-limpeza-dados', title: 'Data Cleaning', description: 'Normalize, deduplicate, fix encoding.', difficulty: 'intermediate', estimatedMinutes: 20, isFree: true },
          { slug: 'ex8-enriquecimento-dados', title: 'Data Enrichment', description: 'Computed fields and derived data.', difficulty: 'intermediate', estimatedMinutes: 20, isFree: true },
          { slug: 'ex9-streaming-dados', title: 'Data Streaming', description: 'Chunked data processing.', difficulty: 'intermediate', estimatedMinutes: 25, isFree: true },
          { slug: 'ex10-formatacao-handlebars', title: 'Handlebars Reports', description: 'Data reports with Handlebars templates.', difficulty: 'intermediate', estimatedMinutes: 20, isFree: true },
          { slug: 'ex11-multi-formato', title: 'Multi-Format Output', description: 'CSV, JSON, Markdown export.', difficulty: 'intermediate', estimatedMinutes: 20, isFree: true },
          { slug: 'ex12-classificacao-ai', title: 'AI Classification', description: 'Claude-powered data classification.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex13-error-pipeline', title: 'Error Pipeline', description: 'Retry, fallback, dead-letter queue.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex14-metricas-pipeline', title: 'Pipeline Metrics', description: 'Timing, counts, error rates.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex15-pipeline-com-tools', title: 'Pipeline + Tools', description: 'Claude tools for data enrichment.', difficulty: 'advanced', estimatedMinutes: 30, isFree: true },
          { slug: 'ex16-etl-pipeline', title: 'ETL Pipeline', description: 'Full Extract-Transform-Load pipeline.', difficulty: 'advanced', estimatedMinutes: 30, isFree: true },
          { slug: 'ex17-etl-incremental', title: 'Incremental ETL', description: 'Process only new/changed data.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex18-relatorio-templates', title: 'Report Templates', description: 'Generate reports with Handlebars.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex19-contexto-ai', title: 'AI Context Builder', description: 'Build prompt context from pipeline data.', difficulty: 'advanced', estimatedMinutes: 25, isFree: true },
          { slug: 'ex20-plataforma-dados', title: 'Data Platform', description: 'Grand capstone: full platform combining M1-M4.', difficulty: 'advanced', estimatedMinutes: 45, isFree: true },
        ],
      },
    ],
  },
];

export function getDay(daySlug: string): Day | undefined {
  return COURSE_MANIFEST.find((d) => d.slug === daySlug);
}

export function getModule(daySlug: string, moduleSlug: string): Module | undefined {
  return getDay(daySlug)?.modules.find((m) => m.slug === moduleSlug);
}

export function getExercise(daySlug: string, moduleSlug: string, exerciseSlug: string): Exercise | undefined {
  return getModule(daySlug, moduleSlug)?.exercises.find((e) => e.slug === exerciseSlug);
}

export function getTotalExercises(daySlug?: string): number {
  if (daySlug) {
    const day = getDay(daySlug);
    return day?.modules.reduce((sum, m) => sum + m.exercises.length, 0) ?? 0;
  }
  return COURSE_MANIFEST.reduce(
    (sum, d) => sum + d.modules.reduce((s, m) => s + m.exercises.length, 0),
    0,
  );
}
