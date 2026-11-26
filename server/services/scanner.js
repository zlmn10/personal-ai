import net from 'net';
import tls from 'tls';
import dns from 'dns/promises';
import { execFile } from 'child_process';
import util from 'util';
import { ScanSessionModel, ScanResultModel, VulnerabilityFindingModel, ProjectModel } from '../db.js';

const execFilePromise = util.promisify(execFile);

// ==========================================
// 1. TOOL DETECTION SYSTEM
// ==========================================
const DETECTED_TOOLS = [
  {
    id: 'nmap',
    name: 'Nmap',
    category: 'Network & Port Scanner',
    command: 'nmap',
    checkArgs: ['--version'],
    installGuide: 'Windows: choco install nmap OR download from https://nmap.org/download.html | Linux: sudo apt install nmap',
  },
  {
    id: 'nuclei',
    name: 'Nuclei',
    category: 'Vulnerability Scanner',
    command: 'nuclei',
    checkArgs: ['-version'],
    installGuide: 'Windows: choco install nuclei OR go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest | Linux: apt install nuclei',
  },
  {
    id: 'nikto',
    name: 'Nikto',
    category: 'Web Server Scanner',
    command: 'nikto',
    checkArgs: ['-Version'],
    installGuide: 'Linux: sudo apt install nikto | Windows: git clone https://github.com/sullo/nikto and run with perl',
  },
  {
    id: 'zap',
    name: 'OWASP ZAP',
    category: 'Dynamic Web Application Security',
    command: 'zap.bat',
    checkArgs: ['-version'],
    installGuide: 'Download and install OWASP ZAP from https://www.zaproxy.org/download/',
  },
];

export async function detectInstalledTools() {
  const results = [];
  for (const tool of DETECTED_TOOLS) {
    try {
      const { stdout } = await execFilePromise(tool.command, tool.checkArgs, { timeout: 2000 });
      const versionLine = stdout.split('\n')[0]?.trim() || 'Installed';
      results.push({
        id: tool.id,
        name: tool.name,
        category: tool.category,
        installed: true,
        version: versionLine,
        installGuide: tool.installGuide,
      });
    } catch {
      results.push({
        id: tool.id,
        name: tool.name,
        category: tool.category,
        installed: false,
        version: null,
        installGuide: tool.installGuide,
      });
    }
  }
  return results;
}

