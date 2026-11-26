import React, { useState, useRef, useEffect, useMemo, type KeyboardEvent, type ClipboardEvent, type DragEvent } from 'react';
import { ArrowUp, Square, Plus, Mic, MicOff, ChevronDown, X, Image as ImageIcon } from 'lucide-react';
import type { SettingsCategoryTab } from './settings/SettingsSidebarNav';
import { useTranslation } from '../services/i18n';
import { personaService } from '../services/personaService';
import { themeService, isColorDark } from '../services/themeService';

interface MessageInputProps {
  onSendMessage: (message: string, images?: string[]) => void;
  onStopGeneration: () => void;
  isGenerating: boolean;
  disabled?: boolean;
  placeholder?: string;
  onOpenSettings?: (tab?: SettingsCategoryTab) => void;
}

export const MessageInput: React.FC<MessageInputProps> = React.memo(({
  onSendMessage,
  onStopGeneration,
  isGenerating,
  disabled = false,
  placeholder,
  onOpenSettings,
}) => {
  const { t } = useTranslation();
  const effectivePlaceholder = placeholder || t('askAnything');
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activePersona, setActivePersona] = useState(() => personaService.getActivePersona());
  const [themeConfig, setThemeConfig] = useState(() => themeService.getConfig());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const unsubPersona = personaService.subscribe(() => {
      setActivePersona(personaService.getActivePersona());
    });
    const unsubTheme = themeService.subscribe((cfg) => {
      setThemeConfig(cfg);
    });
    return () => {
      unsubPersona();
      unsubTheme();
    };
  }, []);

  // Determine if the composer is on a dark or light glass surface
  const isDarkSurface = useMemo(() => {
    if (themeConfig.customColors?.composer) {
      return isColorDark(themeConfig.customColors.composer);
    }
    const preset = themeConfig.activePreset;
    if (preset === 'midnight' || preset === 'ocean') return true;
    if (preset === 'aurora' || preset === 'ivory' || preset === 'mint') return false;
    return themeConfig.mode === 'dark';
  }, [themeConfig]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 160;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!isGenerating && (trimmed || images.length > 0) && !disabled) {
      onSendMessage(trimmed, images.length > 0 ? images : undefined);
      setInput('');
      setImages([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Process image files and convert to base64 data URLs
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result as string;
      if (result) {
        setImages((prev) => [...prev, result]);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Clipboard Paste (Ctrl+V) for images
  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    let hasImage = false;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          hasImage = true;
          processImageFile(file);
        }
      }
    }

    if (hasImage) {
      e.preventDefault();
    }
  };

  // Handle Drag & Drop of image files onto the composer
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        processImageFile(file);
      } else {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const res = loadEvent.target?.result as string;
          if (res) {
            setInput((prev) => (prev ? `${prev}\n\n[File: ${file.name}]\n${res}` : `[File: ${file.name}]\n${res}`));
          }
        };
        reader.readAsText(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Web Speech API Voice Input
  const toggleListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as unknown as Record<string, any>;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRecognition as any)();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const isSendDisabled = disabled || (!input.trim() && images.length === 0) || isGenerating;

  return (
    <div
      className="w-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Glass Composer Card matching reference */}
      <div
        data-dark={isDarkSurface ? 'true' : 'false'}
        className={`glass-composer relative flex flex-col rounded-[22px] transition-all ${
          isDragging
            ? 'border-purple-500 shadow-[0_10px_35px_rgba(168,85,247,0.25)] ring-2 ring-purple-400/40'
            : ''
        }`}
        style={{
          background: isDarkSurface
            ? 'var(--glass-composer-bg, rgba(22, 30, 49, 0.88))'
            : 'var(--glass-composer-bg, rgba(255, 255, 255, 0.92))',
          borderColor: isDarkSurface
            ? 'var(--glass-composer-border, rgba(255, 255, 255, 0.18))'
            : 'var(--glass-composer-border, rgba(255, 255, 255, 0.95))',
          boxShadow: 'var(--glass-composer-shadow, 0 10px 30px rgba(90,100,150,0.07))',
        }}
      >
        {/* Attached Images Preview Row (matches reference image media_1793898681824_ea6c3c7b.jpg) */}
        {images.length > 0 && (
          <div className="flex items-center gap-2.5 px-4 pt-3 pb-1 overflow-x-auto no-scrollbar">
            {images.map((imgSrc, idx) => (
              <div
                key={idx}
                className="relative group rounded-xl overflow-hidden border border-white/90 bg-white/60 shadow-xs flex-shrink-0 animate-in zoom-in-95 duration-150"
              >
                <img
                  src={imgSrc}
                  alt={`Attachment ${idx + 1}`}
                  className="h-16 w-auto max-w-[130px] object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors shadow-xs"
                  title="Remove image"
                >
                  <X className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>
            ))}
            <div className="text-[11px] text-purple-600 font-medium pl-1 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>{images.length} {images.length === 1 ? 'image' : 'images'} attached</span>
            </div>
          </div>
        )}

        {/* Drag over overlay indicator */}
        {isDragging && (
          <div className="absolute inset-0 bg-purple-50/80 backdrop-blur-xs rounded-[22px] z-20 flex items-center justify-center border-2 border-dashed border-purple-400 pointer-events-none">
            <div className="flex items-center gap-2 text-purple-700 font-semibold text-sm">
              <ImageIcon className="w-5 h-5 animate-bounce" />
              <span>Drop image here to attach to chat</span>
            </div>
          </div>
        )}

        {/* Textarea with Clipboard Paste support - 100% Guaranteed High Contrast */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={images.length > 0 ? 'Add a message or press send...' : effectivePlaceholder}
          rows={1}
          disabled={disabled}
          className={`w-full resize-none bg-transparent px-5 pt-4 pb-2 text-[14px] font-medium focus:outline-none max-h-36 overflow-y-auto leading-relaxed ${
            isDarkSurface
              ? 'text-[#f8fafc] placeholder:text-[#94a3b8]'
              : 'text-[#0f172a] placeholder:text-[#64748b]'
          }`}
          style={{
            minHeight: '44px',
            color: isDarkSurface ? '#f8fafc' : '#0f172a',
            caretColor: isDarkSurface ? '#818cf8' : '#6366f1',
          }}
        />

        {/* Bottom Toolbar Row */}
        <div className="flex items-center justify-between px-3.5 pb-3 pt-1">
          {/* Left action tools: +, Mic, System Persona */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.multiple = true;
                fileInput.accept = 'image/*,.txt,.md,.py,.js,.json,.log,.csv';
                fileInput.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (!files) return;
                  Array.from(files).forEach((file) => {
                    if (file.type.startsWith('image/')) {
                      processImageFile(file);
                    } else {
                      const reader = new FileReader();
                      reader.onload = (re) => {
                        const content = re.target?.result as string;
                        if (content) {
                          setInput((prev) => (prev ? `${prev}\n\n[File: ${file.name}]\n${content}` : `[File: ${file.name}]\n${content}`));
                        }
                      };
                      reader.readAsText(file);
                    }
                  });
                };
                fileInput.click();
              }}
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-white/10 transition-colors"
              title="Add image or document attachment"
            >
              <Plus className="w-4 h-4 stroke-[2]" />
            </button>

            <button
              type="button"
              onClick={toggleListening}
              className={`p-1.5 rounded-lg transition-colors ${
                isListening
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 animate-pulse'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-white/10'
              }`}
              title={isListening ? 'Listening...' : 'Voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4 stroke-[2]" /> : <Mic className="w-4 h-4 stroke-[2]" />}
            </button>

            {/* Persona / System Identity pill button matching reference */}
            <button
              type="button"
              onClick={onOpenSettings ? () => onOpenSettings('personalization') : undefined}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50/80 dark:bg-sky-950/60 hover:bg-sky-100/90 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800 text-[11px] font-semibold transition-all shadow-2xs"
              title="Click to customize AI Persona & System Prompt"
            >
              <span className="text-xs">{activePersona.icon}</span>
              <span className="max-w-[120px] truncate">{activePersona.name}</span>
              <ChevronDown className="w-3 h-3 text-sky-500" />
            </button>
          </div>

          {/* Right Action Button (Blue-to-Purple Gradient Send Circle) */}
          <div>
            {isGenerating ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="w-9 h-9 rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow-md transition-all flex items-center justify-center active:scale-95"
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={isSendDisabled}
                className={`w-9 h-9 rounded-full transition-all flex items-center justify-center ${
                  isSendDisabled
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-tr from-[#4f86f7] to-[#765cf6] text-white shadow-[0_4px_12px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_16px_rgba(99,102,241,0.45)] hover:scale-105 active:scale-95'
                }`}
                title="Send message (Enter)"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MessageInput.displayName = 'MessageInput';
