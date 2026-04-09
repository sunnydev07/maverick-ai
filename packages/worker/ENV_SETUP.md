# Environment Setup Guide

Configure your Cloudflare Worker with LLM provider credentials.

## Overview

The Worker supports 4 LLM providers:
1. **Ollama** (local) - No API key needed
2. **OpenRouter** (multi-model routing)
3. **Claude** (Anthropic)
4. **Gemini** (Google)

At least one provider must be configured.

## Ollama (Local, Recommended for Development)

### What is Ollama?

Ollama runs large language models locally on your computer. Perfect for:
- Development without API costs
- Offline operation
- Privacy (no data sent to cloud)
- Fast iteration

### Installation

1. Download Ollama: https://ollama.ai
2. Install on Windows/Mac/Linux
3. Open terminal and run:

```bash
ollama run llama2
```

This downloads and runs the Llama 2 model (~4 GB).

### Configuration

The Worker defaults to Ollama on `http://localhost:11434`.

If you're running Ollama on a different machine:

```bash
wrangler secret put OLLAMA_BASE_URL
# Enter: http://your-machine-ip:11434
```

### Test Ollama Connection

```bash
# From any machine on your network
curl http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": false
  }'
```

## OpenRouter (Multi-Model)

### What is OpenRouter?

OpenRouter is a unified API for accessing many LLMs:
- GPT-4, Claude, Llama, Mistral, and 100+ more
- No vendor lock-in
- Competitive pricing

### Get API Key

1. Visit https://openrouter.ai
2. Sign up (free account)
3. Go to Settings → API Keys
4. Copy your API key

### Configuration

```bash
wrangler secret put OPENROUTER_API_KEY
# Paste your key when prompted
```

### Popular Models

- `openai/gpt-4o` - Best quality, higher cost
- `openai/gpt-4-turbo` - Fast and capable
- `meta-llama/llama-3-70b` - Open source, very capable
- `anthropic/claude-3-sonnet` - Balanced quality/speed
- `mistralai/mistral-7b` - Fast and efficient

### Test OpenRouter

```bash
curl -X POST http://localhost:8787/llm \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "model": "openai/gpt-4o",
    "provider": "openrouter"
  }'
```

## Claude (Anthropic)

### What is Claude?

Claude is Anthropic's AI assistant. Known for:
- High quality reasoning
- Long context window (200K tokens)
- Strong safety record

### Get API Key

1. Visit https://console.anthropic.com
2. Sign up (requires credit card)
3. Go to API Keys section
4. Create new key
5. Copy your key (never revealed again)

### Configuration

```bash
wrangler secret put ANTHROPIC_API_KEY
# Paste your key when prompted
```

### Models

- `claude-opus-4.6` - Latest, most capable
- `claude-sonnet-4-20250514` - Fast and smart
- `claude-haiku-3` - Very fast, lower cost

### Pricing

Claude pricing is per-token (input/output):
- Opus: $15/1M input, $75/1M output
- Sonnet: $3/1M input, $15/1M output
- Haiku: $0.80/1M input, $4/1M output

### Test Claude

```bash
curl -X POST http://localhost:8787/llm \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "model": "claude-opus-4.6",
    "provider": "claude"
  }'
```

## Gemini (Google)

### What is Gemini?

Google's AI model. Features:
- Multimodal (text, images, video)
- Good reasoning capabilities
- Competitive pricing

### Get API Key

1. Visit https://makersuite.google.com/app/apikey
2. Create new API key (free, no credit card)
3. Copy your key

### Configuration

```bash
wrangler secret put GOOGLE_API_KEY
# Paste your key when prompted
```

### Models

- `gemini-1.5-pro` - Most capable
- `gemini-1.5-flash` - Fast, cheaper
- `gemini-2.0-flash` - Latest (if available)

### Pricing

Gemini pricing is very competitive:
- Flash: $0.075/1M input, $0.30/1M output
- Pro: $1.50/1M input, $6/1M output

### Test Gemini

```bash
curl -X POST http://localhost:8787/llm \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "model": "gemini-1.5-flash",
    "provider": "gemini"
  }'
```

## Manage Secrets

### View Secret Names

```bash
wrangler secret list

# Output (values hidden for security):
# Name: OLLAMA_BASE_URL
# Name: OPENROUTER_API_KEY
# Name: ANTHROPIC_API_KEY
# Name: GOOGLE_API_KEY
```

### Update a Secret

```bash
# Delete old secret
wrangler secret delete OPENROUTER_API_KEY

# Add new secret
wrangler secret put OPENROUTER_API_KEY
```

### Deploy After Changes

```bash
wrangler deploy
```

Secrets update immediately after deployment.

## Security Best Practices

### Do's

- ✅ Use `wrangler secret put` for API keys
- ✅ Rotate keys periodically (every 90 days)
- ✅ Use different keys for dev/prod if possible
- ✅ Monitor API usage for unexpected spikes
- ✅ Keep Ollama local (don't expose to internet)

### Don'ts

- ❌ Never commit API keys to Git
- ❌ Never put keys in `.env` files
- ❌ Never hardcode keys in source code
- ❌ Never share keys in Slack/email
- ❌ Don't use production keys for testing

## Cost Estimation

### Ollama (Free)

- Free to use
- Runs on your hardware
- One-time model download (~4-7 GB each)

### OpenRouter

- Average cost: $0.01-0.10 per 1000 tokens
- Typical chat: ~500 tokens per turn
- Cost per message: $0.005-0.05

### Claude

- Expensive: $3-75 per 1M tokens
- Good for critical applications
- Smallest cost with Haiku: $0.80/1M input

### Gemini

- Cheapest: $0.075-1.50 per 1M tokens
- Great value for cost-sensitive apps
- Completely free tier available

## Recommended Setup for Development

```bash
# Primary: Ollama (local, free, fast)
ollama run llama2

# Fallback: One cloud provider
wrangler secret put OPENROUTER_API_KEY  # Most flexible
# OR
wrangler secret put ANTHROPIC_API_KEY   # High quality
# OR
wrangler secret put GOOGLE_API_KEY      # Low cost
```

## Troubleshooting

### "Provider not configured" Error

```json
{
  "success": false,
  "error": "OPENROUTER_API_KEY not configured",
  "code": "LLM_ERROR"
}
```

**Solution**:
```bash
wrangler secret put OPENROUTER_API_KEY
# Paste your actual API key
wrangler deploy
```

### "Invalid API Key" Error

- Check that you copied the key correctly (no extra spaces)
- Some providers generate new keys automatically, invalidating old ones
- Generate a fresh API key and try again

### Ollama Connection Refused

```
Failed to call Ollama: fetch failed
```

**Solutions**:
1. Verify Ollama is running: `ollama list`
2. Check URL: `curl http://localhost:11434/api/tags`
3. If on different machine, use IP address instead of localhost

## Next Steps

1. Choose a provider (recommend Ollama for development)
2. Set up environment variables above
3. Run `wrangler deploy`
4. Test with curl examples in API.md
5. Configure Electron app to use your worker URL

See DEPLOY.md for deployment instructions.
