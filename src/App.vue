<template>
  <div id='app' :class='`theme-${this.theme}`'>
    <div class='draggable-title-bar'></div>
    <div class='main'>
      <div class='editor-wrapper'>
        <div id='editor' ref='editor'></div>
      </div>
    </div>
    <div class='nav-bar'>
      <div class='nav-bar-left'>
        <div class='nav-bar-item vim-status-bar' v-show="sharedState.vimModeEnabled" ref="vimStatusBar"></div>
        <div class='nav-bar-item'>
          Characters: {{ this.textLength }}
        </div>
        <div class='nav-bar-item'>
          Lines: {{ this.lineCount }}
        </div>
      </div>
      <div class='nav-bar-right'>
        <div class='nav-bar-item nav-bar-item-select'>
          <select v-model='language' @change='changeLanguage'>
            <option v-for='lang in languages' :value='lang.value' :key='lang.value'>
              {{ lang.text }}
            </option>
          </select>
        </div>
        <div class='nav-bar-item nav-bar-item-checkbox'>
          <span @click='toggleAlwaysOnTop'>Always on top:</span>
          <div class='pretty p-default p-curve'>
            <input type='checkbox' id='checkbox' v-model='alwaysOnTop' @change='changeAlwaysOnTop'>
            <div class='state'>
              <label for='checkbox'></label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Preferences v-if="sharedState.showPreferences"></Preferences>
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron'
import { Component, Vue, Watch } from 'vue-property-decorator'
import * as monaco from 'monaco-editor'
import './lib/theme/dark'
import './lib/theme/light'
import './lib/theme/vscode'
import './lib/theme/dark-grad'
import './lib/theme/light-grad'
import themes from './lib/theme/themes'
import languages from './lib/languages'
import './assets/style.scss'
import { initVimMode } from 'monaco-vim'
import Preferences from './components/Preferences.vue'
import store, { SharedState } from './store'

@Component({
  components: {
    Preferences,
  },
})
export default class App extends Vue {
  editor?: monaco.editor.IStandaloneCodeEditor
  editorModel?: monaco.editor.ITextModel
  el?: HTMLElement
  languages = languages
  language = 'markdown'
  textLength = 0
  themes = themes
  lineCount = 1
  alwaysOnTop = false
  vimMode?: any = null

  mounted() {
    this.loadLocalOptions()
    let defaultText = localStorage.getItem('text')
    if (!defaultText) {
      defaultText = ''
    }

    this.el = this.$refs.editor as HTMLElement
    this.editor = monaco.editor.create(this.el, this.defaultEditorOption())
    this.editorModel = monaco.editor.createModel(defaultText, this.language)
    this.editor.setModel(this.editorModel)
    this.editor.focus()

    this.updateEditorModelData()
    this.editorModel.onDidChangeContent(() => this.updateEditorModelData())

    document.addEventListener('copy', e => {
      if (this.editor && this.editorModel) {
        const editorSelection = this.editor.getSelection()
        const selectedText = this.editorModel.getValueInRange(editorSelection)
        ipcRenderer.send('copy', selectedText)
      }
      e.preventDefault()
    })

    this.updateVimMode(this.sharedState.vimModeEnabled)

    ipcRenderer.on('preferences', () => {
      store.commit('showPreferences', true)
    })
  }

  get theme(): SharedState['theme'] {
    return this.sharedState.theme
  }

  loadLocalOptions() {
    const localLanguage = localStorage.getItem('language')
    if (localLanguage) {
      this.language = localLanguage
    }
  }

  defaultEditorOption(): monaco.editor.IEditorConstructionOptions {
    return {
      theme: this.theme,
      lineNumbers: 'off',
      automaticLayout: true,
      autoIndent: true,
      fontSize: 13,
      language: this.language,
      wordWrap: 'on',
      lineDecorationsWidth: 0,
      minimap: {
        enabled: false,
      },
    }
  }

  updateEditorModelData() {
    if (this.editorModel) {
      const text = this.editorModel.getValue()
      localStorage.setItem('text', text)
      this.textLength = Array.from(text).length
      this.lineCount = this.editorModel.getLineCount()
    }
  }

  changeLanguage() {
    if (this.editorModel) {
      monaco.editor.setModelLanguage(this.editorModel, this.language)
      localStorage.setItem('language', this.language)
    }
  }

  changeAlwaysOnTop() {
    ipcRenderer.send('alwaysOnTop', this.alwaysOnTop)
  }

  toggleAlwaysOnTop() {
    this.alwaysOnTop = !this.alwaysOnTop
    ipcRenderer.send('alwaysOnTop', this.alwaysOnTop)
  }

  enableVimMode() {
    if (!this.vimMode) {
      const vimStatusBar = this.$refs.vimStatusBar as HTMLElement
      vimStatusBar.innerHTML = ''
      this.vimMode = initVimMode(this.editor!, vimStatusBar)
    }
  }

  disableVimMode() {
    if (this.vimMode) {
      this.vimMode.dispose()
      this.vimMode = null
    }
  }

  @Watch('sharedState.vimModeEnabled')
  updateVimMode(value: boolean) {
    if (value) {
      this.enableVimMode()
    } else {
      this.disableVimMode()
    }
  }

  @Watch('sharedState.theme')
  updateTheme(value: string) {
    monaco.editor.setTheme(this.theme)
  }
}
</script>
