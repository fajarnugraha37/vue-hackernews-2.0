import { createStore as createVuexStore } from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'

const isDev = import.meta.env.DEV

export function createStore () {
  return createVuexStore({
    state: {
      activeType: null,
      itemsPerPage: 20,
      items: {/* [id: number]: Item */},
      users: {/* [id: string]: User */},
      lists: {
        top: [/* number */],
        new: [],
        show: [],
        ask: [],
        job: []
      },
      route: {
        path: '/',
        fullPath: '/',
        params: {},
        query: {},
        name: null
      }
    },
    actions,
    mutations,
    getters,
    strict: isDev
  })
}
