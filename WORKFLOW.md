# Vue 2 ➜ Vue 3 Migration Workflow  
_A step-by-step playbook with AI collaboration prompts_

---

## 1. Overview

Migrating a mature Vue 2 codebase demands more than bumping versions. This workflow breaks the journey into clear stages, highlights the reasoning behind each activity, and integrates suggested AI prompts so teammates can leverage Codex/ChatGPT productively. Treat it as a living document—augment it with project-specific lessons.

Tools:
- https://github.com/vuejs/vue-codemod
- https://github.com/vuejs/vue-migration-helper

---

## 2. Preparation & Audit

### 2.1 Align on Goals & Success Criteria
- Clarify why you are upgrading (performance, ecosystem support, future features).
- Define “done”: e.g., zero compat warnings, green CI, bundle size targets, parity in functionality.

#### AI prompt (kick-off)
```
We’re planning to migrate <repo-name> from Vue 2.x to Vue 3.x. 
Here is our tech stack summary: <list frameworks, build tools, deployment>.
List the major risks and missing prerequisites we should evaluate before starting.
---
Repository: {{ repo_name }}
Current stack: {{ current_stack_overview }}
Constraints / deadlines: {{ constraints }}

List key risks, prerequisites, and stakeholder decisions required before beginning the migration.
```

### 2.2 Dependency Inventory
- `npm ls vue vue-router vuex` to capture versions.
- Categorize dependencies:
  1. **Vue ecosystem packages** (vue-router, vuex, vue-i18n, etc.).
  2. **Vue 2-only plugins/components** (e.g., BootstrapVue, Vuetify v2).
  3. **Framework-agnostic libs** (Axios, Lodash) – usually stay untouched.
- Flag packages lacking Vue 3 support; find alternatives or schedule rewrites.

#### AI prompt (dependency sweep)
```
Given this list of dependencies (paste package.json excerpt), which ones lack Vue 3 support? 
Suggest Vue 3 compatible replacements or mitigation plans.
---
Dependencies to review:
{{ package_json_snippet }}

Identify packages lacking Vue 3 support, suggest replacements or mitigations, and flag items needing deeper investigation.
```

### 2.3 Source Audit
- Locate Vue 2 patterns: filters, `$on/$off`, `sync` modifiers, global mixins, options-only patterns, `$attrs` usage, render functions, functional/async components, `this.$set/delete`.
- Identify build tooling: Webpack configs, Vue CLI, custom SSR, microfrontends.
- Document features relying on deprecated APIs (scoped slots syntax, filters, etc.).

---

## 3. Migration Workflow

### Phase 1 – Compatibility Build
1. Switch to Vue 3 compatibility build (`@vue/compat`) and ensure the app boots.
2. Address runtime warnings iteratively by replacing deprecated patterns.
3. Keep the compat mode only as long as necessary; remove progressively to surface latent issues.

**Sample: Replace filters with computed/utilities**
```diff
-<!-- Vue 2 -->
-<span>{{ item.time | timeAgo }} ago</span>
+<!-- Vue 3 -->
+<span>{{ formatTimeAgo(item.time) }} ago</span>
```

```js
// timeAgo.js
export const timeAgo = (timestamp) => {
  const diff = Math.floor((Date.now() / 1000) - Number(timestamp))
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours`
  return `${Math.floor(diff / 86400)} days`
}

// component
import { timeAgo } from '@/util/timeAgo'

export default {
  methods: {
    formatTimeAgo: timeAgo
  }
}
```

#### AI prompt (per-warning assistance)
```
Vue compat warning: <paste warning>. Here’s the code snippet (paste). 
Refactor it to the Vue 3-idiomatic pattern and explain the trade-offs.
---
Compat warning: {{ warning_message }}
Code snippet:
{{ code_snippet }}

