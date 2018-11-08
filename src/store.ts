function get<T extends any>(key: string, defaultValue: T): T
function get<T extends any>(key: string, defaultValue?: T): T | undefined {
  try {
    const item = localStorage.getItem(key)
    if (item) {
      return JSON.parse(item)
    } else {
      return defaultValue
    }
  } catch (err) {
    return defaultValue
  }
}

function set(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value))
}

export interface SharedState {
  theme: string
  vimModeEnabled: boolean
  showPreferences: boolean
}

const state: SharedState = {
  theme: 'dark-grad',
  vimModeEnabled: false,
  showPreferences: false,
}

export default {
  state,

  load() {
    state.theme = get<string>('theme', state.theme)
    state.vimModeEnabled = get<boolean>('vimModeEnabled', state.vimModeEnabled)
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
