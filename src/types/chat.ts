export type Role = 'system' | 'user' | 'assistant';

export interface MessagePerformance {
  ttftMs: number;
  totalDurationMs: number;
  loadDurationMs?: number;
  tokensPerSecond: number;
  tokenCount: number;
  promptTokens?: number;
  promptEvalSpeed?: number;
}

export interface SystemStats {
  ram: {
    totalGb: string;
    usedGb: string;
    freeGb: string;
    percent: number;
  };
  cpu: {
    percent: number;
    cores: number;
    model: string;
  };
  gpu: {
    hasGpu: boolean;
    name: string;
    totalMb: number;
    usedMb: number;
    freeMb: number;
    usedGb: string;
    totalGb: string;
    percent: number;
    utilPercent: number;
    temperatureC: number | null;
  };
  uptimeSec?: number;
  timestamp: number;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  model?: string;
  isError?: boolean;
  performance?: MessagePerformance;
  images?: string[];
  scanContextId?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: string;
  messages: Message[];
  systemPrompt?: string;
  personaId?: string;
}

export interface AIModelOption {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'anthropic' | 'experiential';
  description: string;
  contextWindow: string;
  badge?: string;
}

export const GEMINI_MODELS: AIModelOption[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    description: 'Ultra-fast inference, ideal for real-time telemetry and port triage.',
    contextWindow: '1M tokens',
    badge: 'Recommended',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    description: 'State-of-the-art reasoning for complex exploit chains and in-depth report generation.',
    contextWindow: '2M tokens',
    badge: 'Deep Reasoning',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    description: 'Lightweight high-speed model for quick vulnerability summaries.',
    contextWindow: '1M tokens',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    description: 'Long-context multimodal model for extensive log inspection.',
    contextWindow: '2M tokens',
  },
  {
    id: 'claude-sonnet-latest',
    name: 'Claude 3.5 Sonnet (Experiential)',
    provider: 'experiential',
    description: 'High-capability reasoning via Experiential Labs AI gateway.',
    contextWindow: '200k tokens',
    badge: 'Gateway',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1 (Experiential)',
    provider: 'experiential',
    description: 'Deep reasoning and code math via Experiential Labs gateway.',
    contextWindow: '128k tokens',
  },
];

export interface AppSettings {
  aiProvider: string;
  selectedModel: string;
  systemPrompt: string;
  userName: string;
  temperature: number;
  maxTokens: number;
  autoScroll: boolean;
  sendOnEnter: boolean;
}

export type DateCategory = 'Today' | 'Yesterday' | 'Previous 7 Days' | 'Previous 30 Days' | 'Older';
