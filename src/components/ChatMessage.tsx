import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, RotateCcw, ThumbsUp, ThumbsDown, AlertTriangle, X } from 'lucide-react';
import type { Message } from '../types/chat';
import { CodeBlock } from './CodeBlock';
import { copyToClipboard } from '../utils/clipboard';

interface ChatMessageProps {
  message: Message;
  isLastAssistant: boolean;
  isGenerating: boolean;
  userName?: string;
  onRegenerate?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = React.memo(({
  message,
  isLastAssistant,
  isGenerating,
  onRegenerate,
}) => {
  const [copied, setCopied] = useState(false);
  const [userPromptCopied, setUserPromptCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUserPromptCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setUserPromptCopied(true);
      setTimeout(() => setUserPromptCopied(false), 2000);
    }
  };

  // USER MESSAGE: Sleek right-aligned purple-to-blue gradient pill with attached images (matches reference images)
  if (isUser) {
    return (
      <>
        <div className="w-full py-2.5 px-3 sm:px-4 md:px-6">
          <div className="w-full max-w-[min(96%,1560px)] mx-auto flex flex-col items-end gap-2 group animate-in fade-in duration-150">
            {/* Attached Images above user bubble (matches reference image media_1793898646593_6e55ade3.jpg) */}
            {message.images && message.images.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap justify-end max-w-[85%] sm:max-w-[76%] md:max-w-[68%]">
                {message.images.map((imgSrc, idx) => (
                  <div
                    key={idx}
                    onClick={() => setPreviewImage(imgSrc)}
                    className="rounded-2xl overflow-hidden border border-white/80 shadow-[0_4px_16px_rgba(70,80,140,0.12)] bg-white/40 backdrop-blur-md transition-all hover:scale-[1.02] cursor-pointer"
                    title="Click to view full image"
                  >
                    <img
                      src={imgSrc}
                      alt={`Attachment ${idx + 1}`}
                      className="max-h-36 sm:max-h-44 max-w-[240px] sm:max-w-[280px] object-cover rounded-2xl"
                    />
                  </div>
                ))}
              </div>
            )}

            {message.content && (
              <div className="flex items-center gap-1.5 max-w-[88%] sm:max-w-[80%] md:max-w-[72%] justify-end">
                <button
                  type="button"
                  onClick={handleUserPromptCopy}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/60 transition-all flex-shrink-0 cursor-pointer"
                  title="Copy prompt"
                >
                  {userPromptCopied ? <Check className="w-3.5 h-3.5 text-purple-600 stroke-[2]" /> : <Copy className="w-3.5 h-3.5 stroke-[1.8]" />}
                </button>
                <div className="rounded-[22px] rounded-br-[6px] px-5 py-3 bg-gradient-to-r from-[#6355d8] via-[#5b64e5] to-[#4378ff] text-white shadow-[0_4px_16px_rgba(79,117,247,0.25)] text-[14px] leading-relaxed break-words font-normal select-text">
                  <p className="whitespace-pre-wrap select-text">{message.content}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full Image Preview Lightbox */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={previewImage} alt="Full preview" className="w-full h-full object-contain rounded-2xl" />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // ASSISTANT MESSAGE: Open, fluid wide canvas layout with mini iridescent orb and action row (no box)
  return (
    <div className="w-full py-3.5 px-3 sm:px-4 md:px-6 group animate-in fade-in duration-150">
      <div className="w-full max-w-[min(96%,1560px)] mx-auto flex items-start gap-3.5 sm:gap-4">
        {/* Iridescent Mini 3D Glass Orb */}
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-tr from-[#ff6b9d] via-[#a855f7] to-[#38bdf8] p-0.5 shadow-xs flex items-center justify-center mt-1">
          <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
          </div>
        </div>

        {/* Content Body directly on canvas (NO BOX) */}
        <div className="flex-1 min-w-0">
          {/* Error Banner */}
          {message.isError && (
            <div className="flex items-center gap-2 text-rose-600 text-xs py-1.5 px-3 rounded-xl bg-rose-50 border border-rose-200 mb-2 w-fit">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Response generation encountered an issue</span>
            </div>
          )}

          {/* Markdown Content - Guaranteed High-Contrast Across All Themes */}
          <div
            className="text-[14px] leading-relaxed break-words select-text font-normal"
            style={{ color: 'var(--ai-bubble-text, var(--text-primary, #1e2432))' }}
          >
            <div className="markdown-content select-text">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');

                    if (match) {
                      return (
                        <CodeBlock
                          language={match[1]}
                          value={codeString}
                          isStreaming={isGenerating && isLastAssistant}
                        />
                      );
                    }

                    if (codeString.includes('\n')) {
                      return (
                        <CodeBlock
                          language="text"
                          value={codeString}
                          isStreaming={isGenerating && isLastAssistant}
                        />
                      );
                    }

                    return (
                      <code
                        className="px-1.5 py-0.5 rounded-md bg-purple-500/10 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-mono text-[0.875em] border border-purple-200/60 dark:border-purple-700/40 shadow-2xs"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  p({ children }) {
                    return (
                      <p
                        className="mb-3 leading-relaxed last:mb-0"
                        style={{ color: 'var(--ai-bubble-text, var(--text-primary, #1e2432))' }}
                      >
                        {children}
                      </p>
                    );
                  },
                  h1({ children }) {
                    return (
                      <h1
                        className="text-lg md:text-xl font-bold mt-4 mb-2 pb-1 border-b border-gray-200/60 dark:border-slate-800"
                        style={{ color: 'var(--text-primary, #1e2432)' }}
                      >
                        {children}
                      </h1>
                    );
                  },
                  h2({ children }) {
                    return (
                      <h2
                        className="text-base md:text-lg font-bold mt-3 mb-2"
                        style={{ color: 'var(--text-primary, #1e2432)' }}
                      >
                        {children}
                      </h2>
                    );
                  },
                  h3({ children }) {
                    return (
                      <h3
                        className="text-sm md:text-base font-semibold mt-3 mb-1"
                        style={{ color: 'var(--text-primary, #1e2432)' }}
                      >
                        {children}
                      </h3>
                    );
                  },
                  ul({ children }) {
                    return (
                      <ul
                        className="list-disc list-outside pl-5 mb-3 space-y-1"
                        style={{ color: 'var(--text-primary, #2d3748)' }}
                      >
                        {children}
                      </ul>
                    );
                  },
                  ol({ children }) {
                    return (
                      <ol
                        className="list-decimal list-outside pl-5 mb-3 space-y-1"
                        style={{ color: 'var(--text-primary, #2d3748)' }}
                      >
                        {children}
                      </ol>
                    );
                  },
                  li({ children }) {
                    return <li className="leading-relaxed">{children}</li>;
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-3 border-purple-500 pl-3.5 py-1.5 my-3 bg-purple-500/10 rounded-r-xl italic text-[var(--text-secondary,#4a5568)]">
                        {children}
                      </blockquote>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-3 rounded-2xl border border-white/80 bg-white/70 backdrop-blur-md shadow-2xs">
                        <table className="w-full text-left text-xs border-collapse">{children}</table>
                      </div>
                    );
                  },
                  thead({ children }) {
                    return <thead className="bg-white/90 text-purple-950 border-b border-gray-200/70 font-semibold">{children}</thead>;
                  },
                  th({ children }) {
                    return <th className="px-3.5 py-2.5 font-bold">{children}</th>;
                  },
                  td({ children }) {
                    return <td className="px-3.5 py-2.5 border-t border-gray-100/70 text-[#2d3748]">{children}</td>;
                  },
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 underline font-medium hover:text-purple-800 transition-colors"
                      >
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Action Row Under Response matching reference (🔄 📋 👍 👎) */}
          {Boolean(message.content) && (
            <div className="flex items-center gap-1.5 mt-2.5 text-gray-500 dark:text-gray-400 select-none">
              {onRegenerate && isLastAssistant && !isGenerating && (
                <button
                  onClick={onRegenerate}
                  className="p-1 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title="Regenerate"
                >
                  <RotateCcw className="w-3.5 h-3.5 stroke-[1.8]" />
                </button>
              )}
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Copy message"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-purple-600 stroke-[2]" /> : <Copy className="w-3.5 h-3.5 stroke-[1.8]" />}
              </button>
              <button
                onClick={() => setLiked(liked === true ? null : true)}
                className={`p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
                  liked === true ? 'text-purple-600' : 'hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                title="Helpful"
              >
                <ThumbsUp className="w-3.5 h-3.5 stroke-[1.8]" />
              </button>
              <button
                onClick={() => setLiked(liked === false ? null : false)}
                className={`p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
                  liked === false ? 'text-rose-600' : 'hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                title="Not helpful"
              >
                <ThumbsDown className="w-3.5 h-3.5 stroke-[1.8]" />
              </button>

              {/* Real-time Hardware-Verified Performance Metrics Badge */}
              {message.performance && (
                <div
                  className="flex items-center gap-1.5 text-[10.5px] text-gray-500 dark:text-gray-400 font-mono ml-2 pl-2 border-l border-gray-300 dark:border-gray-700 select-none flex-wrap"
                  title={`Full Inference Performance:\n• First Token Latency (TTFT): ${message.performance.ttftMs}ms\n• Generation Speed: ${message.performance.tokensPerSecond} tokens/s\n• Generated Tokens: ${message.performance.tokenCount}\n• Prompt Tokens: ${message.performance.promptTokens || 'N/A'}${message.performance.promptEvalSpeed ? ` (${message.performance.promptEvalSpeed} tok/s eval)` : ''}\n• Total Time: ${(message.performance.totalDurationMs / 1000).toFixed(2)}s${message.performance.loadDurationMs ? `\n• Model Load Time: ${(message.performance.loadDurationMs / 1000).toFixed(2)}s` : ''}`}
                >
                  <span className="text-purple-600 dark:text-purple-400 font-bold">
                    ⚡ {message.performance.tokensPerSecond} tok/s
                  </span>
                  <span>·</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {(message.performance.ttftMs / 1000).toFixed(2)}s TTFT
                  </span>
                  <span>·</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {message.performance.tokenCount} tokens
                  </span>
                  {Boolean(message.performance.promptTokens) && (
                    <>
                      <span>·</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        P: {message.performance.promptTokens} tok
                        {message.performance.promptEvalSpeed ? ` (${message.performance.promptEvalSpeed} t/s)` : ''}
                      </span>
                    </>
                  )}
                  <span>·</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {(message.performance.totalDurationMs / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
