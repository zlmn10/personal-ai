import React from 'react';
import { Check, Eye, Trash2, Copy } from 'lucide-react';
import type { PersonaPreset } from '../../../types/persona';

interface PersonaCardProps {
  persona: PersonaPreset;
  isSelected: boolean;
  onSelect: (persona: PersonaPreset) => void;
  onPreview: (persona: PersonaPreset) => void;
  onDuplicate?: (persona: PersonaPreset) => void;
  onDelete?: (persona: PersonaPreset) => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({
  persona,
  isSelected,
  onSelect,
  onPreview,
  onDuplicate,
  onDelete,
}) => {
  return (
    <div
      onClick={() => onSelect(persona)}
      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative group select-none ${
        isSelected
          ? 'bg-purple-50/90 dark:bg-purple-950/50 border-purple-400 dark:border-purple-500 shadow-sm ring-2 ring-purple-300 dark:ring-purple-800'
          : 'bg-white/80 dark:bg-gray-800/80 hover:bg-purple-50/40 dark:hover:bg-gray-800 border-gray-200/80 dark:border-gray-700/80 hover:border-purple-200 shadow-2xs'
      }`}
    >
      {/* Top Row: Avatar Icon + Name + Category */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-purple-100/70 dark:bg-purple-900/40 flex items-center justify-center text-lg shadow-2xs flex-shrink-0">
              {persona.icon}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                {persona.name}
              </h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                {persona.role}
              </p>
            </div>
          </div>

          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all flex-shrink-0 ${
              isSelected
                ? 'bg-purple-600 border-purple-600 text-white'
                : 'border-gray-300 dark:border-gray-600 group-hover:border-purple-300'
            }`}
          >
            {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
          </div>
        </div>

        {/* Short Description */}
        <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-3">
          {persona.description}
        </p>
      </div>

      {/* Bottom Trait Badges & Action Buttons */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
        {/* Traits preview */}
        <div className="flex items-center gap-1.5 text-[9px] font-medium text-gray-500 dark:text-gray-400">
          <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700">
            ⚡ {persona.traits.intensity}%
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700">
            😄 {persona.traits.humor}%
          </span>
          {persona.traits.sarcasm > 40 && (
            <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700">
              🔥 {persona.traits.sarcasm}%
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onPreview(persona)}
            className="p-1 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors"
            title="Preview persona greeting and responses"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {onDuplicate && (
            <button
              type="button"
              onClick={() => onDuplicate(persona)}
              className="p-1 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors"
              title="Duplicate into custom template"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          {persona.isCustom && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(persona)}
              className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete custom persona"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
