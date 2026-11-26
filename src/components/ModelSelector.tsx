import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, Check, Wifi, WifiOff, ExternalLink } from 'lucide-react';
import { GEMINI_MODELS } from '../types/chat';

interface ModelSelectorProps {
  selectedModel: string;
  isConnected?: boolean;
  onSelectModel: (modelId: string) => void;
  onOpenSettings?: () => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = React.memo(({
  selectedModel = 'gemini-2.5-flash',
  isConnected = true,
  onSelectModel,
  onOpenSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeModel =
    GEMINI_MODELS.find((m) => m.id === selectedModel) || {
      id: selectedModel,
      name: selectedModel || 'AI Model',
      provider: 'experiential' as const,
      description: 'Active model',
      contextWindow: 'Standard',
    };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Centered Trigger Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white group focus:outline-none border border-black/5 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-2xs"
        title="Select Active Gemini AI Model"
      >
        {/* Status Dot */}
        <span className="relative flex h-2 w-2">
          {isConnected && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isConnected ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
        </span>

        <span className="truncate max-w-[190px] tracking-tight text-gray-900 dark:text-gray-100">
          {activeModel.name}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Frosted Glass Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 sm:w-96 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/90 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.25)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100/80 dark:border-slate-800 bg-white/60 dark:bg-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 tracking-wider">
                GOOGLE GEMINI MODELS
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span
                className={`flex items-center gap-1 font-mono font-medium ${
                  isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                }`}
              >
                {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Model Options List */}
          <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
            {GEMINI_MODELS.map((model) => {
              const isSelected = model.id === selectedModel;
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30'
                      : 'hover:bg-gray-100/70 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {model.name}
                      </span>
                      {model.badge && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25">
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                      {model.description}
                    </p>
                    <div className="text-[10px] text-gray-400 font-mono pt-0.5">
                      Context: {model.contextWindow}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          {onOpenSettings && (
            <div className="p-2.5 border-t border-gray-100/80 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Encrypted Gemini API Architecture</span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>Configure Keys</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
