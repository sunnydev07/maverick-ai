import { globalShortcut, BrowserWindow } from 'electron'

export class HotkeyManager {
  private mainWindow: BrowserWindow | null = null
  private currentHotkey: string = 'alt+space'
  private isCapturing: boolean = false

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }

  /**
   * Register global hotkey for screen capture
   */
  registerHotkey(hotkey: string = 'alt+space') {
    // Unregister previous hotkey if it exists
    if (this.currentHotkey && this.currentHotkey !== hotkey) {
      this.unregisterHotkey(this.currentHotkey)
    }

    // Normalize hotkey format (convert to electron format)
    const normalizedHotkey = this.normalizeHotkey(hotkey)

    try {
      const success = globalShortcut.register(normalizedHotkey, () => {
        this.handleHotkeyPress()
      })

      if (success) {
        this.currentHotkey = normalizedHotkey
        console.log(`[v0] Global hotkey registered: ${normalizedHotkey}`)
        return true
      } else {
        console.warn(`[v0] Failed to register hotkey: ${normalizedHotkey} (already in use by another app)`)
        return false
      }
    } catch (error) {
      console.error(`[v0] Error registering hotkey: ${error}`)
      return false
    }
  }

  /**
   * Unregister global hotkey
   */
  unregisterHotkey(hotkey?: string) {
    const target = hotkey || this.currentHotkey

    try {
      globalShortcut.unregister(target)
      console.log(`[v0] Hotkey unregistered: ${target}`)
    } catch (error) {
      console.error(`[v0] Error unregistering hotkey: ${error}`)
    }
  }

  /**
   * Handle hotkey press - starts capture
   */
  private handleHotkeyPress() {
    if (this.isCapturing) {
      console.log('[v0] Hotkey pressed during capture, ignoring')
      return
    }

    console.log('[v0] Capture hotkey pressed')

    if (this.mainWindow) {
      // Show window if hidden
      if (!this.mainWindow.isVisible()) {
        this.mainWindow.show()
      }

      // Trigger capture event
      this.mainWindow.webContents.send('capture:start')
    }
  }

  /**
   * Normalize hotkey format from user input to Electron format
   * User format: "Ctrl+Alt+A" -> Electron format: "ctrl+alt+a"
   */
  private normalizeHotkey(hotkey: string): string {
    return hotkey
      .toLowerCase()
      .split('+')
      .map((key) => {
        const keyMap: Record<string, string> = {
          'command': 'cmd',
          'meta': 'cmd',
          'windows': 'super',
          'option': 'alt',
          ' ': 'space'
        }
        return keyMap[key.trim()] || key.trim()
      })
      .join('+')
  }

  /**
   * Set capture state (prevents duplicate triggers)
   */
  setCapturingState(isCapturing: boolean) {
    this.isCapturing = isCapturing
  }

  /**
   * Get current hotkey
   */
  getCurrentHotkey(): string {
    return this.currentHotkey
  }

  /**
   * Check if hotkey is registered
   */
  isHotkeyRegistered(): boolean {
    return globalShortcut.isRegistered(this.currentHotkey)
  }

  /**
   * Cleanup: unregister all hotkeys
   */
  cleanup() {
    globalShortcut.unregisterAll()
    console.log('[v0] All hotkeys unregistered')
  }
}
