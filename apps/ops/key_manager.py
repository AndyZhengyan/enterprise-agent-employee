"""OPS API Key Manager — auto-generation, storage, and verification."""

from __future__ import annotations

import hashlib
import os
import secrets
import sqlite3
import time
from pathlib import Path
from typing import Optional

from common.tracing import get_logger

logger = get_logger("ops.key_manager")


def hash_key(key: str) -> str:
    """SHA-256 hash of the API key."""
    return hashlib.sha256(key.encode()).hexdigest()


def generate_key() -> str:
    """Generate a 64-char hex key (32 bytes)."""
    return secrets.token_hex(32)


class OPSKeyManager:
    def __init__(self, db_path: Optional[str] = None):
        self.db_path: str = db_path or os.environ.get("OPS_DB_PATH", "data/ops.db")
        self._ensure_db()

    def _ensure_db(self) -> None:
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)

    def init_db(self) -> None:
        """Create api_keys table if not exists."""
        conn = sqlite3.connect(self.db_path)
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS api_keys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key_hash TEXT NOT NULL,
                created_at TEXT NOT NULL,
                description TEXT DEFAULT '',
                is_active INTEGER NOT NULL DEFAULT 1
            )
            """
        )
        conn.commit()
        conn.close()

    def is_dev_mode(self) -> bool:
        """Dev mode: no OPS_API_KEY env var AND no active key in DB."""
        if os.environ.get("OPS_API_KEY"):
            return False
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM api_keys WHERE is_active = 1")
        count = cur.fetchone()[0]
        conn.close()
        return count == 0

    def get_active_key_hash(self) -> Optional[str]:
        """Get the active key hash from DB, or None."""
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute("SELECT key_hash FROM api_keys WHERE is_active = 1 LIMIT 1")
        row = cur.fetchone()
        conn.close()
        return row[0] if row else None

    def verify_key(self, key: str) -> bool:
        """Timing-safe verification. Returns True if key matches active key."""
        env_key = os.environ.get("OPS_API_KEY", "")
        if env_key:
            return secrets.compare_digest(key, env_key)

        # Otherwise check DB
        active_hash = self.get_active_key_hash()
        if not active_hash:
            return True  # Dev mode - allow all

        return secrets.compare_digest(hash_key(key), active_hash)

    def generate_and_store(self, description: str = "") -> str:
        """Generate new key, store hash, return plaintext key ONCE."""
        key = generate_key()
        h = hash_key(key)
        conn = sqlite3.connect(self.db_path)
        # Deactivate all existing keys
        conn.execute("UPDATE api_keys SET is_active = 0 WHERE is_active = 1")
        conn.execute(
            "INSERT INTO api_keys (key_hash, created_at, description, is_active) VALUES (?, ?, ?, 1)",
            (h, time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), description),
        )
        conn.commit()
        conn.close()
        logger.info("api_key_generated", description=description)
        return key

    def get_active_key_hint(self) -> Optional[str]:
        """Return a hint like 'key_****_8chars' or 'env:OPS_API_KEY'."""
        env_key = os.environ.get("OPS_API_KEY", "")
        if env_key:
            return f"env:OPS_API_KEY (last 4: {env_key[-4:]})"
        active_hash = self.get_active_key_hash()
        if active_hash:
            return f"db:****{active_hash[-6:]}"
        return None

    def ensure_key_exists(self) -> None:
        """On startup: if no env var AND no active DB key, auto-generate."""
        if os.environ.get("OPS_API_KEY"):
            return
        if self.get_active_key_hash():
            return
        self.generate_and_store("auto-generated on first startup")
        logger.warning(
            "api_key_auto_generated",
            hint=self.get_active_key_hint(),
            instruction=(
                "Set OPS_API_KEY env var for production use, or use POST /api/admin/api-key "
                "to generate a new key. Current key stored in DB."
            ),
        )
