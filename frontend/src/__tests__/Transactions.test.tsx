import React, { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TransactionCenterPage from '../app/transactions/page';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { WalletProvider } from '../context/WalletContext';
import { TransactionProvider } from '../context/TransactionContext';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/transactions',
}));

function AuthenticatedWrapper({ children }: { children: React.ReactNode }) {
  const { login } = useAuth();
  useEffect(() => {
    login('govt', 'Govt Admin');
  }, [login]);
  return <>{children}</>;
}

describe('Transaction Center Page', () => {
  it('renders page header, status filters, and empty state when no transactions exist', () => {
    render(
      <AuthProvider>
        <AuthenticatedWrapper>
          <WalletProvider>
            <TransactionProvider>
              <TransactionCenterPage />
            </TransactionProvider>
          </WalletProvider>
        </AuthenticatedWrapper>
      </AuthProvider>
    );

    expect(screen.getByText('Transaction Center & Activity Feed')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by Tx Hash/i)).toBeInTheDocument();
    expect(screen.getByText(/Awaiting/i)).toBeInTheDocument();
  });
});
