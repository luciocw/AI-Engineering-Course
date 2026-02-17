/**
 * Solution - Exercise 19: Sanitization and Security
 */

// Note: zod must be installed in the project.
// If not, run: npm install zod
import Handlebars from 'handlebars';
import { z } from 'zod';

// === Safe data (valid) ===
const safeData = {
  name: 'Maria Silva',
  email: 'maria@exemplo.com',
  bio: 'Developer with 5 years of experience in AI.',
  website: 'https://maria.dev',
};

// === Unsafe data (invalid or malicious) ===
const unsafeData = {
  name: '<script>alert("xss")</script>',
  email: 'invalid-no-at-sign',
  bio: '<img src=x onerror=alert("hack")>Normal text',
  website: 'javascript:alert(1)',
};

// Solution TODO 1: Zod schema for profile validation
const profileSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  bio: z.string().max(500),
  website: z.string().url().startsWith('https://'),
});

type Profile = z.infer<typeof profileSchema>;

// Solution TODO 2: safeRender function
function safeRender<T>(
  schema: z.ZodSchema<T>,
  templateStr: string,
  data: unknown,
): { success: boolean; result?: string; errors?: string[] } {
  // Step 1: Validate data with Zod
  const validation = schema.safeParse(data);

  if (!validation.success) {
    // Step 2: If failed, return formatted errors
    const errors = validation.error.issues.map(
      (issue) => `[${issue.path.join('.')}] ${issue.message}`
    );
    return { success: false, errors };
  }

  // Step 3: If passed, compile and render
  const template = Handlebars.compile(templateStr);
  const result = template(validation.data);
  return { success: true, result };
}

// Solution TODO 3: Helper "sanitize" that removes HTML tags
Handlebars.registerHelper('sanitize', function (text: unknown) {
  if (typeof text === 'string') {
    return text.replace(/<[^>]*>/g, '');
  }
  return text;
});

// User profile template
const profileTemplate = `=== User Profile ===
Name: {{name}}
Email: {{email}}
Bio: {{bio}}
Website: {{website}}`;

// Template with explicit sanitization
const sanitizedProfileTemplate = `=== User Profile (Sanitized) ===
Name: {{sanitize name}}
Email: {{sanitize email}}
Bio: {{sanitize bio}}
Website: {{sanitize website}}`;

// Solution TODO 4: Test with safe and unsafe data
console.log('=== Test with SAFE data ===');
const safeResult = safeRender(profileSchema, profileTemplate, safeData);
if (safeResult.success) {
  console.log('Validation: PASSED');
  console.log(safeResult.result);
} else {
  console.log('Validation: FAILED');
  console.log('Errors:', safeResult.errors);
}

console.log('\n=== Test with UNSAFE data ===');
const unsafeResult = safeRender(profileSchema, profileTemplate, unsafeData);
if (unsafeResult.success) {
  console.log('Validation: PASSED');
  console.log(unsafeResult.result);
} else {
  console.log('Validation: FAILED');
  unsafeResult.errors?.forEach((error) => console.log(`  - ${error}`));
}

// Demonstration: Handlebars already escapes HTML by default with {{ }}
console.log('\n=== Demonstration: Default Handlebars Escaping ===');
const escapeTemplate = Handlebars.compile('Name: {{name}}');
console.log('Input: <script>alert("xss")</script>');
console.log('Output:', escapeTemplate({ name: '<script>alert("xss")</script>' }));
console.log('Handlebars automatically escapes with {{ }}, but Zod validation prevents invalid data BEFORE rendering.');

// Demonstration: sanitize helper as extra layer
console.log('\n=== Demonstration: Sanitize Helper ===');
const sanitizeTemplate = Handlebars.compile('Bio: {{sanitize bio}}');
console.log('Input: <img src=x onerror=alert("hack")>Normal text');
console.log('Output:', sanitizeTemplate({ bio: '<img src=x onerror=alert("hack")>Normal text' }));

// Solution TODO 5: "Safe Template" pattern
function createSafeTemplate<T>(config: {
  schema: z.ZodSchema<T>;
  template: string;
  helpers?: Record<string, (...args: unknown[]) => unknown>;
}): (data: unknown) => { success: boolean; result?: string; errors?: string[] } {
  // Register helpers if provided
  if (config.helpers) {
    for (const [name, fn] of Object.entries(config.helpers)) {
      Handlebars.registerHelper(name, fn);
    }
  }

  // Return render function that validates + renders
  return (data: unknown) => {
    return safeRender(config.schema, config.template, data);
  };
}

// Usage of the Safe Template pattern
console.log('\n=== Test with Safe Template Pattern ===');

const renderProfile = createSafeTemplate({
  schema: profileSchema,
  template: sanitizedProfileTemplate,
  helpers: {
    uppercase: (text: unknown) => (typeof text === 'string' ? text.toUpperCase() : text),
  },
});

// Test with valid data
const safePatternResult = renderProfile(safeData);
console.log('Safe data:', safePatternResult.success ? 'PASSED' : 'FAILED');
if (safePatternResult.success) {
  console.log(safePatternResult.result);
}

// Test with invalid data
const unsafePatternResult = renderProfile(unsafeData);
console.log('\nUnsafe data:', unsafePatternResult.success ? 'PASSED' : 'FAILED');
if (!unsafePatternResult.success) {
  unsafePatternResult.errors?.forEach((error) => console.log(`  - ${error}`));
}

// Test with partially invalid data
console.log('\n=== Test with partially invalid data ===');
const partialData = {
  name: 'Jo', // valid (minimum 2)
  email: 'joao@test.com',
  bio: 'Dev',
  website: 'http://joao.dev', // invalid (not https)
};

const partialResult = renderProfile(partialData);
console.log('Partial data:', partialResult.success ? 'PASSED' : 'FAILED');
if (!partialResult.success) {
  partialResult.errors?.forEach((error) => console.log(`  - ${error}`));
}

console.log('\n=== Security Summary ===');
console.log('1. Zod validates data BEFORE rendering (schema-first)');
console.log('2. Handlebars escapes HTML automatically with {{ }}');
console.log('3. Sanitize helper removes tags as an extra layer');
console.log('4. Safe Template pattern composes schema + template + helpers');
console.log('5. These patterns will be reused in Module 3 (Tool Use) and Module 4 (Data Pipelines)');
