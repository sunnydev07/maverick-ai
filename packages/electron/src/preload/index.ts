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
}

// Expose API to renderer process
contextBridge.exposeInMainWorld('electronAPI', ipcApi)

// Type declaration for window.electronAPI
declare global {
  interface Window {
    electronAPI: typeof ipcApi
  }
}
