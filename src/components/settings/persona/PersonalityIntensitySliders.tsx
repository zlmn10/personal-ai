import React from 'react';
import { Sliders, RotateCcw, Smile, Flame, BookOpen, MessageCircle } from 'lucide-react';
import type { PersonaTraits } from '../../../types/persona';

interface PersonalityIntensitySlidersProps {
  traits: PersonaTraits;
  defaultTraits: PersonaTraits;
  onChange: (newTraits: PersonaTraits) => void;
  onReset: () => void;
}

export const PersonalityIntensitySliders: React.FC<PersonalityIntensitySlidersProps> = ({
  traits,
  defaultTraits,
  onChange,
  onReset,
}) => {
  const isModified =
    traits.intensity !== defaultTraits.intensity ||
    traits.humor !== defaultTraits.humor ||
    traits.sarcasm !== defaultTraits.sarcasm ||
    traits.formality !== defaultTraits.formality ||
    traits.emojiUsage !== defaultTraits.emojiUsage;

  const handleSliderChange = (key: keyof PersonaTraits, value: number) => {
    onChange({
      ...traits,
      [key]: value,
    });
  };

  return (
    <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
            Personality Intensity & Behavior Tuning
          </h4>
        </div>

        {isModified && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 transition-colors"
            title="Reset sliders to persona default"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Sliders</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* 1. Personality Intensity */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <span>⚡</span> Personality Intensity
            </span>
            <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
              {traits.intensity}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={traits.intensity}
            onChange={(e) => handleSliderChange('intensity', parseInt(e.target.value, 10))}
            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        </div>

        {/* 2. Humor Level */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-amber-500" /> Humor Level
            </span>
            <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
              {traits.humor}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={traits.humor}
            onChange={(e) => handleSliderChange('humor', parseInt(e.target.value, 10))}
            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        </div>

        {/* 3. Sarcasm */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-500" /> Sarcasm
            </span>
            <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
              {traits.sarcasm}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={traits.sarcasm}
            onChange={(e) => handleSliderChange('sarcasm', parseInt(e.target.value, 10))}
            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        </div>

        {/* 4. Formality */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-sky-500" /> Formality
            </span>
            <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
              {traits.formality}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={traits.formality}
            onChange={(e) => handleSliderChange('formality', parseInt(e.target.value, 10))}
            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        </div>

        {/* 5. Emoji Usage */}
        <div className="space-y-1 sm:col-span-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" /> Emoji Usage
            </span>
            <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
              {traits.emojiUsage}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={traits.emojiUsage}
            onChange={(e) => handleSliderChange('emojiUsage', parseInt(e.target.value, 10))}
            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

