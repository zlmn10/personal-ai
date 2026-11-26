export type PersonaCategory =
  | 'all'
  | 'cybersecurity'
  | 'romantic'
  | 'funny-savage'
  | 'friendship'
  | 'special'
  | 'custom'
  | 'technical'
  | 'entertainment';

export interface PersonaTraits {
  intensity: number; // 0 to 100
  humor: number; // 0 to 100
  sarcasm: number; // 0 to 100
  formality: number; // 0 to 100
  emojiUsage: number; // 0 to 100
}

export interface PersonaPreset {
  id: string;
  name: string;
  role: string;
  badge: string;
  icon: string; // Emoji
  category: Exclude<PersonaCategory, 'all'>;
  description: string;
  prompt: string;
  exampleGreeting: string;
  exampleResponse: {
    user: string;
    assistant: string;
  };
  traits: PersonaTraits;
  isCustom?: boolean;
  createdAt?: number;
}

