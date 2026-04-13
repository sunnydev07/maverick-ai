# Maverick AI - Production Ready

**AI-powered Windows system tray application** that captures screenshots and audio, transcribes your voice, processes context through AI, and speaks back intelligent responses - all with a single keyboard shortcut.

## Quick Facts

- **Status**: Fully Production Ready (All 8 Phases Complete)
- **Platform**: Windows 10+
- **AI Models**: Ollama (local), Claude, Gemini, OpenRouter
- **Architecture**: Electron + React + Cloudflare Worker
- **Installation**: NSIS installer with auto-updates
- **License**: MIT

## Features

### Core Functionality
- 🎙️ **Voice Capture** - Push-to-talk audio recording
- 📸 **Screenshot Capture** - Full/active/region modes with JPEG compression
- 🗣️ **Transcription** - OpenAI Whisper API integration
- 🤖 **LLM Processing** - Multi-provider support with screenshot context
- 🔊 **TTS Response** - Real-time audio playback with waveform visualization
- ⌨️ **Global Hotkey** - Customizable keyboard shortcut (default Alt+Space)
- 💾 **Settings Panel** - Full configuration of all features

### System Integration
- 📌 **System Tray** - Minimize to tray, run in background
- 🔄 **Auto-Updates** - GitHub release-based update mechanism
- 🔐 **Secure Storage** - Encrypted electron-store for settings
- 🎨 **Dark Theme** - Professional UI with animations and polish
- ♿ **Accessibility** - ARIA labels, keyboard navigation, screen reader support

### LLM Providers
| Provider | Setup | Cost | Latency | Quality |
|----------|-------|------|---------|---------|
| Ollama (Local) | Free | Free | Fast | Good |
| Claude | API Key | $$$ | Medium | Excellent |
| Gemini | API Key | $$ | Medium | Very Good |
| OpenRouter | API Key | $-$$$ | Medium | Good |

## Project Structure

```
maverick-ai/
├── packages/
│   ├── electron/
│   │   ├── src/
│   │   │   ├── main/              # Electron main process
│   │   │   │   ├── index.ts       # App initialization
│   │   │   │   ├── tray.ts        # System tray
│   │   │   │   ├── hotkey.ts      # Global hotkey registration
│   │   │   │   ├── capture.ts     # Screenshot + audio
│   │   │   │   ├── response-handler.ts  # Orchestration
│   │   │   │   └── overlay-window.ts    # Cursor overlay
│   │   │   │
│   │   │   ├── renderer/          # React UI
│   │   │   │   ├── components/
│   │   │   │   │   ├── SettingsPanel.tsx
│   │   │   │   │   ├── CaptureOverlay.tsx
│   │   │   │   │   ├── ResponseOverlay.tsx
│   │   │   │   │   ├── StatusBadge.tsx
│   │   │   │   │   └── ...
│   │   │   │   └── utils/
│   │   │   │       ├── audio-player.ts
│   │   │   │       └── ...
│   │   │   │
│   │   │   └── preload/
│   │   │       └── index.ts       # IPC bridge
│   │   │
│   │   ├── electron-builder.config.ts
│   │   └── vite.config.ts
│   │
│   └── worker/
│       ├── src/
│       │   ├── index.ts           # Hono API routes
│       │   ├── providers.ts       # LLM implementations
│       │   ├── whisper.ts         # Transcription
│       │   ├── tts.ts             # Text-to-speech
│       │   └── schemas.ts         # Zod validation
│       │
│       ├── wrangler.toml
│       └── package.json
│
├── Documentation/
│   ├── README.md          (this file)
│   ├── QUICKSTART.md      (5-minute setup)
│   ├── USE.md             (practical guide)
│   ├── ARCHITECTURE.md    (technical details)
│   ├── SETUP.md           (provider configuration)
│   ├── DEPLOY_PRODUCTION.md
│   └── TROUBLESHOOTING.md
│
└── package.json (root monorepo)
```

## Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
git clone https://github.com/sunnydev07/maverick-ai.git
cd maverick-ai
pnpm install
```

### 2. Start Services
**Terminal 1 - Worker:**
```bash
cd packages/worker && pnpm dev
# Runs at http://localhost:8787
```

**Terminal 2 - Ollama (optional, for local inference):**
```bash
ollama serve
ollama pull llama2  # or your preferred model
```

**Terminal 3 - Electron App:**
```bash
cd packages/electron && pnpm dev
# Opens Electron window with Settings Panel
```

### 3. Configure
1. Open Settings Panel in Electron window
2. Choose LLM provider (start with Ollama)
3. Set Worker URL: `http://localhost:8787`
4. Save settings

