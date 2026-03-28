#!/bin/bash
# e-Agent-OS 开发快捷脚本

set -e

echo "=== e-Agent-OS 开发环境 ==="

# 检查 uv
if ! command -v uv &> /dev/null; then
    echo "安装 uv..."
    pip install uv
fi

# 安装依赖
echo "安装依赖..."
uv sync

# 运行测试
echo "运行测试..."
pytest tests/unit/common/ -v

# 启动 Gateway
echo ""
echo "启动 Gateway (http://localhost:8000)..."
echo "文档: http://localhost:8000/docs"
cd apps/gateway && uvicorn main:app --reload --port 8000
