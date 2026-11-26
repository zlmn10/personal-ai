import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';
import {
  connectDB,
  getDBStatus,
  ConversationModel,
  AISettingsModel,
  ProjectModel,
  ScanSessionModel,
  ScanResultModel,
  VulnerabilityFindingModel,
  ReportModel,
  AuditLogModel,
} from './db.js';
import { aiService } from './services/aiProvider.js';
import { detectInstalledTools, scannerEngine, sanitizeAndValidateTarget } from './services/scanner.js';

const execPromise = util.promisify(exec);

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize MongoDB connection
connectDB().catch((err) => console.error('[Database Connect Error]:', err));

// ==========================================
// 1. DATABASE & HEALTH ENDPOINTS
// ==========================================
app.get('/api/health', async (_req, res) => {
  const dbStatus = getDBStatus();
  const aiConfig = await aiService.getEffectiveSettings();

  return res.json({
    status: 'ok',
    appName: 'Pentester AI Agent',
    version: '3.0.0',
    aiProvider: aiConfig.provider,
    aiConfigured: aiConfig.hasKey,
    database: dbStatus,
  });
});

app.get('/api/db/status', async (_req, res) => {
  const status = getDBStatus();
  let count = 0;
  if (status.isConnected) {
    try {
      count = await ConversationModel.countDocuments();
    } catch {
      count = 0;
    }
  }
  return res.json({
    ...status,
    conversationCount: count,
  });
});

