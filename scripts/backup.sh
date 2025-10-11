#!/bin/bash
# NomadCrypto Hub - Backup Script
# Run: bash scripts/backup.sh
# Cron: 0 2 * * * /path/to/scripts/backup.sh

set -e

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/nomadcrypto_${TIMESTAMP}.sql"

echo "🗄️  NomadCrypto Hub - Database Backup"
echo "===================================="
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Get database credentials from .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ Fichier .env introuvable"
    exit 1
fi

# Extract DB info from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "📊 Base de données: $DB_NAME"
echo "🕒 Timestamp: $TIMESTAMP"
echo ""

# Backup via Docker
echo "💾 Création du backup..."
docker-compose exec -T postgres pg_dump \
    -U "$DB_USER" \
    -h localhost \
    -d "$DB_NAME" \
    --clean \
    --if-exists \
    > "$BACKUP_FILE"

# Compress backup
echo "🗜️  Compression..."
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Get file size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo ""
echo "✅ Backup terminé!"
echo "📁 Fichier: $BACKUP_FILE"
echo "📦 Taille: $BACKUP_SIZE"
echo ""

# Optional: Keep only last 30 backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 30 ]; then
    echo "🧹 Nettoyage des anciens backups (conservation des 30 derniers)..."
    ls -1t "$BACKUP_DIR"/*.sql.gz | tail -n +31 | xargs rm -f
    echo "✅ Nettoyage terminé"
fi

echo ""
echo "🔄 Pour restaurer ce backup:"
echo "   gunzip -c $BACKUP_FILE | docker-compose exec -T postgres psql -U $DB_USER -d $DB_NAME"
echo ""
