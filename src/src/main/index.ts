import { app, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerIpc } from './ipc'

const WIDTH = 440
const HEIGHT = 560

function createIsland(): BrowserWindow {
  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize

  const win = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    x: Math.round((screenWidth - WIDTH) / 2),
    y: 0,
    frame: false,
    transparent: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Level paling atas, di atas aplikasi fullscreen biasa
  win.setAlwaysOnTop(true, 'screen-saver')
  // Default: klik tembus, tapi mousemove tetap dikirim ke renderer
  win.setIgnoreMouseEvents(true, { forward: true })

  ipcMain.on('island:set-ignore-mouse', (_e, ignore: boolean) => {
    win.setIgnoreMouseEvents(ignore, { forward: true })
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.todoland')

  // F12 untuk DevTools saat development
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpc()
  createIsland()
})

app.on('window-all-closed', () => app.quit())
