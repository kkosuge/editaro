import Vue from 'vue'
import App from './App.vue'
import store from './store'

Vue.config.productionTip = false

store.persistedStore.load()

Vue.mixin({
  data() {
    return {
      persisted: store.persistedStore.state,
      memory: store.memoryStore.state,
    }
  },
})

Vue.persisted = store.persistedStore.state
Vue.memory = store.memoryStore.state

new Vue({
  render: h => h(App),
}).$mount('#app')

declare module 'vue/types/vue' {
  interface Vue {
    persisted: typeof store.persistedStore.state
    memory: typeof store.memoryStore.state
  }

  interface VueConstructor {
    persisted: typeof store.persistedStore.state
    memory: typeof store.memoryStore.state
  }
}
