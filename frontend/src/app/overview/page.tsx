'use client';

// ============================================================
// MediChain Role-Based Dashboard Overview Page (/overview)
// ============================================================

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Building2,
  Landmark,
  Shield,
  Activity,
  CheckCircle2,
  Lock,
  Database,
  Share2,
  ArrowRight,
  TrendingUp,
  Server,
  Zap,
  Clock,
  ExternalLink,
  FileCheck,
  UserCheck,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { Logo } from '../../components/Logo';
import { REGISTRY_CONTRACT_ID, CORE_CONTRACT_ID } from '../../services/stellar';

export default function OverviewPage() {
  const { user } = useAuth();
  const { wallet } = useWallet();

  // Role Guarding: Require authenticated session
  if (!user.role) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-[#F8FAFC]">
        <div className="max-w-md space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/80 flex flex-col items-center">
          <Logo size="lg" href="/overview" showBadge badgeText="Overview" />
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mt-2">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Authentication Required</h2>
          <p className="text-xs text-slate-600 font-medium">
            Please sign in to access your role-specific dashboard overview.
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

  const isGovt = user.role === 'govt';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans md:ml-64">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 p-0.5 shadow-lg shadow-teal-500/20">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-teal-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {isGovt ? 'Government Ministry Overview' : 'Hospital Operations Overview'}
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200/80 rounded-full">
                  {isGovt ? 'Super Admin Workspace' : 'Healthcare Node Workspace'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {isGovt
                  ? 'Ecosystem health, authorized hospital node status, and Registry WASM metrics.'
                  : 'On-chain patient record metrics, active access grants, and node operation stats.'}
              </p>
            </div>
          </div>

          <Link
            href={isGovt ? '/govt' : '/hospital'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-extrabold text-xs shadow-md transition-all"
          >
            <span>{isGovt ? 'Manage Whitelist Registry' : 'Open Hospital Action Center'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* GOVT OVERVIEW DASHBOARD */}
        {isGovt ? (
          <div className="space-y-8">
            
            {/* STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-2">
                <div className="flex items-center justify-between text-teal-600">
                  <Building2 className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    Verified
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 font-mono">14 Active</p>
                <p className="text-xs text-slate-500 font-medium">Whitelisted Healthcare Nodes</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-2">
                <div className="flex items-center justify-between text-teal-600">
                  <Landmark className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                    Live WASM
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 font-mono">Registry v21</p>
                <p className="text-xs text-slate-500 font-medium">Super Admin RBAC Active</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-2">
                <div className="flex items-center justify-between text-teal-600">
                  <Shield className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    100% HIPAA
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 font-mono">0 PHI</p>
                <p className="text-xs text-slate-500 font-medium">Zero Private Health Data On-Chain</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-2">
                <div className="flex items-center justify-between text-teal-600">
                  <Server className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    Testnet
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 font-mono">~2.1s</p>
                <p className="text-xs text-slate-500 font-medium">Stellar Soroban Consensus</p>
              </div>
            </div>

            {/* CONTRACT DETAILS & ECOSYSTEM HEALTH */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-teal-600" />
                    Government Registry Smart Contract Parameters
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">Direct on-chain contract state and owner identity</p>
                </div>

                <div className="space-y-4 text-xs font-medium">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Registry Contract ID</p>
                    <p className="font-mono text-teal-800 font-semibold break-all text-xs">{REGISTRY_CONTRACT_ID}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Super Admin Owner Address</p>
                    <p className="font-mono text-slate-900 font-semibold break-all text-xs">
                      {wallet.address || 'GCVGEHLD34OAWVIQYWYNLEU2YFOXINO4FEXLGPV6DBHFIFDQFCWQJDI5'}
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-emerald-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold">Registry Initialization Status:</span>
                    </div>
                    <span className="font-mono font-extrabold text-xs text-emerald-800">INITIALIZED &amp; LINKED</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-600" />
                    Quick Actions
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">Manage registry, audit logs, and parameters</p>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/govt"
                    className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs">Whitelist Hospital Node</p>
                        <p className="text-[10px] text-slate-500 font-medium">Execute add_hospital() on Soroban</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/reports"
                    className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs">Reports &amp; Audit Logs</p>
                        <p className="text-[10px] text-slate-500 font-medium">View disputes and event telemetry</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/settings"
                    className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs">Settings &amp; Security</p>
                        <p className="text-[10px] text-slate-500 font-medium">RPC URL &amp; contract keys</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* HOSPITAL OVERVIEW DASHBOARD */
          <div className="space-y-8">
            
            {/* STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-2">
                <div className="flex items-center justify-between text-teal-600">
                  <Database className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    On-Chain
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 font-mono">12 Records</p>
                <p className="text-xs text-slate-500 font-medium">Uploaded by Node</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-2">
                <div className="flex items-center justify-between text-teal-600">
                  <Share2 className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                    Queue
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 font-mono">2 Pending</p>
                <p className="text-xs text-slate-500 font-medium">Inter-Hospital Access Requests</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-2">
                <div className="flex items-center justify-between text-teal-600">
                  <FileCheck className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    Approved
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 font-mono">5 Grants</p>
                <p className="text-xs text-slate-500 font-medium">Active Access Permissions</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-2">
                <div className="flex items-center justify-between text-teal-600">
                  <Lock className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    SHA-256
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 font-mono">256-bit</p>
                <p className="text-xs text-slate-500 font-medium">WebCrypto File Hashing</p>
              </div>
            </div>

            {/* QUICK ACTIONS & CORE CONTRACT PARAMS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-teal-600" />
                    Core Logic Smart Contract Connection
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">Live contract IDs and cross-contract validation parameters</p>
                </div>

                <div className="space-y-4 text-xs font-medium">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Core Logic Contract ID</p>
                    <p className="font-mono text-teal-800 font-semibold break-all text-xs">{CORE_CONTRACT_ID}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Linked Registry Contract ID</p>
                    <p className="font-mono text-slate-900 font-semibold break-all text-xs">{REGISTRY_CONTRACT_ID}</p>
                  </div>

                  <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-emerald-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold">Cross-Contract Whitelist Check:</span>
                    </div>
                    <span className="font-mono font-extrabold text-xs text-emerald-800">ENFORCED AT EXECUTION</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-600" />
                    Node Workflows
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">Manage records, requests, and transactions</p>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/hospital"
                    className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs">Upload &amp; Hash Medical Report</p>
                        <p className="text-[10px] text-slate-500 font-medium">Commit SHA-256 hash on-chain</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/transactions"
                    className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs">Node Activity Log</p>
                        <p className="text-[10px] text-slate-500 font-medium">Track node on-chain transactions</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