Explain the cause, show the Vue 3-compliant refactor, and note any follow-up testing.
```

### Phase 2 – Tooling Upgrade
**Webpack ➜ Vite (or modern bundler)**
- Translate aliases, environment variables, CSS preprocessors, and build targets.
- Replace dev server features (HMR, proxy) one for one.
- Ensure tests/linting scripts reference the new commands.
- Tailwind/SCSS/SASS/LESS: configure `postcss.config.cjs` and Vite’s `css.preprocessorOptions` to mirror prior loader options; validate shared design tokens if microfrontends consume a design system gradually.

**Vue CLI ➜ Vite**
- Map CLI `vue.config.js` features (devServer proxies, chainWebpack tweaks) into Vite plugins or config.
- Export CLI env vars into `.env[.mode]` files and update deployment scripts to inject them via Vite.
- Replace CLI plugins (PWA, i18n, router, vuex) with Vite-first equivalents.
- Microfrontends: migrate “shell” and individual MFEs independently; use module federation or import maps to keep CLI-driven MFEs running until their migration window.

**Sample: Webpack → Vite configuration**
```js
// webpack.config.js (before)
module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  devServer: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  module: {
    rules: [
      { test: /\.scss$/, use: ['vue-style-loader', 'css-loader', 'sass-loader'] }
    ]
  }
}

// vite.config.js (after)
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})
```

**Sample: Vue CLI env → Vite .env**
```bash
# .env.development (Vue CLI)
VUE_APP_API_URL=http://localhost:4000

# .env.development (Vite)
VITE_API_URL=http://localhost:4000
```

```js
// usage
const api = import.meta.env.VITE_API_URL
```

#### AI prompt (tooling migration)
```
We are porting this Webpack configuration (paste relevant sections) to Vite. 
Outline the equivalent Vite config and note any missing feature parity concerns.
---
Webpack/Vue CLI config snippets:
{{ legacy_config_snippet }}
Current tooling commands: {{ legacy_scripts }}
Desired Vite features: {{ desired_vite_features }}

Provide equivalent Vite configuration (plugins, css, env), call out features needing custom plugins, and list packages we can remove.
```

### Phase 3 – Runtime Stabilization
1. Replace global filters with utility imports or computed properties.
2. Swap lifecycle hooks (`beforeDestroy` ➜ `beforeUnmount`, etc.).
3. Modernize async component & functional component usage (use `defineAsyncComponent`, render functions aligning with Vue 3’s signature).
4. Remove compat mode once warnings disappear.

**Sample: Lifecycle hook migration**
```diff
-beforeDestroy() {
-  this.unsubscribe?.()
-},
+beforeUnmount() {
+  this.unsubscribe?.()
+},
```

**Sample: Async component**
```diff
-const MyChart = () => import('./charts/MyChart.vue')
+import { defineAsyncComponent } from 'vue'
+const MyChart = defineAsyncComponent(() => import('./charts/MyChart.vue'))
```

### Phase 4 – Ecosystem Alignment
- Upgrade vue-router to v4; update navigation guards, slot syntax, `<router-link>` usage.
- Upgrade vuex to v4 or evaluate Pinia for a more Composition-friendly store.
- Migrate SSR/Nuxt setups to their Vue 3-compatible releases (Nuxt Bridge, Nuxt 3).

**Sample: Router 3 ➜ Router 4**
```diff
-import Vue from 'vue'
-import Router from 'vue-router'
-Vue.use(Router)
-export default new Router({
-  mode: 'history',
-  routes: [{ path: '/', component: Home }]
-})
+import { createRouter, createWebHistory } from 'vue-router'
+import Home from '@/views/Home.vue'
+
+export default function initRouter() {
+  return createRouter({
+    history: createWebHistory(),
+    routes: [{ path: '/', component: Home }]
+  })
+}
```

**Sample: Store module → Pinia**
```js
// Vuex module (before)
export default {
  namespaced: true,
  state: () => ({ count: 0 }),
  mutations: {
    increment(state) { state.count += 1 }
  }
}

