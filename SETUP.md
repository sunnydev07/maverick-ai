# Maverick AI - Complete Setup & Configuration Guide

## Quick Start (5 Minutes)

### Windows Users
```bash
# 1. Clone and enter project
git clone https://github.com/sunnydev07/maverick-ai.git
cd maverick-ai

# 2. Run setup (automatic)
setup.bat

# 3. Start development
start-dev.bat

# 4. Press Alt+Space in Electron window to test
```

### Mac/Linux Users
```bash
# 1. Clone and enter project
git clone https://github.com/sunnydev07/maverick-ai.git
cd maverick-ai

# 2. Run setup (automatic)
bash setup.sh

# 3. Start development
bash start-dev.sh

# 4. Press Alt+Space in Electron window to test
```

---

## Full Installation & Configuration

### Part 1: Prerequisites

**Windows:**
- Install Node.js from https://nodejs.org (LTS version)
- Restart computer after installation
- Verify: `node -v` in Command Prompt

**Mac:**
```bash
# Install Node.js via Homebrew
brew install node
node -v
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install nodejs npm
node -v
```

### Part 2: Clone Project

```bash
git clone https://github.com/sunnydev07/maverick-ai.git
cd maverick-ai
```

### Part 3: Install Dependencies

**Windows:**
```bash
setup.bat
```

**Mac/Linux:**
```bash
bash setup.sh
```

Or manual installation:
```bash
pnpm install
pnpm build
```

### Part 4: Start Services

**Windows:**
```bash
start-dev.bat
```

**Mac/Linux:**
```bash
bash start-dev.sh
```

Or manual:
```bash
# Terminal 1: Worker
cd packages/worker && pnpm dev

# Terminal 2: Electron  
cd packages/electron && pnpm dev
```

### Part 5: Initial Configuration

In the Electron window that opens:
1. **LLM Provider**: Select "Ollama" (easiest to start)
2. **Model**: Enter `llama2`
3. **Worker URL**: Enter `http://localhost:8787`
4. **TTS Voice**: Select "English (US)"
5. **Screenshot Mode**: Select "Full Desktop"
6. **Memory**: Select "Session Only"
7. Click **Save Settings**

---

## Cloudflare Worker Secrets

To configure API keys for different LLM providers, use Wrangler:

```bash
# Navigate to worker directory
cd packages/worker

# Set secrets (stored securely in Cloudflare)
wrangler secret put OPENROUTER_API_KEY
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put GOOGLE_API_KEY
wrangler secret put OPENAI_API_KEY
```

When prompted, paste your API key and press Enter.

---

## Provider Setup Guide

### 1. Ollama (Recommended for Beginners - Local & Free)

**No API key needed! Runs 100% locally.**

