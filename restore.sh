#!/bin/bash

#####################################################################
# CryptoNomadHub - Restoration Script
#####################################################################
# This script restores a complete backup created by backup.sh
#
# Usage: ./restore.sh <backup_name>
# Example: ./restore.sh backup_20250118_143022
#####################################################################

set -e  # Exit on error

# Check if backup name provided
if [ -z "$1" ]; then
    echo "❌ Error: Backup name required"
    echo ""
    echo "Usage: ./restore.sh <backup_name>"
    echo ""
    echo "Available backups:"
    ls -1 /home/fred/cryptonomadhub/backups/ 2>/dev/null || echo "  (none)"
    exit 1
fi

BACKUP_DIR="/home/fred/cryptonomadhub/backups"
PROJECT_DIR="/home/fred/cryptonomadhub"
BACKUP_NAME="$1"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

# Check if backup exists
if [ ! -d "$BACKUP_PATH" ]; then
    echo "❌ Error: Backup '$BACKUP_NAME' not found"
    echo ""
    echo "Available backups:"
    ls -1 "$BACKUP_DIR" 2>/dev/null || echo "  (none)"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Restoring Backup: $BACKUP_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  WARNING: This will overwrite current data!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Restoration cancelled"
    exit 0
fi

echo "Starting restoration..."
echo ""

# ============================================================
# 1. STOP SERVICES (to avoid data conflicts)
# ============================================================
echo "⏸️  [1/5] Stopping services..."

cd "$PROJECT_DIR"
docker-compose stop backend celery celery-beat 2>/dev/null || true

echo "✅ Services stopped"
echo ""

# ============================================================
# 2. RESTORE POSTGRESQL DATABASE
# ============================================================
echo "📊 [2/5] Restoring PostgreSQL database..."

if [ -f "$BACKUP_PATH/database.sql" ]; then
    # Drop all connections first
    docker exec nomadcrypto-postgres psql -U nomad -d nomadcrypto -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname NOT IN ('postgres', 'template0', 'template1');" 2>/dev/null || true

    # Restore database
    docker exec -i nomadcrypto-postgres psql -U nomad < "$BACKUP_PATH/database.sql"

    echo "✅ Database restored"
else
    echo "⚠️  Database backup not found, skipping"
fi
echo ""

# ============================================================
# 3. RESTORE REDIS DATA
# ============================================================
echo "💾 [3/5] Restoring Redis data..."

if [ -f "$BACKUP_PATH/redis_dump.rdb" ]; then
    docker stop nomadcrypto-redis 2>/dev/null || true
    docker cp "$BACKUP_PATH/redis_dump.rdb" nomadcrypto-redis:/data/dump.rdb
    docker start nomadcrypto-redis
    sleep 2

    echo "✅ Redis restored"
else
    echo "⚠️  Redis backup not found, skipping"
fi
echo ""

# ============================================================
# 4. RESTORE CONFIGURATION FILES
# ============================================================
echo "⚙️  [4/5] Restoring configuration files..."

if [ -d "$BACKUP_PATH/config" ]; then
    # Backend .env
    if [ -f "$BACKUP_PATH/config/backend.env" ]; then
        cp "$BACKUP_PATH/config/backend.env" "$PROJECT_DIR/backend/.env"
        echo "   ✅ backend/.env"
    fi

    # Frontend .env.local
    if [ -f "$BACKUP_PATH/config/frontend.env.local" ]; then
        cp "$BACKUP_PATH/config/frontend.env.local" "$PROJECT_DIR/frontend/.env.local"
        echo "   ✅ frontend/.env.local"
    fi

    # Root .env
    if [ -f "$BACKUP_PATH/config/root.env" ]; then
        cp "$BACKUP_PATH/config/root.env" "$PROJECT_DIR/.env"
        echo "   ✅ .env"
    fi

    echo "✅ Configuration files restored"
else
    echo "⚠️  Configuration backup not found, skipping"
fi
echo ""

# ============================================================
# 5. RESTORE SOURCE CODE (if needed)
# ============================================================
echo "📦 [5/5] Checking source code..."

cd "$PROJECT_DIR"

if [ -f "$BACKUP_PATH/git_info.txt" ]; then
    echo "   📌 Git backup detected"

    # Show git info
    cat "$BACKUP_PATH/git_info.txt"
    echo ""

    # Restore uncommitted changes if they exist
    if [ -f "$BACKUP_PATH/uncommitted_changes.patch" ]; then
        echo "   🔄 Applying uncommitted changes..."
        git apply "$BACKUP_PATH/uncommitted_changes.patch" 2>/dev/null || echo "   ⚠️  Could not apply patch (may already be applied)"
    fi

    echo "✅ Git state noted (checkout manually if needed)"
elif [ -f "$BACKUP_PATH/source_code.tar.gz" ]; then
    echo "   📁 Source code backup detected"
    read -p "   ⚠️  Restore source code? This will overwrite current files! (yes/no): " -r
    echo ""

    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        tar -xzf "$BACKUP_PATH/source_code.tar.gz" -C "$PROJECT_DIR"
        echo "✅ Source code restored"
    else
        echo "⏭️  Source code restoration skipped"
    fi
else
    echo "⚠️  No source code backup found"
fi
echo ""

# ============================================================
# 6. RESTART SERVICES
# ============================================================
echo "🔄 Restarting all services..."

cd "$PROJECT_DIR"
docker-compose restart

echo "✅ Services restarted"
echo ""

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 5

# ============================================================
# RESTORATION SUMMARY
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Restoration Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Restored from: $BACKUP_PATH"
echo ""
echo "Container status:"
docker ps --filter "name=nomadcrypto" --format "   {{.Names}}: {{.Status}}"
echo ""
echo "🌐 Your site should now be running at:"
echo "   Frontend: http://localhost:3001"
echo "   Backend:  http://localhost:8001"
echo ""
