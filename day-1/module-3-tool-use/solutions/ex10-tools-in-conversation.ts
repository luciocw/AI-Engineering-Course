/**
 * Solution 10: Tools in Multi-Turn Conversations
 *
 * Conversation with multiple rounds maintaining context and tools.
 * Run: npx tsx solutions/ex10-tools-in-conversation.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Simulated data - order system ===

const ordersDB: Record<string, {
  id: string;
  customer: string;
  items: Array<{ name: string; qty: number; price: number }>;
  status: string;
  date: string;
}> = {
  'ORD-001': {
    id: 'ORD-001', customer: 'Maria Silva',
    items: [{ name: 'Notebook', qty: 1, price: 4500 }, { name: 'Mouse', qty: 2, price: 89 }],
    status: 'shipped', date: '2026-02-10',
  },
  'ORD-002': {
    id: 'ORD-002', customer: 'Maria Silva',
    items: [{ name: 'Keyboard', qty: 1, price: 350 }],
    status: 'processing', date: '2026-02-15',
  },
  'ORD-003': {
    id: 'ORD-003', customer: 'Joao Santos',
    items: [{ name: 'Monitor', qty: 1, price: 2800 }],
    status: 'delivered', date: '2026-02-01',
  },
};

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'search_orders',
    description:
      'Searches orders by customer name or specific ID. ' +
      'Returns full details including items, status, and date.',
    input_schema: {
      type: 'object' as const,
      properties: {
        customer: {
          type: 'string',
          description: 'Customer name to search all their orders',
        },
        id: {
          type: 'string',
          description: 'Specific order ID (e.g.: ORD-001)',
        },
      },
      required: [],
    },
  },
  {
    name: 'update_status',
    description:
      'Updates the status of an existing order. ' +
      'Possible statuses: processing, shipped, in_transit, delivered, cancelled.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'Order ID to update (e.g.: ORD-001)',
        },
        new_status: {
          type: 'string',
          enum: ['processing', 'shipped', 'in_transit', 'delivered', 'cancelled'],
          description: 'New order status',
        },
      },
      required: ['id', 'new_status'],
    },
  },
  {
    name: 'calculate_total',
    description:
      'Calculates the total value of an order, optionally applying a percentage discount.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'Order ID to calculate total',
        },
        discount: {
          type: 'number',
          description: 'Discount percentage (0-100). Optional.',
        },
      },
      required: ['id'],
    },
  },
];

// === Handlers ===

function handleSearchOrders(input: { customer?: string; id?: string }): string {
  if (input.id) {
    const order = ordersDB[input.id];
    if (!order) return JSON.stringify({ error: `Order ${input.id} not found` });
    return JSON.stringify(order);
  }

  if (input.customer) {
    const orders = Object.values(ordersDB).filter(
      (p) => p.customer.toLowerCase().includes(input.customer!.toLowerCase())
    );
    if (orders.length === 0) {
      return JSON.stringify({ error: `No orders found for "${input.customer}"` });
    }
    return JSON.stringify(orders);
  }

  return JSON.stringify({ error: 'Provide customer or id to search' });
}

function handleUpdateStatus(input: { id: string; new_status: string }): string {
  const order = ordersDB[input.id];
  if (!order) return JSON.stringify({ error: `Order ${input.id} not found` });

  const previousStatus = order.status;
  order.status = input.new_status;

  return JSON.stringify({
    id: input.id,
    previous_status: previousStatus,
    new_status: input.new_status,
    updated_at: new Date().toISOString(),
  });
}

function handleCalculateTotal(input: { id: string; discount?: number }): string {
  const order = ordersDB[input.id];
  if (!order) return JSON.stringify({ error: `Order ${input.id} not found` });

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = input.discount || 0;
  const discountValue = subtotal * (discount / 100);
  const total = subtotal - discountValue;

  return JSON.stringify({
    order_id: order.id,
    items: order.items.map((i) => ({
      name: i.name,
      qty: i.qty,
      unit_price: i.price,
      subtotal: i.price * i.qty,
    })),
    subtotal: `$${subtotal.toFixed(2)}`,
    discount: `${discount}% ($${discountValue.toFixed(2)})`,
    total: `$${total.toFixed(2)}`,
  });
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'search_orders':
      return handleSearchOrders(input as { customer?: string; id?: string });
    case 'update_status':
      return handleUpdateStatus(input as { id: string; new_status: string });
    case 'calculate_total':
      return handleCalculateTotal(input as { id: string; discount?: number });
    default:
      return `Unknown tool: ${name}`;
  }
}

// === Multi-turn conversation ===

async function multiTurnConversation(): Promise<void> {
  const messages: Anthropic.MessageParam[] = [];

  const questions = [
    'Search for Maria Silva\'s orders',
    'What is the total for order ORD-001 with a 10% discount?',
    'Update the status of ORD-002 to shipped',
  ];

  for (const question of questions) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`User: ${question}`);
    console.log('='.repeat(50));

    messages.push({ role: 'user', content: question });

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
          console.log(`\nClaude: ${block.text}`);
        } else if (block.type === 'tool_use') {
          console.log(`  [Tool: ${block.name}(${JSON.stringify(block.input)})]`);
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
        // Add the final assistant response to the history
        messages.push({ role: 'assistant', content: response.content });
        continueLoop = false;
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Total messages in history: ${messages.length}`);
}

await multiTurnConversation();

console.log('\n--- Exercise 10 complete! ---');
