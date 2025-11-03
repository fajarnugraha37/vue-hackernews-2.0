# Vue 2 ➜ Vue 3 Migration Checklist

Use this checklist to track progress across repositories or microfrontends. Tailor the lists to your project; strike-through items you intentionally skip and capture owners/dates for traceability.

---

## 1. Discovery & Alignment

- [ ] Confirm migration goals (performance, support, features).
- [ ] Identify stakeholders (engineering, QA, product, ops).
- [ ] Document risks & constraints (`WORKFLOW.md` §2 prompts can help).
- [ ] Run dependency inventory; flag blockers (Vue 2-only libs, build tools).
- [ ] Decide rollout sequencing (whole app vs microfrontends).

## 2. Technical Preparation

- [ ] Establish migration branch / feature flags.
- [ ] Capture baseline metrics (bundle size, Core Web Vitals, error rates).
- [ ] Set up test environment parity (staging data, CI pipelines).
- [ ] Archive current docs (README, runbooks) for reference.
- [ ] Schedule knowledge-sharing session on Vue 3 fundamentals.

## 3. Compatibility Phase

- [ ] Install `@vue/compat` and verify app boots.
- [ ] Fix console warnings iteratively (filters, lifecycle hooks, mixins).
- [ ] Replace Vue 2 APIs (`$set`, `$on`, filters) with Vue 3 alternatives.
- [ ] Track remaining warnings (use prompts in `WORKFLOW.md` §4).
- [ ] Update automated tests to catch regressions early.

## 4. Tooling Transition

- [ ] Migrate build tooling (Webpack/Vue CLI → Vite) or update configuration.
- [ ] Mirror CSS preprocessors (SCSS/SASS/LESS/Tailwind) in new toolchain.
- [ ] Update env handling (`VUE_APP_*` → `VITE_*`).
- [ ] Rewire dev server proxies/HMR equivalents.
- [ ] Upgrade test harnesses (`@vue/test-utils` v2, Storybook v7, etc.).

## 5. Runtime Migration

- [ ] Switch to pure Vue 3 runtime (`configureCompat` removed).
- [ ] Upgrade routing (vue-router v4) and state (Vuex 4 or Pinia).
- [ ] Replace third-party components with Vue 3-ready versions (Vuetify 3, Buefy 3, Oruga, etc.).
- [ ] Validate async component loading, Suspense usage, Composition/Options API coexistence.
- [ ] Confirm SSR/hydration (if applicable) works under Vue 3.

## 6. Microfrontend Strategy (if applicable)

- [ ] Create migration scorecard for each MFE (stack, owner, risk, timeline).
- [ ] Upgrade shell/container first (Vite, Module Federation, design tokens).
- [ ] Pilot one remote; verify routing, auth, shared state.
- [ ] Gradually migrate remaining MFEs; keep compatibility layers.
- [ ] Decommission Qiankun/legacy wiring when coverage goal met.

## 7. Validation & Release

- [ ] Run full automated test suite (unit, integration, E2E).
- [ ] Perform manual regression on high-risk flows (auth, payments, etc.).
- [ ] Compare pre/post metrics (bundle size, perf, error rate).
- [ ] Update monitoring/dashboards to reflect new stack.
- [ ] Secure sign-off from stakeholders.

## 8. Post-Migration Clean-up

- [ ] Remove compat dependencies (`@vue/compat`, legacy mixins, polyfills).
- [ ] Delete obsolete configs (`vue.config.js`, Webpack files, Qiankun glue).
- [ ] Update documentation (README, onboarding, architecture diagrams).
- [ ] Capture lessons learned / ADRs; archive codemods & scripts.
- [ ] Log follow-up backlog (remaining mixins, `<script setup>`, performance).
- [ ] Celebrate with a retrospective 🎉.

---

### Usage Tips
- Create a copy per repo or microfrontend and track owners/date columns.
- Reference `WORKFLOW.md` prompts when asking AI assistants for help on specific checklist items.
- Keep this document updated with project-specific tasks (CI/CD tweaks, security reviews, etc.).

