'use client';

// ============================================================
// MediChain Enterprise SaaS Landing Page (Shielded Pulse Identity)
// ============================================================

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  Activity,
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
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const { wallet, openWalletModal } = useWallet();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-teal-500/20 selection:text-teal-900">
      
      {/* ── HERO SECTION ── */}
      <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC]">
        <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
          
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Enterprise Inter-Hospital Health Exchange Protocol · Powered by Stellar Soroban</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Decentralized Inter-Hospital <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600">
              Medical Data Protocol
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed font-medium">
            Eliminating medical record silos across healthcare institutions while guaranteeing 100% HIPAA compliance. Diagnostic report hashes are anchored on Stellar Soroban smart contracts, while actual files remain encrypted off-chain.
          </p>

          {/* HERO CTAS (Glowing Mint-to-Teal Gradient Buttons) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href={isAuthenticated ? (user.role === 'govt' ? '/govt' : '/hospital') : '/login'}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-teal-500/25 transition-all hover:shadow-teal-500/35 hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
            >
              <span>{isAuthenticated ? 'Launch Operational Workspace' : 'Enter Enterprise Login'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm shadow-md shadow-slate-200/50 transition-all flex items-center justify-center gap-2"
            >
              <span>Platform Architecture</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {/* NETWORK STATS BADGE */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-600 font-mono font-semibold">
            <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Stellar Testnet Live
            </span>
            <span className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-teal-700">
              Dual Soroban WASMs (Registry &amp; Core)
            </span>
            <span className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              Wallet:{' '}
              <strong className="text-slate-900">
                {wallet.isConnected ? wallet.walletName || 'Connected' : 'Disconnected'}
              </strong>
            </span>
          </div>

        </div>
      </section>

      {/* ── ENTERPRISE STATS BAR (3D FLOATING) ── */}
      <section className="bg-white border-b border-slate-200/80 py-12 px-4 sm:px-6 shadow-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center space-y-1 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 shadow-sm">
            <p className="text-3xl font-extrabold text-slate-900 font-mono">0 PHI</p>
            <p className="text-xs text-slate-500 font-medium">On-Chain Exposure (100% HIPAA)</p>
          </div>
          <div className="text-center space-y-1 p-4 rounded-2xl bg-teal-50/40 border border-teal-100 shadow-sm">
            <p className="text-3xl font-extrabold text-teal-700 font-mono">~2.1s</p>
            <p className="text-xs text-slate-500 font-medium">Average Soroban Finality</p>
          </div>
          <div className="text-center space-y-1 p-4 rounded-2xl bg-cyan-50/40 border border-cyan-100 shadow-sm">
            <p className="text-3xl font-extrabold text-cyan-700 font-mono">256-bit</p>
            <p className="text-xs text-slate-500 font-medium">Native WebCrypto SHA-256 Hash</p>
          </div>
          <div className="text-center space-y-1 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 shadow-sm">
            <p className="text-3xl font-extrabold text-slate-900 font-mono">2 WASMs</p>
            <p className="text-xs text-slate-500 font-medium">Inter-Contract Architecture</p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS / CAPABILITIES ── */}
      <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
            Core Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for High-Trust Enterprise Healthcare
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-medium">
            Combining on-chain Soroban smart contract authorization with off-chain encrypted storage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Capability 1 */}
          <div className="saas-card-3d p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Government Whitelisting (Registry)</h3>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              Ministry of Health Authorities execute <code className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-bold">add_hospital()</code> on the Registry Contract to maintain a verified list of authorized healthcare institutions.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-teal-600 font-bold">
              <span>Registry Contract RBAC</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Capability 2 */}
          <div className="saas-card-3d p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Cryptographic Record Anchoring</h3>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              WebCrypto computes a binary SHA-256 hash for every medical file. Core Contract executes a cross-contract check against Registry before anchoring the CID.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-teal-600 font-bold">
              <span>SHA-256 WebCrypto Anchoring</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Capability 3 */}
          <div className="saas-card-3d p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Inter-Hospital Access Control</h3>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              Hospitals log inter-institution requests on-chain. Record owners approve or reject access via wallet signatures with real-time auditability.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-teal-600 font-bold">
              <span>On-Chain Permission Matrix</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

        </div>
      </section>

      {/* ── SECURITY & HIPAA COMPLIANCE ── */}
      <section id="security" className="py-20 px-4 sm:px-6 bg-white border-y border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
              Security Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              HIPAA &amp; Zero-Trust Compliance Standard
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-medium">
              Architected to guarantee medical data privacy while unlocking instant cross-hospital record exchange.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Zero Protected Health Information (PHI) On-Chain</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Raw medical files, patient names, and sensitive health diagnostics are NEVER placed on the Stellar public ledger. Only 256-bit cryptographic file hashes and encrypted IPFS CIDs are anchored.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Atomic Soroban Cross-Contract Validation</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Before executing <code className="text-teal-700 bg-teal-100 px-1 py-0.5 rounded font-bold">upload_record()</code> or <code className="text-teal-700 bg-teal-100 px-1 py-0.5 rounded font-bold">request_access()</code>, the Core Logic Contract invokes an atomic cross-contract query to the Registry Contract to verify the hospital is authorized.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Multi-Wallet Signature Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Integrated with <strong className="text-slate-900">StellarWalletsKit</strong> for Freighter, Albedo, xBull, Hana, and LOBSTR. Every transaction requires valid cryptographic wallet signatures.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Immutable Ledger Audit Trail</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Every action (whitelisting, upload, access request, access grant, rejection) emits typed Soroban events and records transaction hashes for complete auditability.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── ROLE WORKSPACES CTA ── */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/80 text-center space-y-8">
          
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
              Role-Based Access
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Operational Workspaces
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-medium">
              Select your organization type to log into the operational dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
            
            <Link
              href="/login"
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-400 space-y-3 transition-all group shadow-sm hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Government Authority Portal</h3>
                <p className="text-xs text-slate-600 mt-1 font-medium">Whitelist hospital nodes, manage RBAC, and monitor ecosystem status.</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-teal-600 pt-1">
                <span>Enter Admin Login</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/login"
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-400 space-y-3 transition-all group shadow-sm hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Hospital Action Center</h3>
                <p className="text-xs text-slate-600 mt-1 font-medium">Upload hashes, request &amp; approve inter-hospital record access.</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-teal-600 pt-1">
                <span>Enter Node Login</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

          </div>

        </div>
      </section>

      {/* ── ENTERPRISE FOOTER ── */}
      <footer className="border-t border-slate-200/80 bg-white py-12 px-4 sm:px-6 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-600 p-0.5 shadow-md shadow-teal-500/20">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center relative">
                  <Shield className="w-4 h-4 text-teal-600" />
                  <Activity className="w-2.5 h-2.5 text-emerald-500 absolute top-0.5 right-0.5 stroke-[2.5]" />
                </div>
              </div>
              <span className="font-extrabold text-slate-900 text-base">MediChain Protocol</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm font-medium">
              Decentralized, privacy-preserving inter-hospital patient data exchange protocol powered by Stellar Soroban smart contracts.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">Protocol</p>
            <ul className="space-y-1.5 text-slate-600 font-medium">
              <li><Link href="/login" className="hover:text-teal-600">Govt Portal Login</Link></li>
              <li><Link href="/login" className="hover:text-teal-600">Hospital Portal Login</Link></li>
              <li><Link href="/transactions" className="hover:text-teal-600">Transaction Center</Link></li>
              <li><a href="#features" className="hover:text-teal-600">Architecture</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">Security &amp; Network</p>
            <ul className="space-y-1.5 text-slate-600 font-medium">
              <li><a href="#security" className="hover:text-teal-600">HIPAA Compliance</a></li>
              <li><a href="https://stellar.org/soroban" target="_blank" rel="noopener noreferrer" className="hover:text-teal-600">Stellar Soroban v21</a></li>
              <li><a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noopener noreferrer" className="hover:text-teal-600">Stellar Expert Explorer</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px]">
          <p>© 2026 MediChain Protocol. All rights reserved.</p>
          <p>
            Architected &amp; Built by{' '}
            <a
              href="https://github.com/prateekpatel00"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:underline font-bold"
            >
              Prateek Patel (@prateekpatel00)
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
