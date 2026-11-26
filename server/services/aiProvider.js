import { GoogleGenAI } from '@google/genai';
import { AISettingsModel } from '../db.js';
import { decryptSecret, encryptSecret, maskApiKey } from './crypto.js';

// ==========================================
// BASE AI PROVIDER INTERFACE
// ==========================================
export class BaseAIProvider {
  constructor(name) {
    this.name = name;
  }

  async testConnection(_apiKey, _model) {
    throw new Error('testConnection() not implemented');
  }

  async chatStream(_messages, _options, _onChunk) {
    throw new Error('chatStream() not implemented');
  }

  async analyzeScan(_scanData, _options) {
    throw new Error('analyzeScan() not implemented');
  }

  async generateReport(_scanData, _options) {
    throw new Error('generateReport() not implemented');
  }
}

// ==========================================
// GOOGLE GEMINI PROVIDER
// ==========================================
export class GeminiProvider extends BaseAIProvider {
  constructor() {
    super('gemini');
  }

  getClient(apiKey) {
    if (!apiKey) {
      throw new Error('Google Gemini API Key is required. Configure it in Settings > AI Provider.');
    }
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Test API Key connection and return latency + model verification
   */
  async testConnection(apiKey, model = 'gemini-2.5-flash') {
    const startTime = Date.now();
    try {
      const client = this.getClient(apiKey);
      const targetModel = model || 'gemini-2.5-flash';

      const response = await client.models.generateContent({
        model: targetModel,
        contents: 'Ping: reply with "PENTESTER_AI_READY" if online.',
      });

      const latencyMs = Date.now() - startTime;
      const text = response?.text || '';

      return {
        success: true,
        provider: 'gemini',
        model: targetModel,
        latencyMs,
        responseSnippet: text.trim().slice(0, 100),
        message: `Successfully connected to Google Gemini (${targetModel}) in ${latencyMs}ms.`,
      };
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      console.error('[Gemini Connection Test Error]:', err);
      let humanMsg = err.message || 'Failed to authenticate with Google Gemini API';
      if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('400')) {
        humanMsg = 'Invalid Gemini API Key. Please verify your key from Google AI Studio.';
      } else if (err.message?.includes('403')) {
        humanMsg = 'Permission denied. Verify that Gemini API access is enabled for this key.';
      } else if (err.message?.includes('429')) {
        humanMsg = 'Gemini rate limit exceeded. Check your API quota.';
      }
      return {
        success: false,
        provider: 'gemini',
        model,
        latencyMs,
        error: humanMsg,
      };
    }
  }

