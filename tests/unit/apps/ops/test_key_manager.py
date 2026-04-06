"""Tests for apps.ops.key_manager."""
import os
import tempfile

import pytest

from apps.ops.key_manager import OPSKeyManager, generate_key, hash_key


class TestHashKey:
    def test_hash_key_deterministic(self):
        assert hash_key("test") == hash_key("test")
        assert hash_key("test") != hash_key("other")

    def test_hash_key_length(self):
        result = hash_key("any-key")
        assert len(result) == 64  # SHA-256 = 64 hex chars


class TestGenerateKey:
    def test_generate_key_length(self):
        key = generate_key()
        assert len(key) == 64  # 32 bytes = 64 hex chars

    def test_generate_key_uniqueness(self):
        keys = {generate_key() for _ in range(100)}
        assert len(keys) == 100  # All unique


class TestOPSKeyManager:
    @pytest.fixture
    def db_path(self):
        with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
            yield f.name
        os.unlink(f.name)

    @pytest.fixture
    def km(self, db_path):
        os.environ.pop("OPS_API_KEY", None)
        km = OPSKeyManager(db_path=db_path)
        km.init_db()
        return km

    def test_is_dev_mode_true_when_no_key(self, km):
        """Dev mode when no env var and no DB key."""
        os.environ.pop("OPS_API_KEY", None)
        assert km.is_dev_mode() is True

    def test_is_dev_mode_false_with_env_var(self, db_path):
        """Not dev mode when OPS_API_KEY env var is set."""
        os.environ["OPS_API_KEY"] = "my-secret-key"
        try:
            km = OPSKeyManager(db_path=db_path)
            km.init_db()
            assert km.is_dev_mode() is False
        finally:
            os.environ.pop("OPS_API_KEY", None)

    def test_dev_mode_allows_any_key(self, km):
        """In dev mode, any key is accepted."""
        assert km.verify_key("anything") is True
        assert km.verify_key("something-else") is True

    def test_verify_key_with_env_var(self, db_path):
        """Env var key is verified correctly."""
        os.environ["OPS_API_KEY"] = "my-secret-key"
        try:
            km = OPSKeyManager(db_path=db_path)
            km.init_db()
            assert km.verify_key("my-secret-key") is True
            assert km.verify_key("wrong") is False
        finally:
            os.environ.pop("OPS_API_KEY", None)

    def test_generate_and_store(self, km):
        """generate_and_store returns plaintext key and stores hash."""
        key = km.generate_and_store("test key")
        assert len(key) == 64
        # Key should now work
        assert km.verify_key(key) is True
        assert km.verify_key("wrong") is False

    def test_generate_and_store_deactivates_old_keys(self, km):
        """Generating a new key deactivates the previous one."""
        key1 = km.generate_and_store("first key")
        key2 = km.generate_and_store("second key")

        # Both hashes are stored, but only key2 is active
        conn = __import__("sqlite3").connect(km.db_path)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM api_keys WHERE is_active = 1")
        active_count = cur.fetchone()[0]
        conn.close()

        assert active_count == 1
        assert km.verify_key(key2) is True
        assert km.verify_key(key1) is False  # Old key no longer works

    def test_auto_gen_on_first_startup(self, db_path):
        """ensure_key_exists auto-generates key when none exists."""
        os.environ.pop("OPS_API_KEY", None)
        km = OPSKeyManager(db_path=db_path)
        km.init_db()

        assert km.is_dev_mode() is True
        assert km.get_active_key_hash() is None

        km.ensure_key_exists()

        # Still dev mode (no env var), but now has DB key
        assert km.get_active_key_hash() is not None

        # Verify the generated key works
        # Can't get plaintext back, but we can verify hash is stored
        active_hash = km.get_active_key_hash()
        assert active_hash is not None
        assert len(active_hash) == 64

    def test_get_active_key_hint_env(self, db_path):
        """Hint shows env:var when OPS_API_KEY is set."""
        os.environ["OPS_API_KEY"] = "my-secret-key-1234"
        try:
            km = OPSKeyManager(db_path=db_path)
            km.init_db()
            hint = km.get_active_key_hint()
            assert hint == "env:OPS_API_KEY (last 4: 1234)"
        finally:
            os.environ.pop("OPS_API_KEY", None)

    def test_get_active_key_hint_db(self, km):
        """Hint shows db:****XXXX when key is in DB."""
        km.ensure_key_exists()
        hint = km.get_active_key_hint()
        assert hint is not None
        assert hint.startswith("db:****")
        # Format: "db:****" + last 6 chars of SHA-256 hash = 13 chars total
        assert len(hint) == 13

    def test_get_active_key_hint_none(self, km):
        """Hint is None when no key exists."""
        hint = km.get_active_key_hint()
        assert hint is None

    def test_ensure_key_exists_skips_when_env_var_set(self, db_path):
        """ensure_key_exists does nothing if OPS_API_KEY env var is set."""
        os.environ["OPS_API_KEY"] = "existing-env-key"
        try:
            km = OPSKeyManager(db_path=db_path)
            km.init_db()
            km.ensure_key_exists()
            assert km.get_active_key_hash() is None  # No DB key created
        finally:
            os.environ.pop("OPS_API_KEY", None)

    def test_ensure_key_exists_skips_when_db_key_exists(self, km):
        """ensure_key_exists does nothing if DB key already exists."""
        km.generate_and_store("manual key")
        km.ensure_key_exists()  # Should not create another key

        conn = __import__("sqlite3").connect(km.db_path)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM api_keys")
        count = cur.fetchone()[0]
        conn.close()
        assert count == 1
