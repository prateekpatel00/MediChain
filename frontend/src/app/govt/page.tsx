'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Landmark,
  Shield,
  Key,
  CheckCircle2,
  XCircle,
  Building2,
  Plus,
  Loader2,
  ExternalLink,
  ArrowLeft,
  Copy,
  Check,
  Zap,
  Award,
} from 'lucide-react';

import type { WalletState, StatusMessage } from '../../types/medichain';

import {
  connectFreighter,
  checkFreighterInstalled,
  invokeSorobanContract,
  addressToScVal,
  CONTRACT_ID,
  STELLAR_TESTNET_RPC,
} from '../../utils/stellar';

export default function GovtDashboard() {
  // ── Wallet State ─────────────────────────────────────────
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [freighterInstalled, setFreighterInstalled] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // ── Form State ────────────────────────────────────────────
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  // ── Status Toast ──────────────────────────────────────────
  const [status, setStatus] = useState<StatusMessage | null>({
    type: 'info',
    title: 'Government Authority Node Connected',
    desc: `Contract: ${CONTRACT_ID.slice(0, 12)}... | Network: Stellar Testnet`,
  });

  useEffect(() => {
    checkFreighterInstalled().then(setFreighterInstalled);
  }, []);

  // ── Wallet Connect ────────────────────────────────────────
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const info = await connectFreighter();
      setWallet({ address: info.address, isConnected: true, network: info.network });
      setStatus({
        type: 'success',
        title: 'Govt Admin Wallet Connected',
        desc: `${info.address.slice(0, 8)}...${info.address.slice(-6)} on ${info.network}`,
      });
    } catch (err: any) {
      setStatus({ type: 'error', title: 'Connection Failed', desc: err.message });
    } finally {
      setIsConnecting(false);
    }
  };

  // ── Action: Grant Hospital Rights ─────────────────────────
  const handleGrantRights = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;
    if (!hospitalAddress) return;

    setIsProcessing(true);
    setStatus({
      type: 'loading',
      title: 'Executing grant_hospital_rights on Soroban…',
      desc: 'Freighter will open — please approve transaction as Government Authority.',
    });

    try {
      const result = await invokeSorobanContract(
        'grant_hospital_rights',
        [addressToScVal(wallet.address), addressToScVal(hospitalAddress.trim())],
        wallet.address
      );

      if (!result.success) throw new Error(result.error);

      const newHosp = {
        address: hospitalAddress.trim(),
        name: hospitalName.trim() || 'Healthcare Institution',
        grantedAt: Date.now(),
        txHash: result.txHash!,
      };

      setAuthorizedHospitals((prev) => [newHosp, ...prev]);
      setHospitalAddress('');
      setHospitalName('');

      setStatus({
        type: 'success',
        title: '✅ Hospital Granted On-Chain Publish Rights',
        desc: `Wallet ${newHosp.address.slice(0, 10)}... can now publish patient record hashes to MediChain contract.`,
        txHash: result.txHash,
      });
    } catch (err: any) {
      setStatus({ type: 'error', title: 'Grant Rights Failed', desc: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Background glow */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* HEADER */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Government Authority Portal</h1>
                <p className="text-[10px] text-amber-400 font-medium">Ministry of Health &amp; Family Welfare · Tier 1 Super Admin</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/hospital"
              className="text-xs text-slate-400 hover:text-cyan-300 font-semibold px-3 py-1.5 rounded-lg border border-slate-800 hover:border-cyan-500/30 transition-all hidden sm:block"
            >
              Switch to Hospital Dashboard →
            </Link>

            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold
                transition-all
                ${wallet
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 border-amber-500/30 text-amber-300 hover:border-amber-400'}
              `}
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : wallet ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Key className="w-4 h-4" />
              )}
              <span>{wallet ? 'Govt Admin Connected' : 'Connect Admin Wallet'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* STATUS BANNER */}
      {status && (
        <div className="max-w-7xl mx-auto px-6 mt-4 w-full">
          <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 backdrop-blur-md ${
            status.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
              : status.type === 'error'
              ? 'bg-rose-950/50 border-rose-500/40 text-rose-200'
              : 'bg-amber-950/50 border-amber-500/40 text-amber-200'
          }`}>
            <div className="flex items-start gap-3">
              {status.type === 'loading' ? (
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin mt-0.5" />
              ) : status.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
              ) : (
                <Award className="w-5 h-5 text-amber-400 mt-0.5" />
              )}
              <div>
                <p className="font-semibold text-sm">{status.title}</p>
                <p className="text-xs opacity-90 mt-0.5">{status.desc}</p>
              </div>
            </div>
            <button onClick={() => setStatus(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Form: Grant Hospital Rights */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Grant Hospital Publishing Rights</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Executes <code className="text-amber-300">grant_hospital_rights()</code> on Soroban. Only authorized hospitals can commit record hashes.
              </p>
            </div>

            <form onSubmit={handleGrantRights} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Hospital Name / Identity
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

              <div className="p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl flex items-start gap-2 text-[11px] text-amber-300">
                <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  Requires <strong>Government Super Admin signature</strong> via Freighter wallet extension.
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !wallet}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 disabled:from-slate-700 disabled:to-slate-700 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 disabled:shadow-none transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing via Freighter…</span>
                  </>
                ) : !wallet ? (
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
                Authorized Hospital Registry
              </h2>
              <span className="text-xs text-slate-400 font-mono">{authorizedHospitals.length} Nodes Authorized</span>
            </div>

            <div className="space-y-3">
              {authorizedHospitals.map((hosp, i) => (
                <div key={i} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{hosp.name}</p>
                        <p className="font-mono text-[11px] text-amber-400">{hosp.address.slice(0, 16)}...{hosp.address.slice(-6)}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Publish Rights Granted
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/60">
                    <span>Authorized on: {new Date(hosp.grantedAt).toLocaleDateString()}</span>
                    <span className="font-mono text-cyan-400">Tx: {hosp.txHash.slice(0, 14)}...</span>
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
