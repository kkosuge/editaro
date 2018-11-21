<template>
  <div id="preferences" class="preferences">
    <div class="preferences-inner">
      <div class="header">
        <h1>Preferences</h1>
        <a href="#" class="close" @click.prevent="close"></a>
      </div>
      <div class="form-group select-group">
        <label>Mode:</label>
        <select v-model="persisted.editorMode">
          <option
            v-for="mode in editorModels"
            :value="mode.value"
            :key="mode.value"
          >
            {{ mode.text }}
          </option>
        </select>
      </div>
      <div class="form-group select-group">
        <label>Theme:</label>
        <select v-model="persisted.theme">
          <option
            v-for="theme in themes"
            :value="theme.value"
            :key="theme.value"
          >
            {{ theme.text }}
          </option>
        </select>
      </div>
      <div class="form-group select-group">
        <label>Font Size:</label>
        <select v-model="persisted.fontSize">
          <option v-for="size in fontSizes" :value="size" :key="size">
            {{ size }}px
          </option>
        </select>
      </div>
      <div class="form-group select-group">
        <label>Font Family:</label>
        <select v-model="persisted.fontFamily">
          <optgroup label="等幅">
            <option v-for="font in fontFamilies.filter(f => f.monospace)" :value="font.postscriptName" :key="`${font.postscriptName}-${font.path}`">
              {{ font.postscriptName }}
            </option>
          </optgroup>
          <optgroup label="標準">
            <option v-for="font in fontFamilies.filter(f => !f.monospace)" :value="font.postscriptName" :key="`${font.postscriptName}-${font.path}`">
              {{ font.postscriptName }}
            </option>
          </optgroup>
        </select>
      </div>
      <div class="app-version">エディ太郎: {{ appVersion }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import range from 'lodash/range'
import store, { IEditorMode } from '../store'
import '../lib/theme/dark'
import '../lib/theme/light'
import '../lib/theme/vscode'
import '../lib/theme/dark-grad'
import '../lib/theme/light-grad'
import themes from '../lib/theme/themes'
import { remote } from 'electron'
import fontFamilies from '../lib/fontFamilies'

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
  appVersion = remote.app.getVersion()
  fontSizes: number[] = range(10, 101)
  fontFamilies = fontFamilies

  close() {
    this.memory.showPreferences = false
  }
}
</script>
