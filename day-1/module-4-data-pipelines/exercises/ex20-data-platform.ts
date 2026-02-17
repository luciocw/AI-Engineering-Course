/**
 * Exercise 20: Complete Data Platform (Grand Capstone)
 *
 * Combine ALL concepts from Modules 1-4:
 * - M1 (Handlebars): Templates for reports
 * - M2 (Claude API): AI analysis and classification
 * - M3 (Tool Use): Tools for querying and enrichment
 * - M4 (Data Pipelines): ETL, validation, streaming, metrics
 *
 * Difficulty: Expert (Capstone)
 * Estimated time: 45 minutes
 * Run: npx tsx exercises/ex20-plataforma-dados.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';

const client = new Anthropic();

// === TODO 1: EXTRACT -- Load and validate data with Zod (M4) ===
// - Read customers.csv and tickets.csv
// - Define Zod schemas with transforms
// - Validate and report errors

// === TODO 2: TRANSFORM -- Enrich and classify (M4 + M2) ===
// - Calculate metrics per customer (health score, LTV, risk)
// - Use Claude to classify top 3 most critical tickets
// - Group and summarize data

// === TODO 3: TOOLS -- Define query tools (M3) ===
// - lookup_customer: searches enriched data
// - generate_report: generates a formatted report for a customer
// - platform_metrics: returns general KPIs
// Use the tool_use loop to allow Claude to query data

// === TODO 4: REPORT -- Generate reports with Handlebars (M1) ===
// - Executive dashboard with KPIs
// - Individual customer report
// - List of alerts and recommendations
// Register necessary helpers and partials

// === TODO 5: AI ANALYSIS -- Final analysis with context (M2 + M4) ===
// - Build context with ContextBuilder
// - Ask Claude for an executive summary with recommendations
// - Use tools so Claude can query specific data

// === TODO 6: METRICS -- Instrument the pipeline (M4) ===
// - Measure time for each step
// - Count processed records
// - Report success/error rate

// === RUN THE COMPLETE PIPELINE ===

console.log('\n--- Exercise 20 (Grand Capstone) complete! ---');
console.log('Hint: see the solution in solutions/ex20-plataforma-dados.ts');
