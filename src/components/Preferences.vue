<template>
  <div id="preferences" class="preferences">
    <div class="header">
      <h1>Preferences</h1>
      <a href="#" class="close" @click.prevent="close"></a>
    </div>
    <div class="form-group select-group">
      <label>Mode:</label>
      <select v-model='persisted.editorMode'>
        <option v-for='mode in editorModels' :value='mode.value' :key='mode.value'>
          {{ mode.text }}
        </option>
      </select>
    </div>
    <div class="form-group select-group">
      <label>Theme:</label>
      <select v-model='persisted.theme'>
        <option v-for='theme in themes' :value='theme.value' :key='theme.value'>
          {{ theme.text }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import store, { IEditorMode } from '../store'
import '../lib/theme/dark'
import '../lib/theme/light'
import '../lib/theme/vscode'
import '../lib/theme/dark-grad'
import '../lib/theme/light-grad'
import themes from '../lib/theme/themes'

interface IEditorModes {
  value: IEditorMode
  text: string
}

@Component
export default class extends Vue {
  editorModels: IEditorModes[] = [
    {
      value: 'normal',
      text: 'Normal',
    },
    {
      value: 'vim',
      text: 'Vim',
    },
  ]
  themes = themes

  close() {
    this.memory.showPreferences = false
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