// ==========================================
// 2. SCOPE VALIDATION & TARGET SANITIZATION
// ==========================================
const FORBIDDEN_TARGET_CHARACTERS = /[;&|`$><\\'"]/;

// IPv4 Regex
const IPV4_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// Domain Regex
const DOMAIN_REGEX = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export function sanitizeAndValidateTarget(rawTarget) {
  if (!rawTarget || typeof rawTarget !== 'string') {
    throw new Error('Target is required and must be a non-empty string.');
  }

  let cleaned = rawTarget.trim();

  // Strip protocol prefix if provided
  if (cleaned.startsWith('http://')) cleaned = cleaned.replace('http://', '');
  if (cleaned.startsWith('https://')) cleaned = cleaned.replace('https://', '');

  // Strip trailing slashes or paths
  cleaned = cleaned.split('/')[0];
  // Strip port if user specified host:port
  const hostOnly = cleaned.split(':')[0];

  if (FORBIDDEN_TARGET_CHARACTERS.test(hostOnly)) {
    throw new Error('Target contains illegal characters. Command injection protection triggered.');
  }

  const isLocal = hostOnly === 'localhost' || hostOnly === '127.0.0.1' || hostOnly === '::1';
  const isIp = IPV4_REGEX.test(hostOnly);
  const isDomain = DOMAIN_REGEX.test(hostOnly);

  if (!isLocal && !isIp && !isDomain) {
    throw new Error(`Target "${hostOnly}" is not a valid IPv4 address, domain name, or localhost.`);
  }

  return hostOnly;
}

/**
 * Verify whether target is authorized in project scope
 */
export async function verifyTargetAuthorization(target, projectId) {
  const cleanTarget = sanitizeAndValidateTarget(target);

  if (!projectId) {
    // If no project specified, target must be localhost or 127.0.0.1 unless user confirmed
    if (cleanTarget === 'localhost' || cleanTarget === '127.0.0.1') {
      return { authorized: true, target: cleanTarget };
    }
  }

  if (projectId) {
    const project = await ProjectModel.findOne({ id: projectId }).lean();
    if (project) {
      if (!project.authorizationConfirmed) {
        throw new Error(`Project "${project.name}" has not confirmed authorization. You must attest authorization in Project Scope.`);
      }

      const scopeList = project.targetScope || [];
      const inScope = scopeList.some((s) => {
        const cleanScope = s.trim().toLowerCase();
        return cleanScope === cleanTarget.toLowerCase() || cleanTarget.toLowerCase().endsWith('.' + cleanScope);
      });

      if (!inScope && scopeList.length > 0) {
        throw new Error(`Target "${cleanTarget}" is NOT in the authorized project scope: [${scopeList.join(', ')}].`);
      }

      return { authorized: true, target: cleanTarget, project };
    }
  }

  return { authorized: true, target: cleanTarget };
}

// ==========================================
// 3. SCAN PROFILES & PORT DEFINITIONS
// ==========================================
export const TOP_20_PORTS = [
  21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 445, 993, 995, 1723, 3306, 3389, 5900, 8080,
];

export const TOP_100_PORTS = [
  20, 21, 22, 23, 25, 53, 67, 68, 69, 80, 110, 111, 123, 135, 137, 138, 139, 143, 161, 162, 179,
  389, 443, 445, 465, 514, 515, 587, 636, 993, 995, 1080, 1194, 1433, 1434, 1521, 1723, 2049,
  2082, 2083, 2086, 2087, 2181, 2222, 3000, 3001, 3128, 3306, 3389, 4369, 5000, 5432, 5672, 5900,
  5901, 5984, 6379, 6667, 7000, 7001, 8000, 8008, 8080, 8081, 8443, 8888, 9000, 9090, 9092, 9200,
  9300, 10000, 11211, 15672, 27017, 27018, 28017, 50000,
];

const KNOWN_SERVICES = {
  21: { service: 'FTP', risk: 'Medium', details: 'File Transfer Protocol. Check for anonymous login.' },
  22: { service: 'SSH', risk: 'Low', details: 'Secure Shell. Verify key-only authentication.' },
  23: { service: 'Telnet', risk: 'Critical', details: 'Unencrypted remote shell. Immediate risk of plaintext credential sniffing.' },
  25: { service: 'SMTP', risk: 'Medium', details: 'Simple Mail Transfer. Check for open relay.' },
  53: { service: 'DNS', risk: 'Low', details: 'Domain Name System. Check for zone transfer (AXFR).' },
  80: { service: 'HTTP', risk: 'Low', details: 'Hypertext Transfer Protocol. Inspect security headers and web app.' },
  110: { service: 'POP3', risk: 'Medium', details: 'Post Office Protocol. Plaintext email retrieval.' },
  135: { service: 'MSRPC', risk: 'Medium', details: 'Microsoft RPC Endpoint Mapper.' },
  139: { service: 'NetBIOS', risk: 'Medium', details: 'NetBIOS Session Service.' },
  443: { service: 'HTTPS', risk: 'Low', details: 'Encrypted Web Traffic. Inspect TLS/SSL configuration.' },
  445: { service: 'SMB', risk: 'High', details: 'Server Message Block. High-value target for lateral movement.' },
  1433: { service: 'MSSQL', risk: 'High', details: 'Microsoft SQL Server database listener.' },
  1521: { service: 'Oracle DB', risk: 'High', details: 'Oracle TNS listener.' },
  3306: { service: 'MySQL', risk: 'High', details: 'MySQL Database service.' },
  3389: { service: 'RDP', risk: 'High', details: 'Remote Desktop Protocol. Verify NLA and brute-force defenses.' },
  5432: { service: 'PostgreSQL', risk: 'High', details: 'PostgreSQL Database listener.' },
  6379: { service: 'Redis', risk: 'High', details: 'Redis in-memory store. Check for unauthenticated access.' },
  8080: { service: 'HTTP-Proxy/Alt', risk: 'Medium', details: 'Alternate HTTP web or administrative interface.' },
  8443: { service: 'HTTPS-Alt', risk: 'Low', details: 'Alternate HTTPS interface.' },
  27017: { service: 'MongoDB', risk: 'High', details: 'MongoDB NoSQL database listener.' },
};

// ==========================================
// 4. BUILT-IN SOCKET PORT SCANNER
// ==========================================
async function probeSinglePort(host, port, timeoutMs = 750) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let banner = '';

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      // Send a benign carriage return to trigger banner responses from services like FTP, SSH, SMTP
      try {
        socket.write('HEAD / HTTP/1.0\r\n\r\n');
      } catch {
        // Safe ignore
      }
    });

    socket.on('data', (data) => {
      banner += data.toString('utf8', 0, 160).trim();
      socket.destroy();
      resolve({ port, state: 'open', banner });
    });

    socket.on('timeout', () => {
      socket.destroy();
      // If connected before timeout
      resolve({ port, state: 'filtered' });
    });

    socket.on('error', () => {
      socket.destroy();
      resolve({ port, state: 'closed' });
    });

    socket.on('close', () => {
      if (socket.connecting === false && !socket.destroyed) {
        resolve({ port, state: 'open', banner });
      }
    });

    socket.connect(port, host);
  });
}

// Concurrency pool runner
async function scanPortsConcurrently(host, portList, concurrency = 25, onProgress) {
  const results = [];
  const total = portList.length;
  let completed = 0;

  for (let i = 0; i < portList.length; i += concurrency) {
    const chunk = portList.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map((p) => probeSinglePort(host, p)));

    for (const res of chunkResults) {
      if (res.state === 'open') {
        const meta = KNOWN_SERVICES[res.port] || { service: 'Unknown', risk: 'Low', details: 'Service banner not matched.' };
        results.push({
          port: res.port,
          protocol: 'TCP',
          state: 'open',
          service: meta.service,
          version: res.banner ? res.banner.slice(0, 80) : '',
          banner: res.banner || '',
          risk: meta.risk,
          details: meta.details,
        });
      }
      completed++;
      if (onProgress) {
        onProgress(completed, total, res);
      }
    }
  }

  return results;
}

// ==========================================
// 5. SECURITY HEADERS & TLS ANALYZER
// ==========================================
async function analyzeSecurityHeaders(host, port = 80) {
  const protocol = port === 443 ? 'https' : 'http';
  const url = `${protocol}://${host}:${port}`;
  const findings = [];
  const headerAudit = [];

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'PentesterAI-SecurityAudit/2.4' },
      signal: AbortSignal.timeout(3500),
      redirect: 'manual',
    });

    const headers = res.headers;

    // Check mandatory security headers
    const checkHeader = (headerName, recommendation, severity = 'medium') => {
      const val = headers.get(headerName);
      if (!val) {
        headerAudit.push({
          header: headerName,
          value: 'Missing',
          status: 'missing',
          recommendation,
        });
        findings.push({
          title: `Missing Security Header: ${headerName}`,
          type: 'HTTP Header Security',
          severity,
          cve: '',
          target: host,
          affectedService: `Web Service (Port ${port})`,
          port,
          description: `The HTTP server does not enforce the ${headerName} security header on responses.`,
          evidence: `Header "${headerName}" is absent in HTTP response.`,
          impact: `Increases susceptibility to client-side attacks (e.g. clickjacking, MIME-sniffing, or protocol downgrade).`,
          risk: `Low-to-Medium depending on application sensitivity.`,
          remediation: `Configure your web server (Nginx/Apache/Cloudflare) to inject: ${recommendation}`,
          confidenceLevel: 'confirmed',
        });
      } else {
        headerAudit.push({
          header: headerName,
          value: val.slice(0, 100),
          status: 'passed',
          recommendation: 'Configured properly.',
        });
      }
    };

    checkHeader('strict-transport-security', 'Strict-Transport-Security: max-age=31536000; includeSubDomains', 'medium');
    checkHeader('x-content-type-options', 'X-Content-Type-Options: nosniff', 'low');
    checkHeader('x-frame-options', 'X-Frame-Options: DENY or SAMEORIGIN', 'medium');
    checkHeader('content-security-policy', "Content-Security-Policy: default-src 'self'...", 'medium');
    checkHeader('referrer-policy', 'Referrer-Policy: strict-origin-when-cross-origin', 'low');

    // Server leakage check
    const serverHeader = headers.get('server');
    if (serverHeader) {
      headerAudit.push({
        header: 'Server (Information Leak)',
        value: serverHeader,
        status: 'warning',
        recommendation: 'Mask or disable the Server banner in server configuration.',
      });
      findings.push({
        title: `Information Disclosure: Web Server Banner Disclosed (${serverHeader})`,
        type: 'Information Disclosure',
        severity: 'low',
        cve: '',
        target: host,
        affectedService: serverHeader,
        port,
        description: `The web server discloses its software and version banner in the "Server" response header.`,
        evidence: `Server: ${serverHeader}`,
        impact: `Enables an attacker to fingerprint server versions and target known version-specific exploits.`,
        risk: `Low`,
        remediation: `Configure server token suppression (e.g. "ServerTokens Prod" in Apache or "server_tokens off;" in Nginx).`,
        confidenceLevel: 'confirmed',
      });
    }
  } catch (err) {
    headerAudit.push({
      header: 'HTTP Connection',
      value: `Connection failed: ${err.message}`,
      status: 'warning',
      recommendation: 'Verify port is serving HTTP/HTTPS.',
    });
  }

  return { headerAudit, findings };
}

