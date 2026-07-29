'use client';

// ============================================================
// MediChain Transaction Center & Activity Feed (/transactions)
// ============================================================
// Role-isolated transaction feed: Hospital nodes view ONLY node-scoped transactions,
// while Government Super Admin views government registry actions.
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
import { useWallet } from '../../context/WalletContext';
import { useTransactions } from '../../context/TransactionContext';
import type { TransactionItem, TransactionStatus, ContractType } from '../../types/medichain';

export default function TransactionCenterPage() {
  const { user } = useAuth();
  const { wallet } = useWallet();
  const { transactions, clearTransactions } = useTransactions();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TransactionStatus>('All');
  const [contractFilter, setContractFilter] = useState<'All' | ContractType>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Role-Based Isolation Filter
  const roleIsolatedTransactions = transactions.filter((tx) => {
    if (user.role === 'hospital') {
      // Show ONLY operations matching hospital caller wallet or hospital name
      const isCaller = wallet.address && tx.caller.toLowerCase() === wallet.address.toLowerCase();
      const isHospitalAction = tx.contractType === 'Core Contract' || tx.details.toLowerCase().includes('hospital');
      return isCaller || isHospitalAction;
    } else if (user.role === 'govt') {
      // Show Registry Contract & admin actions
      return tx.contractType === 'Registry Contract' || tx.method.includes('grant') || tx.method.includes('add_hospital');
    }
    return true;
  });

  // Additional Search & Filter logic
  const filteredTransactions = roleIsolatedTransactions.filter((tx) => {
    const matchesSearch =
      tx.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.caller.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
    const matchesContract = contractFilter === 'All' || tx.contractType === contractFilter;

    return matchesSearch && matchesStatus && matchesContract;
  });

  const totalCount = roleIsolatedTransactions.length;
  const confirmedCount = roleIsolatedTransactions.filter((t) => t.status === 'Confirmed').length;
  const registryCount = roleIsolatedTransactions.filter((t) => t.contractType === 'Registry Contract').length;
  const coreCount = roleIsolatedTransactions.filter((t) => t.contractType === 'Core Contract').length;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Role Guarding: Require authenticated session
  if (!user.role) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-[#F8FAFC]">
        <div className="max-w-md space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/80">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Authentication Required</h2>
          <p className="text-xs text-slate-600 font-medium">
            You must log in to view the Transaction Center and real-time Soroban activity log.
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
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                <History className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Transaction Center &amp; Activity Feed</h1>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200/80 rounded-full">
                    {user.role === 'govt' ? 'Govt Scope' : 'Node Scope'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {user.role === 'govt'
                    ? 'Super admin whitelisting operations and Soroban registry event log.'
                    : 'Node-specific medical uploads and inter-hospital record access transactions.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {transactions.length > 0 && (
              <button
                onClick={clearTransactions}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-rose-300 text-xs font-bold text-slate-600 hover:text-rose-600 shadow-sm transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Activity Log
              </button>
            )}
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50 space-y-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Scoped Actions</p>
            <p className="text-2xl font-extrabold text-slate-900 font-mono">{totalCount}</p>
            <p className="text-[10px] text-slate-400 font-medium">Role-isolated operations</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-md shadow-emerald-500/5 space-y-1">
            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Confirmed</p>
            <p className="text-2xl font-extrabold text-emerald-600 font-mono">{confirmedCount}</p>
            <p className="text-[10px] text-emerald-600/80 font-medium">On Stellar Testnet</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50 space-y-1">
            <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Registry Operations</p>
            <p className="text-2xl font-extrabold text-teal-600 font-mono">{registryCount}</p>
            <p className="text-[10px] text-slate-400 font-medium">Hospital Whitelist RBAC</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50 space-y-1">
            <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Core Operations</p>
            <p className="text-2xl font-extrabold text-teal-600 font-mono">{coreCount}</p>
            <p className="text-[10px] text-slate-400 font-medium">Records &amp; Access Grants</p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-md shadow-slate-200/40 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Tx Hash, Method, Address, or Patient ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1 hidden sm:block" />
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mr-1 hidden sm:block">Status:</span>
            {(['All', 'Confirmed', 'Processing', 'Pending', 'Failed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all
                  ${
                    statusFilter === st
                      ? 'bg-teal-50 text-teal-800 border border-teal-300'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900'
                  }
                `}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mr-1 hidden sm:block">Contract:</span>
            {(['All', 'Registry Contract', 'Core Contract'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setContractFilter(c)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all
                  ${
                    contractFilter === c
                      ? 'bg-teal-50 text-teal-800 border border-teal-300'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900'
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
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
              <History className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Awaiting Node Activity...</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                No transactions recorded for this role scope. Execute an action in your workspace to populate the real-time Soroban log.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href={user.role === 'govt' ? '/govt' : '/hospital'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white text-xs font-extrabold shadow-md transition-all hover:shadow-lg"
              >
                <span>Go to {user.role === 'govt' ? 'Government Portal' : 'Hospital Action Center'}</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Desktop Fintech Table View */}
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Lifecycle Status</th>
                    <th className="p-4">Contract Involved</th>
                    <th className="p-4">Method &amp; Action Details</th>
                    <th className="p-4">Tx Hash / Explorer</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      <td className="p-4">
                        <span
                          className={`
                            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border
                            ${
                              tx.status === 'Confirmed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : tx.status === 'Processing' || tx.status === 'Pending'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }
                          `}
                        >
                          {tx.status === 'Confirmed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {tx.status === 'Processing' && <Loader2 className="w-3.5 h-3.5 text-teal-600 animate-spin" />}
                          {tx.status === 'Pending' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                          {tx.status === 'Failed' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                          {tx.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded-lg border bg-teal-50 border-teal-200 text-teal-600">
                            {tx.contractType === 'Registry Contract' ? (
                              <Landmark className="w-4 h-4" />
                            ) : (
                              <Building2 className="w-4 h-4" />
                            )}
                          </span>
                          <div>
                            <p className="font-extrabold text-slate-900">{tx.contractType}</p>
                            <p className="font-mono text-[10px] text-slate-500 font-semibold">{tx.contractId.slice(0, 10)}...</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div>
                          <p className="font-mono text-xs font-bold text-teal-800">{tx.method}()</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 max-w-md font-medium">{tx.details}</p>
                          {tx.error && (
                            <p className="text-[10px] text-rose-600 mt-1 bg-rose-50 p-1.5 rounded-lg border border-rose-200 font-mono font-semibold">
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
                              className="text-teal-600 hover:underline flex items-center gap-1 font-bold"
                            >
                              <span>{tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <button
                              onClick={() => handleCopy(tx.hash, tx.id)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              {copiedId === tx.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Pending Hash...</span>
                        )}
                      </td>

                      <td className="p-4 text-slate-500 text-[11px] font-medium">
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
                <div key={tx.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-md shadow-slate-200/40 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg border bg-teal-50 border-teal-200 text-teal-600">
                        {tx.contractType === 'Registry Contract' ? (
                          <Landmark className="w-4 h-4" />
                        ) : (
                          <Building2 className="w-4 h-4" />
                        )}
                      </span>
                      <div>
                        <span className="font-mono text-xs font-bold text-teal-800">{tx.method}()</span>
                        <p className="text-[10px] text-slate-500 font-mono">{tx.contractType}</p>
                      </div>
                    </div>

                    <span
                      className={`
                        inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border
                        ${
                          tx.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : tx.status === 'Processing' || tx.status === 'Pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }
                      `}
                    >
                      {tx.status === 'Confirmed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {tx.status === 'Processing' && <Loader2 className="w-3 h-3 text-teal-600 animate-spin" />}
                      {tx.status === 'Pending' && <Clock className="w-3 h-3 text-amber-600" />}
                      {tx.status === 'Failed' && <XCircle className="w-3 h-3 text-rose-600" />}
                      {tx.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">{tx.details}</p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100 gap-2">
                    {tx.hash ? (
                      <a
                        href={tx.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>Tx: {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Pending Hash</span>
                    )}
                    <span className="text-slate-400">{new Date(tx.timestamp).toLocaleTimeString()}</span>
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