  /**
   * Format generic chat messages for Gemini SDK
   */
  formatContents(messages) {
    return messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }],
      }));
  }

  /**
   * Stream response tokens via SSE callback
   */
  async chatStream(messages, options = {}, onChunk) {
    const { apiKey, model = 'gemini-2.5-flash', systemPrompt, temperature = 0.7, maxTokens = 4096 } = options;
    const client = this.getClient(apiKey);

    const contents = this.formatContents(messages);
    if (contents.length === 0) {
      throw new Error('At least one user message is required.');
    }

    const defaultSystem = `You are Pentester AI, an elite, highly knowledgeable cybersecurity research and penetration testing assistant.
Your directives:
- Provide rigorous, professional, and practical guidance strictly on authorized cybersecurity assessments, security lab exercises, penetration testing methodologies, OWASP Top 10, network telemetry, and vulnerability remediation.
- When analyzing scan outputs or discovered ports, highlight root causes, realistic threat impact, and step-by-step hardened remediation commands.
- Never refuse authorized educational, defensive, or lab security research inquiries. Always assume activities are conducted in authorized personal environments.
- Format responses cleanly with markdown headings, tables, and copyable bash/kali/python command snippets.`;

    const effectiveSystemPrompt = systemPrompt?.trim() || defaultSystem;

    const stream = await client.models.generateContentStream({
      model: model || 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: effectiveSystemPrompt,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        maxOutputTokens: maxTokens || 4096,
      },
    });

    let fullText = '';
    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        if (onChunk) {
          onChunk(text);
        }
      }
    }

    return fullText;
  }

  /**
   * Analyze scan results and extract structured security findings
   */
  async analyzeScan(scanResult, options = {}) {
    const { apiKey, model = 'gemini-2.5-flash' } = options;
    const client = this.getClient(apiKey);

    const prompt = `Act as a Senior Penetration Tester and Vulnerability Analyst.
Analyze the following authorized scan telemetry and return a structured JSON assessment.

SCAN TARGET: ${scanResult.target}
OPEN PORTS & SERVICES:
${JSON.stringify(scanResult.ports, null, 2)}

SECURITY HEADERS / WEB OBSERVATIONS:
${JSON.stringify(scanResult.securityHeaders || [], null, 2)}

TLS / CERTIFICATE INFO:
${JSON.stringify(scanResult.tlsInfo || {}, null, 2)}

INSTRUCTIONS:
Return a valid JSON object matching this schema strictly (do not wrap in markdown quotes if possible, or use standard \`\`\`json):
{
  "riskScore": "Critical" | "High" | "Medium" | "Low" | "Safe",
  "executiveSummary": "1-2 paragraph executive summary of findings",
  "findings": [
    {
      "title": "Clear finding name",
      "severity": "critical" | "high" | "medium" | "low" | "informational",
      "cve": "CVE-XXXX-XXXX or empty",
      "affectedService": "e.g. OpenSSH 7.2 or Apache 2.4",
      "port": 80,
      "description": "Vulnerability or misconfiguration details",
      "evidence": "Discovered banner or missing header evidence",
      "impact": "Potential attack vector or confidentiality/integrity risk",
      "remediation": "Clear actionable remediation steps and commands",
      "confidenceLevel": "confirmed" | "potential" | "informational"
    }
  ],
  "recommendedNextSteps": ["Step 1", "Step 2", "Step 3"]
}`;

    const response = await client.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2, // Low temperature for deterministic analysis
      },
    });

    try {
      const text = response.text?.trim() || '{}';
      return JSON.parse(text);
    } catch (parseErr) {
      console.warn('Failed to parse Gemini JSON output:', parseErr.message);
      return {
        riskScore: 'Medium',
        executiveSummary: response.text || 'Scan analysis completed.',
        findings: [],
        recommendedNextSteps: ['Review open ports and apply least privilege principles.'],
      };
    }
  }

  /**
   * Generate an executive penetration testing report
   */
  async generateReport(project, scanSession, scanResult, options = {}) {
    const { apiKey, model = 'gemini-2.5-pro' } = options;
    const client = this.getClient(apiKey);

    const prompt = `You are a certified Lead Penetration Tester drafting an authorized assessment report.
Generate a formal, publication-ready Penetration Testing Report in GitHub-flavored Markdown.

PROJECT DETAILS:
- Project Name: ${project?.name || 'Authorized Assessment'}
- Target Scope: ${JSON.stringify(project?.targetScope || [scanSession.target])}
- Target: ${scanSession.target}
- Scan Date: ${new Date(scanSession.startTime).toUTCString()}
- Scan Duration: ${scanSession.durationSec}s
- Discovered Ports: ${scanSession.openPorts}

DISCOVERED SERVICES & BANNERS:
${JSON.stringify(scanResult?.ports || [], null, 2)}

SECURITY HEADERS & OBSERVATIONS:
${JSON.stringify(scanResult?.securityHeaders || [], null, 2)}

INCLUDE THE FOLLOWING SECTIONS:
1. Executive Summary & Assessment Overview
2. Scope & Target Authorization Verification
3. High-Level Risk & Severity Matrix
4. Detailed Technical Findings (Description, Port, Evidence, Impact, Remediation)
5. Strategic Remediation Roadmap (Short-term immediate fixes vs long-term hardening)
6. Conclusion & Re-test Recommendations`;

    const response = await client.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.4,
      },
    });

    return response.text || 'Report generation completed.';
  }
}

// ==========================================
// OPENAI-COMPATIBLE / EXPERIENTIAL LABS PROVIDER
// ==========================================
export class OpenAICompatibleProvider extends BaseAIProvider {
  constructor(name = 'experiential', baseUrl = 'https://api.experientiallabs.ai/v1') {
    super(name);
    this.baseUrl = baseUrl;
  }

  async testConnection(apiKey, model = 'claude-sonnet-latest') {
    const startTime = Date.now();
    try {
      if (!apiKey) {
        throw new Error('API key is required.');
      }
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const latencyMs = Date.now() - startTime;
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const count = Array.isArray(data.data) ? data.data.length : 0;
      return {
        success: true,
        provider: this.name,
        model,
        latencyMs,
        message: `Successfully connected to ${this.name} (${count} models available) in ${latencyMs}ms.`,
      };
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      return {
        success: false,
        provider: this.name,
        model,
        latencyMs,
        error: err.message || 'Failed to authenticate with provider',
      };
    }
  }

