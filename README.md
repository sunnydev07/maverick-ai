# 🎙️ Maverick AI — System-Tray AI Desktop Assistant

[![Electron](https://img.shields.io/badge/Electron-30+-47848F?style=flat-square&logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare)](https://workers.cloudflare.com/)

**Maverick AI** is a production-ready Windows desktop assistant that captures screenshots and voice input with a single hotkey (`Alt + Space`), processes visual & speech context through AI, and streams audio responses back to you.

---

## ✨ Features

- ⌨️ **Global Hotkey Activation**: Press `Alt + Space` anywhere on Windows to launch voice & visual capture.
- 📸 **Smart Screen & Voice Capture**: Simultaneous screenshot snapshot (full/region) + Whisper voice transcription.
- 🔊 **TTS & Waveform Visualization**: Live audio response playback rendered with Web Audio API waveforms.
- 🤖 **Multi-Provider LLM Engine**: Switch seamlessly between local **Ollama**, **Claude**, **Gemini**, and **OpenRouter**.
- 📌 **System Tray & Auto-Updates**: Runs quietly in the background with auto-update capability.

---

## 🛠️ Architecture & Tech Stack

```
[ Windows Desktop ] --( Alt+Space )--> [ Electron + React UI ]
                                              |
                                     ( IPC / HTTP API )
                                              v
                              [ Cloudflare Worker (Hono API) ]
                                              |
                     +------------------------+------------------------+
                     |                        |                        |
            [ Speech-to-Text ]         [ LLM Routers ]         [ Text-to-Speech ]
            (OpenAI Whisper)       (Ollama/Claude/Gemini)       (OpenAI TTS)
```

---

## 🚀 Quick Start

### 1. Installation

```bash
git clone https://github.com/sunnydev07/maverick-ai.git
cd maverick-ai
pnpm install
```

### 2. Run Local Environment

```bash
# Terminal 1: Cloudflare Worker API
cd packages/worker
pnpm dev

# Terminal 2: Electron Desktop Client
cd packages/electron
pnpm dev
```

---

## 📄 License

Distributed under the MIT License. Created by [Sunny Kumar Dev](https://github.com/sunnydev07).
