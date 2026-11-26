export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemePresetId = 'aurora' | 'midnight' | 'mint' | 'ivory' | 'ocean' | 'custom';

export type FontFamilyType =
  | 'Plus Jakarta Sans'
  | 'Inter'
  | 'Geist'
  | 'system-ui'
  | 'Fira Code'
  | 'Outfit';

export type FontSizeOption = 'small' | 'medium' | 'large';

export type InterfaceDensity = 'compact' | 'comfortable' | 'spacious';

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  subtitle: string;
  description: string;
  mode: 'light' | 'dark';
  accentColor: string;
  accentHover: string;
  background: string;
  ambientBlobs: [string, string, string, string];
  glassShellBg: string;
  glassShellBorder: string;
  glassPanelBg: string;
  glassPanelBorder: string;
  glassComposerBg: string;
  glassComposerBorder: string;
  composerText?: string;
  composerPlaceholder?: string;
  glassCardBg: string;
  glassCardBorder: string;
  glassPillBg: string;
  glassPillBorder: string;
  userBubbleBg: string;
  userBubbleText: string;
  aiBubbleBg: string;
  aiBubbleText: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  blur: number; // in px
  radius: number; // in px
  borderOpacity: number; // 0 to 100
  shadowIntensity: number; // 0 to 100
}

export interface TypographyConfig {
  fontFamily: FontFamilyType;
  fontSize: FontSizeOption;
  density: InterfaceDensity;
}

export interface CustomColors {
  background?: string;
  sidebar?: string;
  chatPanel?: string;
  accent?: string;
  userBubble?: string;
  aiBubble?: string;
  composer?: string;
  textPrimary?: string;
  textSecondary?: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  activePreset: ThemePresetId;
  accentColor: string;
  background: string;
  glassTransparency: number; // 30 to 95 (%)
  blurIntensity: number; // 0 to 50 (px)
  borderOpacity: number; // 0 to 100 (%)
  shadowIntensity: number; // 0 to 100 (%)
  cornerRadius: number; // 8 to 36 (px)
  typography: TypographyConfig;
  customColors: CustomColors;
}

