import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Zap,
  ShieldAlert,
  FolderLock,
  Sparkles,
  FileText,
  MessageSquarePlus,
  Search,
  ChevronDown,
  Edit2,
  Trash2,
  Check,
  X,
  ChevronLeft,
  Settings,
  Palette,
  HelpCircle,
} from 'lucide-react';
import type { Conversation } from '../types/chat';
import type { SettingsCategoryTab } from './settings/SettingsSidebarNav';

export type PentesterView =
  | 'dashboard'
  | 'scanner'
  | 'vulnerabilities'
  | 'targets'
  | 'reports'
  | 'chat';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  activeView: PentesterView;
  isOpen: boolean;
  searchQuery: string;
  userName?: string;
  onSelectView: (view: PentesterView) => void;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onRequestDeleteConversation: (conv: Conversation) => void;
  onToggleSidebar: () => void;
  onOpenSettings: (tab?: SettingsCategoryTab) => void;
  onSearchChange: (query: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({
  conversations,
  activeId,
  activeView,
  isOpen,
  searchQuery,
  userName = 'Salman',
  onSelectView,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onRequestDeleteConversation,
  onToggleSidebar,
  onOpenSettings,
  onSearchChange,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const saveEditing = (convId: string, e?: React.FormEvent) => {
    e?.preventDefault();
    if (editingTitle.trim()) {
      onRenameConversation(convId, editingTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const displayName = userName.replace('Muhammad Salman A.', 'Salman').trim();
  const avatarInitial = displayName.charAt(0).toUpperCase() || 'S';

  const navModules: {
    id: PentesterView;
    label: string;
    icon: React.ElementType;
    badge?: string;
    accentColor: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'SOC Dashboard',
      icon: Activity,
      badge: 'LIVE',
      accentColor: 'text-emerald-500',
    },
    {
      id: 'scanner',
      label: 'Port Scanner',
      icon: Zap,
      accentColor: 'text-cyan-500',
    },
    {
      id: 'vulnerabilities',
      label: 'Vulnerabilities',
      icon: ShieldAlert,
      accentColor: 'text-rose-500',
    },
    {
      id: 'targets',
      label: 'Targets & Scope',
      icon: FolderLock,
      accentColor: 'text-blue-500',
    },
    {
      id: 'chat',
      label: 'Pentester AI Agent',
      icon: Sparkles,
      accentColor: 'text-purple-500',
    },
    {
      id: 'reports',
      label: 'Audit Reports',
      icon: FileText,
      accentColor: 'text-indigo-500',
    },
  ];

  const filteredConversations = conversations.filter((c) =>
    searchQuery === ''
      ? true
      : c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onToggleSidebar}
          className="fixed inset-0 bg-black/30 z-30 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col w-[280px] md:w-[240px] lg:w-[21%] md:min-w-[220px] lg:max-w-[340px] h-full p-4 lg:p-5 select-none transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 hidden md:flex'
        }`}
      >
        {/* TOP: Brand Logo and Title */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => onSelectView('dashboard')}
          >
            {/* 3D Glass Iridescent Orb Logo */}
            <div className="orb-3d-mini" title="Pentester AI" />
            <div className="flex flex-col">
              <span className="text-[17px] font-bold text-[#1f2430] dark:text-[#f8fafc] tracking-tight leading-none">
                Pentester AI
              </span>
              <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider mt-0.5">
                ● CYBER AGENT
              </span>
            </div>
          </div>

          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-white/40 transition-colors"
            title="Close sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* PRIMARY SOC OPERATIONS MODULES */}
        <div className="space-y-1 mb-4 text-[13px] font-medium">
          {navModules.map((mod) => {
            const Icon = mod.icon;
            const isSelected = activeView === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => onSelectView(mod.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-left ${
                  isSelected
                    ? 'bg-white/90 dark:bg-slate-800/90 text-gray-900 dark:text-white font-bold shadow-xs border border-white/90 dark:border-slate-700'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 stroke-[2.2] ${
                      isSelected ? mod.accentColor : 'text-gray-500'
                    }`}
                  />
                  <span>{mod.label}</span>
                </div>
                {mod.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {mod.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* NEW PENTEST CHAT BUTTON */}
        <div className="mb-3">
          <button
            onClick={() => {
              onNewChat();
              onSelectView('chat');
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600/90 to-indigo-600/90 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition-all active:scale-[0.99]"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>New AI Consultation</span>
          </button>
        </div>

        {/* SEARCH TRIGGER */}
        <div className="mb-2">
          {isSearchActive ? (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-white/80 dark:border-slate-800 shadow-2xs">
              <Search className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search history..."
                className="w-full bg-transparent text-xs text-gray-900 dark:text-gray-100 focus:outline-none"
              />
              <button
                onClick={() => {
                  setIsSearchActive(false);
                  onSearchChange('');
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchActive(true)}
              className="w-full flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-white/40 dark:hover:bg-slate-800/40 text-[11px] text-gray-500 dark:text-gray-400 transition-colors text-left"
            >
              <Search className="w-3 h-3 stroke-[1.8]" />
              <span>Search Sessions</span>
            </button>
          )}
        </div>

        {/* RECENT PENTEST CONVERSATIONS */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Agent History
          </div>

          {filteredConversations.length === 0 ? (
            <div className="px-2 py-3 text-center text-[11px] text-gray-400">
              No sessions found
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = activeView === 'chat' && conv.id === activeId;
              const isEditing = editingId === conv.id;

              if (isEditing) {
                return (
                  <div
                    key={conv.id}
                    className="flex items-center gap-1 px-2 py-1 bg-white/90 dark:bg-slate-800 rounded-lg border border-purple-300 shadow-2xs"
                  >
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEditing(conv.id, e)}
                      autoFocus
                      className="w-full bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none"
                    />
                    <button
                      onClick={(e) => saveEditing(conv.id, e)}
                      className="text-emerald-600 hover:text-emerald-700"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onSelectView('chat');
                  }}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-purple-500/15 text-purple-900 dark:text-purple-200 font-bold border border-purple-500/30 shadow-2xs'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className="truncate pr-1">{conv.title || 'Untitled Assessment'}</span>
                  <div
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => startEditing(conv, e)}
                      className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onRequestDeleteConversation(conv)}
                      className="p-0.5 text-gray-400 hover:text-rose-600"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* BOTTOM USER PROFILE CARD WITH POPOVER */}
        <div className="pt-3 relative" ref={profileMenuRef}>
          {isProfileMenuOpen && (
            <div className="absolute bottom-16 left-0 right-0 z-50 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-white/95 dark:border-gray-800 shadow-[0_15px_40px_rgba(0,0,0,0.25)] p-2 space-y-0.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onOpenSettings('ai');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>AI Provider Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onOpenSettings('tools');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-500" />
                <span>Scanner Tools Status</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onOpenSettings('general');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <Settings className="w-3.5 h-3.5 text-gray-500" />
                <span>Preferences</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onOpenSettings('personalization');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <Palette className="w-3.5 h-3.5 text-gray-500" />
                <span>Cyber Personas</span>
              </button>

              <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onOpenSettings('about');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
                <span>Architecture & Help</span>
              </button>
            </div>
          )}

          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center justify-between p-2 rounded-2xl bg-white/60 dark:bg-slate-800/60 hover:bg-white/85 dark:hover:bg-slate-800 border border-white/80 dark:border-slate-700 shadow-2xs cursor-pointer transition-all active:scale-[0.99]"
            title="Account Menu"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs flex-shrink-0">
                {avatarInitial}
              </div>
              <div className="min-w-0 leading-tight">
                <span className="text-xs font-semibold text-gray-900 dark:text-white truncate block">
                  {displayName}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate block">
                  Lead Pentester
                </span>
              </div>
            </div>

            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 mr-1 transition-transform duration-200 ${
                isProfileMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';
