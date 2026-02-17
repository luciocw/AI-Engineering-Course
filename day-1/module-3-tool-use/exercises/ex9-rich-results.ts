/**
 * Exercise 9: Rich Results with Structured Data
 *
 * Return complex and structured results from tools,
 * including tables, hierarchical lists, and metadata.
 *
 * Difficulty: Intermediate
 * Estimated time: 20 minutes
 * Run: npx tsx exercises/ex9-tool-resultados-ricos.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEPT ===
// Tool results can contain rich and structured data.
// The key is to format them so Claude can interpret and
// present them to the user clearly.
// Strategies:
// - Structured JSON with semantic fields
// - Metadata (source, timestamp, confidence)
// - Hierarchical data (categories > subcategories > items)

// === Simulated data ===
const dashboardData = {
  sales: {
    today: { total: 15680, orders: 42, average_ticket: 373.33 },
    week: { total: 98450, orders: 287, average_ticket: 343.03 },
    month: { total: 456000, orders: 1250, average_ticket: 364.80 },
  },
  topProducts: [
    { name: 'Enterprise Plan', sales: 45, revenue: 44955 },
    { name: 'Pro Plan', sales: 120, revenue: 35880 },
    { name: 'Starter Plan', sales: 350, revenue: 17150 },
  ],
  alerts: [
    { type: 'warning', msg: 'Low stock: Wireless Mouse (5 units)' },
    { type: 'info', msg: 'New daily sales record reached' },
    { type: 'error', msg: 'Payment gateway failure at 14:32' },
  ],
};

// === TODO 1: Create the "sales_dashboard" tool ===
// Returns complete dashboard data with metrics, top products, and alerts.

// const tools: Anthropic.Tool[] = [
//   {
//     name: 'sales_dashboard',
//     description: 'Returns the complete sales dashboard with metrics by period, ' +
//                  'product ranking, and system alerts.',
//     input_schema: {
//       type: 'object' as const,
//       properties: {
//         period: {
//           type: 'string',
//           enum: ['today', 'week', 'month'],
//           description: 'Period to display metrics',
//         },
//         include_alerts: {
//           type: 'boolean',
//           description: 'Include system alerts (default: true)',
//         },
//       },
//       required: ['period'],
//     },
//   },
// ];

// === TODO 2: Format the result as rich JSON with metadata ===

// function handleDashboard(input: { period: string; include_alerts?: boolean }): string {
//   const metrics = dashboardData.sales[input.period as keyof typeof dashboardData.sales];
//   // Build a result object with:
//   // - _meta: { source, timestamp, period }
//   // - metrics: { ... }
//   // - ranking: [ ... ] (top 3 products)
//   // - alerts: [ ... ] (if include_alerts !== false)
//   // Return JSON.stringify of the complete object
// }

// === TODO 3: Run the loop and see how Claude interprets rich data ===
// Question: "Show me the monthly sales dashboard with alerts"

console.log('\n--- Exercise 9 complete! ---');
console.log('Hint: see the solution in solutions/ex9-tool-resultados-ricos.ts');
