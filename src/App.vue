<template>
  <div id="app">
    <div class='draggable-title-bar'></div>
    <div class='main'>
      <div class="editor-wrapper">
        <div id='editor' ref='editor'></div>
      </div>
    </div>
    <div class='nav-bar'>
      <div class='nav-bar-item'>
        {{ this.textLength }}
      </div>
      <div class='nav-bar-item'>
        <select v-model='language' @change='changeLanguage'>
          <option v-for='lang in languages' :value='lang.value' :key='lang.value'>
            {{ lang.text }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import * as monaco from 'monaco-editor'
import languages from './lib/languages'
import './assets/style.sass'

@Component
export default class App extends Vue {
  editor?: monaco.editor.IStandaloneCodeEditor
  editorModel?: monaco.editor.ITextModel
  el?: HTMLElement
  languages = languages
  language = 'markdown'
  textLength = 0

  editorOption: monaco.editor.IEditorConstructionOptions = {
    theme: 'vs-dark',
    lineNumbers: 'off',
    automaticLayout: true,
    autoIndent: true,
    fontSize: 14,
    language: this.language,
    minimap: {
      enabled: false
    }
  }

  mounted() {
    this.el = this.$refs.editor as HTMLElement
    this.editor = monaco.editor.create(this.el, this.editorOption)
    this.editorModel = monaco.editor.createModel('', this.language)
    this.editor.setModel(this.editorModel)

    this.editorModel.onDidChangeContent(() => {
      if (this.editorModel) {
        this.textLength = Array.from(this.editorModel.getValue()).length
      }
    })
  }

  changeLanguage() {
    if (this.editorModel) {
      monaco.editor.setModelLanguage(this.editorModel, this.language)
    }
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
  background: $base-color
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
  padding-top: 30px
  height: calc(100vh - 84px)
.nav-bar
  display: flex
  justify-content: flex-end
  font-size: 12px
  color: $nav-bar-color
  line-height: 22px
  .nav-bar-item
    margin-left: 6px
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
