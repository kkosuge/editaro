import { app, autoUpdater, dialog } from 'electron'

const isProduction = process.env.NODE_ENV === 'production'

if (isProduction) {
  autoUpdater.on('error', err => console.log(err))
  autoUpdater.on('checking-for-update', () =>
    console.log('checking-for-update')
  )
  autoUpdater.on('update-available', () => console.log('update-available'))
  autoUpdater.on('update-not-available', () =>
    console.log('update-not-available')
  )

  autoUpdater.on('update-downloaded', () => {
    console.log('update-downloaded')
    const dialogIndex = dialog.showMessageBox({
      message: 'アップデートあり',
      detail: '再起動してインストールできます。',
      buttons: ['再起動', '後で'],
    })
    if (dialogIndex === 0) {
      autoUpdater.quitAndInstall()
    }
  })

  const server = 'https://hazel-server-xxghwkeqyz.now.sh'
  const feed = `${server}/update/${process.platform}/${app.getVersion()}`
  autoUpdater.setFeedURL({ url: feed })
  autoUpdater.checkForUpdates()
}
