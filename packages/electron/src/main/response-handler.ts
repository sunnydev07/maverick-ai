import { BrowserWindow } from 'electron'

export interface CaptureData {
  screenshotBase64: string
  audioBase64: string
  mode: string
  timestamp: number
}

export interface ProcessingState {
  step: 'transcribing' | 'processing' | 'speaking' | 'complete' | 'error'
  message: string
  data?: any
}

export class ResponseHandler {
  private mainWindow: BrowserWindow | null = null
  private workerUrl: string = 'http://localhost:8787'
  private llmSettings: any = {}

  constructor(mainWindow: BrowserWindow | null, workerUrl: string, llmSettings: any) {
    this.mainWindow = mainWindow
    this.workerUrl = workerUrl
    this.llmSettings = llmSettings
  }

  private sendUpdate(state: ProcessingState) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('response:update', state)
    }
  }

  async processCapture(captureData: CaptureData): Promise<string> {
    try {
      console.log('[v0] Processing capture...')

      // Step 1: Transcribe audio
      this.sendUpdate({
        step: 'transcribing',
        message: 'Transcribing audio...'
      })

      const transcriptResponse = await fetch(`${this.workerUrl}/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: captureData.audioBase64,
          language: 'en'
        })
      })

      if (!transcriptResponse.ok) {
        throw new Error(`Transcription failed: ${transcriptResponse.statusText}`)
      }

      const transcriptData = await transcriptResponse.json()
      const transcript = transcriptData.data?.text || 'Unable to transcribe'

      console.log('[v0] Transcript:', transcript)

      // Step 2: Send to LLM with screenshot
      this.sendUpdate({
        step: 'processing',
        message: 'Processing with AI...'
      })

      const llmResponse = await fetch(`${this.workerUrl}/llm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: this.llmSettings.provider || 'ollama',
          model: this.llmSettings.modelName || 'llama2',
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: `User said: "${transcript}"\n\nThe screenshot shows what they're looking at. Please respond helpfully.`
            }
          ],
          screenshot: captureData.screenshotBase64
        })
      })

      if (!llmResponse.ok) {
        throw new Error(`LLM processing failed: ${llmResponse.statusText}`)
      }

      const llmData = await llmResponse.json()
      const aiResponse = llmData.data?.content || 'No response generated'

      console.log('[v0] AI Response:', aiResponse)

      // Step 3: Synthesize speech
      this.sendUpdate({
        step: 'speaking',
        message: 'Generating speech...'
      })

      const ttsResponse = await fetch(`${this.workerUrl}/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: aiResponse,
          voice: this.llmSettings.ttsVoice || 'en-US'
        })
      })

      if (!ttsResponse.ok) {
        throw new Error(`TTS synthesis failed: ${ttsResponse.statusText}`)
      }

      const ttsData = await ttsResponse.json()
      const audioBase64 = ttsData.data?.audio_data || ''

      // Send audio to player
      this.sendUpdate({
        step: 'complete',
        message: 'Speaking response...',
        data: {
          audio: audioBase64,
          text: aiResponse
        }
      })

      return audioBase64
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[v0] Response processing error:', error)

      this.sendUpdate({
        step: 'error',
        message: `Error: ${errorMessage}`
      })

      throw error
    }
  }
}