**Installation:**
1. Download from [ollama.ai](https://ollama.ai)
2. Run installer (Windows) or follow Mac/Linux instructions
3. Open terminal/command prompt
4. Run: `ollama serve`
5. In another terminal: `ollama pull llama2`

**In Maverick AI Settings:**
- Provider: `Ollama`
- Model: `llama2` (or any other model you pulled)
- Worker URL: `http://localhost:8787`

**Supported Models:**
```
ollama pull llama2          # 7B model
ollama pull llama2:13b      # 13B model  
ollama pull mistral         # Mistral 7B
ollama pull neural-chat     # NeuralChat 7B
ollama pull dolphin-mixtral # Dolphin Mixtral
```

---

### 2. OpenRouter (Easy - Multi-Model Access)

**Get Started:**
1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Go to Account → API Keys
3. Copy your API key

**Add to Maverick AI:**
```bash
cd packages/worker
wrangler secret put OPENROUTER_API_KEY
# Paste your key when prompted
```

**In Settings Panel:**
- Provider: `OpenRouter`
- Model: `openai/gpt-4-turbo`, `meta-llama/llama-2-70b`, `mistralai/mistral-large`, etc.
- Worker URL: `http://localhost:8787`

**Popular Models:**
```
openai/gpt-4-turbo           # Most powerful
openai/gpt-3.5-turbo         # Fast and cheap
meta-llama/llama-2-70b       # Open source, powerful
mistralai/mistral-large      # Good balance
```

**Cost:** Pay-per-token, variable pricing

---

### 3. Claude (Anthropic - High Quality)

**Get Started:**
1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Go to Account → API Keys
3. Create new key and copy it

**Add to Maverick AI:**
```bash
cd packages/worker
wrangler secret put ANTHROPIC_API_KEY
# Paste your key when prompted
```

**In Settings Panel:**
- Provider: `Claude`
- Model: `claude-opus-4.6`, `claude-sonnet-4-20250514`
- Worker URL: `http://localhost:8787`

**Available Models:**
```
claude-opus-4.6              # Most capable
claude-sonnet-4-20250514     # Fast and capable
claude-haiku-3-5             # Fast and cheap
```

**Cost:** $15/million input tokens, $75/million output tokens

---

### 4. Gemini (Google - Powerful)

**Get Started:**
1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Follow setup wizard
4. Copy your API key

**Add to Maverick AI:**
```bash
cd packages/worker
wrangler secret put GOOGLE_API_KEY
# Paste your key when prompted
```

**In Settings Panel:**
- Provider: `Gemini`
- Model: `gemini-1.5-flash`, `gemini-1.5-pro`
- Worker URL: `http://localhost:8787`

**Available Models:**
```
gemini-1.5-pro              # Most powerful
gemini-1.5-flash            # Fast and efficient
gemini-1.0-pro              # Older but capable
```

**Cost:** Free tier available (with rate limits), then paid

---

## Testing Your Configuration

### Test 1: Verify Worker is Running

```bash
curl http://localhost:8787/health
```

**Expected response:**
```json
{
  "status": "ok",
  "version": "0.1.0",
  "timestamp": "2026-04-18T...",
  "uptime": 123.45
}
```

### Test 2: Test LLM Endpoint

**Ollama:**
```bash
curl -X POST http://localhost:8787/llm \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Say hello world"}],
    "model": "llama2",
    "provider": "ollama"
  }'
```

**Claude:**
```bash
curl -X POST http://localhost:8787/llm \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Say hello world"}],
    "model": "claude-opus-4.6",
    "provider": "claude"
  }'
```

### Test 3: Full Pipeline in Electron

1. Open Electron app (should be running)
2. In Settings Panel, verify configuration
3. Press **Alt+Space** anywhere
4. Wait for "Recording..." status
5. Say: "What do you see?"
6. Release the hotkey
7. Hear AI response

---

## Environment Variables (Advanced)

Create `.env` file in project root for custom configuration:

```bash
# .env (in project root)

# Electron settings
VITE_DEV_SERVER_URL=http://localhost:5173

# Worker environment (packages/worker/.env)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
OPENROUTER_API_KEY=sk-or-...
OLLAMA_BASE_URL=http://localhost:11434
```

---

## Troubleshooting Setup

### "Command not found: pnpm"

**Windows:**
```bash
npm install -g pnpm
```

**Mac:**
```bash
brew install pnpm
```

**Linux:**
```bash
npm install -g pnpm
```

Then run setup again.

### "Port 8787 already in use"

**Windows:**
```bash
# Find process using port 8787
netstat -ano | findstr :8787

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find process
lsof -i :8787

# Kill process
kill -9 <PID>
```

Or change port in `packages/worker/wrangler.toml`:
```toml
main = "src/index.ts"
name = "maverick-worker"
port = 8788  # Change to different port
```

### "Ollama model not found"

```bash
# List available models
ollama list

# Pull missing model
ollama pull llama2

# Check it works
ollama show llama2
```

### "Settings don't save"

```bash
# Clear Electron cache
rm -rf ~/.config/Electron/
# or on Windows: %APPDATA%\Electron

# Restart app
pnpm dev:electron
```

---

## API Testing with Postman

### Import Collection

Create a new Postman collection with these endpoints:

**Health Check:**
```
GET http://localhost:8787/health
```

**LLM Request:**
```
POST http://localhost:8787/llm
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "model": "llama2",
  "provider": "ollama",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Provider Diagnostics:**
```
GET http://localhost:8787/health/providers
```

---

## Production Deployment

### Build Windows Installer

```bash
cd packages/electron
pnpm build

# Output in dist/:
# - Maverick AI Setup 0.1.0.exe (NSIS installer)
# - Maverick AI 0.1.0.exe (Portable)
```

### Deploy Worker to Production

```bash
# Set up Cloudflare account
wrangler login

# Navigate to worker
cd packages/worker

# Set production secrets
wrangler secret put ANTHROPIC_API_KEY --env production
wrangler secret put GOOGLE_API_KEY --env production
# ... etc for all providers

# Deploy
wrangler deploy --env production
```

---

## Performance Optimization

### For Better Response Speed:

1. **Use Ollama for testing** - Instant local responses
2. **Cache recent queries** - Reduce redundant API calls
3. **Use smaller models** - llama2:7b faster than 13b
4. **Batch requests** - Combine multiple queries

### For Better Quality:

1. **Use Claude or GPT-4** for complex tasks
2. **Increase max_tokens** for longer responses
3. **Adjust temperature** (0.0-1.0, default 0.7)
4. **Provide context** in screenshot captures

---

## Switching Between Providers

You can easily switch providers without restarting:

1. **In Settings Panel:**
   - Select new Provider
   - Enter Model name
   - Click "Save Settings"

2. **Changes take effect immediately**

3. **Next Alt+Space will use new provider**

**Example workflow:**
- Testing: Use Ollama (local, fast)
- Production: Switch to Claude (high quality)
- Multiple options: Use OpenRouter

---

## Monitoring & Logs

### Worker Logs

During development:
```bash
cd packages/worker
pnpm dev
# Logs appear in console
```

### Electron Logs

Open DevTools in Electron (F12):
- Console tab: See JavaScript logs
- Network tab: Monitor API calls
- Storage tab: Check persisted settings

### Check Settings Persistence

In Electron DevTools:
```javascript
// In console
localStorage.getItem('maverickSettings')
```

---

## Support & Resources

| Resource | Purpose |
|----------|---------|
| README.md | Project overview |
| QUICKSTART.md | 5-minute setup |
| USE.md | Practical examples |
| INSTALL.md | Detailed installation |
| INTEGRATION.md | Integration checklist |
| CODEBASE_AUDIT.md | All fixes applied |
| ARCHITECTURE.md | Technical details |

---

## Verification Checklist

Before considering setup complete:

- [ ] Node.js installed (`node -v` shows version)
- [ ] Project cloned
- [ ] Dependencies installed (`pnpm install` successful)
- [ ] Build passed (`pnpm build` successful)
- [ ] Worker running (`curl http://localhost:8787/health` works)
- [ ] Electron app opens
- [ ] Settings saved successfully
- [ ] Alt+Space captures screenshot
- [ ] AI response heard

All checked? **You're ready to use Maverick AI!** 🎉

---

**Last Updated:** 2026-04-18  
**Version:** 0.1.0 (Production Ready)

