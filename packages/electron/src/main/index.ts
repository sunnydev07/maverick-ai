import { app, BrowserWindow, ipcMain } from 'electron'
import Store from 'electron-store'
import { SettingsSchema, SaveSettingsResponseSchema, TestWorkerUrlResponseSchema, TestHotkeyResponseSchema } from '../shared/ipc-types'
import path from 'path'

// Initialize electron-store with schema validation
const store = new Store({
  schema: {
    settings: {
      type: 'object',
      properties: {
        provider: { type: 'string', enum: ['ollama', 'openrouter', 'claude', 'gemini'], default: 'ollama' },
        modelName: { type: 'string', default: 'llama2' },
        workerUrl: { type: 'string', default: 'http://localhost:8787' },
        hotkeyCombo: { type: 'string', default: 'Alt+Space' },
        ttsVoice: { type: 'string', default: 'default' },
        screenshotMode: { type: 'string', enum: ['full', 'active', 'region'], default: 'full' },
        conversationMemory: { type: 'string', enum: ['session', 'saved'], default: 'session' },
      },
    },
  },
})

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  })

  const isDev = process.env.VITE_DEV_SERVER_URL
  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// IPC Handlers

// Save Settings
ipcMain.handle('save-settings', async (_event, settings) => {
  try {
    const validated = SettingsSchema.parse(settings)
    store.set('settings', validated)
    
    const response = SaveSettingsResponseSchema.parse({
      success: true,
      message: 'Settings saved successfully',
    })
    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const response = SaveSettingsResponseSchema.parse({
      success: false,
      message: `Failed to save settings: ${errorMessage}`,
    })
    return response
  }
})

// Load Settings
ipcMain.handle('load-settings', async () => {
  try {
    const settings = store.get('settings')
    return settings || null
  } catch (error) {
    console.error('Failed to load settings:', error)
    return null
  }
})

// Test Worker URL
ipcMain.handle('test-worker-url', async (_event, { url }) => {
  try {
    const response = await fetch(`${url}/health`, { timeout: 5000 })
    if (response.ok) {
      return TestWorkerUrlResponseSchema.parse({
        success: true,
        message: 'Worker URL is reachable',
      })
    } else {
      return TestWorkerUrlResponseSchema.parse({
        success: false,
        message: `Worker returned status ${response.status}`,
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return TestWorkerUrlResponseSchema.parse({
      success: false,
      message: `Failed to reach worker: ${errorMessage}`,
    })
  }
})

// Test Hotkey
ipcMain.handle('test-hotkey', async (_event, { combo }) => {
  try {
    // For now, just validate the format
    // In Phase 3+, we'll check for conflicts with registered hotkeys
    if (!combo || combo.trim().length === 0) {
      return TestHotkeyResponseSchema.parse({
        success: false,
        message: 'Hotkey combination cannot be empty',
        conflict: false,
      })
    }

    return TestHotkeyResponseSchema.parse({
      success: true,
      message: 'Hotkey combination is valid',
      conflict: false,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return TestHotkeyResponseSchema.parse({
      success: false,
      message: `Failed to validate hotkey: ${errorMessage}`,
      conflict: false,
    })
  }
})

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})

export { store }