// Pinia store (after)
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count += 1
    }
  }
})
```
#### AI prompt (store refactor decision)
```
We currently use Vuex 3 modules defined like this (paste). 
Should we migrate to Vuex 4 or Pinia for Vue 3? Provide a pros/cons analysis with migration effort estimates.
---
Current Vuex module snippet:
{{ vuex_module_code }}
State usage patterns: {{ state_usage_notes }}

Compare staying on Vuex 4 vs migrating to Pinia (include pros/cons, migration effort, testing impact), then recommend a path.
```

### Phase 5 – Verification & Observability
- Rerun all automated tests; if coverage is low, prioritize smoke/regression suits.
- Compare bundle sizes, performance metrics, and runtime logs pre/post migration.
- Add instrumentation (Vue DevTools, Performance API) to catch regressions early.

#### AI prompt (regression checklist)
```
Create a regression test plan focusing on components that changed due to Vue 3 migration. 
Consider filters removal, router updates, and store refactors.
---
List of migrated features:
{{ migrated_feature_list }}
Known risk areas: {{ risk_areas }}

Produce a regression checklist covering unit, integration, and E2E tests plus monitoring to validate the migration.
```

---

## 4. Handling Third-Party Libraries

- Build an inventory of every dependency touching Vue, note target versions, and assign owners.
- Use the matrix below to classify upgrade work and track risk.

### 4.1 Assessment Matrix
| Library Type | Action | Notes |
|--------------|--------|-------|
| Vue 3 ready | Upgrade immediately and follow vendor guide | e.g. vue-router@4, vuex@4 |
| Vue 2 only but critical | Keep temporarily under compat or wrap in microfrontends/web components | define sunset plan |
| UI framework (Bulma/Bootstrap) | Evaluate Buefy 3, Oruga, Element Plus, Naive UI, headless + Tailwind | pilot per component cluster |
| Framework-agnostic (Axios, Lodash) | Usually unaffected; confirm ESM support & DOM usage | lazy-load in `onMounted` for SSR |
| Abandoned/blocking | Fork, rewrite, or replace before removing compat | log as migration blocker |

**AI prompt (library assessment)**
```
We are cataloging third-party libraries for migration.
Libraries and current versions:
{{ library_inventory }}
Target versions / replacements:
{{ target_versions_or_replacements }}
Known constraints:
{{ known_constraints }}

Produce a table with action, risk (🔴/🟡/🟢), suggested replacements, and key test focus areas.
```

### 4.2 Vue 2-specific Libraries
- **Check vendor roadmap.** Some provide Vue 3 forks/betas.
- **Bridging strategies:** 
  - Wrap Vue 2 components inside micro frontends running compat build.
  - Expose critical UI as web components using `@vue/web-component-wrapper`.
  - Replace with agnostic alternatives (e.g., Vue 3 ready UI libraries such as Naive UI, Element Plus).

### 4.3 Non-Vue Libraries
- Usually unaffected. Verify they don’t inject Vue internals (rare but possible with SSR libs).
- Re-test integrations relying on DOM structure (Vue 3 changed vnode layouts slightly).

**AI prompt (non-Vue library check)**
```
Evaluate the following non-Vue integration:
- Library: {{ library_name }} ({{ current_version }})
- Usage context: {{ usage_description }}
- Snippet:
{{ code_snippet }}

List Vue 3 considerations (ESM support, SSR impact, DOM interactions) and mitigation steps.
```

### 4.4 Custom Directives & Mixins
- Directives with hooks (`bind`, `inserted`, `unbind`) must adopt new hook names (`beforeMount`, `mounted`, `unmounted`, etc.).
- Refactor global mixins into composables or provide plugins to avoid polluting global scope.

#### AI prompt (directive refactor)
```
Refactor this Vue 2 directive (paste) to Vue 3 hook signatures. 
Highlight differences in binding lifecycle semantics.
---
Directive code:
{{ directive_code }}
Usage context: {{ directive_usage }}

