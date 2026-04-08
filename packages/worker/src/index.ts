import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { LLMRequestSchema, TranscriptionRequestSchema, TTSRequestSchema } from './schemas'
import { getProvider } from './providers'

type Env = {
  Bindings: {
    OLLAMA_BASE_URL: string
    OPENROUTER_API_KEY: string
    ANTHROPIC_API_KEY: string
    GOOGLE_API_KEY: string
  }
  Variables: {
    provider: string
  }
}

const app = new Hono<Env>()

// CORS middleware
app.use(
  '*',
  cors({
    origin: ['tauri://localhost', 'http://localhost:*'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization']
  })
)

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', version: '0.1.0' })
})

// LLM endpoint
app.post('/llm', async (c) => {
  try {
    const body = await c.req.json()

    // Validate request
    const parsed = LLMRequestSchema.parse(body)

    // Determine provider
    const providerName = parsed.provider || 'ollama'
    const provider = getProvider(providerName)

    // Call provider
    const response = await provider.call(parsed, c.env)

    return c.json({
      success: true,
      data: response
    })
  } catch (error) {
    console.error('/llm error:', error)

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'LLM_ERROR'
      },
      { status: 400 }
    )
  }
})

// Transcription endpoint (placeholder - requires audio processing library)
app.post('/transcribe', async (c) => {
  try {
    const body = await c.req.json()

    // Validate request
    const parsed = TranscriptionRequestSchema.parse(body)

    // Phase 2: Integrate with Whisper API or local transcriber
    // For now, return placeholder response
    return c.json({
      success: true,
      data: {
        text: '[Transcription placeholder - Phase 2]',
        confidence: 0.95
      }
    })
  } catch (error) {
    console.error('/transcribe error:', error)

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'TRANSCRIPTION_ERROR'
      },
      { status: 400 }
    )
  }
})

// Text-to-Speech endpoint (placeholder)
app.post('/speak', async (c) => {
  try {
    const body = await c.req.json()

    // Validate request
    const parsed = TTSRequestSchema.parse(body)

    // Phase 2: Integrate with ElevenLabs, OpenAI, or Windows SAPI
    // For now, return placeholder response
    return c.json({
      success: true,
      data: {
        audio_data: '', // base64 encoded audio
        duration_ms: 0
      }
    })
  } catch (error) {
    console.error('/speak error:', error)

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'TTS_ERROR'
      },
      { status: 400 }
    )
  }
})

// 404 handler
app.all('*', (c) => {
  return c.json(
    {
      success: false,
      error: 'Not found',
      code: 'NOT_FOUND'
    },
    { status: 404 }
  )
})

export default app
