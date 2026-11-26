import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pentester_ai';

// ==========================================
// 1. AI SETTINGS SCHEMA
// ==========================================
const aiSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global_config', unique: true },
    provider: { type: String, default: 'gemini' }, // 'gemini' | 'openai' | 'anthropic'
    encryptedApiKey: { type: String, default: '' },
    selectedModel: { type: String, default: 'gemini-2.5-flash' },
    temperature: { type: Number, default: 0.7 },
    maxTokens: { type: Number, default: 4096 },
    systemPrompt: { type: String, default: '' },
    status: { type: String, enum: ['connected', 'disconnected', 'error', 'unconfigured'], default: 'unconfigured' },
    lastTestedAt: { type: Date },
    lastError: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const AISettingsModel = mongoose.model('AISettings', aiSettingsSchema);

// ==========================================
// 2. PROJECT SCHEMA
// ==========================================
const projectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    targetScope: [{ type: String }], // Approved domains, IPs, CIDRs
    authorizationConfirmed: { type: Boolean, default: false },
    authorizationPledge: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const ProjectModel = mongoose.model('Project', projectSchema);

// ==========================================
// 3. SCAN SESSION SCHEMA
// ==========================================
const scanSessionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, index: true },
    target: { type: String, required: true },
    scanType: { type: String, enum: ['quick', 'standard', 'full', 'web', 'custom'], default: 'quick' },
    status: { type: String, enum: ['pending', 'running', 'completed', 'failed', 'cancelled'], default: 'pending', index: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    durationSec: { type: Number, default: 0 },
    openPorts: { type: Number, default: 0 },
    findingsCount: { type: Number, default: 0 },
    riskScore: { type: String, enum: ['Critical', 'High', 'Medium', 'Low', 'Safe'], default: 'Low' },
    logs: [{ type: String }],
    error: { type: String },
    scanProfile: { type: mongoose.Schema.Types.Mixed },
  },
  { versionKey: false }
);

export const ScanSessionModel = mongoose.model('ScanSession', scanSessionSchema);

// ==========================================
// 4. SCAN RESULT SCHEMA
// ==========================================
const scanResultSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    scanSessionId: { type: String, required: true, index: true },
    projectId: { type: String, index: true },
    target: { type: String, required: true },
    hostsDiscovered: { type: Number, default: 1 },
    ports: [
      {
        port: { type: Number, required: true },
        protocol: { type: String, default: 'TCP' },
        state: { type: String, default: 'open' }, // 'open' | 'closed' | 'filtered'
        service: { type: String, default: 'unknown' },
        version: { type: String, default: '' },
        banner: { type: String, default: '' },
        risk: { type: String, enum: ['Critical', 'High', 'Medium', 'Low', 'Info'], default: 'Low' },
        details: { type: String, default: '' },
      },
    ],
    securityHeaders: [
      {
        header: { type: String },
        value: { type: String },
        status: { type: String, enum: ['passed', 'warning', 'missing'] },
        recommendation: { type: String },
      },
    ],
    tlsInfo: { type: mongoose.Schema.Types.Mixed },
    dnsInfo: { type: mongoose.Schema.Types.Mixed },
    summary: {
      totalHosts: { type: Number, default: 1 },
      openPorts: { type: Number, default: 0 },
      servicesCount: { type: Number, default: 0 },
      findingsCount: { type: Number, default: 0 },
      overallRisk: { type: String, default: 'Low' },
    },
    rawOutput: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const ScanResultModel = mongoose.model('ScanResult', scanResultSchema);

// ==========================================
// 5. VULNERABILITY FINDING SCHEMA
// ==========================================
const vulnerabilityFindingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    scanSessionId: { type: String, index: true },
    projectId: { type: String, index: true },
    title: { type: String, required: true },
    type: { type: String, default: 'Misconfiguration' },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'informational'],
      default: 'medium',
      index: true,
    },
    cve: { type: String, default: '' },
    target: { type: String, required: true },
    affectedService: { type: String, default: '' },
    port: { type: Number },
    description: { type: String, default: '' },
    evidence: { type: String, default: '' },
    impact: { type: String, default: '' },
    risk: { type: String, default: '' },
    remediation: { type: String, default: '' },
    references: [{ type: String }],
    detectionSource: { type: String, default: 'Pentester AI Scanner' },
    confidenceLevel: {
      type: String,
      enum: ['confirmed', 'potential', 'informational', 'unverified'],
      default: 'confirmed',
    },
    dateDiscovered: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const VulnerabilityFindingModel = mongoose.model('VulnerabilityFinding', vulnerabilityFindingSchema);

// ==========================================
// 6. REPORT SCHEMA
// ==========================================
const reportSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, index: true },
    scanSessionId: { type: String, index: true },
    title: { type: String, required: true },
    executiveSummary: { type: String, default: '' },
    scope: [{ type: String }],
    methodology: { type: String, default: 'Authorized Port Scanning & Security Header Telemetry' },
    findings: [{ type: mongoose.Schema.Types.Mixed }],
    remediationRoadmap: { type: String, default: '' },
    generatedBy: { type: String, default: 'gemini' },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const ReportModel = mongoose.model('Report', reportSchema);

// ==========================================
// 7. AUDIT LOG SCHEMA
// ==========================================
const auditLogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    action: { type: String, required: true },
    target: { type: String },
    details: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const AuditLogModel = mongoose.model('AuditLog', auditLogSchema);

// ==========================================
// 8. CHAT & CONVERSATION SCHEMA (PENTESTER AGENT)
// ==========================================
const messageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, default: '' },
    timestamp: { type: Number, default: Date.now },
    model: { type: String },
    isError: { type: Boolean, default: false },
    scanContextId: { type: String }, // Links chat message to specific scan session
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: 'New Pentest Assessment' },
    createdAt: { type: Number, default: Date.now },
    updatedAt: { type: Number, default: Date.now, index: true },
    model: { type: String, default: 'gemini-2.5-flash' },
    systemPrompt: { type: String },
    messages: [messageSchema],
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const ConversationModel = mongoose.model('Conversation', conversationSchema);

// ==========================================
// DATABASE CONNECTION & STATUS
// ==========================================
let isConnected = false;

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return true;

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Pentester AI Database] MongoDB connected to ${MONGODB_URI}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.warn(`[Pentester AI Database] MongoDB connection warning: ${err.message}`);
    return false;
  }
}

export function getDBStatus() {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || '127.0.0.1',
    name: mongoose.connection.name || 'pentester_ai',
  };
}
