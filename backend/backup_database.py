#!/usr/bin/env python3
"""
Database backup script
Exports all tables to JSON format for easy restoration
"""
import sys
import os
import json
from datetime import datetime

from app.database import engine, SessionLocal
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

def export_table_to_json(session: Session, table_name: str) -> list:
    """Export a table to JSON format"""
    try:
        # Get all rows
        result = session.execute(text(f"SELECT * FROM {table_name}"))
        rows = result.fetchall()
        columns = result.keys()

        # Convert to list of dicts
        data = []
        for row in rows:
            row_dict = {}
            for i, col in enumerate(columns):
                value = row[i]
                # Handle datetime and other non-JSON types
                if isinstance(value, datetime):
                    value = value.isoformat()
                elif value is None:
                    value = None
                else:
                    value = str(value) if not isinstance(value, (int, float, bool, str)) else value
                row_dict[col] = value
            data.append(row_dict)

        return data
    except Exception as e:
        print(f"Error exporting {table_name}: {e}")
        return []

def backup_database():
    """Backup all database tables"""
    print("🔄 Starting database backup...")

    session = SessionLocal()
    backup_data = {
        "backup_date": datetime.utcnow().isoformat(),
        "tables": {}
    }

    try:
        # Get all table names
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        print(f"📊 Found {len(tables)} tables")

        for table in tables:
            print(f"  📦 Exporting {table}...", end=" ")
            data = export_table_to_json(session, table)
            backup_data["tables"][table] = data
            print(f"✅ {len(data)} rows")

        # Save to JSON file
        output_file = "/app/database_backup.json"
        with open(output_file, 'w') as f:
            json.dump(backup_data, f, indent=2, default=str)

        print(f"\n✅ Database backup completed: {output_file}")

        # Print summary
        total_rows = sum(len(data) for data in backup_data["tables"].values())
        print(f"\n📊 Backup Summary:")
        print(f"   Tables: {len(tables)}")
        print(f"   Total rows: {total_rows}")

    except Exception as e:
        print(f"\n❌ Backup failed: {e}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    backup_database()
