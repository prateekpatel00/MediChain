import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TransactionCenterPage from '../app/transactions/page';
import { WalletProvider } from '../context/WalletContext';
import { TransactionProvider } from '../context/TransactionContext';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/transactions',
}));

describe('Transaction Center Page', () => {
  it('renders page header, status filters, and pre-seeded transactions', () => {
    render(
      <WalletProvider>
        <TransactionProvider>
          <TransactionCenterPage />
        </TransactionProvider>
      </WalletProvider>
    );

    expect(screen.getByText('Transaction Center & Activity Feed')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by Tx Hash/i)).toBeInTheDocument();

    const grantMethods = screen.getAllByText('grant_hospital_rights()');
    expect(grantMethods.length).toBeGreaterThan(0);

    const uploadMethods = screen.getAllByText('upload_record()');
    expect(uploadMethods.length).toBeGreaterThan(0);

    const requestMethods = screen.getAllByText('request_access()');
    expect(requestMethods.length).toBeGreaterThan(0);
  });
});