Convert this Vue 2 directive to Vue 3 hook signatures and explain lifecycle differences plus any behaviour changes.
```

### 4.5 Library-Specific Migration Notes
- **vuex-persistedstate ➜ pinia-plugin-persistedstate:** when moving to Pinia, add plugin registration at store creation (`pinia.use(createPersistedState())`) and migrate module namespaces to Pinia stores. Validate storage keys to avoid collisions between partially migrated microfrontends.

```js
// main.ts
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPersist)
```

```js
// store
export const useAuthStore = defineStore('auth', {
  state: () => ({ token: null }),
  persist: {
    storage: localStorage,
    paths: ['token']
  }
})
```

- **Vuetify v2 ➜ Vuetify v3:** audit theme tokens, tree-shake components, and replace `v-btn` props with new API. Vuetify v3 is Vite-friendly; enable `components: {}` auto-import and adjust typography classes.

```ts
// vuetify.ts
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'light'
  }
})
```

- **Buefy 0.9 ➜ Buefy 3 (Vue 3 support)**: follow the official migration guide (https://github.com/buefy/buefy/blob/dev/MIGRATION-NOTE.md); update renamed props/slots and remove filters. Confirm Bulma variables remain consistent across microfrontends.
- **Buefy ➜ Oruga (alternative)**: a headless Bulma-flavoured library. If Buefy 3 gaps exist, create wrapper components to standardise markup and gradually replace legacy widgets.

```vue
<template>
  <o-button variant="primary" @click="submit">Save</o-button>
</template>

<script setup>
import { OButton } from '@oruga-ui/oruga-next'
</script>
```

- **VeeValidate v3 ➜ v4:** rewrite `ValidationProvider/Observer` to `useForm`/`useField`; update async rule registration; adopt Composition API patterns.

```vue
<script setup>
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'

const { handleSubmit } = useForm({
  validationSchema: yup.object({
    email: yup.string().email().required()
  })
})

const { value: email, errorMessage } = useField('email')
const submit = handleSubmit(values => console.log(values))
</script>
```

- **vue-mq ➜ @vueuse/core useBreakpoints / vue3-mq:** replace filter-like `$mq` usage with composables or provide injection tokens for responsive logic.

```ts
import { useBreakpoints } from '@vueuse/core'

const breakpoints = useBreakpoints({ mobile: 0, tablet: 768, desktop: 1024 })
const isDesktop = breakpoints.greater('desktop')
```

- **idle-vue**: swap to browser `IdleDetector` polyfills or libraries such as `vue-idle` (Vue 3) that expose composables.
- **Tiptap (RTE):** upgrade to Tiptap 2 (built on ProseMirror with Vue 3 support). Review extension compatibility; import CSS modules lazily in microfrontends to avoid global bleed.

```vue
<template>
  <EditorContent :editor="editor" />
</template>

<script setup>
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const editor = useEditor({
  extensions: [StarterKit],
  content: '<p>Hello Vue 3!</p>'
})
</script>
```

- **vue-signature-pad:** adopt `vue-signature-pad-next` or wrap the underlying signature library directly.
- **CASL v4 ➜ v6:** update imports (`defineAbility`) and ensure ability subject detection uses functions rather than plain objects; retune TypeScript types if shared across MFEs.

```ts
import { defineAbility } from '@casl/ability'

export const ability = defineAbility((can, cannot) => {
  can('read', 'Article')
  cannot('delete', 'Article', { archived: true })
})
```

- **oidc-client-ts 2.3 ➜ 3.3:** update configuration (authority, metadata) to new defaults; re-test silent renew flows. Consider emitting auth events through a shared bus when MFEs authenticate independently.

```ts
import { UserManager } from 'oidc-client-ts'

const manager = new UserManager({
  authority: 'https://auth.example.com',
  client_id: 'spa',
  redirect_uri: 'https://app.example.com/callback',
  response_type: 'code',
  scope: 'openid profile email'
})
```

**AI prompt (ecosystem package upgrade)**
```
Library: {{ library_name }}
Current version: {{ current_version }}
Target version: {{ target_version }}
Usage snippet:
{{ code_snippet }}

