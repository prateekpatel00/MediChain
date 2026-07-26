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

/** State of the connected Freighter wallet */
export interface WalletState {
  address: string;
  isConnected: boolean;
  network: string;
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
