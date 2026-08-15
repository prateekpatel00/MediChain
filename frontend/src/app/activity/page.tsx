'use client';

// ============================================================
// MediChain Real-Time Activity Feed (/activity)
// ============================================================
// Real-time Soroban Smart Contract Event Stream & Activity Feed.
// Emits live updates without requiring page refreshes.
// ============================================================

import React from 'react';
import {
  Activity,
  Radio,
  FileCheck,
  Building2,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  Layers,
} from 'lucide-react';

import { useMediChainStore } from '../../store/useMediChainStore';
import { useContractEvents } from '../../hooks/useContractEvents';

export default function ActivityFeedPage() {
  // Initialize real-time Soroban RPC event polling hook
  useContractEvents();

  const { events, activeFilter, setActiveFilter, isLiveStreaming, toggleLiveStreaming } =
    useMediChainStore();

  const filteredEvents = events.filter((evt) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'uploads') return evt.type === 'upload';
    if (activeFilter === 'requests') return evt.type === 'req_acc';
    if (activeFilter === 'permissions') return evt.type === 'appr_acc' || evt.type === 'rej_acc';
    if (activeFilter === 'admin') return evt.type === 'hosp_add' || evt.type === 'hosp_rem' || evt.type === 'upgraded';
    return true;
  });

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'upload':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          icon: FileCheck,
          label: 'RECORD UPLOAD',
        };
      case 'req_acc':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-700',
          icon: Radio,
          label: 'ACCESS REQUEST',
        };
      case 'appr_acc':
        return {
          bg: 'bg-teal-50 border-teal-200 text-teal-700',
          icon: ShieldCheck,
          label: 'ACCESS GRANTED',
        };
      case 'rej_acc':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-700',
          icon: ShieldAlert,
          label: 'ACCESS REJECTED',
        };
      case 'hosp_add':
      case 'upgraded':
        return {
          bg: 'bg-sky-50 border-sky-200 text-sky-700',
          icon: KeyRound,
          label: 'ADMIN GOVERNANCE',
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200 text-slate-700',
          icon: Activity,
          label: 'CONTRACT EVENT',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-3xl text-white shadow-xl border border-teal-800/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 border border-teal-400/30 rounded-full text-xs font-bold text-teal-300">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Soroban Event Streaming Layer</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Real-Time Contract Activity Feed
          </h1>
          <p className="text-sm text-teal-100/80 max-w-2xl font-medium">
            Live stream of Soroban smart contract events emitted on Stellar Testnet. View atomic uploads, inter-hospital grants, and RBAC whitelist changes in real time.
          </p>
        </div>

        <button
          onClick={toggleLiveStreaming}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 border shadow-lg ${
            isLiveStreaming
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isLiveStreaming ? 'animate-spin' : ''}`} />
          <span>{isLiveStreaming ? 'Live Polling Active' : 'Polling Paused'}</span>
        </button>
      </div>

      {/* Filter Tabs & Metrics Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'uploads', label: 'Record Uploads' },
            { id: 'requests', label: 'Access Requests' },
            { id: 'permissions', label: 'Grants & Revokes' },
            { id: 'admin', label: 'Admin Governance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 px-3">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span>Showing {filteredEvents.length} events</span>
        </div>
      </div>

      {/* Event Activity Stream */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6">
        {filteredEvents.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Events Found</h3>
            <p className="text-xs text-slate-500">
              No Soroban contract events matching the selected filter currently exist in the buffer.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((evt) => {
              const badge = getEventBadge(evt.type);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={evt.id}
                  className="p-5 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200/60 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl border ${badge.bg}`}>
                      <BadgeIcon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900">{evt.title}</h4>
                      <p className="text-xs text-slate-600 font-medium">{evt.description}</p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
                        <span>Actor: {evt.actor}</span>
                        <span>•</span>
                        <span className="truncate max-w-[200px]">Contract: {evt.contract}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`https://stellar.expert/explorer/testnet/contract/${evt.contract}`}
                    target="_blank"
                    rel="noreferrer"
                    className="self-end md:self-center px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-700 hover:text-teal-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Explorer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
