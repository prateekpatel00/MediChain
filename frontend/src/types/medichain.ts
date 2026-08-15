// ============================================================
// MediChain Type Definitions
// ============================================================

import type { UploadedFileData } from '../utils/ipfsMock';

/** Which hospital context is active in the UI demo switcher */
export type HospitalContext = 'bangalore' | 'jabalpur';

/** Predefined demo hospital nodes */
export interface DemoHospital {
  id: HospitalContext;
  name: string;
  shortName: string;
  location: string;
  color: 'cyan' | 'violet';
  walletAddress?: string;
}

/** Supported Stellar Wallets Kit wallet metadata */
export interface SupportedWallet {
  id: string;
  name: string;
  iconUrl?: string;
  isAvailable: boolean;
  type: 'extension' | 'web' | 'hardware';
}

/** State of the connected wallet */
export interface WalletState {
  address: string | null;
  isConnected: boolean;
  walletId: string | null;
  walletName: string | null;
  network: string;
}

/** Transaction lifecycle status */
export type TransactionStatus = 'Pending' | 'Processing' | 'Confirmed' | 'Failed';

/** Which Soroban contract was involved */
export type ContractType = 'Registry Contract' | 'Core Contract';

/** Recorded on-chain transaction item for the Transaction Center */
export interface TransactionItem {
  id: string;
  hash: string;
  method:
    | 'initialize'
    | 'add_hospital'
    | 'remove_hospital'
    | 'upload_record'
    | 'request_access'
    | 'approve_access'
    | 'reject_access'
    | 'view_record';
  contractType: ContractType;
  contractId: string;
  status: TransactionStatus;
  timestamp: number;
  details: string;
  caller: string;
  error?: string;
  explorerUrl: string;
}

/** On-chain patient record metadata (mirrors contract RecordMeta) */
export interface PatientRecord {
  patientId: string;
  patientName: string;
  category: string;
  ipfsCid: string;
  owningHospitalName: string;
  owningHospitalWallet?: string;
  uploadedAt: number;
  txHash: string;
  fileData?: UploadedFileData;
}

/** An inter-hospital access request (mirrors contract AccessRequest) */
export interface AccessRequest {
  id: string;
  requestingHospitalName: string;
  requestingHospitalWallet: string;
  targetHospitalName: string;
  targetHospitalWallet: string;
  patientId: string;
  patientName: string;
  clinicalReason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: number;
  grantedAt?: number;
  requestTxHash: string;
  grantTxHash?: string;
}

/** Fetched IPFS medical data, displayed after access is granted */
export interface FetchedMedicalData {
  patientName: string;
  category: string;
  findings: string;
  vitals: Record<string, string>;
  labResults?: Record<string, string>;
  physician: string;
  cid: string;
  fetchedAt: number;
  fileData?: UploadedFileData;
}

/** Status toast notification */
export interface StatusMessage {
  type: 'success' | 'error' | 'info' | 'loading';
  title: string;
  desc: string;
  txHash?: string;
}
