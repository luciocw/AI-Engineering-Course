/**
 * Solution 1: Defining Tool Schemas
 *
 * 3 tools with correct name, description, and input_schema.
 * Run: npx tsx solutions/ex1-tool-schema.ts
 */

import Anthropic from '@anthropic-ai/sdk';

// === Tool 1: get_weather ===
const getWeatherTool: Anthropic.Tool = {
  name: 'get_weather',
  description:
    'Fetches the current temperature and weather condition for a city.',
  input_schema: {
    type: 'object' as const,
    properties: {
      city: {
        type: 'string',
        description: 'Name of the city to fetch the weather for',
      },
      unit: {
        type: 'string',
        enum: ['celsius', 'fahrenheit'],
        description: 'Temperature unit (default: celsius)',
      },
    },
    required: ['city'],
  },
};

// === Tool 2: send_email ===
const sendEmailTool: Anthropic.Tool = {
  name: 'send_email',
  description:
    'Sends an email to a recipient with a specified subject and body.',
  input_schema: {
    type: 'object' as const,
    properties: {
      recipient: {
        type: 'string',
        description: 'Email address of the recipient',
      },
      subject: {
        type: 'string',
        description: 'Email subject',
      },
      body: {
        type: 'string',
        description: 'Email body/content',
      },
      cc: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of CC addresses (optional)',
      },
    },
    required: ['recipient', 'subject', 'body'],
  },
};

// === Tool 3: query_database ===
const queryDatabaseTool: Anthropic.Tool = {
  name: 'query_database',
  description:
    'Queries records from a database table with optional filters.',
  input_schema: {
    type: 'object' as const,
    properties: {
      table: {
        type: 'string',
        description: 'Name of the table to query',
      },
      filters: {
        type: 'object',
        properties: {
          field: { type: 'string', description: 'Field name to filter by' },
          value: { type: 'string', description: 'Filter value' },
        },
        description: 'Optional filters for the query',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of records (default: 10)',
      },
    },
    required: ['table'],
  },
};

// === Validation ===
const tools: Anthropic.Tool[] = [getWeatherTool, sendEmailTool, queryDatabaseTool];

function validateTools(tools: Anthropic.Tool[]): void {
  console.log('=== Tool Schema Validation ===\n');

  for (const tool of tools) {
    console.log(`Validating tool: ${tool.name}`);

    // Check required fields
    console.log(`  name: ${tool.name}`);
    console.log(`  description: ${tool.description.slice(0, 60)}...`);
    console.log(`  input_schema.type: ${tool.input_schema.type}`);

    const props = (tool.input_schema as Record<string, unknown>).properties;
    const required = (tool.input_schema as Record<string, unknown>).required;

    if (props && typeof props === 'object') {
      console.log(`  properties: [${Object.keys(props as object).join(', ')}]`);
    } else {
      console.log(`  ERROR: properties missing or invalid`);
    }

    if (Array.isArray(required)) {
      console.log(`  required: [${(required as string[]).join(', ')}]`);
    } else {
      console.log(`  ERROR: required missing or invalid`);
    }

    console.log(`  VALID\n`);
  }

  console.log(`Total: ${tools.length} tools validated successfully!`);
}

validateTools(tools);

console.log('\n--- Exercise 1 complete! ---');
