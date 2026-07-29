'use client';

// ============================================================
// MediChain Transaction Context — Activity Feed & Lifecycle
// ============================================================
// Manages real-time Soroban on-chain transaction lifecycle:
// Pending -> Processing -> Confirmed / Failed.
// Zero hardcoded dummy data. Populated strictly when on-chain actions occur.
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { TransactionItem, TransactionStatus } from '../types/medichain';

const STORAGE_TX_KEY = 'medichain_transactions_v2';

export interface TransactionContextType {
  transactions: TransactionItem[];
  addTransaction: (tx: Omit<TransactionItem, 'id' | 'timestamp' | 'status' | 'explorerUrl'>) => string;
  updateTransactionStatus: (
    id: string,
    status: TransactionStatus,
    updates?: { hash?: string; error?: string; returnValue?: string }
  ) => void;
  clearTransactions: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  // Load real transactions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_TX_KEY);
      if (stored) {
        setTransactions(JSON.parse(stored));
      } else {
        setTransactions([]);
      }
    } catch {
      setTransactions([]);
    }
  }, []);

  // Add a new real transaction
  const addTransaction = useCallback(
    (txData: Omit<TransactionItem, 'id' | 'timestamp' | 'status' | 'explorerUrl'>): string => {
      const id = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newTx: TransactionItem = {
        ...txData,
        id,
        status: 'Pending',
        timestamp: Date.now(),
        explorerUrl: txData.hash
          ? `https://stellar.expert/explorer/testnet/tx/${txData.hash}`
          : `https://stellar.expert/explorer/testnet/contract/${txData.contractId}`,
      };

      setTransactions((prev) => {
        const updated = [newTx, ...prev];
        try {
          localStorage.setItem(STORAGE_TX_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      return id;
    },
    []
  );

  // Update existing transaction status
  const updateTransactionStatus = useCallback(
    (
      id: string,
      status: TransactionStatus,
      updates?: { hash?: string; error?: string; returnValue?: string }
    ) => {
      setTransactions((prev) => {
        const updated = prev.map((item) => {
          if (item.id === id) {
            const hash = updates?.hash || item.hash;
            return {
              ...item,
              status,
              hash,
              error: updates?.error || item.error,
              explorerUrl: hash
                ? `https://stellar.expert/explorer/testnet/tx/${hash}`
                : item.explorerUrl,
            };
          }
          return item;
        });

        try {
          localStorage.setItem(STORAGE_TX_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    []
  );

  // Clear transactions
  const clearTransactions = useCallback(() => {
    setTransactions([]);
    try {
      localStorage.removeItem(STORAGE_TX_KEY);
    } catch {}
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransactionStatus,
        clearTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}
