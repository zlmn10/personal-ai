import React from 'react';
import {
  Sun,
  Moon,
  Laptop,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Palette,
  Type,
} from 'lucide-react';
import type {
  ThemeConfig,
  ThemePresetId,
  ThemeMode,
  FontFamilyType,
  FontSizeOption,
  InterfaceDensity,
} from '../../../types/theme';
import { THEME_PRESETS, DEFAULT_THEME_CONFIG } from '../../../types/theme';
import { ThemePreview } from '../ThemePreview';
import { useTranslation } from '../../../services/i18n';

interface AppearanceSettingsProps {
  config: ThemeConfig;
  onChange: (newConfig: ThemeConfig) => void;
}

const ACCENT_SWATCHES = [
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Sky Blue', hex: '#0284c7' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Amber Gold', hex: '#d97706' },
  { name: 'Rose Pink', hex: '#e11d48' },
  { name: 'Dark Navy', hex: '#1e293b' },
];

const FONT_OPTIONS: { id: FontFamilyType; label: string; desc: string }[] = [
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', desc: 'Modern & geometric (Default)' },
  { id: 'Inter', label: 'Inter', desc: 'Clean & highly legible' },
  { id: 'Geist', label: 'Geist', desc: 'Vercel minimalist precision' },
  { id: 'system-ui', label: 'System UI', desc: 'Native OS font stack' },
  { id: 'Fira Code', label: 'Fira Code', desc: 'Developer monospace feel' },
  { id: 'Outfit', label: 'Outfit', desc: 'Bold & contemporary' },
];

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ config, onChange }) => {
  const { t } = useTranslation();

  const handleModeChange = (mode: ThemeMode) => {
    if (mode === 'dark' && (config.activePreset === 'aurora' || config.activePreset === 'ivory' || config.activePreset === 'mint')) {
      handlePresetSelect('midnight');
      return;
    }
    if (mode === 'light' && (config.activePreset === 'midnight' || config.activePreset === 'ocean')) {
      handlePresetSelect('aurora');
      return;
    }
    onChange({ ...config, mode });
  };

  const handlePresetSelect = (presetId: ThemePresetId) => {
    if (presetId === 'custom') {
      onChange({ ...config, activePreset: 'custom' });
      return;
    }
    const preset = THEME_PRESETS[presetId];
    onChange({
      ...config,
      activePreset: presetId,
      mode: preset.mode,
      accentColor: preset.accentColor,
      background: preset.background,
      blurIntensity: preset.blur,
      cornerRadius: preset.radius,
      borderOpacity: preset.borderOpacity,
      shadowIntensity: preset.shadowIntensity,
      customColors: {},
    });
  };

  const handleSliderChange = (
    key: 'glassTransparency' | 'blurIntensity' | 'borderOpacity' | 'shadowIntensity' | 'cornerRadius',
    val: number
  ) => {
    onChange({ ...config, [key]: val, activePreset: 'custom' });
  };

  const handleCustomColorChange = (key: keyof ThemeConfig['customColors'], val: string) => {
    onChange({
      ...config,
      activePreset: 'custom',
      customColors: {
        ...(config.customColors || {}),
        [key]: val,
      },
    });
  };

  const handleReset = () => {
    onChange({ ...DEFAULT_THEME_CONFIG });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Live Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {t('livePreviewTitle')}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Reset to default Aurora Glass theme"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('resetDefault')}</span>
          </button>
        </div>

        {/* Live Interactive Preview Box */}
        <ThemePreview config={config} />
      </div>

      {/* 1. THEME MODE */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs space-y-3">
        <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>{t('themeMode')}</span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleModeChange('light')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
              config.mode === 'light'
                ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-300'
                : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>{t('modeLight')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('dark')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
              config.mode === 'dark'
                ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-300'
                : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>{t('modeDark')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('system')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
              config.mode === 'system'
                ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-300'
                : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>{t('modeSystem')}</span>
          </button>
        </div>
      </div>

      {/* 2. THEME PRESETS */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs space-y-3">
        <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Palette className="w-4 h-4 text-purple-600" />
          <span>{t('presetsTitle')}</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {Object.values(THEME_PRESETS).map((preset) => {
            const isSelected = config.activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset.id)}
                className={`p-3 rounded-xl text-left border transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-400 dark:border-purple-500 shadow-xs ring-1 ring-purple-300'
                    : 'bg-white/80 dark:bg-gray-800/70 hover:bg-purple-50/40 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                      {preset.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {preset.mode}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {preset.subtitle}
                  </p>
                  {/* Swatches preview */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                      style={{ background: preset.accentColor }}
                      title="Accent"
                    />
                    <span
                      className="w-8 h-3.5 rounded-md border border-black/10 shadow-2xs"
                      style={{ background: preset.background }}
                      title="Background gradient"
                    />
                    <span
                      className="w-6 h-3.5 rounded-md border border-black/10 shadow-2xs"
                      style={{ background: preset.userBubbleBg }}
                      title="User message bubble"
                    />
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
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. GLASSMORPHISM SLIDERS */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs space-y-4">
        <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-600" />
          <span>{t('glassControlsTitle')}</span>
        </label>

        {/* Transparency */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{t('glassTransparency')}</span>
            <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
              {config.glassTransparency}%
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="95"
            step="1"
            value={config.glassTransparency}
            onChange={(e) => handleSliderChange('glassTransparency', parseInt(e.target.value, 10))}
            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        </div>

        {/* Blur */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{t('blurIntensity')}</span>
            <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
              {config.blurIntensity}px
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={config.blurIntensity}
            onChange={(e) => handleSliderChange('blurIntensity', parseInt(e.target.value, 10))}
            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        </div>

        {/* Border Opacity */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{t('borderOpacity')}</span>
            <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
              {config.borderOpacity}%
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="1"
            value={config.borderOpacity}
            onChange={(e) => handleSliderChange('borderOpacity', parseInt(e.target.value, 10))}
            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        </div>

        {/* Shadow Intensity */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{t('shadowIntensity')}</span>
            <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
              {config.shadowIntensity}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={config.shadowIntensity}
            onChange={(e) => handleSliderChange('shadowIntensity', parseInt(e.target.value, 10))}
            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        </div>

        {/* Corner Radius */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{t('cornerRadius')}</span>
            <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
              {config.cornerRadius}px
            </span>
          </div>
          <input
            type="range"
            min="8"
            max="36"
            step="1"
            value={config.cornerRadius}
            onChange={(e) => handleSliderChange('cornerRadius', parseInt(e.target.value, 10))}
            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        </div>
      </div>

      {/* 4. ACCENT COLOR & CUSTOM PALETTE */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs space-y-4">
        <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Palette className="w-4 h-4 text-purple-600" />
          <span>{t('customColorsTitle')}</span>
        </label>

        {/* Accent Color */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('accentColorLabel')}</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.accentColor || '#6366f1'}
                onChange={(e) => {
                  onChange({
                    ...config,
                    accentColor: e.target.value,
                    activePreset: 'custom',
                  });
                }}
                className="w-6 h-6 rounded-md border border-gray-300 cursor-pointer p-0 overflow-hidden"
              />
              <span className="font-mono text-xs text-gray-600 dark:text-gray-400 uppercase">
                {config.accentColor}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {ACCENT_SWATCHES.map((swatch) => (
              <button
                key={swatch.hex}
                type="button"
                onClick={() => {
                  onChange({
                    ...config,
                    accentColor: swatch.hex,
                    activePreset: 'custom',
                  });
                }}
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                  config.accentColor.toLowerCase() === swatch.hex.toLowerCase()
                    ? 'ring-2 ring-purple-500 scale-110 shadow-xs'
                    : 'border-white/80 hover:scale-105'
                }`}
                style={{ background: swatch.hex }}
                title={swatch.name}
              >
                {config.accentColor.toLowerCase() === swatch.hex.toLowerCase() && (
                  <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* User Message Bubble Color */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                User Message Bubble Color
              </span>
              <span className="text-[11px] text-gray-400">Custom solid color or HEX</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.customColors?.userBubble?.startsWith('#') ? config.customColors.userBubble : '#4f86f7'}
                onChange={(e) => handleCustomColorChange('userBubble', e.target.value)}
                className="w-6 h-6 rounded-md border border-gray-300 cursor-pointer p-0 overflow-hidden"
              />
              <input
                type="text"
                placeholder="#4f86f7"
                value={config.customColors?.userBubble || ''}
                onChange={(e) => handleCustomColorChange('userBubble', e.target.value)}
                className="w-20 px-2 py-1 rounded-md text-xs font-mono border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. TYPOGRAPHY & LAYOUT */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs space-y-4">
        <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Type className="w-4 h-4 text-purple-600" />
          <span>{t('typographyTitle')}</span>
        </label>

        {/* Font Family */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('fontFamilyLabel')}</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FONT_OPTIONS.map((font) => {
              const isSelected = config.typography?.fontFamily === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...config,
                      typography: { ...config.typography, fontFamily: font.id },
                    })
                  }
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-purple-100/80 dark:bg-purple-950/50 border-purple-400 dark:border-purple-500 text-purple-900 dark:text-purple-200 shadow-2xs'
                      : 'bg-white dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <div className="text-xs font-bold truncate" style={{ fontFamily: font.id }}>
                    {font.label}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {font.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Size & Density */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
              {t('fontSizeLabel')}
            </span>
            <div className="flex gap-1.5">
              {(['small', 'medium', 'large'] as FontSizeOption[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...config,
                      typography: { ...config.typography, fontSize: size },
                    })
                  }
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                    config.typography?.fontSize === size
                      ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
              {t('densityLabel')}
            </span>
            <div className="flex gap-1.5">
              {(['compact', 'comfortable', 'spacious'] as InterfaceDensity[]).map((density) => (
                <button
                  key={density}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...config,
                      typography: { ...config.typography, density },
                    })
                  }
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                    config.typography?.density === density
                      ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {density}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

