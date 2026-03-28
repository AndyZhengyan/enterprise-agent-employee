"""Gateway 服务入口"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from common.errors import EAgentError, ErrorCode
from common.models import BaseResponse, Channel, Priority, TaskStatus, TaskType
from common.tracing import configure_logging, get_logger, new_trace_id, trace_context

# 配置日志
configure_logging()
log = get_logger("gateway")

# ============== FastAPI App ==============

app = FastAPI(
    title="e-Agent-OS Gateway",
    description="企业数字员工操作系统 - 网关层",
    version="0.1.0",
)


# ============== 请求/响应模型 ==============

class DispatchRequest(BaseModel):
    """任务分发请求"""
    employee_id: str = Field(..., description="Agent ID")
    task_type: TaskType = Field(default=TaskType.INQUIRY)
    content: str = Field(..., description="任务内容")
    priority: Priority = Field(default=Priority.NORMAL)
    context: Dict[str, Any] = Field(default_factory=dict)
    callback_url: Optional[str] = None

    class Config:
        use_enum_values = True


class DispatchResponse(BaseModel):
    """任务分发响应"""
    task_id: str
    status: TaskStatus
    estimated_duration_ms: int = 5000
    websocket_url: Optional[str] = None


class CallbackRequest(BaseModel):
    """Webhook 回调请求"""
    event_type: str  # task.completed | task.failed
    task_id: str
    result: Optional[Dict[str, Any]] = None


# ============== 辅助函数 ==============

async def _dispatch_to_runtime(request: DispatchRequest, trace_id: str) -> DispatchResponse:
    """将请求分发到 Runtime"""
    # TODO: 实现 Runtime 调用
    task_id = f"task-{trace_id[-12:]}"
    return DispatchResponse(
        task_id=task_id,
        status=TaskStatus.QUEUED,
        estimated_duration_ms=5000,
    )


# ============== 路由 ==============

@app.post("/gateway/dispatch", response_model=DispatchResponse)
async def dispatch_task(req: DispatchRequest, request: Request):
    """
    任务分发接口。

    将用户请求分发到对应的 AgentFamily 处理。
    """
    trace_id = new_trace_id()
    log = get_logger("gateway").bind(trace_id=trace_id, employee_id=req.employee_id)

    log.info("dispatch_received", task_type=req.task_type, priority=req.priority)

    try:
        response = await _dispatch_to_runtime(req, trace_id)
        log.info("dispatch_success", task_id=response.task_id)
        return response

    except EAgentError as e:
        log.error("dispatch_failed", error=e.to_dict())
        return JSONResponse(
            status_code=400,
            content=BaseResponse(
                success=False,
                error=e.to_dict(),
                trace_id=trace_id,
            ).model_dump(),
        )


@app.post("/gateway/callback")
async def webhook_callback(req: CallbackRequest):
    """
    Webhook 回调接口。

    接收外部系统的回调通知。
    """
    trace_id = new_trace_id()
    log = get_logger("gateway").bind(trace_id=trace_id, task_id=req.task_id)

    log.info("callback_received", event_type=req.event_type)

    # TODO: 处理回调，更新任务状态
    return {"status": "ok", "trace_id": trace_id}


@app.get("/gateway/session/{session_id}/history")
async def get_session_history(session_id: str):
    """
    获取会话历史。

    返回指定 session_id 的消息历史。
    """
    trace_id = new_trace_id()
    log = get_logger("gateway").bind(trace_id=trace_id, session_id=session_id)

    # TODO: 从存储中获取会话历史
    log.info("session_history_requested")

    return {
        "session_id": session_id,
        "messages": [],
        "trace_id": trace_id,
    }


@app.get("/gateway/health")
async def health_check():
    """
    健康检查接口。

    返回网关服务健康状态。
    """
    return {
        "status": "healthy",
        "service": "gateway",
        "version": "0.1.0",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {},
    }


# ============== 异常处理 ==============

@app.exception_handler(EAgentError)
async def eagent_error_handler(request: Request, exc: EAgentError):
    """统一异常处理"""
    log = get_logger("gateway")
    log.error("request_error", error=exc.to_dict(), path=request.url.path)
    return JSONResponse(
        status_code=400,
        content=BaseResponse(
            success=False,
            error=exc.to_dict(),
        ).model_dump(),
    )


@app.exception_handler(Exception)
async def general_error_handler(request: Request, exc: Exception):
    """通用异常处理"""
    trace_id = new_trace_id()
    log = get_logger("gateway")
    log.error("internal_error", trace_id=trace_id, error=str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content=BaseResponse(
            success=False,
            error=ErrorCode.SYSTEM_INTERNAL_ERROR.to_dict(details=str(exc)),
            trace_id=trace_id,
        ).model_dump(),
    )


# ============== 启动 ==============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
