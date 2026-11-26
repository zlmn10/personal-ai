import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  Sparkles,
  X,
  Copy,
  Check,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { scannerService } from '../../services/scannerService';
import type { VulnerabilityFinding, SeverityLevel } from '../../types/pentester';

interface VulnerabilitiesViewProps {
  onNavigateToChatWithContext?: (query: string) => void;
}

export const VulnerabilitiesView: React.FC<VulnerabilitiesViewProps> = ({
  onNavigateToChatWithContext,
}) => {
  const [findings, setFindings] = useState<VulnerabilityFinding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedFinding, setSelectedFinding] = useState<VulnerabilityFinding | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // New Finding form state
  const [newTitle, setNewTitle] = useState('');
  const [newSeverity, setNewSeverity] = useState<SeverityLevel>('high');
  const [newCve, setNewCve] = useState('');
  const [newTarget, setNewTarget] = useState('127.0.0.1');
  const [newPort, setNewPort] = useState<number | undefined>(undefined);
  const [newDescription, setNewDescription] = useState('');
  const [newEvidence, setNewEvidence] = useState('');
  const [newRemediation, setNewRemediation] = useState('');

  const loadFindings = async () => {
    setIsLoading(true);
    try {
      const data = await scannerService.getVulnerabilities();
      setFindings(data);
    } catch (err) {
      console.error('Failed to load vulnerability findings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this vulnerability finding?')) return;
    try {
      await scannerService.deleteVulnerability(id);
      setFindings((prev) => prev.filter((f) => f.id !== id));
      if (selectedFinding?.id === id) {
        setSelectedFinding(null);
      }
    } catch (err) {
      alert('Failed to delete finding');
    }
  };

  const handleCreateFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTarget.trim()) return;

    try {
      const created = await scannerService.saveVulnerability({
        title: newTitle.trim(),
        severity: newSeverity,
        cve: newCve.trim() || undefined,
        target: newTarget.trim(),
        port: newPort ? Number(newPort) : undefined,
        description: newDescription.trim(),
        evidence: newEvidence.trim(),
        remediation: newRemediation.trim(),
        confidenceLevel: 'confirmed',
      });
      setFindings((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      // Reset form
      setNewTitle('');
      setNewCve('');
      setNewPort(undefined);
      setNewDescription('');
      setNewEvidence('');
      setNewRemediation('');
    } catch (err) {
      alert('Failed to create finding');
    }
  };

  // Filtered findings
  const filteredFindings = findings.filter((f) => {
    const matchesSeverity = selectedSeverity === 'all' || f.severity === selectedSeverity;
    const matchesSearch =
      searchQuery === '' ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.cve && f.cve.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  // Severity counts
  const counts = {
    critical: findings.filter((f) => f.severity === 'critical').length,
    high: findings.filter((f) => f.severity === 'high').length,
    medium: findings.filter((f) => f.severity === 'medium').length,
    low: findings.filter((f) => f.severity === 'low').length,
    informational: findings.filter((f) => f.severity === 'informational').length,
  };

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'low':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 lg:p-8 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Vulnerability Management
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              {findings.length} TOTAL FINDINGS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Aggregated security findings, CVE classifications, and AI-assisted remediation playbooks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadFindings}
            className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/60 border border-white/60 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300"
            title="Refresh findings"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Finding</span>
          </button>
        </div>
      </div>

      {/* Severity Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Critical', count: counts.critical, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'High', count: counts.high, color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20' },
          { label: 'Medium', count: counts.medium, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Low', count: counts.low, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Info', count: counts.informational, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
        ].map((stat) => (
          <div
            key={stat.label}
            onClick={() => setSelectedSeverity(selectedSeverity === stat.label.toLowerCase() ? 'all' : stat.label.toLowerCase())}
            className={`p-3 rounded-xl border backdrop-blur-md cursor-pointer transition-all ${
              selectedSeverity === stat.label.toLowerCase() ? 'ring-2 ring-emerald-500/60 shadow-lg' : ''
            } ${stat.bg}`}
          >
            <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{stat.label}</div>
            <div className={`text-xl font-bold font-mono ${stat.color} mt-0.5`}>{stat.count}</div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, CVE, target IP, description..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-slate-800 text-gray-800 dark:text-gray-200 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="informational">Informational</option>
          </select>
        </div>
      </div>

      {/* Main Content Area: Table / List & Drawer */}
      <div className="flex-1 flex gap-5 overflow-hidden">
        {/* Findings Table */}
        <div className="flex-1 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/40 dark:border-slate-800/80 overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1">
            {filteredFindings.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
                <ShieldCheck className="w-12 h-12 text-emerald-500/40 mb-3" />
                <p className="text-sm font-medium">No vulnerabilities found matching criteria</p>
                <p className="text-xs text-gray-500 mt-1">Run an automated scan or add a manual finding.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Title & CVE</th>
                    <th className="py-3 px-4">Target / Service</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Discovered</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50 dark:divide-slate-800/50">
                  {filteredFindings.map((finding) => (
                    <tr
                      key={finding.id}
                      onClick={() => setSelectedFinding(finding)}
                      className={`cursor-pointer transition-colors hover:bg-emerald-500/5 ${
                        selectedFinding?.id === finding.id ? 'bg-emerald-500/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getSeverityBadge(
                            finding.severity
                          )}`}
                        >
                          {finding.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                          <span>{finding.title}</span>
                          {finding.cve && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[10px] font-mono">
                              {finding.cve}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-sm mt-0.5">
                          {finding.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-gray-700 dark:text-gray-300">
                        {finding.target}
                        {finding.port ? `:${finding.port}` : ''}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="capitalize text-gray-500 dark:text-gray-400 text-[11px]">
                          {finding.confidenceLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-400 text-[11px]">
                        {new Date(finding.dateDiscovered).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => handleDelete(finding.id, e)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete finding"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Selected Finding Detail Drawer */}
        {selectedFinding && (
          <div className="w-96 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-slate-800 p-5 flex flex-col overflow-y-auto space-y-4 animate-in slide-in-from-right-4">
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getSeverityBadge(
                    selectedFinding.severity
                  )}`}
                >
                  {selectedFinding.severity}
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-2">
                  {selectedFinding.title}
                </h3>
                {selectedFinding.cve && (
                  <div className="text-xs font-mono text-purple-500 mt-0.5">{selectedFinding.cve}</div>
                )}
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target and port info */}
            <div className="p-3 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-white/30 dark:border-slate-700/50 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Target Host:</span>
                <span className="font-mono text-gray-900 dark:text-gray-200">{selectedFinding.target}</span>
              </div>
              {selectedFinding.port && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Port / Service:</span>
                  <span className="font-mono text-gray-900 dark:text-gray-200">{selectedFinding.port}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Detection Source:</span>
                <span className="text-gray-900 dark:text-gray-200 capitalize">
                  {selectedFinding.detectionSource || 'Automated Engine'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Description
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {selectedFinding.description}
              </p>
            </div>

            {/* Evidence / Output */}
            {selectedFinding.evidence && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    Evidence & Proof
                  </h4>
                  <button
                    onClick={() => handleCopy(selectedFinding.evidence || '', 'evidence')}
                    className="text-[10px] text-cyan-500 hover:underline flex items-center gap-1"
                  >
                    {copiedText === 'evidence' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-black/80 text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap border border-emerald-500/20">
                  {selectedFinding.evidence}
                </pre>
              </div>
            )}

            {/* Remediation */}
            {selectedFinding.remediation && (
              <div>
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Remediation
                </h4>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed whitespace-pre-line font-mono">
                  {selectedFinding.remediation}
                </div>
              </div>
            )}

            {/* AI Assistant Action */}
            <div className="pt-2 border-t border-white/20 dark:border-slate-800">
              <button
                onClick={() => {
                  if (onNavigateToChatWithContext) {
                    const prompt = `Analyze vulnerability: "${selectedFinding.title}" on target ${selectedFinding.target}${
                      selectedFinding.port ? `:${selectedFinding.port}` : ''
                    } (${selectedFinding.severity.toUpperCase()}).\nCVE: ${
                      selectedFinding.cve || 'N/A'
                    }\nDescription: ${selectedFinding.description}\nEvidence: ${
                      selectedFinding.evidence || 'N/A'
                    }\n\nPlease provide an in-depth security analysis, exploit proof-of-concept explanation, and precise step-by-step remediation commands to patch it.`;
                    onNavigateToChatWithContext(prompt);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask Gemini AI for Remediation</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Vulnerability Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-white/50 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                Record Security Finding
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFinding} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                  Vulnerability Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unauthenticated Redis Server, Missing Content-Security-Policy"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                    Severity *
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as SeverityLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="informational">Informational</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                    CVE ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="CVE-2024-XXXX"
                    value={newCve}
                    onChange={(e) => setNewCve(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                    Target Host / IP *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                    Port (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="6379"
                    value={newPort || ''}
                    onChange={(e) => setNewPort(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain the security vulnerability..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                  Evidence / Terminal Output
                </label>
                <textarea
                  rows={2}
                  placeholder="Raw probe output, HTTP headers, banner response..."
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                  Remediation Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Step-by-step fix or patch commands..."
                  value={newRemediation}
                  onChange={(e) => setNewRemediation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold shadow-md shadow-emerald-500/20 hover:from-emerald-600 hover:to-cyan-600"
                >
                  Save Finding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
