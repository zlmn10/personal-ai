import React, { useState, useEffect } from 'react';
import {
  Terminal,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { scannerService } from '../../../services/scannerService';
import type { ToolStatus } from '../../../types/pentester';

export const ScannerToolsSettings: React.FC = () => {
  const [tools, setTools] = useState<ToolStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTools = async () => {
    setIsLoading(true);
    try {
      const data = await scannerService.getTools();
      setTools(data);
    } catch (err) {
      console.error('Failed to load scanner tools status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTools();
  }, []);

  return (
    <div className="space-y-6 text-xs text-gray-800 dark:text-gray-200">
      {/* Built-in Engines Header */}
      <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Built-in Auditing Engines</h3>
              <p className="text-[11px] text-gray-500">
                Native Node.js socket routines, zero external dependencies required
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            ACTIVE & READY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-gray-200/50 dark:border-slate-700 space-y-1">
            <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
              TCP Socket Scanner
            </div>
            <p className="text-[10px] text-gray-500">
              Concurrent asynchronous port prober for top 20, 100, and full custom port sweeps.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-gray-200/50 dark:border-slate-700 space-y-1">
            <div className="font-bold text-xs text-cyan-600 dark:text-cyan-400">
              HTTP Security Header Auditor
            </div>
            <p className="text-[10px] text-gray-500">
              Evaluates CSP, HSTS, X-Frame-Options, CORS, Permissions-Policy, and Server banners.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-gray-200/50 dark:border-slate-700 space-y-1">
            <div className="font-bold text-xs text-purple-600 dark:text-purple-400">
              TLS / SSL Certificate Inspector
            </div>
            <p className="text-[10px] text-gray-500">
              Extracts cipher suites, TLS version handshakes, certificate expiration, and self-signed flags.
            </p>
          </div>
        </div>
      </div>

      {/* External Scanner Orchestration Status */}
      <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-500" />
            <h4 className="font-bold text-gray-900 dark:text-white">External CLI Tools Integration</h4>
          </div>
          <button
            onClick={loadTools}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Rescan Path</span>
          </button>
        </div>

        <p className="text-[11px] text-gray-500 leading-relaxed">
          The agent detects installed industry-standard security tools on your operating system. If installed,
          Pentester AI can orchestrate them using strictly sanitized allowlisted parameters.
        </p>

        <div className="space-y-3">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="p-3.5 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-gray-200/50 dark:border-slate-700 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-gray-900 dark:text-white">{tool.name}</span>
                  <span className="text-[10px] text-gray-400 ml-2">({tool.category})</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border ${
                    tool.installed
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/30'
                  }`}
                >
                  {tool.installed ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      INSTALLED ({tool.version || 'detected'})
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" />
                      NOT DETECTED
                    </>
                  )}
                </span>
              </div>

              {!tool.installed && (
                <div className="p-2 rounded-lg bg-black/60 font-mono text-[10px] text-cyan-300 border border-cyan-500/20">
                  <span className="text-gray-400">Install via: </span>
                  {tool.installGuide}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
