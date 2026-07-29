'use client';

// ============================================================
// MediChain Wallet Context — Enterprise Stellar Wallets Kit Integration
// ============================================================
// Supports Freighter, Albedo, xBull, Hana, and LOBSTR wallets.
// Triggers native extension authorization popups and handles session persistence.
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';
import { FreighterModule, FREIGHTER_ID } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { AlbedoModule, ALBEDO_ID } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { xBullModule, XBULL_ID } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { HanaModule, HANA_ID } from '@creit.tech/stellar-wallets-kit/modules/hana';
import { LobstrModule, LOBSTR_ID } from '@creit.tech/stellar-wallets-kit/modules/lobstr';

import type { SupportedWallet, WalletState } from '../types/medichain';
import { STELLAR_PASSPHRASE } from '../services/stellar';

const STORAGE_WALLET_ID_KEY = 'medichain_wallet_id';
const STORAGE_WALLET_ADDR_KEY = 'medichain_wallet_address';

export const SUPPORTED_WALLETS: SupportedWallet[] = [
  {
    id: FREIGHTER_ID,
    name: 'Freighter Wallet',
    type: 'extension',
    isAvailable: true,
  },
  {
    id: ALBEDO_ID,
    name: 'Albedo Link',
    type: 'web',
    isAvailable: true,
  },
  {
    id: XBULL_ID,
    name: 'xBull Wallet',
    type: 'extension',
    isAvailable: true,
  },
  {
    id: HANA_ID,
    name: 'Hana Wallet',
    type: 'extension',
    isAvailable: true,
  },
  {
    id: LOBSTR_ID,
    name: 'LOBSTR Wallet',
    type: 'web',
    isAvailable: true,
  },
];

export interface WalletContextType {
  wallet: WalletState;
  isConnecting: boolean;
  isModalOpen: boolean;
  supportedWallets: SupportedWallet[];
  openWalletModal: () => void;
  closeWalletModal: () => void;
  connectWallet: (walletId?: string) => Promise<void>;
  disconnectWallet: () => void;
  signTransaction: (txXdr: string) => Promise<{ signedTxXdr: string }>;
}

