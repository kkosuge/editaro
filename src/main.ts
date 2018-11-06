import Vue from 'vue'
import App from './App.vue'
import store from './store'

Vue.config.productionTip = false

store.load()

Vue.mixin({
  data() {
    return {
      sharedState: store.state,
    }
  },
})

Vue.sharedState = store.state

new Vue({
  render: h => h(App),
}).$mount('#app')

declare module 'vue/types/vue' {
  interface Vue {
    sharedState: typeof store.state
  }

  interface VueConstructor {
    sharedState: typeof store.state
  }
}
