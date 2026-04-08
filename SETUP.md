# Environment Setup Guide

## Cloudflare Worker Secrets

To configure API keys for different LLM providers, use Wrangler:

```bash
# Navigate to worker directory
cd packages/worker

# Set secrets (stored securely in Cloudflare)
wrangler secret put OPENROUTER_API_KEY
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put GOOGLE_API_KEY
```

When prompted, paste your API key and press Enter.

## Provider Setup

### Ollama (Default - Local)

**No setup required!** Ollama runs locally on your machine.

1. Download from [ollama.ai](https://ollama.ai)
2. Run: `ollama serve`
3. In another terminal, pull a model:
   ```bash
   ollama pull llama2
   ```
4. Set in Settings Panel:
   - Provider: `Ollama`
   - Model: `llama2`
   - Worker URL: `http://localhost:11434` (for local testing)

### OpenRouter

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Get your API key from dashboard
3. Add to Worker:
   ```bash
   wrangler secret put OPENROUTER_API_KEY
   ```
4. Set in Settings Panel:
   - Provider: `OpenRouter`
   - Model: `openai/gpt-4o`, `meta-llama/llama-2-70b`, etc.

### Claude (Anthropic)

1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add to Worker:
   ```bash
   wrangler secret put ANTHROPIC_API_KEY
   ```
4. Set in Settings Panel:
   - Provider: `Claude`
   - Model: `claude-opus-4.6`, `claude-sonnet-4-20250514`, etc.

### Gemini (Google)

1. Get API key from [ai.google.dev](https://ai.google.dev)
2. Add to Worker:
   ```bash
   wrangler secret put GOOGLE_API_KEY
   ```
3. Set in Settings Panel:
   - Provider: `Gemini`
   - Model: `gemini-1.5-flash`, `gemini-1.5-pro`, etc.

## Testing the Setup

### Test Settings Panel (Electron)

```bash
cd packages/electron
pnpm dev
```

1. Configure your preferred provider
2. Enter model name
3. Set Worker URL (e.g., `http://localhost:8787` for local dev)
4. Click "Save Settings"

### Test Worker Locally

```bash
cd packages/worker
pnpm dev
```

Test with curl:

```bash
# Test Ollama
curl -X POST http://localhost:8787/llm \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "model": "llama2",
    "provider": "ollama"
  }'

# Test OpenRouter
curl -X POST http://localhost:8787/llm \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "model": "openai/gpt-4o",
    "provider": "openrouter"
  }'
```

## Deploying Worker

```bash
cd packages/worker
wrangler deploy
```

Get your Worker URL from the deployment output, then update it in the Settings Panel.

## Windows Installation (Phase 2)

Once Phase 2 is complete, build the Windows installer:

```bash
cd packages/electron
pnpm build
```

Creates:
- `dist/Maverick AI Setup 0.1.0.exe` (NSIS installer)
- `dist/Maverick AI 0.1.0.exe` (Portable version)
