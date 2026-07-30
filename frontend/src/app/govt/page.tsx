'use client';

// ============================================================
// MediChain Government Super Admin Portal (/govt) — Dashboard Layout
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
  Award,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useStellar } from '../../hooks/useStellar';
import { REGISTRY_CONTRACT_ID } from '../../services/stellar';
import { Logo } from '../../components/Logo';

export default function GovtDashboard() {
  const { user } = useAuth();
  const { wallet, openWalletModal } = useWallet();
  const { grantHospitalRights, isExecuting } = useStellar();

  // Form State
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Whitelisted Hospitals State
  const [authorizedHospitals, setAuthorizedHospitals] = useState<
    Array<{ address: string; name: string; grantedAt: number; txHash: string }>
  >([]);

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
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-[#F8FAFC] md:ml-64">
        <div className="max-w-md space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/80 flex flex-col items-center">
          <Logo size="lg" href="/govt" showBadge badgeText="Super Admin" />
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mt-2">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Government Admin Access Required</h2>
          <p className="text-xs text-slate-600 font-medium">
            You must be logged in as a Government Super Admin to manage the hospital whitelist registry.
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
      
      {/* SUB-HEADER */}
      <div className="bg-white border-b border-slate-200/80 shadow-sm px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Logo size="sm" href="/govt" showBadge badgeText="Super Admin" />
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-slate-700 font-bold">
              <Landmark className="w-3.5 h-3.5 text-teal-600" />
              <span>Ministry of Health Authority Portal</span>
            </div>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-[11px] text-slate-500 font-normal hidden sm:inline">
              Registry: {REGISTRY_CONTRACT_ID.slice(0, 14)}...
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Super Admin: {user.username}</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        
        {/* GUIDED 3-STEP WORKFLOW CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form: Grant Hospital Rights */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Hospital Node Whitelisting</h2>
                  <p className="text-xs text-slate-500 font-medium">Authorizes hospital public key on Soroban Registry Contract</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleGrantRights} className="space-y-6">
              
              {/* STEP 1 */}
              <div className={`p-4 rounded-2xl border transition-all ${wallet.isConnected ? 'bg-emerald-50/80 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full text-xs font-extrabold flex items-center justify-center ${wallet.isConnected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      1
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">Step 1: Connect Authority Wallet</span>
                  </div>

                  {wallet.isConnected ? (
                    <span className="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={openWalletModal}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white font-extrabold text-xs shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all flex items-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Connect Wallet</span>
                    </button>
                  )}
                </div>
              </div>

              {/* STEP 2 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-xs font-extrabold text-slate-900">
                  <span className="w-7 h-7 rounded-full bg-slate-100 text-teal-700 border border-slate-200 text-xs font-extrabold flex items-center justify-center">2</span>
                  <span>Step 2: Enter Hospital Identity &amp; Public Key</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Hospital Institution Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apollo Hospitals (Bangalore)"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Stellar Wallet Public Key (G...)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="GBANGALORE99HOSPITAL99..."
                    value={hospitalAddress}
                    onChange={(e) => setHospitalAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* STEP 3 */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2.5 text-xs font-extrabold text-slate-900 mb-2">
                  <span className="w-7 h-7 rounded-full bg-slate-100 text-teal-700 border border-slate-200 text-xs font-extrabold flex items-center justify-center">3</span>
                  <span>Step 3: Execute On-Chain Whitelisting</span>
                </div>

                <button
                  type="submit"
                  disabled={isExecuting}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 disabled:from-slate-300 disabled:to-slate-300 text-white font-extrabold rounded-xl shadow-lg shadow-teal-500/25 disabled:shadow-none transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
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
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                Whitelisted Hospital Registry
              </h2>
              <span className="text-xs text-slate-500 font-mono font-bold">{authorizedHospitals.length} Active Nodes</span>
            </div>

            {authorizedHospitals.length === 0 ? (
              <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/50 text-center space-y-3">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">No Hospital Nodes Whitelisted Yet</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
                  Use the 3-step form to authorize healthcare institution public keys on the Soroban Registry Contract.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {authorizedHospitals.map((hosp, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md shadow-slate-200/40 space-y-3">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 font-bold">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{hosp.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="font-mono text-[11px] text-teal-700 font-semibold">{hosp.address.slice(0, 16)}...{hosp.address.slice(-6)}</p>
                            <button
                              onClick={() => handleCopy(hosp.address)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              {copiedAddress === hosp.address ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Whitelisted
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-100">
                      <span>Whitelisted: {new Date(hosp.grantedAt).toLocaleDateString()}</span>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${hosp.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:underline flex items-center gap-1 font-bold"
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
