'use client';

// ============================================================
// MediChain Official Global Enterprise Logo Component
// Brand Identity: Shield (Security) + Pulse (Health) + Blockchain Cube (Decentralization)
// ============================================================

import React from 'react';
import Link from 'next/link';

export interface LogoProps {
  /** Size variant: sm (28px), md (36px), lg (44px), xl (56px) */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Color theme variant for light vs dark/slate backgrounds */
  variant?: 'light' | 'dark' | 'slate' | 'auto';
  /** Whether to show the "MediChain" text label */
  showText?: boolean;
  /** Whether to show a subtitle/tagline below the brand name */
  showSubtitle?: boolean;
  /** Custom subtitle text string */
  subtitleText?: string;
  /** Whether to show an enterprise status/protocol pill badge */
  showBadge?: boolean;
  /** Custom text for the pill badge */
  badgeText?: string;
  /** Navigation target URL when clicked. Pass null or empty string to disable link wrapper */
  href?: string | null;
  /** Custom CSS classes for the container */
  className?: string;
  /** Optional click event handler */
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'light',
  showText = true,
  showSubtitle = false,
  subtitleText = 'Inter-Hospital Health Exchange',
  showBadge = false,
  badgeText = 'Enterprise Protocol',
  href = '/',
  className = '',
  onClick,
}) => {
  // Sizing configurations
  const sizeMap = {
    sm: {
      container: 'w-7 h-7 rounded-xl p-0.5',
      inner: 'rounded-[10px]',
      text: 'text-base',
      subtitle: 'text-[9px]',
      badge: 'px-1.5 py-0.2 text-[9px]',
    },
    md: {
      container: 'w-9 h-9 rounded-2xl p-0.5',
      inner: 'rounded-[12px]',
      text: 'text-lg',
      subtitle: 'text-[10px]',
      badge: 'px-2 py-0.5 text-[10px]',
    },
    lg: {
      container: 'w-11 h-11 rounded-2xl p-1',
      inner: 'rounded-[14px]',
      text: 'text-xl',
      subtitle: 'text-[11px]',
      badge: 'px-2.5 py-0.5 text-[10px]',
    },
    xl: {
      container: 'w-14 h-14 rounded-3xl p-1',
      inner: 'rounded-[18px]',
      text: 'text-2xl sm:text-3xl',
      subtitle: 'text-xs sm:text-sm',
      badge: 'px-3 py-1 text-xs',
    },
  };

  const currentSize = sizeMap[size];

  // Theme variant styles
  const isDark = variant === 'dark' || variant === 'slate';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const subtitleColor = isDark ? 'text-slate-400' : 'text-slate-500';
  const badgeStyle = isDark
    ? 'bg-teal-950/80 text-teal-300 border-teal-500/30'
    : 'bg-teal-50 text-teal-700 border-teal-200/80';

  // Core Brand Icon: Shield + Pulse + Blockchain Cube Vector Graphic
  const logoMark = (
    <div
      className={`
        relative flex-shrink-0 bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600
        shadow-md shadow-teal-500/20 group-hover:shadow-lg group-hover:shadow-teal-500/30
        transition-all duration-300 group-hover:scale-105
        ${currentSize.container}
      `}
    >
      <div
        className={`
          w-full h-full flex items-center justify-center relative overflow-hidden
          ${isDark ? 'bg-slate-900' : 'bg-white'}
          ${currentSize.inner}
        `}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          <defs>
            {/* Shield Gradient */}
            <linearGradient id="mcShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#14B8A6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Blockchain Cube Fill Gradient */}
            <linearGradient id="mcCubeTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="mcCubeSideGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0D9488" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.6" />
            </linearGradient>

            {/* Pulse Glow Line */}
            <linearGradient id="mcPulseLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#A7F3D0" />
            </linearGradient>
          </defs>

          {/* 1. BLOCKCHAIN CUBE (3D Isometric Structural Node Geometry) */}
          <g className="opacity-75">
            {/* Cube Top Face */}
            <path
              d="M18 4L28 9.5L18 15L8 9.5L18 4Z"
              fill="url(#mcCubeTopGrad)"
              stroke="#0D9488"
              strokeWidth="0.75"
              strokeLinejoin="round"
            />
            {/* Cube Left Face */}
            <path
              d="M8 9.5V21L18 26.5V15L8 9.5Z"
              fill="url(#mcCubeSideGrad)"
              stroke="#0F766E"
              strokeWidth="0.75"
              strokeLinejoin="round"
            />
            {/* Cube Right Face */}
            <path
              d="M28 9.5V21L18 26.5V15L28 9.5Z"
              fill="url(#mcCubeTopGrad)"
              fillOpacity="0.4"
              stroke="#0369A1"
              strokeWidth="0.75"
              strokeLinejoin="round"
            />
          </g>

          {/* 2. PROTECTIVE HEALTHCARE SHIELD OUTLINE */}
          <path
            d="M18 31.5C18 31.5 30 26 30 16.5V8.5L18 4L6 8.5V16.5C6 26 18 31.5 18 31.5Z"
            fill="none"
            stroke="url(#mcShieldGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 3. VIBRANT PULSE (ECG Heartbeat Waveform) */}
          <path
            d="M9 18H13L15.5 12L19.5 24L22.5 16.5L24.5 19.5H27"
            stroke="url(#mcPulseLineGrad)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Blockchain Node Vertices / Glowing Dots */}
          <circle cx="18" cy="4" r="1.25" fill="#34D399" />
          <circle cx="28" cy="9.5" r="1.25" fill="#38BDF8" />
          <circle cx="8" cy="9.5" r="1.25" fill="#2DD4BF" />
          <circle cx="18" cy="26.5" r="1.25" fill="#10B981" />
        </svg>
      </div>
    </div>
  );

  const logoContent = (
    <div className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {logoMark}

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span
              className={`font-extrabold tracking-tight ${currentSize.text} ${textColor} transition-colors group-hover:text-teal-600`}
            >
              MediChain
            </span>
            {showBadge && (
              <span
                className={`font-bold uppercase tracking-wider border rounded-full ${currentSize.badge} ${badgeStyle}`}
              >
                {badgeText}
              </span>
            )}
          </div>
          {showSubtitle && (
            <p className={`font-medium ${currentSize.subtitle} ${subtitleColor}`}>
              {subtitleText}
            </p>
          )}
        </div>
      )}
    </div>
  );

  // If href is provided, wrap in Next.js Link
  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="inline-block focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-xl"
      >
        {logoContent}
      </Link>
    );
  }

  return <div onClick={onClick} className="inline-block">{logoContent}</div>;
};

export default Logo;
