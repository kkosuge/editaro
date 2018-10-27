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
        <div class='nav-bar-item'>
          Characters: {{ this.textLength }}
        </div>
        <div class='nav-bar-item'>
          Lines: {{ this.lineCount }}
        </div>
      </div>
      <div class='nav-bar-right'>
        <div class='nav-bar-item nav-bar-item-select'>
          <select v-model='theme' @change='changeTheme'>
            <option v-for='theme in themes' :value='theme.value' :key='theme.value'>
              {{ theme.text }}
            </option>
          </select>
        </div>
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
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron'
import { Component, Vue } from 'vue-property-decorator'
import * as monaco from 'monaco-editor'
import './lib/theme/dark'
import './lib/theme/light'
import './lib/theme/vscode'
import './lib/theme/dark-grad'
import './lib/theme/light-grad'
import themes from './lib/theme/themes'
import languages from './lib/languages'
import './assets/style.scss'

@Component
export default class App extends Vue {
  editor?: monaco.editor.IStandaloneCodeEditor
  editorModel?: monaco.editor.ITextModel
  el?: HTMLElement
  languages = languages
  language = 'markdown'
  textLength = 0
  theme = 'dark-grad'
  themes = themes
  lineCount = 1
  alwaysOnTop = false

  editorOption: monaco.editor.IEditorConstructionOptions = {
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

  mounted() {
    let defaultText = localStorage.getItem('text')
    if (!defaultText) {
      defaultText = ''
    }
    this.el = this.$refs.editor as HTMLElement
    this.editor = monaco.editor.create(this.el, this.editorOption)
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
    }
  }

  changeTheme() {
    monaco.editor.setTheme(this.theme)
  }

  changeAlwaysOnTop() {
    ipcRenderer.send('alwaysOnTop', this.alwaysOnTop)
  }

  toggleAlwaysOnTop() {
    this.alwaysOnTop = !this.alwaysOnTop
    ipcRenderer.send('alwaysOnTop', this.alwaysOnTop)
  }
}
</script>
