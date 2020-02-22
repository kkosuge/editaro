<template>
  <div id="app" :class="`theme-${this.persisted.theme}`">
    <div class="draggable-title-bar"></div>
    <div class="main">
      <div class="editor-wrapper">
        <div id="editor" ref="editor"></div>
      </div>
    </div>
    <div class="nav-bar">
      <div class="nav-bar-left">
        <div
          class="nav-bar-item vim-status-bar"
          v-show="vimMode"
          ref="vimStatusBar"
        ></div>
        <div class="nav-bar-item">Characters: {{ this.textLength }}</div>
        <div class="nav-bar-item">Lines: {{ this.lineCount }}</div>
      </div>
      <div class="nav-bar-right">
        <div class="nav-bar-item nav-bar-item-select">
          <select v-model="persisted.language">
            <option
              v-for="lang in languages"
              :value="lang.value"
              :key="lang.value"
              >{{ lang.text }}</option
            >
          </select>
        </div>
        <div class="nav-bar-item nav-bar-item-checkbox">
          <span @click="toggleAlwaysOnTop">Always on top:</span>
          <div class="pretty p-default p-curve">
            <input
              type="checkbox"
              id="checkbox"
              v-model="alwaysOnTop"
              @change="changeAlwaysOnTop"
            />
            <div class="state">
              <label for="checkbox"></label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Preferences v-if="memory.showPreferences"></Preferences>
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron'
import { Component, Vue, Watch } from 'vue-property-decorator'
import * as monaco from 'monaco-editor'
import './lib/theme/editaro'
import './lib/theme/editaro-wave'
import './lib/theme/dark'
import './lib/theme/light'
import './lib/theme/vscode'
import './lib/theme/dark-grad'
import './lib/theme/light-grad'
import './lib/theme/aesthetic'
import './lib/theme/aesthetic-wave'
import themes from './lib/theme/themes'
import languages from './lib/languages'
import './assets/style.scss'
import { initVimMode } from 'monaco-vim'
import Preferences from './components/Preferences.vue'
import store, { IEditorMode } from './store'

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
  textLength = 0
  themes = themes
  lineCount = 1
  alwaysOnTop = false
  vimMode?: any = null
  _unwatch: any

  mounted() {
    this._unwatch = store.persistedStore.watch(this, 'persisted')
    this.el = this.$refs.editor as HTMLElement
    this.editor = monaco.editor.create(this.el, this.defaultEditorOptions())
    this.editorModel = monaco.editor.createModel(
      this.persisted.text,
      this.persisted.language
    )
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

    ipcRenderer.on('showPreferences', () => {
      this.memory.showPreferences = true
    })

    ipcRenderer.on('increaseFontSize', () => {
      this.persisted.fontSize += 1
    })

    ipcRenderer.on('decreaseFontSize', () => {
      this.persisted.fontSize -= 1
    })

    ipcRenderer.on('openCommandPalette', () => {
      if (this.editor)
        this.editor.trigger('App', 'editor.action.quickCommand', null)
    })

    this.updateEditorMode(this.persisted.editorMode)

    window.addEventListener(
      'keydown',
      event => {
        if (event.key === 'Escape') {
          this.memory.showPreferences = false
        }
      },
      true
    )
  }

  beforeDestroy() {
    this._unwatch()
  }

  defaultEditorOptions(): monaco.editor.IEditorConstructionOptions {
    let options: monaco.editor.IEditorConstructionOptions = {
      theme: this.persisted.theme,
      lineNumbers: 'off',
      automaticLayout: true,
      autoIndent: true,
      fontSize: this.persisted.fontSize,
      language: this.persisted.language,
      wordWrap: 'on',
      lineDecorationsWidth: 0,
      minimap: {
        enabled: false,
      },
    }

    if (this.persisted.fontFamily.length) {
      options.fontFamily = this.persisted.fontFamily
    }
    return options
  }

  updateEditorModelData() {
    if (this.editorModel) {
      const text = this.editorModel.getValue()
      this.persisted.text = text
      this.textLength = Array.from(text).length
      this.lineCount = this.editorModel.getLineCount()
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

  @Watch('persisted.editorMode')
  updateEditorMode(value: IEditorMode) {
    if (this.persisted.editorMode === 'vim') {
      this.enableVimMode()
    } else {
      this.disableVimMode()
    }
  }

  @Watch('persisted.theme')
  updateTheme(value: string) {
    monaco.editor.setTheme(this.persisted.theme)
  }

  @Watch('persisted.language')
  updateLanguage(value: string) {
    if (this.editorModel) {
      monaco.editor.setModelLanguage(this.editorModel, this.persisted.language)
    }
  }

  @Watch('persisted.fontSize')
  updateFontSize(value: number) {
    if (this.editor) {
      this.editor.updateOptions({ fontSize: this.persisted.fontSize })
    }
  }

  @Watch('persisted.fontFamily')
  updateFontFamily(value: string) {
    if (this.editor) {
      this.editor.updateOptions({ fontFamily: this.persisted.fontFamily })
    }
  }

  @Watch('persisted.tabSize')
  updateTab(value: number) {
    if (this.editorModel) {
      this.editorModel.updateOptions({ tabSize: this.persisted.tabSize })
    }
  }
}
</script>
