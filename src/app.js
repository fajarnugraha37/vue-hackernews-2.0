import { createApp as createVueApp } from 'vue'
import App from './App.vue'
import { createStore } from './store'
import { createRouter } from './router'
import titleMixin from './util/title'

// Expose a factory function that creates a fresh set of store, router,
// and app instances. Initially introduced for SSR, it now centralizes
// bootstrapping for the client build.
export function createApp () {
  const store = createStore()
  const router = createRouter()

  const app = createVueApp(App)
  app.use(store)
  app.use(router)
  app.mixin(titleMixin)

  return { app, router, store }
}
