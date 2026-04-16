# tests/unit/apps/skill_hub/test_invoke.py
"""Tests for skill invocation and ConnectorHub routing."""

from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient
from httpx import HTTPStatusError, RequestError

from apps.skill_hub.main import app


def _client():
    return TestClient(app)


class TestInvokeSkillNoConnector:
    """Skills without connector_id return no_connector status."""

    def test_invoke_returns_no_connector_when_connector_id_is_none(self):
        """builtin-approval has no connector_id → returns no_connector."""
        client = _client()
        resp = client.post(
            "/skills/builtin-approval/invoke",
            json={"parameters": {"type": "leave"}},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["skill_id"] == "builtin-approval"
        assert data["result"]["status"] == "no_connector"
        assert "no connector_id configured" in data["result"]["message"]

    def test_invoke_returns_no_connector_for_email_skill(self):
        """builtin-email has no connector_id → returns no_connector."""
        client = _client()
        resp = client.post(
            "/skills/builtin-email/invoke",
            json={"parameters": {"to": "test@example.com", "subject": "hello"}},
        )
        assert resp.status_code == 200
        assert resp.json()["result"]["status"] == "no_connector"


class TestInvokeSkillWithConnector:
    """Skills with connector_id route to ConnectorHub."""

    @patch("apps.skill_hub.main.invoke_connector", new_callable=AsyncMock)
    def test_invoke_routes_to_connector_hub(self, mock_invoke):
        """When connector_id is set, skill invokes ConnectorHub."""
        # Patch the global registry to register a skill with connector_id
        from apps.skill_hub.registry import register

        from apps.skill_hub.models import Skill, SkillLevel, SkillStatus

        test_skill = Skill(
            id="test-skill-with-connector",
            name="Test Skill",
            description="A skill with a connector",
            level=SkillLevel.L2,
            status=SkillStatus.PUBLISHED,
            connector_id="piagent-cli",
            capabilities=[{"name": "agent_invoke", "description": "Invoke agent"}],
        )
        register(test_skill)

        mock_invoke.return_value = {
            "connector_id": "piagent-cli",
            "capability": "agent_invoke",
            "result": {"text": "Hello from agent"},
            "duration_ms": 500,
            "error": None,
        }

        client = _client()
        resp = client.post(
            "/skills/test-skill-with-connector/invoke",
            json={"parameters": {"message": "hello"}},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["skill_id"] == "test-skill-with-connector"
        assert data["result"] == {"text": "Hello from agent"}

        # Verify ConnectorHub was called with correct args
        mock_invoke.assert_awaited_once_with(
            connector_id="piagent-cli",
            capability="agent_invoke",
            parameters={"message": "hello"},
            timeout_seconds=None,
            employee_id=None,
        )

    @patch("apps.skill_hub.main.invoke_connector", new_callable=AsyncMock)
    def test_invoke_uses_first_capability_name(self, mock_invoke):
        """Capability name is derived from the first capability entry."""
        from apps.skill_hub.registry import register

        from apps.skill_hub.models import Skill, SkillLevel, SkillStatus

        test_skill = Skill(
            id="test-skill-cap",
            name="Cap Skill",
            level=SkillLevel.L2,
            status=SkillStatus.PUBLISHED,
            connector_id="piagent-cli",
            capabilities=[{"name": "send_message", "description": "Send a message"}],
        )
        register(test_skill)

        mock_invoke.return_value = {
            "connector_id": "piagent-cli",
            "capability": "send_message",
            "result": {"sent": True},
            "duration_ms": 200,
            "error": None,
        }

        client = _client()
        resp = client.post("/skills/test-skill-cap/invoke", json={"parameters": {}})
        assert resp.status_code == 200
        mock_invoke.assert_awaited_once()
        _, kwargs = mock_invoke.call_args
        assert kwargs["capability"] == "send_message"

    @patch("apps.skill_hub.main.invoke_connector", new_callable=AsyncMock)
    def test_invoke_returns_error_on_connector_http_error(self, mock_invoke):
        """HTTP errors from ConnectorHub are captured and returned."""
        from apps.skill_hub.registry import register

        from apps.skill_hub.models import Skill, SkillLevel, SkillStatus

        test_skill = Skill(
            id="test-skill-err",
            name="Err Skill",
            level=SkillLevel.L2,
            status=SkillStatus.PUBLISHED,
            connector_id="piagent-cli",
            capabilities=[{"name": "agent_invoke", "description": "Invoke agent"}],
        )
        register(test_skill)

        # Simulate ConnectorHub returning 404
        error_response = AsyncMock()
        error_response.status_code = 404
        error_response.text = "Connector not found"
        mock_invoke.side_effect = HTTPStatusError(
            "Not found",
            request=AsyncMock(),
            response=error_response,
        )

        client = _client()
        resp = client.post("/skills/test-skill-err/invoke", json={"parameters": {}})
        assert resp.status_code == 200
        data = resp.json()
        assert "ConnectorHub error" in data["error"]
        assert "404" in data["error"]

    @patch("apps.skill_hub.main.invoke_connector", new_callable=AsyncMock)
    def test_invoke_returns_error_on_connector_unreachable(self, mock_invoke):
        """Connection errors to ConnectorHub are captured and returned."""
        from apps.skill_hub.registry import register

        from apps.skill_hub.models import Skill, SkillLevel, SkillStatus

        test_skill = Skill(
            id="test-skill-net",
            name="Net Skill",
            level=SkillLevel.L2,
            status=SkillStatus.PUBLISHED,
            connector_id="piagent-cli",
            capabilities=[{"name": "agent_invoke", "description": "Invoke agent"}],
        )
        register(test_skill)

        mock_invoke.side_effect = RequestError("Connection refused", request=AsyncMock())

        client = _client()
        resp = client.post("/skills/test-skill-net/invoke", json={"parameters": {}})
        assert resp.status_code == 200
        assert "ConnectorHub unreachable" in resp.json()["error"]


class TestInvokeSkillDeprecated:
    """Deprecated skills return an error without calling ConnectorHub."""

    @patch("apps.skill_hub.main.invoke_connector", new_callable=AsyncMock)
    def test_deprecated_skill_returns_error_without_calling_connector(self, mock_invoke):
        """Deprecated skill is rejected before ConnectorHub is consulted."""
        from apps.skill_hub.registry import register

        from apps.skill_hub.models import Skill, SkillLevel, SkillStatus

        test_skill = Skill(
            id="test-deprecated",
            name="Deprecated Skill",
            level=SkillLevel.L2,
            status=SkillStatus.DEPRECATED,
            connector_id="piagent-cli",
            capabilities=[{"name": "agent_invoke", "description": "Invoke agent"}],
        )
        register(test_skill)

        client = _client()
        resp = client.post("/skills/test-deprecated/invoke", json={"parameters": {}})
        assert resp.status_code == 200
        assert "deprecated" in resp.json()["error"].lower()
        mock_invoke.assert_not_awaited()
