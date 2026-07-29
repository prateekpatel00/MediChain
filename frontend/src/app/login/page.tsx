'use client';

// ============================================================
// MediChain Role-Based Login Page (/login)
// ============================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Landmark,
  Building2,
  Lock,
  Key,
  Shield,
  ArrowRight,
  UserCheck,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'govt' | 'hospital'>('govt');

  // Govt Admin credentials
  const [govtUsername, setGovtUsername] = useState('govt_admin');
  const [govtPassword, setGovtPassword] = useState('••••••••••••');

  // Hospital Node credentials
  const [hospNodeId, setHospNodeId] = useState('NODE-BLR-APOLLO');
  const [hospName, setHospName] = useState('Apollo Hospitals Bangalore');
  const [hospPassword, setHospPassword] = useState('••••••••••••');

  const handleGovtLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login('govt', govtUsername || 'Govt Super Admin');
    toast.success('Authenticated as Government Authority Super Admin');
    router.push('/govt');
  };

  const handleHospitalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login('hospital', hospNodeId || 'Hospital Node', hospName);
    toast.success(`Authenticated as ${hospName || 'Hospital Node'}`);
    router.push('/hospital');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070D1F] text-slate-100 font-sans">
      {/* Background glow */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full flex flex-col justify-center space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Role-Based Authentication Wrapper</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Enterprise Portal Access
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Select your node authorization type below to authenticate and enter your specific operational workspace.
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="glass-panel bg-[#0B132B]/90 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl max-w-xl mx-auto w-full space-y-6">
          
          {/* TAB SELECTOR */}
          <div className="grid grid-cols-2 p-1 bg-[#0F172A] border border-slate-800 rounded-2xl">
            <button
              onClick={() => setActiveTab('govt')}
              className={`
                py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all
                ${
                  activeTab === 'govt'
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }
              `}
            >
              <Landmark className="w-4 h-4" />
              <span>Govt Super Admin</span>
            </button>

            <button
              onClick={() => setActiveTab('hospital')}
              className={`
                py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all
                ${
                  activeTab === 'hospital'
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }
              `}
            >
              <Building2 className="w-4 h-4" />
              <span>Hospital Node</span>
            </button>
          </div>

          {/* TAB 1: GOVT ADMIN LOGIN */}
          {activeTab === 'govt' && (
            <form onSubmit={handleGovtLogin} className="space-y-4">
              <div className="p-3.5 bg-[#0F172A] border border-cyan-500/20 rounded-2xl flex items-start gap-3 text-xs text-cyan-300">
                <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Government Authority Node</strong>: Manages hospital whitelisting on the Soroban Registry Contract.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Admin Authority ID / Username
                </label>
                <input
                  type="text"
                  required
                  value={govtUsername}
                  onChange={(e) => setGovtUsername(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Super Admin Passphrase
                </label>
                <input
                  type="password"
                  required
                  value={govtPassword}
                  onChange={(e) => setGovtPassword(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <UserCheck className="w-4 h-4 text-slate-950" />
                <span>Authorize &amp; Enter Government Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: HOSPITAL NODE LOGIN */}
          {activeTab === 'hospital' && (
            <form onSubmit={handleHospitalLogin} className="space-y-4">
              <div className="p-3.5 bg-[#0F172A] border border-cyan-500/20 rounded-2xl flex items-start gap-3 text-xs text-cyan-300">
                <Building2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Healthcare Institution Node</strong>: Upload record hashes, request inter-hospital access, and view approved patient files.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Hospital Institution Name
                </label>
                <input
                  type="text"
                  required
                  value={hospName}
                  onChange={(e) => setHospName(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Node Identifier
                </label>
                <input
                  type="text"
                  required
                  value={hospNodeId}
                  onChange={(e) => setHospNodeId(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <UserCheck className="w-4 h-4 text-slate-950" />
                <span>Authorize &amp; Enter Hospital Action Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

      </main>
    </div>
  );
}
