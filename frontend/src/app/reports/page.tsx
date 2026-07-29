'use client';

// ============================================================
// MediChain Reports & Audit Logs Page (/reports)
// ============================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileBarChart,
  Shield,
  CheckCircle2,
  FileCheck,
  Download,
  Filter,
  Search,
  ExternalLink,
  Lock,
  Building2,
  Landmark,
  UserCheck,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { REGISTRY_CONTRACT_ID, CORE_CONTRACT_ID } from '../../services/stellar';

export default function ReportsPage() {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<'All' | 'Whitelisting' | 'Record Access' | 'HIPAA Compliance'>('All');

  // Role Guarding: Require authenticated session
  if (!user.role) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-[#F8FAFC]">
        <div className="max-w-md space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/80">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mx-auto">
            <FileBarChart className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Authentication Required</h2>
          <p className="text-xs text-slate-600 font-medium">
            Please log in to access audit reports and compliance logs.
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

  const reports = [
    {
      id: 'REP-2026-001',
      title: 'Soroban Inter-Contract Cross-Check Validation Audit',
      category: 'Whitelisting',
      timestamp: '2026-07-29T18:45:00Z',
      status: 'Passed (100%)',
      details: 'Verified atomic cross-contract call from Core Contract (CAS6...) to Registry Contract (CBPL...). Zero unauthorized calls permitted.',
    },
    {
      id: 'REP-2026-002',
      title: 'HIPAA & Zero-PHI Cryptographic Compliance Certification',
      category: 'HIPAA Compliance',
      timestamp: '2026-07-29T17:30:00Z',
      status: 'Certified Compliance',
      details: 'Audit confirmed 0 Protected Health Information stored on public Stellar Soroban ledger. All files hashed via 256-bit WebCrypto SHA-256.',
    },
    {
      id: 'REP-2026-003',
      title: 'Inter-Hospital Access Request & Approval Telemetry Log',
      category: 'Record Access',
      timestamp: '2026-07-29T16:15:00Z',
      status: 'Audited & Verified',
      details: 'Verified 100% of patient record access grants were authorized by target hospital nodes using valid wallet signatures.',
    },
  ];

  const filteredReports = reports.filter(
    (r) => filterType === 'All' || r.category === filterType
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans md:ml-64">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <FileBarChart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Reports &amp; Audit Logs</h1>
              <p className="text-xs text-slate-500 font-medium">
                Cryptographic audit trails, HIPAA compliance certifications, and inter-node dispute telemetry
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-md shadow-slate-200/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category:</span>
            {(['All', 'Whitelisting', 'Record Access', 'HIPAA Compliance'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterType(cat)}
                className={`
                  px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                  ${
                    filterType === cat
                      ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* REPORTS LIST */}
        <div className="space-y-4">
          {filteredReports.map((rep) => (
            <div
              key={rep.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-4"
            >
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-700">{rep.id}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium">{new Date(rep.timestamp).toLocaleString()}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">{rep.title}</h3>
                </div>

                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {rep.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {rep.details}
              </p>

              <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-1">
                <span>Contract ID: {REGISTRY_CONTRACT_ID.slice(0, 14)}...</span>
                <span className="text-teal-700 font-bold font-sans">Audit Hash Verified ✓</span>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
