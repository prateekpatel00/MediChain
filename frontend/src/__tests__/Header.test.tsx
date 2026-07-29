import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '../components/Header';
import { WalletProvider } from '../context/WalletContext';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Header Component', () => {
  it('renders brand title and all navigation portal links', () => {
    render(
      <WalletProvider>
        <Header />
      </WalletProvider>
    );

    expect(screen.getByText('MediChain')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Govt Admin Portal')).toBeInTheDocument();
    expect(screen.getByText('Hospital Action Center')).toBeInTheDocument();
    expect(screen.getByText('Transaction Center')).toBeInTheDocument();
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });
});
