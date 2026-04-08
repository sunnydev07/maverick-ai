import { LLMRequest, LLMResponse } from '../schemas'

export interface LLMProvider {
  name: string
  call(request: LLMRequest, env: any): Promise<LLMResponse>
}

// Ollama Provider (default, local)
export class OllamaProvider implements LLMProvider {
  name = 'ollama'

  async call(request: LLMRequest, env: any): Promise<LLMResponse> {
    const baseUrl = env.OLLAMA_BASE_URL || 'http://localhost:11434'

    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        content: data.message?.content || '',
        model: request.model,
        stop_reason: data.done ? 'end_turn' : undefined
      }
    } catch (error) {
      console.error('Ollama provider error:', error)
      throw new Error(`Failed to call Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// OpenRouter Provider (multi-model routing)
export class OpenRouterProvider implements LLMProvider {
  name = 'openrouter'

  async call(request: LLMRequest, env: any): Promise<LLMResponse> {
    const apiKey = env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY not configured')
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://maverick.ai',
          'X-Title': 'Maverick AI'
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature,
          max_tokens: request.max_tokens
        })
      })

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        content: data.choices?.[0]?.message?.content || '',
        model: request.model,
        stop_reason: data.choices?.[0]?.finish_reason || undefined
      }
    } catch (error) {
      console.error('OpenRouter provider error:', error)
      throw new Error(
        `Failed to call OpenRouter: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

// Claude Provider (Anthropic)
export class ClaudeProvider implements LLMProvider {
  name = 'claude'

  async call(request: LLMRequest, env: any): Promise<LLMResponse> {
    const apiKey = env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: request.model || 'claude-opus-4.6',
          max_tokens: request.max_tokens || 2048,
          messages: request.messages
        })
      })

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        content: data.content?.[0]?.text || '',
        model: request.model || 'claude-opus-4.6',
        stop_reason: data.stop_reason || undefined
      }
    } catch (error) {
      console.error('Claude provider error:', error)
      throw new Error(
        `Failed to call Claude: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

// Gemini Provider (Google)
export class GeminiProvider implements LLMProvider {
  name = 'gemini'

  async call(request: LLMRequest, env: any): Promise<LLMResponse> {
    const apiKey = env.GOOGLE_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY not configured')
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${request.model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: request.messages[request.messages.length - 1]?.content || ''
                  }
                ]
              }
            ]
          })
        }
      )

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
        model: request.model || 'gemini-1.5-flash',
        stop_reason: data.candidates?.[0]?.finishReason || undefined
      }
    } catch (error) {
      console.error('Gemini provider error:', error)
      throw new Error(
        `Failed to call Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

export function getProvider(name: string): LLMProvider {
  switch (name) {
    case 'openrouter':
      return new OpenRouterProvider()
    case 'claude':
      return new ClaudeProvider()
    case 'gemini':
      return new GeminiProvider()
    case 'ollama':
    default:
      return new OllamaProvider()
  }
}
