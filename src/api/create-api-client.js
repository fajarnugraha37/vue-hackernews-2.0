import Firebase from 'firebase/app'
import 'firebase/database'

export function createAPI ({ config, version }) {
  if (Firebase.apps && !Firebase.apps.length) {
    Firebase.initializeApp(config)
  } else if (!Firebase.apps) {
    // older firebase versions expose defaultApp internally
    try {
      Firebase.initializeApp(config)
    } catch (err) {
      if (!/already exists/.test(err.message)) {
        throw err
      }
    }
  }
  return Firebase.database().ref(version)
}
