import type {
  ToolStatus,
  ScanSession,
  ScanResult,
  Project,
  VulnerabilityFinding,
  PentestReport,
  DashboardStats,
  ScanProfileType,
} from '../types/pentester';

const API_ROOT = 'http://localhost:3001/api';

export const scannerService = {
  // ==========================================
  // SCANNER & TOOLS
  // ==========================================
  async getTools(): Promise<ToolStatus[]> {
    const res = await fetch(`${API_ROOT}/scanner/tools`);
    if (!res.ok) throw new Error('Failed to fetch installed security tools');
    return res.json();
  },

  async startScan(data: {
    target: string;
    projectId?: string;
    scanType?: ScanProfileType;
    customPorts?: number[];
  }): Promise<ScanSession> {
    const res = await fetch(`${API_ROOT}/scanner/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to start scan');
    }
    return res.json();
  },

  async getSession(id: string): Promise<ScanSession> {
    const res = await fetch(`${API_ROOT}/scanner/session/${id}`);
    if (!res.ok) throw new Error('Failed to fetch scan session');
    return res.json();
  },

  async stopScan(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_ROOT}/scanner/session/${id}/stop`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to stop scan');
    return res.json();
  },

  async getResults(sessionId: string): Promise<ScanResult> {
    const res = await fetch(`${API_ROOT}/scanner/results/${sessionId}`);
    if (!res.ok) throw new Error('Failed to fetch scan results');
    return res.json();
  },

  async getHistory(projectId?: string): Promise<ScanSession[]> {
    const url = projectId
      ? `${API_ROOT}/scanner/history?projectId=${encodeURIComponent(projectId)}`
      : `${API_ROOT}/scanner/history`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch scan history');
    return res.json();
  },

  // ==========================================
  // PROJECTS
  // ==========================================
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_ROOT}/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async saveProject(data: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_ROOT}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save project');
    }
    return res.json();
  },

  async deleteProject(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_ROOT}/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete project');
    return res.json();
  },

  // ==========================================
  // VULNERABILITIES FINDINGS
  // ==========================================
  async getVulnerabilities(filter?: {
    severity?: string;
    target?: string;
    projectId?: string;
  }): Promise<VulnerabilityFinding[]> {
    const params = new URLSearchParams();
    if (filter?.severity) params.set('severity', filter.severity);
    if (filter?.target) params.set('target', filter.target);
    if (filter?.projectId) params.set('projectId', filter.projectId);

    const url = `${API_ROOT}/vulnerabilities?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch vulnerabilities');
    return res.json();
  },

  async saveVulnerability(data: Partial<VulnerabilityFinding>): Promise<VulnerabilityFinding> {
    const res = await fetch(`${API_ROOT}/vulnerabilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save vulnerability');
    return res.json();
  },

  async deleteVulnerability(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_ROOT}/vulnerabilities/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete vulnerability');
    return res.json();
  },

  // ==========================================
  // REPORTS
  // ==========================================
  async getReports(projectId?: string): Promise<PentestReport[]> {
    const url = projectId
      ? `${API_ROOT}/reports?projectId=${encodeURIComponent(projectId)}`
      : `${API_ROOT}/reports`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  async getReport(id: string): Promise<PentestReport> {
    const res = await fetch(`${API_ROOT}/reports/${id}`);
    if (!res.ok) throw new Error('Failed to fetch report');
    return res.json();
  },

  async deleteReport(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_ROOT}/reports/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete report');
    return res.json();
  },

  // ==========================================
  // DASHBOARD STATS
  // ==========================================
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_ROOT}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },
};
