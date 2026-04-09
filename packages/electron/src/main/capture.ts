import { screen, desktopCapturer, BrowserWindow } from 'electron'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

export interface CaptureResult {
  screenshotPath: string
  screenshotBase64: string
  audioPath?: string
  audioBase64?: string
  timestamp: number
  mode: 'full' | 'active' | 'region'
}

export class CaptureManager {
  private mainWindow: BrowserWindow | null = null
  private tempDir: string = path.join(__dirname, '../../temp')
  private isRecording: boolean = false

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.ensureTempDir()
  }

  /**
   * Ensure temp directory exists
   */
  private ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true })
    }
  }

  /**
   * Capture screenshot based on mode
   */
  async captureScreenshot(mode: 'full' | 'active' | 'region' = 'full'): Promise<string> {
    try {
      console.log(`[v0] Starting screenshot capture: ${mode}`)

      let bounds = this.getCaptureBounds(mode)
      if (!bounds) {
        throw new Error('Failed to determine capture bounds')
      }

      // Use desktopCapturer to get screenshot
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 0, height: 0 }
      })

      if (!sources || sources.length === 0) {
        throw new Error('No screen sources available')
      }

      // Get the primary display
      const primaryDisplay = screen.getPrimaryDisplay()
      const { x, y, width, height } = bounds

      console.log(`[v0] Capturing region: x=${x}, y=${y}, width=${width}, height=${height}`)

      // Capture the screen region
      const image = await desktopCapturer
        .getSources({ types: ['screen'] })
        .then((sources) => sources[0]?.thumbnail)

      if (!image) {
        throw new Error('Failed to capture screen')
      }

      // Convert to JPEG and save
      const screenshotPath = path.join(this.tempDir, `screenshot-${Date.now()}.jpg`)

      // Use sharp to resize/crop if needed and convert to JPEG
      await sharp(image.toPNG())
        .extract({
          left: x,
          top: y,
          width: Math.min(width, image.getWidth()),
          height: Math.min(height, image.getHeight())
        })
        .jpeg({ quality: 85, progressive: true })
        .toFile(screenshotPath)

      console.log(`[v0] Screenshot saved to: ${screenshotPath}`)

      // Convert to base64
      const screenshotBase64 = fs.readFileSync(screenshotPath, 'base64')

      return screenshotPath
    } catch (error) {
      console.error(`[v0] Screenshot capture error: ${error}`)
      throw error
    }
  }

  /**
   * Get capture bounds based on mode
   */
  private getCaptureBounds(mode: 'full' | 'active' | 'region'): { x: number; y: number; width: number; height: number } | null {
    try {
      if (mode === 'full') {
        const primaryDisplay = screen.getPrimaryDisplay()
        return primaryDisplay.bounds
      } else if (mode === 'active') {
        // Get active window bounds (if available)
        if (this.mainWindow) {
          const bounds = this.mainWindow.getBounds()
          return bounds
        }
        // Fallback to full screen
        return screen.getPrimaryDisplay().bounds
      } else if (mode === 'region') {
        // For region mode, return full screen and let UI handle selection
        return screen.getPrimaryDisplay().bounds
      }
    } catch (error) {
      console.error(`[v0] Error getting capture bounds: ${error}`)
      return null
    }
  }

  /**
   * Start audio recording (placeholder for Phase 6)
   */
  async startAudioRecording(): Promise<void> {
    try {
      console.log('[v0] Starting audio recording')
      this.isRecording = true

      // Phase 6: Integrate with actual audio recording
      // For now, just set flag
      if (this.mainWindow) {
        this.mainWindow.webContents.send('audio:recording', {
          status: 'recording',
          timestamp: Date.now()
        })
      }
    } catch (error) {
      console.error(`[v0] Audio recording error: ${error}`)
      this.isRecording = false
      throw error
    }
  }

  /**
   * Stop audio recording (placeholder for Phase 6)
   */
  async stopAudioRecording(): Promise<string | null> {
    try {
      console.log('[v0] Stopping audio recording')
      this.isRecording = false

      if (this.mainWindow) {
        this.mainWindow.webContents.send('audio:recording', {
          status: 'stopped',
          timestamp: Date.now()
        })
      }

      // Phase 6: Return actual audio file path
      return null
    } catch (error) {
      console.error(`[v0] Error stopping audio recording: ${error}`)
      throw error
    }
  }

  /**
   * Complete capture flow: screenshot + audio
   */
  async performCapture(mode: 'full' | 'active' | 'region' = 'full'): Promise<CaptureResult> {
    try {
      console.log('[v0] Starting complete capture flow')

      // Start audio recording
      await this.startAudioRecording()

      // Give user time to speak (3 seconds by default, can be customized)
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Stop audio and capture screenshot
      const [screenshotPath, audioPath] = await Promise.all([
        this.captureScreenshot(mode),
        this.stopAudioRecording()
      ])

      // Read files and convert to base64
      const screenshotBase64 = fs.readFileSync(screenshotPath, 'base64')
      const audioBase64 = audioPath ? fs.readFileSync(audioPath, 'base64') : undefined

      const result: CaptureResult = {
        screenshotPath,
        screenshotBase64,
        audioPath,
        audioBase64,
        timestamp: Date.now(),
        mode
      }

      console.log('[v0] Capture complete', { mode, timestamp: result.timestamp })

      return result
    } catch (error) {
      console.error(`[v0] Complete capture error: ${error}`)
      this.isRecording = false
      throw error
    }
  }

  /**
   * Cancel ongoing capture
   */
  cancelCapture() {
    console.log('[v0] Capture cancelled')
    this.isRecording = false

    if (this.mainWindow) {
      this.mainWindow.webContents.send('capture:cancelled', {
        timestamp: Date.now()
      })
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanup() {
    try {
      if (fs.existsSync(this.tempDir)) {
        const files = fs.readdirSync(this.tempDir)
        for (const file of files) {
          fs.unlinkSync(path.join(this.tempDir, file))
        }
      }
      console.log('[v0] Temporary files cleaned up')
    } catch (error) {
      console.error(`[v0] Error cleaning up temp files: ${error}`)
    }
  }

  /**
   * Get recording status
   */
  isRecordingNow(): boolean {
    return this.isRecording
  }
}
