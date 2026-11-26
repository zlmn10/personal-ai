import React, { useRef, useEffect, useState, type UIEvent } from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';
import type { Conversation } from '../types/chat';
import type { SettingsCategoryTab } from './settings/SettingsSidebarNav';
import { ChatHeader } from './ChatHeader';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { MessageInput } from './MessageInput';
import { WelcomeScreen } from './WelcomeScreen';
import { SystemTaskbar } from './SystemTaskbar';

interface ChatWindowProps {
  conversation?: Conversation;
  conversations?: Conversation[];
  selectedModel: string;
  isConnected?: boolean;
  sidebarOpen: boolean;
  isGenerating: boolean;
  isWaitingFirstToken: boolean;
  userName?: string;
  autoScroll?: boolean;
  onToggleSidebar: () => void;
  onSelectModel: (model: string) => void;
  onNewChat: () => void;
  onSendMessage: (content: string, images?: string[]) => void;
  onStopGeneration: () => void;
  onRegenerate: () => void;
  onClearChat: () => void;
  onOpenSettings: (tab?: SettingsCategoryTab) => void;
  onSelectConversation?: (id: string) => void;
  onSummarize?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  conversations = [],
  selectedModel,
  isConnected = true,
  sidebarOpen,
  isGenerating,
  isWaitingFirstToken,
  userName = 'Salman',
  autoScroll = true,
  onToggleSidebar,
  onSelectModel,
  onNewChat,
  onSendMessage,
  onStopGeneration,
  onRegenerate,
  onClearChat,
  onOpenSettings,
  onSelectConversation,
  onSummarize,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const userScrolledUpRef = useRef<boolean>(false);

  const messages = conversation?.messages || [];
  const hasMessages = messages.length > 0;

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    userScrolledUpRef.current = false;
    setShowScrollBottom(false);
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [conversation?.id]);

  useEffect(() => {
    if (!autoScroll) return;
    if (!userScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: isGenerating ? 'auto' : 'smooth' });
    }
  }, [messages, isGenerating, isWaitingFirstToken, autoScroll]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    const isScrolledUp = distanceToBottom > 60;
    userScrolledUpRef.current = isScrolledUp;
    setShowScrollBottom(distanceToBottom > 90);
  };

  const handleScrollToBottom = () => {
    userScrolledUpRef.current = false;
    setShowScrollBottom(false);
    scrollToBottom('smooth');
  };

  const handleSendPrompt = (content: string, images?: string[]) => {
    userScrolledUpRef.current = false;
    setShowScrollBottom(false);
    onSendMessage(content, images);
    setTimeout(() => {
      scrollToBottom('smooth');
    }, 40);
  };

  const composer = (
    <MessageInput
      onSendMessage={handleSendPrompt}
      onStopGeneration={onStopGeneration}
      isGenerating={isGenerating}
      disabled={false}
      placeholder={
        !selectedModel
          ? 'Select a Gemini model above to begin chatting...'
          : 'Ask Pentester AI anything... (CVEs, scan analysis, exploit logic, remediation)'
      }
      onOpenSettings={() => onOpenSettings('personalization')}
    />
  );

  return (
    <div className="glass-panel flex-1 flex flex-col h-full relative overflow-hidden rounded-none border-y-0 border-r-0 border-l border-white/60 dark:border-white/10">
      {/* Top Header */}
      <ChatHeader
        conversation={conversation}
        selectedModel={selectedModel}
        isConnected={isConnected}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={onToggleSidebar}
        onSelectModel={onSelectModel}
        onNewChat={onNewChat}
        onClearChat={onClearChat}
        onOpenSettings={onOpenSettings}
        onSummarize={onSummarize}
      />

      {/* Main Content Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col select-text"
      >
        {!hasMessages ? (
          <WelcomeScreen
            userName={userName}
            conversations={conversations}
            onSelectPrompt={handleSendPrompt}
            onSelectConversation={onSelectConversation}
            composerComponent={composer}
          />
        ) : (
          <div className="flex-1 py-4 flex flex-col select-text">
            {messages.map((msg, index) => {
              const isLastAssistant =
                msg.role === 'assistant' && index === messages.length - 1;

              if (msg.role === 'assistant' && !msg.content && isWaitingFirstToken) {
                return null;
              }

              return (
                <ChatMessage
                  key={msg.id || index}
                  message={msg}
                  isLastAssistant={isLastAssistant}
                  isGenerating={isGenerating}
                  userName={userName}
                  onRegenerate={onRegenerate}
                />
              );
            })}

            {/* Typing Indicator while waiting for first token */}
            {isWaitingFirstToken && <TypingIndicator />}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Floating Scroll To Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={handleScrollToBottom}
          className="absolute right-6 bottom-20 px-3.5 py-2 rounded-full bg-white/95 hover:bg-white dark:bg-slate-800/95 dark:hover:bg-slate-800 border border-white/90 dark:border-slate-700 text-purple-700 dark:text-purple-400 shadow-[0_8px_25px_rgba(0,0,0,0.2)] transition-all z-20 active:scale-95 flex items-center gap-1.5 font-medium text-xs cursor-pointer group"
          title="Scroll to bottom"
        >
          <ArrowDown className={`w-4 h-4 ${isGenerating ? 'animate-bounce text-purple-600' : ''}`} />
          {isGenerating && (
            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 animate-pulse">
              Generating...
            </span>
          )}
        </button>
      )}

      {/* Bottom Composer and Contextual Suggestions */}
      {hasMessages && (
        <div className="w-full max-w-[min(96%,1560px)] mx-auto px-3 sm:px-4 md:px-6 pb-4 pt-1 space-y-2">
          {/* Suggestion pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0 pl-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>Prompt Starters</span>
            </div>
            {[
              'Explain step-by-step exploit chain',
              'Provide tactical Kali Linux commands',
              'Draft remediation & patch playbook',
              'Correlate findings against MITRE ATT&CK',
            ].map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleSendPrompt(sug)}
                disabled={isGenerating}
                className="px-3.5 py-1 rounded-full bg-white/70 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-xs border border-white/90 dark:border-slate-700 shadow-2xs transition-all whitespace-nowrap active:scale-95 disabled:opacity-50"
              >
                {sug}
              </button>
            ))}
          </div>

          {composer}
        </div>
      )}

      {/* Real-time Hardware Resource Monitoring Taskbar */}
      <SystemTaskbar isGenerating={isGenerating} />
    </div>
  );
};
