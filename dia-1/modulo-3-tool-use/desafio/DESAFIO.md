# Desafio: Mini Assistente de Pesquisa

## Objetivo

Construa um assistente que responde perguntas complexas de negocios
usando 3+ tools encadeadas.

## Requisitos

1. **Pelo menos 3 tools:**
   - `buscar_dados` — consulta um "banco de dados" local de clientes/vendas
   - `calcular` — faz calculos e agregacoes
   - `formatar_relatorio` — formata dados em texto estruturado

2. **Perguntas que exigem encadeamento:**
   - "Qual cliente gerou mais receita no ultimo trimestre?"
   - "Compare a taxa de churn entre planos"
   - "Qual o LTV medio dos clientes Enterprise?"

3. **O assistente deve:**
   - Escolher as tools certas automaticamente
   - Encadear tools quando necessario
   - Lidar com erros gracefully

## Arquivo

Implemente em `desafio/research-assistant.ts`
