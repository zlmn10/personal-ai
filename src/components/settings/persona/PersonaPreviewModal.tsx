import React, { useState } from 'react';
import { X, Check, Bot, User, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { PersonaPreset } from '../../../types/persona';

interface PersonaPreviewModalProps {
  persona: PersonaPreset | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (persona: PersonaPreset) => void;
}

export const PersonaPreviewModal: React.FC<PersonaPreviewModalProps> = ({
  persona,
  isOpen,
  onClose,
  onApply,
}) => {
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  if (!isOpen || !persona) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl border border-white/90 dark:border-gray-800 shadow-[0_25px_80px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100/80 dark:bg-purple-900/40 flex items-center justify-center text-xl shadow-2xs">
              {persona.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {persona.name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                  {persona.badge}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">{persona.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {/* Description */}
          <div className="p-3.5 rounded-xl bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/70 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            {persona.description}
          </div>

          {/* Example Greeting */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Example Greeting
            </span>
            <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 text-xs text-purple-950 dark:text-purple-200 leading-relaxed">
              "{persona.exampleGreeting}"
            </div>
          </div>

          {/* Example Response Q&A */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Sample Conversation
            </span>
            <div className="space-y-2 text-xs">
              {/* User turn */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 flex items-start gap-2 shadow-2xs">
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  <User className="w-3 h-3" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-gray-800 dark:text-gray-200 block text-[11px] mb-0.5">
                    User Prompt
                  </span>
                  <p className="text-gray-700 dark:text-gray-300">
                    {persona.exampleResponse.user}
                  </p>
                </div>
              </div>

              {/* Assistant turn */}
              <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-800/60 flex items-start gap-2.5 shadow-2xs">
                <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-purple-900 dark:text-purple-300 block text-[11px] mb-0.5">
                    {persona.name} Response
                  </span>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {persona.exampleResponse.assistant}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Traits Breakdown */}
          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 space-y-2">
            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block">
              Default Behavioral Traits
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-gray-500">Intensity:</span>{' '}
                <span className="font-bold text-purple-600">{persona.traits.intensity}%</span>
              </div>
              <div>
                <span className="text-gray-500">Humor:</span>{' '}
                <span className="font-bold text-amber-500">{persona.traits.humor}%</span>
              </div>
              <div>
                <span className="text-gray-500">Sarcasm:</span>{' '}
                <span className="font-bold text-rose-500">{persona.traits.sarcasm}%</span>
              </div>
              <div>
                <span className="text-gray-500">Formality:</span>{' '}
                <span className="font-bold text-sky-500">{persona.traits.formality}%</span>
              </div>
            </div>
          </div>

          {/* Expandable System Prompt */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
            <button
              type="button"
              onClick={() => setShowFullPrompt(!showFullPrompt)}
              className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors py-1"
            >
              <span>View System Instructions Prompt</span>
              {showFullPrompt ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showFullPrompt && (
              <div className="mt-2 p-3 rounded-xl bg-gray-900 text-gray-200 font-mono text-[10.5px] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-text">
                {persona.prompt}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(persona);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-tr from-[#4f86f7] to-[#765cf6] text-white text-xs font-semibold shadow-md hover:shadow-indigo-400/40 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply This Persona</span>
          </button>
        </div>
      </div>
    </div>
  );
};

