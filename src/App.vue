<template>
  <div id='app'>
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
import './lib/theme/jj-dark'
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
  lineCount = 1
  alwaysOnTop = false

  editorOption: monaco.editor.IEditorConstructionOptions = {
    theme: 'jj-dark',
    lineNumbers: 'off',
    automaticLayout: true,
    autoIndent: true,
    fontSize: 13,
    language: this.language,
    wordWrap: 'on',
    lineDecorationsWidth: 0,
    minimap: {
      enabled: false
    }
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

  changeAlwaysOnTop() {
    ipcRenderer.send('alwaysOnTop', this.alwaysOnTop)
  }

  toggleAlwaysOnTop() {
    this.alwaysOnTop = !this.alwaysOnTop
    ipcRenderer.send('alwaysOnTop', this.alwaysOnTop)
  }
}
</script>

<style lang='sass'>
$base-color: #1e1e1e
$border-color: #454545
$nav-bar-color: #c1c1c1
#app
  font-family: 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  color: #2c3e50
  height: 100%
  text-align: left
.draggable-title-bar
  z-index: 1000
  position: fixed
  top: 0
  left: 0
  height: 22px
  width: 100%
  background: #333
  -webkit-app-region: drag
.main
  position: relative
  height: 100%
.nav-bar
  z-index: 1000
  position: fixed
  bottom: 0
  left: 0
  height: 22px
  width: 100%
  background: $base-color
  border-top: 1px solid $border-color
  -webkit-app-region: drag
.editor-wrapper
  width: 100%
  height: 100%
#editor
  padding-top: 22px
  height: calc(100vh - 67px)
.nav-bar
  display: flex
  justify-content: flex-end
  font-size: 12px
  color: $nav-bar-color
  line-height: 22px
  &-left
    margin-left: 6px
    display: flex
  &-right
    margin-left: auto
    display: flex
  &-item
    margin-left: 10px
  &-item-checkbox
    margin-left: 2px
    cursor: pointer
    user-select: none
  .pretty
    padding-top: 4px
    margin-left: 4px
  .pretty .state label:before
    top: 3px
  .pretty .state label:after
    top: 3px
select
  -webkit-appearance: none
  appearance: none
  border-radius: 0
  border: 0
  margin: 0
  padding: 2px 4px
  background: none transparent
  color: $nav-bar-color
  border-radius: 4px
  box-sizing: content-box
</style>
