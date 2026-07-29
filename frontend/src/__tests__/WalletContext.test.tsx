import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WalletProvider, useWallet } from '../context/WalletContext';

function TestConsumer() {
  const { wallet } = useWallet();
  return (
    <div>
      <span data-testid="address">{wallet.address || 'Disconnected'}</span>
      <span data-testid="status">{wallet.isConnected ? 'Connected' : 'Disconnected'}</span>
    </div>
  );
}

describe('WalletContext', () => {
  it('provides default disconnected wallet state on initial mount', () => {
    render(
      <WalletProvider>
        <TestConsumer />
      </WalletProvider>
    );

    expect(screen.getByTestId('address')).toHaveTextContent('Disconnected');
    expect(screen.getByTestId('status')).toHaveTextContent('Disconnected');
  });
});
