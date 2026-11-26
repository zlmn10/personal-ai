import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  Save,
  Shield,
  Cpu,
} from 'lucide-react';
import { aiService } from '../../../services/aiService';
import type { AISettings as AISettingsType } from '../../../types/pentester';

export const AISettings: React.FC = () => {
  const [settings, setSettings] = useState<AISettingsType | null>(null);
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [temperature, setTemperature] = useState(0.4);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [systemPrompt, setSystemPrompt] = useState('');

  // Status & loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    message?: string;
    error?: string;
  } | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await aiService.getSettings();
      setSettings(data);
      setSelectedProvider(data.provider || 'gemini');
      setSelectedModel(data.model || (data.provider === 'experiential' ? 'claude-sonnet-latest' : 'gemini-2.5-flash'));
      setTemperature(data.temperature ?? 0.4);
      setMaxTokens(data.maxTokens ?? 4096);
      setSystemPrompt(data.systemPrompt || '');
      setApiKeyInput('');
    } catch (err) {
      console.error('Failed to load AI settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const payload: {
        provider?: string;
        apiKey?: string;
        model: string;
        temperature: number;
        maxTokens: number;
        systemPrompt: string;
      } = {
        provider: selectedProvider,
        model: selectedModel,
        temperature,
        maxTokens,
        systemPrompt,
      };

      if (apiKeyInput.trim()) {
        payload.apiKey = apiKeyInput.trim();
      }

      const updated = await aiService.saveSettings(payload);
      setSettings(updated);
      setApiKeyInput('');
      setSaveMessage('AI provider settings saved & encrypted successfully.');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings';
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await aiService.testConnection(
        apiKeyInput.trim() || undefined,
        selectedModel
      );
      setTestResult(res);
      if (res.success) {
        await loadSettings();
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        error: err instanceof Error ? err.message : 'Network failure contacting backend',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!confirm('Are you sure you want to remove the stored Gemini API key?')) return;
    try {
      await aiService.deleteKey();
      await loadSettings();
      setTestResult(null);
    } catch (err) {
      alert('Failed to delete API key');
    }
  };

  const isConnected = settings?.status === 'connected';

  if (isLoading && !settings) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        <span>Loading AI Configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs text-gray-800 dark:text-gray-200">
      {/* Provider Selector Banner */}
      <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Primary AI Provider</h3>
              <p className="text-[11px] text-gray-500">Centralized cognitive cybersecurity backend</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold flex items-center gap-1.5 border ${
                isConnected
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
              }`}
            >
              {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isConnected ? 'API CONNECTED' : 'NOT CONNECTED'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
          <div
            onClick={() => {
              setSelectedProvider('gemini');
              setSelectedModel('gemini-2.5-flash');
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedProvider === 'gemini'
                ? 'border-purple-500/60 bg-purple-500/15 ring-2 ring-purple-500/30'
                : 'border-gray-200 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-800/30 hover:bg-gray-100/50'
            }`}
          >
            <div className="font-bold text-xs text-purple-600 dark:text-purple-400">Google Gemini API</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Native AI Studio (AIzaSy...)</div>
          </div>
          <div
            onClick={() => {
              setSelectedProvider('experiential');
              setSelectedModel('claude-sonnet-latest');
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedProvider === 'experiential'
                ? 'border-cyan-500/60 bg-cyan-500/15 ring-2 ring-cyan-500/30'
                : 'border-gray-200 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-800/30 hover:bg-gray-100/50'
            }`}
          >
            <div className="font-bold text-xs text-cyan-600 dark:text-cyan-400">Experiential Labs</div>
            <div className="text-[10px] text-gray-500 mt-0.5">OpenAI Gateway (xpl_...)</div>
          </div>
          <div
            onClick={() => {
              setSelectedProvider('openai');
              setSelectedModel('gpt-4o');
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedProvider === 'openai'
                ? 'border-emerald-500/60 bg-emerald-500/15 ring-2 ring-emerald-500/30'
                : 'border-gray-200 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-800/30 hover:bg-gray-100/50'
            }`}
          >
            <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400">OpenAI API</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Official Platform (sk-...)</div>
          </div>
        </div>
      </div>

      {/* API Key Configuration Section */}
      <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-500" />
            <h4 className="font-bold text-gray-900 dark:text-white capitalize">
              {selectedProvider === 'experiential' ? 'Experiential Labs Gateway API Key' : `${selectedProvider} API Key`}
            </h4>
          </div>
          {settings?.hasKey && (
            <span className="text-[11px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              AES-256 Encrypted
            </span>
          )}
        </div>

        {/* Masked status if saved */}
        {settings?.hasKey && (
          <div className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-gray-200/50 dark:border-slate-700 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-gray-500">Currently Stored Key ({settings.provider}):</div>
              <div className="font-mono text-xs font-bold text-gray-800 dark:text-gray-200 mt-0.5 tracking-wider">
                {settings.maskedKey}
              </div>
            </div>
            <button
              onClick={handleDeleteKey}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Delete stored key"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input for new or replacement key */}
        <div className="space-y-1.5">
          <label className="block text-gray-700 dark:text-gray-300 font-semibold">
            {settings?.hasKey ? 'Replace API Key' : `Enter ${selectedProvider === 'experiential' ? 'Experiential (xpl_...)' : 'Gemini (AIzaSy...)'} API Key *`}
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={selectedProvider === 'experiential' ? 'xpl_...' : 'AIzaSy...'}
              className="w-full px-3 py-2 pr-10 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-purple-500/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
            <Shield className="w-3 h-3 text-emerald-500" />
            Keys are never transmitted in frontend bundles or responses. Encrypted via backend AES-256-GCM.
          </p>
        </div>

        {/* Test Connection and Action buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-white/60 dark:bg-slate-700/60 hover:bg-white dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Pinging Provider...' : 'Test Connection'}</span>
          </button>

          {testResult && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono border ${
                testResult.success
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
              }`}
            >
              {testResult.success ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Success ({testResult.latencyMs}ms)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="truncate max-w-xs">{testResult.error || 'Connection failed'}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Model Selection and Parameters */}
      <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-500" />
          <h4 className="font-bold text-gray-900 dark:text-white">Active Model & Inference Parameters</h4>
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
            Default AI Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-mono"
          >
            {selectedProvider === 'experiential' ? (
              <>
                <option value="claude-sonnet-latest">claude-sonnet-latest (Claude 3.5 Sonnet)</option>
                <option value="claude-haiku-latest">claude-haiku-latest (Claude 3.5 Haiku)</option>
                <option value="deepseek-r1">deepseek-r1 (DeepSeek R1 Reasoning)</option>
                <option value="deepseek-v3.2">deepseek-v3.2 (DeepSeek V3.2)</option>
                <option value="aion-2.0">aion-2.0 (Aion General)</option>
              </>
            ) : selectedProvider === 'openai' ? (
              <>
                <option value="gpt-4o">gpt-4o (Omni Multimodal)</option>
                <option value="gpt-4o-mini">gpt-4o-mini (Fast)</option>
                <option value="o1-preview">o1-preview (Reasoning)</option>
              </>
            ) : (
              <>
                <option value="gemini-2.5-flash">gemini-2.5-flash (Fast, Low Latency, Recommended for Audits)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Reasoning & Exploit Chain Analysis)</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash (Standard High Throughput)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (Extended Context & Complex Architecture)</option>
              </>
            )}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-gray-700 dark:text-gray-300 font-semibold">Temperature</label>
              <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Lower (0.1 - 0.4) = strict deterministic analysis. Higher = creative offensive suggestions.
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-gray-700 dark:text-gray-300 font-semibold">Max Response Tokens</label>
              <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{maxTokens}</span>
            </div>
            <input
              type="range"
              min="512"
              max="8192"
              step="512"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full accent-purple-500"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Maximum token length generated per cybersecurity report or remediation response.
            </p>
          </div>
        </div>

        {/* Global System Prompt */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
            Global Cyber Persona Directive (System Prompt)
          </label>
          <textarea
            rows={3}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="You are Pentester AI Agent, a master offensive cybersecurity and incident response specialist..."
            className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-mono text-[11px]"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {saveMessage && (
            <span className="text-emerald-500 font-medium text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {saveMessage}
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Encrypting & Saving...' : 'Save AI Configuration'}</span>
        </button>
      </div>
    </div>
  );
};
