import { useState, useEffect } from 'react';
import { Sidebar, type PentesterView } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { DashboardView } from './components/dashboard/DashboardView';
import { PortScannerView } from './components/scanner/PortScannerView';
import { VulnerabilitiesView } from './components/vulnerabilities/VulnerabilitiesView';
import { TargetScopeView } from './components/targets/TargetScopeView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsModal } from './components/settings/SettingsModal';
import type { SettingsCategoryTab } from './components/settings/SettingsSidebarNav';
import { DeleteModal } from './components/DeleteModal';
import { useChat } from './hooks/useChat';
import { storage } from './utils/storage';
import { DEFAULT_SYSTEM_PROMPT } from './utils/prompts';
import { themeService } from './services/themeService';
import type { AppSettings, Conversation } from './types/chat';
import type { ScanSession } from './types/pentester';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());
  const [activeView, setActiveView] = useState<PentesterView>('dashboard');
  const [selectedScanForInspection, setSelectedScanForInspection] = useState<ScanSession | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsCategoryTab>('ai');
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  const [selectedModel, setSelectedModel] = useState<string>(() => settings.selectedModel || 'gemini-2.5-flash');

  // Initialize theme engine
  useEffect(() => {
    themeService.init();
  }, []);

  const openSettings = (tab: SettingsCategoryTab = 'ai') => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Chat state using Google Gemini streaming architecture
  const {
    conversations,
    activeConversation,
    activeId,
    setActiveId,
    isGenerating,
    isWaitingFirstToken,
    searchQuery,
    setSearchQuery,
    sendMessage,
    stopGeneration,
    regenerateLastResponse,
    summarizeCurrentConversation,
    createNewChat,
    renameConversation,
    deleteConversation,
    clearCurrentChat,
    deleteAllConversations,
    updateActiveSystemPrompt,
  } = useChat({
    selectedModel,
    systemPrompt: settings.systemPrompt,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
  });

  // Save settings update and immediately propagate system prompt
  const handleSaveSettings = (newSettings: AppSettings) => {
    const cleanPrompt = newSettings.systemPrompt?.trim()
      ? newSettings.systemPrompt.trim()
      : DEFAULT_SYSTEM_PROMPT;
    const cleanSettings = {
      ...newSettings,
      systemPrompt: cleanPrompt,
    };
    setSettings(cleanSettings);
    if (newSettings.selectedModel) {
      setSelectedModel(newSettings.selectedModel);
    }
    storage.saveSettings(cleanSettings);
    updateActiveSystemPrompt(cleanPrompt);
  };

  // Global keyboard shortcuts (Ctrl+K for new chat, Ctrl+, for settings)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        createNewChat();
        setActiveView('chat');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsDeleteModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNewChat]);

  // Handle Delete Confirmation
  const requestDeleteConversation = (conv: Conversation) => {
    setDeleteTarget(conv);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteConversation = () => {
    if (deleteTarget) {
      deleteConversation(deleteTarget.id);
      setDeleteTarget(null);
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Background Ambient Colored Aura Lights */}
      <div className="bg-ambient-layer">
        <div className="blob-1" />
        <div className="blob-2" />
        <div className="blob-3" />
        <div className="blob-4" />
      </div>

      {/* Main Glass Application Container (Edge-to-Edge Fullscreen) */}
      <div className="relative z-10 glass-shell w-full h-full flex overflow-hidden border-0 rounded-none shadow-none">
        {/* Left Sidebar */}
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          activeView={activeView}
          isOpen={sidebarOpen}
          searchQuery={searchQuery}
          userName={settings.userName}
          onSelectView={(view) => {
            setActiveView(view);
            if (window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }}
          onSelectConversation={(id) => {
            setActiveId(id);
            setActiveView('chat');
            if (window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }}
          onNewChat={() => {
            createNewChat();
            setActiveView('chat');
            if (window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }}
          onRenameConversation={renameConversation}
          onRequestDeleteConversation={requestDeleteConversation}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenSettings={(tab) => openSettings(tab || 'ai')}
          onSearchChange={setSearchQuery}
        />

        {/* Right Main Panel - Active Pentester View */}
        <main className="flex-1 lg:w-[79%] flex flex-col min-w-0 h-full relative">
          {activeView === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setActiveView(tab)}
              onSelectScan={(scan) => {
                setSelectedScanForInspection(scan);
                setActiveView('scanner');
              }}
            />
          )}

          {activeView === 'scanner' && (
            <PortScannerView
              initialScanSession={selectedScanForInspection}
              onNavigateToChatWithContext={(_scanId, prompt) => {
                createNewChat();
                setActiveView('chat');
                if (prompt) {
                  sendMessage(prompt);
                }
              }}
              onNavigateToReports={(_scanId) => {
                setActiveView('reports');
              }}
            />
          )}

          {activeView === 'vulnerabilities' && (
            <VulnerabilitiesView
              onNavigateToChatWithContext={(prompt) => {
                createNewChat();
                setActiveView('chat');
                sendMessage(prompt);
              }}
            />
          )}

          {activeView === 'targets' && (
            <TargetScopeView
              onNavigateToScanner={(_target, _projectId) => {
                setSelectedScanForInspection(null);
                setActiveView('scanner');
              }}
            />
          )}

          {activeView === 'reports' && <ReportsView />}

          {activeView === 'chat' && (
            <ChatWindow
              conversation={activeConversation}
              conversations={conversations}
              selectedModel={selectedModel}
              isConnected={true}
              sidebarOpen={sidebarOpen}
              isGenerating={isGenerating}
              isWaitingFirstToken={isWaitingFirstToken}
              userName={settings.userName}
              autoScroll={settings.autoScroll}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              onSelectModel={(model) => setSelectedModel(model)}
              onNewChat={() => createNewChat()}
              onSendMessage={sendMessage}
              onStopGeneration={stopGeneration}
              onRegenerate={regenerateLastResponse}
              onClearChat={clearCurrentChat}
              onOpenSettings={(tab) => openSettings(tab || 'ai')}
              onSelectConversation={(id) => setActiveId(id)}
              onSummarize={summarizeCurrentConversation}
            />
          )}
        </main>
      </div>

      {/* Upgraded AI Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        conversations={conversations}
        initialTab={settingsTab}
        onSave={handleSaveSettings}
        onClose={() => setIsSettingsOpen(false)}
        onDeleteAllChats={deleteAllConversations}
        onImportConversations={(imported) => {
          storage.saveConversations(imported);
          window.location.reload();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        title="Delete conversation?"
        description={`This will permanently delete "${deleteTarget?.title || 'this assessment session'}". This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDeleteConversation}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
