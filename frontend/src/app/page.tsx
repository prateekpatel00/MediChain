'use client';

// ============================================================
// MediChain Enterprise SaaS Landing Page
// ============================================================
// Deep Navy Blue theme, clean white typography, teal accents (#00F2FE).
// Features Hero Section, Capabilities, Security & HIPAA Compliance,
// Role Workspaces, and Enterprise SaaS Footer.
// ============================================================

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  Building2,
  Lock,
  ArrowRight,
  Database,
  Share2,
  CheckCircle2,
  Landmark,
  Sparkles,
  ChevronRight,
  History,
  Wallet,
  Zap,
  Globe,
  FileCheck,
  Server,
  Key,
  Layers,
  ArrowUpRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const { wallet, openWalletModal } = useWallet();

  return (
    <div className="min-h-screen flex flex-col bg-[#070D1F] text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Background Glows */}
      <div className="fixed top-0 left-1/3 w-[700px] h-[700px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-0 right-1/3 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ── HERO SECTION ── */}
      <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 overflow-hidden border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Enterprise Inter-Hospital Health Exchange Protocol · Stellar Soroban</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Decentralized Inter-Hospital <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              Medical Data Protocol
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed">
            Eliminating medical record silos across healthcare institutions while guaranteeing 100% HIPAA compliance. Diagnostic report hashes are anchored on Stellar Soroban smart contracts, while actual files remain encrypted off-chain.
          </p>

          {/* HERO CTAS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href={isAuthenticated ? (user.role === 'govt' ? '/govt' : '/hospital') : '/login'}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 group"
            >
              <span>{isAuthenticated ? 'Launch Operational Portal' : 'Enter Enterprise Login'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Platform Architecture</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </a>
          </div>

          {/* NETWORK STATS BADGE */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-2 bg-[#0B132B] px-3.5 py-1.5 rounded-xl border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Stellar Testnet Live
            </span>
            <span className="bg-[#0B132B] px-3.5 py-1.5 rounded-xl border border-slate-800 text-cyan-300">
              Dual Soroban Contracts (Registry &amp; Core)
            </span>
            <span className="bg-[#0B132B] px-3.5 py-1.5 rounded-xl border border-slate-800">
              Wallet:{' '}
              <strong className="text-white">
                {wallet.isConnected ? wallet.walletName || 'Connected' : 'Disconnected'}
              </strong>
            </span>
          </div>

        </div>
      </section>

      {/* ── ENTERPRISE STATS BAR ── */}
      <section className="bg-[#0B132B] border-b border-slate-800/80 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center space-y-1">
            <p className="text-3xl font-extrabold text-white font-mono">0 PHI</p>
            <p className="text-xs text-slate-400">On-Chain Exposure (100% HIPAA)</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl font-extrabold text-cyan-400 font-mono">~2.1s</p>
            <p className="text-xs text-slate-400">Average Soroban Finality</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl font-extrabold text-teal-300 font-mono">256-bit</p>
            <p className="text-xs text-slate-400">Native WebCrypto SHA-256 Hash</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl font-extrabold text-white font-mono">2 WASMs</p>
            <p className="text-xs text-slate-400">Inter-Contract Architecture</p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS / CAPABILITIES ── */}
      <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Core Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Built for High-Trust Enterprise Healthcare
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Combining on-chain Soroban smart contract authorization with off-chain encrypted storage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Capability 1 */}
          <div className="glass-panel bg-[#0B132B] p-8 rounded-3xl border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Government Whitelisting (Registry)</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Ministry of Health Authorities execute <code className="text-cyan-300">add_hospital()</code> on the Registry Contract to maintain a verified list of authorized healthcare institutions.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
              <span>Registry Contract RBAC</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Capability 2 */}
          <div className="glass-panel bg-[#0B132B] p-8 rounded-3xl border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Cryptographic Record Anchoring</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              WebCrypto computes a binary SHA-256 hash for every medical file. Core Contract executes a cross-contract check against Registry before anchoring the CID.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
              <span>SHA-256 WebCrypto Anchoring</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Capability 3 */}
          <div className="glass-panel bg-[#0B132B] p-8 rounded-3xl border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Inter-Hospital Access Control</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Hospitals log inter-institution requests on-chain. Record owners approve or reject access via wallet signatures with real-time auditability.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
              <span>On-Chain Permission Matrix</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

        </div>
      </section>

      {/* ── SECURITY & HIPAA COMPLIANCE ── */}
      <section id="security" className="py-20 px-4 sm:px-6 bg-[#0B132B] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Security Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              HIPAA &amp; Zero-Trust Compliance Standard
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Architected to guarantee medical data privacy while unlocking instant cross-hospital record exchange.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="p-8 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Zero Protected Health Information (PHI) On-Chain</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Raw medical files, patient names, and sensitive health diagnostics are NEVER placed on the Stellar public ledger. Only 256-bit cryptographic file hashes and encrypted IPFS CIDs are anchored.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Atomic Soroban Cross-Contract Validation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Before executing <code className="text-cyan-300">upload_record()</code> or <code className="text-cyan-300">request_access()</code>, the Core Logic Contract invokes an atomic cross-contract query to the Registry Contract to verify the hospital is authorized.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Multi-Wallet Signature Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Integrated with <strong className="text-white">StellarWalletsKit</strong> for Freighter, Albedo, xBull, Hana, and LOBSTR. Every transaction requires valid cryptographic wallet signatures.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Immutable Ledger Audit Trail</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every action (whitelisting, upload, access request, access grant, rejection) emits typed Soroban events and records transaction hashes for complete auditability.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── ROLE WORKSPACES CTA ── */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="glass-panel bg-[#0B132B] p-8 sm:p-12 rounded-3xl border border-slate-800 text-center space-y-8">
          
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Role-Based Access
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Enterprise Workspaces
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Select your organization type to log into the operational dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
            
            <Link
              href="/login"
              className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-cyan-500/50 space-y-3 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Government Authority Portal</h3>
                <p className="text-xs text-slate-400 mt-1">Whitelist hospital nodes, manage RBAC, and monitor ecosystem status.</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 pt-1">
                <span>Enter Admin Login</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/login"
              className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-cyan-500/50 space-y-3 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Hospital Action Center</h3>
                <p className="text-xs text-slate-400 mt-1">Upload hashes, request &amp; approve inter-hospital record access.</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 pt-1">
                <span>Enter Node Login</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

          </div>

        </div>
      </section>

      {/* ── ENTERPRISE FOOTER ── */}
      <footer className="border-t border-slate-800/80 bg-[#0B132B] py-12 px-4 sm:px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">MediChain Protocol</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Decentralized, privacy-preserving inter-hospital patient data exchange protocol powered by Stellar Soroban smart contracts.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-white uppercase text-[11px] tracking-wider">Protocol</p>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link href="/login" className="hover:text-cyan-400">Govt Portal Login</Link></li>
              <li><Link href="/login" className="hover:text-cyan-400">Hospital Portal Login</Link></li>
              <li><Link href="/transactions" className="hover:text-cyan-400">Transaction Center</Link></li>
              <li><a href="#features" className="hover:text-cyan-400">Architecture</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-white uppercase text-[11px] tracking-wider">Security &amp; Network</p>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#security" className="hover:text-cyan-400">HIPAA Compliance</a></li>
              <li><a href="https://stellar.org/soroban" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">Stellar Soroban v21</a></li>
              <li><a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">Stellar Expert Explorer</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px]">
          <p>© 2026 MediChain Protocol. All rights reserved.</p>
          <p>
            Architected &amp; Built by{' '}
            <a
              href="https://github.com/prateekpatel00"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline font-bold"
            >
              Prateek Patel (@prateekpatel00)
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
