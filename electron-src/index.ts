import { join } from 'path'
import { format } from 'url'

import {
  BrowserWindow,
  app,
  ipcMain,
  IpcMainEvent,
  nativeImage,
  MenuItemConstructorOptions,
  Menu
} from 'electron'
import isDev from 'electron-is-dev'
import prepareNext from 'electron-next'
import { autoUpdater } from 'electron-updater'

app.on('ready', async () => {
  await prepareNext('./renderer')

  autoUpdater.checkForUpdatesAndNotify()

  const icon = nativeImage.createFromPath(`${app.getAppPath()}/build/icon.png`)

  if (app.dock) {
    app.dock.setIcon(icon)
  }

  const template: MenuItemConstructorOptions[] = [
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      preload: join(__dirname, 'preload.js')
    }
  })

  const url = isDev
    ? 'http://localhost:8000/'
    : format({
        pathname: join(__dirname, '../renderer/out/index.html'),
        protocol: 'file:',
        slashes: true
      })

  mainWindow.loadURL(url)
})

app.on('window-all-closed', app.quit)

ipcMain.on('message', (event: IpcMainEvent, message: string) => {
  event.sender.send('message', message)
})
