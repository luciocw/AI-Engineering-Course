/**
 * Solution 19: Tools as Data Pipeline
 *
 * ETL Pipeline: Extract -> Transform -> Load via tool use.
 * Run: npx tsx solutions/ex19-tool-data-pipeline.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Simulated raw data ===

const sources: Record<string, string[]> = {
  sales_csv: [
    'date,product,value,region',
    '2026-01-05,Pro Plan,299,Southeast',
    '2026-01-05,Starter Plan,49,South',
    '2026-01-10,Enterprise Plan,999,Southeast',
    '2026-01-15,Pro Plan,299,Northeast',
    '2026-01-20,Enterprise Plan,999,Southeast',
    '2026-01-25,Starter Plan,49,South',
    '2026-02-01,Pro Plan,299,North',
    '2026-02-05,Enterprise Plan,999,Southeast',
    '2026-02-10,Pro Plan,299,Northeast',
    '2026-02-15,Starter Plan,49,Midwest',
  ],
};

const savedResults: Record<string, unknown> = {};

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'extract_data',
    description:
      'Extracts raw data from a CSV source and converts it to JSON. ' +
      'Available sources: sales_csv. Returns an array of objects.',
    input_schema: {
      type: 'object' as const,
      properties: {
        source: {
          type: 'string',
          description: 'Data source name. Available: sales_csv',
        },
      },
      required: ['source'],
    },
  },
  {
    name: 'transform_data',
    description:
      'Transforms an array of data. Operations: "group_by" (groups and sums values by a field), ' +
      '"filter" (filters records by field and value), "sort" (sorts by field).',
    input_schema: {
      type: 'object' as const,
      properties: {
        data: {
          type: 'array',
          description: 'Array of objects to transform',
        },
        operation: {
          type: 'string',
          enum: ['group_by', 'filter', 'sort'],
          description: 'Type of transformation',
        },
        field: {
          type: 'string',
          description: 'Field to group by, filter, or sort by',
        },
        filter_value: {
          type: 'string',
          description: 'Value to filter by (only when operation=filter)',
        },
        sum_field: {
          type: 'string',
          description: 'Numeric field to sum in aggregation (when operation=group_by)',
        },
      },
      required: ['data', 'operation', 'field'],
    },
  },
  {
    name: 'load_data',
    description:
      'Loads processed data into a destination. Destinations: "report" (formats as text report), ' +
      '"json" (saves as JSON), "console" (prints formatted).',
    input_schema: {
      type: 'object' as const,
      properties: {
        destination: {
          type: 'string',
          enum: ['report', 'json', 'console'],
          description: 'Data format/destination',
        },
        data: {
          type: 'object',
          description: 'Processed data to load',
        },
        title: {
          type: 'string',
          description: 'Title for the report (when destination=report)',
        },
      },
      required: ['destination', 'data'],
    },
  },
];

// === Handlers ===

function handleExtract(input: { source: string }): string {
  const csv = sources[input.source];
  if (!csv) {
    return JSON.stringify({ error: `Source "${input.source}" not found. Available: ${Object.keys(sources).join(', ')}` });
  }

  // Parse CSV to JSON
  const headers = csv[0].split(',');
  const records = csv.slice(1).map((line) => {
    const values = line.split(',');
    const obj: Record<string, string | number> = {};
    headers.forEach((h, i) => {
      // Try to convert numbers
      const num = Number(values[i]);
      obj[h] = isNaN(num) ? values[i] : num;
    });
    return obj;
  });

  return JSON.stringify({
    source: input.source,
    total_records: records.length,
    columns: headers,
    data: records,
  });
}

function handleTransform(input: {
  data: Array<Record<string, unknown>>;
  operation: string;
  field: string;
  filter_value?: string;
  sum_field?: string;
}): string {
  const { data, operation, field } = input;

  switch (operation) {
    case 'group_by': {
      const groups: Record<string, { count: number; sum: number; records: unknown[] }> = {};
      for (const record of data) {
        const key = String(record[field]);
        if (!groups[key]) {
          groups[key] = { count: 0, sum: 0, records: [] };
        }
        groups[key].count++;
        if (input.sum_field && typeof record[input.sum_field] === 'number') {
          groups[key].sum += record[input.sum_field] as number;
        }
        groups[key].records.push(record);
      }

      const result = Object.entries(groups).map(([key, info]) => ({
        [field]: key,
        count: info.count,
        sum: input.sum_field ? info.sum : undefined,
        average: input.sum_field ? Math.round(info.sum / info.count * 100) / 100 : undefined,
      }));

      return JSON.stringify({
        operation: 'group_by',
        grouping_field: field,
        sum_field: input.sum_field || 'none',
        total_groups: result.length,
        result,
      });
    }

    case 'filter': {
      const filtered = data.filter(
        (record) => String(record[field]).toLowerCase().includes((input.filter_value || '').toLowerCase())
      );
      return JSON.stringify({
        operation: 'filter',
        field,
        value: input.filter_value,
        total_original: data.length,
        total_filtered: filtered.length,
        data: filtered,
      });
    }

    case 'sort': {
      const sorted = [...data].sort((a, b) => {
        const va = a[field];
        const vb = b[field];
        if (typeof va === 'number' && typeof vb === 'number') return vb - va;
        return String(va).localeCompare(String(vb));
      });
      return JSON.stringify({
        operation: 'sort',
        field,
        data: sorted,
      });
    }

    default:
      return JSON.stringify({ error: `Operation "${operation}" is invalid` });
  }
}

function handleLoad(input: {
  destination: string;
  data: unknown;
  title?: string;
}): string {
  const title = input.title || 'Processed Data';

  switch (input.destination) {
    case 'report': {
      const lines = [`=== ${title} ===`, `Generated at: ${new Date().toISOString()}`, ''];
      if (Array.isArray(input.data)) {
        for (const item of input.data) {
          if (typeof item === 'object' && item !== null) {
            const entries = Object.entries(item as Record<string, unknown>);
            lines.push(entries.map(([k, v]) => `${k}: ${v}`).join(' | '));
          }
        }
      } else if (typeof input.data === 'object' && input.data !== null) {
        const obj = input.data as Record<string, unknown>;
        if (obj.result && Array.isArray(obj.result)) {
          for (const item of obj.result) {
            const entries = Object.entries(item as Record<string, unknown>)
              .filter(([, v]) => v !== undefined);
            lines.push(entries.map(([k, v]) => `${k}: ${v}`).join(' | '));
          }
        } else {
          lines.push(JSON.stringify(input.data, null, 2));
        }
      }

      const report = lines.join('\n');
      savedResults[title] = report;

      return JSON.stringify({
        destination: 'report',
        title,
        saved: true,
        content: report,
      });
    }

    case 'json': {
      savedResults[title] = input.data;
      return JSON.stringify({
        destination: 'json',
        title,
        saved: true,
        size: JSON.stringify(input.data).length,
      });
    }

    case 'console':
      return JSON.stringify({
        destination: 'console',
        data: input.data,
      });

    default:
      return JSON.stringify({ error: `Destination "${input.destination}" is invalid` });
  }
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'extract_data':
      return handleExtract(input as { source: string });
    case 'transform_data':
      return handleTransform(input as {
        data: Array<Record<string, unknown>>;
        operation: string;
        field: string;
        filter_value?: string;
        sum_field?: string;
      });
    case 'load_data':
      return handleLoad(input as { destination: string; data: unknown; title?: string });
    default:
      return `Unknown tool: ${name}`;
  }
}

// === Tool use loop ===

async function runToolLoop(question: string): Promise<void> {
  console.log(`\nQuestion: "${question}"\n`);

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  let step = 0;
  let continueLoop = true;

  while (continueLoop) {
    step++;
    console.log(`--- Pipeline Step ${step} ---`);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: 'You are a data engineer. Use the tools in order: extract -> transform -> load. Pass the output of each step as input to the next.',
      tools,
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [ETL: ${block.name}]`);
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
        console.log(`  [Result: ${result.slice(0, 120)}...]`);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
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
  'Extract the data from sales_csv, group by region summing the values, and generate a report with the result.'
);

console.log('\n--- Exercise 19 complete! ---');
