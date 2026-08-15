'use client';

// ============================================================
// MediChain Analytics & Protocol Metrics (/analytics)
// ============================================================
// Ecosystem throughput, inter-hospital data exchange volume,
// security audit health, and performance statistics.
// ============================================================

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Building2,
  Lock,
  Activity,
  Zap,
  Clock,
  Server,
  FileCheck2,
} from 'lucide-react';

import { useMediChainStore } from '../../store/useMediChainStore';

export default function AnalyticsPage() {
  const { metrics } = useMediChainStore();

  const statCards = [
    {
      title: 'Total Anchored Records',
      value: metrics.totalRecords.toLocaleString(),
      change: '+18.4% this month',
      icon: FileCheck2,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      title: 'Whitelisted Hospital Nodes',
      value: metrics.authorizedHospitals.toString(),
      change: 'Active Super Admin Governance',
      icon: Building2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Inter-Hospital Transfers',
      value: metrics.approvedTransfers.toString(),
      change: '100% HIPAA & GDPR Compliant',
      icon: TrendingUp,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
    },
    {
      title: 'Cryptographic Security Score',
      value: `${metrics.securityScore}%`,
      change: 'Zero PHI On-Chain Audit',
      icon: ShieldCheck,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl text-white shadow-xl border border-emerald-800/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Protocol Metrics & Telemetry</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Healthcare Network Analytics
          </h1>
          <p className="text-sm text-teal-100/80 max-w-2xl font-medium">
            Real-time analytics tracking ledger throughput, hospital whitelist participation, cross-contract permission grants, and end-to-end encryption latency.
          </p>
        </div>

        <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Soroban RPC Health</p>
            <p className="text-xs font-extrabold text-emerald-400">100% Operational (5 sec ledger time)</p>
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{card.title}</span>
                <div className={`p-2.5 rounded-2xl border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{card.value}</p>
                <p className="text-[11px] font-semibold text-teal-600 mt-0.5">{card.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inter-Hospital Exchange Volume */}
        <div className="lg:col-span-2 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Inter-Hospital Exchange Volume</h3>
              <p className="text-xs text-slate-500 font-medium">Monthly diagnostic record transfers across whitelisted hospital nodes</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold">
              Testnet Network
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { hospital: 'Apollo Hospitals (Mumbai)', records: 48, pct: '85%' },
              { hospital: 'Fortis Healthcare (Delhi)', records: 36, pct: '65%' },
              { hospital: 'Manipal Hospital (Bengaluru)', records: 28, pct: '50%' },
              { hospital: 'Max Healthcare (Gurugram)', records: 19, pct: '35%' },
            ].map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">{item.hospital}</span>
                  <span className="text-teal-700">{item.records} Transfers</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: item.pct }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Audit Health Panel */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Security Architecture</h3>
                <p className="text-xs text-slate-500 font-medium">Soroban Cryptographic Safeguards</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Zero On-Chain PHI</span>
                <span className="text-emerald-700 font-bold">100% Enforced</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Cross-Contract RBAC Guard</span>
                <span className="text-emerald-700 font-bold">Atomic Verification</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Off-Chain Storage</span>
                <span className="text-teal-700 font-bold">IPFS SHA-256 CIDs</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Contract Upgrade Strategy</span>
                <span className="text-sky-700 font-bold">WASM Hash Governance</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 text-teal-800 text-xs font-medium space-y-1">
            <p className="font-extrabold">Audit Verification Notice</p>
            <p className="text-slate-600 text-[11px]">
              MediChain smart contracts use strict Soroban SDK 21 authentication rules, preventing unauthorized record modification or unapproved access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
