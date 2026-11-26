import React from 'react';
import { Menu, Plus, Download, Trash2, Settings, Sparkles } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import type { Conversation } from '../types/chat';
import type { SettingsCategoryTab } from './settings/SettingsSidebarNav';
import { exportConversationToMarkdown } from '../utils/formatters';
import { useTranslation } from '../services/i18n';

interface ChatHeaderProps {
  conversation?: Conversation;
  selectedModel: string;
  isConnected?: boolean;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSelectModel: (model: string) => void;
  onNewChat: () => void;
  onClearChat: () => void;
  onOpenSettings: (tab?: SettingsCategoryTab) => void;
  onSummarize?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = React.memo(({
  conversation,
  selectedModel,
  isConnected = true,
  sidebarOpen,
  onToggleSidebar,
  onSelectModel,
  onNewChat,
  onClearChat,
  onOpenSettings,
  onSummarize,
}) => {
  const { t } = useTranslation();
  return (
    <header className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-black/5 dark:border-white/10 bg-transparent backdrop-blur-xs sticky top-0 z-20 rounded-none transition-colors">
      {/* Left: Mobile Sidebar Toggle / Active title */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800 transition-colors focus:outline-none"
          title={sidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>

        {conversation?.title && conversation.messages.length > 0 && (
          <span className="hidden sm:inline text-xs font-semibold text-gray-600 dark:text-gray-300 max-w-[180px] truncate">
            {conversation.title}
          </span>
        )}
      </div>

      {/* Center: Gemini Model Selector */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
        <ModelSelector
          selectedModel={selectedModel}
          isConnected={isConnected}
          onSelectModel={onSelectModel}
          onOpenSettings={() => onOpenSettings('ai')}
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {conversation && conversation.messages.length > 3 && onSummarize && (
          <button
            onClick={onSummarize}
            className="p-1.5 rounded-lg text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white/60 dark:hover:bg-gray-800 transition-colors"
            title="Summarize conversation context with Gemini"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
          </button>
        )}

        {conversation && conversation.messages.length > 0 && (
          <>
            <button
              onClick={() => exportConversationToMarkdown(conversation)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-800 transition-colors"
              title={t('exportChat')}
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClearChat}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-white/60 dark:hover:bg-gray-800 transition-colors"
              title={t('clearChat')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}

        {/* New Chat Icon Button */}
        <button
          onClick={onNewChat}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-800 transition-colors ml-1"
          title={t('newChat')}
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Settings Button */}
        <button
          onClick={() => onOpenSettings('general')}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-800 transition-colors"
          title={t('settings')}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
});
