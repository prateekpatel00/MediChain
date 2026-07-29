'use client';

// ============================================================
// MediChain Landing Page
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
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export default function LandingPage() {
  const { wallet, openWalletModal } = useWallet();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Glow backgrounds */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-medium backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Soroban Inter-Contract Architecture · Stellar Testnet</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Decentralized Inter-Hospital <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              Health Exchange Protocol
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed">
            Eliminating siloed patient data while guaranteeing 100% HIPAA compliance. Medical record hashes are anchored on Stellar Soroban smart contracts, while actual files remain encrypted off-chain.
          </p>

          {/* THREE MAIN PORTAL CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4">
            
            <Link
              href="/govt"
              className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-amber-500/50 bg-gradient-to-b from-slate-900 to-slate-950 text-left space-y-3 transition-all group hover:-translate-y-1"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Government Admin</h3>
                <p className="text-xs text-slate-400 mt-1">Whitelist &amp; manage authorized hospital nodes on Registry Contract.</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-400 pt-2">
                <span>Access Portal</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/hospital"
              className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/50 bg-gradient-to-b from-slate-900 to-slate-950 text-left space-y-3 transition-all group hover:-translate-y-1"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Hospital Action Center</h3>
                <p className="text-xs text-slate-400 mt-1">Upload hashes, request &amp; approve inter-hospital access.</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 pt-2">
                <span>Access Action Center</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/transactions"
              className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-emerald-500/50 bg-gradient-to-b from-slate-900 to-slate-950 text-left space-y-3 transition-all group hover:-translate-y-1"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Transaction Center</h3>
                <p className="text-xs text-slate-400 mt-1">Real-time lifecycle activity log with Stellar Expert Explorer links.</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 pt-2">
                <span>View Activity Feed</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

          </div>

          {/* Live Network Status Bar */}
          <div className="pt-4 flex items-center justify-center gap-4 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Stellar Testnet Live
            </span>
            <span>·</span>
            <span className="font-mono text-cyan-400">
              Dual Soroban Contracts (Registry &amp; Core)
            </span>
            <span>·</span>
            <span>
              Wallet:{' '}
              <strong className="text-slate-200">
                {wallet.isConnected ? wallet.walletName || 'Connected' : 'Not Connected'}
              </strong>
            </span>
          </div>

        </div>
      </section>

      {/* FEATURE HIGHLIGHTS */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
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
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
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
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Instant Inter-Hospital Access</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              When a patient relocates (e.g. Bangalore to Jabalpur), hospitals request data on-chain. Data owners approve via wallet signature with full audit logging.
            </p>
            <div className="pt-2 flex items-center gap-1 text-[11px] text-violet-400 font-medium">
              <span>On-Chain Permission Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
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

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 MediChain Protocol. Level 3 Stellar Soroban Smart Contract Ecosystem.</p>
      </footer>
    </div>
  );
}