const initialWalletState: WalletState = {
  address: null,
  isConnected: false,
  walletId: null,
  walletName: null,
  network: 'Stellar Testnet',
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

let isKitInitialized = false;

function ensureKitInitialized() {
  if (!isKitInitialized && typeof window !== 'undefined') {
    try {
      StellarWalletsKit.init({
        network: Networks.TESTNET,
        modules: [
          new FreighterModule(),
          new AlbedoModule(),
          new xBullModule(),
          new HanaModule(),
          new LobstrModule(),
        ],
      });
      isKitInitialized = true;
    } catch (e) {
      console.warn('StellarWalletsKit init notice:', e);
    }
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(initialWalletState);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openWalletModal = useCallback(() => setIsModalOpen(true), []);
  const closeWalletModal = useCallback(() => setIsModalOpen(false), []);

  useEffect(() => {
    ensureKitInitialized();
  }, []);

  // ── Connect Wallet Function (Fixes Freighter extension popup) ────
  const connectWallet = useCallback(
    async (targetWalletId: string = FREIGHTER_ID) => {
      setIsConnecting(true);
      try {
        ensureKitInitialized();

        let address = '';

        if (targetWalletId === FREIGHTER_ID) {
          const freighterApi = await import('@stellar/freighter-api');
          const installed = await freighterApi.isConnected();
          if (!installed) {
            throw new Error(
              'Freighter extension is not installed or enabled in browser. Please install Freighter from https://freighter.app and refresh.'
            );
          }

          // Trigger Freighter extension popup directly
          const keyResult: any = await freighterApi.requestAccess();
          if (keyResult?.error) {
            throw new Error(keyResult.error || 'User cancelled Freighter access request.');
          }

          address = typeof keyResult === 'string' ? keyResult : keyResult?.address || keyResult?.publicKey;

          if (!address) {
            const pubKeyRes: any = await freighterApi.getPublicKey();
            address = typeof pubKeyRes === 'string' ? pubKeyRes : pubKeyRes?.publicKey || pubKeyRes?.address;
          }

          await StellarWalletsKit.setWallet(FREIGHTER_ID);
        } else {
          await StellarWalletsKit.setWallet(targetWalletId);
          const fetchRes = await StellarWalletsKit.fetchAddress();
          address = fetchRes.address;
        }

        if (!address) {
          throw new Error('Wallet returned empty public key address.');
        }

        const walletInfo = SUPPORTED_WALLETS.find((w) => w.id === targetWalletId);
        const walletName = walletInfo?.name || targetWalletId;

        const newState: WalletState = {
          address,
          isConnected: true,
          walletId: targetWalletId,
          walletName,
          network: 'Stellar Testnet',
        };

        setWallet(newState);
        localStorage.setItem(STORAGE_WALLET_ID_KEY, targetWalletId);
        localStorage.setItem(STORAGE_WALLET_ADDR_KEY, address);

        toast.success(`Wallet Connected: ${address.slice(0, 6)}...${address.slice(-4)}`, {
          duration: 4000,
        });

        setIsModalOpen(false);
      } catch (err: any) {
        console.error('Wallet connection error:', err);
        const humanMessage = err.message?.includes('declined') || err.message?.includes('cancelled')
          ? 'Wallet connection rejected by user.'
          : err.message || 'Failed to connect wallet.';

        toast.error(humanMessage, { duration: 5000 });
      } finally {
        setIsConnecting(false);
      }
    },
    []
  );

  // ── Restore Saved Session on Mount ─────────────────────────
  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_WALLET_ID_KEY);
    const savedAddr = localStorage.getItem(STORAGE_WALLET_ADDR_KEY);

    if (savedId && savedAddr) {
      const walletInfo = SUPPORTED_WALLETS.find((w) => w.id === savedId);
      setWallet({
        address: savedAddr,
        isConnected: true,
        walletId: savedId,
        walletName: walletInfo?.name || savedId,
        network: 'Stellar Testnet',
      });
    }
  }, []);

  // ── Disconnect Wallet ──────────────────────────────────────
  const disconnectWallet = useCallback(() => {
    try {
      StellarWalletsKit.disconnect();
    } catch {}
    localStorage.removeItem(STORAGE_WALLET_ID_KEY);
    localStorage.removeItem(STORAGE_WALLET_ADDR_KEY);
    setWallet(initialWalletState);
    toast('Wallet disconnected', { icon: '🔌' });
  }, []);

  // ── Unified Sign Transaction ───────────────────────────────
  const signTransaction = useCallback(
    async (txXdr: string): Promise<{ signedTxXdr: string }> => {
      if (!wallet.isConnected || !wallet.address || !wallet.walletId) {
        toast.error('Please connect your Stellar wallet first.');
        throw new Error('Wallet not connected');
      }

      try {
        if (wallet.walletId === FREIGHTER_ID) {
          const freighterApi = await import('@stellar/freighter-api');
          const signRes: any = await freighterApi.signTransaction(txXdr, {
            network: 'TESTNET',
            networkPassphrase: STELLAR_PASSPHRASE,
            accountToSign: wallet.address,
          });

          if (signRes?.error) {
            throw new Error(signRes.error);
          }

          const signedTxXdr = typeof signRes === 'string' ? signRes : signRes?.signedTxXdr || signRes;
          if (!signedTxXdr || typeof signedTxXdr !== 'string') {
            throw new Error('Freighter returned invalid signed XDR payload.');
          }

          return { signedTxXdr };
        } else {
          ensureKitInitialized();
          await StellarWalletsKit.setWallet(wallet.walletId);
          const result = await StellarWalletsKit.signTransaction(txXdr, {
            networkPassphrase: STELLAR_PASSPHRASE,
            address: wallet.address,
          });

          return { signedTxXdr: result.signedTxXdr };
        }
      } catch (err: any) {
        console.error('Sign transaction error:', err);
        const msg = err.message?.includes('declined') || err.message?.includes('rejected')
          ? 'Transaction signing was rejected by user.'
          : err.message || 'Transaction signing failed.';
        toast.error(msg);
        throw err;
      }
    },
    [wallet]
  );

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isConnecting,
        isModalOpen,
        supportedWallets: SUPPORTED_WALLETS,
        openWalletModal,
        closeWalletModal,
        connectWallet,
        disconnectWallet,
        signTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
