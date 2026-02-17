/**
 * Solution 17: Tool Composition
 *
 * High-level tool that composes primitive operations internally.
 * Run: npx tsx solutions/ex17-tool-composition.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Simulated data ===

const inventoryDB: Record<string, { price: number; quantity: number }> = {
  notebook: { price: 4500, quantity: 15 },
  mouse: { price: 89, quantity: 200 },
  keyboard: { price: 250, quantity: 45 },
  monitor: { price: 2800, quantity: 8 },
  headset: { price: 350, quantity: 30 },
};

const shippingByCity: Record<string, number> = {
  'sao paulo': 15,
  'rio de janeiro': 25,
  'belo horizonte': 30,
  curitiba: 35,
  'porto alegre': 40,
};

const couponsDB: Record<string, number> = {
  DISCOUNT10: 10,
  DISCOUNT20: 20,
  FIRSTPURCHASE: 15,
};

let nextOrderId = 1001;

// === Primitive operations ===

function validateStock(
  product: string,
  quantity: number
): { ok: boolean; msg: string; price?: number } {
  const item = inventoryDB[product.toLowerCase()];
  if (!item) return { ok: false, msg: `Product "${product}" not found` };
  if (item.quantity < quantity) {
    return { ok: false, msg: `Insufficient stock: ${product} has ${item.quantity}, requested ${quantity}` };
  }
  return { ok: true, msg: 'OK', price: item.price };
}

function calculateShipping(city: string): { value: number; estimate: string } {
  const shipping = shippingByCity[city.toLowerCase()];
  if (shipping === undefined) return { value: 50, estimate: '10-15 business days' };
  return { value: shipping, estimate: shipping <= 20 ? '3-5 business days' : '5-8 business days' };
}

function applyDiscount(total: number, coupon?: string): { discount: number; percentage: number } {
  if (!coupon) return { discount: 0, percentage: 0 };
  const percentage = couponsDB[coupon.toUpperCase()];
  if (!percentage) return { discount: 0, percentage: 0 };
  return { discount: total * (percentage / 100), percentage };
}

function createOrder(data: {
  email: string;
  items: Array<{ product: string; qty: number; price: number }>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}): { id: string; status: string } {
  // Update inventory
  for (const item of data.items) {
    const stock = inventoryDB[item.product.toLowerCase()];
    if (stock) stock.quantity -= item.qty;
  }
  return { id: `ORD-${nextOrderId++}`, status: 'created' };
}

function sendConfirmation(email: string, orderId: string): { sent: boolean; timestamp: string } {
  return { sent: true, timestamp: new Date().toISOString() };
}

// === Composite tool ===

const tools: Anthropic.Tool[] = [
  {
    name: 'create_full_order',
    description:
      'Creates a complete order atomically. Internally: validates stock for all products, ' +
      'calculates shipping by city, applies discount coupon if provided, creates the order, and sends confirmation email. ' +
      'Returns a summary with all details or an error if any step fails.',
    input_schema: {
      type: 'object' as const,
      properties: {
        customer_email: {
          type: 'string',
          description: 'Customer email for confirmation',
        },
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Product name' },
              quantity: { type: 'number', description: 'Desired quantity' },
            },
            required: ['name', 'quantity'],
          },
          description: 'List of products with quantity',
        },
        delivery_city: {
          type: 'string',
          description: 'City for shipping calculation',
        },
        discount_coupon: {
          type: 'string',
          description: 'Discount coupon (optional)',
        },
      },
      required: ['customer_email', 'products', 'delivery_city'],
    },
  },
  {
    name: 'browse_catalog',
    description:
      'Browses the product catalog with prices and available stock.',
    input_schema: {
      type: 'object' as const,
      properties: {
        product: {
          type: 'string',
          description: 'Product name to look up (or "all" to list everything)',
        },
      },
      required: ['product'],
    },
  },
];

// === Composite handler ===

function handleCreateFullOrder(input: {
  customer_email: string;
  products: Array<{ name: string; quantity: number }>;
  delivery_city: string;
  discount_coupon?: string;
}): string {
  const steps: string[] = [];

  // Step 1: Validate stock
  steps.push('1. Validating stock...');
  const validatedItems: Array<{ product: string; qty: number; price: number }> = [];

  for (const p of input.products) {
    const validation = validateStock(p.name, p.quantity);
    if (!validation.ok) {
      return JSON.stringify({
        success: false,
        failed_step: 'stock_validation',
        error: validation.msg,
        steps_executed: steps,
      });
    }
    validatedItems.push({ product: p.name, qty: p.quantity, price: validation.price! });
    steps.push(`   ${p.name}: ${p.quantity}x $${validation.price!.toFixed(2)} - OK`);
  }

  // Step 2: Calculate subtotal
  const subtotal = validatedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  steps.push(`2. Subtotal: $${subtotal.toFixed(2)}`);

  // Step 3: Calculate shipping
  const shipping = calculateShipping(input.delivery_city);
  steps.push(`3. Shipping to ${input.delivery_city}: $${shipping.value.toFixed(2)} (${shipping.estimate})`);

  // Step 4: Apply discount
  const disc = applyDiscount(subtotal, input.discount_coupon);
  if (disc.discount > 0) {
    steps.push(`4. Discount (${input.discount_coupon} - ${disc.percentage}%): -$${disc.discount.toFixed(2)}`);
  } else if (input.discount_coupon) {
    steps.push(`4. Coupon "${input.discount_coupon}" invalid — no discount`);
  } else {
    steps.push('4. No discount coupon');
  }

  // Step 5: Create order
  const total = subtotal + shipping.value - disc.discount;
  const order = createOrder({
    email: input.customer_email,
    items: validatedItems,
    subtotal,
    shipping: shipping.value,
    discount: disc.discount,
    total,
  });
  steps.push(`5. Order created: ${order.id}`);

  // Step 6: Send confirmation
  const confirmation = sendConfirmation(input.customer_email, order.id);
  steps.push(`6. Confirmation sent to ${input.customer_email}`);

  return JSON.stringify({
    success: true,
    order: {
      id: order.id,
      items: validatedItems.map((i) => ({
        product: i.product,
        quantity: i.qty,
        unit_price: `$${i.price.toFixed(2)}`,
        subtotal: `$${(i.price * i.qty).toFixed(2)}`,
      })),
      subtotal: `$${subtotal.toFixed(2)}`,
      shipping: `$${shipping.value.toFixed(2)}`,
      delivery_estimate: shipping.estimate,
      discount: `$${disc.discount.toFixed(2)}`,
      total: `$${total.toFixed(2)}`,
    },
    confirmation: {
      email: input.customer_email,
      sent: confirmation.sent,
      timestamp: confirmation.timestamp,
    },
    steps_executed: steps,
  }, null, 2);
}

function handleBrowseCatalog(input: { product: string }): string {
  if (input.product.toLowerCase() === 'all') {
    return JSON.stringify(
      Object.entries(inventoryDB).map(([name, info]) => ({
        product: name,
        price: `$${info.price.toFixed(2)}`,
        stock: info.quantity,
      }))
    );
  }
  const item = inventoryDB[input.product.toLowerCase()];
  if (!item) return JSON.stringify({ error: `Product "${input.product}" not found` });
  return JSON.stringify({ product: input.product, price: `$${item.price.toFixed(2)}`, stock: item.quantity });
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'create_full_order':
      return handleCreateFullOrder(input as {
        customer_email: string;
        products: Array<{ name: string; quantity: number }>;
        delivery_city: string;
        discount_coupon?: string;
      });
    case 'browse_catalog':
      return handleBrowseCatalog(input as { product: string });
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

  let continueLoop = true;

  while (continueLoop) {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      tools,
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`Claude: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [Tool: ${block.name}]`);
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
        console.log(`  [Result: ${result.slice(0, 150)}...]`);
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
  'Create an order for joao@email.com with 2 notebooks and 3 mice, delivery in Sao Paulo, coupon DISCOUNT10'
);

console.log('\n--- Exercise 17 complete! ---');
