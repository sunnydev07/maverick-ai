# Maverick AI - Component Architecture

## Settings Panel Component Structure

```
┌─────────────────────────────────────────────────────────┐
│                  MAVERICK AI SETTINGS                    │
│                  🖥️ Settings Panel                       │
└─────────────────────────────────────────────────────────┘

┌─ Section 1: LLM Provider ────────────────────────────────┐
│                                                           │
│  Select Provider: [Ollama ▼]                             │
│  └─ Info: "Requires local Ollama on port 11434"          │
│                                                           │
│  Model Name / ID:                                        │
│  [llama2                                    ]             │
│                                                           │
│  Cloudflare Worker URL:                                  │
│  [https://your-worker.workers.dev          ]             │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─ Section 2: Global Hotkey ───────────────────────────────┐
│                                                           │
│  Default: Alt + Space                                    │
│                                                           │
│  [Alt+Space         ]  [Record]                          │
│  └─ Click record and press your combo                    │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─ Section 3: Text-to-Speech Voice ────────────────────────┐
│                                                           │
│  [English (US) ▼]                                        │
│                                                           │
│  [🔊 Preview Voice]                                      │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─ Section 4: Screenshot Mode ─────────────────────────────┐
│                                                           │
│  ◉ Full Desktop                                          │
│  ○ Active Window Only                                    │
│  ○ Drag Region                                           │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─ Section 5: Conversation Memory ─────────────────────────┐
│                                                           │
│  ◉ Session Only                                          │
│  ○ Save History                                          │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 [💾 Save Settings]                       │
│                                                           │
│  ✓ Settings saved! (shows after save)                    │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Maverick AI v0.1.0 • All settings stored locally        │
│  API keys secured in Worker proxy                        │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### User Interaction Flow

```
User Opens Settings Panel
    ↓
1. LOAD SETTINGS
   └─→ Check localStorage for "maverickSettings"
       ├─ If exists: load saved values
       └─ If not: use DEFAULT_SETTINGS

2. CONFIGURE PROVIDER
   ├─ Select from: Ollama / OpenRouter / Claude / Gemini
   ├─ Enter model name (e.g., "llama2")
   └─ Enter Worker URL (e.g., "http://localhost:8787")

3. RECORD HOTKEY
   ├─ Click "Record" button
   ├─ Press keyboard combo (e.g., Ctrl+Shift+A)
   ├─ Capture: Ctrl + Shift + A
   └─ Save to state

4. PREVIEW VOICE
   ├─ Select TTS language
   ├─ Click "Preview Voice"
   └─ Browser SpeechSynthesis reads preview text

5. SELECT CAPTURE MODE
   ├─ Full Desktop (all monitors)
   ├─ Active Window Only
   └─ Drag to select region

6. TOGGLE MEMORY
   ├─ Session Only (forget after close)
   └─ Save History (persist between sessions)

7. SAVE SETTINGS
   ├─ Click "Save Settings" button
   ├─ Serialize state to JSON
   ├─ Save to localStorage with key "maverickSettings"
   ├─ Show "✓ Settings saved!" message
   └─ Auto-hide message after 2 seconds
```

---

## Worker API Flow

### LLM Request Flow

```
Electron Settings Panel
    ↓
User clicks "Test" (Phase 2) or sends message
    ↓
Electron collects from settings:
  - provider: "ollama"
  - modelName: "llama2"
  - workerUrl: "http://localhost:8787"
    ↓
POST /llm
  Content-Type: application/json
  {
    messages: [{role: "user", content: "..."}],
    model: "llama2",
    provider: "ollama",
    temperature: 0.7,
    max_tokens: 2048
  }
    ↓
Worker receives request
    ↓
Validates with LLMRequestSchema (Zod)
    ↓
Routes to provider:
  ├─ getProvider("ollama")
  ├─ Create OllamaProvider instance
  └─ Call provider.call(request, env)
    ↓
Provider (Ollama):
  POST http://localhost:11434/api/chat
  {
    model: "llama2",
    messages: [...],
    temperature: 0.7,
    stream: false
  }
    ↓
Ollama responds:
  {
    message: {content: "..."},
    done: true
  }
    ↓
Provider transforms to standard format:
  {
    content: "...",
    model: "llama2",
    stop_reason: "end_turn"
  }
    ↓
Worker returns:
  {
    success: true,
    data: {content: "...", model: "llama2", stop_reason: "..."}
  }
    ↓
Electron receives response
    ↓
