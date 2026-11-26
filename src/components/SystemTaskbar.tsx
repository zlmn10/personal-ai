import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Activity, ChevronUp, ChevronDown, Thermometer, Zap, ShieldCheck } from 'lucide-react';
import type { SystemStats } from '../types/chat';

interface SystemTaskbarProps {
  isGenerating?: boolean;
}

export const SystemTaskbar: React.FC<SystemTaskbarProps> = React.memo(({ isGenerating = false }) => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const fetchStats = async (signal?: AbortSignal) => {
    try {
      const res = await fetch('/api/system-stats', { signal });
      if (res.ok) {
        const data: SystemStats = await res.json();
        setStats(data);
      }
    } catch {
      // Silently handle abort or temporary network delay
    }
  };

  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();

    fetchStats(abortController.signal);

    const intervalMs = isGenerating ? 1200 : 3000;
    const timer = setInterval(() => {
      abortController = new AbortController();
      if (isMounted) fetchStats(abortController.signal);
    }, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
      abortController.abort();
    };
  }, [isGenerating]);

  if (!stats) {
    return null;
  }

  const getLoadColor = (percent: number) => {
    if (percent >= 90) return { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500', barBg: 'bg-rose-500' };
    if (percent >= 75) return { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500', barBg: 'bg-amber-500' };
    return { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', barBg: 'bg-emerald-500' };
  };

  const gpuColors = getLoadColor(stats.gpu.percent);
  const ramColors = getLoadColor(stats.ram.percent);
  const cpuColors = getLoadColor(stats.cpu.percent);

  if (isMinimized) {
    return (
      <div className="w-full flex justify-end px-3 py-0.5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-t border-white/60 dark:border-white/10 text-[10px] select-none z-10">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-purple-700 shadow-2xs transition-all"
          title="Show System Resource Taskbar"
        >
          <Activity className="w-3 h-3 text-purple-600" />
          <span>Hardware: GPU {stats.gpu.percent}% · RAM {stats.ram.percent}%</span>
          <ChevronUp className="w-3 h-3 text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full z-10 select-none">
      {/* Expanded Detailed Hardware Inspector Popover */}
      {isExpanded && (
        <div className="absolute bottom-full left-0 right-0 mb-1 mx-2 sm:mx-4 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/90 dark:border-slate-800 shadow-[0_-10px_35px_rgba(0,0,0,0.2)] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 tracking-wide">
                SYSTEM TELEMETRY & RUNTIME STATUS
              </span>
              {isGenerating && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-semibold animate-pulse">
                  <Zap className="w-3 h-3 fill-purple-600" /> AI STREAMING
                </span>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xs px-2 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* GPU Card */}
            <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-slate-800/40 border border-purple-100 dark:border-slate-700">
              <div className="flex items-center justify-between font-semibold text-purple-900 dark:text-purple-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-600" /> GPU VRAM
                </span>
                <span className={gpuColors.text}>{stats.gpu.percent}%</span>
              </div>
              <div className="text-[11px] text-gray-600 dark:text-gray-300 font-medium truncate mb-1" title={stats.gpu.name}>
                {stats.gpu.name}
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 font-mono mb-1.5">
                <span>{stats.gpu.usedGb} / {stats.gpu.totalGb} GB</span>
                <span>Core: {stats.gpu.utilPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${gpuColors.barBg} transition-all duration-300`}
                  style={{ width: `${stats.gpu.percent}%` }}
                />
              </div>
              {stats.gpu.temperatureC !== null && (
                <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">
                  <Thermometer className="w-3 h-3 text-amber-500" />
                  <span>{stats.gpu.temperatureC}°C GPU Temp</span>
                </div>
              )}
            </div>

            {/* RAM Card */}
            <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-slate-800/40 border border-blue-100 dark:border-slate-700">
              <div className="flex items-center justify-between font-semibold text-blue-900 dark:text-blue-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-blue-600" /> System RAM
                </span>
                <span className={ramColors.text}>{stats.ram.percent}%</span>
              </div>
              <div className="text-[11px] text-gray-600 dark:text-gray-300 font-medium mb-1">
                Total Host Memory
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 font-mono mb-1.5">
                <span>{stats.ram.usedGb} / {stats.ram.totalGb} GB</span>
                <span>Free: {stats.ram.freeGb} GB</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${ramColors.barBg} transition-all duration-300`}
                  style={{ width: `${stats.ram.percent}%` }}
                />
              </div>
            </div>

            {/* CPU Card */}
            <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-slate-800/40 border border-emerald-100 dark:border-slate-700">
              <div className="flex items-center justify-between font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-600" /> Processor (CPU)
                </span>
                <span className={cpuColors.text}>{stats.cpu.percent}%</span>
              </div>
              <div className="text-[11px] text-gray-600 dark:text-gray-300 font-medium truncate mb-1" title={stats.cpu.model}>
                {stats.cpu.model.trim()}
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 font-mono mb-1.5">
                <span>{stats.cpu.cores} Physical/Logical Cores</span>
                <span>Active Load</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${cpuColors.barBg} transition-all duration-300`}
                  style={{ width: `${stats.cpu.percent}%` }}
                />
              </div>
            </div>

            {/* AI Backend Card */}
            <div className="p-2.5 rounded-xl bg-cyan-50/50 dark:bg-slate-800/40 border border-cyan-100 dark:border-slate-700">
              <div className="flex items-center justify-between font-semibold text-cyan-900 dark:text-cyan-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" /> Pentester AI Core
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.2 bg-emerald-500/15 rounded-full">
                  ONLINE
                </span>
              </div>
              <div className="text-[11px] text-gray-700 dark:text-gray-300 font-medium truncate mb-1">
                Google Gemini API Architecture
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono space-y-0.5 mt-2">
                <div>Backend Port: 3001 (Active)</div>
                <div>Database: MongoDB (pentester_ai)</div>
                <div>Socket Scanner: Concurrent Node Engine</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Taskbar Strip */}
      <footer className="h-7 px-3 sm:px-4 flex items-center justify-between bg-white/60 dark:bg-slate-900/60 hover:bg-white/75 dark:hover:bg-slate-900/80 backdrop-blur-xl border-t border-white/70 dark:border-white/10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] text-[11px] text-gray-600 dark:text-gray-400 transition-colors">
        {/* Left: Active Status Indicator */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="relative flex h-2 w-2">
            {isGenerating ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600" />
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            )}
          </span>
          <span className="font-semibold text-gray-700 dark:text-gray-300 text-[10.5px]">
            {isGenerating ? (
              <span className="text-purple-600 dark:text-purple-400 font-bold animate-pulse">Running Gemini Inference...</span>
            ) : (
              'Telemetry Live'
            )}
          </span>
        </div>

        {/* Center: Live Metrics Badges */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar font-mono text-[10.5px]">
          {/* GPU VRAM Badge */}
          <div
            className="flex items-center gap-1.5 cursor-pointer hover:text-purple-600 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
            title={`${stats.gpu.name} - ${stats.gpu.usedGb} GB used of ${stats.gpu.totalGb} GB`}
          >
            <span className="font-semibold font-sans text-gray-500">GPU</span>
            <span className={gpuColors.text}>{stats.gpu.usedGb}/{stats.gpu.totalGb}GB</span>
            <span className="text-gray-400 font-sans">({stats.gpu.percent}%)</span>
            {stats.gpu.temperatureC !== null && (
              <span className="hidden md:inline text-gray-400">· {stats.gpu.temperatureC}°C</span>
            )}
          </div>

          <span className="text-gray-300 dark:text-gray-700">|</span>

          {/* System RAM Badge */}
          <div
            className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
            title={`System Memory: ${stats.ram.usedGb} GB used of ${stats.ram.totalGb} GB`}
          >
            <span className="font-semibold font-sans text-gray-500">RAM</span>
            <span className={ramColors.text}>{stats.ram.usedGb}/{stats.ram.totalGb}GB</span>
            <span className="text-gray-400 font-sans">({stats.ram.percent}%)</span>
          </div>

          <span className="text-gray-300 dark:text-gray-700">|</span>

          {/* CPU Load Badge */}
          <div
            className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-600 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
            title={`CPU Load: ${stats.cpu.percent}% across ${stats.cpu.cores} cores`}
          >
            <span className="font-semibold font-sans text-gray-500">CPU</span>
            <span className={cpuColors.text}>{stats.cpu.percent}%</span>
            <span className="hidden sm:inline text-gray-400 font-sans">({stats.cpu.cores}c)</span>
          </div>
        </div>

        {/* Right: Expand/Collapse & Minimize Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-white/80 dark:hover:bg-slate-800 text-gray-500 hover:text-purple-600 transition-colors text-[10px]"
            title={isExpanded ? 'Hide details' : 'Show full telemetry details'}
          >
            <span>{isExpanded ? 'Hide' : 'Details'}</span>
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-1 py-0.5 rounded hover:bg-white/80 dark:hover:bg-slate-800 transition-colors text-[10px]"
            title="Minimize taskbar"
          >
            ×
          </button>
        </div>
      </footer>
    </div>
  );
});

SystemTaskbar.displayName = 'SystemTaskbar';
