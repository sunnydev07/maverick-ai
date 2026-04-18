## Maverick AI - Integration Checklist & Deployment Guide

### Phase Completion Status

- [x] Phase 1: Settings Panel UI - Complete
- [x] Phase 2: IPC Infrastructure - Complete  
- [x] Phase 3: Cloudflare Worker - Complete
- [x] Phase 4: System Tray & Hotkey - Complete
- [x] Phase 5: Screenshot & Audio Capture - Complete
- [x] Phase 6: Transcription & TTS - Complete
- [x] Phase 7: UI Polish & Animations - Complete
- [x] Phase 8: Production Installer - Complete

### Integration Verification Checklist

#### Monorepo Setup
- [x] Root package.json with pnpm workspace
- [x] pnpm-workspace.yaml configured
- [x] Root tsconfig.json with package references
- [x] Consistent TypeScript configuration

#### Electron Package
- [x] Main process IPC handlers registered
- [x] Preload API properly exposed to renderer
- [x] TrayManager integrated
- [x] HotkeyManager integrated
- [x] CaptureManager integrated
- [x] electron-store configured with schema
- [x] Settings persistence working

#### Worker Package
- [x] Hono API routes configured
- [x] CORS middleware enabled
- [x] Request logging middleware
- [x] Security headers middleware
- [x] Health check endpoint
- [x] Provider diagnostics endpoint
- [x] LLM endpoint with validation
- [x] Transcription endpoint
- [x] TTS endpoint

#### Type Safety
- [x] IPC types fully defined with Zod
- [x] Worker request/response schemas
- [x] Capture channels typed
- [x] Settings schema validated
- [x] No implicit any types

#### Development Setup
- [x] Root dev script runs all services
- [x] Type-check script available
- [x] Build scripts configured
- [x] Setup.bat for Windows
- [x] Setup.sh for Mac/Linux

### Local Development

```bash
# Install everything
pnpm install

# Run type checks
pnpm type-check

# Build all packages
pnpm build

# Development mode - all services
pnpm dev

# Development mode - individual services
pnpm dev:worker
pnpm dev:electron
```

### Production Deployment

#### Windows Installer Build
```bash
cd packages/electron
pnpm build
# Creates: dist/Maverick AI Setup.exe and dist/Maverick AI.exe
```

#### Cloudflare Worker Deployment
```bash
cd packages/worker
pnpm deploy
# Deploys to your Cloudflare Worker account
```

### Environment Variables

**Development (.env file in project root):**
```
# Electron
VITE_DEV_SERVER_URL=http://localhost:5173

# Worker (packages/worker/.env)
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
GOOGLE_API_KEY=your-key
OPENROUTER_API_KEY=your-key
OLLAMA_BASE_URL=http://localhost:11434
```

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Maverick AI System                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Electron Desktop App                    │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  Main Process          │     Renderer (React)    │  │
│  │  ├─ TrayManager       │  ├─ SettingsPanel       │  │
│  │  ├─ HotkeyManager     │  ├─ CaptureOverlay      │  │
│  │  ├─ CaptureManager    │  ├─ ResponseOverlay     │  │
│  │  └─ IPC Handlers      │  └─ StatusBadge         │  │
│  └──────────────────────────────────────────────────┘  │
│         ↓ IPC Messages ↓                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Cloudflare Worker (localhost:8787)            │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  ├─ /health           - Diagnostics              │  │
│  │  ├─ /llm              - Multi-provider LLM       │  │
│  │  ├─ /transcribe       - Audio-to-Text            │  │
│  │  └─ /speak            - Text-to-Speech           │  │
│  └──────────────────────────────────────────────────┘  │
│         ↓ HTTP Requests ↓                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │           LLM Providers                          │  │
│  │  ├─ Ollama (local)                               │  │
│  │  ├─ Claude (Anthropic)                           │  │
│  │  ├─ Gemini (Google)                              │  │
│  │  ├─ OpenRouter (multi-model)                     │  │
│  │  ├─ OpenAI (Whisper & TTS)                       │  │
│  │  └─ Custom endpoints                             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. User presses Alt+Space
   ↓
