'use client';

// ============================================================
// MediChain Government Super Admin Portal (/govt)
// ============================================================
// Step-by-step intuitive workflow for Government Authorities to whitelist
// hospital nodes on the Soroban Registry Contract.
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
  Zap,
  Award,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useStellar } from '../../hooks/useStellar';
import { REGISTRY_CONTRACT_ID } from '../../services/stellar';

export default function GovtDashboard() {
  const { user } = useAuth();
  const { wallet, openWalletModal } = useWallet();
  const { grantHospitalRights, isExecuting } = useStellar();

  // ── Form State ────────────────────────────────────────────
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // ── Whitelisted Hospitals ─────────────────────────────────
  const [authorizedHospitals, setAuthorizedHospitals] = useState<
    Array<{ address: string; name: string; grantedAt: number; txHash: string }>
  >([]);

  // Action: Grant Rights
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
        name: hospitalName.trim() || 'Verified Healthcare Node',
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

  // Role Guarding: Require Govt Admin authentication
  if (user.role !== 'govt') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-[#070D1F]">
        <div className="max-w-md space-y-4 glass-panel bg-[#0B132B] p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Government Admin Access Required</h2>
          <p className="text-xs text-slate-400">
            You must be logged in as a Government Super Admin to manage the hospital whitelist registry.
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
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* SUB-HEADER */}
      <div className="bg-[#0B132B] border-b border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-cyan-300">
            <Landmark className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">Ministry of Health Authority Portal</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-[11px] text-slate-400">Registry Contract: {REGISTRY_CONTRACT_ID.slice(0, 12)}...</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Authenticated Super Admin: {user.username}</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        
        {/* GUIDED 3-STEP WORKFLOW CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form: Grant Hospital Rights */}
          <div className="lg:col-span-6 glass-panel bg-[#0B132B] p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Hospital Node Whitelisting Workflow</h2>
                  <p className="text-xs text-slate-400">Authorizes hospital public key to publish record hashes on Soroban</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleGrantRights} className="space-y-6">
              
              {/* STEP 1 */}
              <div className={`p-4 rounded-2xl border transition-all ${wallet.isConnected ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-[#0F172A] border-slate-800'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${wallet.isConnected ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-cyan-400'}`}>
                      1
                    </span>
                    <span className="text-xs font-bold text-white">Step 1: Connect Authority Key</span>
                  </div>

                  {wallet.isConnected ? (
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={openWalletModal}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Connect Wallet</span>
                    </button>
                  )}
                </div>
              </div>

              {/* STEP 2 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-400 text-xs font-bold flex items-center justify-center">2</span>
                  <span>Step 2: Hospital Identity &amp; Public Key</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Hospital Institution Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apollo Hospitals (Bangalore)"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Stellar Wallet Public Key (G...)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="GBANGALORE99HOSPITAL99..."
                    value={hospitalAddress}
                    onChange={(e) => setHospitalAddress(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* STEP 3 */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-400 text-xs font-bold flex items-center justify-center">3</span>
                  <span>Step 3: Execute On-Chain Authorization</span>
                </div>

                <button
                  type="submit"
                  disabled={isExecuting}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 disabled:from-slate-700 disabled:to-slate-700 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 disabled:shadow-none transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing Transaction on Registry Contract...</span>
                    </>
                  ) : !wallet.isConnected ? (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Connect Wallet in Step 1 First</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      <span>Authorize Hospital On-Chain</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* List of Whitelisted Hospital Nodes */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                Whitelisted Hospital Registry
              </h2>
              <span className="text-xs text-slate-400 font-mono">{authorizedHospitals.length} Nodes Active</span>
            </div>

            {authorizedHospitals.length === 0 ? (
              <div className="glass-panel bg-[#0B132B] p-10 rounded-3xl border border-slate-800 text-center space-y-3">
                <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-white">No Hospital Nodes Added Yet</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Use the 3-step form to authorize healthcare institution public keys on the Soroban Registry Contract.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {authorizedHospitals.map((hosp, i) => (
                  <div key={i} className="glass-panel bg-[#0B132B] p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{hosp.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="font-mono text-[11px] text-cyan-400">{hosp.address.slice(0, 16)}...{hosp.address.slice(-6)}</p>
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
                        Whitelisted
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/80">
                      <span>Whitelisted: {new Date(hosp.grantedAt).toLocaleDateString()}</span>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${hosp.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>Tx: {hosp.txHash.slice(0, 12)}...</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
