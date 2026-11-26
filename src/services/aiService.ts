import type { AISettings } from '../types/pentester';

const API_BASE = 'http://localhost:3001/api/ai';

export const aiService = {
  /**
   * Get active AI provider configuration
   */
  async getSettings(): Promise<AISettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch AI settings');
    return res.json();
  },

  /**
   * Save AI settings (API key, model, parameters)
   */
  async saveSettings(data: {
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    provider?: string;
  }): Promise<AISettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save AI settings');
    return res.json();
  },

  /**
   * Delete stored API Key
   */
  async deleteKey(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/key`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete API key');
    return res.json();
  },

  /**
   * Test Gemini API Connection
   */
  async testConnection(
    apiKey?: string,
    model?: string
  ): Promise<{
    success: boolean;
    provider: string;
    model?: string;
    latencyMs?: number;
    message?: string;
    error?: string;
  }> {
    const res = await fetch(`${API_BASE}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, model }),
    });
    return res.json();
  },

  /**
   * Stream chat with Pentester AI Agent
   */
  async streamChat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
      scanContextId?: string;
      signal?: AbortSignal;
    },
    onChunk: (text: string) => void,
    onError: (err: string) => void,
    onDone: () => void
  ) {
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          ...options,
        }),
        signal: options.signal,
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || `AI Chat request failed with status ${res.status}`);
      }

      if (!res.body) {
        throw new Error('No response body received from server.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.slice(5).trim();

          if (dataStr === '[DONE]') {
            onDone();
            return;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              onError(parsed.error);
              return;
            }
            if (parsed.text) {
              onChunk(parsed.text);
            }
          } catch {
            // Ignore partial chunk decode
          }
        }
      }

      onDone();
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        onDone();
        return;
      }
      onError((err as Error)?.message || 'Streaming failed');
    }
  },

  /**
   * Request Gemini to analyze scan session results
   */
  async analyzeScan(scanSessionId: string): Promise<unknown> {
    const res = await fetch(`${API_BASE}/analyze-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanSessionId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to analyze scan');
    }
    return res.json();
  },

  /**
   * Request Gemini to generate formal penetration testing report
   */
  async generateReport(scanSessionId: string, projectId?: string): Promise<{
    id: string;
    reportMarkdown: string;
    reportDoc: unknown;
  }> {
    const res = await fetch(`${API_BASE}/generate-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanSessionId, projectId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate report');
    }
    return res.json();
  },
};
