# Troubleshooting Guide

## Common Issues & Solutions

### "Cannot find module 'electron-vite'"

**Problem**: Dependencies not installed.

**Solution**:
```bash
cd packages/electron
pnpm install
```

### "Worker URL unreachable"

**Problem**: Worker not running or URL incorrect.

**Solution**:
1. Ensure Worker is running:
   ```bash
   cd packages/worker
   pnpm dev
   ```
2. Check it's at `http://localhost:8787`:
   ```bash
   curl http://localhost:8787/health
   ```
   Should return `{"status": "ok"}`

3. In Settings Panel, set Worker URL to `http://localhost:8787`

### "Ollama connection refused"

**Problem**: Ollama isn't running or uses different port.

**Solution**:
1. Start Ollama:
   ```bash
   ollama serve
   ```
   Should say `Listening on 127.0.0.1:11434`

2. Pull a model:
   ```bash
   ollama pull llama2
   ```

3. Test Ollama directly:
   ```bash
   curl http://localhost:11434/api/chat \
     -H "Content-Type: application/json" \
     -d '{"model":"llama2","messages":[{"role":"user","content":"hi"}],"stream":false}'
   ```

4. If using different port, update in Worker `wrangler.toml`:
   ```toml
   [vars]
   OLLAMA_BASE_URL = "http://localhost:YOUR_PORT"
   ```

### "Settings not saving"

**Problem**: localStorage issue or incorrect save.

**Solution**:
1. Check browser console for errors: `F12` → Console tab
2. Verify localStorage is enabled
3. Click "Save Settings" button — should show "✓ Settings saved!" message
4. Refresh page — settings should persist

### "Hotkey recorder not working"

**Problem**: Click to record, but nothing happens.

**Solution**:
1. Click "Record" button (should turn green)
2. Press your key combo (e.g., `Ctrl+Shift+A`)
3. Button should return to normal state with new hotkey displayed
4. If not working, check browser console for errors

### "TTS Preview silent"

**Problem**: No sound when clicking "Preview Voice".

**Solution**:
1. Check system volume is up
2. Ensure speakers/headphones are connected
3. Browser may require user interaction first (click somewhere on the page first)
4. Try Chrome instead of Edge/Firefox (better SpeechSynthesis support)

### "Worker API returning 400 errors"

**Problem**: Invalid request format or missing required fields.

**Solution**:
Ensure your request matches schema:

```json
{
  "messages": [
    {"role": "user", "content": "..."}
  ],
  "model": "llama2",
  "provider": "ollama"
}
```

Required fields:
- ✅ `messages` — array of message objects
- ✅ `model` — model name/ID
- ❌ `provider` — optional (defaults to ollama)

### "OpenRouter API Key not working"

**Problem**: Invalid credentials or secret not set.

**Solution**:
1. Get API key from [openrouter.ai](https://openrouter.ai/keys)
2. Set secret:
   ```bash
   cd packages/worker
   wrangler secret put OPENROUTER_API_KEY
   ```
   Paste your key and press Enter

3. Verify it's set:
   ```bash
   wrangler secret list
   ```
   Should show `OPENROUTER_API_KEY ✓`

4. Test with curl:
   ```bash
   curl -X POST http://localhost:8787/llm \
     -H "Content-Type: application/json" \
     -d '{
       "messages": [{"role": "user", "content": "test"}],
       "model": "openai/gpt-4o",
       "provider": "openrouter"
     }'
   ```

### "Claude API responses are empty"

**Problem**: Missing API key or invalid model name.

**Solution**:
1. Verify ANTHROPIC_API_KEY is set:
   ```bash
   wrangler secret put ANTHROPIC_API_KEY
   ```

2. Use correct model name: `claude-opus-4.6` or `claude-sonnet-4-20250514`

3. Test directly:
   ```bash
   curl -X POST http://localhost:8787/llm \
     -H "Content-Type: application/json" \
     -d '{
       "messages": [{"role": "user", "content": "Hello"}],
       "model": "claude-opus-4.6",
       "provider": "claude"
     }'
   ```

### "Electron app won't start"

**Problem**: Main process crash or vite dev server issue.

**Solution**:
1. Check console for errors:
   ```bash
   cd packages/electron
   pnpm dev
   ```

2. Look for "Uncaught Exception" or module not found errors

3. Try clean rebuild:
   ```bash
   rm -rf node_modules dist
   pnpm install
   pnpm dev
   ```

### "Port 5173 already in use"

**Problem**: Another app using the same port.

**Solution**:
Option A — Kill process on port:
```bash
# macOS/Linux
lsof -ti:5173 | xargs kill -9

# Windows (PowerShell)
Get-Process | Where-Object {$_.Name -eq "node"} | Stop-Process -Force
```

Option B — Use different port in vite.config.ts:
```ts
server: {
  port: 5174  // Use different port
}
```

### "CORS errors in browser console"

**Problem**: Worker CORS policy blocking requests.

**Solution**:
Already configured in `packages/worker/src/index.ts`:
```ts
app.use('*', cors({
  origin: ['tauri://localhost', 'http://localhost:*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization']
}))
```

If you need to add different origins:
1. Edit `packages/worker/src/index.ts`
2. Add your origin to the `origin` array
3. Redeploy worker

### "Build fails with TypeScript errors"

**Problem**: Type checking catching errors.

**Solution**:
1. Check error message for file and line number
2. Fix the issue in code
3. Rebuild:
   ```bash
   pnpm type-check
   pnpm build
   ```

4. For strict mode issues, you can:
   - Add `// @ts-ignore` comment (not recommended)
   - Fix the actual type issue (recommended)

---

## Getting Help

If issue persists:

1. **Check console**: `F12` → Console and Network tabs in Electron window
2. **Check Worker logs**: `wrangler dev` output
3. **Check Ollama logs**: Terminal where `ollama serve` runs
4. **Search GitHub issues**: repo for similar problems
5. **Check SETUP.md**: Ensure your environment is configured correctly

---

## Performance Tips

- **Ollama slow?** Use a faster model: `neural-chat`, `mistral` instead of `llama2`
- **Settings panel lagging?** Close dev tools (F12) to free up memory
- **Worker timeout?** Increase in `wrangler.toml` or choose faster LLM
- **Large responses slow?** Test with shorter max_tokens (default 2048)

---

## Reset & Clean

**Full clean build**:
```bash
# Remove all artifacts and dependencies
rm -rf packages/*/dist packages/*/node_modules packages/*/.wrangler node_modules .turbo

# Reinstall
pnpm install

# Run again
pnpm dev
```

**Reset settings to defaults**:
- Open browser DevTools (F12)
- Go to Application → Storage → Local Storage
- Delete `maverickSettings` entry
- Refresh page

**Clear Ollama cache**:
```bash
ollama list  # See models
ollama rm llama2  # Remove specific model
ollama pull llama2  # Re-download
```
