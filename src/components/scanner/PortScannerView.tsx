import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  ShieldCheck,
  Terminal as TerminalIcon,
  Search,
  Sparkles,
  AlertTriangle,
  Play,
  Square,
  FileText,
} from 'lucide-react';
import { scannerService } from '../../services/scannerService';
import { aiService } from '../../services/aiService';
import type { ScanSession, ScanResult, ScanProfileType, Project } from '../../types/pentester';

interface PortScannerViewProps {
  initialScanSession?: ScanSession | null;
  onNavigateToChatWithContext?: (scanId: string, query?: string) => void;
  onNavigateToReports?: (scanId: string) => void;
}

export const PortScannerView: React.FC<PortScannerViewProps> = ({
  initialScanSession,
  onNavigateToChatWithContext,
  onNavigateToReports,
}) => {
  const [target, setTarget] = useState('127.0.0.1');
  const [scanType, setScanType] = useState<ScanProfileType>('quick');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isAuthorizedConfirmed, setIsAuthorizedConfirmed] = useState(false);

  const [activeSession, setActiveSession] = useState<ScanSession | null>(initialScanSession || null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters for Port Table
  const [filterState, setFilterState] = useState<'all' | 'open' | 'filtered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Load projects
  useEffect(() => {
    scannerService.getProjects().then((projs) => {
      setProjects(projs);
      if (projs.length > 0) {
        setSelectedProjectId(projs[0].id);
        if (projs[0].targetScope?.length > 0) {
          setTarget(projs[0].targetScope[0]);
        }
        setIsAuthorizedConfirmed(projs[0].authorizationConfirmed);
      }
    });
  }, []);

  // Poll active session status
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'running') return;

    setIsScanning(true);
    const interval = setInterval(async () => {
      try {
        const updated = await scannerService.getSession(activeSession.id);
        setActiveSession(updated);

        if (updated.status === 'completed' || updated.status === 'failed' || updated.status === 'cancelled') {
          setIsScanning(false);
          clearInterval(interval);
          if (updated.status === 'completed') {
            const res = await scannerService.getResults(updated.id);
            setScanResult(res);
          }
        }
      } catch (err) {
        console.error('Session poll error:', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeSession?.id, activeSession?.status]);

  // Load existing results if initial scan was completed
  useEffect(() => {
    if (initialScanSession?.id) {
      setActiveSession(initialScanSession);
      setTarget(initialScanSession.target);
      if (initialScanSession.status === 'completed') {
        scannerService.getResults(initialScanSession.id).then(setScanResult).catch(() => {});
      }
    }
  }, [initialScanSession]);

  // Auto-scroll terminal logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.logs]);

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthorizedConfirmed && target !== '127.0.0.1' && target !== 'localhost') {
      setError('Scope Authorization confirmation is strictly required. Check the authorization checkbox before testing.');
      return;
    }

    try {
      setIsScanning(true);
      setScanResult(null);
      const session = await scannerService.startScan({
        target: target.trim(),
        projectId: selectedProjectId || undefined,
        scanType,
      });
      setActiveSession(session);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to initialize scan');
      setIsScanning(false);
    }
  };

  const handleStopScan = async () => {
    if (!activeSession) return;
    try {
      await scannerService.stopScan(activeSession.id);
      setIsScanning(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyzeWithGemini = async () => {
    if (!activeSession) return;
    setIsAnalyzingAI(true);
    try {
      await aiService.analyzeScan(activeSession.id);
      if (onNavigateToChatWithContext) {
        onNavigateToChatWithContext(
          activeSession.id,
          `Please provide a comprehensive penetration testing analysis of the open ports and security headers discovered on ${activeSession.target}. Highlight root causes, CVSS severity, and mitigation commands.`
        );
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Gemini scan analysis failed. Ensure your Gemini API Key is configured in Settings.');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Filter ports
  const filteredPorts = (scanResult?.ports || []).filter((p) => {
    if (filterState === 'open' && p.state !== 'open') return false;
    if (filterState === 'filtered' && p.state !== 'filtered') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.port.toString().includes(q) ||
        p.service.toLowerCase().includes(q) ||
        p.risk.toLowerCase().includes(q) ||
        (p.banner && p.banner.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* Title & Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
              <Zap className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Port Scanner & Service Discovery
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Controlled, non-destructive network service enumeration strictly constrained to authorized scopes.
          </p>
        </div>

        {activeSession && activeSession.status === 'completed' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleAnalyzeWithGemini}
              disabled={isAnalyzingAI}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAnalyzingAI ? 'Analyzing with Gemini...' : 'Analyze with Gemini AI'}</span>
            </button>
            {onNavigateToReports && (
              <button
                onClick={() => onNavigateToReports(activeSession.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/60 dark:bg-slate-800/80 border border-white/80 dark:border-slate-700 text-gray-800 dark:text-gray-200 hover:bg-white text-xs font-semibold shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Audit Report</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Configuration & Scope Confirmation Form */}
      <div className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/60 dark:border-slate-800/80 shadow-xs space-y-4">
        <form onSubmit={handleStartScan} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Target Input */}
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Target IP or Hostname
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g. 127.0.0.1 or scanme.nmap.org"
                  disabled={isScanning}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Project / Scope Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Project Scope Assignment
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  const p = projects.find((proj) => proj.id === e.target.value);
                  if (p) {
                    setIsAuthorizedConfirmed(p.authorizationConfirmed);
                    if (p.targetScope?.length > 0) setTarget(p.targetScope[0]);
                  }
                }}
                disabled={isScanning}
                className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">No Project (Local / Ad-hoc)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.targetScope?.join(', ') || 'Global'})
                  </option>
                ))}
              </select>
            </div>

            {/* Profile Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Scan Profile
              </label>
              <div className="grid grid-cols-3 gap-1 bg-white/60 dark:bg-slate-800/60 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setScanType('quick')}
                  className={`py-1 text-center text-xs font-semibold rounded-lg transition-all ${
                    scanType === 'quick'
                      ? 'bg-cyan-500 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Quick (20)
                </button>
                <button
                  type="button"
                  onClick={() => setScanType('standard')}
                  className={`py-1 text-center text-xs font-semibold rounded-lg transition-all ${
                    scanType === 'standard'
                      ? 'bg-cyan-500 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Standard (100)
                </button>
                <button
                  type="button"
                  onClick={() => setScanType('web')}
                  className={`py-1 text-center text-xs font-semibold rounded-lg transition-all ${
                    scanType === 'web'
                      ? 'bg-cyan-500 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Web HTTP
                </button>
              </div>
            </div>
          </div>

          {/* Authorization Checkbox & Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-gray-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={isAuthorizedConfirmed}
                onChange={(e) => setIsAuthorizedConfirmed(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400"
              />
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                I confirm I have explicit legal authorization to perform security testing against this target.
              </span>
            </label>

            <div className="flex items-center gap-2">
              {isScanning ? (
                <button
                  type="button"
                  onClick={handleStopScan}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Abort Scan</span>
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 hover:opacity-95 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute Assessment</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Live Terminal Output Drawer */}
      {activeSession && (
        <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 border border-slate-800 font-mono text-xs shadow-xl space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Console: {activeSession.target} ({activeSession.scanType.toUpperCase()})
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                activeSession.status === 'completed'
                  ? 'text-emerald-400'
                  : activeSession.status === 'running'
                  ? 'text-cyan-400 animate-pulse'
                  : 'text-rose-400'
              }`}
            >
              ● {activeSession.status}
            </span>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1 pr-2 no-scrollbar">
            {activeSession.logs?.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                <span className="text-slate-500">&gt;</span> {log}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>
      )}

      {/* Scan Results Summary & Port Table */}
      {scanResult && (
        <div className="space-y-4">
          {/* Summary Metric Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-slate-800 text-xs">
              <span className="text-gray-500 dark:text-gray-400">Discovered Open Ports</span>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 font-mono">
                {scanResult.ports.filter((p) => p.state === 'open').length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-slate-800 text-xs">
              <span className="text-gray-500 dark:text-gray-400">Security Header Issues</span>
              <p className="text-xl font-bold text-amber-500 mt-1 font-mono">
                {scanResult.securityHeaders?.filter((h) => h.status !== 'passed').length || 0}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-slate-800 text-xs">
              <span className="text-gray-500 dark:text-gray-400">Target Hosts</span>
              <p className="text-xl font-bold text-cyan-500 mt-1 font-mono">
                {scanResult.hostsDiscovered}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-slate-800 text-xs">
              <span className="text-gray-500 dark:text-gray-400">Overall Attack Surface</span>
              <p
                className={`text-xl font-bold mt-1 font-mono ${
                  scanResult.summary.overallRisk === 'Critical'
                    ? 'text-rose-500'
                    : scanResult.summary.overallRisk === 'High'
                    ? 'text-amber-500'
                    : 'text-emerald-500'
                }`}
              >
                {scanResult.summary.overallRisk}
              </p>
            </div>
          </div>

          {/* Interactive Port Table Card */}
          <div className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/60 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter ports, service names, or risk level..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 w-64"
                />
              </div>

              {/* State Filter Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setFilterState('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    filterState === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'bg-white/40 dark:bg-slate-800/40 text-gray-600 dark:text-gray-300 hover:bg-white'
                  }`}
                >
                  All ({scanResult.ports.length})
                </button>
                <button
                  onClick={() => setFilterState('open')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    filterState === 'open'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/40 dark:bg-slate-800/40 text-gray-600 dark:text-gray-300 hover:bg-white'
                  }`}
                >
                  Open ({scanResult.ports.filter((p) => p.state === 'open').length})
                </button>
                <button
                  onClick={() => setFilterState('filtered')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    filterState === 'filtered'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white/40 dark:bg-slate-800/40 text-gray-600 dark:text-gray-300 hover:bg-white'
                  }`}
                >
                  Filtered
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200/60 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Port</th>
                    <th className="py-2.5 px-3">Protocol</th>
                    <th className="py-2.5 px-3">State</th>
                    <th className="py-2.5 px-3">Service</th>
                    <th className="py-2.5 px-3">Version / Banner</th>
                    <th className="py-2.5 px-3">Risk Tier</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 font-mono">
                  {filteredPorts.length > 0 ? (
                    filteredPorts.map((p, idx) => (
                      <tr key={idx} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white">
                          {p.port}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500">{p.protocol}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.state === 'open'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                            }`}
                          >
                            {p.state.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-purple-700 dark:text-purple-400">
                          {p.service}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                          {p.banner || p.details || '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.risk === 'Critical'
                                ? 'bg-rose-500 text-white'
                                : p.risk === 'High'
                                ? 'bg-amber-500 text-white'
                                : p.risk === 'Medium'
                                ? 'bg-yellow-400 text-slate-900'
                                : 'bg-blue-400/20 text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {p.risk}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-sans">
                          {onNavigateToChatWithContext && (
                            <button
                              onClick={() =>
                                onNavigateToChatWithContext(
                                  scanResult.scanSessionId,
                                  `Analyze port ${p.port} (${p.service}): What are the known vulnerabilities, attack vectors, and remediation steps?`
                                )
                              }
                              className="text-purple-600 dark:text-purple-400 hover:underline text-[11px] font-semibold"
                            >
                              Triage with AI
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400 font-sans">
                        No ports matched your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

