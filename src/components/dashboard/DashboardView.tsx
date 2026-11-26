import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Server,
  Zap,
  Clock,
  ArrowUpRight,
  RefreshCw,
  FolderLock,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { scannerService } from '../../services/scannerService';
import type { DashboardStats, ScanSession } from '../../types/pentester';

interface DashboardViewProps {
  onNavigate: (tab: 'scanner' | 'vulnerabilities' | 'targets' | 'reports' | 'chat') => void;
  onSelectScan: (scan: ScanSession) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onSelectScan }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await scannerService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalVulns = stats?.totalVulnerabilities || 0;
  const criticalCount = stats?.severityCounts?.critical || 0;
  const highCount = stats?.severityCounts?.high || 0;
  const medCount = stats?.severityCounts?.medium || 0;
  const lowCount = stats?.severityCounts?.low || 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <Activity className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Security Operations Center
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              ● AGENT LIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Authorized telemetry, vulnerability metrics, and Google Gemini AI threat intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadStats}
            className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/60 border border-white/60 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('scanner')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Launch Port Scan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Scans */}
        <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/60 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
            <span>Assessment Scans</span>
            <Server className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-mono">
              {stats?.totalScans ?? 0}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {stats?.activeScans ? `${stats.activeScans} active` : 'Idle'}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-gray-500 flex items-center justify-between border-t border-gray-200/50 dark:border-slate-800 pt-2">
            <span>Completed: {stats?.completedScans ?? 0}</span>
            <span>Failed: {stats?.failedScans ?? 0}</span>
          </div>
        </div>

        {/* Discovered Open Ports */}
        <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/60 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
            <span>Open TCP Ports</span>
            <Zap className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-mono">
              {stats?.totalOpenPorts ?? 0}
            </span>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
              Audited
            </span>
          </div>
          <div className="mt-3 text-[11px] text-gray-500 flex items-center justify-between border-t border-gray-200/50 dark:border-slate-800 pt-2">
            <span>Attack Surface Discovery</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Total Vulnerabilities */}
        <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/60 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
            <span>Security Findings</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              {totalVulns}
            </span>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
              {criticalCount > 0 ? `${criticalCount} Critical` : 'Reviewed'}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-gray-500 flex items-center justify-between border-t border-gray-200/50 dark:border-slate-800 pt-2">
            <span>High Severity: {highCount}</span>
            <span>Med: {medCount}</span>
          </div>
        </div>

        {/* Authorized Projects */}
        <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/60 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
            <span>Authorized Scopes</span>
            <FolderLock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-mono">
              {stats?.projectsCount ?? 0}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Projects
            </span>
          </div>
          <div className="mt-3 text-[11px] text-gray-500 flex items-center justify-between border-t border-gray-200/50 dark:border-slate-800 pt-2">
            <span>Strict Scope Enforced</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Vulnerability Severity Distribution Bar */}
      <div className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/60 dark:border-slate-800/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
              Vulnerability Severity Distribution
            </h3>
          </div>
          <button
            onClick={() => onNavigate('vulnerabilities')}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>View All Findings ({totalVulns})</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Horizontal Stacked Progress Bar */}
        <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden flex">
          {totalVulns > 0 ? (
            <>
              <div
                style={{ width: `${(criticalCount / totalVulns) * 100}%` }}
                className="bg-rose-500 transition-all duration-500"
                title={`Critical: ${criticalCount}`}
              />
              <div
                style={{ width: `${(highCount / totalVulns) * 100}%` }}
                className="bg-amber-500 transition-all duration-500"
                title={`High: ${highCount}`}
              />
              <div
                style={{ width: `${(medCount / totalVulns) * 100}%` }}
                className="bg-yellow-400 transition-all duration-500"
                title={`Medium: ${medCount}`}
              />
              <div
                style={{ width: `${(lowCount / totalVulns) * 100}%` }}
                className="bg-blue-400 transition-all duration-500"
                title={`Low: ${lowCount}`}
              />
            </>
          ) : (
            <div className="w-full bg-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-600 dark:text-emerald-400">
              No vulnerabilities identified
            </div>
          )}
        </div>

        {/* Severity Legend Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Critical: {criticalCount}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>High: {highCount}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-800 dark:text-yellow-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span>Medium: {medCount}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Low: {lowCount}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-500/10 border border-gray-500/20 text-gray-700 dark:text-gray-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span>Info: {stats?.severityCounts?.informational || 0}</span>
          </div>
        </div>
      </div>

      {/* Recent Scans Section */}
      <div className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/60 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
              Recent Scan Sessions
            </h3>
          </div>
          <button
            onClick={() => onNavigate('scanner')}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>Scan Console</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {stats?.recentScans && stats.recentScans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.recentScans.map((scan) => (
              <div
                key={scan.id}
                onClick={() => onSelectScan(scan)}
                className="p-3.5 rounded-xl border border-white/60 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-gray-900 dark:text-white truncate max-w-[160px]">
                    {scan.target}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      scan.status === 'completed'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : scan.status === 'running'
                        ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 animate-pulse'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {scan.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                  <span>Profile: {scan.scanType.toUpperCase()}</span>
                  <span>Ports: {scan.openPorts}</span>
                  <span>Findings: {scan.findingsCount}</span>
                </div>

                <div className="flex items-center justify-between text-[10.5px] text-gray-400 pt-1 border-t border-gray-100 dark:border-slate-800">
                  <span>{new Date(scan.startTime).toLocaleDateString()}</span>
                  <span className="group-hover:text-purple-600 transition-colors flex items-center gap-1">
                    Details <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
            <p>No assessment scans executed yet.</p>
            <button
              onClick={() => onNavigate('scanner')}
              className="mt-2 text-purple-600 dark:text-purple-400 hover:underline font-semibold"
            >
              Start your first port scan &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Pentester AI Quick Action Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-emerald-500/10 border border-purple-500/20 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="orb-3d-mini" />
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              Pentester AI Threat Intelligence Agent
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Powered by Google Gemini. Ask technical security questions, analyze CVEs, or plan your audit.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('chat')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all flex-shrink-0"
        >
          <span>Open AI Assistant</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