List breaking changes from the vendor docs, code updates we must apply, and tests to prioritize.
```

- **Tailwind CSS:** upgrade Tailwind config to v3 (JIT default), ensure `content` globs include `.vue`/`.ts` in Vite; share base config via workspace packages when MFEs migrate piecemeal.

```js
// tailwind.config.cjs
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: []
}
```

- **SCSS/SASS/LESS:** configure Vite `css.preprocessorOptions` for shared variables/mixins. For MFEs, publish a design tokens package so Vue 2 and Vue 3 apps read identical variables.
- **Microfrontend Runtime Considerations:** coordinate library upgrades per microfrontend—maintain compatibility wrappers so Vue 2 MFEs can coexist with Vue 3 MFEs using new dependencies. Apply feature flags for shared UI kit versions to prevent CSS drift.

### 4.6 Extra Guidance & Examples
- **Decision checklist**
  - Create a migration spreadsheet capturing package name, current version, Vue 3 replacement, owner, risk level, and rollout window.
  - Flag libraries with no Vue 3 roadmap as blockers and raise migration RFCs early.
- **Backlog template**
  ```markdown
  | Package | Current | Target | Owner | Risk | Rollout Notes |
  |---------|---------|--------|-------|------|----------------|
  | buefy   | 0.9.x   | buefy 3.0 / oruga fallback | @design | 🔴 | Pilot Buefy 3 for core widgets; fallback to Oruga for gaps |
  | vee-validate | 3.x | 4.x | @forms | 🟡 | Convert login + registration, then global forms |
  ```
- **AI prompt (backlog drafting)**
  ```
  Build a migration backlog table for these libraries:
  {{ library_list_with_targets }}

  Include columns for owner, risk (🔴/🟡/🟢), planned rollout window, and regression focus.
  ```
- **Bridging legacy Vue 2 components**
  - Web component wrapper: `customElements.define('legacy-widget', wrap(Vue, LegacyComponent))`.
  - Microfrontend isolation: expose Vue 2 apps via Qiankun or Module Federation while new Vue 3 remotes roll out.
  - Event bridge: publish updates with `window.dispatchEvent(new CustomEvent('legacy:update', { detail }))` so Vue 3 apps can react.
- **Framework-agnostic libraries**
  - Verify ESM output; Vite prefers native modules.
  - Lazy-load DOM-heavy packages inside `onMounted` to avoid hydration warnings.
  - Re-test SSR behaviour because Vue 3 hydration is stricter.

**AI prompt (bridging strategy)**
```
We must run these Vue 2 components inside a Vue 3 shell:
{{ legacy_component_list }}
Constraints: {{ constraints_or_deadlines }}

Recommend a bridging strategy (compat build, web components, microfrontends) and outline migration checkpoints.
```

---

## 5. Microfrontend & Partial Migration Strategy

### 5.1 Microfrontends (e.g., Qiankun)
- **Incremental approach:** Treat each micro-app separately; start with shared shell/platform libs.
- Run Vue 2 apps alongside Vue 3 by isolating dependencies:
  - Namespace CSS.
  - Use bundler externals to avoid duplicate Vue copies; ensure Vue 2 apps load their own version.
  - Consider migration wrappers to communicate via events or shared stores.

**AI prompt (microfrontend inventory)**
```
Catalog our microfrontends with the following data:
{{ microfrontend_list_and_details }}

