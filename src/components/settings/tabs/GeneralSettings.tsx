import React from 'react';
import { User, ScrollText, CornerDownLeft } from 'lucide-react';
import type { AppSettings } from '../../../types/chat';
import { useTranslation } from '../../../services/i18n';

interface GeneralSettingsProps {
  settings: AppSettings;
  onChange: (newSettings: AppSettings) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* User Display Name */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs space-y-2">
        <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <User className="w-4 h-4 text-purple-600" />
          <span>{t('userNameLabel')}</span>
        </label>
        <input
          type="text"
          value={settings.userName}
          onChange={(e) => onChange({ ...settings, userName: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-2xs"
          placeholder="Salman"
        />
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          {t('userNameDesc')}
        </p>
      </div>

      {/* Auto-scroll */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mt-0.5">
              <ScrollText className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                {t('autoScrollLabel')}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {t('autoScrollDesc')}
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.autoScroll}
            onChange={(e) => onChange({ ...settings, autoScroll: e.target.checked })}
            className="accent-purple-600 w-4 h-4 cursor-pointer rounded"
          />
        </label>
      </div>

      {/* Send on Enter */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mt-0.5">
              <CornerDownLeft className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                {t('sendOnEnterLabel')}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {t('sendOnEnterDesc')}
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.sendOnEnter}
            onChange={(e) => onChange({ ...settings, sendOnEnter: e.target.checked })}
            className="accent-purple-600 w-4 h-4 cursor-pointer rounded"
          />
        </label>
      </div>
    </div>
  );
};

