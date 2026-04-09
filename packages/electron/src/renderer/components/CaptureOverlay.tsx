import React, { useState, useEffect } from 'react'
import { Mic, MicOff, Square, AlertCircle } from 'lucide-react'

interface CaptureOverlayProps {
  isVisible: boolean
  onCancel: () => void
}

export function CaptureOverlay({ isVisible, onCancel }: CaptureOverlayProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)

  // Update recording timer
  useEffect(() => {
    if (!isRecording) return

    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRecording])

  // Listen for capture events from main process
  useEffect(() => {
    if (!window.electronAPI) return

    // Handle capture start
    const handleCaptureStart = () => {
      setIsRecording(true)
      setRecordingTime(0)
      setError(null)
    }

    // Handle audio recording status
    const handleAudioRecording = (data: any) => {
      if (data.status === 'recording') {
        setIsRecording(true)
      } else if (data.status === 'stopped') {
        setIsRecording(false)
      }
    }

    // Handle capture cancelled
    const handleCaptureCancelled = () => {
      setIsRecording(false)
      setRecordingTime(0)
    }

    // Simulate audio level changes (Phase 6: connect to actual audio)
    const audioInterval = setInterval(() => {
      if (isRecording) {
        setAudioLevel(Math.random() * 100)
      }
    }, 50)

    return () => clearInterval(audioInterval)
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto bg-slate-800 rounded-lg p-8 border border-slate-700 shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Capturing...</h2>
          <p className="text-sm text-gray-400">Recording audio and taking screenshot</p>
        </div>

        {/* Recording indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-red-500/40 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="flex items-center justify-center h-24">
              <Mic className="w-12 h-12 text-red-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Recording time */}
        <div className="text-center mb-6">
          <div className="text-4xl font-mono font-bold text-white tracking-wide">
            {formatTime(recordingTime)}
          </div>
          <p className="text-xs text-gray-400 mt-2">Release hotkey to finish</p>
        </div>

        {/* Audio level visualization */}
        <div className="mb-8">
          <div className="flex items-end justify-center gap-1 h-12">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-blue-400 rounded-sm transition-all"
                style={{
                  height: `${Math.max(10, (audioLevel * (i + 1)) / 20)}%`,
                  opacity: audioLevel > 50 ? 1 : 0.6
                }}
              ></div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">Audio Level</p>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="mb-6 p-3 bg-red-900 border border-red-600 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition flex items-center justify-center gap-2 font-medium"
        >
          <Square className="w-4 h-4" />
          Cancel (ESC)
        </button>

        {/* Status text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            {isRecording ? 'Recording in progress...' : 'Preparing capture...'}
          </p>
        </div>
      </div>
    </div>
  )
}
