import {
  type ThemeConfig,
  type ThemePreset,
  type ThemeMode,
  THEME_PRESETS,
  DEFAULT_THEME_CONFIG,
} from '../types/theme';

export function isColorDark(colorStr?: string): boolean {
  if (!colorStr) return false;
  // rgba(r, g, b, a) or rgb(r, g, b)
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return lum < 145;
  }
  // #hex
  if (colorStr.startsWith('#')) {
    let hex = colorStr.slice(1);
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      return lum < 145;
    }
  }
  return false;
}

export function isBackgroundDark(bgString?: string, presetId?: string): boolean {
  if (presetId === 'midnight' || presetId === 'ocean') return true;
  if (presetId === 'aurora' || presetId === 'mint' || presetId === 'ivory') return false;
  if (!bgString) return false;

  // Extract all hex colors from gradient or hex string
  const hexMatches = bgString.match(/#[0-9a-fA-F]{3,8}/g);
  if (hexMatches && hexMatches.length > 0) {
    let totalLum = 0;
    for (const hex of hexMatches) {
      let clean = hex.slice(1);
      if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
      if (clean.length >= 6) {
        const r = parseInt(clean.slice(0, 2), 16);
        const g = parseInt(clean.slice(2, 4), 16);
        const b = parseInt(clean.slice(4, 6), 16);
        totalLum += (0.299 * r + 0.587 * g + 0.114 * b);
      }
    }
    return (totalLum / hexMatches.length) < 145;
  }

  // Extract rgb/rgba values
  const rgbMatches = Array.from(bgString.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)/gi));
  if (rgbMatches.length > 0) {
    let totalLum = 0;
    for (const match of rgbMatches) {
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      totalLum += (0.299 * r + 0.587 * g + 0.114 * b);
    }
    return (totalLum / rgbMatches.length) < 145;
  }

  return false;
}

const THEME_STORAGE_KEY = 'personal_ai_theme';

type ThemeChangeListener = (config: ThemeConfig) => void;

class ThemeServiceManager {
  private currentConfig: ThemeConfig;
  private savedConfig: ThemeConfig;
  private listeners: Set<ThemeChangeListener> = new Set();
  private systemMediaQuery: MediaQueryList | null = null;

  constructor() {
    this.savedConfig = this.loadFromStorage();
    this.currentConfig = { ...this.savedConfig };
  }

  public init(): void {
    if (typeof window === 'undefined') return;

    this.systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemMediaQuery.addEventListener('change', () => {
      if (this.currentConfig.mode === 'system') {
        this.applyTheme(this.currentConfig);
      }
    });

    this.applyTheme(this.currentConfig);
  }

  public getConfig(): ThemeConfig {
    return { ...this.currentConfig };
  }

  public getSavedConfig(): ThemeConfig {
    return { ...this.savedConfig };
  }

