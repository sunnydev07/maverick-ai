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
}
