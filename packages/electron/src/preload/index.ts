import { contextBridge, ipcRenderer } from 'electron'
import type { IpcChannels } from '../shared/ipc-types'

// Type-safe IPC API exposed to renderer
const ipcApi = {
  'save-settings': (settings: IpcChannels['save-settings']['request']) =>
    ipcRenderer.invoke('save-settings', settings),
  
  'load-settings': () =>
    ipcRenderer.invoke('load-settings'),
  
  'test-worker-url': (payload: IpcChannels['test-worker-url']['request']) =>
    ipcRenderer.invoke('test-worker-url', payload),
  
  'test-hotkey': (payload: IpcChannels['test-hotkey']['request']) =>
    ipcRenderer.invoke('test-hotkey', payload),

  // Capture APIs (Phase 4 & 5)
  'capture:start': (payload?: { screenshotMode?: 'full' | 'active' | 'region' }) =>
    ipcRenderer.invoke('capture:start', payload),
  
  'capture:cancel': () =>
    ipcRenderer.invoke('capture:cancel'),
  
  'capture:status': () =>
    ipcRenderer.invoke('capture:status'),

  // Hotkey APIs
  'hotkey:register': (payload: { combo: string }) =>
    ipcRenderer.invoke('hotkey:register', payload),

  // Listen for capture events from main process
  'on': (channel: string, callback: (...args: any[]) => void) => {
    if (['capture:start', 'capture:cancelled', 'audio:recording'].includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args))
    }
  },

  'off': (channel: string, callback: (...args: any[]) => void) => {
    if (['capture:start', 'capture:cancelled', 'audio:recording'].includes(channel)) {
      ipcRenderer.off(channel, (_event, ...args) => callback(...args))
    }
  }
}

// Expose API to renderer process
contextBridge.exposeInMainWorld('electronAPI', ipcApi)

// Type declaration for window.electronAPI
declare global {
  interface Window {
    electronAPI: typeof ipcApi
  }
}
