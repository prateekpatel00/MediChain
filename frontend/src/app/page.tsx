'use client';

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
  FileCheck,
  Zap,
  Globe2,
  Landmark,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Activity,
  HeartPulse,
  Stethoscope,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Glow backgrounds */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* HEADER */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-400 p-px shadow-lg shadow-cyan-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-400">
                  MediChain
                </h1>
                <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
                  Stellar Soroban
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Inter-Hospital Health Exchange Protocol</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/govt"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition-all"
            >
              <Landmark className="w-4 h-4 text-amber-400" />
              Govt Admin Portal
            </Link>
            <Link
              href="/hospital"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Building2 className="w-4 h-4" />
              Launch Hospital App
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-medium backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>3-Tier RBAC Architecture · Live on Stellar Testnet</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Decentralized Inter-Hospital <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              Health Exchange Protocol
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base md:text-lg leading-relaxed">
            Eliminating siloed patient data while guaranteeing 100% HIPAA compliance. Medical record hashes are anchored on Stellar Soroban smart contracts, while actual files remain encrypted off-chain.
          </p>

          {/* TWO CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/govt"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-3 group"
            >
              <Landmark className="w-5 h-5 text-slate-950" />
              <span>Login as Government Authority</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/hospital"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-3 group"
            >
              <Building2 className="w-5 h-5 text-slate-950" />
              <span>Login as Healthcare Institution</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Live Network Pill */}
          <div className="pt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Stellar Testnet Live
            </span>
            <span>·</span>
            <span className="font-mono text-cyan-400">
              Soroban Smart Contract
            </span>
          </div>

        </div>
      </section>

      {/* FEATURE HIGHLIGHTS */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Protocol Architecture
          </h2>
          <p className="text-2xl md:text-3xl font-extrabold text-white">
            Built for Privacy, Security, &amp; Compliance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4 glass-panel-hover">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Immutable Record Anchoring</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Every medical file upload generates a native WebCrypto SHA-256 binary hash. Only this cryptographic proof is stored on Soroban, making records tamper-proof.
            </p>
            <div className="pt-2 flex items-center gap-1 text-[11px] text-cyan-400 font-medium">
              <span>SHA-256 WebCrypto</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4 glass-panel-hover">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Instant Inter-Hospital Access</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              When a patient relocates (e.g. Bangalore to Jabalpur), hospitals request data on-chain. Data owners approve via Freighter wallet with full audit logging.
            </p>
            <div className="pt-2 flex items-center gap-1 text-[11px] text-violet-400 font-medium">
              <span>On-Chain Permission Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4 glass-panel-hover">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">100% Privacy &amp; HIPAA First</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Zero Protected Health Information (PHI) is stored on the public blockchain. Actual diagnostic reports and PDFs remain encrypted off-chain on IPFS.
            </p>
            <div className="pt-2 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span>Zero PHI On-Chain</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* 3-TIER RBAC ECOSYSTEM BANNER */}
      <section className="py-12 px-6 max-w-7xl mx-auto w-full">
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-950 to-slate-900/90 space-y-8">
          
          <div className="text-center space-y-2">
            <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
              Governed Ecosystem
            </span>
            <h3 className="text-2xl font-bold text-white">3-Tier Governed Role-Based Access Control</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Landmark className="w-4 h-4" />
                <span>Tier 1: Government Authority</span>
              </div>
              <p className="text-slate-400">
                Super Admin registers hospital wallets on-chain and grants publishing rights via <code className="text-amber-300">grant_hospital_rights()</code>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Building2 className="w-4 h-4" />
                <span>Tier 2: Authorized Hospitals</span>
              </div>
              <p className="text-slate-400">
                Authorized institutions upload hashed patient files and approve or reject access requests from other hospitals.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-violet-500/30 space-y-2">
              <div className="flex items-center gap-2 text-violet-400 font-bold">
                <Stethoscope className="w-4 h-4" />
                <span>Tier 3: Clinical Care Providers</span>
              </div>
              <p className="text-slate-400">
                Doctors view authorized patient data &amp; retrieve encrypted IPFS medical reports upon contract verification.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-500" />
            <span className="font-semibold text-slate-300">MediChain Protocol</span>
            <span>·</span>
            <span>Stellar Soroban Smart Contracts</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/govt" className="hover:text-amber-300 transition-colors">Govt Portal</Link>
            <Link href="/hospital" className="hover:text-cyan-300 transition-colors">Hospital Portal</Link>
            <a
              href="https://stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              Stellar.org <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
