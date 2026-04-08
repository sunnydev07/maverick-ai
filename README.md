# Maverick AI - Settings Panel Preview

This is a **web-based preview** of the Maverick AI Settings Panel UI for the Windows system tray application. You can interact with all the settings controls right here in the browser.

## What You See Here

This Next.js app showcases the **Settings Panel Component** with:

- LLM provider selector (Ollama, OpenRouter, Claude, Gemini)
- Custom model name configuration
- Hotkey recorder (click Record and press your key combo)
- TTS voice selector with audio preview
- Screenshot mode selector (Full Desktop / Active Window / Drag Region)
- Conversation memory toggle (Session-only vs Saved History)
- One-click save to browser storage

## Try It Out

All settings are fully interactive:
1. Change the LLM provider and model
2. Click "Record Hotkey" and press a keyboard combination
3. Click the speaker icon to preview TTS voices
4. Toggle options and click "Save Settings"
5. Settings persist to localStorage

## Full Project Documentation

For the complete Electron desktop app and Cloudflare Worker API source code, see:

- **QUICKSTART.md** - 5-minute setup guide
- **ARCHITECTURE.md** - System design and component breakdown
- **SETUP.md** - LLM provider configuration
- **PROJECT_OVERVIEW.md** - Visual architecture and tech stack
- **ROADMAP.md** - Phase 2+ development plans
- **CHECKLIST.md** - QA and deployment checklist

## Source Code Location

The full source code for this project is documented in the accompanying markdown files. This preview focuses on the UI/UX of the Settings Panel component.

### Key Technologies

- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **Desktop**: Electron 41 + Vite (documented in full project)
- **Backend**: Cloudflare Workers + Hono (documented in full project)
- **API**: Multi-LLM provider support (Ollama, OpenRouter, Claude, Gemini)

## Getting Started

To preview locally:

```bash
pnpm install
pnpm dev
```

Then visit `http://localhost:3000` to interact with the Settings Panel.

  - **Ollama** (local inference, default)
  - **OpenRouter** (multi-model routing)
  - **Claude** (Anthropic API)
  - **Gemini** (Google API)
- CORS-enabled for Electron app
- Health check endpoint
- Zod validation schemas
- Placeholders for transcription & TTS (Phase 2)

### Technology Stack

**Electron App:**
- Electron 30+
- React 19
- TypeScript 5.7
- Tailwind CSS 4
- electron-vite (build tool)

**Worker:**
- Hono (lightweight web framework)
- Cloudflare Workers
- Zod (validation)

## Quick Start

### Install Dependencies

```bash
pnpm install
```

### Development

Run Electron app and Worker in parallel:

```bash
pnpm dev
```

This runs:
- `packages/electron`: `electron-vite dev` (opens window at localhost:5173)
- `packages/worker`: `wrangler dev` (runs at localhost:8787)

### Build

```bash
pnpm build
```

Creates:
- Electron app dist files
- Worker dist files ready for Cloudflare deployment

## Configuration

### Electron Settings Panel

Settings are stored in browser localStorage (Phase 1):

```json
{
  "provider": "ollama",
  "modelName": "llama2",
  "workerUrl": "https://your-worker.workers.dev",
  "ttsVoice": "en-US",
  "hotkey": "Alt+Space",
  "screenshotMode": "full",
  "conversationMemory": "session"
}
```

**Phase 2:** Migrate to electron-store for persistence across app restarts.

### Worker Configuration

Set up Wrangler secrets for API keys:

```bash
# For Ollama (local, no setup needed)
# Default: http://localhost:11434

# For OpenRouter
wrangler secret put OPENROUTER_API_KEY

# For Claude
wrangler secret put ANTHROPIC_API_KEY

# For Gemini
wrangler secret put GOOGLE_API_KEY
```

Set provider in `wrangler.toml`:

```toml
[vars]
OLLAMA_BASE_URL = "http://localhost:11434"
```

## API Endpoints

### POST `/llm`

Request:
```json
{
  "messages": [
    { "role": "user", "content": "What time is it?" }
  ],
  "model": "llama2",
  "provider": "ollama",
  "temperature": 0.7,
  "max_tokens": 2048
}
```

Response:
```json
{
  "success": true,
  "data": {
    "content": "It is currently...",
    "model": "llama2",
    "stop_reason": "end_turn"
  }
}
```

### POST `/transcribe` (Phase 2)

### POST `/speak` (Phase 2)

## Next Steps - Phase 2

- [ ] **System Tray Integration**: Run app hidden in system tray
- [ ] **Global Hotkey Wiring**: Register Win32 hotkeys, trigger screenshot + audio recording
- [ ] **Audio Capture**: Implement push-to-talk recording (Web Audio API)
- [ ] **IPC Communication**: Move settings to electron-store, establish app ↔ renderer communication
- [ ] **Screenshot Capture**: Implement region selection, full/active window capture
- [ ] **Transcription**: Integrate Whisper API or local STT
- [ ] **TTS Response Streaming**: Real-time audio playback
- [ ] **Cursor Overlay**: Render AI-generated cursor coordinates on screen
- [ ] **Installer Build**: Bundle for Windows distribution (NSIS/Squirrel)

## Development Notes

- **Settings Panel**: Currently uses localStorage (browser cache). When you reload, settings persist.
- **Hotkey Recorder**: Click "Record" button, then press your desired key combination. It captures Ctrl, Alt, Shift, Meta + any letter/number.
- **TTS Preview**: Click "Preview Voice" to test the browser's native `SpeechSynthesisUtterance` (Phase 2 will use ElevenLabs or Windows SAPI for better quality).
- **Worker**: Start with `pnpm dev` in packages/worker directory to test locally. Deploy with `wrangler deploy`.

## Architecture

```
User presses Alt+Space
    ↓
Global hotkey triggers (Win32, Phase 2)
    ↓
Take screenshot (region/window/full)
Record audio (push-to-talk)
    ↓
Send to Electron IPC
    ↓
Electron sends to Cloudflare Worker
    ↓
Worker routes to LLM provider:
  - Ollama (local)
  - OpenRouter
  - Claude
  - Gemini
    ↓
LLM response → TTS synthesis
    ↓
Play audio
    ↓
Render cursor overlay (AI-generated coordinates)
    ↓
Fade out after timeout or next interaction
```

## Known Limitations (Phase 1)

- Settings only persist via localStorage (survives page reload, not app restart)
- No actual screenshot capture
- No audio recording
- No transcription
- No global hotkey registration
- TTS uses browser SpeechSynthesis (poor quality compared to ElevenLabs)
- Cursor overlay not rendered (Phase 2)

## License

MIT
