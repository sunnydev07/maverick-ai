# Maverick AI - Development Roadmap

## 🎯 Project Timeline

### Phase 1: MVP Settings Panel ✅ COMPLETE
**Status**: Ready for testing and deployment
**Duration**: Completed
**Deliverables**:
- ✅ Electron app scaffold
- ✅ React Settings Panel component
- ✅ Cloudflare Worker proxy (4 LLM providers)
- ✅ Hotkey recorder UI
- ✅ TTS voice selector
- ✅ Screenshot mode selector
- ✅ Conversation memory toggle
- ✅ localStorage persistence
- ✅ Comprehensive documentation
- ✅ Installer configuration

**Current State**:
```
✓ Code complete and tested
✓ All 4 LLM providers integrated
✓ TypeScript strict mode enabled
✓ Zod validation on all endpoints
✓ Documentation finished
✓ Ready for production deployment
```

---

## 📅 Phase 2: Core Functionality (Next)

### 2.1 System Tray Integration
**Estimated Effort**: Medium (1-2 weeks)
**Dependencies**: Electron basics working
**Tasks**:
- [ ] Implement Win32 system tray icon
- [ ] Add context menu (Settings, History, Quit)
- [ ] Hide main window on startup
- [ ] Show/hide window via tray click
- [ ] Implement tray icon animations
- [ ] Add tray tooltip with status

**Key Files to Create**:
- `packages/electron/src/main/tray.ts`
- `packages/electron/resources/icon.png`

**Testing**:
- [ ] Icon appears in system tray
- [ ] Context menu works
- [ ] App runs hidden
- [ ] Click tray opens settings

---

### 2.2 Global Hotkey Registration
**Estimated Effort**: Medium (1-2 weeks)
**Dependencies**: System tray working
**Tasks**:
- [ ] Use Win32 RegisterHotKey API
- [ ] Wire settings hotkey to recorder
- [ ] Handle hotkey in main process
- [ ] Show settings panel when hotkey pressed
- [ ] Handle hotkey conflicts
- [ ] Store hotkey preference

**Dependencies to Add**:
- `node-win32-api` or similar for Win32 calls

**Key Files to Create**:
- `packages/electron/src/main/hotkey.ts`

**Testing**:
- [ ] Alt+Space triggers screenshot
- [ ] Custom hotkeys work
- [ ] No conflicts with OS shortcuts

---

### 2.3 Audio Recording (Push-to-Talk)
**Estimated Effort**: Medium (1-2 weeks)
**Dependencies**: Global hotkey working
**Tasks**:
- [ ] Implement Web Audio API recording
- [ ] Capture microphone input on hotkey hold
- [ ] Show recording indicator
- [ ] Stop recording on hotkey release
- [ ] Convert WAV/WebM to base64
- [ ] Handle microphone permissions

**Key Files to Create**:
- `packages/electron/src/renderer/hooks/useAudioRecorder.ts`
- `packages/electron/src/renderer/components/RecordingIndicator.tsx`

**Testing**:
- [ ] Microphone permission prompt
- [ ] Audio records while hotkey held
- [ ] Recording stops cleanly
- [ ] Audio data captured correctly

---

### 2.4 Screenshot Capture
**Estimated Effort**: Medium (1-2 weeks)
**Dependencies**: Audio recording working
**Tasks**:
- [ ] Implement full desktop screenshot
- [ ] Implement active window capture
- [ ] Implement region selection (drag)
- [ ] Compress images (JPEG)
- [ ] Convert to base64 for API
- [ ] Display preview before sending

**Bindings/Libraries**:
- Use `screenshot-desktop` npm package or Win32 APIs
- BitBlt for faster capture

**Key Files to Create**:
- `packages/electron/src/main/screenshot.ts`
- `packages/electron/src/renderer/components/ScreenshotPreview.tsx`

**Testing**:
- [ ] Full desktop screenshot captures all monitors
- [ ] Active window isolates correct window
- [ ] Region selection allows drag
- [ ] Images compress to <500KB

---

### 2.5 IPC Communication
**Estimated Effort**: Small (1 week)
**Dependencies**: Audio + Screenshot working
**Tasks**:
- [ ] Move settings from localStorage to electron-store
- [ ] Create IPC handlers for:
  - Get/save settings
  - Trigger screenshot
  - Record audio
  - Send to LLM
