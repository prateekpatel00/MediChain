'use client';

// ============================================================
// MediChain useStellar Hook — Level 3 Blockchain Logic Layer
// ============================================================
// Abstracts all smart contract interactions (Registry & Core contracts)
// away from UI components into a clean, reusable React hook.
// Integrates with WalletContext, TransactionContext, and Toast notifications.
// ============================================================

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { xdr } from '@stellar/stellar-sdk';

import { useWallet } from '../context/WalletContext';
import { useTransactions } from '../context/TransactionContext';
import {
  invokeSorobanMethod,
  addressToScVal,
  stringToScVal,
  formatHumanError,
  REGISTRY_CONTRACT_ID,
  CORE_CONTRACT_ID,
  SorobanCallResult,
} from '../services/stellar';

export function useStellar() {
  const { wallet, signTransaction } = useWallet();
  const { addTransaction, updateTransactionStatus } = useTransactions();
  const [isExecuting, setIsExecuting] = useState(false);

  // ── Helper: Execute transaction with lifecycle tracking & toasts ──
  const executeOnChain = useCallback(
    async (
      contractType: 'Registry Contract' | 'Core Contract',
      contractId: string,
      method:
        | 'initialize'
        | 'grant_hospital_rights'
        | 'remove_hospital'
        | 'upload_record'
        | 'request_access'
        | 'approve_access'
        | 'reject_access'
        | 'view_record',
      scArgs: xdr.ScVal[],
      details: string
    ): Promise<SorobanCallResult> => {
      if (!wallet.isConnected || !wallet.address) {
        const errorMsg = 'Please connect your Stellar wallet first.';
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      setIsExecuting(true);

      // 1. Add pending item to Transaction Center
      const txId = addTransaction({
        hash: '',
        method,
        contractType,
        contractId,
        details,
        caller: wallet.address,
      });

      // 2. Display loading toast
      const toastId = toast.loading(`Executing ${method} on-chain... Please approve in wallet.`, {
        duration: 30000,
      });

      try {
        // Update status to Processing
        updateTransactionStatus(txId, 'Processing');

        // 3. Invoke Soroban method
        const result = await invokeSorobanMethod(
          contractId,
          method,
          scArgs,
          wallet.address,
          signTransaction
        );

        if (!result.success) {
          throw new Error(result.error || 'Transaction execution failed.');
        }

        // 4. Update status to Confirmed
        updateTransactionStatus(txId, 'Confirmed', {
          hash: result.txHash,
          returnValue: result.returnValue,
        });

        toast.success(
          `Confirmed on-chain! Tx: ${result.txHash?.slice(0, 8)}...${result.txHash?.slice(-6)}`,
          { id: toastId, duration: 6000 }
        );

        return result;
      } catch (err: any) {
        const humanError = formatHumanError(err.message || 'Transaction failed.');
        updateTransactionStatus(txId, 'Failed', { error: humanError });
        toast.error(humanError, { id: toastId, duration: 6000 });
        return { success: false, error: humanError };
      } finally {
        setIsExecuting(false);
      }
    },
    [wallet, signTransaction, addTransaction, updateTransactionStatus]
  );

  // ── 1. REGISTRY CONTRACT: Grant Hospital Rights ────────────
  const grantHospitalRights = useCallback(
    async (hospitalAddress: string, hospitalName?: string) => {
      if (!wallet.address) return { success: false, error: 'Wallet not connected' };

      return executeOnChain(
        'Registry Contract',
        REGISTRY_CONTRACT_ID,
        'grant_hospital_rights',
        [addressToScVal(wallet.address), addressToScVal(hospitalAddress)],
        `Authorize hospital ${hospitalName || hospitalAddress.slice(0, 10)}... on Registry Whitelist`
      );
    },
    [wallet.address, executeOnChain]
  );

  // ── 2. CORE CONTRACT: Upload Patient Record ─────────────────
  const uploadRecord = useCallback(
    async (hospitalAddress: string, patientId: string, ipfsCid: string) => {
      return executeOnChain(
        'Core Contract',
        CORE_CONTRACT_ID,
        'upload_record',
        [addressToScVal(hospitalAddress), stringToScVal(patientId), stringToScVal(ipfsCid)],
        `Upload record hash ${patientId} (CID: ${ipfsCid.slice(0, 10)}...) to Core Contract`
      );
    },
    [executeOnChain]
  );

  // ── 3. CORE CONTRACT: Request Access ────────────────────────
  const requestAccess = useCallback(
    async (requesterAddress: string, targetHospitalAddress: string, patientId: string, reason: string) => {
      return executeOnChain(
        'Core Contract',
        CORE_CONTRACT_ID,
        'request_access',
        [
          addressToScVal(requesterAddress),
          addressToScVal(targetHospitalAddress),
          stringToScVal(patientId),
          stringToScVal(reason),
        ],
        `Request inter-hospital access for ${patientId} ("${reason}")`
      );
    },
    [executeOnChain]
  );

  // ── 4. CORE CONTRACT: Approve Access ────────────────────────
  const approveAccess = useCallback(
    async (targetHospitalAddress: string, requesterAddress: string, patientId: string) => {
      return executeOnChain(
        'Core Contract',
        CORE_CONTRACT_ID,
        'approve_access',
        [
          addressToScVal(targetHospitalAddress),
          addressToScVal(requesterAddress),
          stringToScVal(patientId),
        ],
        `Approve record access grant for ${patientId} to hospital ${requesterAddress.slice(0, 10)}...`
      );
    },
    [executeOnChain]
  );

  // ── 5. CORE CONTRACT: Reject Access ─────────────────────────
  const rejectAccess = useCallback(
    async (targetHospitalAddress: string, requesterAddress: string, patientId: string) => {
      return executeOnChain(
        'Core Contract',
        CORE_CONTRACT_ID,
        'reject_access',
        [
          addressToScVal(targetHospitalAddress),
          addressToScVal(requesterAddress),
          stringToScVal(patientId),
        ],
        `Reject record access grant for ${patientId}`
      );
    },
    [executeOnChain]
  );

  // ── 6. CORE CONTRACT: View Record (Access Controlled) ──────
  const viewRecord = useCallback(
    async (viewerAddress: string, patientId: string) => {
      return executeOnChain(
        'Core Contract',
        CORE_CONTRACT_ID,
        'view_record',
        [addressToScVal(viewerAddress), stringToScVal(patientId)],
        `Retrieve record hash for ${patientId} (RBAC verified)`
      );
    },
    [executeOnChain]
  );

  return {
    isExecuting,
    grantHospitalRights,
    uploadRecord,
    requestAccess,
    approveAccess,
    rejectAccess,
    viewRecord,
  };
}
