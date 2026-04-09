export async function synthesizeText(text: string, voice: string, env: any): Promise<string> {
  const apiKey = env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured for TTS')
  }

  try {
    // Map voice to OpenAI voice options
    const voiceMap: Record<string, string> = {
      'en-US': 'onyx',
      'en-GB': 'nova',
      'fr-FR': 'fable'
    }
    const openaiVoice = voiceMap[voice] || 'onyx'

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: openaiVoice,
        response_format: 'mp3'
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI TTS API error: ${response.statusText}`)
    }

    // Convert audio stream to base64
    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    let binary = ''
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i])
    }
    return btoa(binary)
  } catch (error) {
    console.error('TTS synthesis error:', error)
    throw new Error(`Failed to synthesize speech: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
