import React from 'react';
import { Languages, Check, Globe } from 'lucide-react';
import { useTranslation, type LanguageCode } from '../../../services/i18n';

export const LanguageSettings: React.FC = () => {
  const { currentLang, setLanguage, supportedLanguages, t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs space-y-3">
        <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-600" />
          <span>{t('selectLanguage')}</span>
        </label>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          {t('languageDesc')}
        </p>

        <div className="grid grid-cols-1 gap-2.5 pt-1">
          {supportedLanguages.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code as LanguageCode)}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all group ${
                  isSelected
                    ? 'bg-purple-50/80 dark:bg-purple-950/50 border-purple-400 dark:border-purple-500 shadow-xs ring-1 ring-purple-300'
                    : 'bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none">{lang.flag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                        {lang.label}
                      </span>
                      <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                        ({lang.nativeLabel})
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-0.5">
                      {lang.region}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 group-hover:border-purple-300'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 text-[11px] text-sky-800 dark:text-sky-300 flex items-start gap-2.5">
        <Languages className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
        <span>
          Selecting a language immediately updates the navigation, buttons, welcome cards, and settings menus in your chosen language.
        </span>
      </div>
    </div>
  );
};
