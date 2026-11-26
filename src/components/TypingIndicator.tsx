import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-card w-fit max-w-[220px] border border-white/70 shadow-xs animate-in fade-in duration-200 my-2">
      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-400 via-purple-400 to-sky-400 animate-pulse shadow-xs flex-shrink-0" />
      <div className="flex items-center gap-1.5 py-0.5">
        <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Thinking...</span>
    </div>
  );
};