  public subscribe(listener: ThemeChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.currentConfig);
    }
  }

  public applyPreview(config: ThemeConfig): void {
    this.currentConfig = { ...config };
    this.applyTheme(this.currentConfig);
    this.notify();
  }

  public restoreSaved(): void {
    this.currentConfig = { ...this.savedConfig };
    this.applyTheme(this.currentConfig);
    this.notify();
  }

  public saveConfig(config: ThemeConfig): void {
    this.savedConfig = { ...config };
    this.currentConfig = { ...config };
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save theme to localStorage:', e);
    }
    this.applyTheme(this.currentConfig);
    this.notify();
  }

  public resolveEffectiveMode(mode: ThemeMode, presetId?: string): 'light' | 'dark' {
    const targetPreset = presetId || this.currentConfig?.activePreset;
    // Known built-in preset natural modes take priority when selected
    if (targetPreset && targetPreset !== 'custom' && targetPreset in THEME_PRESETS) {
      return THEME_PRESETS[targetPreset as keyof typeof THEME_PRESETS].mode;
    }

    if (mode === 'dark') return 'dark';
    if (mode === 'light') return 'light';

    // Custom preset with system mode follows OS media query
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  public getPreset(presetId: string): ThemePreset {
    if (presetId in THEME_PRESETS) {
      return THEME_PRESETS[presetId as keyof typeof THEME_PRESETS];
    }
    return THEME_PRESETS.aurora;
  }

  public applyTheme(config: ThemeConfig): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const effectiveMode = this.resolveEffectiveMode(config.mode, config.activePreset);

    // Determine baseline preset
    let preset: ThemePreset;
    if (config.activePreset === 'custom') {
      preset = effectiveMode === 'dark' ? THEME_PRESETS.midnight : THEME_PRESETS.aurora;
    } else {
      preset = this.getPreset(config.activePreset);
    }

    const custom = config.customColors || {};

    // Calculate Glass Transparency
    const glassAlpha = Math.max(0.15, Math.min(0.98, (config.glassTransparency ?? 54) / 100));
    const borderAlpha = Math.max(0.05, Math.min(1, (config.borderOpacity ?? 70) / 100));
    const shadowAlpha = Math.max(0.02, Math.min(0.8, (config.shadowIntensity ?? 40) / 100));

    // Dynamic background
    const bg = custom.background || config.background || preset.background;
    root.style.setProperty('--app-background', bg);

    // Determine surface darkness accurately
    const isDark = isBackgroundDark(bg, config.activePreset);

    // Toggle dark class on root based on actual surface darkness
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Ambient Blobs
    const blobs = preset.ambientBlobs;
    root.style.setProperty('--ambient-blob-1', blobs[0]);
    root.style.setProperty('--ambient-blob-2', blobs[1]);
    root.style.setProperty('--ambient-blob-3', blobs[2]);
    root.style.setProperty('--ambient-blob-4', blobs[3]);

    // Accent Color
    const accent = custom.accent || config.accentColor || preset.accentColor;
    root.style.setProperty('--accent-color', accent);
    root.style.setProperty('--accent-hover', preset.accentHover);
    root.style.setProperty(
      '--accent-glow',
      `0 0 20px ${accent}40, 0 0 40px ${accent}20`
    );

    // Blur & Radius
    root.style.setProperty('--glass-blur', `${config.blurIntensity ?? 35}px`);
    root.style.setProperty('--glass-radius', `${config.cornerRadius ?? 24}px`);

    // Glass Shell
    const shellBg = custom.sidebar || (config.activePreset === 'custom'
      ? (effectiveMode === 'dark' ? `rgba(17, 24, 39, ${glassAlpha})` : `rgba(255, 255, 255, ${glassAlpha})`)
      : preset.glassShellBg);
    const shellBorder = config.activePreset === 'custom'
      ? (effectiveMode === 'dark' ? `rgba(255, 255, 255, ${borderAlpha * 0.25})` : `rgba(255, 255, 255, ${borderAlpha})`)
      : preset.glassShellBorder;
    root.style.setProperty('--glass-shell-bg', shellBg);
    root.style.setProperty('--glass-shell-border', shellBorder);
    root.style.setProperty(
      '--glass-shell-shadow',
      `0 20px 80px rgba(0, 0, 0, ${shadowAlpha})`
    );

    // Glass Panel (Chat window background)
    const panelBg = custom.chatPanel || (config.activePreset === 'custom'
      ? (effectiveMode === 'dark' ? `rgba(15, 23, 42, ${glassAlpha})` : `rgba(255, 255, 255, ${glassAlpha})`)
      : preset.glassPanelBg);
    root.style.setProperty('--glass-panel-bg', panelBg);
    root.style.setProperty('--glass-panel-border', shellBorder);

    // Glass Composer
    const composerBg = custom.composer || preset.glassComposerBg;
    root.style.setProperty('--glass-composer-bg', composerBg);
    root.style.setProperty('--glass-composer-border', preset.glassComposerBorder);
    root.style.setProperty(
      '--glass-composer-shadow',
      `0 12px 35px rgba(0, 0, 0, ${shadowAlpha * 0.4})`
    );

    // Guaranteed high-contrast composer text logic (never white-on-white or dark-on-dark)
    const isComposerDark = isColorDark(composerBg);
    const composerText = isComposerDark ? '#f8fafc' : '#0f172a';
    const composerPlaceholder = isComposerDark ? '#94a3b8' : '#64748b';
    const composerCaret = isComposerDark ? '#818cf8' : '#6366f1';
    root.style.setProperty('--glass-composer-text', composerText);
    root.style.setProperty('--glass-composer-placeholder', composerPlaceholder);
    root.style.setProperty('--glass-composer-caret', composerCaret);

    // Glass Card & Pill
    root.style.setProperty('--glass-card-bg', preset.glassCardBg);
    root.style.setProperty('--glass-card-border', preset.glassCardBorder);
    root.style.setProperty('--glass-pill-bg', preset.glassPillBg);
    root.style.setProperty('--glass-pill-border', preset.glassPillBorder);

    // Messages Bubble
    const userBubbleBg = custom.userBubble || preset.userBubbleBg;
    root.style.setProperty('--user-bubble-bg', userBubbleBg);
    root.style.setProperty('--user-bubble-text', preset.userBubbleText);

    const aiBubbleBg = custom.aiBubble || (isDark ? 'rgba(24, 32, 51, 0.75)' : preset.aiBubbleBg);
    root.style.setProperty('--ai-bubble-bg', aiBubbleBg);

    // Guaranteed high-contrast AI text color: always dark (#1e2432) on light surfaces, always bright (#f8fafc) on dark surfaces
    const aiBubbleText = custom.textPrimary || (isDark ? '#f8fafc' : (preset.aiBubbleText || '#1e2432'));
    root.style.setProperty('--ai-bubble-text', aiBubbleText);

    // Typography: guarantees readability regardless of custom tweaks
    const textPrimary = custom.textPrimary || (isDark ? '#f8fafc' : (preset.textPrimary || '#1e2432'));
    const textSecondary = custom.textSecondary || (isDark ? '#94a3b8' : (preset.textSecondary || '#475569'));
    root.style.setProperty('--text-primary', textPrimary);
    root.style.setProperty('--text-secondary', textSecondary);
    root.style.setProperty('--text-muted', isDark ? '#64748b' : preset.textMuted);

    // Typography safe fallback
    const typography = config?.typography || DEFAULT_THEME_CONFIG.typography;
    const fontFamily = typography?.fontFamily || 'Plus Jakarta Sans';
    const fontSize = typography?.fontSize || 'medium';

    const fontMap: Record<string, string> = {
      'Plus Jakarta Sans': "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      Inter: "'Inter', system-ui, -apple-system, sans-serif",
      Geist: "'Geist', system-ui, -apple-system, sans-serif",
      'system-ui': "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      'Fira Code': "'Fira Code', monospace",
      Outfit: "'Outfit', system-ui, -apple-system, sans-serif",
    };
    root.style.setProperty(
      '--font-family-base',
      fontMap[fontFamily] || fontMap['Plus Jakarta Sans']
    );

    const fontSizeMap: Record<string, string> = {
      small: '13px',
      medium: '14px',
      large: '15.5px',
    };
    root.style.setProperty(
      '--font-size-base',
      fontSizeMap[fontSize] || '14px'
    );
  }

  private loadFromStorage(): ThemeConfig {
    if (typeof localStorage === 'undefined') return DEFAULT_THEME_CONFIG;
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (!saved) return DEFAULT_THEME_CONFIG;
      const parsed = JSON.parse(saved);
      const activePreset = parsed.activePreset || DEFAULT_THEME_CONFIG.activePreset;
      const presetMode = (activePreset in THEME_PRESETS)
        ? THEME_PRESETS[activePreset as keyof typeof THEME_PRESETS].mode
        : 'light';

      return {
        ...DEFAULT_THEME_CONFIG,
        ...parsed,
        mode: parsed.mode === 'system' ? presetMode : (parsed.mode || presetMode),
        typography: {
          ...DEFAULT_THEME_CONFIG.typography,
          ...(parsed.typography || {}),
        },
        customColors: {
          ...(parsed.customColors || {}),
        },
      };
    } catch (e) {
      console.error('Failed to parse theme from storage:', e);
      return DEFAULT_THEME_CONFIG;
    }
  }
}

export const themeService = new ThemeServiceManager();
