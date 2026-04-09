export class AudioPlayer {
  private audioContext: AudioContext | null = null
  private source: AudioBufferAudioNode | null = null
  private isPlaying: boolean = false
  private onPlaybackEnd: (() => void) | null = null

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }

  async playAudio(audioBase64: string, onPlaybackEnd?: () => void): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized')
    }

    this.onPlaybackEnd = onPlaybackEnd || null

    try {
      // Decode base64 to binary
      const binaryString = atob(audioBase64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // Decode audio data
      const audioData = await this.audioContext.decodeAudioData(bytes.buffer)

      // Create source and play
      this.source = this.audioContext.createBufferSource()
      this.source.buffer = audioData
      this.source.connect(this.audioContext.destination)

      this.isPlaying = true

      this.source.onended = () => {
        this.isPlaying = false
        if (this.onPlaybackEnd) {
          this.onPlaybackEnd()
        }
      }

      this.source.start(0)
    } catch (error) {
      console.error('[v0] Audio playback error:', error)
      throw new Error(`Failed to play audio: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  stop(): void {
    if (this.source && this.isPlaying) {
      this.source.stop()
      this.isPlaying = false
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying
  }

  getAnalyser(): AnalyserNode | null {
    if (!this.audioContext || !this.source) {
      return null
    }

    const analyser = this.audioContext.createAnalyser()
    this.source.connect(analyser)
    analyser.connect(this.audioContext.destination)
    return analyser
  }
}