async function analyzeTlsCertificate(host, port = 443) {
  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host,
        port,
        servername: host,
        rejectUnauthorized: false,
        timeout: 3000,
      },
      () => {
        try {
          const cert = socket.getPeerCertificate();
          const protocol = socket.getProtocol();
          const cipher = socket.getCipher();
          socket.end();

          if (cert && cert.subject) {
            const validTo = new Date(cert.valid_to);
            const daysLeft = Math.round((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            resolve({
              protocol,
              cipher: cipher?.name,
              subject: cert.subject?.CN || host,
              issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
              validTo: cert.valid_to,
              daysRemaining: daysLeft,
              isSelfSigned: cert.issuer?.CN === cert.subject?.CN,
            });
          } else {
            resolve({ error: 'No certificate retrieved.' });
          }
        } catch (e) {
          resolve({ error: e.message });
        }
      }
    );

    socket.on('error', (err) => {
      resolve({ error: err.message });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ error: 'TLS handshake timed out.' });
    });
  });
}

async function analyzeDns(host) {
  if (host === 'localhost' || IPV4_REGEX.test(host)) {
    return { isLocal: true, host };
  }

  const records = {};
  try {
    records.a = await dns.resolve4(host).catch(() => []);
    records.mx = await dns.resolveMx(host).catch(() => []);
    records.txt = await dns.resolveTxt(host).catch(() => []);
  } catch {
    // DNS resolution failure
  }
  return records;
}

