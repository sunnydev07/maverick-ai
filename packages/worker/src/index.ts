import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ZodError } from 'zod'
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
    requestId: string
    startTime: number
  }
}

const app = new Hono<Env>()
const MAX_BODY_SIZE = 1024 * 1024 // 1MB

// Request ID middleware (for tracing)
app.use('*', async (c, next) => {
  const requestId = crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9)
  c.set('requestId', requestId)
  c.set('startTime', Date.now())

  // Add request ID to response headers
  await next()
  c.header('X-Request-ID', requestId)
})

// CORS middleware
app.use(
  '*',
  cors({
    origin: ['tauri://localhost', 'http://localhost:*', 'file://*'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['X-Request-ID', 'X-Response-Time'],
    credentials: true
  })
)

// Request logging middleware
app.use('*', async (c, next) => {
  console.log(`[${c.get('requestId')}] ${c.req.method} ${c.req.url}`)
  await next()
  const duration = Date.now() - c.get('startTime')
  c.header('X-Response-Time', `${duration}ms`)
  console.log(`[${c.get('requestId')}] Response: ${c.res.status} (${duration}ms)`)
})

// Security headers middleware
app.use('*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('X-XSS-Protection', '1; mode=block')
})

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime?.() || 0
  })
})

// Provider diagnostics endpoint
app.get('/health/providers', async (c) => {
  const diagnostics: Record<string, any> = {}

  // Test each provider's connectivity
  const providers = ['ollama', 'openrouter', 'claude', 'gemini']

  for (const providerName of providers) {
    const startTime = Date.now()
    try {
      const provider = getProvider(providerName)

      // Simple test request
      const testResponse = await provider.call(
        {
          messages: [{ role: 'user', content: 'Hello' }],
          model: 'test',
          temperature: 0.7
        },
        c.env
      )

      const latency = Date.now() - startTime
      diagnostics[providerName] = {
        status: 'ok',
        latency_ms: latency,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      const latency = Date.now() - startTime
      diagnostics[providerName] = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        latency_ms: latency,
        timestamp: new Date().toISOString()
      }
    }
  }

  return c.json({ providers: diagnostics })
})

// LLM endpoint with full validation
app.post('/llm', async (c) => {
  const requestId = c.get('requestId')

  try {
    // Check body size
    const bodyText = await c.req.text()
    if (bodyText.length > MAX_BODY_SIZE) {
      console.warn(`[${requestId}] Request body too large: ${bodyText.length} bytes`)
      return c.json(
        {
          success: false,
          error: 'Request body too large (max 1MB)',
          code: 'PAYLOAD_TOO_LARGE',
          requestId
        },
        { status: 413 }
      )
    }

    // Parse JSON
    let body: any
    try {
      body = JSON.parse(bodyText)
    } catch (e) {
      return c.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
          requestId
        },
        { status: 400 }
      )
    }

    // Validate request against schema
    const parsed = LLMRequestSchema.parse(body)

    // Determine provider
    const providerName = parsed.provider || 'ollama'
    const provider = getProvider(providerName)

    // Call provider
    const response = await provider.call(parsed, c.env)

    return c.json(
      {
        success: true,
        data: response,
        requestId
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(`[${requestId}] /llm error:`, error)

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message
          })),
          requestId
        },
        { status: 400 }
      )
    }

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'LLM_ERROR',
        requestId
      },
      { status: 500 }
    )
  }
})

// Transcription endpoint (placeholder - Phase 4+)
app.post('/transcribe', async (c) => {
  const requestId = c.get('requestId')

  try {
    const bodyText = await c.req.text()
    if (bodyText.length > MAX_BODY_SIZE) {
      return c.json(
        {
          success: false,
          error: 'Request body too large (max 1MB)',
          code: 'PAYLOAD_TOO_LARGE',
          requestId
        },
        { status: 413 }
      )
    }

    const body = JSON.parse(bodyText)
    const parsed = TranscriptionRequestSchema.parse(body)

    console.log(`[${requestId}] Transcription request: ${parsed.language}`)

    // Phase 4: Integrate with Whisper API or local transcriber
    return c.json(
      {
        success: true,
        data: {
          text: '[Transcription placeholder - Phase 4+]',
          confidence: 0.95
        },
        requestId
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(`[${requestId}] /transcribe error:`, error)

    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message
          })),
          requestId
        },
        { status: 400 }
      )
    }

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'TRANSCRIPTION_ERROR',
        requestId
      },
      { status: 500 }
    )
  }
})

// Text-to-Speech endpoint (placeholder - Phase 4+)
app.post('/speak', async (c) => {
  const requestId = c.get('requestId')

  try {
    const bodyText = await c.req.text()
    if (bodyText.length > MAX_BODY_SIZE) {
      return c.json(
        {
          success: false,
          error: 'Request body too large (max 1MB)',
          code: 'PAYLOAD_TOO_LARGE',
          requestId
        },
        { status: 413 }
      )
    }

    const body = JSON.parse(bodyText)
    const parsed = TTSRequestSchema.parse(body)

    console.log(`[${requestId}] TTS request: ${parsed.voice}`)

    // Phase 4: Integrate with ElevenLabs, OpenAI, or Windows SAPI
    return c.json(
      {
        success: true,
        data: {
          audio_data: '',
          duration_ms: 0
        },
        requestId
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(`[${requestId}] /speak error:`, error)

    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message
          })),
          requestId
        },
        { status: 400 }
      )
    }

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'TTS_ERROR',
        requestId
      },
      { status: 500 }
    )
  }
})

// 404 handler
app.all('*', (c) => {
  return c.json(
    {
      success: false,
      error: 'Not found',
      code: 'NOT_FOUND',
      requestId: c.get('requestId')
    },
    { status: 404 }
  )
})

// Error handler (catches uncaught exceptions)
app.onError((err, c) => {
  const requestId = c.get('requestId')
  console.error(`[${requestId}] Unhandled error:`, err)

  return c.json(
    {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      requestId
    },
    { status: 500 }
  )
})

export default app
