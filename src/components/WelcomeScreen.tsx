import React, { useMemo } from 'react';
import {
  BookOpen,
  ShieldAlert,
  Code2,
  Cloud,
  PenLine,
} from 'lucide-react';
import type { Conversation } from '../types/chat';
import { useTranslation } from '../services/i18n';

interface WelcomeScreenProps {
  userName?: string;
  conversations?: Conversation[];
  onSelectPrompt: (prompt: string) => void;
  onSelectConversation?: (id: string) => void;
  composerComponent: React.ReactNode;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = React.memo(({
  userName = 'Salman',
  conversations = [],
  onSelectPrompt,
  onSelectConversation,
  composerComponent,
}) => {
  const { t } = useTranslation();

  // Dynamic greeting based on current local time & localized
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const shortName = userName.replace('Muhammad Salman A.', 'Salman').trim() || 'Salman';
    let timeGreeting = t('goodMorning');
    if (hour >= 12 && hour < 18) {
      timeGreeting = t('goodAfternoon');
    } else if (hour >= 18 || hour < 5) {
      timeGreeting = t('goodEvening');
    }
    return `${timeGreeting}, ${shortName}`;
  }, [userName, t]);

  // Quick Action Pill Buttons matching the reference image
  const quickActions = [
    {
      label: 'Study Cybersecurity',
      icon: BookOpen,
      prompt: 'Provide an in-depth breakdown of OWASP Top 10 vulnerabilities with detection methods and secure code remediation.',
    },
    {
      label: 'Explain Vulnerability',
      icon: ShieldAlert,
      prompt: 'Explain the root cause, exploit mechanism, and mitigation for Active Directory Kerberoasting attacks in lab environments.',
    },
    {
      label: 'Analyze Code',
      icon: Code2,
      prompt: 'Review this code snippet for potential security flaws, injection vectors, and authorization oversights.',
    },
    {
      label: 'Learn AWS Security',
      icon: Cloud,
      prompt: 'What are the top security best practices for auditing AWS IAM policies and enforcing IMDSv2 on EC2 instances?',
    },
    {
      label: 'Help Me Practice',
      icon: PenLine,
      prompt: 'Act as a Senior Penetration Tester interviewer and ask me 3 technical questions about network reconnaissance and web security.',
    },
  ];

  // Default fallback cards if user has no saved conversations yet
  const defaultRecentCards = [
    {
      id: 'recent-1',
      title: 'Professional branding',
      preview: 'Branding is the full identity of a business, not just visuals...',
      date: '16 September',
      prompt: 'Help me draft a professional branding and technical report executive summary for a cybersecurity assessment.',
    },
    {
      id: 'recent-2',
      title: 'Branding guide example',
      preview: 'Creative services don\'t just make things look attractive...',
      date: '15 September',
      prompt: 'Provide a structured methodology guide for conducting vulnerability assessments and pentests.',
    },
    {
      id: 'recent-3',
      title: 'Brand activation ideas',
      preview: 'This blend of strategy and design turns ideas into impact...',
      date: '15 September',
      prompt: 'Suggest practical hands-on CTF lab exercises to master web application security and privilege escalation.',
    },
  ];

  // Populate cards with actual user conversations if available
  const recentCards = useMemo(() => {
    if (conversations.length > 0) {
      return conversations.slice(0, 3).map((conv) => {
        const lastMsg = conv.messages[conv.messages.length - 1];
        const preview = lastMsg?.content ? lastMsg.content.slice(0, 65) + '...' : 'Cybersecurity research session...';
        const dateStr = new Date(conv.updatedAt || conv.createdAt).toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
        });
        return {
          id: conv.id,
          title: conv.title || 'Untitled Chat',
          preview,
          date: dateStr,
          isReal: true,
        };
      });
    }
    return defaultRecentCards.map((c) => ({ ...c, isReal: false }));
  }, [conversations]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-6 w-full max-w-[min(96%,1560px)] mx-auto select-none animate-in fade-in duration-300">
      {/* 1. TOP: The 3D Iridescent Floating Glass Orb */}
      <div className="mb-4 sm:mb-5 flex justify-center">
        <div className="orb-3d" />
      </div>

      {/* 2. GREETING & SUBTITLE */}
      <div className="text-center mb-6 sm:mb-7 space-y-1">
        <h1 className="text-2xl sm:text-[34px] font-bold text-[#1f2430] tracking-tight">
          {greeting}
        </h1>
        <p className="text-sm sm:text-[15px] text-[#636c7e] dark:text-gray-300 font-normal">
          {t('howCanIHelp')}
        </p>
      </div>

      {/* 3. MESSAGE COMPOSER */}
      <div className="w-full mb-4 sm:mb-5">
        {composerComponent}
      </div>

      {/* 4. QUICK ACTION PILL BUTTONS */}
      <div className="w-full flex items-center justify-center gap-2 flex-wrap mb-7 sm:mb-8">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(action.prompt)}
              className="glass-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-[#4b5565] hover:text-[#1e2432] transition-all cursor-pointer active:scale-95"
            >
              <Icon className="w-3.5 h-3.5 text-purple-600 stroke-[2]" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* 5. "YOUR RECENT CHATS" SECTION */}
      <div className="w-full">
        <div className="text-[12px] font-semibold text-[#656e80] mb-3 px-1">
          Your recent chats
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full">
          {recentCards.map((card) => (
            <div
              key={card.id}
              onClick={() => {
                if (card.isReal && onSelectConversation) {
                  onSelectConversation(card.id);
                } else if ('prompt' in card && card.prompt) {
                  onSelectPrompt(card.prompt as string);
                }
              }}
              className="glass-card p-4 rounded-2xl cursor-pointer transition-all hover:-translate-y-0.5 active:scale-[0.99] flex flex-col justify-between min-h-[96px]"
            >
              <div>
                <h4 className="text-[13px] font-bold text-[#1e2430] truncate mb-1">
                  {card.title}
                </h4>
                <p className="text-[11.5px] text-[#697284] line-clamp-2 leading-relaxed">
                  {card.preview}
                </p>
              </div>
              <div className="mt-2.5 text-[10px] text-[#939cae] font-medium">
                {card.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

WelcomeScreen.displayName = 'WelcomeScreen';
