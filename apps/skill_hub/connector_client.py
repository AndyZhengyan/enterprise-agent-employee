"""ConnectorHub client — calls ConnectorHub to invoke a connector capability."""

from __future__ import annotations

from typing import Any

import httpx

from common.tracing import get_logger

log = get_logger("skill_hub.connector_client")

# Lazy client — created on first invocation
_client: httpx.AsyncClient | None = None


def _base_url() -> str:
    """Return ConnectorHub base URL, respecting CONECTOR_HUB_URL env var."""
    import os

    return os.environ.get(
        "CONNECTOR_HUB_URL",
        "http://127.0.0.1:8003",
    )


async def invoke_connector(
    connector_id: str,
    capability: str,
    parameters: dict[str, Any],
    timeout_seconds: int | None = None,
    employee_id: str | None = None,
) -> dict[str, Any]:
    """Call ConnectorHub POST /connectors/{connector_id}/invoke and return the result dict.

    Returns a dict with keys: connector_id, capability, result, duration_ms, error
    Raises httpx.HTTPStatusError on connection errors or 4xx/5xx responses.
    """
    global _client

    if _client is None:
        _client = httpx.AsyncClient(timeout=httpx.Timeout(30.0))

    url = f"{_base_url()}/connector-hub/connectors/{connector_id}/invoke"
    payload: dict[str, Any] = {
        "capability": capability,
        "parameters": parameters,
    }
    if timeout_seconds is not None:
        payload["timeout_seconds"] = timeout_seconds
    if employee_id is not None:
        payload["employee_id"] = employee_id

    log.info(
        "skill_hub.invoking_connector",
        connector_id=connector_id,
        capability=capability,
        url=url,
    )

    response = await _client.post(url, json=payload)
    response.raise_for_status()
    return response.json()
