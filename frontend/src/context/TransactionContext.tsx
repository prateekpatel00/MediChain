'use client';

// ============================================================
// MediChain Transaction Context — Activity Feed & Lifecycle
// ============================================================
// Manages the state of all on-chain Soroban transactions, tracking
// their lifecycle: Pending -> Processing -> Confirmed / Failed.
// Persists history to localStorage for the Transaction Center (/transactions).
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { TransactionItem, TransactionStatus, ContractType } from '../types/medichain';
import { REGISTRY_CONTRACT_ID, CORE_CONTRACT_ID } from '../services/stellar';

const STORAGE_TX_KEY = 'medichain_transactions';

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

const initialDemoTransactions: TransactionItem[] = [
  {
    id: 'tx-seed-1',
    hash: '8f7a6b5c4d3e2f1a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a',
    method: 'grant_hospital_rights',
    contractType: 'Registry Contract',
    contractId: REGISTRY_CONTRACT_ID,
    status: 'Confirmed',
    timestamp: Date.now() - 86400000 * 2,
    details: 'Government Super Admin authorized Apollo Hospitals (Bangalore) on Registry Contract',
    caller: 'GBANGALORE99HOSPITAL99STELLAR99999999999999999999999',
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/8f7a6b5c4d3e2f1a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a`,
  },
  {
    id: 'tx-seed-2',
    hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    method: 'upload_record',
    contractType: 'Core Contract',
    contractId: CORE_CONTRACT_ID,
    status: 'Confirmed',
    timestamp: Date.now() - 86400000 * 1,
    details: 'Uploaded patient record hash (PAT-001-BLR) to Core Contract after Registry verification',
    caller: 'GBANGALORE99HOSPITAL99STELLAR99999999999999999999999',
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b`,
  },
  {
    id: 'tx-seed-3',
    hash: '5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e',
    method: 'request_access',
    contractType: 'Core Contract',
    contractId: CORE_CONTRACT_ID,
    status: 'Confirmed',
    timestamp: Date.now() - 3600000 * 4,
    details: 'AIIMS Jabalpur requested access to record PAT-001-BLR for emergency consult',
    caller: 'GJABALPUR88HOSPITAL88STELLAR88888888888888888888888',
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e`,
  },
];

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  // Load transactions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_TX_KEY);
      if (stored) {
        setTransactions(JSON.parse(stored));
      } else {
        setTransactions(initialDemoTransactions);
        localStorage.setItem(STORAGE_TX_KEY, JSON.stringify(initialDemoTransactions));
      }
    } catch {
      setTransactions(initialDemoTransactions);
    }
  }, []);

  // Save transactions to localStorage when updated
  const saveTxList = (list: TransactionItem[]) => {
    setTransactions(list);
    try {
      localStorage.setItem(STORAGE_TX_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  };

  // Add a new transaction
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

  // Clear all transactions
  const clearTransactions = useCallback(() => {
    setTransactions([]);
    localStorage.removeItem(STORAGE_TX_KEY);
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