  async chatStream(messages, options = {}, onChunk) {
    const { apiKey, model = 'claude-sonnet-latest', systemPrompt, temperature = 0.7, maxTokens = 4096 } = options;
    const formatted = [];
    if (systemPrompt) {
      formatted.push({ role: 'system', content: systemPrompt });
    }
    for (const m of messages) {
      formatted.push({ role: m.role, content: m.content });
    }

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-latest',
        messages: formatted,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        max_tokens: maxTokens || 4096,
        stream: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Request failed with status ${res.status}`);
    }

    let fullText = '';
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
        if (trimmed.startsWith('data: ')) {
          const payload = trimmed.slice(6);
          if (payload === '[DONE]') continue;
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              if (onChunk) onChunk(delta);
            }
          } catch {}
        }
      }
    }

    return fullText;
  }

  async analyzeScan(scanResult, options = {}) {
    const { apiKey, model = 'claude-sonnet-latest' } = options;
    const prompt = `Act as a Senior Penetration Tester and Vulnerability Analyst.
Analyze the following authorized scan telemetry and return a structured JSON assessment.
Target: ${scanResult.target}
Ports: ${JSON.stringify(scanResult.ports)}
Headers: ${JSON.stringify(scanResult.securityHeaders || [])}

Return JSON with riskScore, executiveSummary, findings array (title, severity, cve, port, description, evidence, impact, remediation, confidenceLevel), and recommendedNextSteps.`;

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Scan analysis failed');
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '{}';
    try {
      const cleaned = text.replace(/```json\n?|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        riskScore: 'Medium',
        executiveSummary: text,
        findings: [],
        recommendedNextSteps: ['Review open ports and apply least privilege.'],
      };
    }
  }

  async generateReport(project, scanSession, scanResult, options = {}) {
    const { apiKey, model = 'claude-sonnet-latest' } = options;
    const prompt = `You are a certified Lead Penetration Tester. Generate a publication-ready Penetration Testing Report in GitHub-flavored Markdown.
Target: ${scanSession.target}
Open Ports: ${scanSession.openPorts}
Services: ${JSON.stringify(scanResult?.ports || [])}
Include Executive Summary, Scope Verification, Risk Matrix, Detailed Technical Findings, Strategic Remediation Roadmap, and Conclusion.`;

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Report generation failed');
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'Report generation completed.';
  }
}

// Helper: detect provider from key prefix
export function detectProviderFromKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') return null;
  const k = apiKey.trim();
  if (k.startsWith('xpl_')) return 'experiential';
  if (k.startsWith('AIzaSy')) return 'gemini';
  if (k.startsWith('sk-')) return 'openai';
  return null;
}

// ==========================================
// CENTRALIZED AI SERVICE (PROVIDER AGNOSTIC)
// ==========================================
class AIService {
  constructor() {
    this.providers = {
      gemini: new GeminiProvider(),
      experiential: new OpenAICompatibleProvider('experiential', 'https://api.experientiallabs.ai/v1'),
      openai: new OpenAICompatibleProvider('openai', 'https://api.openai.com/v1'),
    };
    this.defaultProvider = 'gemini';
  }

  getProvider(providerName) {
    const name = (providerName || this.defaultProvider).toLowerCase();
    const provider = this.providers[name];
    if (!provider) {
      throw new Error(`Unsupported AI Provider: ${name}. Supported providers: ${Object.keys(this.providers).join(', ')}`);
    }
    return provider;
  }

