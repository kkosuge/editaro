<template>
  <div id="preferences" class="preferences">
    <div class="header">
      <h1>Preferences</h1>
      <a href="#" class="close" @click.prevent="close"></a>
    </div>
    <div class="form-group">
      <div class='pretty p-default p-curve'>
        <input type='checkbox' id='vim-mode-checkbox' v-model='vimModeEnabled'>
        <div class='state'>
          <label for='vim-mode-checkbox'>Vim mode</label>
        </div>
      </div>
    </div>
    <div class="form-group select-group">
      <label>Theme:</label>
      <select v-model='theme'>
        <option v-for='theme in themes' :value='theme.value' :key='theme.value'>
          {{ theme.text }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import store, { SharedState } from '../store'
import '../lib/theme/dark'
import '../lib/theme/light'
import '../lib/theme/vscode'
import '../lib/theme/dark-grad'
import '../lib/theme/light-grad'
import themes from '../lib/theme/themes'

@Component
export default class extends Vue {
  themes = themes

  get vimModeEnabled(): SharedState['vimModeEnabled'] {
    return this.sharedState.vimModeEnabled
  }

  set vimModeEnabled(value: SharedState['vimModeEnabled']) {
    store.commit('vimModeEnabled', value, true)
  }

  get theme(): SharedState['theme'] {
    return this.sharedState.theme
  }

  set theme(value: SharedState['theme']) {
    store.commit('theme', value, true)
  }

  close() {
    store.commit('showPreferences', false)
  }
}
</script>

<style lang='scss'>
.form-group {
  margin-bottom: 10px;
}
.select-group {
  label {
    margin-right: 10px;
  }
}
</style>
