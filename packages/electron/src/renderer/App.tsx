import React, { useState, useEffect } from 'react'
import { SettingsPanel } from './components/SettingsPanel'
import { CaptureOverlay } from './components/CaptureOverlay'
import { ResponseOverlay } from './components/ResponseOverlay'
import { StatusBadge } from './components/StatusBadge'
import './index.css'
import './styles/animations.css'

export function App() {
  const [appState, setAppState] = useState<'settings' | 'capturing' | 'processing' | 'responding' | 'error'>('settings')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // Listen for state changes from main process
    const handleStateChange = (newState: string) => {
      setAppState(newState as any)
    }

    // Simulate state transitions for demo
    return () => {
      // Cleanup
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Status Badge */}
      <div className="fixed top-4 right-4 z-50">
        <StatusBadge state={appState} error={errorMessage} />
      </div>

      {/* Main Content */}
      <div className="fade-in">
        {appState === 'settings' && <SettingsPanel />}
        {appState === 'capturing' && <CaptureOverlay />}
        {(appState === 'processing' || appState === 'responding') && <ResponseOverlay />}
      </div>

      {/* Error Display */}
      {appState === 'error' && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 fade-in">
          <div className="bg-red-900 border border-red-600 text-red-100 px-6 py-4 rounded-lg max-w-md">
            <h3 className="font-bold mb-2">Error</h3>
            <p className="text-sm">{errorMessage}</p>
            <button
              onClick={() => {
                setAppState('settings')
                setErrorMessage('')
              }}
              className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-800 rounded transition"
            >
              Back to Settings
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
