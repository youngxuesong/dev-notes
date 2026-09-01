---
title: 10. Inside Claude Code: Architectural Execution Pipeline
order: 11
---

# Inside Claude Code: Architectural Execution Pipeline

Tracing the underlying mechanics of Claude Code reveals a modular **7-stage execution lifecycle**:

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant CLI as Claude Code CLI Runtime
    participant Context as Context & Memory Assembler
    participant API as Anthropic API (Claude 3.7)
    participant ToolEngine as Tool Engine & Sandbox
    participant Repo as Local Codebase

    Dev->>CLI: Issue high-level engineering prompt
    CLI->>Context: Ingest CLAUDE.md / Git diffs / Working Memory
    Context->>API: Dispatch payload with Prompt Caching
    API-->>CLI: Stream Thinking Deltas & Tool Calls
    CLI->>ToolEngine: Validate permissions & execute (Edit/Bash/Glob)
    ToolEngine->>Repo: Apply changes to filesystem
    Repo-->>ToolEngine: Return command stdout/exit code
    ToolEngine-->>CLI: Forward Observation event
    CLI->>API: Append Observation to active turn
    API-->>CLI: Output summary & formatted diffs
    CLI-->>Dev: Render final result & await input
```

## Core Subsystem Breakdown

1. **Context Assembler**: Aggregates Git statuses, token-pruned historical trees, and system guidelines.
2. **Streaming Event Loop**: Handles Server-Sent Events (SSE), resolving thinking protocols and partial tool dispatches.
3. **Execution Sandbox**: Intercepts elevated syscalls and handles clean state rollbacks upon receiving interrupt signals (`SIGINT`).
