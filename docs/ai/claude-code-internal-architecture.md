---
title: 10. Claude Code 内部架构剖析与执行链路
order: 11
---

# Claude Code 内部架构剖析与执行链路

![Claude Code 从终端到执行结果的架构示意图](/illustrations/claude-architecture.svg)

深入底层源码与运行机制，Claude Code 的端到端执行链路可以划分为清晰的 **7 步生命周期**：

```mermaid
sequenceDiagram
    autonumber
    actor Dev as 开发者
    participant CLI as Claude Code CLI 运行时
    participant Context as Context & Memory Assembler
    participant API as Anthropic API (Claude 3.7)
    participant ToolEngine as Tool Engine & Sandbox
    participant Repo as 本地工程代码库

    Dev->>CLI: 输入复杂需求
    CLI->>Context: 读取 CLAUDE.md / Git 状态 / 历史上下文
    Context->>API: 组装 Prompt 并发起流式请求 (启用 Prompt Caching)
    API-->>CLI: 流式输出思考链 (Thinking) 与 Tool Call
    CLI->>ToolEngine: 校验权限并分发工具调用 (Edit/Bash/Glob)
    ToolEngine->>Repo: 执行实际文件变更与命令
    Repo-->>ToolEngine: 返回命令退出码与终端输出
    ToolEngine-->>CLI: 传递观察结果 (Observation)
    CLI->>API: 注入 Observation 继续下一轮推理
    API-->>CLI: 输出最终总结与 Diff
    CLI-->>Dev: 呈现完整交付产物并等待后续指令
```

## 核心内部子系统职责

1. **Context Assembler（上下文装配器）**：动态聚合 Git Diffs、近期访问文件列表与项目宪法，精准利用 Prompt Caching。
2. **Streaming Event Loop（流式事件循环）**：实时处理 SSE 事件流中的 `thinking_delta` 与 `tool_use_delta`。
3. **Execution Sandbox（安全执行沙箱）**：隔离危险系统调用，支持中断信号（SIGINT / Ctrl+C）安全回退。

---

> 🔗 **微信公众号原文**：[Claude Code 内部架构](http://mp.weixin.qq.com/s?__biz=Mzk0NzYxMDM0Mw==&mid=2247484307&idx=1&sn=119bf0a30cc3f9beb210b12243290765)
