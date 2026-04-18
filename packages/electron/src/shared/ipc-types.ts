import { z } from 'zod'

// Settings Schema
export const SettingsSchema = z.object({
  provider: z.enum(['ollama', 'openrouter', 'claude', 'gemini']),
  modelName: z.string().min(1, 'Model name is required'),
  workerUrl: z.string().url('Invalid worker URL'),
  hotkeyCombo: z.string().optional(),
  ttsVoice: z.string().optional(),
  screenshotMode: z.enum(['full', 'active', 'region']).default('full'),
  conversationMemory: z.enum(['session', 'saved']).default('session'),
})

export type Settings = z.infer<typeof SettingsSchema>

// IPC Channel Messages
export const SaveSettingsRequestSchema = SettingsSchema
export const SaveSettingsResponseSchema = z.object({
  success: boolean,
  message: string,
})

export const LoadSettingsResponseSchema = SettingsSchema.optional()

export const TestWorkerUrlRequestSchema = z.object({
  url: z.string().url(),
})

export const TestWorkerUrlResponseSchema = z.object({
  success: boolean,
  message: string,
})

export const TestHotkeyRequestSchema = z.object({
  combo: z.string(),
})

export const TestHotkeyResponseSchema = z.object({
  success: boolean,
  message: string,
  conflict: boolean,
})

// Capture Schemas
export const CaptureStartRequestSchema = z.object({
  screenshotMode: z.enum(['full', 'active', 'region']).optional(),
}).optional()

export const CaptureStartResponseSchema = z.object({
  success: boolean,
  data: z.object({
    screenshotBase64: z.string(),
    audioBase64: z.string(),
    mode: z.string(),
    timestamp: z.number(),
  }).optional(),
  error: z.string().optional(),
})

export const CaptureStatusResponseSchema = z.object({
  isRecording: z.boolean(),
})

export const HotkeyRegisterRequestSchema = z.object({
  combo: z.string(),
})

export const HotkeyRegisterResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

// IPC Channel Handlers Type
export interface IpcChannels {
  'save-settings': {
    request: z.infer<typeof SaveSettingsRequestSchema>
    response: z.infer<typeof SaveSettingsResponseSchema>
  }
  'load-settings': {
    request: undefined
    response: z.infer<typeof LoadSettingsResponseSchema>
  }
  'test-worker-url': {
    request: z.infer<typeof TestWorkerUrlRequestSchema>
    response: z.infer<typeof TestWorkerUrlResponseSchema>
  }
  'test-hotkey': {
    request: z.infer<typeof TestHotkeyRequestSchema>
    response: z.infer<typeof TestHotkeyResponseSchema>
  }
  'capture:start': {
    request: z.infer<typeof CaptureStartRequestSchema>
    response: z.infer<typeof CaptureStartResponseSchema>
  }
  'capture:cancel': {
    request: undefined
    response: z.object({ success: z.boolean(); message: z.string() })
  }
  'capture:status': {
    request: undefined
    response: z.infer<typeof CaptureStatusResponseSchema>
  }
  'hotkey:register': {
    request: z.infer<typeof HotkeyRegisterRequestSchema>
    response: z.infer<typeof HotkeyRegisterResponseSchema>
  }
}