2. Global hotkey triggers HotkeyManager
   ↓
3. CaptureManager records screenshot + audio
   ↓
4. Electron IPC sends to main process
   ↓
5. Main process prepares data
   ↓
6. Sends HTTP POST to Worker (/llm)
   ↓
7. Worker validates request (Zod schema)
   ↓
8. Router selects provider (Ollama/Claude/etc)
   ↓
9. Provider processes with screenshot context
   ↓
10. LLM generates response
    ↓
11. Worker calls TTS provider (/speak)
    ↓
12. Audio generated and streamed back
    ↓
13. Electron plays audio to user
    ↓
14. UI updates with response
```

### Common Issues & Fixes

#### Issue: Build fails with "next not found"
**Fix**: Root package.json scripts were wrong - now using pnpm workspace scripts instead

#### Issue: Type errors in IPC
**Fix**: Extended ipc-types.ts with capture channel schemas

#### Issue: Worker not accessible
**Check**: 
- Port 8787 is open
- CORS headers enabled
- Request method is POST or GET

#### Issue: Settings not persisting
**Check**:
- electron-store is initialized with schema
- store.get/set called correctly
- JSON serializable data

### Testing

#### Type Safety
```bash
pnpm type-check
```

#### Build Verification
```bash
pnpm build
```

#### Local Testing
```bash
# Terminal 1
pnpm dev:worker

# Terminal 2
pnpm dev:electron

# In app: Press Alt+Space to test capture
```

#### API Testing
```bash
curl http://localhost:8787/health
curl -X POST http://localhost:8787/llm \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}],"model":"llama2","provider":"ollama"}'
```

### File Structure (Final)

```
maverick-ai/
├── packages/
│   ├── electron/
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── index.ts          (IPC handlers)
│   │   │   │   ├── tray.ts           (System tray)
│   │   │   │   ├── hotkey.ts         (Hotkey manager)
│   │   │   │   ├── capture.ts        (Capture manager)
│   │   │   │   └── response-handler.ts
│   │   │   ├── renderer/
│   │   │   │   ├── App.tsx
│   │   │   │   └── components/
│   │   │   ├── preload/
│   │   │   │   └── index.ts          (IPC bridge)
│   │   │   └── shared/
│   │   │       └── ipc-types.ts      (Type definitions)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── worker/
│       ├── src/
│       │   ├── index.ts              (API routes)
│       │   ├── providers.ts          (LLM implementations)
│       │   ├── schemas.ts            (Zod validation)
│       │   ├── whisper.ts            (Transcription)
│       │   └── tts.ts                (Text-to-speech)
│       ├── package.json
│       ├── tsconfig.json
│       ├── wrangler.toml
│       └── wrangler.toml.example
│
├── package.json                      (Workspace root)
├── pnpm-workspace.yaml               (Workspace config)
├── tsconfig.json                     (Root TypeScript config)
├── setup.bat                         (Windows setup)
├── setup.sh                          (Mac/Linux setup)
├── start-dev.bat                     (Windows dev)
├── start-dev.sh                      (Mac/Linux dev)
├── README.md
├── QUICKSTART.md
├── USE.md
├── INSTALL.md
└── INTEGRATION.md                    (This file)
```

### Version Information

- Electron: 30.0.0
- React: 19
- TypeScript: 5.7.3
- Hono: 4.0.0
- electron-vite: 2.0.0
- Zod: 3.24.1

### Support & Troubleshooting

See individual documentation:
- README.md - Project overview
- QUICKSTART.md - Quick start guide
- USE.md - Practical usage
- INSTALL.md - Detailed installation
- TROUBLESHOOTING.md - Common issues
