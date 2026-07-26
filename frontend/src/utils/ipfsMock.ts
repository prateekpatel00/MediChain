// ============================================================
// MediChain IPFS Simulation Layer
//
// ARCHITECTURE NOTE:
// Only IPFS CIDs / File Hashes are stored on the Stellar blockchain.
// Raw medical data & files NEVER touch the chain — HIPAA/privacy compliant.
//
// This module simulates the IPFS network for demo purposes:
//   - `computeFileSHA256` → computes binary SHA-256 via browser Web Crypto API
//   - `simulateIPFSUpload` → "pins" report & binary file payload to local storage
//   - `simulateIPFSFetch`  → retrieves report & file payload using CID/Hash
// ============================================================

const IPFS_STORE_KEY = 'medichain_ipfs_store_v4';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface UploadedFileData {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileHash: string; // SHA-256 hex string of binary content
  dataUrl: string; // Base64 Data URL for preview & download
}

export interface MedicalReport {
  patientId: string;
  patientName: string;
  category:
    | 'Blood Diagnostics'
    | 'MRI Scan'
    | 'Cardiology ECG'
    | 'Oncology Report'
    | 'General Checkup';
  findings: string;
  vitals: Record<string, string>;
  labResults?: Record<string, string>;
  physician: string;
  hospitalName: string;
  uploadedAt: number;
  cid: string;
  fileData?: UploadedFileData;
}

// ============================================================
// PRE-SEEDED DEMO DATA (for Apollo Bangalore context)
// ============================================================
const SEED_RECORDS: MedicalReport[] = [
  {
    patientId: 'PAT-001-BLR',
    patientName: 'Arjun Mehta',
    category: 'Blood Diagnostics',
    findings:
      'Complete Blood Count (CBC) within normal limits. RBC: 5.1 M/uL (Normal). WBC: 7,200/uL (Normal). Hemoglobin: 14.2 g/dL (Normal). Platelet count: 2.8 L/uL (Normal). No anemia, infection, or coagulation issues detected.',
    vitals: {
      bloodPressure: '120/80 mmHg',
      heartRate: '72 bpm',
      temperature: '98.6°F',
      oxygenSaturation: '98%',
      glucose: '94 mg/dL (Fasting)',
    },
    labResults: {
      'Blood Urea Nitrogen (BUN)': '14 mg/dL — Normal',
      Creatinine: '0.9 mg/dL — Normal',
      'Sodium (Na+)': '140 mEq/L — Normal',
      'Potassium (K+)': '4.1 mEq/L — Normal',
      'Total Cholesterol': '178 mg/dL — Desirable',
      'HDL Cholesterol': '52 mg/dL — Good',
      'LDL Cholesterol': '98 mg/dL — Optimal',
      Triglycerides: '132 mg/dL — Normal',
      'HbA1c (Glycated Hemoglobin)': '5.4% — Non-Diabetic Range',
      'Thyroid-Stimulating Hormone (TSH)': '2.3 mIU/L — Normal',
    },
    physician: 'Dr. Ramesh Iyer, MD (Internal Medicine)',
    hospitalName: 'Apollo Hospitals, Bangalore',
    uploadedAt: Date.now() - 86400000 * 5,
    cid: 'QmMediChainBLD001BangaloreArjunBloodReport2024',
  },
  {
    patientId: 'PAT-002-BLR',
    patientName: 'Priya Nair',
    category: 'Cardiology ECG',
    findings:
      '12-lead ECG performed. Sinus rhythm, rate 76 bpm. PR interval: 162 ms (Normal). QRS duration: 92 ms (Normal). QT/QTc: 380/423 ms (Normal). No ST elevation or depression. T-wave morphology normal.',
    vitals: {
      bloodPressure: '138/88 mmHg (Mildly Elevated)',
      heartRate: '76 bpm',
      temperature: '98.4°F',
      oxygenSaturation: '97%',
    },
    labResults: {
      'Troponin I': '< 0.03 ng/mL — Negative',
      'BNP (Brain Natriuretic Peptide)': '45 pg/mL — Normal',
      'D-Dimer': '0.3 mg/L — Normal',
    },
    physician: 'Dr. Sunita Rao, DM (Cardiology)',
    hospitalName: 'Apollo Hospitals, Bangalore',
    uploadedAt: Date.now() - 86400000 * 3,
    cid: 'QmMediChainCRD002BanglorePrivaCardiologyECG2024',
  },
];

// ============================================================
// IPFS STORE MANAGEMENT
// ============================================================

function loadStore(): Record<string, MedicalReport> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(IPFS_STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, MedicalReport>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(IPFS_STORE_KEY, JSON.stringify(store));
  } catch (err) {
    console.warn('localStorage save warning (quota exceeded):', err);
  }
}

/** Seeds the demo records into local IPFS store. Call on app init. */
export function seedDemoRecords(): void {
  if (typeof window === 'undefined') return;
  const store = loadStore();
  let changed = false;
  for (const report of SEED_RECORDS) {
    if (!store[report.cid]) {
      store[report.cid] = report;
      store[report.patientId] = report;
      changed = true;
    }
  }
  if (changed) saveStore(store);
}

// ============================================================
// REAL FILE HASHING VIA WEB CRYPTO API
// ============================================================

/**
 * Reads a File object, computes its exact SHA-256 binary hash using crypto.subtle,
 * and converts the file to a Data URL for local IPFS simulation storage.
 */
export async function computeFileSHA256(file: File): Promise<{
  hash: string;
  dataUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}> {
  // 1. Read binary ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // 2. Compute SHA-256 hash using native Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  // 3. Convert file to Base64 Data URL for preview/download
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return {
    hash: hashHex,
    dataUrl,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
  };
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Simulates uploading data & medical report file to IPFS.
 * Returns an IPFS CID (`Qm...`) derived from the binary SHA-256 hash.
 */
export async function simulateIPFSUpload(report: Omit<MedicalReport, 'cid'>): Promise<string> {
  await sleep(600);

  // If a file was uploaded, use its binary SHA-256 hash to create the CID; otherwise derive from string
  const baseHash = report.fileData?.fileHash
    ? report.fileData.fileHash
    : await computeSHA256(
        `${report.patientId}:${report.category}:${report.findings}:${report.uploadedAt}`
      );

  const cid = `QmMediChain${baseHash.substring(0, 32).toUpperCase()}`;
  const fullReport: MedicalReport = { ...report, cid };

  const store = loadStore();
  store[cid] = fullReport;
  store[report.patientId] = fullReport;
  store[baseHash] = fullReport; // Index by exact SHA-256 hash as well
  saveStore(store);

  return cid;
}

/**
 * Simulates fetching data from IPFS by CID or SHA-256 Hash.
 */
export async function simulateIPFSFetch(cidOrHash: string): Promise<MedicalReport | null> {
  await sleep(700);
  const store = loadStore();
  return store[cidOrHash] || null;
}

/**
 * Looks up a record by CID, patient ID, or file hash in local IPFS store.
 */
export function getRecordByCidOrPatientId(key: string): MedicalReport | null {
  const store = loadStore();
  return store[key] || null;
}

// ============================================================
// CRYPTO UTILITIES
// ============================================================

export async function computeSHA256(dataString: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
