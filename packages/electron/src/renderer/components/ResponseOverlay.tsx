import React, { useState, useEffect, useRef } from 'react'
import { Volume2, Loader, CheckCircle, AlertCircle, X } from 'lucide-react'

interface ResponseOverlayProps {
  isVisible: boolean
  step: 'transcribing' | 'processing' | 'speaking' | 'complete' | 'error' | null
  message: string
  audioText?: string
  onClose?: () => void
}

export function ResponseOverlay({ isVisible, step, message, audioText, onClose }: ResponseOverlayProps) {
  const [waveformData, setWaveformData] = useState<number[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (step === 'speaking' && canvasRef.current) {
      // Animate waveform
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const draw = () => {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Generate animated waveform
        const bars = 40
        const barWidth = canvas.width / bars
        const centerY = canvas.height / 2

        for (let i = 0; i < bars; i++) {
          const height = Math.sin(i * 0.2 + Date.now() / 100) * (centerY * 0.8)
          ctx.fillStyle = 'rgb(59, 130, 246)'
          ctx.fillRect(i * barWidth + 2, centerY - height / 2, barWidth - 4, height)
        }

        animationFrameRef.current = requestAnimationFrame(draw)
      }

      draw()

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }
  }, [step])

  if (!isVisible) return null

  const getStepIcon = () => {
    switch (step) {
      case 'transcribing':
      case 'processing':
      case 'speaking':
        return <Loader className="w-6 h-6 animate-spin text-blue-400" />
      case 'complete':
        return <CheckCircle className="w-6 h-6 text-green-400" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-400" />
      default:
        return <Volume2 className="w-6 h-6 text-blue-400" />
    }
  }

  const getBackgroundColor = () => {
    switch (step) {
      case 'error':
        return 'bg-red-900/50 border-red-600'
      case 'complete':
        return 'bg-green-900/50 border-green-600'
      default:
        return 'bg-blue-900/50 border-blue-600'
    }
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 z-50">
      <div className={`border rounded-lg p-6 backdrop-blur-md ${getBackgroundColor()}`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">{getStepIcon()}</div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold mb-2">
              {step === 'transcribing' && 'Transcribing...'}
              {step === 'processing' && 'Processing...'}
              {step === 'speaking' && 'Speaking Response'}
              {step === 'complete' && 'Complete'}
              {step === 'error' && 'Error'}
            </h3>

            <p className="text-sm text-gray-300 mb-4">{message}</p>

            {step === 'speaking' && (
              <canvas ref={canvasRef} width={320} height={60} className="w-full rounded bg-slate-800" />
            )}

            {step === 'complete' && audioText && (
              <p className="text-sm text-gray-200 italic mt-3 p-3 bg-slate-800 rounded max-h-20 overflow-y-auto">
                {audioText}
              </p>
            )}
          </div>

          {onClose && (step === 'complete' || step === 'error') && (
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {(step === 'complete' || step === 'error') && (
          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
          >
            Done
          </button>
        )}
      </div>
    </div>
  )
}
