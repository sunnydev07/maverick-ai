import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import path from 'path'
import isDev from 'electron-is-dev'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  })

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../renderer/index.html')}`

  mainWindow.loadURL(startUrl)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// IPC Handlers (placeholder for Phase 2)
ipcMain.handle('settings:get', async () => {
  // Phase 2: Load from electron-store
  return {}
})

ipcMain.handle('settings:save', async (_, settings) => {
  // Phase 2: Save to electron-store
  return true
})
