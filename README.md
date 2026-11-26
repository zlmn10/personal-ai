# personal-ai

# Pentester AI Agent

**Pentester AI Agent** is a full-stack, enterprise-grade cybersecurity assistant and automated penetration testing platform featuring a modern glassmorphic interface. Powered by the **Google Gemini API** and multi-model AI gateways, it integrates high-throughput network reconnaissance, vulnerability management, and AI-driven executive report synthesis.

Designed for authorized security assessments, CTFs, and defensive hardening.

---

## ⚡ Core Capabilities

- **Google Gemini API & AI Gateways:**
  - Built-in provider abstraction layer supporting Google Gemini (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-1.5-flash`, `gemini-1.5-pro`) and OpenAI-compatible multi-model gateways (Experiential Labs).
  - Real-time Server-Sent Events (SSE) streaming with sub-second token delivery.
  - Hardware & token speed telemetry tracking.

- **High-Throughput Security Scanner:**
  - **Native Socket Engine:** Built-in concurrent Node.js socket scanner for Top 20, Top 100, and custom port sweeps with zero external dependencies.
  - **HTTP Security Header Auditor:** Automated checks for CSP, HSTS, X-Frame-Options, CORS, Permissions-Policy, and server banner leaks.
  - **TLS/SSL Cipher Inspector:** Certificate expiration monitoring, TLS version validation, and self-signed certificate detection.
  - **External Tool Orchestration:** Automatically detects and safely orchestrates installed host tools (`nmap`, `nuclei`, `nikto`, `zap`).

- **Target Scope & Legal Compliance:**
  - Engagement project manager with domain, IP, and CIDR scope boundaries.
  - Explicit written authorization verification gate before scanning external targets.

- **Vulnerability Management & CVE Correlation:**
  - Track vulnerabilities by severity: Critical, High, Medium, Low, and Informational.
  - Complete evidence inspect drawer with raw terminal snippets, payload proofs, and copyable bash/Kali remediation commands.
  - One-click "Analyze with Gemini AI" for remediation playbooks.

- **Penetration Test Reporting:**
  - Executive summaries, methodology statements, and prioritized remediation roadmaps.
  - Instant export to GitHub-flavored Markdown (`.md`).

- **Enterprise Security & Storage:**
  - **MongoDB Database:** Persists scan sessions, findings, reports, and scope definitions at `mongodb://127.0.0.1:27017/pentester_ai`.
  - **AES-256-GCM Encryption:** All stored API keys are encrypted at rest and never exposed to client browsers or frontend bundles.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v20+ or v24+
- **MongoDB** running locally on port `27017`

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/zlmn10/personal-ai.git
cd personal-ai

# Install dependencies
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
```

Configure your environment variables in `.env`:
```env
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/pentester_ai
MONGODB_DB_NAME=pentester_ai
AI_PROVIDER=gemini
ENCRYPTION_KEY=e4d2a1b9c8e7f6a5b4c3d2e1f0a9b8c7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1
```

### 4. Running the Application
```bash
# Start backend server
node server/index.js

# Start frontend dev server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🛡️ License & Legal Disclaimer

This tool is strictly intended for **authorized penetration testing, educational security research, and defensive infrastructure auditing**. Unauthorized scanning, exploitation, or attacking of systems without explicit written consent is illegal.
