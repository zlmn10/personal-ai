import React, { useState } from 'react';
import { X, Sparkles, Save } from 'lucide-react';
import type { PersonaPreset, PersonaCategory, PersonaTraits } from '../../../types/persona';

interface CustomPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (persona: Omit<PersonaPreset, 'id' | 'isCustom' | 'createdAt'>) => void;
  initialData?: PersonaPreset | null;
}

const EMOJI_PICKER = ['🤖', '🧠', '🛡️', '⚡', '💖', '💍', '👑', '🔥', '🙄', '🧌', '🛋️', '🤝', '👊', '☕', '🏛️', '⚖️', '🕵️', '📚', '🏴', '✨', '🎯', '🚀', '🧙‍♂️', '🦁', '🌟'];

export const CustomPersonaModal: React.FC<CustomPersonaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [role, setRole] = useState(initialData?.role || '');
  const [icon, setIcon] = useState(initialData?.icon || '🤖');
  const [category, setCategory] = useState<Exclude<PersonaCategory, 'all'>>(
    initialData?.category || 'custom'
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [prompt, setPrompt] = useState(initialData?.prompt || '');
  const [exampleGreeting, setExampleGreeting] = useState(initialData?.exampleGreeting || '');
  const [exampleUser, setExampleUser] = useState(initialData?.exampleResponse?.user || '');
  const [exampleAssistant, setExampleAssistant] = useState(
    initialData?.exampleResponse?.assistant || ''
  );

  const [traits, setTraits] = useState<PersonaTraits>(
    initialData?.traits || {
      intensity: 80,
      humor: 50,
      sarcasm: 20,
      formality: 40,
      emojiUsage: 60,
    }
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !prompt.trim()) {
      alert('Please provide both a Name and System Prompt for your custom persona.');
      return;
    }

    onSave({
      name: name.trim(),
      role: role.trim() || 'Custom AI Persona',
      badge: `${icon} ${name.trim().split(' ')[0]}`,
      icon,
      category,
      description: description.trim() || `Custom persona created for personalized AI interactions.`,
      prompt: prompt.trim(),
      exampleGreeting: exampleGreeting.trim() || `Hello Salman! I am operating in ${name} persona.`,
      exampleResponse: {
        user: exampleUser.trim() || 'How can you help me today?',
        assistant: exampleAssistant.trim() || `I am ready to assist you according to my ${name} directives!`,
      },
      traits,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl border border-white/90 dark:border-gray-800 shadow-[0_25px_80px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {initialData ? 'Edit Custom Persona' : 'Create Custom AI Persona'}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Craft a tailored personality, speaking style, and instructions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
          {/* Avatar & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Avatar Icon
              </label>
              <div className="flex items-center gap-2">
                <span className="text-2xl p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
                  {icon}
                </span>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-14 px-2 py-2 text-center text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Persona Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Code Sensei, Space Navigator..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Quick Emoji Swatches */}
          <div>
            <span className="text-[10px] text-gray-400 block mb-1">Quick Avatar Emojis:</span>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_PICKER.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`p-1.5 rounded-lg text-sm transition-transform hover:scale-110 ${
                    icon === emoji ? 'bg-purple-200 dark:bg-purple-900 ring-2 ring-purple-500' : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Role & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Master Mentor, Gaming Duo..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="custom">🎨 Custom</option>
                <option value="technical">🛡️ Technical & Cyber</option>
                <option value="romantic">💖 Romantic</option>
                <option value="entertainment">🎭 Entertainment & Funny</option>
                <option value="friendship">🤝 Friendship</option>
                <option value="special">✨ Special</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Short Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of how this persona behaves..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* System Prompt */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-bold text-gray-700 dark:text-gray-300">
                Detailed System Instructions *
              </label>
              <span className="text-[10px] text-gray-400 font-mono">
                {prompt.length} chars
              </span>
            </div>
            <textarea
              rows={6}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Instruct the AI exactly how to speak, its tone, vocabulary, formatting habits, and behavioral boundaries..."
              className="w-full px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Style Traits Sliders */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
            <span className="font-bold text-gray-700 dark:text-gray-300 block">
              Default Behavioral Sliders
            </span>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Intensity</span>
                  <span className="font-bold text-purple-600">{traits.intensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={traits.intensity}
                  onChange={(e) => setTraits({ ...traits, intensity: parseInt(e.target.value, 10) })}
                  className="w-full accent-purple-600 cursor-pointer h-1 bg-gray-200 dark:bg-gray-700 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Humor</span>
                  <span className="font-bold text-purple-600">{traits.humor}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={traits.humor}
                  onChange={(e) => setTraits({ ...traits, humor: parseInt(e.target.value, 10) })}
                  className="w-full accent-purple-600 cursor-pointer h-1 bg-gray-200 dark:bg-gray-700 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Sarcasm</span>
                  <span className="font-bold text-purple-600">{traits.sarcasm}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={traits.sarcasm}
                  onChange={(e) => setTraits({ ...traits, sarcasm: parseInt(e.target.value, 10) })}
                  className="w-full accent-purple-600 cursor-pointer h-1 bg-gray-200 dark:bg-gray-700 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Formality</span>
                  <span className="font-bold text-purple-600">{traits.formality}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={traits.formality}
                  onChange={(e) => setTraits({ ...traits, formality: parseInt(e.target.value, 10) })}
                  className="w-full accent-purple-600 cursor-pointer h-1 bg-gray-200 dark:bg-gray-700 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Example Greeting */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Example Greeting
            </label>
            <input
              type="text"
              value={exampleGreeting}
              onChange={(e) => setExampleGreeting(e.target.value)}
              placeholder="e.g. Hey there! Ready to explore today?"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Example Dialogue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Sample User Prompt
              </label>
              <input
                type="text"
                value={exampleUser}
                onChange={(e) => setExampleUser(e.target.value)}
                placeholder="e.g. Can you explain this concept?"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Sample AI Response
              </label>
              <input
                type="text"
                value={exampleAssistant}
                onChange={(e) => setExampleAssistant(e.target.value)}
                placeholder="e.g. Absolutely! Here is how we break it down..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Submit Row */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Persona</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
