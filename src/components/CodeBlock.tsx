import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

interface CodeBlockProps {
  language?: string;
  value: string;
  isStreaming?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = React.memo(({ language, value, isStreaming = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const cleanLang = (language || 'text').toLowerCase();

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-slate-800/80 bg-[#16181f] font-mono text-xs shadow-lg select-text">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#101217] border-b border-slate-800 text-slate-400 select-none">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-purple-400">
          {cleanLang}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white rounded-lg bg-slate-800/90 hover:bg-slate-700 transition-colors focus:outline-none cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Syntax Highlighted Body (Fast plain text during streaming to prevent Prism lag) */}
      <div className="p-3.5 overflow-x-auto text-[13px] leading-relaxed select-text">
        {isStreaming ? (
          <pre className="m-0 p-0 font-mono text-[0.85rem] leading-[1.6] text-slate-200 whitespace-pre-wrap break-all select-text">
            <code className="select-text">{value.trimEnd()}</code>
          </pre>
        ) : (
          <div className="select-text">
            <SyntaxHighlighter
              language={cleanLang}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: 0,
                background: 'transparent',
                fontSize: '0.85rem',
                lineHeight: '1.6',
              }}
              wrapLines={true}
              wrapLongLines={true}
            >
              {value.trimEnd()}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';
