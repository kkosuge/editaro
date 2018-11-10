'use strict'

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  clipboard,
  shell,
  Menu
} from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import {
  createProtocol,
  installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib'
import './updator'

const isDevelopment = process.env.NODE_ENV !== 'production'
if (isDevelopment) {
  // Don't load any native (external) modules until the following line is run:
  require('module').globalPaths.push(process.env.NODE_MODULES_PATH)
}
// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: any

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true })
function createMainWindow() {
  const window = new BrowserWindow({
    width: 600,
    height: 400,
    titleBarStyle: 'hidden',
    alwaysOnTop: false
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
        slashes: true
      })
    )
  }

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

  // Menus
  const menuTemplate: any[] = []

  if (process.platform === 'darwin') {
    menuTemplate.push(
      {
        label: app.getName(),
        submenu: [
          {
            label: 'Preferences',
            accelerator: 'CmdOrCtrl+,',
            click: () => {
              if (mainWindow) mainWindow.webContents.send('showPreferences')
            }
          },
          {
            type: 'separator'
          },
          {
            role: 'quit'
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Reload',
            accelerator: 'Command+R',
            click: function() {
              mainWindow.reload()
            }
          },
          {
            label: 'Close',
            accelerator: 'Command+W',
            click: function() {
              mainWindow.close()
            }
          },
          {
            label: 'Toggle Full Screen',
            accelerator: 'Ctrl+Command+F',
            click: function() {
              mainWindow.setFullScreen(!mainWindow.isFullScreen())
            }
          },
          {
            label: 'Toggle Developer Tools',
            accelerator: 'Alt+Command+I',
            click: function() {
              mainWindow.toggleDevTools()
            }
          }
        ]
      }
    )
  }

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

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
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