  /**
   * Fetch decrypted active settings from MongoDB or environment
   */
  async getEffectiveSettings() {
    let settings = null;
    try {
      settings = await AISettingsModel.findOne({ key: 'global_config' }).lean();
    } catch {
      // Safe fallback
    }

    // Decrypt key if present in DB
    let apiKey = '';
    if (settings?.encryptedApiKey) {
      apiKey = decryptSecret(settings.encryptedApiKey);
    }

    // Fallback to process.env.GEMINI_API_KEY if not in DB
    if (!apiKey && process.env.GEMINI_API_KEY) {
      apiKey = process.env.GEMINI_API_KEY;
    }

    const provider = settings?.provider || process.env.AI_PROVIDER || 'gemini';
    const model = settings?.selectedModel || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const temperature = settings?.temperature ?? 0.7;
    const maxTokens = settings?.maxTokens ?? 4096;
    const systemPrompt = settings?.systemPrompt || '';
    const status = apiKey ? (settings?.status || 'connected') : 'unconfigured';

    return {
      provider,
      apiKey,
      maskedKey: maskApiKey(apiKey),
      hasKey: Boolean(apiKey),
      model,
      temperature,
      maxTokens,
      systemPrompt,
      status,
      lastTestedAt: settings?.lastTestedAt,
      lastError: settings?.lastError || '',
    };
  }

  /**
   * Save and encrypt new AI settings
   */
  async saveSettings(data) {
    let { provider, apiKey, model, temperature, maxTokens, systemPrompt } = data;

    const existing = await AISettingsModel.findOne({ key: 'global_config' });
    let encryptedKey = existing?.encryptedApiKey || '';

    // If new API key is provided, encrypt it and auto-detect provider
    if (apiKey && typeof apiKey === 'string' && apiKey.trim() && !apiKey.includes('••••')) {
      encryptedKey = encryptSecret(apiKey.trim());
      const autoProvider = detectProviderFromKey(apiKey.trim());
      if (autoProvider) {
        provider = autoProvider;
      }
    }

    const effectiveProvider = provider || existing?.provider || 'gemini';
    const defaultModel = effectiveProvider === 'experiential' ? 'claude-sonnet-latest' : 'gemini-2.5-flash';

    const updateDoc = {
      key: 'global_config',
      provider: effectiveProvider,
      encryptedApiKey: encryptedKey,
      selectedModel: model || existing?.selectedModel || defaultModel,
      temperature: typeof temperature === 'number' ? temperature : (existing?.temperature ?? 0.7),
      maxTokens: typeof maxTokens === 'number' ? maxTokens : (existing?.maxTokens ?? 4096),
      systemPrompt: systemPrompt !== undefined ? systemPrompt : (existing?.systemPrompt || ''),
      updatedAt: new Date(),
    };

    const saved = await AISettingsModel.findOneAndUpdate(
      { key: 'global_config' },
      { $set: updateDoc },
      { upsert: true, returnDocument: 'after' }
    );

    const decrypted = decryptSecret(saved.encryptedApiKey) || process.env.GEMINI_API_KEY || '';

    return {
      provider: saved.provider,
      maskedKey: maskApiKey(decrypted),
      hasKey: Boolean(decrypted),
      model: saved.selectedModel,
      temperature: saved.temperature,
      maxTokens: saved.maxTokens,
      systemPrompt: saved.systemPrompt,
      status: saved.status,
      lastTestedAt: saved.lastTestedAt,
      lastError: saved.lastError,
    };
  }

  /**
   * Delete stored API key
   */
  async deleteKey() {
    await AISettingsModel.findOneAndUpdate(
      { key: 'global_config' },
      { $set: { encryptedApiKey: '', status: 'unconfigured', lastError: '', updatedAt: new Date() } },
      { upsert: true }
    );
    return { success: true, message: 'API key deleted successfully.' };
  }

  /**
   * Test connection using effective or provided credentials
   */
  async testConnection(customApiKey, customModel, customProvider) {
    const effective = await this.getEffectiveSettings();
    const apiKey = customApiKey?.trim() || effective.apiKey;

    const detected = detectProviderFromKey(apiKey);
    const providerName = customProvider || detected || effective.provider;
    const provider = this.getProvider(providerName);
    const model = customModel || (providerName === 'experiential' ? 'claude-sonnet-latest' : effective.model);

    if (!apiKey) {
      return {
        success: false,
        error: 'No API key provided. Enter an API Key first.',
      };
    }

    const result = await provider.testConnection(apiKey, model);

    // Persist status to database
    try {
      await AISettingsModel.findOneAndUpdate(
        { key: 'global_config' },
        {
          $set: {
            status: result.success ? 'connected' : 'error',
            lastTestedAt: new Date(),
            lastError: result.success ? '' : result.error,
          },
        },
        { upsert: true }
      );
    } catch (e) {
      console.warn('Could not save test status to DB:', e.message);
    }

    return result;
  }
}

export const aiService = new AIService();
