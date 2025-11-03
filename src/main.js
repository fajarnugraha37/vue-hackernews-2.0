import { createApp as createVueApp, configureCompat } from 'vue'
import 'es6-promise/auto'
import { createApp } from './app'
import ProgressBar from './components/ProgressBar.vue'

if (typeof configureCompat === 'function') {
  configureCompat({
    MODE: 3,
    GLOBAL_MOUNT: false,
    GLOBAL_PROTOTYPE: false,
    GLOBAL_SET: false,
    GLOBAL_DELETE: false
  })
}

const { app, router, store } = createApp()

// global progress bar
const progressApp = createVueApp(ProgressBar)
const progressBar = progressApp.mount(document.createElement('div'))
document.body.appendChild(progressBar.$el)
app.config.globalProperties.$bar = progressBar

// call `asyncData` when a route component's params change
app.mixin({
  beforeRouteUpdate (to, from, next) {
    const { asyncData } = this.$options
    if (asyncData) {
      asyncData({
        store: this.$store,
        route: to
      }).then(next).catch(next)
    } else {
      next()
    }
  }
})

function getComponents (route) {
  return route.matched.flatMap(record => Object.values(record.components || {}))
}

router.beforeEach((to, from, next) => {
  store.commit('SET_ROUTE', {
    path: to.path,
    fullPath: to.fullPath,
    params: to.params,
    query: to.query,
    name: to.name ?? null
  })
  next()
})

router.beforeResolve(async (to, from, next) => {
  const matched = getComponents(to)
  const prevMatched = getComponents(from)
  let diffed = false
  const activated = matched.filter((c, i) => diffed || (diffed = (prevMatched[i] !== c)))
  const asyncDataHooks = activated
    .map(component => component && component.asyncData)
    .filter(Boolean)

  if (!asyncDataHooks.length) {
    return next()
  }

  progressBar.start()
  try {
    await Promise.all(asyncDataHooks.map(hook => hook({ store, route: to })))
    progressBar.finish()
    next()
  } catch (err) {
    progressBar.fail()
    next(err)
  }
})

router.isReady().then(async () => {
  const initialComponents = getComponents(router.currentRoute.value)
  const initialHooks = initialComponents
    .map(component => component && component.asyncData)
    .filter(Boolean)

  if (initialHooks.length) {
    progressBar.start()
    try {
      await Promise.all(
        initialHooks.map(hook => hook({ store, route: router.currentRoute.value }))
      )
      progressBar.finish()
    } catch (err) {
      progressBar.fail()
      console.error(err)
    }
  }

  store.commit('SET_ROUTE', router.currentRoute.value)
  app.mount('#app')
})