Produce a table capturing current stack, target stack, owner, shared dependencies, risk, and migration window.
```

### 5.2 Migrating Qiankun to Modern Alternatives
- Evaluate Module Federation (Webpack 5) or Vite-native Module Federation plugins.
- Plan for route orchestration, shared dependencies, and authentication flows.
- Ensure design systems and cross-app communication channels are version-agnostic.

**Sample: Vite Module Federation shell**
```ts
// vite.config.ts
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'shell',
      remotes: {
        news: 'http://localhost:5001/assets/remoteEntry.js'
      },
      shared: ['vue', 'pinia']
    })
  ]
})
```

**AI prompt (microfrontend migration plan)**
```
We have 20 microfrontends managed with Qiankun (Vue 2). 
We aim to migrate them gradually to Vue 3 using Vite Module Federation. 
Draft a phased rollout plan that keeps production stable while apps switch stacks.
---
Current host: {{ current_microfrontend_host }}
Remotes: {{ list_of_microfrontends }}
Target architecture: {{ target_architecture }}
Constraints: {{ constraints }}

Outline phased steps (audit, shell upgrade, pilots, rollout, decommission) and include risk mitigation plus rollback triggers for each phase.
```

### 5.3 Partial Migration Tips
- Prioritize high-impact or low-dependency microfrontends first.
- Maintain compatibility layers (API contracts, shared UI kit) until most apps are upgraded.
- Automate visual regression tests across shells and micro-apps to catch cross-version incompatibilities.
- For CSS/tooling differences (Tailwind, SCSS, LESS), promote shared build presets. Each microfrontend can consume a versioned design-system package to avoid desynchronization during gradual rollout.
- When migrating state management to Pinia, expose both Vuex and Pinia stores behind a façade so MFEs can switch one by one. Gradually port persisted-state modules to `pinia-plugin-persistedstate` while monitoring storage key parity.
- Consider strangler patterns: mount Vue 3 MFEs inside Vue 2 shells via Web Components if immediate replacement isn’t feasible.
- **Cross-version component usage**: you cannot directly mount Vue 2 components inside Vue 3 apps (or vice versa) without a bridge. Options include:
  - **Web Components**: wrap Vue 2 components using `@vue/web-component-wrapper`, then consume them as custom elements in Vue 3.
  - **iframe/microfrontend isolation**: render Vue 2 apps in isolated microfrontends and communicate via events.
  - **Compat build**: short-term, use Vue 3 compat mode to host Vue 2 components, but plan to migrate or wrap them—compat build is a temporary bridge, not a long-term solution.

**AI prompt (partial migration plan)**
```
We have the following microfrontends to migrate incrementally:
{{ microfrontend_migration_order }}
State strategy: {{ state_strategy }}
Design system: {{ design_system_notes }}

Produce a staged plan covering compatibility layers, regression testing, and rollback for each batch.
```

**Sample: Wrap Vue 2 component as Web Component**
```js
// vue2-component.js (Vue 2)
import Vue from 'vue'
import wrap from '@vue/web-component-wrapper'
import LegacyWidget from './LegacyWidget.vue'

const CustomElement = wrap(Vue, LegacyWidget)
customElements.define('legacy-widget', CustomElement)
```

```vue
<!-- Vue 3 usage -->
<template>
  <legacy-widget data-id="42"></legacy-widget>
</template>
```

### 5.4 Advanced Microfrontend Playbook
- **Create a migration scorecard** documenting each MFE’s stack, shared dependencies, release cadence, and owner.
- **Coexistence patterns**
  - Namespace CSS through shared design tokens or Tailwind presets published as `@company/design-system`.
  - Expose Vue runtime, router, and store libraries as Module Federation singletons to avoid duplicate bundles.
  - Build a simple event bridge:
    ```ts
    export function publish (channel, payload) {
      window.dispatchEvent(new CustomEvent(channel, { detail: payload }))
    }
    export function subscribe (channel, handler) {
      window.addEventListener(channel, handler)
      return () => window.removeEventListener(channel, handler)
    }
    ```
- **Migration roadmap**
  1. **Audit** lifecycles, shared assets, and deployment pipelines.
  2. **Dual-build** legacy MFEs (Qiankun bundle + remote module) to de-risk cutover.
  3. **Upgrade shell** to Vite + Module Federation.
  4. **Pilot** one remote, validating routing, store, and auth flows.
  5. **Roll out** remaining MFEs with feature flags and dedicated regression passes.
  6. **Retire Qiankun** once coverage goals are achieved.
- **Partial migration tips**
  - Maintain API contract versioning so Vue 2 and Vue 3 clients coexist.
  - Provide a store façade while Vuex and Pinia overlap (`useCart()` delegating based on environment flag).
  - Automate visual regression per MFE (Percy/Chromatic) to catch design drift.
  - Document rollback steps for each remote deployment.

**AI prompt (microfrontend playbook)**
```
Scorecard:
{{ microfrontend_scorecard }}
Shared dependencies: {{ shared_dependencies }}
Risk notes: {{ risk_notes }}

