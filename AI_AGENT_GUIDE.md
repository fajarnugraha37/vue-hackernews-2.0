# AI Assistant Playbook for the Vue 2 ➜ Vue 3 Migration

This guide complements `WORKFLOW.md` and captures best practices for collaborating with AI code agents (Codex CLI/ChatGPT, Claude Sonnet, GitHub Copilot). Treat it as a living reference—expand it with new prompt templates, lessons, and team norms.

---

## 1. General Principles

1. **Share context up front**
   - Include goal, repo state, relevant files, and blockers.
   - Paste warning/error text and the code region that triggers it.
2. **Use structured prompts**
   - Provide inputs with placeholders `{{ like_this }}` so prompts are reusable.
   - Separate questions from constraints (e.g., “Return diffs only”, “Follow existing coding style”).
3. **Anticipate validation**
   - Ask the assistant to outline tests/regression checks.
   - Request a reasoning summary before code edits.
4. **Stay in control**
   - Review proposed changes; reject anything unclear.
   - Log accepted prompts in PR descriptions for traceability.

---

## 2. Prompt Recipes

### 2.1 Code Fix / Refactor
```
Context:
- File(s): {{ file_paths }}
- Current behaviour: {{ current_behaviour }}
- Target behaviour: {{ desired_behaviour }}
- Constraints: {{ constraints }}

Code snippet:
{{ code_snippet }}

Task:
1. Identify necessary changes.
2. Provide reasoning.
3. Return patch (diff) only.
```

### 2.2 Diagnostic / Warning Investigation
```
Error/Warning:
{{ console_output }}

Relevant code:
{{ code_snippet }}

Environment notes:
- Node version: {{ node_version }}
- Bundler: Vite
- Additional context: {{ extra_context }}

Explain the root cause and propose code-level fixes plus validation steps.
```

### 2.3 Dependency Upgrade Plan
```
Library: {{ library_name }}
Current version: {{ current_version }}
Target version: {{ target_version }}
Usage summary:
{{ usage_summary }}

Provide breaking changes, migration steps, test focus, and rollback plan.
```

### 2.4 Microfrontend Migration Planning
```
Microfrontends:
{{ microfrontend_list }}

Constraints: {{ constraints }}
Desired target: {{ target_architecture }}

Draft a phased plan (audit → shell upgrade → pilot → rollout → decommission) with risk mitigation and telemetry checks.
```

### 2.5 Review / Verification
```
Changes made:
{{ summary_of_changes }}

Request:
- Double-check for regressions.
- Suggest additional tests or monitoring.
- Highlight any risky assumptions.
```

---

## 3. Agent-Specific Guidance

### 3.1 Codex CLI / ChatGPT (workstation agent)
- Works best with explicit instructions and diff outputs.
- Mention “return patch only” when ready for application.
- When troubleshooting, ask for a brief reasoning outline before code edits.
- Use the prompt templates in `WORKFLOW.md` (they already contain placeholders).

### 3.2 Claude Sonnet (analysis / reasoning)
- Excellent for architecture questions, migration trade-offs, or long-form documentation.
- Provide numbered questions; request summaries + action lists.
- Example:
  ```
  We’re debating Pinia vs Vuex for {{ module_name }}.
  Please evaluate pros/cons, code impact, and rollout plan. Use bullet summaries.
  ```

### 3.3 GitHub Copilot (inline assistant)
- Give Copilot strong inline context via comments:
  ```ts
  // TODO: migrate this watcher to Vue 3 `watch` API and remove `$on`
  ```
- For tests, describe expected behaviour directly above the test block.
- Pair with IDE diff review; commit only after inspection.

### 3.4 Combining Agents
- Draft plan with Claude → implement with Codex → refine tests with Copilot.
- Log major prompts in PR description for auditability.

---

## 4. Prompt Library (Quick Copy)

| Scenario | Prompt |
|----------|--------|
| Fix compat warning | `Compat warning: {{ warning }} ...` |
| Dependency audit | `Dependencies to review: {{ deps }} ...` |
| Microfrontend inventory | `Catalog MFEs with: {{ details }} ...` |
| Testing gaps | `Testing stack: {{ stack }} ...` |
| Cleanup review | `Cleanup checklist: {{ items }} ...` |

Keep expanding this table with team-tested prompts.

---

## 5. Usage Checklist

1. Prepare inputs (code, errors, context).
2. Pick the right template and fill placeholders.
3. Send prompt; capture output (diff, reasoning).
4. Review + test locally.
5. Document outcome in PR/issue.

Happy prompting! 🎯

