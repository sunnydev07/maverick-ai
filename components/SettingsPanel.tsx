'use client'

import React, { useState, useEffect } from 'react'
import { Keyboard, Mic, Volume2, Settings, Save } from 'lucide-react'

interface SettingsState {
  provider: 'ollama' | 'openrouter' | 'claude' | 'gemini'
  modelName: string
  workerUrl: string
  ttsVoice: 'en-US' | 'en-GB' | 'fr-FR'
  hotkey: string
  screenshotMode: 'full' | 'active' | 'region'
  conversationMemory: 'session' | 'saved'
}

const DEFAULT_SETTINGS: SettingsState = {
  provider: 'ollama',
  modelName: 'llama2',
  workerUrl: 'https://your-worker.workers.dev',
  ttsVoice: 'en-US',
  hotkey: 'Alt+Space',
  screenshotMode: 'full',
  conversationMemory: 'session'
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS)
  const [hotkeyRecording, setHotkeyRecording] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load settings from localStorage (Phase 1 MVP)
    const stored = localStorage.getItem('maverickSettings')
    if (stored) {
      try {
        setSettings(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to load settings:', e)
      }
    }
  }, [])

  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
  }

  const handleSave = () => {
    localStorage.setItem('maverickSettings', JSON.stringify(settings))
    setSavedMessage('Settings saved!')
    setTimeout(() => setSavedMessage(''), 2000)
  }

  const handleHotkeyRecord = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!hotkeyRecording) return

    e.preventDefault()
    const keys: string[] = []

    if (e.ctrlKey) keys.push('Ctrl')
    if (e.altKey) keys.push('Alt')
    if (e.shiftKey) keys.push('Shift')
    if (e.metaKey) keys.push('Meta')

    if (e.key && !['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      keys.push(e.key.toUpperCase())
    }

    if (keys.length > 0) {
      const hotkey = keys.join('+')
      handleSettingChange('hotkey', hotkey)
      setHotkeyRecording(false)
    }
  }

  const ttsPreviews = {
    'en-US': 'Hello, I am ready to assist',
    'en-GB': 'Hello, I am ready to assist',
    'fr-FR': 'Bonjour, je suis prêt à vous aider'
  }

  if (!mounted) return null

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Maverick AI Settings</h1>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* LLM Provider Section */}
          <section className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                1
              </span>
              LLM Provider
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Provider
                </label>
                <select
                  value={settings.provider}
                  onChange={(e) =>
                    handleSettingChange('provider', e.target.value as SettingsState['provider'])
                  }
                  className="w-full bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                >
                  <option value="ollama">Ollama (Local)</option>
                  <option value="openrouter">OpenRouter (Multi-model)</option>
                  <option value="claude">Claude (Anthropic)</option>
                  <option value="gemini">Gemini (Google)</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {settings.provider === 'ollama' &&
                    'Requires local Ollama instance running on port 11434'}
                  {settings.provider === 'openrouter' &&
                    'Route to any model - requires API key in Wrangler secrets'}
                  {settings.provider === 'claude' &&
                    'High quality responses - requires Anthropic API key'}
                  {settings.provider === 'gemini' &&
                    'Google&apos;s latest model - requires API key'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model Name / ID
                </label>
                <input
                  type="text"
                  value={settings.modelName}
                  onChange={(e) => handleSettingChange('modelName', e.target.value)}
                  placeholder={
                    settings.provider === 'ollama'
                      ? 'e.g., llama2, neural-chat'
                      : 'e.g., openai/gpt-4o, anthropic/claude-opus'
                  }
                  className="w-full bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cloudflare Worker URL
                </label>
                <input
                  type="text"
                  value={settings.workerUrl}
                  onChange={(e) => handleSettingChange('workerUrl', e.target.value)}
                  placeholder="https://your-worker.workers.dev"
                  className="w-full bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  All requests route through this proxy - API keys stored securely
                </p>
              </div>
            </div>
          </section>

          {/* Global Hotkey Section */}
          <section className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                2
              </span>
              Global Hotkey
            </h2>

            <div className="space-y-3">
              <p className="text-sm text-gray-300">
                Default: <code className="bg-slate-700 px-2 py-1 rounded text-green-400">Alt + Space</code>
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.hotkey}
                  onKeyDown={handleHotkeyRecord}
                  readOnly
                  onClick={() => setHotkeyRecording(!hotkeyRecording)}
                  className={`flex-1 bg-slate-700 text-white border-2 rounded px-3 py-2 cursor-pointer transition ${
                    hotkeyRecording ? 'border-green-400 bg-slate-700/70' : 'border-slate-600'
                  }`}
                />
                <button
                  onClick={() => setHotkeyRecording(!hotkeyRecording)}
                  className={`px-4 py-2 rounded font-medium transition ${
                    hotkeyRecording
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {hotkeyRecording ? 'Recording...' : 'Record'}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Click "Record" and press your desired key combination
              </p>
            </div>
          </section>

          {/* TTS Voice Section */}
          <section className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                3
              </span>
              Text-to-Speech Voice
            </h2>

            <div className="space-y-3">
              <select
                value={settings.ttsVoice}
                onChange={(e) =>
                  handleSettingChange('ttsVoice', e.target.value as SettingsState['ttsVoice'])
                }
                className="w-full bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="fr-FR">Français</option>
              </select>

              <button
                onClick={() => {
                  const utterance = new SpeechSynthesisUtterance(
                    ttsPreviews[settings.ttsVoice]
                  )
                  utterance.lang = settings.ttsVoice
                  window.speechSynthesis.cancel()
                  window.speechSynthesis.speak(utterance)
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                Preview Voice
              </button>
            </div>
          </section>

          {/* Screenshot Mode Section */}
          <section className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                4
              </span>
              Screenshot Mode
            </h2>

            <div className="space-y-2">
              {(
                [
                  { value: 'full', label: 'Full Desktop' },
                  { value: 'active', label: 'Active Window Only' },
                  { value: 'region', label: 'Drag Region' }
                ] as const
              ).map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="screenshot"
                    value={option.value}
                    checked={settings.screenshotMode === option.value}
                    onChange={(e) =>
                      handleSettingChange('screenshotMode', e.target.value as SettingsState['screenshotMode'])
                    }
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Conversation Memory Section */}
          <section className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                5
              </span>
              Conversation Memory
            </h2>

            <div className="space-y-2">
              {(
                [
                  { value: 'session', label: 'Session Only' },
                  { value: 'saved', label: 'Save History' }
                ] as const
              ).map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="memory"
                    value={option.value}
                    checked={settings.conversationMemory === option.value}
                    onChange={(e) =>
                      handleSettingChange('conversationMemory', e.target.value as SettingsState['conversationMemory'])
                    }
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Settings
          </button>
        </div>

        {/* Saved Message */}
        {savedMessage && (
          <div className="mt-4 bg-green-900 border border-green-600 text-green-100 px-4 py-3 rounded-lg">
            ✓ {savedMessage}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 p-4 bg-slate-900 rounded-lg border border-slate-700">
          <p className="text-xs text-gray-400">
            Maverick AI v0.1.0 • All settings stored locally • API keys secured in Worker proxy
          </p>
        </div>
      </div>
    </div>
  )
}
