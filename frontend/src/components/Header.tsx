'use client';

// ============================================================
// MediChain Enterprise Header Navbar
// ============================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Landmark,
  Building2,
  History,
  Wallet,
  Menu,
  X,
  CheckCircle,
  LogOut,
  LogIn,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const pathname = usePathname();
  const { wallet, openWalletModal, disconnectWallet } = useWallet();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic Navigation Links based on Role
  const navLinks = [
    { href: '/', label: 'Home', icon: Shield, public: true },
    ...(user.role === 'govt'
      ? [{ href: '/govt', label: 'Government Admin Portal', icon: Landmark, public: false }]
      : []),
    ...(user.role === 'hospital'
      ? [{ href: '/hospital', label: 'Hospital Action Center', icon: Building2, public: false }]
      : []),
    ...(isAuthenticated
      ? [{ href: '/transactions', label: 'Transaction Center', icon: History, public: false }]
      : [
          { href: '/#features', label: 'Capabilities', icon: Building2, public: true },
          { href: '/#security', label: 'Security & Compliance', icon: Shield, public: true },
        ]),
  ];

  return (
    <header className="sticky top-0 z-40 glass-panel bg-[#0B132B]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name (Clean, Professional Enterprise Branding) */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/20 transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#070D1F] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">MediChain</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-md">
                Enterprise
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Inter-Hospital Health Exchange Protocol</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0F172A]/90 border border-slate-800/90 p-1 rounded-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold
                  transition-all
                  ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }
                `}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Wallet Button */}
          {wallet.isConnected && wallet.address ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={openWalletModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono hover:border-emerald-400 transition-all"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold hidden sm:inline">{wallet.walletName}:</span>
                <span>{wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}</span>
              </button>
              <button
                onClick={disconnectWallet}
                title="Disconnect Wallet"
                className="p-1.5 rounded-xl bg-[#0F172A] border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 text-xs transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={openWalletModal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}

          {/* Web2 Auth User Badge / Login CTA */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F172A] border border-slate-800 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-300 font-semibold text-[11px] truncate max-w-[140px]">
                  {user.username}
                </span>
              </div>
              <button
                onClick={logout}
                title="Logout Session"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0F172A] border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-semibold text-xs transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Portal Login</span>
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-xl bg-[#0F172A] border border-slate-800 text-slate-400 hover:text-white transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-800/80 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center justify-between p-3 rounded-xl border text-sm font-semibold transition-all
                  ${
                    isActive
                      ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                      : 'bg-[#0F172A]/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
