import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  RotateCcw,
  Sparkles,
  Search,
  Plus,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { AppSettings } from '../../../types/chat';
import type { PersonaPreset, PersonaCategory, PersonaTraits } from '../../../types/persona';
import { DEFAULT_SYSTEM_PROMPT } from '../../../utils/prompts';
import { personaService } from '../../../services/personaService';
import { useTranslation } from '../../../services/i18n';
import { PersonaCard } from '../persona/PersonaCard';
import { PersonalityIntensitySliders } from '../persona/PersonalityIntensitySliders';
import { PersonaPreviewModal } from '../persona/PersonaPreviewModal';
import { CustomPersonaModal } from '../persona/CustomPersonaModal';

interface PersonalizationSettingsProps {
  settings: AppSettings;
  onChange: (newSettings: AppSettings) => void;
}

export const PersonalizationSettings: React.FC<PersonalizationSettingsProps> = ({
  settings,
  onChange,
}) => {
  const { t } = useTranslation();
  const [personas, setPersonas] = useState<PersonaPreset[]>(() => personaService.getAllPersonas());
  const [activeCategory, setActiveCategory] = useState<PersonaCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTraitSliders, setShowTraitSliders] = useState(false);

  // Selected persona state
  const [selectedPersona, setSelectedPersona] = useState<PersonaPreset>(() => {
    return personaService.getActivePersona();
  });

  // Current traits for selected persona
  const [currentTraits, setCurrentTraits] = useState<PersonaTraits>(() => {
    return personaService.getActiveTraits();
  });

  // Modal states
  const [previewTarget, setPreviewTarget] = useState<PersonaPreset | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [editingCustomTarget, setEditingCustomTarget] = useState<PersonaPreset | null>(null);

  // Sync with personaService
  useEffect(() => {
    return personaService.subscribe(() => {
      setPersonas(personaService.getAllPersonas());
    });
  }, []);

  // Filter personas by category & search query
  const filteredPersonas = useMemo(() => {
    return personas.filter((p) => {
      let matchCat = false;
      if (activeCategory === 'all') {
        matchCat = true;
      } else if (activeCategory === 'custom') {
        matchCat = Boolean(p.isCustom);
      } else if (activeCategory === 'cybersecurity') {
        matchCat = p.category === 'cybersecurity' || p.category === 'technical';
      } else if (activeCategory === 'funny-savage') {
        matchCat = p.category === 'funny-savage' || p.category === 'entertainment';
      } else {
        matchCat = p.category === activeCategory;
      }

      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [personas, activeCategory, searchQuery]);

  // Handle selecting a persona: immediately updates prompt and textarea
  const handleSelectPersona = (persona: PersonaPreset) => {
    setSelectedPersona(persona);
    setCurrentTraits({ ...persona.traits });
    personaService.setActivePersona(persona.id, persona.traits);

    onChange({
      ...settings,
      systemPrompt: persona.prompt,
    });
  };

  // Handle slider trait adjustments
  const handleTraitsChange = (newTraits: PersonaTraits) => {
    setCurrentTraits(newTraits);
    personaService.updateActiveTraits(newTraits);

    const effectivePrompt = personaService.buildEffectivePrompt(selectedPersona, newTraits);
    onChange({
      ...settings,
      systemPrompt: effectivePrompt,
    });
  };

  // Reset traits to default for selected persona
  const handleResetTraits = () => {
    setCurrentTraits({ ...selectedPersona.traits });
    personaService.updateActiveTraits(selectedPersona.traits);

    onChange({
      ...settings,
      systemPrompt: selectedPersona.prompt,
    });
  };

  // Reset entire system prompt to default Cyber Mentor
  const handleResetPrompt = () => {
    const defaultPersona = personas.find((p) => p.id === 'cyber-mentor') || personas[0];
    setSelectedPersona(defaultPersona);
    setCurrentTraits({ ...defaultPersona.traits });
    personaService.setActivePersona(defaultPersona.id, defaultPersona.traits);
    onChange({
      ...settings,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
    });
  };

  // Custom persona operations
  const handleSaveCustomPersona = (
    data: Omit<PersonaPreset, 'id' | 'isCustom' | 'createdAt'>
  ) => {
    if (editingCustomTarget) {
      const updated = personaService.updateCustomPersona(editingCustomTarget.id, data);
      if (updated) {
        handleSelectPersona(updated);
      }
      setEditingCustomTarget(null);
    } else {
      const created = personaService.createCustomPersona(data);
      handleSelectPersona(created);
    }
  };

  const handleDuplicate = (persona: PersonaPreset) => {
    const copy = personaService.duplicatePersona(persona.id);
    handleSelectPersona(copy);
  };

  const handleDeleteCustom = (persona: PersonaPreset) => {
    if (confirm(`Delete custom persona "${persona.name}"?`)) {
      personaService.deleteCustomPersona(persona.id);
      const fallback = personaService.getActivePersona();
      setSelectedPersona(fallback);
      setCurrentTraits({ ...fallback.traits });
    }
  };

  // 6 Distinct Categories requested by user
  const categories: { id: PersonaCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: personas.length },
    {
      id: 'cybersecurity',
      label: '🛡️ Cybersecurity',
      count: personas.filter((p) => p.category === 'cybersecurity' || p.category === 'technical').length,
    },
    {
      id: 'romantic',
      label: '❤️ Romantic',
      count: personas.filter((p) => p.category === 'romantic').length,
    },
    {
      id: 'funny-savage',
      label: '🔥 Funny & Savage',
      count: personas.filter((p) => p.category === 'funny-savage' || p.category === 'entertainment').length,
    },
    {
      id: 'friendship',
      label: '🤝 Friendship',
      count: personas.filter((p) => p.category === 'friendship').length,
    },
    {
      id: 'special',
      label: '✨ Special',
      count: personas.filter((p) => p.category === 'special').length,
    },
    {
      id: 'custom',
      label: '🎨 Custom',
      count: personas.filter((p) => p.isCustom).length,
    },
  ];

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100">
      {/* 1. TOP HEADER ROW: Title, Count Badge, and Reset Default button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-300">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Personality Presets</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Select from 25 built-in personalities or create your own custom prompt voice
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetPrompt}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
            title="Reset to default Cyber Mentor"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingCustomTarget(null);
              setIsCustomModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Custom</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & CATEGORY FILTERS BAR */}
      <div className="space-y-2.5">
        {/* Search input */}
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 25 AI personalities by name, role, or description..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-purple-500 shadow-2xs"
          />
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200/70 dark:border-gray-700'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === cat.id
                    ? 'bg-purple-700 text-purple-100'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. RESPONSIVE PERSONA PRESETS GRID (approx 3 cards per row on desktop) */}
      <div className="space-y-1.5">
        {filteredPersonas.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 text-xs text-gray-500">
            No personalities found matching "{searchQuery}".
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            {filteredPersonas.map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                isSelected={selectedPersona.id === persona.id}
                onSelect={handleSelectPersona}
                onPreview={(p) => setPreviewTarget(p)}
                onDuplicate={handleDuplicate}
                onDelete={persona.isCustom ? handleDeleteCustom : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. SYSTEM INSTRUCTIONS (PERSONA PROMPT) TEXTAREA - ALWAYS VISIBLE */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
              System Instructions (Persona Prompt)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
              {settings.systemPrompt.length} chars
            </span>
            <button
              type="button"
              onClick={() => setShowTraitSliders(!showTraitSliders)}
              className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              <Sliders className="w-3 h-3" />
              <span>{showTraitSliders ? 'Hide Trait Sliders' : 'Fine-tune Sliders'}</span>
              {showTraitSliders ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* The Direct Prompt Textarea */}
        <textarea
          rows={6}
          value={settings.systemPrompt}
          onChange={(e) => onChange({ ...settings, systemPrompt: e.target.value })}
          placeholder="System instructions prompt..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-900/60 text-xs text-gray-900 dark:text-gray-100 font-mono leading-relaxed focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/40 shadow-inner"
        />

        {/* Collapsible Trait Intensity Sliders */}
        {showTraitSliders && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 animate-in fade-in duration-150">
            <PersonalityIntensitySliders
              traits={currentTraits}
              defaultTraits={selectedPersona.traits}
              onChange={handleTraitsChange}
              onReset={handleResetTraits}
            />
          </div>
        )}

        {/* Info Note */}
        <div className="p-2.5 rounded-xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 text-[11px] text-sky-800 dark:text-sky-300 flex items-start gap-2">
          <Shield className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
          <span>
            {t('strictPersonaNote')} All Ollama generation requests for active and new chats will dynamically inject these instructions.
          </span>
        </div>
      </div>

      {/* Persona Preview Modal */}
      <PersonaPreviewModal
        persona={previewTarget}
        isOpen={!!previewTarget}
        onClose={() => setPreviewTarget(null)}
        onApply={(p) => handleSelectPersona(p)}
      />

      {/* Custom Persona Builder Modal */}
      <CustomPersonaModal
        isOpen={isCustomModalOpen}
        initialData={editingCustomTarget}
        onClose={() => {
          setIsCustomModalOpen(false);
          setEditingCustomTarget(null);
        }}
        onSave={handleSaveCustomPersona}
      />
    </div>
  );
};
