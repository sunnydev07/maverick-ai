import { Tray, Menu, app, BrowserWindow } from 'electron'
import path from 'path'

export class TrayManager {
  private tray: Tray | null = null
  private mainWindow: BrowserWindow | null = null

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }

  /**
   * Initialize the system tray with context menu
   */
  createTray() {
    // Create tray icon (simple blue square as placeholder)
    const iconPath = path.join(__dirname, '../assets/tray-icon.png')
    
    try {
      this.tray = new Tray(iconPath)
    } catch (error) {
      console.error('[v0] Failed to create tray with icon, using fallback:', error)
      // Fallback: create a minimal tray without icon
      this.tray = new Tray(path.join(__dirname, '../assets/tray-icon-fallback.png'))
    }

    // Set tray tooltip
    this.tray.setToolTip('Maverick AI - Press Alt+Space to capture')

    // Create context menu
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open Settings',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.show()
            this.mainWindow.focus()
          }
        }
      },
      {
        label: 'Capture Now',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.webContents.send('capture:start')
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Show',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.show()
            this.mainWindow.focus()
          }
        }
      },
      {
        label: 'Hide',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.hide()
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit()
        }
      }
    ])

    // Set context menu
    this.tray.setContextMenu(contextMenu)

    // Left-click to show/hide window
    this.tray.on('click', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isVisible()) {
          this.mainWindow.hide()
        } else {
          this.mainWindow.show()
          this.mainWindow.focus()
        }
      }
    })

    // Double-click to show
    this.tray.on('double-click', () => {
      if (this.mainWindow) {
        this.mainWindow.show()
        this.mainWindow.focus()
      }
    })

    return this.tray
  }

  /**
   * Show a notification in the tray
   */
  showNotification(title: string, message: string) {
    if (this.tray) {
      this.tray.displayBalloon({
        title,
        content: message,
        iconType: 'info'
      })
    }
  }

  /**
   * Update tray tooltip
   */
  setToolTip(tooltip: string) {
    if (this.tray) {
      this.tray.setToolTip(tooltip)
    }
  }

  /**
   * Destroy tray
   */
  destroy() {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
  }
}
