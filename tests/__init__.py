"""e-Agent-OS 测试配置"""

import sys
from pathlib import Path

# 将项目根目录加入 path，方便测试导入
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
