export const DEFAULT_USER_NAME = "Muhammad Salman A.";

export const DEFAULT_SYSTEM_PROMPT = `You are Pentester AI Agent, an elite automated cybersecurity research and penetration testing assistant for Muhammad Salman A.
Your primary directives:
- Provide advanced, highly technical guidance strictly on authorized cybersecurity assessments, penetration testing methodologies, network enumeration, OWASP Top 10, security architecture, and vulnerability remediation.
- Explain technical concepts step by step with precise CLI commands (Nmap, Burp Suite, Metasploit, Kali Linux, curl, OpenSSL).
- Thoroughly analyze scan outputs, open ports, service banners, and HTTP security headers, identifying potential vulnerabilities, threat impact, CVE references, and hardened remediation configurations.
- Help prepare professional penetration testing executive summaries and technical vulnerability reports.
- Support hands-on lab recommendations (HackTheBox, TryHackMe, VulnHub) and interview preparation for Senior Penetration Tester and SOC Analyst roles.
- For casual greetings (e.g. "hai", "hello", "hi", "hey"), reply with a brief, friendly 1-2 sentence cybersecurity status check and ask what authorized target, lab exercise, or audit task we are tackling today.`;

export type { PersonaPreset } from '../types/persona';

export interface PromptStarter {
  title: string;
  category: string;
  prompt: string;
  icon: string;
}

export const CYBERSECURITY_PROMPT_STARTERS: PromptStarter[] = [
  {
    title: "OWASP Top 10 Vulnerability Deep-Dive",
    category: "Web Application Security",
    prompt: "Can you provide a deep-dive analysis of Broken Object Level Authorization (BOLA) and Broken Object Property Level Authorization (BOPLA)? Include detection methodologies, vulnerable API code snippets, and remediation strategies.",
    icon: "ShieldAlert",
  },
  {
    title: "Port & Service Risk Triage",
    category: "Network Reconnaissance",
    prompt: "I have discovered ports 22 (OpenSSH 8.2), 445 (SMB), 3306 (MySQL), and 8080 (Apache Tomcat) open on an authorized lab machine. What is the systematic security review checklist and prioritized attack surface evaluation?",
    icon: "Terminal",
  },
  {
    title: "Active Directory Kerberoasting Defense",
    category: "Internal Pentesting",
    prompt: "Explain how Kerberoasting works step by step in an authorized lab environment. What are the SPN prerequisites, how do analysts detect it with Sigma rules or Event ID 4769, and what are the specific Active Directory mitigation controls?",
    icon: "Shield",
  },
  {
    title: "Cloud IAM Privilege Escalation Audit",
    category: "Cloud Security",
    prompt: "Guide me through auditing an AWS environment for IAM privilege escalation paths (e.g. iam:CreatePolicyVersion, iam:SetDefaultPolicyVersion) and IMDSv1 vs IMDSv2 metadata access. Provide specific AWS CLI commands and mitigation checklists.",
    icon: "CloudShield",
  },
  {
    title: "HTTP Security Headers Hardening",
    category: "Web Hardening",
    prompt: "Generate a production-ready Nginx configuration enforcing Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), X-Frame-Options, and server token suppression with explanations for each header.",
    icon: "FileCheck",
  },
  {
    title: "Penetration Testing Executive Report",
    category: "Reporting & Compliance",
    prompt: "Help me structure an executive summary and risk matrix for a comprehensive penetration test report. What are the key metrics that CISOs and technical remediation teams need to see?",
    icon: "GraduationCap",
  },
];
