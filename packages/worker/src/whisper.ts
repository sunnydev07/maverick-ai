// Helper function: fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 30000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

// Helper function: retry logic
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)))
      }
    }
  }

  throw lastError
}

export async function transcribeAudio(audioBase64: string, language: string, env: any): Promise<string> {
  const apiKey = env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured for Whisper transcription')
  }

  try {
    // Convert base64 to blob
    const binaryString = atob(audioBase64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: 'audio/wav' })

    // Create FormData
    const formData = new FormData()
    formData.append('file', blob, 'audio.wav')
    formData.append('model', 'whisper-1')
    formData.append('language', language || 'en')

    // Call OpenAI Whisper API
    const response = await withRetry(
      () =>
        fetchWithTimeout('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`
          },
          body: formData
        }),
      3,
      1000
    )

    if (!response.ok) {
      throw new Error(`Whisper API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.text || ''
  } catch (error) {
    console.error('Whisper transcription error:', error)
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
