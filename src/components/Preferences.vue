<template>
  <div id="preferences" class="preferences">
    <div class="header">
      <h1>Preferences</h1>
      <a href="#" class="close" @click.prevent="close"></a>
    </div>
    <div class='pretty p-default p-curve'>
      <input type='checkbox' id='checkbox' v-model='vimModeEnabled'>
      <div class='state'>
        <label for='checkbox'>Vim mode</label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import store, { SharedState } from '../store'

@Component
export default class extends Vue {
  get vimModeEnabled(): SharedState['vimModeEnabled'] {
    return this.sharedState.vimModeEnabled
  }

  set vimModeEnabled(value: SharedState['vimModeEnabled']) {
    store.commit('vimModeEnabled', value, true)
  }

  close() {
    store.commit('showPreferences', false)
  }
}
</script>
