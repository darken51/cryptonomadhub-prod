#!/bin/bash

# Full Backup Script for CryptoNomadHub
# Creates a complete backup of database, code, and configurations

set -e  # Exit on error

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/backup_${TIMESTAMP}"
PROJECT_ROOT="/home/fred/cryptonomadhub"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      CryptoNomadHub - Full Backup Script              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Timestamp: $(date)"
echo "Backup directory: $BACKUP_DIR"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# 1. Backup PostgreSQL Database
echo -e "${BLUE}📦 1/6 - Backing up PostgreSQL database...${NC}"
docker exec nomadcrypto-postgres pg_dump -U nomad nomadcrypto > "$BACKUP_DIR/database_backup.sql"
DB_SIZE=$(du -h "$BACKUP_DIR/database_backup.sql" | cut -f1)
echo -e "${GREEN}✅ Database backed up ($DB_SIZE)${NC}"
echo ""

# 2. Backup environment files
echo -e "${BLUE}📦 2/6 - Backing up environment files...${NC}"
cp backend/.env "$BACKUP_DIR/backend.env" 2>/dev/null || echo "Warning: backend/.env not found"
cp frontend/.env "$BACKUP_DIR/frontend.env" 2>/dev/null || echo "Warning: frontend/.env not found"
cp frontend/.env.local "$BACKUP_DIR/frontend.env.local" 2>/dev/null || echo "Warning: frontend/.env.local not found"
cp .env "$BACKUP_DIR/root.env" 2>/dev/null || echo "Warning: .env not found"
echo -e "${GREEN}✅ Environment files backed up${NC}"
echo ""

# 3. Export Docker volumes info
echo -e "${BLUE}📦 3/6 - Saving Docker configuration...${NC}"
docker-compose config > "$BACKUP_DIR/docker-compose.yml" 2>/dev/null || echo "Warning: docker-compose.yml not exported"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" > "$BACKUP_DIR/docker_containers.txt"
echo -e "${GREEN}✅ Docker configuration saved${NC}"
echo ""

# 4. Create Git bundle (complete code backup)
echo -e "${BLUE}📦 4/6 - Creating Git bundle (complete code history)...${NC}"
cd "$PROJECT_ROOT"
git bundle create "$BACKUP_DIR/cryptonomadhub_git.bundle" --all
BUNDLE_SIZE=$(du -h "$BACKUP_DIR/cryptonomadhub_git.bundle" | cut -f1)
echo -e "${GREEN}✅ Git bundle created ($BUNDLE_SIZE)${NC}"
echo ""

# 5. Create code archive (alternative backup)
echo -e "${BLUE}📦 5/6 - Creating code archive...${NC}"
tar -czf "$BACKUP_DIR/code_backup.tar.gz" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='venv' \
    --exclude='backups' \
    backend/ frontend/ scripts/ docker-compose.yml .gitignore README.md 2>/dev/null || true
CODE_SIZE=$(du -h "$BACKUP_DIR/code_backup.tar.gz" | cut -f1)
echo -e "${GREEN}✅ Code archived ($CODE_SIZE)${NC}"
echo ""

# 6. Create backup manifest
echo -e "${BLUE}📦 6/6 - Creating backup manifest...${NC}"
cat > "$BACKUP_DIR/BACKUP_INFO.txt" << EOF
═══════════════════════════════════════════════════════════
    CryptoNomadHub - Full Backup
═══════════════════════════════════════════════════════════

Backup Date: $(date)
Backup Directory: $BACKUP_DIR

═══════════════════════════════════════════════════════════
    CONTENTS
═══════════════════════════════════════════════════════════

1. database_backup.sql          - PostgreSQL database dump
2. backend.env                  - Backend environment variables
3. frontend.env                 - Frontend environment variables
4. frontend.env.local           - Frontend local environment
5. docker-compose.yml           - Docker configuration
6. docker_containers.txt        - Running containers info
7. cryptonomadhub_git.bundle    - Complete Git repository
8. code_backup.tar.gz           - Source code archive
9. BACKUP_INFO.txt              - This file

═══════════════════════════════════════════════════════════
    DATABASE INFO
═══════════════════════════════════════════════════════════

Database: nomadcrypto
User: nomad
Size: $DB_SIZE

═══════════════════════════════════════════════════════════
    GIT INFO
═══════════════════════════════════════════════════════════

Last Commits:
$(git log --oneline -5)

Current Branch: $(git branch --show-current)
Git Status: $(git status --short)

═══════════════════════════════════════════════════════════
    DOCKER INFO
═══════════════════════════════════════════════════════════

$(cat "$BACKUP_DIR/docker_containers.txt")

═══════════════════════════════════════════════════════════
    RESTORE INSTRUCTIONS
═══════════════════════════════════════════════════════════

1. Restore Git Repository:
   git clone cryptonomadhub_git.bundle cryptonomadhub

2. Restore Environment Files:
   cp backend.env backend/.env
   cp frontend.env frontend/.env
   cp frontend.env.local frontend/.env.local

3. Start Docker Containers:
   docker-compose up -d

4. Restore Database:
   docker exec -i nomadcrypto-postgres psql -U nomad nomadcrypto < database_backup.sql

5. Rebuild Frontend:
   cd frontend && npm install && npm run build

═══════════════════════════════════════════════════════════
EOF

echo -e "${GREEN}✅ Backup manifest created${NC}"
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              BACKUP COMPLETED SUCCESSFULLY             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Backup location: $BACKUP_DIR"
echo ""
echo "Files created:"
ls -lh "$BACKUP_DIR/" | awk '{print "  - " $9 " (" $5 ")"}'
echo ""
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "Total backup size: $TOTAL_SIZE"
echo ""
echo -e "${GREEN}✅ Backup is ready!${NC}"
echo ""
