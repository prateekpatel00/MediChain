'use client';

// ============================================================
// MediChain Wallet Selection Modal Component
// ============================================================
// Modal dialog allowing users to choose from supported Stellar wallets
// (Freighter, Albedo, xBull, Hana, LOBSTR) via StellarWalletsKit.
// ============================================================

import React from 'react';
import { X, ShieldCheck, ExternalLink, Wallet, CheckCircle, Loader2 } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export function WalletModal() {
  const { isModalOpen, closeWalletModal, supportedWallets, connectWallet, isConnecting, wallet } = useWallet();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Connect Stellar Wallet</h3>
              <p className="text-[11px] text-slate-400">Powered by StellarWalletsKit</p>
            </div>
          </div>
          <button
            onClick={closeWalletModal}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info banner */}
        <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/20 rounded-xl flex items-start gap-2.5 text-xs text-cyan-300">
          <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <span>
            Connect your preferred Stellar wallet to sign transactions on the <strong>Stellar Testnet</strong>.
          </span>
        </div>

        {/* Wallet Options List */}
        <div className="space-y-2.5">
          {supportedWallets.map((w) => {
            const isSelected = wallet.walletId === w.id && wallet.isConnected;
            return (
              <button
                key={w.id}
                onClick={() => connectWallet(w.id)}
                disabled={isConnecting}
                className={`
                  w-full flex items-center justify-between p-4 rounded-xl border text-left
                  transition-all group
                  ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/80 text-slate-200'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-cyan-400 border border-slate-700 group-hover:border-cyan-500/40'
                    }`}
                  >
                    {w.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      {w.name}
                      {isSelected && (
                        <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Connected
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                      {w.type === 'extension' ? 'Browser Extension' : 'Web Wallet'}
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">
                  {isConnecting && wallet.walletId === w.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 text-center text-[11px] text-slate-500">
          Need a wallet? Download{' '}
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline font-semibold"
          >
            Freighter Extension
          </a>
        </div>
      </div>
    </div>
  );
}
