---
title: 05. Agent 系统全景架构图
order: 6
---

# Agent 系统全景架构设计

综合现代工业级 Agent（如 Claude Code、Devin、Pi）的演进，一个健壮的自主智能体系统由以下五层架构构成：

```mermaid
graph TD
    subgraph UI_Layer [1. 交互与感知层 Perception]
        CLI[终端 CLI 交互] --- Web[Web / IDE 扩展]
        Web --- Hook_Input[环境与系统事件监听]
    end

    subgraph Core_Cognitive [2. 认知与规划层 Cognition]
        LLM_Engine[大模型推理核心] <--> Context_Engine[上下文感知与剪枝]
        Context_Engine <--> Planner[DAG 任务规划器]
    end

    subgraph Memory_System [3. 记忆系统 Memory]
        Short_Mem[工作记忆 / 会话上下文]
        Long_Mem[持久记忆: 向量 RAG / 历史索引]
    end

    subgraph Governance_Safety [4. 治理与安全层 Safety & Hooks]
        Policy_Engine[安全风控引擎]
        Hook_Bus[Pre/Post Tool 钩子总线]
    end

    subgraph Action_Tools [5. 执行与工具层 Execution & Tools]
        MCP_Hub[MCP 统一协议中枢]
        Native_Tools[本地文件 / Bash / Git]
        Cloud_API[远程 API / 数据库 / 云资源]
    end

    UI_Layer --> Core_Cognitive
    Core_Cognitive <--> Memory_System
    Core_Cognitive --> Governance_Safety
    Governance_Safety --> Action_Tools
```

## 核心架构分层职责

1. **交互与感知层**：捕获用户意图、终端状态变化与上下文触发器。
2. **认知与规划层**：负责意图理解、Prompt 装配、任务分解与反思纠错。
3. **记忆系统**：分层存储短期会话缓存与长期代码库索引。
4. **安全与治理层**：实现人机协同（Human-in-the-loop）审批与沙箱隔离。
5. **执行与工具层**：基于 MCP 与系统原生能力执行真实的物理世界变更。

---

> 🔗 **微信公众号原文**：[Agent 系统全景图](http://mp.weixin.qq.com/s?__biz=Mzk0NzYxMDM0Mw==&mid=2247484243&idx=1&sn=4e85086b43acded7a3e7cd560af5d9ca)