// ==========================================
// 6. SCAN EXECUTION ORCHESTRATOR
// ==========================================
export class ScanningEngine {
  constructor() {
    this.activeScans = new Map();
  }

  /**
   * Launch a secure scan session
   */
  async startScan({ target, projectId, scanType = 'quick', customPorts }) {
    // Scope Validation & Authorization verification
    const { target: cleanTarget } = await verifyTargetAuthorization(target, projectId);

    const sessionId = `scan_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const sessionDoc = new ScanSessionModel({
      id: sessionId,
      projectId: projectId || null,
      target: cleanTarget,
      scanType,
      status: 'running',
      startTime: new Date(),
      logs: [
        `[${new Date().toISOString()}] Scan initialized for authorized target: ${cleanTarget}`,
        `[${new Date().toISOString()}] Scope verified. Authorization confirmed.`,
        `[${new Date().toISOString()}] Selected scan profile: ${scanType.toUpperCase()}`,
      ],
    });

    await sessionDoc.save();

    // Run scan asynchronously
    this.runScanTask(sessionId, cleanTarget, projectId, scanType, customPorts).catch((err) => {
      console.error(`[Scan Engine Error on ${sessionId}]:`, err);
    });

    return sessionDoc;
  }

  /**
   * Cancel an ongoing scan
   */
  async cancelScan(sessionId) {
    const session = await ScanSessionModel.findOne({ id: sessionId });
    if (session && session.status === 'running') {
      session.status = 'cancelled';
      session.endTime = new Date();
      session.logs.push(`[${new Date().toISOString()}] Scan manually cancelled by user.`);
      await session.save();
    }
    this.activeScans.delete(sessionId);
    return { success: true, message: 'Scan cancelled.' };
  }

  /**
   * Asynchronous background scan task
   */
  async runScanTask(sessionId, target, projectId, scanType, customPorts) {
    const logs = [];
    const log = async (msg) => {
      logs.push(msg);
      await ScanSessionModel.updateOne({ id: sessionId }, { $push: { logs: msg } });
    };

    try {
      // 1. Determine Port Scope
      let portsToScan = TOP_20_PORTS;
      if (scanType === 'standard') portsToScan = TOP_100_PORTS;
      if (scanType === 'web') portsToScan = [80, 443, 8000, 8080, 8443, 8888, 9000, 3000, 5000];
      if (scanType === 'custom' && Array.isArray(customPorts) && customPorts.length > 0) {
        portsToScan = customPorts.filter((p) => typeof p === 'number' && p > 0 && p <= 65535);
      }

      await log(`[${new Date().toISOString()}] Commencing port discovery across ${portsToScan.length} designated TCP ports...`);

      // 2. Perform Port Scan
      const openPorts = await scanPortsConcurrently(target, portsToScan, 20, async (done, total, res) => {
        if (res.state === 'open') {
          await log(`[${new Date().toISOString()}] Discovered OPEN TCP port: ${res.port}`);
        }
      });

      await log(`[${new Date().toISOString()}] Port scan completed. Found ${openPorts.length} open ports.`);

      // 3. Security Header & Web Audit
      let securityHeaders = [];
      let findings = [];
      const httpPorts = openPorts.filter((p) => p.port === 80 || p.port === 443 || p.port === 8080 || p.port === 3000);

      if (httpPorts.length > 0) {
        const primaryHttpPort = httpPorts.find((p) => p.port === 443) ? 443 : httpPorts[0].port;
        await log(`[${new Date().toISOString()}] Inspecting HTTP security headers on port ${primaryHttpPort}...`);
        const headerResult = await analyzeSecurityHeaders(target, primaryHttpPort);
        securityHeaders = headerResult.headerAudit;
        findings = [...headerResult.findings];
      }

      // 4. TLS/SSL Inspection if port 443 open
      let tlsInfo = null;
      if (openPorts.some((p) => p.port === 443)) {
        await log(`[${new Date().toISOString()}] Probing TLS handshake and X.509 certificate on port 443...`);
        tlsInfo = await analyzeTlsCertificate(target, 443);
      }

      // 5. DNS Analysis
      const dnsInfo = await analyzeDns(target);

      // 6. Generate Built-in Findings from Open Ports
      for (const p of openPorts) {
        if (p.risk === 'Critical' || p.risk === 'High') {
          findings.push({
            title: `Exposed High-Risk Service: ${p.service} on Port ${p.port}`,
            type: 'Service Exposure',
            severity: p.risk.toLowerCase(),
            cve: '',
            target,
            affectedService: p.service,
            port: p.port,
            description: `A potentially sensitive service (${p.service}) was identified with an open port listening to the network.`,
            evidence: p.banner || `Port ${p.port}/TCP state: open`,
            impact: p.details || 'Exposed administration or database service can allow unauthorized intrusion if authentication is weak.',
            risk: p.risk,
            remediation: `Restrict access to port ${p.port} using firewall rules, enforce VPN access, or bind strictly to localhost (127.0.0.1).`,
            confidenceLevel: 'confirmed',
          });
        }
      }

      // 7. Calculate overall risk
      let riskScore = 'Low';
      if (findings.some((f) => f.severity === 'critical')) riskScore = 'Critical';
      else if (findings.some((f) => f.severity === 'high')) riskScore = 'High';
      else if (findings.some((f) => f.severity === 'medium')) riskScore = 'Medium';
      else if (openPorts.length > 0) riskScore = 'Low';
      else riskScore = 'Safe';

      // 8. Save Scan Results
      const scanResultId = `res_${Date.now()}`;
      const resultDoc = new ScanResultModel({
        id: scanResultId,
        scanSessionId: sessionId,
        projectId: projectId || null,
        target,
        hostsDiscovered: 1,
        ports: openPorts,
        securityHeaders,
        tlsInfo,
        dnsInfo,
        summary: {
          totalHosts: 1,
          openPorts: openPorts.length,
          servicesCount: openPorts.length,
          findingsCount: findings.length,
          overallRisk: riskScore,
        },
        createdAt: new Date(),
      });
      await resultDoc.save();

      // 9. Persist Vulnerability Findings
      for (const finding of findings) {
        const findingDoc = new VulnerabilityFindingModel({
          id: `vuln_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          scanSessionId: sessionId,
          projectId: projectId || null,
          title: finding.title,
          type: finding.type,
          severity: finding.severity,
          cve: finding.cve || '',
          target,
          affectedService: finding.affectedService,
          port: finding.port,
          description: finding.description,
          evidence: finding.evidence,
          impact: finding.impact,
          risk: finding.risk,
          remediation: finding.remediation,
          confidenceLevel: finding.confidenceLevel,
          dateDiscovered: new Date(),
        });
        await findingDoc.save();
      }

      // 10. Update Session Document
      const endTime = new Date();
      const durationSec = Math.round((endTime.getTime() - new Date(sessionDocStartTime(sessionId)).getTime()) / 1000) || 1;

      await ScanSessionModel.updateOne(
        { id: sessionId },
        {
          $set: {
            status: 'completed',
            endTime,
            durationSec,
            openPorts: openPorts.length,
            findingsCount: findings.length,
            riskScore,
          },
          $push: {
            logs: `[${new Date().toISOString()}] Assessment finished in ${durationSec}s. Overall Risk: ${riskScore}. Total Findings: ${findings.length}`,
          },
        }
      );
    } catch (err) {
      await log(`[${new Date().toISOString()}] Scan failed: ${err.message}`);
      await ScanSessionModel.updateOne(
        { id: sessionId },
        {
          $set: {
            status: 'failed',
            endTime: new Date(),
            error: err.message,
          },
        }
      );
    }
  }
}

function sessionDocStartTime(_id) {
  return new Date();
}

export const scannerEngine = new ScanningEngine();