// ==========================================
// 2. AI PROVIDER & GEMINI SETTINGS API
// ==========================================
app.get('/api/ai/settings', async (_req, res) => {
  try {
    const settings = await aiService.getEffectiveSettings();
    return res.json(settings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/settings', async (req, res) => {
  try {
    const saved = await aiService.saveSettings(req.body);
    return res.json(saved);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/ai/key', async (_req, res) => {
  try {
    const result = await aiService.deleteKey();
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/test', async (req, res) => {
  try {
    const { apiKey, model, provider } = req.body || {};
    const result = await aiService.testConnection(apiKey, model, provider);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Streaming AI Chat Endpoint (SSE)
app.post('/api/ai/chat', async (req, res) => {
  const { messages, model, temperature, maxTokens, systemPrompt, scanContextId } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  const effective = await aiService.getEffectiveSettings();
  if (!effective.hasKey) {
    return res.status(400).json({
      error: 'AI API key is not configured. Please configure your API Key in Settings > AI Provider.',
    });
  }

  // If scan context attached, inject scan results into system prompt
  let augmentedSystemPrompt = systemPrompt || effective.systemPrompt;
  if (scanContextId) {
    try {
      const scanRes = await ScanResultModel.findOne({ scanSessionId: scanContextId }).lean();
      if (scanRes) {
        augmentedSystemPrompt += `\n\nCURRENT AUDIT CONTEXT:\nTarget: ${scanRes.target}\nOpen Ports: ${JSON.stringify(scanRes.ports, null, 2)}\nSecurity Headers: ${JSON.stringify(scanRes.securityHeaders || [], null, 2)}`;
      }
    } catch {
      // Safe ignore
    }
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const provider = aiService.getProvider(effective.provider);
    await provider.chatStream(
      messages,
      {
        apiKey: effective.apiKey,
        model: model || effective.model,
        temperature: typeof temperature === 'number' ? temperature : effective.temperature,
        maxTokens: maxTokens || effective.maxTokens,
        systemPrompt: augmentedSystemPrompt,
      },
      (chunk) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
    );

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('[AI Chat Stream Error]:', err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// Specialized Gemini Scan Vulnerability Analysis
app.post('/api/ai/analyze-scan', async (req, res) => {
  try {
    const { scanSessionId } = req.body || {};
    if (!scanSessionId) {
      return res.status(400).json({ error: 'scanSessionId is required' });
    }

    const scanResult = await ScanResultModel.findOne({ scanSessionId }).lean();
    if (!scanResult) {
      return res.status(404).json({ error: 'Scan result not found' });
    }

    const effective = await aiService.getEffectiveSettings();
    if (!effective.hasKey) {
      return res.status(400).json({ error: 'Google Gemini API key required for AI analysis' });
    }

    const provider = aiService.getProvider(effective.provider);
    const analysis = await provider.analyzeScan(scanResult, {
      apiKey: effective.apiKey,
      model: effective.model,
    });

    // Optionally save new findings extracted by AI
    if (Array.isArray(analysis.findings)) {
      for (const finding of analysis.findings) {
        const doc = new VulnerabilityFindingModel({
          id: `ai_vuln_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          scanSessionId,
          projectId: scanResult.projectId || null,
          title: finding.title || 'Discovered Vulnerability',
          type: 'AI Analyzed',
          severity: (finding.severity || 'medium').toLowerCase(),
          cve: finding.cve || '',
          target: scanResult.target,
          affectedService: finding.affectedService || '',
          port: finding.port,
          description: finding.description || '',
          evidence: finding.evidence || '',
          impact: finding.impact || '',
          risk: finding.impact || '',
          remediation: finding.remediation || '',
          confidenceLevel: finding.confidenceLevel || 'potential',
          detectionSource: 'Gemini AI Agent',
          dateDiscovered: new Date(),
        });
        await doc.save();
      }
    }

    return res.json(analysis);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Generate formal pentesting report using Gemini
app.post('/api/ai/generate-report', async (req, res) => {
  try {
    const { scanSessionId, projectId } = req.body || {};
    if (!scanSessionId) {
      return res.status(400).json({ error: 'scanSessionId is required' });
    }

    const [session, scanResult, project] = await Promise.all([
      ScanSessionModel.findOne({ id: scanSessionId }).lean(),
      ScanResultModel.findOne({ scanSessionId }).lean(),
      projectId ? ProjectModel.findOne({ id: projectId }).lean() : null,
    ]);

    if (!session || !scanResult) {
      return res.status(404).json({ error: 'Scan session or result not found' });
    }

    const effective = await aiService.getEffectiveSettings();
    if (!effective.hasKey) {
      return res.status(400).json({ error: 'Google Gemini API key required to generate reports.' });
    }

    const provider = aiService.getProvider(effective.provider);
    const reportMarkdown = await provider.generateReport(project, session, scanResult, {
      apiKey: effective.apiKey,
      model: effective.model,
    });

    const reportId = `rep_${Date.now()}`;
    const reportDoc = new ReportModel({
      id: reportId,
      projectId: projectId || null,
      scanSessionId,
      title: `Security Assessment Report - ${session.target}`,
      executiveSummary: reportMarkdown.slice(0, 500) + '...',
      scope: project?.targetScope || [session.target],
      findings: scanResult.ports,
      remediationRoadmap: reportMarkdown,
      generatedBy: 'gemini',
      createdAt: new Date(),
    });

    await reportDoc.save();

    return res.json({
      id: reportId,
      reportMarkdown,
      reportDoc,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. SCANNER ENGINE & TOOL MANAGEMENT
// ==========================================
app.get('/api/scanner/tools', async (_req, res) => {
  try {
    const tools = await detectInstalledTools();
    return res.json(tools);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/scanner/start', async (req, res) => {
  try {
    const { target, projectId, scanType, customPorts } = req.body || {};
    if (!target) {
      return res.status(400).json({ error: 'Target is required' });
    }

    const session = await scannerEngine.startScan({
      target,
      projectId,
      scanType,
      customPorts,
    });

    return res.status(201).json(session);
  } catch (err) {
    console.error('[Scanner Start Error]:', err.message);
    return res.status(400).json({ error: err.message });
  }
});

app.get('/api/scanner/session/:id', async (req, res) => {
  try {
    const session = await ScanSessionModel.findOne({ id: req.params.id }).lean();
    if (!session) {
      return res.status(404).json({ error: 'Scan session not found' });
    }
    return res.json(session);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/scanner/session/:id/stop', async (req, res) => {
  try {
    const result = await scannerEngine.cancelScan(req.params.id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/scanner/results/:id', async (req, res) => {
  try {
    const result = await ScanResultModel.findOne({ scanSessionId: req.params.id }).lean();
    if (!result) {
      return res.status(404).json({ error: 'Scan results not found' });
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/scanner/history', async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};
    const history = await ScanSessionModel.find(filter).sort({ startTime: -1 }).limit(50).lean();
    return res.json(history);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. PROJECTS CRUD
// ==========================================
app.get('/api/projects', async (_req, res) => {
  try {
    const projects = await ProjectModel.find({}).sort({ updatedAt: -1 }).lean();
    return res.json(projects);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { id, name, description, targetScope, authorizationConfirmed, authorizationPledge } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Project name is required' });

    const projectId = id || `proj_${Date.now()}`;
    const cleanScope = Array.isArray(targetScope)
      ? targetScope.map((t) => sanitizeAndValidateTarget(t))
      : [];

    const project = await ProjectModel.findOneAndUpdate(
      { id: projectId },
      {
        $set: {
          id: projectId,
          name,
          description: description || '',
          targetScope: cleanScope,
          authorizationConfirmed: Boolean(authorizationConfirmed),
          authorizationPledge: authorizationPledge || 'I own or have authorized explicit permission to test these systems.',
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    return res.status(201).json(project);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await ProjectModel.deleteOne({ id: req.params.id });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. VULNERABILITIES FINDINGS CRUD
// ==========================================
app.get('/api/vulnerabilities', async (req, res) => {
  try {
    const { severity, target, projectId } = req.query;
    const filter = {};
    if (severity) filter.severity = severity.toLowerCase();
    if (target) filter.target = target;
    if (projectId) filter.projectId = projectId;

    const findings = await VulnerabilityFindingModel.find(filter).sort({ dateDiscovered: -1 }).limit(100).lean();
    return res.json(findings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/vulnerabilities', async (req, res) => {
  try {
    const findingData = req.body;
    const id = findingData.id || `vuln_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const doc = new VulnerabilityFindingModel({
      ...findingData,
      id,
      dateDiscovered: new Date(),
    });
    await doc.save();
    return res.status(201).json(doc);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.delete('/api/vulnerabilities/:id', async (req, res) => {
  try {
    await VulnerabilityFindingModel.deleteOne({ id: req.params.id });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. REPORTS CRUD
// ==========================================
app.get('/api/reports', async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};
    const reports = await ReportModel.find(filter).sort({ createdAt: -1 }).lean();
    return res.json(reports);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/reports/:id', async (req, res) => {
  try {
    const report = await ReportModel.findOne({ id: req.params.id }).lean();
    if (!report) return res.status(404).json({ error: 'Report not found' });
    return res.json(report);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reports/:id', async (req, res) => {
  try {
    await ReportModel.deleteOne({ id: req.params.id });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. SOC DASHBOARD AGGREGATED STATS
// ==========================================
app.get('/api/dashboard/stats', async (_req, res) => {
  try {
    const [
      totalScans,
      activeScans,
      completedScans,
      failedScans,
      vulnerabilities,
      recentScans,
      projectsCount,
    ] = await Promise.all([
      ScanSessionModel.countDocuments(),
      ScanSessionModel.countDocuments({ status: 'running' }),
      ScanSessionModel.countDocuments({ status: 'completed' }),
      ScanSessionModel.countDocuments({ status: 'failed' }),
      VulnerabilityFindingModel.find({}).lean(),
      ScanSessionModel.find({}).sort({ startTime: -1 }).limit(6).lean(),
      ProjectModel.countDocuments(),
    ]);

    const severityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      informational: 0,
    };

    let totalOpenPorts = 0;
    for (const v of vulnerabilities) {
      const sev = (v.severity || 'low').toLowerCase();
      if (severityCounts[sev] !== undefined) {
        severityCounts[sev]++;
      }
    }

    for (const scan of recentScans) {
      totalOpenPorts += scan.openPorts || 0;
    }

    return res.json({
      totalScans,
      activeScans,
      completedScans,
      failedScans,
      projectsCount,
      totalOpenPorts,
      totalVulnerabilities: vulnerabilities.length,
      severityCounts,
      recentScans,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. HARDWARE MONITORING (RAM, CPU, GPU)
// ==========================================
let lastCpuSnapshot = getCpuTimes();

function getCpuTimes() {
  const cpus = os.cpus() || [];
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      total += cpu.times[type];
    }
    idle += cpu.times.idle;
  }
  return { idle, total, count: cpus.length, model: cpus[0]?.model || 'Processor' };
}

async function fetchGpuMetrics() {
  try {
    const { stdout } = await execPromise(
      'nvidia-smi --query-gpu=name,memory.total,memory.used,memory.free,utilization.gpu,temperature.gpu --format=csv,noheader,nounits',
      { timeout: 1200 }
    );
    const parts = stdout.trim().split(',').map((p) => p.trim());
    if (parts.length >= 4) {
      const totalMb = parseFloat(parts[1]) || 0;
      const usedMb = parseFloat(parts[2]) || 0;
      const freeMb = parseFloat(parts[3]) || 0;
      const utilPercent = parseFloat(parts[4]) || 0;
      const tempC = parts[5] ? parseFloat(parts[5]) : null;

      return {
        hasGpu: true,
        name: parts[0],
        totalMb,
        usedMb,
        freeMb,
        usedGb: (usedMb / 1024).toFixed(1),
        totalGb: (totalMb / 1024).toFixed(1),
        percent: totalMb > 0 ? Math.round((usedMb / totalMb) * 100) : 0,
        utilPercent,
        temperatureC: tempC,
      };
    }
  } catch {
    // No NVIDIA GPU
  }

  return {
    hasGpu: false,
    name: 'Integrated GPU',
    usedGb: '0.0',
    totalGb: '0.0',
    percent: 0,
    utilPercent: 0,
    temperatureC: null,
  };
}

app.get('/api/system-stats', async (_req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ram = {
      totalGb: (totalMem / 1073741824).toFixed(1),
      usedGb: (usedMem / 1073741824).toFixed(1),
      freeGb: (freeMem / 1073741824).toFixed(1),
      percent: Math.round((usedMem / totalMem) * 100),
    };

    const currentCpu = getCpuTimes();
    const idleDiff = currentCpu.idle - lastCpuSnapshot.idle;
    const totalDiff = currentCpu.total - lastCpuSnapshot.total;
    const cpuPercent = totalDiff > 0 ? Math.max(0, Math.min(100, Math.round((1 - idleDiff / totalDiff) * 100))) : 0;
    lastCpuSnapshot = currentCpu;

    const cpu = {
      percent: cpuPercent,
      cores: currentCpu.count,
      model: currentCpu.model,
    };

    const gpu = await fetchGpuMetrics();

    return res.json({
      ram,
      cpu,
      gpu,
      uptimeSec: Math.round(os.uptime()),
      timestamp: Date.now(),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. CONVERSATIONS CRUD (PENTESTER AI AGENT)
// ==========================================
app.get('/api/conversations', async (_req, res) => {
  try {
    const conversations = await ConversationModel.find({}).sort({ updatedAt: -1 }).lean();
    return res.json(conversations);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/conversations/:id', async (req, res) => {
  try {
    const conv = await ConversationModel.findOne({ id: req.params.id }).lean();
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    return res.json(conv);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/conversations', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) return res.status(400).json({ error: 'Conversation id is required' });

    const conv = await ConversationModel.findOneAndUpdate(
      { id: data.id },
      { ...data, updatedAt: data.updatedAt || Date.now() },
      { upsert: true, returnDocument: 'after' }
    );
    return res.status(201).json(conv);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/conversations/:id', async (req, res) => {
  try {
    const data = req.body;
    const conv = await ConversationModel.findOneAndUpdate(
      { id: req.params.id },
      { ...data, updatedAt: Date.now() },
      { returnDocument: 'after' }
    );
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    return res.json(conv);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/conversations/:id', async (req, res) => {
  try {
    const result = await ConversationModel.deleteOne({ id: req.params.id });
    return res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/conversations', async (_req, res) => {
  try {
    const result = await ConversationModel.deleteMany({});
    return res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. FRONTEND STATIC ASSETS SERVING
// ==========================================
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.use((_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Pentester AI server is running. Build frontend with `npm run build` or use Vite on http://localhost:5173');
    }
  });
});

app.listen(PORT, () => {
  console.log(`[Pentester AI Agent] Server running on http://localhost:${PORT}`);
  console.log(`[Pentester AI Agent] Primary AI Provider: Google Gemini`);
});
