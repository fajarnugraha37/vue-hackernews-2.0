import Vue, { configureCompat } from 'vue'
import 'es6-promise/auto'
import { createApp } from './app'
import ProgressBar from './components/ProgressBar.vue'

if (typeof configureCompat === 'function') {
  configureCompat({ MODE: 2 })
}

// global progress bar
const bar = Vue.prototype.$bar = new Vue(ProgressBar).$mount()
document.body.appendChild(bar.$el)

// call `asyncData` when a route component's params change
Vue.mixin({
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

const { app, router, store } = createApp()

router.onReady(async () => {
  router.beforeResolve((to, from, next) => {
    const matched = router.getMatchedComponents(to)
    const prevMatched = router.getMatchedComponents(from)
    let diffed = false
    const activated = matched.filter((c, i) => diffed || (diffed = (prevMatched[i] !== c)))
    const asyncDataHooks = activated.map(c => c.asyncData).filter(Boolean)
    if (!asyncDataHooks.length) {
      return next()
    }

    bar.start()
    Promise.all(asyncDataHooks.map(hook => hook({ store, route: to })))
      .then(() => {
        bar.finish()
        next()
      })
      .catch(err => {
        bar.fail()
        next(err)
      })
  })

  const initialMatched = router.getMatchedComponents()
  const initialHooks = initialMatched.map(c => c.asyncData).filter(Boolean)
  if (initialHooks.length) {
    bar.start()
    try {
      await Promise.all(
        initialHooks.map(hook => hook({ store, route: router.currentRoute }))
      )
      bar.finish()
    } catch (err) {
      bar.fail()
      console.error(err)
    }
  }

  app.$mount('#app')
})
