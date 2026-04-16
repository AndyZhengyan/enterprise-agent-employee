"""SkillHub FastAPI service — port 8004."""

from __future__ import annotations

import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, Optional

import httpx
from fastapi import FastAPI, HTTPException

from apps.skill_hub import __version__
from apps.skill_hub.config import SkillHubSettings
from apps.skill_hub.connector_client import invoke_connector
from apps.skill_hub.errors import SkillHubError
from apps.skill_hub.models import (
    InvokeRequest,
    InvokeResponse,
    RegisterSkillRequest,
    Skill,
    SkillHubHealthResponse,
    SkillLevel,
    SkillListResponse,
    SkillStatus,
    TransitionRequest,
)
from apps.skill_hub.registry import (
    _auto_seed,
    get,
    list_all,
    register,
    update_status,
)
from common.tracing import get_logger

log = get_logger("skill_hub")

settings = SkillHubSettings()


def _first_capability_name(capabilities: list[Any]) -> str | None:
    """Extract the first capability name from a capabilities list.

    Supports both SkillCapability objects (with .name) and raw dicts.
    Returns None if the list is empty or no name is found.
    """
    if not capabilities:
        return None
    cap = capabilities[0]
    if hasattr(cap, "name"):
        return cap.name
    if isinstance(cap, dict):
        return cap.get("name")
    return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    _auto_seed()
    log.info("skill_hub.started", port=settings.port, skill_count=len(list_all()))
    yield
    log.info("skill_hub.stopped")


app = FastAPI(title="SkillHub", version=__version__, lifespan=lifespan)


@app.get("/skill-hub/health", response_model=SkillHubHealthResponse)
async def hub_health() -> SkillHubHealthResponse:
    """Overall health of SkillHub."""
    return SkillHubHealthResponse(
        status="healthy",
        version=__version__,
        timestamp=datetime.now(timezone.utc),
        skill_count=len(list_all()),
    )


@app.get("/skills", response_model=SkillListResponse)
async def list_skills(
    status: Optional[str] = None,
    level: Optional[str] = None,
) -> SkillListResponse:
    """List all registered skills, optionally filtered."""
    status_filter = SkillStatus(status) if status else None
    level_filter = SkillLevel(level) if level else None
    skills = list_all(status=status_filter, level=level_filter)
    return SkillListResponse(skills=skills, total=len(skills))


@app.post("/skills", response_model=Skill, status_code=201)
async def register_skill(req: RegisterSkillRequest) -> Skill:
    """Register a new skill."""
    skill = Skill(
        id=req.id,
        name=req.name,
        description=req.description,
        level=req.level,
        capabilities=req.capabilities,
        connector_id=req.connector_id,
        agent_families=req.agent_families,
        status=SkillStatus.DRAFT,
    )
    register(skill)
    log.info("skill.registered", skill_id=skill.id)
    return skill


@app.get("/skills/{skill_id}", response_model=Skill)
async def get_skill(skill_id: str) -> Skill:
    """Get a skill by ID."""
    try:
        return get(skill_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Skill not found: {skill_id}")


@app.post("/skills/{skill_id}/transition", response_model=Skill)
async def transition_skill(
    skill_id: str,
    req: TransitionRequest,
) -> Skill:
    """Transition a skill to a new lifecycle status."""
    try:
        return update_status(skill_id, req.target_status)
    except SkillHubError as e:
        raise HTTPException(status_code=400, detail=e.message) from e


@app.post("/skills/{skill_id}/invoke", response_model=InvokeResponse)
async def invoke_skill(
    skill_id: str,
    req: InvokeRequest,
) -> InvokeResponse:
    """Invoke a skill by ID — routes to ConnectorHub if connector_id is set."""
    start = time.monotonic()

    try:
        skill = get(skill_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Skill not found: {skill_id}")

    if SkillStatus(skill.status) == SkillStatus.DEPRECATED:
        log.warning("skill.invoke.deprecated", skill_id=skill_id)
        return InvokeResponse(
            skill_id=skill_id,
            duration_ms=int((time.monotonic() - start) * 1000),
            error=f"Skill '{skill_id}' is deprecated",
        )

    if not skill.connector_id:
        # No connector backing this skill yet
        log.warning("skill.invoke.no_connector", skill_id=skill_id)
        return InvokeResponse(
            skill_id=skill_id,
            duration_ms=int((time.monotonic() - start) * 1000),
            result={"status": "no_connector", "message": f"Skill '{skill_id}' has no connector_id configured"},
        )

    # Derive the capability name from the first capability entry
    capability_name = _first_capability_name(skill.capabilities)
    if not capability_name:
        log.warning("skill.invoke.no_capability", skill_id=skill_id)
        return InvokeResponse(
            skill_id=skill_id,
            duration_ms=int((time.monotonic() - start) * 1000),
            error=f"Skill '{skill_id}' has no capabilities defined",
        )

    try:
        connector_resp = await invoke_connector(
            connector_id=skill.connector_id,
            capability=capability_name,
            parameters=req.parameters,
            timeout_seconds=req.timeout_seconds,
            employee_id=req.employee_id,
        )
        return InvokeResponse(
            skill_id=skill_id,
            result=connector_resp.get("result"),
            duration_ms=int((time.monotonic() - start) * 1000),
            error=connector_resp.get("error"),
        )
    except httpx.HTTPStatusError as e:
        log.error(
            "skill_hub.connector_http_error",
            skill_id=skill_id,
            connector_id=skill.connector_id,
            status=e.response.status_code,
        )
        return InvokeResponse(
            skill_id=skill_id,
            duration_ms=int((time.monotonic() - start) * 1000),
            error=f"ConnectorHub error: {e.response.status_code} — {e.response.text[:200]}",
        )
    except httpx.RequestError as e:
        log.error(
            "skill_hub.connector_connection_error",
            skill_id=skill_id,
            connector_id=skill.connector_id,
            error=str(e),
        )
        return InvokeResponse(
            skill_id=skill_id,
            duration_ms=int((time.monotonic() - start) * 1000),
            error=f"ConnectorHub unreachable: {e}",
        )
