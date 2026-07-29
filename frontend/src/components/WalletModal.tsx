'use client';

// ============================================================
// MediChain Wallet Selection Modal Component (Light Theme 3D)
// ============================================================

import React from 'react';
import { X, ShieldCheck, ExternalLink, Wallet, CheckCircle2, Loader2 } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export function WalletModal() {
  const { isModalOpen, closeWalletModal, supportedWallets, connectWallet, isConnecting, wallet } = useWallet();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/10 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Connect Stellar Wallet</h3>
              <p className="text-[11px] text-slate-500 font-medium">Powered by StellarWalletsKit</p>
            </div>
          </div>
          <button
            onClick={closeWalletModal}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info banner */}
        <div className="p-3.5 bg-teal-50/80 border border-teal-200 rounded-2xl flex items-start gap-3 text-xs text-teal-900">
          <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
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
                  w-full flex items-center justify-between p-4 rounded-2xl border text-left
                  transition-all group shadow-sm hover:shadow-md
                  ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-white border-slate-200 hover:border-teal-400 hover:bg-slate-50/80 text-slate-800'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? 'bg-emerald-200/80 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-teal-700 border border-slate-200 group-hover:border-teal-300'
                    }`}
                  >
                    {w.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {w.name}
                      {isSelected && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {w.type === 'extension' ? 'Browser Extension' : 'Web Wallet'}
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 group-hover:text-teal-600 transition-colors">
                  {isConnecting && wallet.walletId === w.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 text-center text-[11px] text-slate-500 font-medium">
          Need a wallet? Install{' '}
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:underline font-bold"
          >
            Freighter Extension
          </a>
        </div>
      </div>
    </div>
  );
}
