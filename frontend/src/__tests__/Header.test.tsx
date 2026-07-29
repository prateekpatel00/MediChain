import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '../components/Header';
import { AuthProvider } from '../context/AuthContext';
import { WalletProvider } from '../context/WalletContext';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Header Component', () => {
  it('renders brand title, public navigation links, and connect wallet button', () => {
    render(
      <AuthProvider>
        <WalletProvider>
          <Header />
        </WalletProvider>
      </AuthProvider>
    );

    expect(screen.getByText('MediChain')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Capabilities')).toBeInTheDocument();
    expect(screen.getByText('Security & Compliance')).toBeInTheDocument();
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });
});
