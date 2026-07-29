'use client';

// ============================================================
// MediChain Role-Based Login Page (/login) — Light Theme 3D
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans">
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-16 w-full flex flex-col justify-center space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-sm">
            <Shield className="w-4 h-4 text-teal-600" />
            <span>Role-Based Authentication Wrapper</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Enterprise Portal Access
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto font-medium">
            Select your node authorization type below to authenticate and enter your operational workspace.
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/80 max-w-xl mx-auto w-full space-y-6">
          
          {/* TAB SELECTOR */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100/80 border border-slate-200 rounded-2xl">
            <button
              onClick={() => setActiveTab('govt')}
              className={`
                py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all
                ${
                  activeTab === 'govt'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900'
                }
              `}
            >
              <Landmark className="w-4 h-4" />
              <span>Govt Authority</span>
            </button>

            <button
              onClick={() => setActiveTab('hospital')}
              className={`
                py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all
                ${
                  activeTab === 'hospital'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900'
                }
              `}
            >
              <Building2 className="w-4 h-4" />
              <span>Hospital Node</span>
            </button>
          </div>

          {/* TAB 1: GOVT ADMIN LOGIN */}
          {activeTab === 'govt' && (
            <form onSubmit={handleGovtLogin} className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-2xl flex items-start gap-3 text-xs text-teal-950 font-medium">
                <Shield className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Government Authority Node</strong>: Manages hospital whitelisting on the Soroban Registry Contract.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Admin Authority ID / Username
                </label>
                <input
                  type="text"
                  required
                  value={govtUsername}
                  onChange={(e) => setGovtUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Super Admin Passphrase
                </label>
                <input
                  type="password"
                  required
                  value={govtPassword}
                  onChange={(e) => setGovtPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-teal-600/25 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <UserCheck className="w-4 h-4 text-white" />
                <span>Authorize &amp; Enter Government Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: HOSPITAL NODE LOGIN */}
          {activeTab === 'hospital' && (
            <form onSubmit={handleHospitalLogin} className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-2xl flex items-start gap-3 text-xs text-teal-950 font-medium">
                <Building2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Healthcare Institution Node</strong>: Upload record hashes, request inter-hospital access, and view approved files.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Hospital Institution Name
                </label>
                <input
                  type="text"
                  required
                  value={hospName}
                  onChange={(e) => setHospName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Node Identifier
                </label>
                <input
                  type="text"
                  required
                  value={hospNodeId}
                  onChange={(e) => setHospNodeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-teal-600/25 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <UserCheck className="w-4 h-4 text-white" />
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
