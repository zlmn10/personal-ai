import React from 'react';
import {
  User,
  Palette,
  Globe,
  Sparkles,
  Key,
  Shield,
  Sliders,
  Database,
  Info,
} from 'lucide-react';
import { useTranslation } from '../../services/i18n';

export type SettingsCategoryTab =
  | 'general'
  | 'appearance'
  | 'language'
  | 'personalization'
  | 'ai'
  | 'tools'
  | 'parameters'
  | 'data'
  | 'about';

interface SettingsSidebarNavProps {
  activeTab: SettingsCategoryTab;
  onSelectTab: (tab: SettingsCategoryTab) => void;
}

export const SettingsSidebarNav: React.FC<SettingsSidebarNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const { t } = useTranslation();

  const navItems: {
    id: SettingsCategoryTab;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    badge?: string;
  }[] = [
    {
      id: 'ai',
      label: 'AI Provider (Gemini)',
      sublabel: 'API key & model engine',
      icon: Key,
      badge: 'Active',
    },
    {
      id: 'tools',
      label: 'Security Tools',
      sublabel: 'Engines & CLI scanner status',
      icon: Shield,
    },
    {
      id: 'personalization',
      label: t('tabPersonalization'),
      sublabel: 'Persona & prompt voice',
      icon: Sparkles,
    },
    {
      id: 'general',
      label: t('tabGeneral'),
      sublabel: 'Profile & chat preferences',
      icon: User,
    },
    {
      id: 'appearance',
      label: t('tabAppearance'),
      sublabel: 'Themes, glass & colors',
      icon: Palette,
    },
    {
      id: 'language',
      label: t('tabLanguage'),
      sublabel: 'Language & localization',
      icon: Globe,
    },
    {
      id: 'parameters',
      label: t('tabParameters'),
      sublabel: 'Inference sliders & tokens',
      icon: Sliders,
    },
    {
      id: 'data',
      label: t('tabData'),
      sublabel: 'MongoDB sync & backups',
      icon: Database,
    },
    {
      id: 'about',
      label: t('tabAbout'),
      sublabel: 'Version & architecture',
      icon: Info,
    },
  ];

  return (
    <div className="w-full sm:w-60 bg-gray-50/70 dark:bg-gray-900/60 border-r border-gray-100 dark:border-gray-800 p-2.5 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-y-auto flex-shrink-0">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group whitespace-nowrap sm:whitespace-normal ${
              isActive
                ? 'bg-purple-100/90 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 shadow-2xs font-bold ring-1 ring-purple-300 dark:ring-purple-800'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-800/80 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-purple-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <div className="min-w-0 leading-tight">
                <span className="text-xs truncate block">{item.label}</span>
                <span className="hidden sm:block text-[10px] text-gray-400 dark:text-gray-500 font-normal truncate mt-0.5">
                  {item.sublabel}
                </span>
              </div>
            </div>

            {item.badge && (
              <span className="ml-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-2xs">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