export const THEME_PRESETS: Record<Exclude<ThemePresetId, 'custom'>, ThemePreset> = {
  aurora: {
    id: 'aurora',
    name: 'Aurora Glass',
    subtitle: 'Lavender, pink and sky blue',
    description: 'The signature soft frosted glassmorphism theme with pastel ambient illumination.',
    mode: 'light',
    accentColor: '#6366f1',
    accentHover: '#4f46e5',
    background: 'linear-gradient(135deg, #A9D0FA 0%, #A6E7F4 30%, #B98BFA 65%, #C6F6B0 100%)',
    ambientBlobs: [
      'radial-gradient(circle, rgba(166, 231, 244, 0.45) 0%, rgba(166, 231, 244, 0) 70%)',
      'radial-gradient(circle, rgba(216, 180, 254, 0.5) 0%, rgba(216, 180, 254, 0) 70%)',
      'radial-gradient(circle, rgba(198, 246, 176, 0.45) 0%, rgba(198, 246, 176, 0) 70%)',
      'radial-gradient(circle, rgba(251, 207, 232, 0.4) 0%, rgba(251, 207, 232, 0) 70%)',
    ],
    glassShellBg: 'rgba(255, 255, 255, 0.48)',
    glassShellBorder: 'rgba(255, 255, 255, 0.65)',
    glassPanelBg: 'rgba(255, 255, 255, 0.54)',
    glassPanelBorder: 'rgba(255, 255, 255, 0.75)',
    glassComposerBg: 'rgba(255, 255, 255, 0.82)',
    glassComposerBorder: 'rgba(255, 255, 255, 0.95)',
    composerText: '#1e2432',
    composerPlaceholder: '#64748b',
    glassCardBg: 'rgba(255, 255, 255, 0.58)',
    glassCardBorder: 'rgba(255, 255, 255, 0.75)',
    glassPillBg: 'rgba(255, 255, 255, 0.65)',
    glassPillBorder: 'rgba(255, 255, 255, 0.85)',
    userBubbleBg: 'linear-gradient(135deg, #4f86f7 0%, #765cf6 100%)',
    userBubbleText: '#ffffff',
    aiBubbleBg: 'rgba(255, 255, 255, 0.72)',
    aiBubbleText: '#1e2432',
    textPrimary: '#1e2432',
    textSecondary: '#62697b',
    textMuted: '#94a3b8',
    blur: 35,
    radius: 24,
    borderOpacity: 70,
    shadowIntensity: 40,
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Glass',
    subtitle: 'Deep navy, obsidian and purple',
    description: 'Sophisticated dark mode frosted glass with deep indigo shadows and glowing cyan/purple accents.',
    mode: 'dark',
    accentColor: '#818cf8',
    accentHover: '#a5b4fc',
    background: 'linear-gradient(135deg, #090d16 0%, #111827 35%, #18152e 70%, #0a0f1d 100%)',
    ambientBlobs: [
      'radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(56, 189, 248, 0) 70%)',
      'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(168, 85, 247, 0) 70%)',
      'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0) 70%)',
      'radial-gradient(circle, rgba(20, 184, 166, 0.18) 0%, rgba(20, 184, 166, 0) 70%)',
    ],
    glassShellBg: 'rgba(17, 24, 39, 0.72)',
    glassShellBorder: 'rgba(255, 255, 255, 0.12)',
    glassPanelBg: 'rgba(15, 23, 42, 0.75)',
    glassPanelBorder: 'rgba(255, 255, 255, 0.14)',
    glassComposerBg: 'rgba(22, 30, 49, 0.88)',
    glassComposerBorder: 'rgba(255, 255, 255, 0.2)',
    composerText: '#f8fafc',
    composerPlaceholder: '#94a3b8',
    glassCardBg: 'rgba(30, 41, 59, 0.65)',
    glassCardBorder: 'rgba(255, 255, 255, 0.12)',
    glassPillBg: 'rgba(30, 41, 59, 0.75)',
    glassPillBorder: 'rgba(255, 255, 255, 0.16)',
    userBubbleBg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    userBubbleText: '#ffffff',
    aiBubbleBg: 'rgba(24, 32, 51, 0.75)',
    aiBubbleText: '#f1f5f9',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    blur: 35,
    radius: 24,
    borderOpacity: 35,
    shadowIntensity: 60,
  },
  mint: {
    id: 'mint',
    name: 'Mint Crystal',
    subtitle: 'Aqua, mint and crisp white',
    description: 'Refreshing crystal-clear glass with aqua, seafoam, and crisp translucent panels.',
    mode: 'light',
    accentColor: '#0d9488',
    accentHover: '#0f766e',
    background: 'linear-gradient(135deg, #a7f3d0 0%, #ccfbf1 35%, #bae6fd 70%, #d1fae5 100%)',
    ambientBlobs: [
      'radial-gradient(circle, rgba(45, 212, 191, 0.4) 0%, rgba(45, 212, 191, 0) 70%)',
      'radial-gradient(circle, rgba(52, 211, 153, 0.35) 0%, rgba(52, 211, 153, 0) 70%)',
      'radial-gradient(circle, rgba(125, 211, 252, 0.4) 0%, rgba(125, 211, 252, 0) 70%)',
      'radial-gradient(circle, rgba(167, 243, 208, 0.35) 0%, rgba(167, 243, 208, 0) 70%)',
    ],
    glassShellBg: 'rgba(255, 255, 255, 0.52)',
    glassShellBorder: 'rgba(255, 255, 255, 0.75)',
    glassPanelBg: 'rgba(255, 255, 255, 0.62)',
    glassPanelBorder: 'rgba(255, 255, 255, 0.85)',
    glassComposerBg: 'rgba(255, 255, 255, 0.88)',
    glassComposerBorder: 'rgba(255, 255, 255, 0.95)',
    composerText: '#0f172a',
    composerPlaceholder: '#64748b',
    glassCardBg: 'rgba(255, 255, 255, 0.65)',
    glassCardBorder: 'rgba(255, 255, 255, 0.8)',
    glassPillBg: 'rgba(255, 255, 255, 0.75)',
    glassPillBorder: 'rgba(255, 255, 255, 0.9)',
    userBubbleBg: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
    userBubbleText: '#ffffff',
    aiBubbleBg: 'rgba(255, 255, 255, 0.78)',
    aiBubbleText: '#0f172a',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    blur: 32,
    radius: 24,
    borderOpacity: 75,
    shadowIntensity: 35,
  },
  ivory: {
    id: 'ivory',
    name: 'Ivory Frost',
    subtitle: 'Cream, champagne and warm amber',
    description: 'Warm, elegant champagne glass with golden accents and gentle incandescent glow.',
    mode: 'light',
    accentColor: '#d97706',
    accentHover: '#b45309',
    background: 'linear-gradient(135deg, #fef3c7 0%, #fff7ed 35%, #fde68a 70%, #fed7aa 100%)',
    ambientBlobs: [
      'radial-gradient(circle, rgba(251, 191, 36, 0.35) 0%, rgba(251, 191, 36, 0) 70%)',
      'radial-gradient(circle, rgba(253, 186, 116, 0.35) 0%, rgba(253, 186, 116, 0) 70%)',
      'radial-gradient(circle, rgba(254, 205, 211, 0.3) 0%, rgba(254, 205, 211, 0) 70%)',
      'radial-gradient(circle, rgba(254, 240, 138, 0.4) 0%, rgba(254, 240, 138, 0) 70%)',
    ],
    glassShellBg: 'rgba(255, 253, 247, 0.56)',
    glassShellBorder: 'rgba(255, 255, 255, 0.8)',
    glassPanelBg: 'rgba(255, 253, 247, 0.65)',
    glassPanelBorder: 'rgba(255, 255, 255, 0.88)',
    glassComposerBg: 'rgba(255, 255, 255, 0.9)',
    glassComposerBorder: 'rgba(255, 255, 255, 0.98)',
    composerText: '#1c1917',
    composerPlaceholder: '#78716c',
    glassCardBg: 'rgba(255, 252, 242, 0.7)',
    glassCardBorder: 'rgba(255, 255, 255, 0.85)',
    glassPillBg: 'rgba(255, 252, 242, 0.8)',
    glassPillBorder: 'rgba(255, 255, 255, 0.95)',
    userBubbleBg: 'linear-gradient(135deg, #ea580c 0%, #d97706 100%)',
    userBubbleText: '#ffffff',
    aiBubbleBg: 'rgba(255, 253, 247, 0.82)',
    aiBubbleText: '#292524',
    textPrimary: '#292524',
    textSecondary: '#57534e',
    textMuted: '#a8a29e',
    blur: 30,
    radius: 24,
    borderOpacity: 70,
    shadowIntensity: 30,
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Glass',
    subtitle: 'Cobalt, azure and cyan',
    description: 'Deep maritime dark mode with luminescent cyan highlights and frosted navy glass.',
    mode: 'dark',
    accentColor: '#38bdf8',
    accentHover: '#0ea5e9',
    background: 'linear-gradient(135deg, #031326 0%, #08213e 35%, #0c2b4c 70%, #04101e 100%)',
    ambientBlobs: [
      'radial-gradient(circle, rgba(34, 211, 238, 0.28) 0%, rgba(34, 211, 238, 0) 70%)',
      'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0) 70%)',
      'radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, rgba(14, 165, 233, 0) 70%)',
      'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0) 70%)',
    ],
    glassShellBg: 'rgba(8, 25, 48, 0.72)',
    glassShellBorder: 'rgba(255, 255, 255, 0.14)',
    glassPanelBg: 'rgba(6, 20, 40, 0.78)',
    glassPanelBorder: 'rgba(255, 255, 255, 0.16)',
    glassComposerBg: 'rgba(10, 31, 58, 0.88)',
    glassComposerBorder: 'rgba(255, 255, 255, 0.22)',
    composerText: '#f8fafc',
    composerPlaceholder: '#94a3b8',
    glassCardBg: 'rgba(12, 38, 70, 0.65)',
    glassCardBorder: 'rgba(255, 255, 255, 0.14)',
    glassPillBg: 'rgba(12, 38, 70, 0.75)',
    glassPillBorder: 'rgba(255, 255, 255, 0.18)',
    userBubbleBg: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
    userBubbleText: '#ffffff',
    aiBubbleBg: 'rgba(11, 33, 62, 0.78)',
    aiBubbleText: '#f0f9ff',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    blur: 35,
    radius: 24,
    borderOpacity: 35,
    shadowIntensity: 65,
  },
};

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: 'light',
  activePreset: 'aurora',
  accentColor: '#6366f1',
  background: THEME_PRESETS.aurora.background,
  glassTransparency: 54,
  blurIntensity: 35,
  borderOpacity: 70,
  shadowIntensity: 40,
  cornerRadius: 24,
  typography: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 'medium',
    density: 'comfortable',
  },
  customColors: {},
};

