import Vue from 'vue'

export type IEditorMode = 'normal' | 'vim'

export interface IMemoryStore {
  state: {
    showPreferences: boolean
  }
}

export interface persistedStore {
  state: {
    editorMode: IEditorMode
    language: string
    text: string
    theme: string
  }
  load(): void
  watch(vm: Vue, key: 'persisted'): any
}

const memoryStore: IMemoryStore = {
  state: {
    showPreferences: false,
  },
}

const persistedStore: persistedStore = {
  state: {
    editorMode: 'normal',
    language: 'markdown',
    text: '',
    theme: 'dark-grad',
  },

  load() {
    const localState = localStorage.getItem('state')
    if (localState) {
      try {
        this.state = { ...this.state, ...JSON.parse(localState) }
      } catch (err) {
        console.error(err)
      }
    }
  },

  watch(vm: Vue, key: 'persisted') {
    return vm.$watch(
      key,
      value => {
        localStorage.setItem('state', JSON.stringify(value))
      },
      { deep: true }
    )
  },
}

export default {
  memoryStore,
  persistedStore,
}
