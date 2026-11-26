import React from 'react';
import { Bot, User, Send, Sparkles, Shield } from 'lucide-react';
import type { ThemeConfig, ThemePreset } from '../../types/theme';
import { themeService } from '../../services/themeService';

interface ThemePreviewProps {
  config: ThemeConfig;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({ config }) => {
  const effectiveMode = themeService.resolveEffectiveMode(config.mode);
  const preset: ThemePreset =
    config.activePreset === 'custom'
      ? effectiveMode === 'dark'
        ? themeService.getPreset('midnight')
        : themeService.getPreset('aurora')
      : themeService.getPreset(config.activePreset);

  const custom = config.customColors || {};
  const accent = custom.accent || config.accentColor || preset.accentColor;
  const bg = custom.background || config.background || preset.background;
  const userBubbleBg = custom.userBubble || preset.userBubbleBg;
  const aiBubbleBg = custom.aiBubble || preset.aiBubbleBg;
  const textPrimary = custom.textPrimary || preset.textPrimary;
  const textSecondary = custom.textSecondary || preset.textSecondary;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all">
      {/* Header bar of preview window */}
      <div className="px-4 py-2 bg-slate-900/10 backdrop-blur-md border-b border-white/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-[11px] font-semibold tracking-wide text-gray-700 dark:text-gray-300">
            Live Preview • {preset.name} ({effectiveMode})
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-medium text-gray-500">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Real-time Rendering</span>
        </div>
      </div>

      {/* Main Preview Container with Theme Background */}
      <div
        className="relative p-3 sm:p-4 min-h-[260px] flex gap-3 overflow-hidden select-none transition-colors duration-300"
        style={{ background: bg }}
      >
        {/* Ambient Blobs in Preview */}
        <div
          className="absolute -top-10 -left-10 w-44 h-44 rounded-full pointer-events-none opacity-80 blur-2xl transition-all"
          style={{ background: preset.ambientBlobs[0] }}
        />
        <div
          className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full pointer-events-none opacity-80 blur-2xl transition-all"
          style={{ background: preset.ambientBlobs[1] }}
        />

        {/* Mini Sidebar Preview */}
        <div
          className="hidden sm:flex flex-col w-36 rounded-xl p-2.5 gap-2 transition-all relative z-10 border shadow-xs"
          style={{
            background: custom.sidebar || preset.glassShellBg,
            borderColor: preset.glassShellBorder,
            backdropFilter: `blur(${Math.min(config.blurIntensity, 20)}px)`,
            borderRadius: `${Math.max(12, config.cornerRadius * 0.6)}px`,
          }}
        >
          <div className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-bold"
              style={{ background: accent }}
            >
              P
            </div>
            <span className="text-[11px] font-bold" style={{ color: textPrimary }}>
              Personal AI
            </span>
          </div>

          <div
            className="w-full py-1 px-2 rounded-lg text-[10px] font-semibold text-center border shadow-2xs"
            style={{
              background: 'rgba(255, 255, 255, 0.45)',
              borderColor: 'rgba(255, 255, 255, 0.6)',
              color: textPrimary,
            }}
          >
            + New chat
          </div>

          <div className="space-y-1 mt-1">
            <div
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1"
              style={{
                background: `${accent}25`,
                color: accent,
                fontWeight: 600,
              }}
            >
              <Shield className="w-2.5 h-2.5" /> Cybersecurity
            </div>
            <div
              className="text-[9px] px-1.5 py-0.5 rounded-md opacity-70 truncate"
              style={{ color: textSecondary }}
            >
              Nmap & Burp Suite
            </div>
          </div>
        </div>

        {/* Mini Chat Panel Preview */}
        <div
          className="flex-1 flex flex-col justify-between rounded-xl p-3 relative z-10 border shadow-xs transition-all"
          style={{
            background: custom.chatPanel || preset.glassPanelBg,
            borderColor: preset.glassPanelBorder,
            backdropFilter: `blur(${Math.min(config.blurIntensity, 20)}px)`,
            borderRadius: `${Math.max(12, config.cornerRadius * 0.6)}px`,
          }}
        >
          {/* Messages Preview */}
          <div className="space-y-2.5">
            {/* User message */}
            <div className="flex justify-end">
              <div
                className="max-w-[85%] px-3 py-1.5 text-[11px] font-medium shadow-xs transition-all"
                style={{
                  background: userBubbleBg,
                  color: preset.userBubbleText,
                  borderRadius: `${Math.max(10, config.cornerRadius * 0.5)}px`,
                }}
              >
                <div className="flex items-center gap-1.5 justify-end mb-0.5 opacity-80 text-[9px]">
                  <span>Salman</span>
                  <User className="w-2.5 h-2.5" />
                </div>
                <span>How do I protect against SSRF vulnerabilities?</span>
              </div>
            </div>

            {/* AI message */}
            <div className="flex justify-start">
              <div
                className="max-w-[88%] px-3 py-2 text-[11px] border shadow-xs transition-all"
                style={{
                  background: aiBubbleBg,
                  borderColor: preset.glassPanelBorder,
                  color: textPrimary,
                  borderRadius: `${Math.max(10, config.cornerRadius * 0.5)}px`,
                }}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[9px]">
                  <Bot className="w-3 h-3" style={{ color: accent }} />
                  <span className="font-bold" style={{ color: accent }}>
                    Personal AI
                  </span>
                  <span
                    className="px-1 py-0.2 rounded text-[8px] font-mono border"
                    style={{
                      background: `${accent}15`,
                      borderColor: `${accent}30`,
                      color: accent,
                    }}
                  >
                    llama3
                  </span>
                </div>
                <p className="leading-snug text-[10.5px]">
                  Validate all incoming target URLs against an <strong>IP allowlist</strong> and block requests to internal subnets (e.g., 169.254.169.254).
                </p>
              </div>
            </div>
          </div>

          {/* Mini Composer Preview */}
          <div
            className="mt-3 px-2.5 py-1.5 flex items-center justify-between border shadow-xs transition-all"
            style={{
              background: custom.composer || preset.glassComposerBg,
              borderColor: preset.glassComposerBorder,
              borderRadius: `${Math.max(10, config.cornerRadius * 0.5)}px`,
            }}
          >
            <span className="text-[10px]" style={{ color: textSecondary }}>
              Ask anything...
            </span>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white shadow-2xs"
              style={{ background: accent }}
            >
              <Send className="w-2.5 h-2.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