Design a detailed playbook covering coexistence patterns, event bridge setup, singletons configuration, and regression checkpoints.
```

---

## 6. Dealing With Other Legacy Tooling

### 6.1 Webpack Remnants
- Remove Webpack-specific loaders (`vue-loader`, `css-loader`, etc.) once Vite parity is confirmed.
- Replace `DefinePlugin` usage with Vite’s `define` option or `.env` files.

**AI prompt (webpack cleanup)**
```
We are removing Webpack tooling. Current config snippets:
{{ webpack_config_snippets }}

List equivalent Vite configuration (plugins, env handling, asset pipeline) and packages we can uninstall.
```

### 6.2 Vue CLI Specifics
- Delete CLI config and service files once the build/test pipelines point to Vite commands.
- Translate CLI plugin features:
  - **PWA** ➜ `vite-plugin-pwa`.
  - **i18n** ➜ `@intlify/vite-plugin-vue-i18n`.
  - **TypeScript support** is built in; ensure `tsconfig` aligns with Vite defaults.
- Configure CLI-to-Vite migration scripts for styles: map `css.loaderOptions` to Vite globals, rewire Tailwind/PostCSS pipelines, and replicate asset handling rules for fonts/images.
- For projects with Vue CLI + qiankun, migrate the host to Vite first, then wrap remaining CLI MFEs with build adapters (e.g., `vite-plugin-qiankun`) until each app is ported.

**AI prompt (CLI ➜ Vite plan)**
```
vue.config.js excerpt:
{{ vue_config_snippet }}
Current scripts: {{ npm_scripts }}

