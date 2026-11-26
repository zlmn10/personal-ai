import type { AppSettings, Conversation } from '../types/chat';
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_USER_NAME } from './prompts';

const STORAGE_KEYS = {
  CONVERSATIONS: 'pentester_ai_conversations',
  CURRENT_CONV_ID: 'pentester_ai_current_conv_id',
  SELECTED_MODEL: 'pentester_ai_selected_model',
  SETTINGS: 'pentester_ai_settings',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  aiProvider: 'gemini',
  selectedModel: 'gemini-2.5-flash',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  userName: DEFAULT_USER_NAME,
  temperature: 0.7,
  maxTokens: 4096,
  autoScroll: true,
  sendOnEnter: true,
};

export const storage = {
  getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load conversations from localStorage:', e);
      return [];
    }
  },

  saveConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations to localStorage:', e);
    }
  },

  getCurrentConversationId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_CONV_ID);
    } catch {
      return null;
    }
  },

  saveCurrentConversationId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_CONV_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_CONV_ID);
      }
    } catch (e) {
      console.error('Failed to save current conversation id to localStorage:', e);
    }
  },

  getSelectedModel(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL) || 'gemini-2.5-flash';
    } catch {
      return 'gemini-2.5-flash';
    }
  },

  saveSelectedModel(model: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, model);
    } catch (e) {
      console.error('Failed to save selected model to localStorage:', e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
      return DEFAULT_SETTINGS;
    } catch (e) {
      console.error('Failed to load settings from localStorage:', e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage:', e);
    }
  },
};
