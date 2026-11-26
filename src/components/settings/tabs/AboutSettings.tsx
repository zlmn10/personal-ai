import React from 'react';
import { ShieldCheck, Cpu, HardDrive, Sparkles, Terminal, Activity } from 'lucide-react';

export const AboutSettings: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* App Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-transparent border border-emerald-500/20 dark:border-emerald-800/40 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Pentester AI Agent
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
              Version 3.0 • Cyber Intelligence & SOC Operations Edition
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pt-1">
          An autonomous cybersecurity operations platform powered by Google Gemini API, featuring concurrent socket port scanning, HTTP security header audits, TLS cipher checks, CVE correlation, and automated executive penetration test reporting.
        </p>
      </div>

      {/* Security Architecture Pledge */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Encrypted Architecture & Authorized Scope Protection</span>
        </div>
        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
          Google Gemini API keys are encrypted at rest using AES-256-GCM in MongoDB (`pentester_ai`) and never transmitted to client browsers. All active reconnaissance routines enforce strict legal scope validation and input sanitation.
        </p>
      </div>

      {/* Tech Stack Components */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs space-y-3">
        <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-600" />
          <span>Architecture & Stack</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/70 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Google Gemini 2.5 API</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Cloud AI provider layer with SSE streaming, threat intelligence correlation, and report generation.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/70 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200">
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
              <span>MongoDB Engine</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Database `pentester_ai` with collections for scan sessions, vulnerabilities, scopes, and encrypted keys.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/70 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200">
              <Activity className="w-3.5 h-3.5 text-cyan-600" />
              <span>Scanning Engine</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              High-throughput Node.js socket scanner, TLS cipher auditor, and CLI security tools orchestrator.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/70 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>Real-Time Telemetry</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Real-time NVIDIA GPU VRAM, system RAM, CPU load, and system metrics tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
