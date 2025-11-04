import { createAPI } from './create-api-client'

const logRequests = !!import.meta.env.VITE_DEBUG_API

const api = createAPI({
  version: '/v0',
  config: {
    databaseURL: 'https://hacker-news.firebaseio.com'
  }
})

function fetch (child) {
  logRequests && console.log(`fetching ${child}...`)
  return new Promise((resolve, reject) => {
    api.child(child).once('value', snapshot => {
      const val = snapshot.val()
      if (val) {
        val.__lastUpdated = Date.now()
      }
      logRequests && console.log(`fetched ${child}.`)
      resolve(val)
    }, reject)
  })
}

export function fetchIdsByType (type) {
  return fetch(`${type}stories`)
}

export function fetchItem (id) {
  return fetch(`item/${id}`)
}

export function fetchItems (ids) {
  return Promise.all(ids.map(id => fetchItem(id)))
}

export function fetchUser (id) {
  return fetch(`user/${id}`)
}

export function watchList (type, cb) {
  let first = true
  const ref = api.child(`${type}stories`)
  const handler = snapshot => {
    if (first) {
      first = false
    } else {
      cb(snapshot.val())
    }
  }
  ref.on('value', handler)
  return () => {
    ref.off('value', handler)
  }
}
