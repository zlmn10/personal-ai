import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  Plus,
  Trash2,
  Globe,
  Server,
  ShieldCheck,
  Play,
  X,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { scannerService } from '../../services/scannerService';
import type { Project } from '../../types/pentester';

interface TargetScopeViewProps {
  onNavigateToScanner?: (target: string, projectId?: string) => void;
}

export const TargetScopeView: React.FC<TargetScopeViewProps> = ({ onNavigateToScanner }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // New Project Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scopeText, setScopeText] = useState('127.0.0.1\nlocalhost');
  const [authorizationConfirmed, setAuthorizationConfirmed] = useState(false);
  const authorizationPledge =
    'I affirm that I have explicit written authorization from the system owner to conduct cybersecurity assessments, vulnerability scanning, and testing on this specified target scope.';

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await scannerService.getProjects();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!authorizationConfirmed) {
      alert('You must confirm written authorization for security testing before creating this scope.');
      return;
    }

    const scope = scopeText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      const newProj = await scannerService.saveProject({
        name: name.trim(),
        description: description.trim(),
        targetScope: scope,
        authorizationConfirmed: true,
        authorizationPledge,
      });

      setProjects((prev) => [newProj, ...prev]);
      setSelectedProject(newProj);
      setIsAddModalOpen(false);

      // Reset
      setName('');
      setDescription('');
      setScopeText('127.0.0.1');
      setAuthorizationConfirmed(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save project';
      alert(msg);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project and its target scope?')) return;
    try {
      await scannerService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const totalTargets = projects.reduce((acc, p) => acc + (p.targetScope?.length || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 lg:p-8 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
              <FolderLock className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Target Scope & Engagement Projects
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              {projects.length} PROJECTS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Define authorized assessment boundaries, verify legal pledges, and organize target assets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadProjects}
            className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/60 border border-white/60 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300"
            title="Refresh projects"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Scope Engagement</span>
          </button>
        </div>
      </div>

      {/* Scope Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 backdrop-blur-md">
          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Total Active Projects</div>
          <div className="text-2xl font-bold font-mono text-cyan-500 mt-1">{projects.length}</div>
        </div>
        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-md">
          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Total In-Scope Targets</div>
          <div className="text-2xl font-bold font-mono text-emerald-500 mt-1">{totalTargets}</div>
        </div>
        <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/10 backdrop-blur-md">
          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Authorization Compliance</div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">100% PLEDGED</div>
        </div>
      </div>

      {/* Main Section */}
      <div className="flex-1 flex flex-col md:flex-row gap-5 overflow-hidden">
        {/* Projects List */}
        <div className="w-full md:w-80 flex flex-col bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/40 dark:border-slate-800 overflow-hidden">
          <div className="p-3 border-b border-gray-100/50 dark:border-slate-800 font-semibold text-xs text-gray-700 dark:text-gray-300">
            Active Engagements
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {projects.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                No engagement projects created yet.
              </div>
            ) : (
              projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    selectedProject?.id === proj.id
                      ? 'bg-cyan-500/10 border-cyan-500/40 shadow-sm'
                      : 'hover:bg-white/40 dark:hover:bg-slate-800/40 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-900 dark:text-gray-100 truncate">
                      {proj.name}
                    </span>
                    <button
                      onClick={(e) => handleDeleteProject(proj.id, e)}
                      className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                      title="Delete project"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-[11px] text-gray-500 truncate mt-0.5">
                    {proj.description || 'No description'}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                    <span className="font-mono text-cyan-600 dark:text-cyan-400">
                      {proj.targetScope?.length || 0} targets
                    </span>
                    <span>•</span>
                    <span>{new Date(proj.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Project Scope Details */}
        <div className="flex-1 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/40 dark:border-slate-800 p-5 overflow-y-auto flex flex-col">
          {selectedProject ? (
            <div className="space-y-6">
              {/* Project Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100/50 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedProject.name}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {selectedProject.description || 'Target scope definition and authorization details'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Authorized Scope
                  </span>
                </div>
              </div>

              {/* Authorization Pledge Display */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  Legal Rules of Engagement & Consent
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  "{selectedProject.authorizationPledge || 'Target owner authorization confirmed.'}"
                </p>
              </div>

              {/* In-Scope Targets Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-500" />
                  Target Boundaries (In-Scope)
                </h3>

                {selectedProject.targetScope?.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400 border border-dashed rounded-xl border-gray-300 dark:border-slate-700">
                    No target endpoints defined for this engagement.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedProject.targetScope.map((target, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <Globe className="w-4 h-4 text-cyan-500" />
                          <span className="font-mono text-xs font-bold text-gray-900 dark:text-gray-100">
                            {target}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            if (onNavigateToScanner) {
                              onNavigateToScanner(target, selectedProject.id);
                            }
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Scan</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
              <FolderLock className="w-12 h-12 text-cyan-500/40 mb-3" />
              <p className="text-sm font-medium">Select an engagement project or create a new scope</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-white/50 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-500" />
                Define Target Engagement Scope
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                  Engagement / Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Internal Microservices Audit, Target Corp Pentest"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                  Description / Client
                </label>
                <input
                  type="text"
                  placeholder="e.g. Authorized Q4 External Infrastructure Pentest"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                  Target Scope (IPs, Hostnames, CIDRs - one per line) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={scopeText}
                  onChange={(e) => setScopeText(e.target.value)}
                  placeholder="127.0.0.1&#10;api.internal.local&#10;192.168.1.0/24"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-mono"
                />
              </div>

              {/* Legal Confirmation */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={authorizationConfirmed}
                    onChange={(e) => setAuthorizationConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-amber-500 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                    I confirm that I have explicit written authorization from the owner of these targets
                    to perform cybersecurity auditing, port scans, and vulnerability probes.
                  </span>
                </label>
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
                  disabled={!authorizationConfirmed}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-md shadow-cyan-500/20 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Scope Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
