import React from 'react';
import { Sliders, Sparkles, MessageSquare } from 'lucide-react';
import type { AppSettings } from '../../../types/chat';

interface AIParametersSettingsProps {
  settings: AppSettings;
  onChange: (newSettings: AppSettings) => void;
}

export const AIParametersSettings: React.FC<AIParametersSettingsProps> = ({
  settings,
  onChange,
}) => {
  return (
    <div className="space-y-4 text-xs text-gray-800 dark:text-gray-200">
      {/* 1. TEMPERATURE */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            <span>Inference Temperature: {settings.temperature}</span>
          </label>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-mono font-bold">
            {settings.temperature < 0.3
              ? 'Deterministic & Precise'
              : settings.temperature > 0.8
              ? 'Creative & Unconstrained'
              : 'Balanced Analysis'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={settings.temperature}
          onChange={(e) =>
            onChange({ ...settings, temperature: parseFloat(e.target.value) })
          }
          className="w-full accent-purple-600 cursor-pointer h-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-gray-400 font-mono pt-1">
          <span>0.0 (Strict Code/CVE)</span>
          <span>0.5 (Default)</span>
          <span>1.0 (Creative Offense)</span>
        </div>
      </div>

      {/* 2. MAX TOKENS */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span>Max Response Tokens: {settings.maxTokens}</span>
          </label>
          <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono font-bold">
            {Math.round(settings.maxTokens / 1000)}k tokens limit
          </span>
        </div>
        <input
          type="range"
          min="512"
          max="8192"
          step="512"
          value={settings.maxTokens}
          onChange={(e) =>
            onChange({ ...settings, maxTokens: parseInt(e.target.value, 10) })
          }
          className="w-full accent-cyan-500 cursor-pointer h-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-gray-400 font-mono pt-1">
          <span>512 (Short replies)</span>
          <span>4096 (Standard)</span>
          <span>8192 (Detailed audit report)</span>
        </div>
      </div>

      {/* 3. CHAT BEHAVIOR */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs space-y-3">
        <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-500" />
          <span>Interactive Chat Behavior</span>
        </label>

        <div className="space-y-2">
          <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100/60 dark:hover:bg-slate-800/60 cursor-pointer">
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Auto-Scroll During Stream</div>
              <div className="text-[10px] text-gray-400">Keep latest token in view unless manually scrolled up</div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoScroll}
              onChange={(e) => onChange({ ...settings, autoScroll: e.target.checked })}
              className="accent-emerald-500 w-4 h-4 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100/60 dark:hover:bg-slate-800/60 cursor-pointer">
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Send on Enter Key</div>
              <div className="text-[10px] text-gray-400">Press Enter to send message, Shift+Enter for new line</div>
            </div>
            <input
              type="checkbox"
              checked={settings.sendOnEnter}
              onChange={(e) => onChange({ ...settings, sendOnEnter: e.target.checked })}
              className="accent-emerald-500 w-4 h-4 rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
