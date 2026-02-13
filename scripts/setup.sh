#!/bin/bash
# Setup inicial do curso

echo "=== AI Engineering Course - Setup ==="

# Verificar Node.js
if ! command -v node &> /dev/null; then
  echo "Node.js nao encontrado. Instale: https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "Node.js 20+ necessario. Versao atual: $(node -v)"
  exit 1
fi

# Copiar .env se nao existir
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Arquivo .env criado. Edite com suas API keys."
fi

echo "Setup concluido! Execute: npx tsx scripts/verify-setup.ts"
