import { z } from 'zod'

// LLM Request/Response schemas
export const LLMRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string()
    })
  ),
  model: z.string(),
  provider: z.enum(['ollama', 'openrouter', 'claude', 'gemini']).optional(),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  max_tokens: z.number().optional().default(2048)
})

export const LLMResponseSchema = z.object({
  content: z.string(),
  model: z.string(),
  stop_reason: z.string().optional()
})

// Transcription schemas
export const TranscriptionRequestSchema = z.object({
  audio_data: z.string(), // base64 encoded WAV/WebM
  language: z.string().optional().default('en')
})

export const TranscriptionResponseSchema = z.object({
  text: z.string(),
  confidence: z.number().optional()
})

// TTS schemas
export const TTSRequestSchema = z.object({
  text: z.string(),
  voice: z.enum(['en-US', 'en-GB', 'fr-FR']).default('en-US'),
  provider: z.enum(['elevenlabs', 'openai', 'windows']).optional().default('windows')
})

export const TTSResponseSchema = z.object({
  audio_data: z.string(), // base64 encoded WAV
  duration_ms: z.number()
})

export type LLMRequest = z.infer<typeof LLMRequestSchema>
export type LLMResponse = z.infer<typeof LLMResponseSchema>
export type TranscriptionRequest = z.infer<typeof TranscriptionRequestSchema>
export type TranscriptionResponse = z.infer<typeof TranscriptionResponseSchema>
export type TTSRequest = z.infer<typeof TTSRequestSchema>
export type TTSResponse = z.infer<typeof TTSResponseSchema>

// Cursor overlay response format (from spec)
export const CursorOverlaySchema = z.object({
  speech: z.string(),
  point: z.object({
    x: z.number(),
    y: z.number()
  }),
  annotations: z
    .array(
      z.object({
        x: z.number(),
        y: z.number(),
        label: z.string().optional()
      })
    )
    .optional()
})

export type CursorOverlay = z.infer<typeof CursorOverlaySchema>
