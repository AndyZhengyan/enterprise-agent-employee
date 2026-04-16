# tests/unit/apps/skill_hub/conftest.py
"""Ensure a clean skill registry before each test."""
import pytest

from apps.skill_hub.registry import _auto_seed, _registry


@pytest.fixture(autouse=True)
def clean_skill_registry():
    """Clear and reseed the global registry before every skill_hub test."""
    _registry.clear()
    _auto_seed()
    yield
    _registry.clear()
