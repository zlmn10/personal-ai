import type { PersonaPreset, PersonaTraits, PersonaCategory } from '../types/persona';
import { BUILTIN_PERSONA_PRESETS } from '../utils/personaLibrary';

const CUSTOM_PERSONAS_KEY = 'personal_ai_custom_personas';
const ACTIVE_PERSONA_KEY = 'personal_ai_active_persona_id';
const ACTIVE_TRAITS_KEY = 'personal_ai_active_persona_traits';

class PersonaServiceManager {
  private customPersonas: PersonaPreset[] = [];
  private activePersonaId: string = 'cyber-mentor';
  private activeTraitsOverride: Partial<PersonaTraits> | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem(CUSTOM_PERSONAS_KEY);
      if (stored) {
        this.customPersonas = JSON.parse(stored);
      }
      const activeId = localStorage.getItem(ACTIVE_PERSONA_KEY);
      if (activeId) {
        this.activePersonaId = activeId;
      }
      const traits = localStorage.getItem(ACTIVE_TRAITS_KEY);
      if (traits) {
        this.activeTraitsOverride = JSON.parse(traits);
      }
    } catch (e) {
      console.error('Failed to load personas from storage:', e);
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(CUSTOM_PERSONAS_KEY, JSON.stringify(this.customPersonas));
      localStorage.setItem(ACTIVE_PERSONA_KEY, this.activePersonaId);
      if (this.activeTraitsOverride) {
        localStorage.setItem(ACTIVE_TRAITS_KEY, JSON.stringify(this.activeTraitsOverride));
      } else {
        localStorage.removeItem(ACTIVE_TRAITS_KEY);
      }
    } catch (e) {
      console.error('Failed to save personas to storage:', e);
    }
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getAllPersonas(): PersonaPreset[] {
    return [...BUILTIN_PERSONA_PRESETS, ...this.customPersonas];
  }

  public getPersonasByCategory(category: PersonaCategory): PersonaPreset[] {
    const all = this.getAllPersonas();
    if (category === 'all') return all;
    if (category === 'custom') return all.filter((p) => p.isCustom);
    return all.filter((p) => p.category === category);
  }

  public getPersonaById(id: string): PersonaPreset | undefined {
    return this.getAllPersonas().find((p) => p.id === id);
  }

  public getActivePersona(): PersonaPreset {
    const found = this.getPersonaById(this.activePersonaId);
    if (found) return found;
    return BUILTIN_PERSONA_PRESETS[0];
  }

  public getActiveTraits(): PersonaTraits {
    const active = this.getActivePersona();
    return {
      ...active.traits,
      ...(this.activeTraitsOverride || {}),
    };
  }

  public setActivePersona(id: string, traitsOverride?: Partial<PersonaTraits>): void {
    this.activePersonaId = id;
    if (traitsOverride) {
      this.activeTraitsOverride = { ...traitsOverride };
    } else {
      this.activeTraitsOverride = null;
    }
    this.saveToStorage();
    this.notify();
  }

  public updateActiveTraits(traits: Partial<PersonaTraits>): void {
    this.activeTraitsOverride = {
      ...(this.activeTraitsOverride || this.getActivePersona().traits),
      ...traits,
    };
    this.saveToStorage();
    this.notify();
  }

  public createCustomPersona(
    data: Omit<PersonaPreset, 'id' | 'isCustom' | 'createdAt'>
  ): PersonaPreset {
    const newPersona: PersonaPreset = {
      ...data,
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      isCustom: true,
      createdAt: Date.now(),
    };
    this.customPersonas.push(newPersona);
    this.saveToStorage();
    this.notify();
    return newPersona;
  }

  public updateCustomPersona(id: string, updates: Partial<PersonaPreset>): PersonaPreset | null {
    const index = this.customPersonas.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.customPersonas[index] = {
      ...this.customPersonas[index],
      ...updates,
      id, // Preserve ID
      isCustom: true,
    };
    this.saveToStorage();
    this.notify();
    return this.customPersonas[index];
  }

  public duplicatePersona(id: string): PersonaPreset {
    const source = this.getPersonaById(id) || BUILTIN_PERSONA_PRESETS[0];
    const copy: PersonaPreset = {
      ...source,
      id: `custom_${Date.now()}_copy`,
      name: `${source.name} (Copy)`,
      role: `${source.role} (Custom)`,
      isCustom: true,
      category: 'custom',
      createdAt: Date.now(),
    };
    this.customPersonas.push(copy);
    this.saveToStorage();
    this.notify();
    return copy;
  }

  public deleteCustomPersona(id: string): boolean {
    const prevCount = this.customPersonas.length;
    this.customPersonas = this.customPersonas.filter((p) => p.id !== id);
    if (this.customPersonas.length !== prevCount) {
      if (this.activePersonaId === id) {
        this.activePersonaId = BUILTIN_PERSONA_PRESETS[0].id;
        this.activeTraitsOverride = null;
      }
      this.saveToStorage();
      this.notify();
      return true;
    }
    return false;
  }

  /**
   * Injects dynamic slider calibrations into the persona's system prompt
   */
  public buildEffectivePrompt(persona: PersonaPreset, customTraits?: Partial<PersonaTraits>): string {
    const traits: PersonaTraits = {
      ...persona.traits,
      ...(customTraits || {}),
    };

    let styleNote = '\n\n[Communication Style Directives:';
    styleNote += `\n- Personality Intensity: ${traits.intensity}/100`;
    styleNote += `\n- Humor Level: ${traits.humor}/100`;
    styleNote += `\n- Sarcasm Level: ${traits.sarcasm}/100`;
    styleNote += `\n- Formality Level: ${traits.formality}/100`;
    styleNote += `\n- Emoji Usage Level: ${traits.emojiUsage}/100`;
    styleNote += '\nStrictly stay in character while upholding factual accuracy, safety, and helpfulness.]';

    return `${persona.prompt.trim()}${styleNote}`;
  }
}

export const personaService = new PersonaServiceManager();

