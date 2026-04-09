# Cloudflare Worker Deployment Guide

## Quick Start

Deploy the Maverick AI Worker in 3 minutes:

```bash
cd packages/worker
npm install
wrangler deploy
```

## Prerequisites

1. **Cloudflare Account** - Free tier works great for development
2. **Wrangler CLI** - `npm install -g wrangler` or `npm install wrangler`
3. **API Keys** - At least one LLM provider configured (see ENV_SETUP.md)

## Environment Setup

Before deploying, configure your LLM provider secrets:

```bash
# Interactive setup
wrangler secret put OLLAMA_BASE_URL
wrangler secret put OPENROUTER_API_KEY
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put GOOGLE_API_KEY
```

See `ENV_SETUP.md` for detailed provider configuration.

## Deployment Steps

### 1. Local Testing

```bash
# Start the dev server
wrangler dev

# Test the health endpoint
curl http://localhost:8787/health

# Test LLM endpoint
curl -X POST http://localhost:8787/llm \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "model": "llama2",
    "provider": "ollama"
  }'
```

### 2. Deploy to Cloudflare

```bash
# Deploy to production
wrangler deploy

# Get your worker URL (will be shown after deployment)
# https://maverick-ai.<your-domain>.workers.dev
```

### 3. Configure Electron App

Update the Worker URL in the Maverick AI Settings Panel:
- Open Settings → LLM Provider section
- Paste your Cloudflare Worker URL
- Click "Test" to verify connectivity

## Configuration

### wrangler.toml

The `wrangler.toml` file contains:
- Worker name and main entry point
- Environment variables (placeholder references)
- Compatibility date
- Node.js compatibility flag

```toml
name = "maverick-ai"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[env.production]
routes = [
  { pattern = "maverick.example.com/api/*", zone_name = "example.com" }
]
```

### Secrets (Encrypted Environment Variables)

Secrets are stored securely and never logged:

```bash
# View all secret names (values hidden)
wrangler secret list

# Delete a secret
wrangler secret delete OPENROUTER_API_KEY
```

## Performance & Limits

### Cloudflare Worker Limits
- **Timeout**: 30 seconds per request (CPU time)
- **Memory**: Up to 128 MB per worker
- **Request size**: ~10 MB (enforced by Cloudflare)
- **Payload limit**: 1 MB (enforced by our middleware)

### Optimization Tips

1. **Use request IDs** - Trace issues across systems
2. **Monitor latency** - Check `/health/providers` for slowdowns
3. **Cache responses** - Implement response caching for repeated queries
4. **Enable compression** - Hono auto-compresses JSON responses

## Monitoring & Debugging

### View Logs

```bash
# Stream live logs
wrangler tail

# Filter by status code
wrangler tail --status 500

# View logs in Cloudflare Dashboard
# Workers > Your Worker > Logs tab
```

### Request Tracing

Every request includes an `X-Request-ID` header for tracing:

```bash
curl -v https://maverick-ai.workers.dev/health

# Response headers include:
# X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
# X-Response-Time: 42ms
```

### Health Diagnostics

```bash
# Check provider status
curl https://maverick-ai.workers.dev/health/providers

# Response:
{
  "providers": {
    "ollama": { "status": "ok", "latency_ms": 120 },
    "openrouter": { "status": "ok", "latency_ms": 450 },
    "claude": { "status": "ok", "latency_ms": 380 },
    "gemini": { "status": "error", "error": "GOOGLE_API_KEY not configured" }
  }
}
```

## Troubleshooting

### 401 Unauthorized (API Keys)

**Problem**: "OPENROUTER_API_KEY not configured"

**Solution**:
```bash
wrangler secret put OPENROUTER_API_KEY
# Paste your key when prompted
wrangler deploy
```

### 504 Gateway Timeout

**Problem**: Request times out after 30 seconds

**Causes**:
- LLM provider is slow (check `/health/providers`)
- Internet connection issue
- Provider API down

**Solution**:
- Reduce `max_tokens` in requests
- Use a faster provider (Ollama is local, fastest)
- Check provider status page

### CORS Errors in Electron App

**Problem**: "Access to XMLHttpRequest has been blocked by CORS policy"

**Solution**: Already configured in wrangler.toml for `tauri://localhost` and `http://localhost:*`

If you have a custom domain, update:
```toml
[cors]
origin = ["file://", "tauri://localhost", "http://localhost:*", "https://your-domain.com"]
```

### Invalid JSON Responses

**Problem**: "Unexpected token < in JSON at position 0"

**Cause**: Worker returning HTML error page instead of JSON (usually 404)

**Solution**: Check endpoint URL - must be exactly:
- `/llm` (POST)
- `/transcribe` (POST)
- `/speak` (POST)
- `/health` (GET)
- `/health/providers` (GET)

## Cost Estimation

Cloudflare Workers free tier:
- **Requests**: 100,000 free requests/day
- **CPU time**: 50 ms free CPU time per request
- **Storage**: Free (Durable Objects extra)

For most users, the free tier is sufficient. Billing starts at $0.50/million requests if you exceed the free tier.

## Security Best Practices

1. **Never commit secrets** - Use `wrangler secret put`, not environment files
2. **Restrict CORS origin** - Only allow known Electron app origins
3. **Validate all inputs** - Zod schemas enforce strict validation
4. **Monitor logs** - Watch for unusual patterns or errors
5. **Rotate API keys** - Regularly update LLM provider keys

## Rollback & Updates

### Deploy a New Version

```bash
# Make changes to src/index.ts or src/providers.ts
git commit -m "Update worker logic"

# Deploy immediately
wrangler deploy

# No downtime - instant deployment
```

### Rollback to Previous Version

```bash
# View recent deployments
wrangler deployments list

# Cloudflare automatically keeps last 10 deployments
# To rollback: git revert and wrangler deploy
```

## Next Steps

- **Phase 4**: Add Whisper transcription and TTS streaming
- **Phase 5**: Implement response caching and rate limiting
- **Phase 6**: Add analytics and monitoring dashboard

See `../ROADMAP.md` for full development plan.
