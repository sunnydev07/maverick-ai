# Maverick AI - Quick Start Guide (5 Minutes)

## 🚀 Get Running in 5 Steps

### Step 1: Install Dependencies (1 min)

```bash
git clone <your-repo>
cd maverick-ai
pnpm install
```

### Step 2: Start the Worker (1 min)

**Terminal 1:**
```bash
cd packages/worker
pnpm dev
```

You should see:
```
✓ Ready on http://localhost:8787
```

### Step 3: Start Ollama (1 min)

**Terminal 2:**
```bash
ollama serve
```

You should see:
```
Listening on 127.0.0.1:11434
```

**In Terminal 3** (pull a model):
```bash
ollama pull llama2
```

### Step 4: Start the Electron App (1 min)

**Terminal 4:**
```bash
cd packages/electron
pnpm dev
```

Electron window opens automatically with Settings Panel.

### Step 5: Configure Settings (1 min)

In the Electron window:

1. **Provider**: Select "Ollama"
2. **Model**: Type `llama2`
3. **Worker URL**: Type `http://localhost:8787`
4. **Voice**: Select "English (US)"
5. Click **Save Settings** ✓

---

## ✅ Verify Everything Works

### Test 1: Preview Voice
- In Settings Panel
- Click **Preview Voice** button
- You should hear audio

### Test 2: Test Worker
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
    "content": "Hello! I'm here to help...",
    "model": "llama2",
    "stop_reason": "end_turn"
  }
}
```

---

## 🎮 Try These

### Record a Hotkey
1. Click "Record" button (turns green)
2. Press `Ctrl+Shift+A` (or any combo)
3. Button shows your key combo
4. Click Save

### Switch LLM Provider (if you have API key)

**For OpenRouter:**
```bash
wrangler secret put OPENROUTER_API_KEY
# Paste your key, press Enter
```

Then in Settings Panel:
- Provider: OpenRouter
- Model: `openai/gpt-4o`

---

## 📁 Project Structure Quick Reference

```
maverick-ai/
├── packages/
│   ├── electron/        ← Electron app (React UI)
│   │   └── src/renderer/components/SettingsPanel.tsx ⭐
│   │
│   └── worker/          ← Cloudflare Worker (API)
│       └── src/providers.ts  ← LLM integrations
│
├── README.md            ← Full documentation
├── SETUP.md             ← Provider setup guide
└── TROUBLESHOOTING.md   ← Common issues
```

---

## 🆘 Troubleshooting Quick Fixes

### "Worker connection refused"
```bash
# Check Worker is running
curl http://localhost:8787/health
```

### "Ollama not found"
```bash
# Install Ollama
# https://ollama.ai
# Then: ollama serve
# Then: ollama pull llama2
```

### "Settings not saving"
1. Open DevTools (F12)
2. Go to Application → Storage → Local Storage
3. Check `maverickSettings` exists
4. Or clear all and try again: `localStorage.clear()`

### "No sound in TTS preview"
- Check system volume
- Check speakers/headphones connected
- Try Chrome (better SpeechSynthesis support)

---

## 📚 Next Steps

- Read **README.md** for full architecture
- Check **SETUP.md** for other LLM providers
- See **TROUBLESHOOTING.md** for common issues
- Review **ARCHITECTURE.md** for component flows

---

## 🎯 What's Working (Phase 1)

✅ Settings Panel UI
✅ 4 LLM Providers (Ollama, OpenRouter, Claude, Gemini)
✅ Hotkey Recorder
✅ TTS Voice Preview
✅ Screenshot Mode Selection
✅ Conversation Memory Toggle
✅ Settings Persistence
✅ Worker API
✅ Type-safe Validation

---

## 🔄 What's Coming (Phase 2)

🔜 System Tray (app runs hidden)
🔜 Global Hotkey Registration (Alt+Space opens panel)
🔜 Audio Recording (push-to-talk capture)
🔜 Screenshot Capture (auto-send to LLM)
🔜 Transcription (audio → text via Whisper)
🔜 Real-time TTS Responses
🔜 Cursor Overlay (AI-drawn cursor on screen)
🔜 Windows Installer

---

## 💡 Pro Tips

1. **Start with Ollama** — No API keys needed, runs locally
2. **Keep terminals open** — Worker and Ollama need to stay running
3. **Use DevTools** — F12 to see console logs and network requests
4. **Test via curl** — Easier to debug than UI
5. **Watch Worker logs** — Shows what the API is doing

---

**All set? Run `pnpm dev` and explore! 🚀**

For questions, see:
- README.md (full docs)
- SETUP.md (provider setup)
- TROUBLESHOOTING.md (fix issues)
