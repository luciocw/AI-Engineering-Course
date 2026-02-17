/**
 * Exercicio 20: Plataforma de Dados Completa (Grand Capstone)
 *
 * Combine TODOS os conceitos dos Modulos 1-4:
 * - M1 (Handlebars): Templates para relatorios
 * - M2 (Claude API): Analise AI e classificacao
 * - M3 (Tool Use): Ferramentas para consulta e enriquecimento
 * - M4 (Data Pipelines): ETL, validacao, streaming, metricas
 *
 * Dificuldade: Expert (Capstone)
 * Tempo estimado: 45 minutos
 * Execute: npx tsx exercicios/ex20-plataforma-dados.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';

const client = new Anthropic();

// === TODO 1: EXTRACT — Carregue e valide os dados com Zod (M4) ===
// - Leia customers.csv e tickets.csv
// - Defina schemas Zod com transforms
// - Valide e reporte erros

// === TODO 2: TRANSFORM — Enriqueca e classifique (M4 + M2) ===
// - Calcule metricas por cliente (health score, LTV, risco)
// - Use Claude para classificar top 3 tickets mais criticos
// - Agrupe e sumarize dados

// === TODO 3: TOOLS — Defina ferramentas de consulta (M3) ===
// - consultar_cliente: busca dados enriquecidos
// - gerar_relatorio: gera relatorio formatado de um cliente
// - metricas_plataforma: retorna KPIs gerais
// Use o loop de tool_use para permitir que o Claude consulte dados

// === TODO 4: REPORT — Gere relatorios com Handlebars (M1) ===
// - Dashboard executivo com KPIs
// - Relatorio individual por cliente
// - Lista de alertas e recomendacoes
// Registre helpers e partials necessarios

// === TODO 5: AI ANALYSIS — Analise final com contexto (M2 + M4) ===
// - Construa contexto com ContextBuilder
// - Peca ao Claude um resumo executivo com recomendacoes
// - Use tools para que o Claude consulte dados especificos

// === TODO 6: METRICAS — Instrumente o pipeline (M4) ===
// - Meça tempo de cada etapa
// - Conte registros processados
// - Reporte taxa de sucesso/erro

// === EXECUTE O PIPELINE COMPLETO ===

console.log('\n--- Exercicio 20 (Grand Capstone) completo! ---');
console.log('Dica: veja a solucao em solucoes/ex20-plataforma-dados.ts');
