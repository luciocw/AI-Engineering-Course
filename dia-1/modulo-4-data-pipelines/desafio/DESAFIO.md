# Desafio: Dashboard de Qualidade de Dados

## Objetivo

Construa um pipeline que ingere CSV, valida dados e gera prompts AI-ready
com contexto estruturado.

## Requisitos

1. **Ingestao:** Leia `customers.csv` e `tickets.csv`
2. **Validacao:** Use Zod para validar cada registro, colete erros
3. **Metricas de qualidade:**
   - Completude: % de campos preenchidos
   - Validade: % de registros que passam no schema
   - Consistencia: emails duplicados, IDs orfaos
4. **Output AI-Ready:** Gere um JSON estruturado que pode ser usado
   como contexto em um prompt para Claude analisar a saude dos clientes

## Arquivo

Implemente em `desafio/data-quality.ts`
