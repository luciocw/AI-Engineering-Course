# Desafio: Sistema de Templates Completo

## Objetivo

Construa um sistema de templates reutilizavel que gere prompts para diferentes casos de uso de AI.

## Requisitos

1. **3 templates de system prompt** para cenarios diferentes:
   - Assistente de suporte tecnico
   - Analista de dados
   - Tradutor multilingue

2. **Cada template deve usar:**
   - Variaveis ({{variavel}})
   - Condicionais ({{#if}})
   - Loops ({{#each}})
   - Pelo menos 1 helper customizado

3. **Funcao `renderPrompt()`** que:
   - Recebe nome do template + dados
   - Retorna o prompt renderizado
   - Valida se todos os campos obrigatorios foram preenchidos

4. **Testes** que validem:
   - Templates renderizam corretamente
   - Condicionais funcionam
   - Campos obrigatorios sao validados

## Arquivo Inicial

Use `template-sistema.ts` como ponto de partida.

## Criterios de Avaliacao

- Codigo limpo e tipado
- Templates realistas e uteis
- Tratamento de erros
- Testes cobrindo os cenarios principais

## Tempo Estimado

30-45 minutos
