function get<T extends any>(key: string, defaultValue: T): T
function get<T extends any>(key: string, defaultValue?: T): T | undefined {
  try {
    return JSON.parse(localStorage.getItem(key)!)
  } catch (err) {
    return defaultValue
  }
}

function set(key: string, value: any) {
  localStorage.setItem(key, value)
}

export interface SharedState {
  vimModeEnabled: boolean
  showPreferences: boolean
}

const state: SharedState = {
  vimModeEnabled: false,
  showPreferences: false,
}

export default {
  state,

  load() {
    state.vimModeEnabled = get<boolean>('vimModeEnabled', false)
  },

  commit<K extends keyof SharedState>(
    key: K,
    value: SharedState[K],
    persist: boolean = false
  ) {
    if (persist) {
      set(key, value)
    }

    state[key] = value
  },
}
