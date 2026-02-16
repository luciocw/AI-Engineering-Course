# Modulo 4: Data Pipelines para AI

Aprenda a processar, validar e transformar dados para alimentar modelos de AI. Sem APIs externas — tudo local.

## Exercicios

| # | Arquivo | Topico | Dificuldade |
|---|---------|--------|-------------|
| 1 | `ex1-csv-processing.ts` | Parse CSV, metricas de negocios | Iniciante |
| 2 | `ex2-json-transform.ts` | Normalizacao de JSON multi-fonte | Intermediario |
| 3 | `ex3-data-validation.ts` | Schemas Zod, deteccao XSS/injection | Intermediario |
| 4 | `ex4-etl-pipeline.ts` | Pipeline ETL completo: extract → transform → load | Avancado |

## Conceitos

### Por que Data Pipelines?

Modelos de AI sao tao bons quanto os dados que recebem. Antes de enviar dados para um LLM:

1. **Extract** — coletar dados de multiplas fontes (CSV, JSON, APIs)
2. **Transform** — limpar, normalizar, enriquecer
3. **Load** — estruturar para consumo (prompts, embeddings, fine-tuning)

### Stack usada

- `csv-parse` — parser de CSV robusto e streaming
- `zod` — validacao de schemas com TypeScript types

## Como executar

```bash
npm install
npx tsx exercicios/ex1-csv-processing.ts   # Exercicio com TODOs
npx tsx solucoes/ex1-csv-processing.ts      # Solucao completa
npm test                                     # Testes (sem dependencias externas)
```

## Dados de exemplo

- `data/samples/customers.csv` — 12 clientes SaaS
- `data/samples/tickets.csv` — 20 tickets de suporte

## Checklist

- [ ] Sei parsear CSV com tipagem correta
- [ ] Consigo normalizar JSON de fontes diferentes
- [ ] Sei usar Zod para validacao + deteccao de injection
- [ ] Implementei um pipeline ETL completo
