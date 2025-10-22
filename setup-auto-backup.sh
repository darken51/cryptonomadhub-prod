#!/bin/bash

#####################################################################
# Setup automatic daily backups (optional)
#####################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Setup Automatic Daily Backups"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will create a daily backup at 3:00 AM"
echo "Old backups (>7 days) will be automatically deleted"
echo ""
read -p "Continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Setup cancelled"
    exit 0
fi

CRON_JOB="0 3 * * * cd /home/fred/cryptonomadhub && ./backup.sh \"auto-daily-\$(date +\%Y\%m\%d)\" >> /home/fred/cryptonomadhub/backups/cron.log 2>&1"
CLEANUP_JOB="0 4 * * * find /home/fred/cryptonomadhub/backups/auto-daily-* -type d -mtime +7 -exec rm -rf {} +"

# Check if cron jobs already exist
if crontab -l 2>/dev/null | grep -q "cryptonomadhub.*backup.sh"; then
    echo "⚠️  Cron job already exists!"
    echo ""
    echo "Current cron jobs:"
    crontab -l | grep cryptonomadhub
    echo ""
    read -p "Replace with new config? (yes/no): " -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "❌ Setup cancelled"
        exit 0
    fi

    # Remove old cron jobs
    crontab -l | grep -v "cryptonomadhub" | crontab -
fi

# Add new cron jobs
(crontab -l 2>/dev/null; echo ""; echo "# CryptoNomadHub - Daily Backup"; echo "$CRON_JOB"; echo ""; echo "# CryptoNomadHub - Cleanup old backups"; echo "$CLEANUP_JOB") | crontab -

echo "✅ Automatic backups configured!"
echo ""
echo "Schedule:"
echo "  • Daily backup: 3:00 AM"
echo "  • Cleanup old backups: 4:00 AM (>7 days)"
echo ""
echo "Backup naming: auto-daily-YYYYMMDD"
echo "Log file: /home/fred/cryptonomadhub/backups/cron.log"
echo ""
echo "To view current cron jobs:"
echo "  crontab -l"
echo ""
echo "To remove automatic backups:"
echo "  crontab -e"
echo "  (delete the lines with 'CryptoNomadHub')"
echo ""
