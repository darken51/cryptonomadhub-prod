#!/bin/bash

#####################################################################
# CryptoNomadHub - Complete Backup Script
#####################################################################
# This script creates a complete backup of:
# - PostgreSQL database (all data)
# - Redis database (cache/sessions)
# - Source code (if not in git)
# - Configuration files (.env)
#
# Usage: ./backup.sh [backup_name]
# Example: ./backup.sh "before-major-update"
#####################################################################

set -e  # Exit on error

# Configuration
BACKUP_DIR="/home/fred/cryptonomadhub/backups"
PROJECT_DIR="/home/fred/cryptonomadhub"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="${1:-backup_$TIMESTAMP}"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Starting Complete Backup: $BACKUP_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create backup directory
mkdir -p "$BACKUP_PATH"

# ============================================================
# 1. BACKUP POSTGRESQL DATABASE
# ============================================================
echo "📊 [1/5] Backing up PostgreSQL database..."

docker exec nomadcrypto-postgres pg_dumpall -U nomad > "$BACKUP_PATH/database.sql"

DB_SIZE=$(du -h "$BACKUP_PATH/database.sql" | cut -f1)
echo "✅ Database backed up ($DB_SIZE)"
echo ""

# ============================================================
# 2. BACKUP REDIS DATA
# ============================================================
echo "💾 [2/5] Backing up Redis data..."

docker exec nomadcrypto-redis redis-cli SAVE > /dev/null 2>&1 || true
docker cp nomadcrypto-redis:/data/dump.rdb "$BACKUP_PATH/redis_dump.rdb" 2>/dev/null || echo "⚠️  Redis dump not found (may be empty)"

if [ -f "$BACKUP_PATH/redis_dump.rdb" ]; then
    REDIS_SIZE=$(du -h "$BACKUP_PATH/redis_dump.rdb" | cut -f1)
    echo "✅ Redis backed up ($REDIS_SIZE)"
else
    echo "⚠️  Redis backup skipped (no data)"
fi
echo ""

# ============================================================
# 3. BACKUP CONFIGURATION FILES
# ============================================================
echo "⚙️  [3/5] Backing up configuration files..."

mkdir -p "$BACKUP_PATH/config"

# Backend .env
if [ -f "$PROJECT_DIR/backend/.env" ]; then
    cp "$PROJECT_DIR/backend/.env" "$BACKUP_PATH/config/backend.env"
    echo "   ✅ backend/.env"
fi

# Frontend .env.local
if [ -f "$PROJECT_DIR/frontend/.env.local" ]; then
    cp "$PROJECT_DIR/frontend/.env.local" "$BACKUP_PATH/config/frontend.env.local"
    echo "   ✅ frontend/.env.local"
fi

# Docker compose
if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
    cp "$PROJECT_DIR/docker-compose.yml" "$BACKUP_PATH/config/docker-compose.yml"
    echo "   ✅ docker-compose.yml"
fi

# Root .env (if exists)
if [ -f "$PROJECT_DIR/.env" ]; then
    cp "$PROJECT_DIR/.env" "$BACKUP_PATH/config/root.env"
    echo "   ✅ .env"
fi

echo "✅ Configuration files backed up"
echo ""

# ============================================================
# 4. BACKUP SOURCE CODE (if not in git)
# ============================================================
echo "📦 [4/5] Checking source code..."

cd "$PROJECT_DIR"

if [ -d ".git" ]; then
    # Git repository - save commit info
    echo "   📌 Git repository detected"
    echo "   Commit: $(git rev-parse HEAD)" > "$BACKUP_PATH/git_info.txt"
    echo "   Branch: $(git rev-parse --abbrev-ref HEAD)" >> "$BACKUP_PATH/git_info.txt"
    echo "   Status:" >> "$BACKUP_PATH/git_info.txt"
    git status --short >> "$BACKUP_PATH/git_info.txt"

    # Check for uncommitted changes
    if [[ -n $(git status --porcelain) ]]; then
        echo "   ⚠️  WARNING: Uncommitted changes detected!"
        echo ""
        echo "   Creating backup of uncommitted changes..."
        git diff > "$BACKUP_PATH/uncommitted_changes.patch"
        echo "   ✅ Uncommitted changes saved to uncommitted_changes.patch"
    else
        echo "   ✅ No uncommitted changes"
    fi

    echo "✅ Git info saved"
else
    # No git - backup entire source code
    echo "   📁 No git repository - backing up source code..."

    tar -czf "$BACKUP_PATH/source_code.tar.gz" \
        --exclude='node_modules' \
        --exclude='__pycache__' \
        --exclude='.next' \
        --exclude='backups' \
        --exclude='.venv' \
        backend/ frontend/ 2>/dev/null || true

    SOURCE_SIZE=$(du -h "$BACKUP_PATH/source_code.tar.gz" | cut -f1)
    echo "✅ Source code backed up ($SOURCE_SIZE)"
fi
echo ""

# ============================================================
# 5. CREATE BACKUP METADATA
# ============================================================
echo "📝 [5/5] Creating backup metadata..."

cat > "$BACKUP_PATH/BACKUP_INFO.txt" << EOF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CryptoNomadHub - Backup Information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Backup Name: $BACKUP_NAME
Date: $(date '+%Y-%m-%d %H:%M:%S')
Hostname: $(hostname)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ database.sql - Complete PostgreSQL dump
✅ redis_dump.rdb - Redis data (if any)
✅ config/ - All configuration files (.env, docker-compose.yml)
✅ git_info.txt - Git commit information (if git repo)
✅ source_code.tar.gz - Full source backup (if no git)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCKER CONTAINERS STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$(docker ps --filter "name=nomadcrypto" --format "{{.Names}}: {{.Status}}")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESTORATION INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To restore this backup:

1. Restore PostgreSQL database:
   docker exec -i nomadcrypto-postgres psql -U nomad < $BACKUP_PATH/database.sql

2. Restore Redis (if needed):
   docker cp $BACKUP_PATH/redis_dump.rdb nomadcrypto-redis:/data/dump.rdb
   docker restart nomadcrypto-redis

3. Restore configuration files:
   cp $BACKUP_PATH/config/backend.env /home/fred/cryptonomadhub/backend/.env
   cp $BACKUP_PATH/config/frontend.env.local /home/fred/cryptonomadhub/frontend/.env.local

4. If git repository:
   cd /home/fred/cryptonomadhub
   git checkout <commit-hash-from-git_info.txt>

   If uncommitted changes exist:
   git apply $BACKUP_PATH/uncommitted_changes.patch

5. Restart all services:
   cd /home/fred/cryptonomadhub
   docker-compose restart

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  SECURITY: This backup contains sensitive data including:
   - API keys and secrets (.env files)
   - Complete database with user data
   - Redis sessions

🔒 Keep this backup in a secure location!

For automatic restoration, use:
   ./restore.sh $BACKUP_NAME

EOF

echo "✅ Backup metadata created"
echo ""

# ============================================================
# BACKUP SUMMARY
# ============================================================
TOTAL_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Backup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Location: $BACKUP_PATH"
echo "💾 Total size: $TOTAL_SIZE"
echo ""
echo "📋 Files created:"
ls -lh "$BACKUP_PATH" | tail -n +2 | awk '{print "   " $9 " (" $5 ")"}'
echo ""
echo "To restore this backup later, run:"
echo "   ./restore.sh $BACKUP_NAME"
echo ""
