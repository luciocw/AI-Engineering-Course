#!/bin/bash
# Cria os 4 repositorios de portfolio no GitHub
# Requer: gh CLI autenticado (gh auth login)

REPOS=(
  "ai-prompt-engineering-toolkit:Sistema de templates e prompts otimizados para LLMs"
  "rag-knowledge-assistant:Sistema RAG completo com vector database e semantic search"
  "multi-agent-ai-system:Sistema multi-agent com 5+ tools integradas"
  "production-ai-service:AI service production-ready com CI/CD e monitoring"
)

echo "=== Criando repositorios de portfolio ==="

for entry in "${REPOS[@]}"; do
  IFS=':' read -r name description <<< "$entry"

  echo "Criando: $name"
  gh repo create "$name" \
    --public \
    --description "$description" \
    --clone \
    || echo "Repo $name ja existe ou erro ao criar"

  echo "---"
done

echo "Repositorios criados! Verifique em github.com"