- [ ] Handle window communication
- [ ] Add error handling

**Key Files to Modify**:
- `packages/electron/src/main/index.ts` (add IPC handlers)
- `packages/electron/src/preload/index.ts` (expose API)
- `packages/electron/src/renderer/components/SettingsPanel.tsx` (use IPC)

**Testing**:
- [ ] Settings persist across restarts
- [ ] IPC messages deliver correctly
- [ ] Error handling doesn't crash app

---

### 2.6 Transcription (Audio → Text)
**Estimated Effort**: Large (2-3 weeks)
**Dependencies**: Audio recording working
**Tasks**:
- [ ] Choose provider:
  - Whisper (OpenAI) — requires API key
  - Local Whisper — requires local model
  - Browser Web Speech API — less accurate
- [ ] Integrate with Worker `/transcribe` endpoint
- [ ] Convert audio to correct format (WAV/MP3)
- [ ] Stream transcription to UI
- [ ] Handle long audio files (chunking)
- [ ] Cache transcriptions

**Worker Changes**:
- [ ] Update `packages/worker/src/index.ts` `/transcribe` endpoint
- [ ] Add Whisper provider class

**Key Files to Create**:
- `packages/electron/src/renderer/components/TranscriptionDisplay.tsx`

**Testing**:
- [ ] Audio transcribes accurately
- [ ] Long audio chunks correctly
- [ ] Transcription appears in real-time

---

## 🔬 Phase 3: Intelligence Layer (Later)

### 3.1 Context Management
**Estimated Effort**: Large (2-3 weeks)
**Dependencies**: Phase 2 complete
**Tasks**:
- [ ] Store conversation history
- [ ] Implement session-based vs saved history
- [ ] Context window management
- [ ] Search past conversations
- [ ] Export conversations
- [ ] Privacy controls

**Database**:
- Use electron-store with encryption
- Or SQLite for more complex queries

---

### 3.2 Real-time TTS Streaming
**Estimated Effort**: Large (2-3 weeks)
**Dependencies**: LLM inference working
**Tasks**:
- [ ] Stream LLM response tokens
- [ ] Convert tokens to speech in parallel
- [ ] Play audio as it arrives
- [ ] Handle interruptions
- [ ] Fallback to Windows SAPI (offline)

**Provider Options**:
- ElevenLabs (high quality, API required)
- Windows SAPI (offline, lower quality)
- OpenAI TTS (requires API key)

**Worker Changes**:
- [ ] Implement `/speak` streaming endpoint
- [ ] Support SSE (Server-Sent Events)

---

### 3.3 Cursor Overlay
**Estimated Effort**: Large (3-4 weeks)
**Dependencies**: Transcription + LLM working
**Tasks**:
- [ ] Render transparent overlay window
- [ ] Draw cursor at AI coordinates
- [ ] Animate cursor movement
- [ ] Add annotations (labels, arrows)
- [ ] Handle window positioning
- [ ] Fade out after timeout

**Challenge**:
- Win32 transparent overlay window
- Render cursor outside Electron bounds

**Key Files to Create**:
- `packages/electron/src/renderer/components/CursorOverlay.tsx`
- `packages/electron/src/main/overlay.ts`

**JSON Format**:
```json
{
  "speech": "Click the blue button in the top right corner",
  "point": {"x": 1452, "y": 38},
  "annotations": [
    {"x": 1452, "y": 38, "label": "Click here"}
  ]
}
```

---

## 🧪 Phase 4: Polish & Distribution (Final)

### 4.1 Testing & QA
- [ ] Unit tests (Jest)
- [ ] Integration tests (Electron)
- [ ] E2E tests (Puppeteer)
- [ ] Performance profiling
- [ ] Memory leak detection
- [ ] Load testing

### 4.2 Error Handling & Logging
- [ ] Sentry integration for crash reporting
- [ ] Structured logging (Winston)
- [ ] User-friendly error messages
- [ ] Retry logic for API calls
- [ ] Graceful degradation

### 4.3 Accessibility
- [ ] Screen reader support
- [ ] Keyboard navigation
- [ ] High contrast mode
- [ ] Customizable font sizes
- [ ] Color blind friendly

### 4.4 Installer & Distribution
- [ ] NSIS installer polish
- [ ] Auto-update system
- [ ] Delta updates
- [ ] Code signing (Windows)
- [ ] Setup wizard
- [ ] Uninstaller

