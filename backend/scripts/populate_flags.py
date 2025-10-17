#!/usr/bin/env python3
"""
Populate flag emojis for all countries in regulations table
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.regulation import Regulation


def country_code_to_flag(code: str) -> str:
    """
    Convert ISO 3166-1 alpha-2 country code to flag emoji
    Example: 'US' -> '🇺🇸', 'FR' -> '🇫🇷'
    """
    if not code or len(code) != 2:
        return ""

    # Regional Indicator Symbols start at U+1F1E6 (🇦)
    # A = 0x1F1E6, B = 0x1F1E7, etc.
    OFFSET = 0x1F1E6 - ord('A')

    return "".join(chr(ord(c.upper()) + OFFSET) for c in code)


def populate_flags():
    """Update all regulations with flag emojis"""
    db = SessionLocal()
    try:
        regulations = db.query(Regulation).all()

        updated = 0
        for reg in regulations:
            flag = country_code_to_flag(reg.country_code)
            if flag:
                reg.flag_emoji = flag
                updated += 1
                print(f"{reg.country_code} -> {flag} ({reg.country_name})")

        db.commit()
        print(f"\n✅ Updated {updated} countries with flag emojis")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    populate_flags()
