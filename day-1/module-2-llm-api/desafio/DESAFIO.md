# Desafio: Framework de A/B Testing de Prompts

## Objetivo

Construa um framework que compara duas variantes de prompt para a mesma tarefa,
medindo qualidade, custo e latencia.

## Requisitos

1. **Funcao `runABTest()`** que recebe:
   - `question`: a pergunta a ser respondida
   - `promptA`: funcao que formata o prompt (variante A)
   - `promptB`: funcao que formata o prompt (variante B)
   - `runs`: numero de execucoes por variante (default: 3)

2. **Metricas coletadas para cada variante:**
   - Tempo medio de resposta (ms)
   - Tokens medios (input + output)
   - Custo medio estimado
   - Tamanho medio da resposta (caracteres)

3. **Tabela comparativa** no console com:
   - Metrica | Variante A | Variante B | Vencedor

4. **Pelo menos 2 testes A/B:**
   - Prompt curto vs prompt detalhado
   - Com system prompt vs sem system prompt

## Dica

Use `performance.now()` para medir latencia.

## Arquivo

Implemente em `desafio/ab-testing.ts`