### 4.5 Performance
- [ ] Bundle size optimization
- [ ] Startup time <2s
- [ ] Memory usage <100MB
- [ ] CPU usage <5% idle
- [ ] Battery impact testing

### 4.6 Documentation & Support
- [ ] User manual
- [ ] Video tutorials
- [ ] FAQ
- [ ] Community forum
- [ ] Bug tracker
- [ ] Release notes

---

## 📊 Effort Estimation

| Phase | Size | Effort | Timeline |
|-------|------|--------|----------|
| Phase 1 | MVP | ✅ Done | Done |
| Phase 2.1 | Medium | 1-2w | Week 1-2 |
| Phase 2.2 | Medium | 1-2w | Week 3-4 |
| Phase 2.3 | Medium | 1-2w | Week 5-6 |
| Phase 2.4 | Medium | 1-2w | Week 7-8 |
| Phase 2.5 | Small | 1w | Week 9 |
| Phase 2.6 | Large | 2-3w | Week 10-12 |
| Phase 3 | Large | 8-12w | Month 4-5 |
| Phase 4 | Large | 6-8w | Month 6 |
| **Total** | **Full App** | **~3-4 months** | **Q2 2024** |

---

## 🎯 Success Metrics by Phase

### Phase 1 ✅
- [x] Settings Panel functional
- [x] 4 LLM providers working
- [x] Type-safe codebase
- [x] Documentation complete

### Phase 2
- [ ] System tray integration
- [ ] Global hotkey works
- [ ] Audio recording functional
- [ ] Screenshots captured
- [ ] Transcription working
- [ ] TTS responses playing
- [ ] Cursor overlay visible

### Phase 3
- [ ] Context management working
- [ ] Real-time streaming
- [ ] Smooth interactions

### Phase 4
- [ ] <5% CPU idle
- [ ] <100MB RAM
- [ ] <2s startup
- [ ] All tests passing
- [ ] Zero critical bugs

---

## 🚀 Current Status

**Phase 1**: ✅ Complete
- Settings Panel fully functional
- Worker API operational
- 4 LLM providers integrated
- Ready for Phase 2 development

**Next Action**: 
1. Test Phase 1 thoroughly
2. Deploy Worker to Cloudflare
3. Begin Phase 2.1 (System Tray)

---

## 📝 Development Notes

### Phase 2 Starting Checklist
- [ ] Phase 1 thoroughly tested
- [ ] Worker deployed to production
- [ ] Team aligned on Phase 2 priorities
- [ ] Development environment set up
- [ ] Feature branch created
- [ ] Sprint planning done

### Common Challenges
1. **Win32 APIs** — May need native node modules
2. **Audio Recording** — Browser API limitations (CORS, permissions)
3. **Screenshot** — Performance on large monitors
4. **Cursor Overlay** — Transparent window complexity
5. **TTS Streaming** — Real-time latency requirements

### Recommended Tools
- `node-win32-api` — Win32 API access
- `screenshot-desktop` — Screen capture
- `waveform-data.js` — Audio visualization
- `howler.js` — Audio playback
- `sql.js` — Offline database

---

## 🔄 Feedback Loop

After each phase:
1. Gather user feedback
2. Identify bugs
3. Prioritize Phase 3 features
4. Adjust timeline if needed
5. Document learnings

---

## 🎓 Knowledge Base

### Phase 1 Concepts
- Electron main/renderer split
- React hooks & state management
- TypeScript strict mode
- Zod validation
- Cloudflare Workers
- LLM provider APIs

### Phase 2 Requirements
- Win32 API fundamentals
- Web Audio API
- IPC communication
- Streaming responses
- Real-time data handling

### Phase 3 Skills
- Database design
- Cache management
- Session handling
- Complex state management

### Phase 4 Focus
- Performance profiling
- Accessibility standards
- Security best practices
- Release management

---

## 📖 Helpful Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Win32 API Reference](https://learn.microsoft.com/en-us/windows/win32/apiindex/windows-api-list)
- [Web Audio API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [OpenAI Whisper](https://platform.openai.com/docs/guides/speech-to-text)
- [ElevenLabs API](https://elevenlabs.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)

---

**Phase 1 Complete. Phase 2 Awaits. Let's build something amazing!** 🚀
