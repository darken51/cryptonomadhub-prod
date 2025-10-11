#!/bin/bash
# NomadCrypto Hub - Installation Script
# Run: bash scripts/install.sh

set -e  # Exit on error

echo "🚀 NomadCrypto Hub - Installation"
echo "=================================="
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Installez Docker d'abord:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé."
    exit 1
fi

echo "✅ Docker détecté"

# Check .env
if [ ! -f .env ]; then
    echo "⚙️  Création du fichier .env depuis .env.example..."
    cp .env.example .env
    echo "⚠️  IMPORTANT: Éditez le fichier .env et configurez:"
    echo "   - PADDLE_VENDOR_ID"
    echo "   - PADDLE_AUTH_CODE"
    echo "   - PADDLE_WEBHOOK_SECRET"
    echo "   - AIRWALLEX_ACCOUNT_USD"
    echo "   - SECRET_KEY (générez avec: openssl rand -hex 32)"
    echo ""
    echo "Appuyez sur Entrée après avoir configuré .env..."
    read
else
    echo "✅ Fichier .env détecté"
fi

# Build containers
echo ""
echo "📦 Construction des containers Docker..."
docker-compose build

# Start services
echo ""
echo "🔧 Démarrage des services..."
docker-compose up -d

# Wait for PostgreSQL
echo ""
echo "⏳ Attente de PostgreSQL (15 secondes)..."
sleep 15

# Run migrations
echo ""
echo "📊 Exécution des migrations Alembic..."
docker-compose exec backend alembic upgrade head

# Seed regulations
echo ""
echo "🌱 Seed de la base de données (10 pays MVP)..."
docker-compose exec backend python scripts/seed-regulations.py

# Pull Ollama model
echo ""
echo "🤖 Téléchargement du modèle Llama 3.1 8B..."
docker-compose exec ollama ollama pull llama3.1:8b

echo ""
echo "✅ Installation terminée!"
echo ""
echo "📍 Services disponibles:"
echo "   - Backend API: http://localhost:8000"
echo "   - Frontend: http://localhost:3000"
echo "   - Docs API: http://localhost:8000/docs"
echo ""
echo "🔍 Commandes utiles:"
echo "   - Voir les logs: docker-compose logs -f"
echo "   - Arrêter: docker-compose down"
echo "   - Backup: bash scripts/backup.sh"
echo ""
echo "⚠️  N'OUBLIEZ PAS:"
echo "   1. Configurez votre webhook Paddle vers: https://votredomaine.com/paddle/webhook"
echo "   2. Ajoutez PADDLE_WEBHOOK_SECRET dans .env"
echo "   3. Ce logiciel n'est PAS un conseil financier/légal"
echo ""
