# Maverick AI - Quick Start (10 Minutes)

Get the complete AI system running in just 10 minutes.

## Prerequisites

- Windows 10 or later
- Node.js 18+ and pnpm
- 2GB free disk space
- Optional: Ollama for local LLM (download from ollama.ai)

## Step 1: Clone & Install (2 min)

```bash
git clone https://github.com/sunnydev07/maverick-ai.git
cd maverick-ai
pnpm install
```

## Step 2: Start the Services (2 min)

**Terminal 1 - Worker API:**
```bash
cd packages/worker
pnpm dev
```

Expected output:
```
✓ Ready on http://localhost:8787
```

**Terminal 2 - Ollama (optional, for local models):**
```bash
ollama serve
```

In a separate terminal:
```bash
ollama pull llama2
```

**Terminal 3 - Electron Desktop App:**
```bash
cd packages/electron
pnpm dev
```

Electron window opens automatically.

## Step 3: Configure Settings (2 min)

In the Electron window that opened:

1. **LLM Provider**: Select "Ollama"
2. **Model**: Enter `llama2`
3. **Worker URL**: Enter `http://localhost:8787`
4. **TTS Voice**: Select "English (US)"
5. **Screenshot Mode**: Select "Full Desktop"
6. **Memory**: Select "Session Only"
7. Click **Save Settings**

You should see: ✅ Settings saved!

## Step 4: Test Everything (2 min)

### Test 1: Voice Preview
- Click **Preview Voice** button
- You should hear audio

### Test 2: Test Worker Connection
```bash
curl -X POST http://localhost:8787/health
```

Should return:
```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

### Test 3: Test LLM (in Terminal)
```bash
curl -X POST http://localhost:8787/llm \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Say hello"}],
    "model": "llama2",
    "provider": "ollama"
  }'
```

Should return:
```json
{
  "success": true,
  "data": {
    "content": "Hello! How can I help you today?",
    "model": "llama2",
    "stop_reason": "end_turn"
  }
}
```

## Step 5: Try the Full Pipeline (2 min)

1. In the Electron window, note the hotkey (default: **Alt+Space**)
2. Press **Alt+Space** anywhere on your desktop
3. The app captures your screen and starts recording audio
4. Say something like: "What do you see?"
5. Release the hotkey
6. The app transcribes your voice, sends it to the LLM with the screenshot
7. You hear the AI response

**Congratulations!** You've successfully run the complete pipeline.

---

## What's Working

✅ Settings Panel with full configuration  
✅ Global hotkey trigger (Alt+Space)  
✅ Screenshot capture (full/active/region modes)  
✅ Audio recording and transcription  
✅ Multi-LLM provider routing  
✅ Real-time TTS response  
✅ System tray integration  
✅ Auto-update mechanism  
✅ Production installer  

---

## Next Steps

### For Development
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- See [USE.md](./USE.md) for practical usage examples
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues

### For Customization
- **Change hotkey**: Settings Panel → Record Hotkey
- **Change LLM**: Settings Panel → Select Provider → Save
- **Use cloud models**: Settings Panel → Select Claude/Gemini → Provide API key

### For Production
- See [DEPLOY_PRODUCTION.md](./DEPLOY_PRODUCTION.md)
- See [packages/worker/DEPLOY.md](./packages/worker/DEPLOY.md)

---

## Common Issues

### "Worker connection refused"
```bash
# Check Worker is running:
curl http://localhost:8787/health
```

### "Ollama not found"
```bash
# Install from: https://ollama.ai
# Or pull a model:
ollama pull llama2
```

### "Settings not saving"
1. Open DevTools (F12)
2. Application → Storage → Local Storage
3. Check `maverickSettings` exists
4. Or clear all: `localStorage.clear()`

### "Hotkey not working"
1. Check another app isn't using Alt+Space
2. Try different combo: Alt+M, Ctrl+Shift+K, etc.
3. Restart Electron app after changing

### "No audio output"
1. Check system volume
2. Check speakers/headphones connected
3. In Settings → Preview Voice to test

---

## Environment Setup (Optional)

For cloud LLM providers, set environment variables:

**Ollama (local):**
```bash
# No setup needed, runs on http://localhost:11434
```

**OpenAI (Whisper & TTS):**
```bash
export OPENAI_API_KEY=sk-...
# Used for transcription and voice synthesis
```

**Claude (Anthropic):**
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

**Gemini (Google):**
```bash
export GOOGLE_API_KEY=...
```

**OpenRouter:**
```bash
export OPENROUTER_API_KEY=sk-or-...
```

Then restart services for changes to take effect.

---

## Architecture Overview

```
Your Screen
    ↓
[Alt+Space] Global Hotkey
    ↓
📸 Screenshot Capture → 🎙️ Audio Recording
    ↓
Electron IPC
    ↓
Cloudflare Worker (localhost:8787)
    ↓
┌─────────────────────────────┐
│  LLM Provider Selection      │
├─────────────────────────────┤
│ • Ollama (local)            │
│ • Claude (Anthropic)        │
│ • Gemini (Google)           │
│ • OpenRouter (multi-model)  │
└─────────────────────────────┘
    ↓
OpenAI Whisper (Transcription)
    ↓
LLM (Analyze screenshot + text)
    ↓
OpenAI TTS (Text-to-Speech)
    ↓
🔊 Play Audio Response
```

---

## File Structure Reference

```
maverick-ai/
├── packages/
│   ├── electron/          ← Desktop app (run with: pnpm dev)
│   └── worker/            ← API backend (run with: pnpm dev)
│
├── README.md              ← Full documentation
├── USE.md                 ← Practical usage guide
├── ARCHITECTURE.md        ← Technical deep dive
├── SETUP.md               ← Provider configuration
└── TROUBLESHOOTING.md     ← Common issues
```

---

## Terminal Checklist

```
Terminal 1: cd packages/worker && pnpm dev
Terminal 2: ollama serve (optional)
Terminal 3: cd packages/electron && pnpm dev

✓ All running?
→ Open http://localhost:5173 in Electron
→ Configure settings
→ Press Alt+Space to test
```

---

## Success Indicators

- [ ] Electron window opens
- [ ] Settings Panel shows all options
- [ ] Settings save successfully (✓ message appears)
- [ ] Voice preview plays audio
- [ ] Worker health check responds
- [ ] LLM curl test returns response
- [ ] Alt+Space triggers capture
- [ ] Audio is transcribed
- [ ] AI response is spoken back

**All checked?** → You're ready to use Maverick AI!

---

**Next**: Read [USE.md](./USE.md) for practical examples  
**Help**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)  
**Details**: See [ARCHITECTURE.md](./ARCHITECTURE.md)

