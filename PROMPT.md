01) step-01/migrate-to-vite
    migrate to Vite + vite-plugin-vue2: remove SSR and switch build setup to Vite

02) step-02/add-vue-compat-and-vue-compiler-sf
    In package.json, update vue to 3.1, install @vue/compat of the same version, and replace vue-template-compiler (if present) with @vue/compiler-sfc
    In the build setup, alias vue to @vue/compat and enable compat mode via Vue compiler options.
    
03)
    At this point, your application may encounter some compile-time errors / warnings
    Fix them first. If all compiler warnings are gone, you can also set the compiler to Vue 3 mode.
    ```error
        23.33.53 [vite] warning: (deprecation COMPILER_FILTERS) filters have been removed in Vue 3. The "|" symbol will be treated as native JavaScript bitwise OR operator. Use method calls or computed properties instead.
        Details: https://v3-migration.vuejs.org/breaking-changes/filters.html
        5  |        <template v-if="item.url">
        6  |          <a :href="item.url" target="_blank" rel="noopener">{{ item.title }}</a>
        7  |          <span class="host"> ({{ item.url | host }})</span>
        |                                  ^^^^^^^^^^^^^^^
        8  |        </template>
        9  |        <template v-else>
        Plugin: vite:vue
        File: C:/Users/nugra/workspace/project/vue-2-to-3/vue-hackernews-2.0/src/components/Item.vue
        23.33.53 [vite] warning: (deprecation COMPILER_FILTERS) filters have been removed in Vue 3. The "|" symbol will be treated as native JavaScript bitwise OR operator. Use method calls or computed properties instead.
        Details: https://v3-migration.vuejs.org/breaking-changes/filters.html
        17 |        </span>
        18 |        <span class="time">
        19 |          {{ item.time | timeAgo }} ago
        |             ^^^^^^^^^^^^^^^^^^^
        20 |        </span>
        21 |        <span v-if="item.type !== 'job'" class="comments-link">
        Plugin: vite:vue
        File: C:/Users/nugra/workspace/project/vue-2-to-3/vue-hackernews-2.0/src/components/Item.vue
    ```

04)
    After fixing the errors, the app should be able to run if it is not subject to the limitations mentioned above.
    You will likely see a LOT of warnings from both the command line and the browser console. Here are some general tips:
        - You can filter for specific warnings in the browser console. It's a good idea to use the filter and focus on fixing one item at a time. You can also use negated filters like -GLOBAL_MOUNT.
        - You can suppress specific deprecations via compat configuration.
        - Some warnings may be caused by a dependency that you use (e.g. vue-router). You can check this from the warning's component trace or stack trace (expanded on click). Focus on fixing the warnings that originate from your own source code first.
        - If you are using vue-router, note <transition> and <keep-alive> will not work with <router-view> until you upgrade to vue-router v4.

05)
    Update <transition> class names. This is the only feature that does not have a runtime warning. You can do a project-wide search for .*-enter and .*-leave CSS class names.

06)
    Update app entry to use new global mounting API.

07)
    Upgrade vuex to v4.

08)
    Upgrade vue-router to v4. If you also use vuex-router-sync, you can replace it with a store getter.
    After the upgrade, to use <transition> and <keep-alive> with <router-view> requires using the new scoped-slot based syntax.

09)
    Pick off individual warnings. Note some features have conflicting behavior between Vue 2 and Vue 3 - for example, the render function API, or the functional component vs. async component change.
    To migrate to Vue 3 API without affecting the rest of the application, you can opt-in to Vue 3 behavior on a per-component basis with the compatConfig option.

10)
    When all warnings are fixed, you can remove the migration build and switch to Vue 3 proper. Note you may not be able to do so if you still have dependencies that rely on Vue 2 behavior.