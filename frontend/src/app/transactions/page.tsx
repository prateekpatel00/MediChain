'use client';

// ============================================================
// MediChain Transaction Center & Activity Feed (/transactions)
// ============================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  Search,
  Filter,
  Trash2,
  Building2,
  Landmark,
  ShieldAlert,
  Copy,
  Check,
  UserCheck,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../context/TransactionContext';
import type { TransactionItem, TransactionStatus, ContractType } from '../../types/medichain';

export default function TransactionCenterPage() {
  const { user } = useAuth();
  const { transactions, clearTransactions } = useTransactions();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TransactionStatus>('All');
  const [contractFilter, setContractFilter] = useState<'All' | ContractType>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtering Logic
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.caller.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
    const matchesContract = contractFilter === 'All' || tx.contractType === contractFilter;

    return matchesSearch && matchesStatus && matchesContract;
  });

  const totalCount = transactions.length;
  const confirmedCount = transactions.filter((t) => t.status === 'Confirmed').length;
  const registryCount = transactions.filter((t) => t.contractType === 'Registry Contract').length;
  const coreCount = transactions.filter((t) => t.contractType === 'Core Contract').length;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Role Guarding: Require authenticated session
  if (!user.role) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-[#070D1F]">
        <div className="max-w-md space-y-4 glass-panel bg-[#0B132B] p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[#0F172A] border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Authentication Required</h2>
          <p className="text-xs text-slate-400">
            You must log in to view the Transaction Center and real-time Soroban activity log.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all w-full"
          >
            <UserCheck className="w-4 h-4" />
            <span>Go to Portal Login</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070D1F] text-slate-100 font-sans">
      {/* Background glow */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Transaction Center &amp; Activity Feed</h1>
                <p className="text-xs text-slate-400">
                  Real-time Soroban ledger lifecycle tracking: Pending → Processing → Confirmed / Failed
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {transactions.length > 0 && (
              <button
                onClick={clearTransactions}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-rose-500/40 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Activity Log
              </button>
            )}
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel bg-[#0B132B] p-4 rounded-2xl border border-slate-800 space-y-1">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Actions</p>
            <p className="text-2xl font-bold text-white font-mono">{totalCount}</p>
            <p className="text-[10px] text-slate-500">Recorded in workspace</p>
          </div>

          <div className="glass-panel bg-[#0B132B] p-4 rounded-2xl border border-emerald-500/20 space-y-1">
            <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Confirmed</p>
            <p className="text-2xl font-bold text-emerald-300 font-mono">{confirmedCount}</p>
            <p className="text-[10px] text-emerald-400/80">On Stellar Testnet</p>
          </div>

          <div className="glass-panel bg-[#0B132B] p-4 rounded-2xl border border-slate-800 space-y-1">
            <p className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">Registry Operations</p>
            <p className="text-2xl font-bold text-cyan-300 font-mono">{registryCount}</p>
            <p className="text-[10px] text-slate-500">Hospital Whitelist RBAC</p>
          </div>

          <div className="glass-panel bg-[#0B132B] p-4 rounded-2xl border border-slate-800 space-y-1">
            <p className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">Core Operations</p>
            <p className="text-2xl font-bold text-cyan-300 font-mono">{coreCount}</p>
            <p className="text-[10px] text-slate-500">Records &amp; Access Grants</p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="glass-panel bg-[#0B132B] p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Tx Hash, Method, Address, or Patient ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1 hidden sm:block" />
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mr-1 hidden sm:block">Status:</span>
            {(['All', 'Confirmed', 'Processing', 'Pending', 'Failed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                  ${
                    statusFilter === st
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-[#0F172A] border border-slate-800 text-slate-400 hover:text-slate-200'
                  }
                `}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mr-1 hidden sm:block">Contract:</span>
            {(['All', 'Registry Contract', 'Core Contract'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setContractFilter(c)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                  ${
                    contractFilter === c
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-[#0F172A] border border-slate-800 text-slate-400 hover:text-slate-200'
                  }
                `}
              >
                {c === 'All' ? 'All Contracts' : c.replace(' Contract', '')}
              </button>
            ))}
          </div>
        </div>

        {/* TRANSACTIONS TABLE / EMPTY STATE */}
        {filteredTransactions.length === 0 ? (
          <div className="glass-panel bg-[#0B132B] p-12 rounded-3xl border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
              <History className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Awaiting On-Chain Activity...</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No ledger events have been recorded yet. Perform an authorization, upload, or access request in the Govt or Hospital portal to log real Soroban transactions.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href={user.role === 'govt' ? '/govt' : '/hospital'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all"
              >
                <span>Go to {user.role === 'govt' ? 'Government Portal' : 'Hospital Action Center'}</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Desktop Table View */}
            <div className="hidden lg:block glass-panel bg-[#0B132B] rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F172A] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Lifecycle Status</th>
                    <th className="p-4">Contract Involved</th>
                    <th className="p-4">Method &amp; Action Details</th>
                    <th className="p-4">Tx Hash / Explorer</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#0F172A]/50 transition-colors">
                      
                      <td className="p-4">
                        <span
                          className={`
                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border
                            ${
                              tx.status === 'Confirmed'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : tx.status === 'Processing' || tx.status === 'Pending'
                                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }
                          `}
                        >
                          {tx.status === 'Confirmed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {tx.status === 'Processing' && <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />}
                          {tx.status === 'Pending' && <Clock className="w-3 h-3 text-cyan-400" />}
                          {tx.status === 'Failed' && <XCircle className="w-3 h-3 text-rose-400" />}
                          {tx.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg border bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
                            {tx.contractType === 'Registry Contract' ? (
                              <Landmark className="w-3.5 h-3.5" />
                            ) : (
                              <Building2 className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <div>
                            <p className="font-bold text-slate-200">{tx.contractType}</p>
                            <p className="font-mono text-[10px] text-slate-500">{tx.contractId.slice(0, 10)}...</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div>
                          <p className="font-mono text-xs font-bold text-cyan-300">{tx.method}()</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 max-w-md">{tx.details}</p>
                          {tx.error && (
                            <p className="text-[10px] text-rose-400 mt-1 bg-rose-950/40 p-1.5 rounded border border-rose-500/20 font-mono">
                              Error: {tx.error}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="p-4 font-mono text-xs">
                        {tx.hash ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={tx.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-200 underline underline-offset-2 flex items-center gap-1"
                            >
                              <span>{tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <button
                              onClick={() => handleCopy(tx.hash, tx.id)}
                              className="text-slate-500 hover:text-slate-300"
                            >
                              {copiedId === tx.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">Pending Hash...</span>
                        )}
                      </td>

                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(tx.timestamp).toLocaleString()}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden space-y-3">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="glass-panel bg-[#0B132B] p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg border bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
                        {tx.contractType === 'Registry Contract' ? (
                          <Landmark className="w-4 h-4" />
                        ) : (
                          <Building2 className="w-4 h-4" />
                        )}
                      </span>
                      <div>
                        <span className="font-mono text-xs font-bold text-cyan-300">{tx.method}()</span>
                        <p className="text-[10px] text-slate-500 font-mono">{tx.contractType}</p>
                      </div>
                    </div>

                    <span
                      className={`
                        inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border
                        ${
                          tx.status === 'Confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : tx.status === 'Processing' || tx.status === 'Pending'
                            ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }
                      `}
                    >
                      {tx.status === 'Confirmed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      {tx.status === 'Processing' && <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />}
                      {tx.status === 'Pending' && <Clock className="w-3 h-3 text-cyan-400" />}
                      {tx.status === 'Failed' && <XCircle className="w-3 h-3 text-rose-400" />}
                      {tx.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{tx.details}</p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800 gap-2">
                    {tx.hash ? (
                      <a
                        href={tx.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>Tx: {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-600 italic">Pending Hash</span>
                    )}
                    <span className="text-slate-500">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
