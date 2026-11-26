import { useState, useEffect, useRef, useCallback } from 'react';
import type { Conversation, Message, MessagePerformance } from '../types/chat';
import { storage } from '../utils/storage';
import { aiService } from '../services/aiService';
import { DBService } from '../services/db';
import { DEFAULT_SYSTEM_PROMPT } from '../utils/prompts';
import { personaService } from '../services/personaService';

interface UseChatProps {
  selectedModel: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export function useChat({
  selectedModel = 'gemini-2.5-flash',
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
  temperature = 0.7,
  maxTokens = 4096,
}: UseChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>(() => storage.getConversations());
  const [activeId, setActiveId] = useState<string | null>(() => storage.getCurrentConversationId());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isWaitingFirstToken, setIsWaitingFirstToken] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const streamAccumulatorRef = useRef<string>('');
  const rafIdRef = useRef<number | null>(null);
  const tokenCountRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const firstTokenTimeRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Load from MongoDB on initial mount
  useEffect(() => {
    let isMounted = true;
    DBService.getConversations().then((mongoConvs) => {
      if (!isMounted) return;
      if (mongoConvs && mongoConvs.length > 0) {
        setConversations(mongoConvs);
        storage.saveConversations(mongoConvs);
      } else {
        const local = storage.getConversations();
        if (local.length > 0) {
          DBService.bulkSync(local).catch((e) => console.warn('Auto-sync to MongoDB:', e));
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-select latest conversation or create new
  useEffect(() => {
    if (conversations.length > 0) {
      if (!activeId || !conversations.some((c) => c.id === activeId)) {
        const nextId = conversations[0].id;
        setActiveId(nextId);
        storage.saveCurrentConversationId(nextId);
      }
    } else {
      setActiveId(null);
      storage.saveCurrentConversationId(null);
    }
  }, [conversations, activeId]);

  const activeConversation = conversations.find((c) => c.id === activeId);

  const createNewChat = useCallback(() => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      setIsWaitingFirstToken(false);
    }

    const activePersona = personaService.getActivePersona();
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      title: 'New Pentest Assessment',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: selectedModel || 'gemini-2.5-flash',
      messages: [],
      systemPrompt: activePersona?.prompt || systemPrompt || DEFAULT_SYSTEM_PROMPT,
      personaId: activePersona?.id,
    };

    setConversations((prev) => {
      const updated = [newConv, ...prev];
      storage.saveConversations(updated);
      return updated;
    });

    setActiveId(newConv.id);
    storage.saveCurrentConversationId(newConv.id);
    DBService.saveConversation(newConv).catch((e) => console.warn('Failed to save to MongoDB:', e));

    return newConv.id;
  }, [isGenerating, selectedModel, systemPrompt]);

  const renameConversation = useCallback((id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id === id) {
          const mod = { ...c, title: trimmed, updatedAt: Date.now() };
          DBService.saveConversation(mod).catch((e) => console.warn('Failed to rename in MongoDB:', e));
          return mod;
        }
        return c;
      });
      storage.saveConversations(updated);
      return updated;
    });
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      storage.saveConversations(updated);
      return updated;
    });
    DBService.deleteConversation(id).catch((e) => console.warn('Failed to delete in MongoDB:', e));
  }, []);

  const clearCurrentChat = useCallback(() => {
    if (!activeId) return;
    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id === activeId) {
          const mod = { ...c, messages: [], updatedAt: Date.now() };
          DBService.saveConversation(mod).catch((e) => console.warn('Failed to clear in MongoDB:', e));
          return mod;
        }
        return c;
      });
      storage.saveConversations(updated);
      return updated;
    });
  }, [activeId]);

  const deleteAllConversations = useCallback(() => {
    setConversations([]);
    setActiveId(null);
    storage.saveConversations([]);
    storage.saveCurrentConversationId(null);
    DBService.clearAll().catch((e: unknown) => console.warn('Failed to delete all in MongoDB:', e));
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setIsWaitingFirstToken(false);
  }, []);

  const sendMessage = useCallback(
    async (content: string, attachedImages?: string[], scanContextId?: string) => {
      const trimmed = content.trim();
      const hasImages = Array.isArray(attachedImages) && attachedImages.length > 0;
      if (!trimmed && !hasImages) return;

      let currentConvId = activeId;
      let targetConv = conversations.find((c) => c.id === currentConvId);

      if (!currentConvId || !targetConv) {
        currentConvId = createNewChat();
        targetConv = {
          id: currentConvId,
          title: 'New Pentest Assessment',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          model: selectedModel,
          messages: [],
          systemPrompt,
        };
      }

      const titlePrompt = trimmed || (hasImages ? 'Image Analysis' : 'Security Query');

      const userMessage: Message = {
        id: `msg_user_${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
        images: hasImages ? attachedImages : undefined,
        scanContextId,
      };

      const assistantMessageId = `msg_ast_${Date.now() + 1}`;
      const assistantPlaceholder: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now() + 1,
        model: selectedModel,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== currentConvId) return c;
          return {
            ...c,
            title: c.messages.length === 0 ? (titlePrompt.length > 40 ? `${titlePrompt.substring(0, 37)}...` : titlePrompt) : c.title,
            updatedAt: Date.now(),
            messages: [...c.messages, userMessage, assistantPlaceholder],
          };
        })
      );

      setIsGenerating(true);
      setIsWaitingFirstToken(true);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const validHistory = targetConv.messages
        .filter((m) => m.content?.trim() && !m.isError)
        .map((m) => ({
          role: m.role,
          content: m.content.trim(),
        }));

      const activeSystemPrompt = targetConv.systemPrompt?.trim() || systemPrompt?.trim() || DEFAULT_SYSTEM_PROMPT;

      const apiMessages = [
        ...validHistory,
        {
          role: 'user' as const,
          content: trimmed,
        },
      ];

      streamAccumulatorRef.current = '';
      tokenCountRef.current = 0;
      startTimeRef.current = performance.now();
      firstTokenTimeRef.current = null;

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      const scheduleBatchUpdate = (isFinal = false, finalPerformance?: MessagePerformance) => {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }

        const updateFn = () => {
          const snapshotText = streamAccumulatorRef.current;
          setConversations((prev) => {
            const updated = prev.map((c) => {
              if (c.id !== currentConvId) return c;
              const msgs = c.messages.map((m) => {
                if (m.id === assistantMessageId) {
                  return {
                    ...m,
                    content: snapshotText,
                    performance: finalPerformance || m.performance,
                  };
                }
                return m;
              });
              const modifiedConv = { ...c, updatedAt: Date.now(), messages: msgs };
              if (isFinal) {
                DBService.saveConversation(modifiedConv).catch((e) => console.warn('Failed to save to MongoDB:', e));
              }
              return modifiedConv;
            });
            storage.saveConversations(updated);
            return updated;
          });
          rafIdRef.current = null;
        };

        if (isFinal) {
          updateFn();
        } else {
          rafIdRef.current = requestAnimationFrame(updateFn);
        }
      };

      await aiService.streamChat(
        apiMessages,
        {
          model: selectedModel || 'gemini-2.5-flash',
          temperature,
          maxTokens,
          systemPrompt: activeSystemPrompt,
          scanContextId,
          signal: abortController.signal,
        },
        (chunk: string) => {
          if (firstTokenTimeRef.current === null) {
            firstTokenTimeRef.current = performance.now();
            setIsWaitingFirstToken(false);
          }
          streamAccumulatorRef.current += chunk;
          tokenCountRef.current += Math.max(1, Math.round(chunk.length / 4));
          scheduleBatchUpdate(false);
        },
        (errorMessage: string) => {
          setIsGenerating(false);
          setIsWaitingFirstToken(false);
          setConversations((prev) => {
            const updated = prev.map((c) => {
              if (c.id !== currentConvId) return c;
              return {
                ...c,
                messages: c.messages.map((m) => {
                  if (m.id === assistantMessageId) {
                    return {
                      ...m,
                      content: `⚠️ **Pentester AI Error**: ${errorMessage}`,
                      isError: true,
                    };
                  }
                  return m;
                }),
              };
            });
            storage.saveConversations(updated);
            return updated;
          });
        },
        () => {
          setIsGenerating(false);
          setIsWaitingFirstToken(false);

          const endTime = performance.now();
          const totalMs = Math.round(endTime - startTimeRef.current);
          const ttftMs = firstTokenTimeRef.current ? Math.round(firstTokenTimeRef.current - startTimeRef.current) : totalMs;
          const tokens = tokenCountRef.current || Math.max(1, Math.round(streamAccumulatorRef.current.length / 4));
          const genDurationSec = Math.max(0.001, (totalMs - ttftMs) / 1000);
          const tokPerSec = parseFloat((tokens / genDurationSec).toFixed(1));

          const perfMetrics: MessagePerformance = {
            ttftMs,
            totalDurationMs: totalMs,
            tokensPerSecond: tokPerSec,
            tokenCount: tokens,
          };

          scheduleBatchUpdate(true, perfMetrics);
        }
      );
    },
    [activeId, conversations, createNewChat, selectedModel, systemPrompt, temperature, maxTokens]
  );

  const regenerateLastResponse = useCallback(() => {
    if (!activeConversation || activeConversation.messages.length < 2 || isGenerating) return;
    const msgs = activeConversation.messages;
    const lastUserIdx = msgs.findLastIndex((m) => m.role === 'user');
    if (lastUserIdx === -1) return;

    const lastUserMsg = msgs[lastUserIdx];
    // Remove trailing messages
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversation.id) return c;
        return {
          ...c,
          messages: c.messages.slice(0, lastUserIdx),
        };
      })
    );

    sendMessage(lastUserMsg.content, lastUserMsg.images, lastUserMsg.scanContextId);
  }, [activeConversation, isGenerating, sendMessage]);

  const summarizeCurrentConversation = useCallback(async () => {
    if (!activeConversation || activeConversation.messages.length < 2) return;
    const prompt = 'Please summarize our security analysis, key findings, and recommended action items so far.';
    sendMessage(prompt);
  }, [activeConversation, sendMessage]);

  const updateActiveSystemPrompt = useCallback((prompt: string) => {
    if (!activeId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, systemPrompt: prompt } : c))
    );
  }, [activeId]);

  return {
    conversations,
    activeConversation,
    activeId,
    setActiveId: (id: string | null) => {
      setActiveId(id);
      storage.saveCurrentConversationId(id);
    },
    isGenerating,
    isWaitingFirstToken,
    searchQuery,
    setSearchQuery,
    sendMessage,
    stopGeneration,
    regenerateLastResponse,
    summarizeCurrentConversation,
    updateActiveSystemPrompt,
    createNewChat,
    renameConversation,
    deleteConversation,
    clearCurrentChat,
    deleteAllConversations,
  };
}
