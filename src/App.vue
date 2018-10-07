<template>
  <div id="app">
    <div class='draggable-title-bar'></div>
    <div class='main'>
      <div class="editor-wrapper">
        <div id='editor' ref='editor'></div>
      </div>
    </div>
    <div class='nav-bar'></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import * as monaco from 'monaco-editor'
import './assets/style.sass'

@Component
export default class App extends Vue {
  editor?: monaco.editor.IStandaloneCodeEditor
  el?: HTMLElement

  editorOption: monaco.editor.IEditorConstructionOptions = {
    theme: 'vs-dark',
    lineNumbers: 'off',
    automaticLayout: true,
    autoIndent: true,
    fontSize: 14,
    language: 'markdown',
    minimap: {
      enabled: false,
    },
  }

  mounted() {
    this.el = this.$refs.editor as HTMLElement
    this.editor = monaco.editor.create(this.el, this.editorOption)
  }
}
</script>

<style lang='sass'>
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
  background: #1e1e1e
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
  background: #1e1e1e
  border-top: 1px solid #454545
  -webkit-app-region: drag
.editor-wrapper
  width: 100%
  height: 100%
#editor
  padding-top: 30px
  height: calc(100vh - 84px)
</style>
