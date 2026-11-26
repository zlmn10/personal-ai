import React, { useState, useEffect, useRef } from 'react';
import { Database, RefreshCw, HardDrive, Download, Upload, Trash2 } from 'lucide-react';
import type { Conversation } from '../../../types/chat';
import { DBService, type MongoStatus } from '../../../services/db';
import { useTranslation } from '../../../services/i18n';

interface DataStorageSettingsProps {
  conversations: Conversation[];
  onDeleteAllChats: () => void;
  onImportConversations?: (imported: Conversation[]) => void;
}

export const DataStorageSettings: React.FC<DataStorageSettingsProps> = ({
  conversations,
  onDeleteAllChats,
  onImportConversations,
}) => {
  const { t } = useTranslation();
  const [mongoStatus, setMongoStatus] = useState<MongoStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    DBService.checkStatus().then(setMongoStatus).catch(() => null);
  }, []);

  const handleSyncToMongo = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await DBService.bulkSync(conversations);
      if (res.success) {
        setSyncFeedback(`Successfully synced ${res.syncedCount} conversations to MongoDB!`);
        const updated = await DBService.checkStatus();
        setMongoStatus(updated);
      } else {
        setSyncFeedback('Could not sync to MongoDB. Ensure local mongod service is active.');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sync failed';
      setSyncFeedback(`Sync error: ${msg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(conversations, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `personal-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    let md = `# Personal AI Conversations Export\nExported on: ${new Date().toLocaleString()}\n\n---\n\n`;
    for (const c of conversations) {
      md += `## ${c.title}\n*Model: ${c.model} | Created: ${new Date(c.createdAt).toLocaleDateString()}*\n\n`;
      for (const m of c.messages) {
        md += `### ${m.role === 'user' ? 'User' : 'Personal AI'}\n${m.content}\n\n`;
      }
      md += `---\n\n`;
    }
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `personal-ai-chats-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && onImportConversations) {
          onImportConversations(parsed);
          setSyncFeedback(`Successfully imported ${parsed.length} conversations!`);
        } else {
          setSyncFeedback('Invalid backup file format.');
        }
      } catch {
        setSyncFeedback('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* MongoDB Status Card */}
      <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-purple-700 dark:text-purple-400" />
            <h4 className="text-xs font-bold text-purple-950 dark:text-purple-200">
              {t('mongoStatusTitle')}
            </h4>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
              mongoStatus?.isConnected
                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                mongoStatus?.isConnected ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            />
            {mongoStatus?.isConnected ? 'Connected' : 'Offline'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-gray-400 pt-1 border-t border-purple-100/80 dark:border-purple-900/50">
          <div>
            <span className="text-gray-400 block">Host:</span>
            <span className="font-mono text-gray-800 dark:text-gray-200 font-medium">
              {mongoStatus?.host || '127.0.0.1:27017'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block">Database:</span>
            <span className="font-mono text-gray-800 dark:text-gray-200 font-medium">
              {mongoStatus?.name || 'personal_ai'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-gray-700 dark:text-gray-300">
            Database Records:{' '}
            <span className="font-bold text-purple-800 dark:text-purple-300">
              {mongoStatus?.conversationCount ?? 0}
            </span>
          </span>

          <button
            type="button"
            onClick={handleSyncToMongo}
            disabled={isSyncing || !mongoStatus?.isConnected}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{t('syncToMongo')}</span>
          </button>
        </div>

        {syncFeedback && (
          <div className="text-[11px] font-medium text-purple-800 dark:text-purple-300 bg-white/70 dark:bg-gray-800/80 p-2 rounded-lg border border-purple-200 dark:border-purple-800">
            {syncFeedback}
          </div>
        )}
      </div>

      {/* LocalStorage Count */}
      <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between shadow-2xs">
        <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
          LocalStorage Cached Conversations
        </span>
        <span className="font-bold text-purple-600 dark:text-purple-400 text-xs">
          {conversations.length}
        </span>
      </div>

      {/* Backup & Actions */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs space-y-2">
        <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-1">
          <Database className="w-4 h-4 text-purple-600" />
          <span>Backup & Migration</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-between transition-colors shadow-2xs"
          >
            <span>{t('exportJson')}</span>
            <Download className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          </button>

          <button
            type="button"
            onClick={handleExportMarkdown}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-between transition-colors shadow-2xs"
          >
            <span>{t('exportMd')}</span>
            <Download className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          </button>
        </div>

        {/* Hidden File Input for Import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportFile}
          accept=".json"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-between transition-colors shadow-2xs"
        >
          <span>{t('importBackup')}</span>
          <Upload className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
        </button>
      </div>

      {/* Danger Zone: Clear History */}
      <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 shadow-2xs space-y-2">
        <label className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>Danger Zone</span>
        </label>
        <p className="text-[11px] text-rose-700 dark:text-rose-400">
          Permanently erase all chat conversations from MongoDB and local browser storage.
        </p>
        <button
          type="button"
          onClick={() => {
            if (
              confirm(
                'Are you sure you want to permanently delete ALL conversation history? This cannot be undone.'
              )
            ) {
              onDeleteAllChats();
            }
          }}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          {t('clearAllChats')}
        </button>
      </div>
    </div>
  );
};
