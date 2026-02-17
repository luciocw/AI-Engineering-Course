/**
 * Solution 5: Input Validation with Zod
 *
 * Manual input validation before processing tools.
 * Run: npx tsx solutions/ex5-tool-validation.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Validation functions ===

function validateCreateUser(input: unknown): {
  valid: boolean;
  data?: { name: string; email: string; age: number };
  error?: string;
} {
  if (typeof input !== 'object' || input === null) {
    return { valid: false, error: 'Input must be an object' };
  }
  const obj = input as Record<string, unknown>;

  // Validate name
  if (typeof obj.name !== 'string' || obj.name.length < 2) {
    return { valid: false, error: 'name must be a string with at least 2 characters' };
  }

  // Validate email
  if (typeof obj.email !== 'string' || !obj.email.includes('@')) {
    return { valid: false, error: 'email must be a valid string containing @' };
  }

  // Validate age
  if (typeof obj.age !== 'number' || obj.age < 0 || obj.age > 150) {
    return { valid: false, error: 'age must be a number between 0 and 150' };
  }

  return {
    valid: true,
    data: { name: obj.name, email: obj.email, age: obj.age },
  };
}

function validateSearchProducts(input: unknown): {
  valid: boolean;
  data?: { category: string; max_price?: number; sort_by?: 'price' | 'name' | 'rating' };
  error?: string;
} {
  if (typeof input !== 'object' || input === null) {
    return { valid: false, error: 'Input must be an object' };
  }
  const obj = input as Record<string, unknown>;

  // Validate category (required)
  if (typeof obj.category !== 'string' || obj.category.length === 0) {
    return { valid: false, error: 'category is required and must be a non-empty string' };
  }

  // Validate max_price (optional)
  if (obj.max_price !== undefined) {
    if (typeof obj.max_price !== 'number' || obj.max_price <= 0) {
      return { valid: false, error: 'max_price must be a positive number' };
    }
  }

  // Validate sort_by (optional)
  const validSortValues = ['price', 'name', 'rating'];
  if (obj.sort_by !== undefined) {
    if (typeof obj.sort_by !== 'string' || !validSortValues.includes(obj.sort_by)) {
      return { valid: false, error: `sort_by must be one of: ${validSortValues.join(', ')}` };
    }
  }

  return {
    valid: true,
    data: {
      category: obj.category,
      max_price: obj.max_price as number | undefined,
      sort_by: obj.sort_by as 'price' | 'name' | 'rating' | undefined,
    },
  };
}

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'create_user',
    description: 'Creates a new user in the system with name, email, and age.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'User name (minimum 2 characters)' },
        email: { type: 'string', description: 'Valid user email' },
        age: { type: 'number', description: 'User age (0-150)' },
      },
      required: ['name', 'email', 'age'],
    },
  },
  {
    name: 'search_products',
    description: 'Searches products by category with optional price and sorting filters.',
    input_schema: {
      type: 'object' as const,
      properties: {
        category: { type: 'string', description: 'Product category' },
        max_price: { type: 'number', description: 'Maximum price (optional)' },
        sort_by: {
          type: 'string',
          enum: ['price', 'name', 'rating'],
          description: 'Sort criteria (optional)',
        },
      },
      required: ['category'],
    },
  },
];

// === Simulated data ===

const productsDB: Record<string, Array<{ name: string; price: number; rating: number }>> = {
  electronics: [
    { name: 'Smartphone X', price: 2999, rating: 4.5 },
    { name: 'Notebook Pro', price: 5499, rating: 4.8 },
    { name: 'Bluetooth Headphones', price: 199, rating: 4.2 },
  ],
  books: [
    { name: 'Clean Code', price: 89, rating: 4.9 },
    { name: 'Design Patterns', price: 120, rating: 4.7 },
  ],
};

let nextUserId = 1;

// === Dispatcher with validation ===

function dispatchWithValidation(name: string, input: unknown): string {
  switch (name) {
    case 'create_user': {
      const result = validateCreateUser(input);
      if (!result.valid) return `Validation error: ${result.error}`;
      const user = { id: nextUserId++, ...result.data!, status: 'created' };
      return JSON.stringify(user);
    }
    case 'search_products': {
      const result = validateSearchProducts(input);
      if (!result.valid) return `Validation error: ${result.error}`;
      let products = productsDB[result.data!.category] || [];
      if (result.data!.max_price) {
        products = products.filter((p) => p.price <= result.data!.max_price!);
      }
      if (result.data!.sort_by) {
        const field = result.data!.sort_by;
        products = [...products].sort((a, b) => {
          if (field === 'name') return a.name.localeCompare(b.name);
          return (a[field] as number) - (b[field] as number);
        });
      }
      return JSON.stringify(products);
    }
    default:
      return `Unknown tool: ${name}`;
  }
}

// === Validation tests ===

console.log('=== Validation Tests ===\n');

const validationTests = [
  { tool: 'create_user', input: { name: 'Ana Silva', email: 'ana@email.com', age: 25 } },
  { tool: 'create_user', input: { name: '', email: 'invalid', age: -5 } },
  { tool: 'create_user', input: { name: 'Jo', email: 'jo@x.com', age: 200 } },
  { tool: 'search_products', input: { category: 'electronics', max_price: 1000 } },
  { tool: 'search_products', input: { category: 'electronics', sort_by: 'price' } },
  { tool: 'search_products', input: { max_price: -10 } }, // missing category
  { tool: 'search_products', input: { category: 'books', sort_by: 'invalid' } },
];

for (const test of validationTests) {
  console.log(`${test.tool}(${JSON.stringify(test.input)}):`);
  console.log(`  -> ${dispatchWithValidation(test.tool, test.input)}\n`);
}

// === Tool use loop with validation ===

async function runToolLoop(question: string): Promise<void> {
  console.log(`\nQuestion: "${question}"\n`);

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  let continueLoop = true;

  while (continueLoop) {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools,
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [Tool: ${block.name}(${JSON.stringify(block.input)})]`);
        const result = dispatchWithValidation(block.name, block.input);
        const isError = result.startsWith('Validation error');
        console.log(`  [${isError ? 'ERROR' : 'OK'}: ${result}]`);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
          is_error: isError,
        });
      }
    }

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });
    } else {
      continueLoop = false;
    }
  }
}

await runToolLoop(
  'Create a user named Maria with email maria@test.com and age 30. Then search for electronics products up to $500.'
);

console.log('\n--- Exercise 5 complete! ---');