(Phase 2: Send to TTS, render cursor overlay, etc.)
```

---

## Component Tree

```
App
├── SettingsPanel
│   ├── useState(settings)
│   │   ├── provider: 'ollama'
│   │   ├── modelName: ''
│   │   ├── workerUrl: ''
│   │   ├── ttsVoice: 'en-US'
│   │   ├── hotkey: 'Alt+Space'
│   │   ├── screenshotMode: 'full'
│   │   └── conversationMemory: 'session'
│   │
│   ├── useState(hotkeyRecording)
│   ├── useState(savedMessage)
│   │
│   ├── useEffect()
│   │   └─ Load from localStorage
│   │
│   ├── LLM Provider Section
│   │   ├── <select> provider
│   │   ├── <input> modelName
│   │   └── <input> workerUrl
│   │
│   ├── Global Hotkey Section
│   │   ├── <input> hotkey (readonly, onKeyDown)
│   │   └── <button> Record/Recording
│   │
│   ├── TTS Voice Section
│   │   ├── <select> ttsVoice
│   │   └── <button> Preview Voice
│   │       └─ new SpeechSynthesisUtterance()
│   │
│   ├── Screenshot Mode Section
│   │   └── <input type="radio"> x3
│   │
│   ├── Conversation Memory Section
│   │   └── <input type="radio"> x2
│   │
│   ├── <button> Save Settings
│   │   └─ localStorage.setItem('maverickSettings', JSON.stringify(settings))
│   │
│   └── {savedMessage && <div>✓ Settings saved!</div>}
```

---

## State Management (Phase 1)

### localStorage Schema

```json
{
  "maverickSettings": {
    "provider": "ollama",
    "modelName": "llama2",
    "workerUrl": "http://localhost:8787",
    "ttsVoice": "en-US",
    "hotkey": "Alt+Space",
    "screenshotMode": "full",
    "conversationMemory": "session"
  }
}
```

**Phase 2 Migration**: Will move to `electron-store` for:
- Persistence across app restarts
- Encrypted storage for API keys
- Atomic writes

---

## Provider Integration Map

```
SettingsPanel
    ↓
workerUrl: "http://localhost:8787"
    ↓
POST /llm with provider flag
    ↓
┌─────────────────────────────────┐
│   Provider Router (getProvider) │
└─────────────────────────────────┘
    ├─→ "ollama" → OllamaProvider
    │   └─→ POST http://localhost:11434/api/chat
    │
    ├─→ "openrouter" → OpenRouterProvider
    │   └─→ POST https://openrouter.ai/api/v1/chat/completions
    │       (Requires OPENROUTER_API_KEY)
    │
    ├─→ "claude" → ClaudeProvider
    │   └─→ POST https://api.anthropic.com/v1/messages
    │       (Requires ANTHROPIC_API_KEY)
    │
    └─→ "gemini" → GeminiProvider
        └─→ POST https://generativelanguage.googleapis.com/v1beta/models/.../generateContent
            (Requires GOOGLE_API_KEY)
```

---

## Validation Schemas (Zod)

```ts
LLMRequestSchema
├─ messages: Message[]
│  ├─ role: "user" | "assistant" | "system"
│  └─ content: string
├─ model: string
├─ provider?: "ollama" | "openrouter" | "claude" | "gemini"
├─ temperature?: 0-2 (default: 0.7)
└─ max_tokens?: number (default: 2048)

TranscriptionRequestSchema (Phase 2)
├─ audio_data: string (base64)
└─ language?: string (default: "en")

TTSRequestSchema (Phase 2)
├─ text: string
├─ voice: "en-US" | "en-GB" | "fr-FR"
└─ provider?: "elevenlabs" | "openai" | "windows"

CursorOverlaySchema
├─ speech: string (TTS text)
├─ point: {x: number, y: number}
└─ annotations?: {x, y, label}[]
```

---

## Build & Deployment Map

```
Development
├─ pnpm dev
│  ├─ electron-vite dev (port 5173)
│  │  ├─ HMR enabled
│  │  ├─ Loads src/renderer/index.tsx
│  │  └─ Connects to main process at IPC bridge
│  │
│  └─ wrangler dev (port 8787)
│     ├─ Local Cloudflare runtime
│     └─ Simulates production environment

Production - Electron
├─ pnpm build
│  └─ electron-vite build
│     ├─ Bundles React UI
│     ├─ Main process + preload
│     └─ Creates dist/ folder
│
├─ electron-builder
│  ├─ Reads: electron-builder.config.ts
│  ├─ Creates: NSIS installer (.exe)
│  └─ Creates: Portable exe
│
└─ Distribution
   ├─ Maverick AI Setup 0.1.0.exe (installer)
   └─ Maverick AI 0.1.0.exe (portable)

Production - Worker
├─ wrangler deploy
│  ├─ Deploys to Cloudflare edge
│  └─ Returns: https://maverick-ai.workers.dev
│
└─ Update Settings Panel
   └─ Set Worker URL to production URL
```

---

## Error Handling Flow

```
User Input
    ↓
validateWithZod()
    ├─ ✓ Valid
    │   └─ Proceed with request
    │
    └─ ✗ Invalid
        └─ Return 400 error
            {
              success: false,
              error: "Validation failed",
              code: "VALIDATION_ERROR"
            }
              ↓
            Electron catches & displays error
              ↓
            User sees error message in Settings Panel

Provider Call
    ├─ ✓ Success
    │   └─ Return LLMResponse
    │
    └─ ✗ Error
        ├─ Network error
        ├─ API key invalid
        ├─ Rate limited
        └─ Model not found
            ↓
            Provider throws Error
              ↓
            Worker catches & wraps
              ↓
            Return 400 error
              ↓
            Electron displays error
```