### 4. Test
- Press Alt+Space to activate
- Grant permissions if prompted
- Try capturing a screenshot + voice command

**Done!** See [USE.md](./USE.md) for practical examples.

## Technology Stack

### Frontend
- **Electron 30+** - Desktop app framework
- **React 19** - UI library
- **TypeScript 5.7** - Type safety
- **Tailwind CSS 4** - Styling with design tokens
- **Web Audio API** - Audio visualization
- **Canvas API** - Waveform rendering

### Backend
- **Hono** - Lightweight web framework
- **Cloudflare Workers** - Edge computing platform
- **Zod** - Runtime type validation
- **OpenAI Whisper** - Speech-to-text
- **OpenAI TTS** - Text-to-speech

### DevOps
- **electron-builder** - App packaging & installers
- **Wrangler** - Cloudflare Worker CLI
- **pnpm** - Fast package manager
- **GitHub Releases** - Auto-update mechanism

## API Reference

### `/llm` - LLM Processing
```bash
curl -X POST http://localhost:8787/llm \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What is this?"}],
    "model": "llama2",
    "provider": "ollama"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "Based on the screenshot...",
    "model": "llama2",
    "stop_reason": "end_turn"
  }
}
```

### `/transcribe` - Audio-to-Text
```bash
curl -X POST http://localhost:8787/transcribe \
  -H "Content-Type: application/json" \
  -d '{
    "audio_data": "base64-encoded-audio",
    "language": "en"
  }'
```

### `/speak` - Text-to-Speech
```bash
curl -X POST http://localhost:8787/speak \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Response text",
    "voice": "en-US"
  }'
```

### `/health` - Diagnostics
```bash
curl http://localhost:8787/health
```

**Response:**
```json
{
  "status": "ok",
  "version": "0.1.0",
  "providers": {
    "ollama": {"status": "ok", "latency_ms": 45},
    "claude": {"status": "error", "error": "API key not configured"}
  }
}
```

## Development

### Build
```bash
pnpm build
```

Outputs:
- `packages/electron/dist/` - App binaries
- `packages/worker/dist/` - Worker code ready for deployment

### Test Locally
```bash
# Terminal 1: Worker
cd packages/worker && pnpm dev

# Terminal 2: Electron
cd packages/electron && pnpm dev
```

### Deploy Worker
```bash
cd packages/worker
wrangler deploy
```

### Build Installer
```bash
cd packages/electron
pnpm build  # Creates NSIS + Portable installers in dist/
```

## Configuration

### Environment Variables

**Worker (.env):**
```
OPENAI_API_KEY=sk-...           # For Whisper & TTS
ANTHROPIC_API_KEY=sk-ant-...    # For Claude
GOOGLE_API_KEY=...               # For Gemini
OPENROUTER_API_KEY=sk-or-...    # For OpenRouter
OLLAMA_BASE_URL=http://localhost:11434
```

**Electron (Settings Panel):**
- LLM Provider
- Model Name
- Worker URL
- Hotkey
- TTS Voice
- Screenshot Mode
- Conversation Memory

See [SETUP.md](./SETUP.md) for detailed provider setup.

## Phases Complete

| Phase | Component | Status |
|-------|-----------|--------|
| 1 | Settings Panel UI | ✅ Complete |
| 2 | IPC Infrastructure | ✅ Complete |
| 3 | Cloudflare Worker | ✅ Complete |
| 4 | System Tray & Hotkey | ✅ Complete |
| 5 | Screenshot & Audio Capture | ✅ Complete |
| 6 | Transcription & TTS | ✅ Complete |
| 7 | UI Polish & Animations | ✅ Complete |
| 8 | Production Installer | ✅ Complete |

## Troubleshooting

### Common Issues
- **Worker not connecting**: Check localhost:8787 is accessible
- **Audio not recording**: Check Windows microphone permissions
- **Settings not persisting**: Clear app cache and restart
- **TTS not playing**: Verify speakers/headphones and volume

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT - See LICENSE file for details

## Support

- **Documentation**: See [USE.md](./USE.md) for practical guides
- **Issues**: Report bugs on GitHub Issues
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Troubleshooting**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## Roadmap

Future enhancements:
- Multi-language support
- Custom LLM prompt templates
- Conversation history search
- Plugin system
- macOS support
- Linux support

---

**Version**: 0.1.0 (Production Ready)  
**Last Updated**: 2026-04-09

