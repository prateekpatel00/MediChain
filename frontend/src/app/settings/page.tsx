'use client';

// ============================================================
// MediChain Settings & Security Page (/settings)
// ============================================================

import React from 'react';
import Link from 'next/link';
import {
  Settings,
  Shield,
  Key,
  Server,
  Globe,
  CheckCircle2,
  Lock,
  UserCheck,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { REGISTRY_CONTRACT_ID, CORE_CONTRACT_ID } from '../../services/stellar';

export default function SettingsPage() {
  const { user } = useAuth();
  const { wallet } = useWallet();

  // Role Guarding: Require authenticated session
  if (!user.role) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-[#F8FAFC]">
        <div className="max-w-md space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/80">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mx-auto">
            <Settings className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Authentication Required</h2>
          <p className="text-xs text-slate-600 font-medium">
            Please log in to manage node parameters and security settings.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-lg shadow-slate-900/10 transition-all w-full"
          >
            <UserCheck className="w-4 h-4" />
            <span>Go to Portal Login</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans md:ml-64">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Settings &amp; Node Security</h1>
              <p className="text-xs text-slate-500 font-medium">
                Manage RPC endpoints, contract addresses, cryptographic keys, and session parameters
              </p>
            </div>
          </div>
        </div>

        {/* NETWORK & CONTRACT PARAMETERS */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-teal-600" />
              Stellar Testnet &amp; Soroban RPC Configuration
            </h2>
            <p className="text-xs text-slate-500 font-medium">Environment variables injected into Next.js workspace</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Soroban RPC URL</p>
              <p className="font-mono text-teal-800 font-semibold">https://soroban-testnet.stellar.org</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Network Passphrase</p>
              <p className="font-mono text-slate-900 font-semibold">Test SDF Network ; September 2015</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Registry Contract ID</p>
              <p className="font-mono text-teal-800 font-semibold break-all">{REGISTRY_CONTRACT_ID}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Core Logic Contract ID</p>
              <p className="font-mono text-teal-800 font-semibold break-all">{CORE_CONTRACT_ID}</p>
            </div>
          </div>
        </div>

        {/* WALLET SESSION KEYS */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-teal-600" />
              Cryptographic Wallet Session
            </h2>
            <p className="text-xs text-slate-500 font-medium">Active wallet provider and authorization details</p>
          </div>

          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-emerald-950 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-extrabold text-slate-900">
                  {wallet.isConnected ? `Connected via ${wallet.walletName}` : 'No Wallet Connected'}
                </p>
                <p className="font-mono text-[11px] text-emerald-800 mt-0.5">
                  {wallet.address || 'Click "Connect Wallet" in top bar'}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 bg-emerald-200/80 text-emerald-800 rounded-full font-bold text-[10px] uppercase">
              {wallet.isConnected ? 'Active Session' : 'Standby'}
            </span>
          </div>
        </div>

      </main>
    </div>
  );
}
