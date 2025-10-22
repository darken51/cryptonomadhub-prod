#!/bin/bash

#####################################################################
# List all available backups
#####################################################################

BACKUP_DIR="/home/fred/cryptonomadhub/backups"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Available Backups"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
    echo "No backups found."
    echo ""
    echo "Create your first backup with:"
    echo "   ./backup.sh [backup_name]"
    exit 0
fi

cd "$BACKUP_DIR"

for backup in */; do
    backup_name="${backup%/}"
    backup_path="$BACKUP_DIR/$backup_name"

    if [ -f "$backup_path/BACKUP_INFO.txt" ]; then
        # Extract date from BACKUP_INFO.txt
        backup_date=$(grep "^Date:" "$backup_path/BACKUP_INFO.txt" | cut -d: -f2- | xargs)
        backup_size=$(du -sh "$backup_path" | cut -f1)

        echo "📍 $backup_name"
        echo "   Date: $backup_date"
        echo "   Size: $backup_size"

        # Check if has database
        if [ -f "$backup_path/database.sql" ]; then
            db_size=$(du -h "$backup_path/database.sql" | cut -f1)
            echo "   ✅ Database ($db_size)"
        fi

        # Check if has uncommitted changes
        if [ -f "$backup_path/uncommitted_changes.patch" ]; then
            echo "   ⚠️  Contains uncommitted changes"
        fi

        echo ""
    else
        echo "📍 $backup_name (no metadata)"
        echo ""
    fi
done

echo "To restore a backup, run:"
echo "   ./restore.sh <backup_name>"
echo ""
