import { app, BrowserWindow, globalShortcut, ipcMain, Menu, screen, Tray } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import trayIcon from '../../resources/icon.png?asset'
import { registerIpc } from './ipc'

const WIDTH = 440
const HEIGHT = 560

let island: BrowserWindow | null = null
let tray: Tray | null = null

function createIsland(): BrowserWindow {
  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize

  island = new BrowserWindow({
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
  island.setAlwaysOnTop(true, 'screen-saver')
  // Default: klik tembus, tapi mousemove tetap dikirim ke renderer
  island.setIgnoreMouseEvents(true, { forward: true })

  island.on('closed', () => {
    island = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    island.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    island.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return island
}

function showIsland(): void {
  if (!island) return
  if (island.isMinimized()) island.restore()
  island.show()
  island.focus()
  island.webContents.send('island:open')
}

function toggleIslandWindow(): void {
  if (!island) return
  if (island.isVisible()) {
    island.hide()
  } else {
    showIsland()
  }
}

function createTray(): void {
  tray = new Tray(trayIcon)
  tray.setToolTip('TodoLand')

  const menu = Menu.buildFromTemplate([
    { label: 'Tampilkan/Sembunyikan', click: toggleIslandWindow },
    {
      label: 'Start on login',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: (item) => app.setLoginItemSettings({ openAtLogin: item.checked })
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ])

  tray.setContextMenu(menu)
  tray.on('click', toggleIslandWindow)
}

function registerShortcut(): void {
  const ok = globalShortcut.register('Control+Shift+Space', () => {
    if (!island) return
    if (!island.isVisible()) island.show()
    island.focus()
    island.webContents.send('island:toggle')
  })

  if (!ok) {
    console.warn(
      '[shortcut] Control+Shift+Space gagal didaftarkan (mungkin dipakai aplikasi lain).'
    )
  }
}

// Hanya boleh ada satu instance TodoLand.
const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', showIsland)

  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.todoland')

    // F12 untuk DevTools saat development
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    ipcMain.on('island:set-ignore-mouse', (_e, ignore: boolean) => {
      island?.setIgnoreMouseEvents(ignore, { forward: true })
    })

    registerIpc()
    createIsland()
    createTray()
    registerShortcut()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createIsland()
      else showIsland()
    })
  })
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
