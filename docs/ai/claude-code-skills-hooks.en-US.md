---
title: 07. CLAUDE.md, Custom Skills & Hooks
order: 8
---

# CLAUDE.md, Custom Skills & Hooks in Practice

![How CLAUDE.md, Skills and Hooks work together](/illustrations/hooks-skills.svg)

Within the Claude Code ecosystem, **`CLAUDE.md`**, **Skills**, and **Hooks** form the tripartite engine for tailoring autonomous agents to specific software repositories.

```mermaid
graph TD
    Repo[Codebase] --> CLAUDE_MD[CLAUDE.md: Project Constitution & Rules]
    CLAUDE_MD --> Skills[Skills: Domain-Specific Workflows]
    Skills --> Hooks[Hooks: Pre/Post Verification & Linting]
    Hooks --> Output[Deterministic Output]
```

## 1. Best Practices for `CLAUDE.md`

Placed at the repository root, `CLAUDE.md` serves as the primary system prompt extension:
- **Build & Test Commands**: Explicit test runner scripts (`pnpm test`, `cargo check`).
- **Architectural Guidelines**: Layering conventions and dependency rules.
- **Strict Invariants**: Prohibited patterns (e.g., "Never modify migration files directly", "No inline secrets").

## 2. Synergies Between Skills and Hooks

- **Skills**: Modular capability packages implementing complex domain logic.
- **Hooks**: Automated gates triggering linters or formatters after file modifications to enforce code standards.
