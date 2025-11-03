https://v3-migration.vuejs.org/migration-build.html#upgrade-workflow

01) step-01/migrate-to-vite
    migrate to Vite + vite-plugin-vue2: remove SSR and switch build setup to Vite

02) step-02/add-vue-compat-and-vue-compiler-sf
    In package.json, update vue to 3.1, install @vue/compat of the same version, and replace vue-template-compiler (if present) with @vue/compiler-sfc
    In the build setup, alias vue to @vue/compat and enable compat mode via Vue compiler options.
    
03) step-03/fix-initial-compat-warnings
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

04) step-04/fix-runtime-compat-warnings
    After fixing the errors, the app should be able to run if it is not subject to the limitations mentioned above.
    You will likely see a LOT of warnings from both the command line and the browser console. Here are some general tips:
        - You can filter for specific warnings in the browser console. It's a good idea to use the filter and focus on fixing one item at a time. 
          You can also use negated filters like -GLOBAL_MOUNT.
        - You can suppress specific deprecations via compat configuration.
        - Some warnings may be caused by a dependency that you use (e.g. vue-router). 
          You can check this from the warning's component trace or stack trace (expanded on click). 
          Focus on fixing the warnings that originate from your own source code first.
        - If you are using vue-router, note <transition> and <keep-alive> will not work with <router-view> until you upgrade to vue-router v4.
    ```error
        index.js:4 [Vue warn]: (deprecation CONFIG_OPTION_MERGE_STRATS) config.optionMergeStrategies no longer exposes internal strategies. Use custom merge functions instead.
        main.js:11 [Vue warn]: (deprecation GLOBAL_MOUNT) The global app bootstrapping API has changed: vm.$mount() and the "el" option have been removed. Use createApp(RootComponent).mount() instead.
            Details: https://v3-migration.vuejs.org/breaking-changes/global-api.html#mounting-app-instance
        main.js:11 [Vue warn]: (deprecation GLOBAL_PROTOTYPE) Vue.prototype is no longer available in Vue 3. Use app.config.globalProperties instead.
            Details: https://v3-migration.vuejs.org/breaking-changes/global-api.html#vue-prototype-replaced-by-config-globalproperties
        main.js:11 [Vue warn]: (deprecation PRIVATE_APIS) "$options.parent" is a Vue 2 private API that no longer exists in Vue 3. If you are seeing this warning only due to a dependency, you can suppress this warning via { PRIVATE_APIS: 'suppress-warning' }.
        main.js:11 [Vue warn]: (deprecation OPTIONS_DESTROYED) `destroyed` has been renamed to `unmounted`.
        index.js:10 [Vue warn]: (deprecation PRIVATE_APIS) (2)
        index.js:10 [Vue warn]: (deprecation OPTIONS_DESTROYED) (2)
        index.js:10 [Vue warn]: (deprecation OPTIONS_DATA_FN) The "data" option can no longer be a plain object. Always use a function.
            Details: https://v3-migration.vuejs.org/breaking-changes/data-option.html
        index.js:10 [Vue warn]: (deprecation PRIVATE_APIS) (3)
        index.js:10 [Vue warn]: (deprecation OPTIONS_DESTROYED) (3)
        app.js:21 [Vue warn]: (deprecation GLOBAL_SET) Vue.set() has been removed as it is no longer needed in Vue 3. Simply use native JavaScript mutations.
        app.js:21 [Vue warn]: (deprecation PRIVATE_APIS) (4)
        app.js:21 [Vue warn]: (deprecation OPTIONS_DESTROYED) (4)
        app.js:26 [Vue warn]: (deprecation RENDER_FUNCTION) Vue 3's render function API has changed. You can opt-in to the new API with:
        configureCompat({ RENDER_FUNCTION: false })
        (This can also be done per-component via the "compatConfig" option.)
            Details: https://v3-migration.vuejs.org/breaking-changes/render-function-api.html
        app.js:26 [Vue warn]: (deprecation INSTANCE_EVENT_HOOKS) "hook:destroyed" lifecycle events are no longer supported. From templates, use the "vue:" prefix instead of "hook:". For example, @hook:destroyed should be changed to @vue:destroyed. From JavaScript, use Composition API to dynamically register lifecycle hooks.
            Details: https://v3-migration.vuejs.org/breaking-changes/vnode-lifecycle-events.html
        app.js:26 [Vue warn]: (deprecation GLOBAL_PRIVATE_UTIL) Vue.util has been removed. Please refactor to avoid its usage since it was an internal API even in Vue 2.
        app.js:26 [Vue warn]: (deprecation OPTIONS_DESTROYED) (5)
        app.js:21 [Vue warn]: (deprecation INSTANCE_DESTROY) vm.$destroy() has been removed. Use app.unmount() instead.
            Details: https://vuejs.org/api/application.html#app-unmount
        app.js:26 [Vue warn]: (deprecation GLOBAL_EXTEND) Vue.extend() has been removed in Vue 3. Use defineComponent() instead.
            Details: https://vuejs.org/api/general.html#definecomponent
        main.js:69 [Vue warn]: (deprecation PRIVATE_APIS) (5) 
        at <App> 
        at <App>
        main.js:69 [Vue warn]: (deprecation OPTIONS_DESTROYED) (6) 
            at <App> 
            at <App>
        main.js:69 [Vue warn]: (deprecation RENDER_FUNCTION) (2) 
            at <RouterLink to="/" exact="" > 
            at <App> 
            at <App>
        main.js:69 [Vue warn]: (deprecation PRIVATE_APIS) (6) 
            at <RouterLink to="/" exact="" > 
            at <App> 
            at <App>
        main.js:69 [Vue warn]: (deprecation OPTIONS_DESTROYED) (7) 
            at <RouterLink to="/" exact="" > 
            at <App> 
            at <App>
        main.js:69 [Vue warn]: (deprecation INSTANCE_SCOPED_SLOTS) vm.$scopedSlots has been removed. Use vm.$slots instead.
            Details: https://v3-migration.vuejs.org/breaking-changes/slots-unification.html 
            at <RouterLink to="/" exact="" > 
            at <App> 
            at <App>
        main.js:69 [vue-router] In Vue Router 4, the v-slot API will by default wrap its content with an <a> element. Use the custom prop to remove this warning:
            <router-link v-slot="{ navigate, href }" custom></router-link>
        main.js:69 [Vue warn]: (deprecation OPTIONS_DESTROYED) (8) 
            at <BaseTransition mode="out-in" appear=false persisted=false  ... > 
            at <Transition name="fade" mode="out-in" > 
            at <App> 
            at <App>
        App.vue:19 [Vue warn]: (deprecation COMPONENT_FUNCTIONAL) Functional component <RouterView> should be defined as a plain function in Vue 3. The "functional" option has been removed. NOTE: Before migrating to use plain functions for functional components, first make sure that all async components usage have been migrated and its compat behavior has been disabled.
            Details: https://v3-migration.vuejs.org/breaking-changes/functional-components.html 
            at <BaseTransition mode="out-in" appear=false persisted=false  ... > 
            at <Transition name="fade" mode="out-in" > 
            at <App> 
            at <App>
        main.js:69 [Vue warn]: Unhandled error during execution of render function 
            at <RouterView class="view" routerView=true routerViewDepth=0  ... > 
            at <BaseTransition mode="out-in" appear=false persisted=false  ... > 
            at <Transition name="fade" mode="out-in" > 
            at <App> 
            at <App>
        vue-router.js?v=c9f4c2b4:312 Uncaught (in promise) TypeError: h is not a function
            at render (vue-router.js?v=c9f4c2b4:312:12)
            at Func (vue.js?v=c9f4c2b4:5990:12)
            at renderComponentRoot (vue.js?v=c9f4c2b4:10508:31)
            at ReactiveEffect.componentUpdateFn [as fn] (vue.js?v=c9f4c2b4:9255:46)
            at ReactiveEffect.run (vue.js?v=c9f4c2b4:578:19)
            at setupRenderEffect (vue.js?v=c9f4c2b4:9411:5)
            at mountComponent (vue.js?v=c9f4c2b4:9161:7)
            at processComponent (vue.js?v=c9f4c2b4:9111:9)
            at patch (vue.js?v=c9f4c2b4:8624:11)
            at ReactiveEffect.componentUpdateFn [as fn] (vue.js?v=c9f4c2b4:9262:11)
    ```

05) step-05/update-transition-class-names
    Update <transition> class names. This is the only feature that does not have a runtime warning. 
    You can do a project-wide search for .*-enter and .*-leave CSS class names.

06) step-06/update-app-entry
    Update app entry to use new global mounting API.

07) step-07/upgrade-vuex
    Upgrade vuex to v4.

08) step-08/upgrade-vue-router
    Upgrade vue-router to v4. If you also use vuex-router-sync, you can replace it with a store getter.
    After the upgrade, to use <transition> and <keep-alive> with <router-view> requires using the new scoped-slot based syntax.

09) step-09/fix-individual-warnings
    Pick off individual warnings. Note some features have conflicting behavior between Vue 2 and Vue 3 - for example, the render function API, or the functional component vs. async component change.
    To migrate to Vue 3 API without affecting the rest of the application, you can opt-in to Vue 3 behavior on a per-component basis with the compatConfig option.

10) step-10/remove-migration-build
    When all warnings are fixed, you can remove the migration build and switch to Vue 3 proper. 
    Note you may not be able to do so if you still have dependencies that rely on Vue 2 behavior.