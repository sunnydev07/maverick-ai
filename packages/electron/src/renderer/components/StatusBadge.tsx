import React from 'react'
import { AlertCircle, Loader, Mic, Volume2, CheckCircle } from 'lucide-react'

interface StatusBadgeProps {
  state: 'settings' | 'capturing' | 'processing' | 'responding' | 'error'
  error?: string
}

export function StatusBadge({ state, error }: StatusBadgeProps) {
  const stateConfig = {
    settings: {
      icon: CheckCircle,
      label: 'Ready',
      color: 'bg-green-600 text-white',
      pulse: false
    },
    capturing: {
      icon: Mic,
      label: 'Recording',
      color: 'bg-red-600 text-white',
      pulse: true
    },
    processing: {
      icon: Loader,
      label: 'Processing',
      color: 'bg-blue-600 text-white',
      pulse: true
    },
    responding: {
      icon: Volume2,
      label: 'Speaking',
      color: 'bg-purple-600 text-white',
      pulse: true
    },
    error: {
      icon: AlertCircle,
      label: 'Error',
      color: 'bg-red-900 text-red-100 border border-red-600',
      pulse: false
    }
  }

  const config = stateConfig[state]
  const Icon = config.icon

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.color} ${config.pulse ? 'animate-pulse' : ''}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{config.label}</span>
      {error && <span className="text-xs opacity-75 truncate max-w-xs">{error}</span>}
    </div>
  )
}
