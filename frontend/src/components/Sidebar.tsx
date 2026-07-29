'use client';

// ============================================================
// MediChain Fixed Left Sidebar Component (Dashboard Layout)
// ============================================================
// Professional Enterprise Dashboard Sidebar featuring Shielded Pulse branding,
// active section highlights, and role-based links.
// ============================================================

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  History,
  FileBarChart,
  Settings,
  Landmark,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return null;

  const navItems = [
    { href: '/overview', label: 'Overview', icon: LayoutDashboard },
    ...(user.role === 'govt'
      ? [{ href: '/govt', label: 'Hospitals Registry', icon: Landmark }]
      : []),
    ...(user.role === 'hospital'
      ? [{ href: '/hospital', label: 'Hospital Operations', icon: Building2 }]
      : []),
    { href: '/transactions', label: 'Transaction Center', icon: History },
    { href: '/reports', label: 'Reports & Audit', icon: FileBarChart },
    { href: '/settings', label: 'Settings & Security', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 shadow-sm fixed top-0 bottom-0 left-0 z-30 pt-4 px-4 pb-6 justify-between">
      
      <div className="space-y-6">
        {/* Brand Logo & Name (Shielded Pulse Identity Vector) */}
        <Link href="/overview" className="flex items-center gap-3 px-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 p-0.5 shadow-lg shadow-teal-500/20 transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center p-1.5">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-teal-600" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {/* Shield Outline */}
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                {/* Pulse Line */}
                <path d="M8 12h2l1.5-3 2.5 6 1.5-3h2.5" className="text-emerald-500" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">MediChain</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Health Data Protocol</p>
          </div>
        </Link>

        {/* Sidebar Menu Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Menu
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-teal-800 border border-teal-200/80 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-600" />}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Session Footer */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-xs">
            {user.role === 'govt' ? 'GA' : 'HN'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-extrabold text-slate-900 truncate">{user.username}</p>
            <p className="text-[10px] text-slate-500 font-medium capitalize">
              {user.role === 'govt' ? 'Govt Super Admin' : 'Hospital Node'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
}
