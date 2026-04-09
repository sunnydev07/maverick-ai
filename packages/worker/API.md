# Maverick AI Worker API Reference

## Base URL

```
Development: http://localhost:8787
Production: https://maverick-ai.<your-domain>.workers.dev
```

## Authentication

No authentication required for development. Production deployments should add API key validation if needed.

## Request Headers

All requests should include:

```
Content-Type: application/json
```

All responses include tracing headers:

```
X-Request-ID: <unique-request-id>
X-Response-Time: <duration-in-ms>ms
```

## Endpoints

### Health Check

Get worker status and version.

**Request**:
```http
GET /health
```

**Response** (200 OK):
```json
{
  "status": "ok",
  "version": "0.1.0",
  "timestamp": "2026-04-09T12:34:56.789Z",
  "uptime": 3600.5
}
```

### Provider Diagnostics

Check connectivity and latency of all LLM providers.

**Request**:
```http
GET /health/providers
```

**Response** (200 OK):
```json
{
  "providers": {
    "ollama": {
      "status": "ok",
      "latency_ms": 120,
      "timestamp": "2026-04-09T12:34:56.789Z"
    },
    "openrouter": {
      "status": "ok",
      "latency_ms": 450,
      "timestamp": "2026-04-09T12:34:56.789Z"
    },
    "claude": {
      "status": "ok",
      "latency_ms": 380,
      "timestamp": "2026-04-09T12:34:56.789Z"
    },
    "gemini": {
      "status": "error",
      "error": "GOOGLE_API_KEY not configured",
      "latency_ms": 45,
      "timestamp": "2026-04-09T12:34:56.789Z"
    }
  }
}
```

### LLM Request

Send a message to an LLM provider and get a response.

**Request**:
```http
POST /llm
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "What is the capital of France?"
    }
  ],
  "model": "llama2",
  "provider": "ollama",
  "temperature": 0.7,
  "max_tokens": 2048
}
```

**Parameters**:

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `messages` | Array | - | Yes | Chat history. Each message has `role` (user/assistant/system) and `content` (string) |
| `model` | String | - | Yes | Model name/ID. Examples: `llama2`, `gpt-4o` (OpenRouter), `claude-opus-4.6` (Claude), `gemini-1.5-flash` |
| `provider` | String | `ollama` | No | Provider to use: `ollama`, `openrouter`, `claude`, `gemini` |
| `temperature` | Number | 0.7 | No | Randomness (0-2). Lower = more deterministic, Higher = more creative |
| `max_tokens` | Number | 2048 | No | Maximum response length in tokens (varies by provider) |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": "The capital of France is Paris.",
    "model": "llama2",
    "stop_reason": "end_turn"
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Validation error",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "path": "messages",
      "message": "Required"
    }
  ],
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "success": false,
  "error": "Failed to call OpenRouter: OPENROUTER_API_KEY not configured",
  "code": "LLM_ERROR",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Status Codes**:
- `200 OK` - Request successful
- `400 Bad Request` - Validation error, invalid JSON, or missing required fields
- `413 Payload Too Large` - Request body exceeds 1 MB
- `500 Internal Server Error` - Server error or provider unreachable
- `504 Gateway Timeout` - Request exceeded 30 second timeout

### Transcription (Placeholder - Phase 4+)

Convert audio to text.

**Request**:
```http
POST /transcribe
Content-Type: application/json

{
  "audio_data": "base64-encoded-wav-or-webm",
  "language": "en"
}
```

**Parameters**:

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `audio_data` | String | - | Yes | Base64 encoded audio (WAV or WebM format) |
| `language` | String | `en` | No | ISO 639-1 language code (e.g., `fr`, `es`, `de`) |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "text": "[Transcription placeholder - Phase 4+]",
    "confidence": 0.95
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Text-to-Speech (Placeholder - Phase 4+)

Convert text to audio.

**Request**:
```http
POST /speak
Content-Type: application/json

{
  "text": "Hello, this is Maverick AI speaking.",
  "voice": "en-US",
  "provider": "windows"
}
```

**Parameters**:

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `text` | String | - | Yes | Text to convert to speech |
| `voice` | String | `en-US` | No | Voice/language: `en-US`, `en-GB`, `fr-FR` |
| `provider` | String | `windows` | No | TTS provider: `windows`, `elevenlabs`, `openai` |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "audio_data": "base64-encoded-wav",
    "duration_ms": 2500
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request format or missing required fields |
| `INVALID_JSON` | 400 | Request body is not valid JSON |
| `PAYLOAD_TOO_LARGE` | 413 | Request body exceeds 1 MB limit |
| `LLM_ERROR` | 500 | Error calling LLM provider (check provider status) |
| `TRANSCRIPTION_ERROR` | 500 | Error during audio transcription |
| `TTS_ERROR` | 500 | Error during text-to-speech conversion |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `NOT_FOUND` | 404 | Endpoint not found |

## Examples

### cURL - Ollama (Local)

```bash
curl -X POST http://localhost:8787/llm \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Say hello"}],
    "model": "llama2",
    "provider": "ollama"
  }'
```

### cURL - OpenRouter (Multi-model)

```bash
curl -X POST https://maverick-ai.workers.dev/llm \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Explain AI"}],
    "model": "openai/gpt-4o",
    "provider": "openrouter"
  }'
```

### JavaScript/Electron

```typescript
const response = await window.electronAPI['save-settings']({
  provider: 'openrouter',
  modelName: 'openai/gpt-4o',
  workerUrl: 'https://maverick-ai.workers.dev'
})

// Call LLM endpoint via IPC
const llmResponse = await fetch('https://maverick-ai.workers.dev/llm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello' }],
    model: 'openai/gpt-4o',
    provider: 'openrouter'
  })
})

const data = await llmResponse.json()
```

### Python

```python
import requests

response = requests.post(
    'https://maverick-ai.workers.dev/llm',
    json={
        'messages': [{'role': 'user', 'content': 'Hello'}],
        'model': 'llama2',
        'provider': 'ollama'
    },
    headers={'Content-Type': 'application/json'}
)

data = response.json()
print(data['data']['content'])
```

## Rate Limiting (Coming Phase 5)

Currently no rate limiting. Cloudflare free tier:
- 100,000 requests/day
- 50 ms CPU time per request

## CORS

Worker is configured for CORS with these origins:
- `file://` (Electron desktop)
- `tauri://localhost` (Alternative desktop framework)
- `http://localhost:*` (Local development)

Production CORS configuration should be updated in `wrangler.toml`.

## Response Size Limits

- Maximum response: ~10 MB (Cloudflare limit)
- Maximum payload in: 1 MB (enforced by middleware)
- Audio data: Base64 encoded, so ~33% larger than binary

## Versioning

Current version: 0.1.0

API is stable and backwards-compatible. Version bump indicates new endpoints or breaking changes.
