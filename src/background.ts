'use strict'

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  clipboard,
  shell,
  Menu,
} from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import {
  createProtocol,
  installVueDevtools,
} from 'vue-cli-plugin-electron-builder/lib'
import './updator'

const isDevelopment = process.env.NODE_ENV !== 'production'
if (isDevelopment) {
  // Don't load any native (external) modules until the following line is run:
  require('module').globalPaths.push(process.env.NODE_MODULES_PATH)
}
// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: any

let isForceQuit: boolean
let position: number[]
let size: number[]

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true })
function createMainWindow() {
  if (!size) {
    size = [600, 400]
  }
  const window = new BrowserWindow({
    width: size[0],
    height: size[1],
    titleBarStyle: 'hidden',
    alwaysOnTop: false,
  })

  if (isDevelopment) {
    // Load the url of the dev server if in development mode
    window.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    //if (!process.env.IS_TEST) window.webContents.openDevTools()
  } else {
    createProtocol('app')
    //   Load the index.html when not in development
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      })
    )
  }

  if (position) {
    window.setPosition(position[0], position[1])
  }

  window.on('close', event => {
    if (!isForceQuit) {
      event.preventDefault()
      app.hide()
    }
  })

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  window.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  window.on('move', () => {
    position = window.getPosition()
  })

  window.on('resize', () => {
    size = window.getSize()
  })

  // Menus
  const menuTemplate: any[] = []

  menuTemplate.push(
    {
      label: app.getName(),
      submenu: [
        {
          label: 'Preferences',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('showPreferences')
          },
        },
        {
          type: 'separator',
        },
        {
          role: 'quit',
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: function() {
            if (mainWindow) mainWindow.reload()
          },
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click: function() {
            if (mainWindow) mainWindow.close()
          },
        },
        {
          label: 'Toggle Full Screen',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
          click: function() {
            if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen())
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator:
            process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: function() {
            if (mainWindow) mainWindow.toggleDevTools()
          },
        },
        {
          label: 'Open Command Palette',
          accelerator:
            process.platform === 'darwin' ? 'Cmd+Shift+P' : 'Ctrl+Shift+P',
          click: function() {
            if (mainWindow) mainWindow.webContents.send('openCommandPalette')
          },
        },
      ],
    },
    {
      label: 'Text',
      submenu: [
        {
          label: 'Increase Font Size',
          accelerator: 'CmdOrCtrl+Plus',
          click: function() {
            if (mainWindow) mainWindow.webContents.send('increaseFontSize')
          },
        },
        {
          label: 'Decrease Font Size',
          accelerator: 'CmdOrCtrl+-',
          click: function() {
            if (mainWindow) mainWindow.webContents.send('decreaseFontSize')
          },
        },
      ],
    }
  )

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (process.platform !== 'darwin') {
    isForceQuit = true
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (process.platform === 'darwin') {
    app.show()
  }
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    await installVueDevtools()
  }
  mainWindow = createMainWindow()
})

ipcMain.on('alwaysOnTop', (event: any, arg: boolean) => {
  mainWindow.setAlwaysOnTop(arg)
})

// Command|Ctrl + C でのコピー時に text/html のデータをクリップボードに書き込まないようにしたいため
// setTimeout を挟まないと、レンダラープロセス側のデータが採用されてしまう
ipcMain.on('copy', (event: any, arg: string) => {
  setTimeout(() => {
    clipboard.writeText(arg)
  }, 200)
})
