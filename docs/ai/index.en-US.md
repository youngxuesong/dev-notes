---
title: AI & Agent Architecture & Practices
order: 1
---

# 🤖 AI & Agent Architecture & Practices

:::info Overview
A comprehensive technical breakdown covering foundational Agent theories (MCP, Hooks, Planning) to deep dive architecture teardowns of **Claude Code** and autonomous multi-agent collaboration.
:::

```mermaid
graph TD
    subgraph Agent_Theory [Part 1: Foundational Agent Theory]
        A[01. What is an Agent] --> B[02. MCP Protocol]
        B --> C[03. Hooks Mechanism]
        C --> D[04. Planning & Orchestration]
        D --> E[05. Agent System Architecture]
    end

    subgraph Claude_Code_Architecture [Part 2: Claude Code Teardown]
        E --> F[06. Claude Code Overview]
        F --> G[07. CLAUDE.md, Skills & Hooks]
        G --> H[08. Tool Execution System]
        H --> I[09. MCP & Multi-Agent Collaboration]
        I --> J[10. Internal Architecture Deep Dive]
    end

    subgraph Optimization [Part 3: Cost & Performance Tuning]
        J --> K[11. Claude Prompt Caching in Practice]
    end
```

---

## 📚 Part 1: Agent Fundamentals & Protocols

- [01. What is an AI Agent?](/en-US/ai/what-is-agent)
- [02. Understanding Model Context Protocol (MCP)](/en-US/ai/what-is-mcp)
- [03. Lifecycle Hooks in Agent Systems](/en-US/ai/what-is-hooks)
- [04. Planning & Orchestration Mechanisms](/en-US/ai/planning-and-orchestration)
- [05. The Grand Architecture of Agent Systems](/en-US/ai/agent-system-overview)

---

## 🛠️ Part 2: Claude Code Internal Architecture

- [06. Claude Code: High-Level Overview & Philosophy](/en-US/ai/claude-code-overview)
- [07. CLAUDE.md, Custom Skills & Hooks](/en-US/ai/claude-code-skills-hooks)
- [08. The Tool Execution Subsystem](/en-US/ai/claude-code-tool-system)
- [09. MCP & Multi-Agent Collaborative Workflows](/en-US/ai/claude-code-mcp-multi-agent)
- [10. Inside Claude Code: Architectural Execution Pipeline](/en-US/ai/claude-code-internal-architecture)

---

## ⚡ Part 3: Cost & Performance Optimization

- [11. Optimizing Claude API with Prompt Caching](/en-US/ai/claude-prompt-caching)