Describe the equivalent Vite configuration (aliases, proxies, CSS preprocessing) and list any plugins or env file changes required.
```

**Sample: Vue CLI css.loaderOptions ➜ Vite config**
```js
// vue.config.js (before)
module.exports = {
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@import "@/styles/_mixins.scss";`
      }
    }
  }
}

// vite.config.ts (after)
css: {
  preprocessorOptions: {
    scss: {
      additionalData: `@import "@/styles/_mixins.scss";`
    }
  }
}
```

### 6.3 Testing Stack
- Update test utilities to Vue 3 compatible versions (`@vue/test-utils` v2, Cypress components).
- For Storybook, migrate to v7+ with the Vue 3 renderer.
- Snapshot tests reliant on Vue 2 render output should be regenerated after the build/tooling transition (Vue Router 4, Pinia, Vuetify v3).

**Sample: Jest setup**
```js
// test/setup.ts
import { config } from '@vue/test-utils'
config.global.stubs = {
  'router-link': { template: '<a><slot /></a>' }
}
```

### 6.4 CI/CD & DevOps
- Update pipeline scripts to call `vite build` instead of `vue-cli-service build` / custom Webpack commands.
- Cache `node_modules`, `pnpm store`, or `yarn cache` to keep CI fast post-migration.
- For Module Federation deployments, version remote URLs and bust caches after each release.
- Add bundle size checks (e.g., `source-map-explorer`, `vite build --analyze`) to monitor regressions.

**AI prompt (CI/CD update)**
```
Current pipeline steps:
{{ current_ci_pipeline }}
Target state:
{{ desired_ci_pipeline }}

Recommend updates for build/test/deploy after adopting Vite (include caching, artifacts, federation remote publishing, and rollback steps).
```

### 6.5 Infrastructure Checklist
- Remove obsolete Webpack/CLI configuration files from repositories.
- Update container images/Dockerfiles to drop Webpack-specific dependencies.
- Refresh Sentry/New Relic tracing instrumentation to match new router/store structures.
- Document new local development commands (Vite dev server, Pinia devtools) in CONTRIBUTING.md.

**AI prompt (infrastructure checklist)**
```
Infrastructure artefacts:
- Dockerfiles: {{ dockerfile_notes }}
- Monitoring/logging: {{ monitoring_requirements }}
- Developer tooling: {{ developer_tooling_changes }}

Produce a checklist with owners and due dates to align infrastructure with the Vue 3 stack.
```

#### AI prompt (testing migration)
```
We have Jest unit tests using @vue/test-utils v1 and Vue 2 snapshots. 
Provide a migration plan to update the tests for Vue 3 compatibility, including snapshot considerations.
---
Testing stack:
- Unit runner: {{ unit_runner }}
- Current component utils: {{ current_test_utils_version }}
- Snapshot usage: {{ snapshot_summary }}

Outline steps to upgrade tests for Vue 3, note which snapshots must be regenerated, and list regression areas to cover.
```

---

## 7. Final Clean-up & Governance

1. Remove `@vue/compat`, compat configuration, and unused shims.
2. Freeze new feature work during final QA to avoid regression whack-a-mole.
3. Update documentation (README, onboarding guides, coding standards).
4. Schedule knowledge-sharing sessions to align the team on Composition API, script setup, and new patterns.
5. Monitor production logs closely after release; keep a rollback plan ready.
6. Capture key metrics (Core Web Vitals, bundle size, backend latency) before and after launch.
7. Archive migration scripts/codemods and update ADRs documenting major decisions.
8. Populate a follow-up backlog (convert remaining mixins, adopt `<script setup>`, improve testing coverage).
9. Celebrate with a postmortem summarising wins, surprises, and future improvements.

**Sample cleanup script**
```bash
#!/usr/bin/env bash
set -euo pipefail

echo "Removing Vue 2 artifacts..."
rm -rf src/legacy
rm -f vue.config.js
npm uninstall @vue/compat vue-template-compiler vue-loader

echo "Running production build..."
npm run build
npx source-map-explorer dist/assets/*.js
```

#### AI prompt (post-migration review)
```
Review this checklist of cleanup tasks (paste). 
What additional items should we verify before declaring the Vue 3 migration complete?
---
Cleanup checklist:
{{ cleanup_checklist }}
Outstanding concerns:
{{ outstanding_concerns }}

Identify remaining tasks, metrics to validate, and documentation updates before we call the migration done.
```

---

## 8. Appendix – Quick Reference Prompts

| Stage | Prompt Idea |
|-------|-------------|
| Pre-migration | “Summarize main breaking changes between Vue 2 and Vue 3 relevant to this code sample (paste).” |
| Tooling | “Convert this `vue.config.js` snippet to an equivalent Vite configuration.” |
| Runtime Fix | “Vue 3 throws error `<message>` for this component (paste). Suggest a Composition API refactor.” |
| Third-party | “Does `<library>` offer Vue 3 support? Suggest migration path if not.” |
| Microfrontends | “Design a deployment workflow for progressively upgrading 20 Qiankun microfrontends to Vue 3.” |
| QA | “Generate regression test cases focused on routing, async data fetching, and state management after migrating to Vue Router 4.” |
| Pinia | “Rewrite this Vuex module (paste) as a Pinia store with persisted state support using `pinia-plugin-persistedstate`.” |
| CSS Tooling | “Map this SCSS configuration (paste loader config) to Vite’s CSS options, ensuring microfrontends share variables safely.” |

---

## 9. Happy Vibes Coding ✨

Celebrate milestones! Share wins, retrospectives, and shout-outs. The migration is an opportunity to modernize, reinforce best practices, and expand the team’s Vue 3 expertise. Keep iterating on this workflow as your stack evolves.
