'use client';

// ============================================================
// MediChain Enterprise Header Navbar (Polygon / MetaMask Aesthetic)
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
  CheckCircle2,
  LogOut,
  LogIn,
  ChevronRight,
  UserCheck,
  Sparkles,
  BadgeCheck,
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
    { href: '/', label: 'Home', icon: Shield },
    ...(user.role === 'govt'
      ? [{ href: '/govt', label: 'Government Admin Portal', icon: Landmark }]
      : []),
    ...(user.role === 'hospital'
      ? [{ href: '/hospital', label: 'Hospital Action Center', icon: Building2 }]
      : []),
    ...(isAuthenticated
      ? [{ href: '/transactions', label: 'Transaction Center', icon: History }]
      : [
          { href: '/#features', label: 'Capabilities', icon: Building2 },
          { href: '/#security', label: 'Security & Compliance', icon: Shield },
        ]),
  ];

  return (
    <header className="sticky top-0 z-40 glass-header bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-md shadow-slate-200/50 px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name (Clean, Professional Enterprise SaaS Branding) */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 via-teal-600 to-teal-500 p-0.5 shadow-lg shadow-teal-500/20 transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">MediChain</span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200/80 rounded-full">
                Enterprise
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block font-medium">Inter-Hospital Health Protocol</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 border border-slate-200 p-1.5 rounded-2xl shadow-inner">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all
                  ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-md shadow-slate-200/80 border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }
                `}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Wallet Button & Authorized Node Badge */}
          {wallet.isConnected && wallet.address ? (
            <div className="flex items-center gap-2">
              
              {/* Authorized Node Badge */}
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Authorized Node</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={openWalletModal}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-mono font-bold shadow-md shadow-slate-900/10 hover:bg-slate-800 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden sm:inline">{wallet.walletName}:</span>
                  <span>{wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}</span>
                </button>
                <button
                  onClick={disconnectWallet}
                  title="Disconnect Wallet"
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 shadow-sm transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={openWalletModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-teal-600/20 transition-all hover:shadow-teal-600/30"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}

          {/* Web2 Auth User Badge / Login CTA */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs shadow-sm">
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-slate-800 font-bold text-[11px] truncate max-w-[130px]">
                  {user.username}
                </span>
              </div>
              <button
                onClick={logout}
                title="Logout Session"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold shadow-sm transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/10 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Portal Login</span>
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-200 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center justify-between p-3 rounded-xl text-sm font-bold border transition-all
                  ${
                    isActive
                      ? 'bg-teal-50 border-teal-200 text-teal-800'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
