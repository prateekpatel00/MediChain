'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Shield,
  Activity,
  FileText,
  Lock,
  Unlock,
  Key,
  Database,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Share2,
  Building2,
  Stethoscope,
  Clock,
  Eye,
  ChevronDown,
  Loader2,
  WifiOff,
  FlaskConical,
  HeartPulse,
  ExternalLink,
  Upload,
  Download,
  Zap,
  ArrowRight,
  Copy,
  Check,
  FileCheck,
  FileUp,
  Sparkles,
  ArrowLeft,
  Ban,
} from 'lucide-react';

import type {
  HospitalContext,
  WalletState,
  PatientRecord,
  AccessRequest,
  FetchedMedicalData,
  StatusMessage,
} from '../../types/medichain';

import {
  connectFreighter,
  checkFreighterInstalled,
  invokeSorobanContract,
  addressToScVal,
  stringToScVal,
  CONTRACT_ID,
  STELLAR_TESTNET_RPC,
} from '../../utils/stellar';

import {
  seedDemoRecords,
  simulateIPFSUpload,
  simulateIPFSFetch,
  getRecordByCidOrPatientId,
  computeSHA256,
  computeFileSHA256,
  type UploadedFileData,
} from '../../utils/ipfsMock';

// ============================================================
// DEMO HOSPITAL CONFIG
// ============================================================
const HOSPITALS = {
  bangalore: {
    id: 'bangalore' as HospitalContext,
    name: 'Apollo Hospitals',
    shortName: 'Apollo Bangalore',
    location: 'Bangalore, KA',
    fullLabel: 'Apollo Hospitals — Bangalore',
    color: 'cyan',
    gradient: 'from-cyan-600 to-teal-500',
    border: 'border-cyan-500/40',
    glow: 'shadow-cyan-500/20',
  },
  jabalpur: {
    id: 'jabalpur' as HospitalContext,
    name: 'AIIMS',
    shortName: 'AIIMS Jabalpur',
    location: 'Jabalpur, MP',
    fullLabel: 'AIIMS — Jabalpur',
    color: 'violet',
    gradient: 'from-violet-600 to-purple-500',
    border: 'border-violet-500/40',
    glow: 'shadow-violet-500/20',
  },
} as const;

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function TxHashBadge({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false);
  const short = `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  const url = `https://stellar.expert/explorer/testnet/tx/${hash}`;
  return (
    <div className="flex items-center gap-2 mt-2 font-mono text-[11px]">
      <span className="text-slate-400">TxHash:</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-300 hover:text-cyan-100 underline underline-offset-2 flex items-center gap-1"
      >
        {short}
        <ExternalLink className="w-3 h-3" />
      </a>
      <button
        onClick={() => {
          navigator.clipboard.writeText(hash);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="text-slate-500 hover:text-slate-300"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// ============================================================
// MAIN HOSPITAL DASHBOARD
// ============================================================
export default function HospitalDashboard() {
  // ── Context Switcher ──────────────────────────────────────
  const [context, setContext] = useState<HospitalContext>('bangalore');
  const [activeTab, setActiveTab] = useState<'upload' | 'requests' | 'approved'>('upload');
  const [contextDropdownOpen, setContextDropdownOpen] = useState(false);
  const hosp = HOSPITALS[context];

  // ── Wallet State ─────────────────────────────────────────
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [freighterInstalled, setFreighterInstalled] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // ── Records & Requests State ──────────────────────────────
  const [bangaloreRecords, setBangaloreRecords] = useState<PatientRecord[]>([
    {
      patientId: 'PAT-001-BLR',
      patientName: 'Arjun Mehta',
      category: 'Blood Diagnostics',
      ipfsCid: 'QmMediChainBLD001BangaloreArjunBloodReport2024',
      owningHospitalName: 'Apollo Hospitals, Bangalore',
      uploadedAt: Date.now() - 86400000 * 5,
      txHash: 'DEMO_SEEDED_TX_001',
    },
    {
      patientId: 'PAT-002-BLR',
      patientName: 'Priya Nair',
      category: 'Cardiology ECG',
      ipfsCid: 'QmMediChainCRD002BanglorePrivaCardiologyECG2024',
      owningHospitalName: 'Apollo Hospitals, Bangalore',
      uploadedAt: Date.now() - 86400000 * 3,
      txHash: 'DEMO_SEEDED_TX_002',
    },
  ]);

  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [fetchedData, setFetchedData] = useState<Record<string, FetchedMedicalData>>({});
  const [fetchingCid, setFetchingCid] = useState<string | null>(null);

  // ── Upload Form State ─────────────────────────────────────
  const [uploadPatientId, setUploadPatientId] = useState('');
  const [uploadPatientName, setUploadPatientName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<PatientRecord['category']>('Blood Diagnostics');
  const [uploadFindings, setUploadFindings] = useState('');
  const [uploadVitals, setUploadVitals] = useState('');
  const [liveHash, setLiveHash] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileData, setFileData] = useState<UploadedFileData | null>(null);
  const [isHashingFile, setIsHashingFile] = useState(false);

  // ── Request Form State ────────────────────────────────────
  const [reqPatientId, setReqPatientId] = useState('');
  const [reqReason, setReqReason] = useState('');

  // ── UI Toast ──────────────────────────────────────────────
  const [status, setStatus] = useState<StatusMessage | null>({
    type: 'info',
    title: 'Hospital Node Connected — Soroban Testnet',
    desc: `Contract ID: ${CONTRACT_ID.slice(0, 12)}...`,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkFreighterInstalled().then(setFreighterInstalled);
    seedDemoRecords();
  }, []);

  // ── Live SHA-256 preview ──────────────────────────────────
  useEffect(() => {
    if (fileData) {
      setLiveHash(fileData.fileHash);
    } else if (uploadPatientId || uploadFindings) {
      computeSHA256(`${uploadPatientId}:${uploadCategory}:${uploadFindings}`).then(setLiveHash);
    } else {
      setLiveHash('');
    }
  }, [uploadPatientId, uploadCategory, uploadFindings, fileData]);

  // ── Native WebCrypto Hashing ──────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFileData(null);
      return;
    }
    setIsHashingFile(true);
    try {
      const result = await computeFileSHA256(file);
      setFileData({
        fileName: result.fileName,
        fileSize: result.fileSize,
        fileType: result.fileType,
        fileHash: result.hash,
        dataUrl: result.dataUrl,
      });
      setLiveHash(result.hash);
    } catch (err: any) {
      setStatus({ type: 'error', title: 'File Hashing Error', desc: err.message });
    } finally {
      setIsHashingFile(false);
    }
  };

  // ── Connect Wallet ────────────────────────────────────────
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const info = await connectFreighter();
      setWallet({ address: info.address, isConnected: true, network: info.network });
      setStatus({
        type: 'success',
        title: 'Freighter Wallet Connected',
        desc: `${info.address.slice(0, 8)}...${info.address.slice(-6)} on ${info.network}`,
      });
    } catch (err: any) {
      setStatus({ type: 'error', title: 'Wallet Connection Failed', desc: err.message });
    } finally {
      setIsConnecting(false);
    }
  };

  // ── Action: Upload Record (on-chain 3-tier check) ─────────
  const handleUploadRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;
    if (!uploadPatientId || !uploadPatientName || !uploadFindings) return;

    setIsProcessing(true);
    setStatus({
      type: 'loading',
      title: 'Step 1/2 — Uploading File to IPFS…',
      desc: 'Encrypting payload & generating IPFS CID hash.',
    });

    try {
      const cid = await simulateIPFSUpload({
        patientId: uploadPatientId,
        patientName: uploadPatientName,
        category: uploadCategory as any,
        findings: uploadFindings,
        vitals: uploadVitals ? { Notes: uploadVitals } : { bloodPressure: 'Normal' },
        physician: `Physician at ${hosp.name}`,
        hospitalName: hosp.fullLabel,
        uploadedAt: Date.now(),
        fileData: fileData || undefined,
      });

      setStatus({
        type: 'loading',
        title: 'Step 2/2 — Executing upload_record on Soroban…',
        desc: 'Verifying Govt authorization & committing CID hash on-chain via Freighter popup.',
      });

      const result = await invokeSorobanContract(
        'upload_record',
        [
          addressToScVal(wallet.address),
          stringToScVal(uploadPatientId),
          stringToScVal(cid),
        ],
        wallet.address
      );

      if (!result.success) throw new Error(result.error);

      const newRecord: PatientRecord = {
        patientId: uploadPatientId,
        patientName: uploadPatientName,
        category: uploadCategory,
        ipfsCid: cid,
        owningHospitalName: hosp.fullLabel,
        owningHospitalWallet: wallet.address,
        uploadedAt: Date.now(),
        txHash: result.txHash!,
        fileData: fileData || undefined,
      };

      setBangaloreRecords((prev) => [newRecord, ...prev]);
      setUploadPatientId('');
      setUploadPatientName('');
      setUploadFindings('');
      setUploadVitals('');
      setFileData(null);
      setLiveHash('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      setStatus({
        type: 'success',
        title: '✅ File Hash Committed to Soroban Ledger',
        desc: `IPFS CID: ${cid} | Verified on-chain via Govt RBAC. Zero raw PHI on Stellar.`,
        txHash: result.txHash,
      });
    } catch (err: any) {
      setStatus({ type: 'error', title: 'Upload Failed (RBAC / Soroban)', desc: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Action: Request Access ────────────────────────────────
  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !reqPatientId || !reqReason) return;

    setIsProcessing(true);
    setStatus({
      type: 'loading',
      title: 'Submitting request_access on Soroban…',
      desc: 'Freighter will open — approve to log inter-hospital access request on-chain.',
    });

    try {
      const targetWallet = bangaloreRecords.find((r) => r.patientId === reqPatientId)?.owningHospitalWallet || wallet.address;

      const result = await invokeSorobanContract(
        'request_access',
        [
          addressToScVal(wallet.address),
          addressToScVal(targetWallet),
          stringToScVal(reqPatientId),
          stringToScVal(reqReason),
        ],
        wallet.address
      );

      if (!result.success) throw new Error(result.error);

      const newReq: AccessRequest = {
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        requestingHospitalName: hosp.fullLabel,
        requestingHospitalWallet: wallet.address,
        targetHospitalName: HOSPITALS.bangalore.fullLabel,
        targetHospitalWallet: targetWallet,
        patientId: reqPatientId,
        patientName: 'Patient ' + reqPatientId,
        clinicalReason: reqReason,
        status: 'Pending',
        requestedAt: Date.now(),
        requestTxHash: result.txHash!,
      };

      setAccessRequests((prev) => [newReq, ...prev]);
      setReqPatientId('');
      setReqReason('');

      setStatus({
        type: 'success',
        title: '✅ Access Request Logged On-Chain',
        desc: `Request for ${newReq.patientId} logged on Soroban with reason: "${newReq.clinicalReason}".`,
        txHash: result.txHash,
      });
    } catch (err: any) {
      setStatus({ type: 'error', title: 'Request Failed', desc: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Action: Approve Access ────────────────────────────────
  const handleApproveAccess = async (request: AccessRequest) => {
    if (!wallet) return;

    setIsProcessing(true);
    setStatus({
      type: 'loading',
      title: 'Executing approve_access on Soroban…',
      desc: `Freighter will open — approve to grant ${request.requestingHospitalName} access.`,
    });

    try {
      const result = await invokeSorobanContract(
        'approve_access',
        [
          addressToScVal(wallet.address),
          addressToScVal(request.requestingHospitalWallet),
          stringToScVal(request.patientId),
        ],
        wallet.address
      );

      if (!result.success) throw new Error(result.error);

      setAccessRequests((prev) =>
        prev.map((r) =>
          r.id === request.id
            ? { ...r, status: 'Approved', grantedAt: Date.now(), grantTxHash: result.txHash }
            : r
        )
      );

      setStatus({
        type: 'success',
        title: '✅ Access Approved On-Chain',
        desc: `${request.requestingHospitalName} authorized to view ${request.patientId} via Soroban permission matrix.`,
        txHash: result.txHash,
      });
    } catch (err: any) {
      setStatus({ type: 'error', title: 'Approve Failed', desc: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Action: Reject Access ────────────────────────────────
  const handleRejectAccess = async (request: AccessRequest) => {
    if (!wallet) return;

    setIsProcessing(true);
    setStatus({
      type: 'loading',
      title: 'Executing reject_access on Soroban…',
      desc: 'Freighter will open — approve to reject access request.',
    });

    try {
      const result = await invokeSorobanContract(
        'reject_access',
        [
          addressToScVal(wallet.address),
          addressToScVal(request.requestingHospitalWallet),
          stringToScVal(request.patientId),
        ],
        wallet.address
      );

      if (!result.success) throw new Error(result.error);

      setAccessRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status: 'Rejected' } : r))
      );

      setStatus({
        type: 'info',
        title: '❌ Access Request Rejected On-Chain',
        desc: `Access request for ${request.patientId} rejected on Soroban ledger.`,
        txHash: result.txHash,
      });
    } catch (err: any) {
      setStatus({ type: 'error', title: 'Reject Failed', desc: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Action: View / Fetch Approved Record ──────────────────
  const handleViewRecord = async (request: AccessRequest) => {
    if (!wallet) return;

    setFetchingCid(request.patientId);
    setStatus({
      type: 'loading',
      title: 'Calling view_record() on Soroban…',
      desc: 'Contract will return IPFS CID only if caller has Approved status on-chain.',
    });

    try {
      const result = await invokeSorobanContract(
        'view_record',
        [addressToScVal(wallet.address), stringToScVal(request.patientId)],
        wallet.address
      );

      if (!result.success) throw new Error(result.error || 'Access Denied by Soroban Contract');

      const cid = result.returnValue;
      const lookupKey = cid || request.patientId;

      const ipfsData = await simulateIPFSFetch(lookupKey);
      const fallback = !ipfsData ? getRecordByCidOrPatientId(request.patientId) : null;
      const finalReport = ipfsData || fallback;

      if (!finalReport) throw new Error(`IPFS data not found for CID: ${lookupKey}`);

      const fetched: FetchedMedicalData = {
        patientName: finalReport.patientName,
        category: finalReport.category,
        findings: finalReport.findings,
        vitals: finalReport.vitals as Record<string, string>,
        labResults: finalReport.labResults,
        physician: finalReport.physician,
        cid: finalReport.cid,
        fetchedAt: Date.now(),
        fileData: finalReport.fileData,
      };

      setFetchedData((prev) => ({ ...prev, [request.patientId]: fetched }));
      setStatus({
        type: 'success',
        title: '✅ Verified & Retreived via IPFS',
        desc: `On-chain check passed. Medical data & files fetched for ${request.patientId}.`,
        txHash: result.txHash,
      });
    } catch (err: any) {
      setStatus({ type: 'error', title: '🔒 Access Denied by Soroban', desc: err.message });
    } finally {
      setFetchingCid(null);
    }
  };

  const pendingRequests = accessRequests.filter((r) => r.status === 'Pending');
  const approvedRequests = accessRequests.filter((r) => r.status === 'Approved');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Background glow */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Healthcare Institution Portal</h1>
                <p className="text-[10px] text-cyan-400 font-medium">Inter-Hospital Exchange Node</p>
              </div>
            </div>
          </div>

          {/* DEMO CONTEXT SWITCHER DROPDOWN */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setContextDropdownOpen((v) => !v)}
              className={`
                flex items-center gap-2.5 px-4 py-2 rounded-xl border text-xs font-semibold
                transition-all
                ${context === 'bangalore'
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                  : 'bg-violet-950/40 border-violet-500/50 text-violet-300'}
              `}
            >
              <span className={`w-2 h-2 rounded-full ${context === 'bangalore' ? 'bg-cyan-400' : 'bg-violet-400'}`} />
              <span>Switch Hospital View: <strong>{HOSPITALS[context].shortName}</strong></span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {contextDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 glass-panel border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-slate-700">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Demo Context Switcher</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Switch view to demo 2 hospitals on 1 screen</p>
                </div>
                {(['bangalore', 'jabalpur'] as HospitalContext[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => {
                      setContext(id);
                      setContextDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-slate-800/60 ${context === id ? 'bg-slate-800' : ''}`}
                  >
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    <div>
                      <p className="text-xs font-bold text-white">{HOSPITALS[id].fullLabel}</p>
                      <p className="text-[10px] text-slate-400">{HOSPITALS[id].location}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* WALLET BUTTON */}
          <button
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold
              transition-all
              ${wallet
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-cyan-500/30 text-cyan-300 hover:border-cyan-400'}
            `}
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : wallet ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Key className="w-4 h-4" />
            )}
            <span>{wallet ? 'Freighter Connected' : 'Connect Freighter'}</span>
          </button>

        </div>
      </header>

      {/* STATUS BANNER */}
      {status && (
        <div className="max-w-7xl mx-auto px-6 mt-4 w-full">
          <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 backdrop-blur-md ${
            status.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
              : status.type === 'error'
              ? 'bg-rose-950/50 border-rose-500/40 text-rose-200'
              : 'bg-cyan-950/50 border-cyan-500/40 text-cyan-200'
          }`}>
            <div className="flex items-start gap-3">
              {status.type === 'loading' ? (
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin mt-0.5" />
              ) : status.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
              ) : (
                <Activity className="w-5 h-5 text-cyan-400 mt-0.5" />
              )}
              <div>
                <p className="font-semibold text-sm">{status.title}</p>
                <p className="text-xs opacity-90 mt-0.5">{status.desc}</p>
                {status.txHash && <TxHashBadge hash={status.txHash} />}
              </div>
            </div>
            <button onClick={() => setStatus(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8">

        {/* CONTEXT BANNER */}
        <div className={`p-4 rounded-2xl border ${hosp.border} bg-gradient-to-r ${
          context === 'bangalore' ? 'from-cyan-950/30 to-teal-950/20' : 'from-violet-950/30 to-purple-950/20'
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${hosp.gradient} flex items-center justify-center shadow-lg`}>
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">{hosp.fullLabel}</p>
                <p className="text-xs text-slate-400">
                  {context === 'bangalore'
                    ? 'Apollo Bangalore Node — Upload records & approve/reject access requests'
                    : 'AIIMS Jabalpur Node — Request patient data & retrieve approved files'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
                Govt-Authorized Node
              </span>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-800 gap-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'upload' ? 'text-cyan-400 border-cyan-400' : 'text-slate-400 border-transparent'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Record &amp; File
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'requests' ? 'text-cyan-400 border-cyan-400' : 'text-slate-400 border-transparent'
            }`}
          >
            <Share2 className="w-4 h-4" />
            Action Center (Requests)
            {pendingRequests.length > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'approved' ? 'text-cyan-400 border-cyan-400' : 'text-slate-400 border-transparent'
            }`}
          >
            <Eye className="w-4 h-4" />
            Request Data &amp; Approved Files
          </button>
        </div>

        {/* ── TAB 1: UPLOAD RECORD WITH NATIVE FILE HASHING ── */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Upload Form */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-cyan-400" />
                  Upload &amp; Hash Medical Report
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a PDF/Image. WebCrypto computes binary SHA-256 hash. Enforces 3-Tier Govt RBAC on-chain.
                </p>
              </div>

              <form onSubmit={handleUploadRecord} className="space-y-4">
                {/* File picker */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Medical Report File (PDF / Image)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      fileData ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-slate-700 bg-slate-900/60'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {isHashingFile ? (
                      <div className="flex flex-col items-center gap-2 py-1">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                        <p className="text-xs text-cyan-300 font-semibold">Computing SHA-256 binary hash…</p>
                      </div>
                    ) : fileData ? (
                      <div className="flex items-center justify-between text-left">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-5 h-5 text-emerald-400" />
                          <div>
                            <p className="text-xs font-bold text-white truncate max-w-[180px]">{fileData.fileName}</p>
                            <p className="text-[10px] text-slate-400">{formatBytes(fileData.fileSize)}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                          ✓ SHA-256 Hashed
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 py-1">
                        <FileUp className="w-7 h-7 text-cyan-400/80" />
                        <p className="text-xs font-semibold text-slate-200">Click to select PDF or Image</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">Patient ID</label>
                    <input
                      type="text"
                      required
                      placeholder="PAT-001-BLR"
                      value={uploadPatientId}
                      onChange={(e) => setUploadPatientId(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">Patient Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Arjun Mehta"
                      value={uploadPatientName}
                      onChange={(e) => setUploadPatientName(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e: any) => setUploadCategory(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option>Blood Diagnostics</option>
                    <option>MRI Scan</option>
                    <option>Cardiology ECG</option>
                    <option>Oncology Report</option>
                    <option>General Checkup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">Clinical Notes</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Clinical findings & report summary..."
                    value={uploadFindings}
                    onChange={(e) => setUploadFindings(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                {liveHash && (
                  <div className="p-3 bg-slate-900 border border-cyan-500/30 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">SHA-256 On-Chain Commitment:</p>
                    <p className="font-mono text-[10px] text-cyan-200 break-all bg-slate-950 p-2 rounded border border-slate-800">{liveHash}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing || !wallet}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 disabled:from-slate-700 text-white font-bold rounded-xl shadow-lg transition-all text-xs flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>Commit File Hash to Soroban</span>
                </button>
              </form>
            </div>

            {/* Registry List */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                Hospital Patient Hashes Registry
              </h2>

              <div className="space-y-3">
                {bangaloreRecords.map((r) => (
                  <div key={r.patientId} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-sm">{r.patientName}</p>
                        <p className="font-mono text-[11px] text-cyan-400">{r.patientId} · {r.category}</p>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-slate-800 text-slate-300 rounded-lg">
                        Verified On-Chain
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-slate-500 uppercase">IPFS CID:</span>
                      <span className="font-mono text-emerald-400 truncate">{r.ipfsCid}</span>
                    </div>
                    <TxHashBadge hash={r.txHash} />
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── TAB 2: ACTION CENTER (INCOMING REQUESTS WITH REASON, APPROVE & REJECT) ── */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-cyan-400" />
              Action Center: Inter-Hospital Requests
            </h2>

            {accessRequests.length === 0 ? (
              <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center">
                <Share2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">No access requests received yet</p>
                <p className="text-xs text-slate-500 mt-1">Switch to AIIMS Jabalpur view to submit an access request</p>
              </div>
            ) : (
              <div className="space-y-4">
                {accessRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`glass-panel p-5 rounded-2xl border ${
                      req.status === 'Pending'
                        ? 'border-amber-500/40 bg-amber-950/10'
                        : req.status === 'Approved'
                        ? 'border-emerald-500/40 bg-emerald-950/10'
                        : 'border-rose-500/40 bg-rose-950/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                              req.status === 'Pending'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : req.status === 'Approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            Status: {req.status}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">{req.id}</span>
                        </div>
                        <p className="font-bold text-white text-sm">{req.requestingHospitalName}</p>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Requesting access to patient: <span className="font-mono text-cyan-400 font-bold">{req.patientId}</span>
                        </p>
                      </div>

                      {/* APPROVE & REJECT BUTTONS */}
                      {req.status === 'Pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveAccess(req)}
                            disabled={isProcessing || !wallet}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectAccess(req)}
                            disabled={isProcessing || !wallet}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                          >
                            <Ban className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* CLINICAL REASON DISPLAY */}
                    <div className="mt-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stated Clinical Reason:</p>
                      <p className="text-xs text-slate-200 mt-0.5">{req.clinicalReason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: REQUEST DATA & TRACKER (WITH APPROVED FILE DOWNLOAD) ── */}
        {activeTab === 'approved' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Request Data Form */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-violet-400" />
                  Request Patient Data On-Chain
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submits an inter-hospital request logged on Soroban ledger.
                </p>
              </div>

              <form onSubmit={handleRequestAccess} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">Patient ID</label>
                  <input
                    type="text"
                    required
                    placeholder="PAT-001-BLR"
                    value={reqPatientId}
                    onChange={(e) => setReqPatientId(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">Clinical Reason for Request</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Patient transferred for emergency orthopaedic consult. Require prior scans..."
                    value={reqReason}
                    onChange={(e) => setReqReason(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !wallet}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 text-white font-bold rounded-xl shadow-lg transition-all text-xs flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                  <span>Submit Request via Freighter</span>
                </button>
              </form>
            </div>

            {/* Approved Records Viewer & Downloads */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-violet-400" />
                Approved Patient File Viewer &amp; Downloads
              </h2>

              {approvedRequests.length === 0 ? (
                <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center">
                  <Lock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">No approved records available</p>
                  <p className="text-xs text-slate-500 mt-1">Submit a request, then switch view to Apollo Bangalore to approve it</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedRequests.map((req) => {
                    const data = fetchedData[req.patientId];
                    const isFetching = fetchingCid === req.patientId;

                    return (
                      <div key={req.id} className="glass-panel rounded-2xl border border-emerald-500/40 overflow-hidden">
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <span className="font-bold text-white text-sm">{req.patientId}</span>
                            <span className="ml-2 px-2 py-0.5 text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                              Approved On-Chain
                            </span>
                          </div>

                          {!data && (
                            <button
                              onClick={() => handleViewRecord(req)}
                              disabled={isFetching || !wallet}
                              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all"
                            >
                              {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                              <span>Fetch via IPFS</span>
                            </button>
                          )}
                        </div>

                        {data && (
                          <div className="p-5 space-y-4">
                            <div className="flex items-center gap-2 p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-emerald-300">On-Chain Permission Verified</p>
                                <p className="text-[10px] font-mono text-slate-400">CID: {data.cid}</p>
                              </div>
                            </div>

                            {data.fileData && (
                              <div className="p-4 bg-slate-900 border border-cyan-500/30 rounded-xl flex items-center justify-between flex-wrap gap-3">
                                <div>
                                  <p className="text-xs font-bold text-white">{data.fileData.fileName}</p>
                                  <p className="text-[10px] text-slate-400">{formatBytes(data.fileData.fileSize)} · {data.fileData.fileType}</p>
                                  <p className="text-[10px] font-mono text-emerald-400 mt-1">SHA-256: {data.fileData.fileHash.slice(0, 24)}...</p>
                                </div>
                                <a
                                  href={data.fileData.dataUrl}
                                  download={data.fileData.fileName}
                                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                                >
                                  <Download className="w-4 h-4" />
                                  Download Report
                                </a>
                              </div>
                            )}

                            <div>
                              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Clinical Findings:</p>
                              <p className="text-xs text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800">{data.findings}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
