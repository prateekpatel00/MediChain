'use client';

// ============================================================
// MediChain Government Super Admin Portal (/govt)
// ============================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Landmark,
  Shield,
  Key,
  CheckCircle2,
  Building2,
  Loader2,
  ArrowLeft,
  Zap,
  Award,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

import { useWallet } from '../../context/WalletContext';
import { useStellar } from '../../hooks/useStellar';
import { REGISTRY_CONTRACT_ID } from '../../services/stellar';

export default function GovtDashboard() {
  const { wallet, openWalletModal } = useWallet();
  const { grantHospitalRights, isExecuting } = useStellar();

  // ── Form State ────────────────────────────────────────────
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // ── Authorized Hospitals List ──────────────────────────────
  const [authorizedHospitals, setAuthorizedHospitals] = useState<
    Array<{ address: string; name: string; grantedAt: number; txHash: string }>
  >([
    {
      address: 'GBANGALORE99HOSPITAL99STELLAR99999999999999999999999',
      name: 'Apollo Hospitals (Bangalore)',
      grantedAt: Date.now() - 86400000 * 10,
      txHash: 'DEMO_GOVT_GRANT_TX_001',
    },
    {
      address: 'GJABALPUR88HOSPITAL88STELLAR88888888888888888888888',
      name: 'AIIMS (Jabalpur)',
      grantedAt: Date.now() - 86400000 * 5,
      txHash: 'DEMO_GOVT_GRANT_TX_002',
    },
  ]);

  // ── Action: Grant Hospital Rights ─────────────────────────
  const handleGrantRights = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.isConnected) {
      openWalletModal();
      return;
    }
    if (!hospitalAddress) return;

    const res = await grantHospitalRights(hospitalAddress.trim(), hospitalName.trim());

    if (res.success && res.txHash) {
      const newHosp = {
        address: hospitalAddress.trim(),
        name: hospitalName.trim() || 'Healthcare Institution Node',
        grantedAt: Date.now(),
        txHash: res.txHash,
      };

      setAuthorizedHospitals((prev) => [newHosp, ...prev]);
      setHospitalAddress('');
      setHospitalName('');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Background glow */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* SUB-HEADER BANNER */}
      <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <Landmark className="w-4 h-4 text-amber-400" />
            <span className="font-bold">Government Authority Registry Portal</span>
            <span className="text-amber-500/60">•</span>
            <span className="font-mono text-[11px] opacity-90">Registry Contract: {REGISTRY_CONTRACT_ID.slice(0, 12)}...</span>
          </div>

          <Link
            href="/hospital"
            className="text-amber-400 hover:text-amber-200 font-semibold underline underline-offset-2 flex items-center gap-1"
          >
            Switch to Hospital Dashboard →
          </Link>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form: Grant Hospital Rights */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Grant Hospital Publishing Rights</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Executes <code className="text-amber-300">grant_hospital_rights()</code> on Registry Contract. Only authorized hospitals can commit record hashes.
              </p>
            </div>

            <form onSubmit={handleGrantRights} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Hospital Name / Institution Identity
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apollo Hospitals (Bangalore)"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Stellar Wallet Public Key (G...)
                </label>
                <input
                  type="text"
                  required
                  placeholder="GBANGALORE99HOSPITAL99..."
                  value={hospitalAddress}
                  onChange={(e) => setHospitalAddress(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
                />
              </div>

              <div className="p-3.5 bg-amber-950/30 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
                <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  Requires <strong>Government Super Admin wallet signature</strong> via StellarWalletsKit.
                </span>
              </div>

              <button
                type="submit"
                disabled={isExecuting}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 disabled:from-slate-700 disabled:to-slate-700 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 disabled:shadow-none transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing Transaction...</span>
                  </>
                ) : !wallet.isConnected ? (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Connect Govt Admin Wallet First</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Authorize Hospital On-Chain</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* List of Authorized Hospitals */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                Authorized Hospital Whitelist Registry
              </h2>
              <span className="text-xs text-slate-400 font-mono">{authorizedHospitals.length} Nodes Whitelisted</span>
            </div>

            <div className="space-y-3">
              {authorizedHospitals.map((hosp, i) => (
                <div key={i} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{hosp.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="font-mono text-[11px] text-amber-400">{hosp.address.slice(0, 16)}...{hosp.address.slice(-6)}</p>
                          <button
                            onClick={() => handleCopy(hosp.address)}
                            className="text-slate-500 hover:text-slate-300"
                          >
                            {copiedAddress === hosp.address ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Publish Rights Granted
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/60 font-mono">
                    <span>Authorized on: {new Date(hosp.grantedAt).toLocaleDateString()}</span>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${hosp.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>Tx: {hosp.txHash.slice(0, 14)}...</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
