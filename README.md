# Maverick AI

AI-powered Windows system tray app that captures screenshots and audio, transcribes voice, processes context through AI, and speaks back responses — triggered by a single hotkey.

**Status**: Production Ready | **Platform**: Windows 10+ | **License**: MIT

## Features

- Push-to-talk voice recording
- Screenshot capture (full, active, region) with JPEG compression
- OpenAI Whisper transcription
- Multi-provider LLM processing (Ollama, Claude, Gemini, OpenRouter)
- Real-time TTS playback with waveform visualization
- Global hotkey (default `Alt+Space`)
- System tray with background running
- Encrypted settings storage
- Dark theme, ARIA labels, keyboard navigation

## Quick Start

```bash
git clone https://github.com/sunnydev07/maverick-ai.git
cd maverick-ai
pnpm install
```

1. Worker: cd packages/worker && pnpm dev → http://localhost:8787

2. Ollama (optional): ollama serve then ollama pull llama2

3. Electron: cd packages/electron && pnpm dev

4. Open Settings, choose provider, set Worker URL to http://localhost:8787, save

5. Press Alt+Space to test

**API Endpoints**

_Endpoint	  Method	    Purpose_
/llm	      POST	      Chat with context (provider, model)
/transcribe	POST	      Base64 audio → text
/speak	    POST	      Text → speech
/health	    GET	        Worker & provider status

**Troubleshooting**

Worker not connecting: check localhost:8787 accessible

No audio: verify Windows mic permissions

Settings lost: clear app cache

TTS silent: check speakers/volume

See TROUBLESHOOTING.md for more.

Version: 0.1.0 | Updated: 2026-04-09
