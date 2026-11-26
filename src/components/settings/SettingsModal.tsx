import React, { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';
import type { AppSettings, Conversation } from '../../types/chat';
import type { ThemeConfig } from '../../types/theme';
import { themeService } from '../../services/themeService';
import { useTranslation } from '../../services/i18n';
import { SettingsSidebarNav, type SettingsCategoryTab } from './SettingsSidebarNav';
import { GeneralSettings } from './tabs/GeneralSettings';
import { AppearanceSettings } from './tabs/AppearanceSettings';
import { LanguageSettings } from './tabs/LanguageSettings';
import { PersonalizationSettings } from './tabs/PersonalizationSettings';
import { AISettings } from './tabs/AISettings';
import { ScannerToolsSettings } from './tabs/ScannerToolsSettings';
import { AIParametersSettings } from './tabs/AIParametersSettings';
import { DataStorageSettings } from './tabs/DataStorageSettings';
import { AboutSettings } from './tabs/AboutSettings';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  conversations: Conversation[];
  initialTab?: SettingsCategoryTab;
  onSave: (newSettings: AppSettings) => void;
  onClose: () => void;
  onDeleteAllChats: () => void;
  onImportConversations?: (imported: Conversation[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  conversations,
  initialTab = 'ai',
  onSave,
  onClose,
  onDeleteAllChats,
  onImportConversations,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsCategoryTab>(initialTab);
  const [formData, setFormData] = useState<AppSettings>(() => ({ ...settings }));
  const [themeData, setThemeData] = useState<ThemeConfig>(() => themeService.getConfig());

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...settings });
      setThemeData(themeService.getSavedConfig());
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, settings, initialTab]);

  if (!isOpen) return null;

  const handleThemeChange = (newTheme: ThemeConfig) => {
    setThemeData(newTheme);
    themeService.applyPreview(newTheme);
  };

  const handleCancel = () => {
    themeService.restoreSaved();
    onClose();
  };

  const handleSaveAndClose = () => {
    themeService.saveConfig(themeData);
    onSave(formData);
    onClose();
  };

  const getTabHeader = () => {
    switch (activeTab) {
      case 'ai':
        return {
          title: 'Google Gemini AI Provider',
          desc: 'Configure Google Gemini API key (AES-256 encrypted), model parameters, and connection testing',
        };
      case 'tools':
        return {
          title: 'Security Scanner Tools',
          desc: 'Detection status of Nmap, Nuclei, Nikto, OWASP ZAP, and native Node.js socket engines',
        };
      case 'personalization':
        return { title: t('tabPersonalization'), desc: t('personalizationDesc') };
      case 'general':
        return { title: t('tabGeneral'), desc: t('generalDesc') };
      case 'appearance':
        return { title: t('tabAppearance'), desc: t('appearanceDesc') };
      case 'language':
        return { title: t('tabLanguage'), desc: t('languageDesc') };
      case 'parameters':
        return { title: t('tabParameters'), desc: t('parametersDesc') };
      case 'data':
        return { title: t('tabData'), desc: t('dataDesc') };
      case 'about':
        return { title: t('tabAbout'), desc: t('aboutDesc') };
      default:
        return { title: t('settingsTitle'), desc: 'Preferences and configurations' };
    }
  };

  const { title, desc } = getTabHeader();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-4xl rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl border border-white/90 dark:border-gray-800 shadow-[0_25px_80px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-800">
              <Settings className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">{title}</h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Left Sidebar Tabs + Right Content */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden min-h-[460px]">
          {/* Left Navigation */}
          <SettingsSidebarNav
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
          />

          {/* Right Scrollable Content */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-gray-50/40 dark:bg-gray-900/40">
            {activeTab === 'ai' && <AISettings />}
            {activeTab === 'tools' && <ScannerToolsSettings />}
            {activeTab === 'personalization' && (
              <PersonalizationSettings settings={formData} onChange={setFormData} />
            )}
            {activeTab === 'general' && (
              <GeneralSettings settings={formData} onChange={setFormData} />
            )}
            {activeTab === 'appearance' && (
              <AppearanceSettings config={themeData} onChange={handleThemeChange} />
            )}
            {activeTab === 'language' && <LanguageSettings />}
            {activeTab === 'parameters' && (
              <AIParametersSettings settings={formData} onChange={setFormData} />
            )}
            {activeTab === 'data' && (
              <DataStorageSettings
                conversations={conversations}
                onDeleteAllChats={onDeleteAllChats}
                onImportConversations={onImportConversations}
              />
            )}
            {activeTab === 'about' && <AboutSettings />}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-tr from-[#4f86f7] to-[#765cf6] text-white text-xs font-semibold shadow-md hover:shadow-indigo-400/40 transition-all active:scale-95"
          >
            {t('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
};
