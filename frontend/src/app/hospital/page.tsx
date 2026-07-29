'use client';

// ============================================================
// MediChain Hospital Action Center (/hospital)
// ============================================================
// Inter-Hospital Health Data Exchange Portal powered by Soroban Smart Contracts.
// Role-guarded for authorized Hospital Nodes.
// ============================================================

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
  Clock,
  Eye,
  ChevronDown,
  Loader2,
  ExternalLink,
  Upload,
  Zap,
  Copy,
  Check,
  FileCheck,
  FileUp,
  Ban,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

import type {
  PatientRecord,
  AccessRequest,
  FetchedMedicalData,
} from '../../types/medichain';

import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useStellar } from '../../hooks/useStellar';
import { CORE_CONTRACT_ID } from '../../services/stellar';

import {
  simulateIPFSUpload,
  simulateIPFSFetch,
  getRecordByCidOrPatientId,
  computeSHA256,
  computeFileSHA256,
  type UploadedFileData,
} from '../../utils/ipfsMock';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function HospitalDashboard() {
  const { user } = useAuth();
  const { wallet, openWalletModal } = useWallet();
  const {
    uploadRecord,
    requestAccess,
    approveAccess,
    rejectAccess,
    viewRecord,
    isExecuting,
  } = useStellar();

  const [activeTab, setActiveTab] = useState<'upload' | 'requests' | 'approved'>('upload');

  // Records & Requests State
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [fetchedData, setFetchedData] = useState<Record<string, FetchedMedicalData>>({});
  const [fetchingCid, setFetchingCid] = useState<string | null>(null);

  // Upload Form State
  const [uploadPatientId, setUploadPatientId] = useState('');
  const [uploadPatientName, setUploadPatientName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<PatientRecord['category']>('Blood Diagnostics');
  const [uploadFindings, setUploadFindings] = useState('');
  const [uploadVitals, setUploadVitals] = useState('');
  const [liveHash, setLiveHash] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileData, setFileData] = useState<UploadedFileData | null>(null);
  const [isHashingFile, setIsHashingFile] = useState(false);

  // Request Form State
  const [reqPatientId, setReqPatientId] = useState('');
  const [reqReason, setReqReason] = useState('');

  // Live SHA-256 preview
  useEffect(() => {
    if (fileData) {
      setLiveHash(fileData.fileHash);
    } else if (uploadPatientId || uploadFindings) {
      computeSHA256(`${uploadPatientId}:${uploadCategory}:${uploadFindings}`).then(setLiveHash);
    } else {
      setLiveHash('');
    }
  }, [uploadPatientId, uploadCategory, uploadFindings, fileData]);

  // Native WebCrypto Hashing
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
      console.error('File Hashing Error', err);
    } finally {
      setIsHashingFile(false);
    }
  };

  // Action: Upload Record
  const handleUploadRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.isConnected || !wallet.address) {
      openWalletModal();
      return;
    }
    if (!uploadPatientId || !uploadPatientName || !uploadFindings) return;

    try {
      const cid = await simulateIPFSUpload({
        patientId: uploadPatientId,
        patientName: uploadPatientName,
        category: uploadCategory as any,
        findings: uploadFindings,
        vitals: uploadVitals ? { Notes: uploadVitals } : { bloodPressure: 'Normal' },
        physician: `Physician at ${user.hospitalName || 'Hospital Node'}`,
        hospitalName: user.hospitalName || 'Hospital Node',
        uploadedAt: Date.now(),
        fileData: fileData || undefined,
      });

      const res = await uploadRecord(wallet.address, uploadPatientId, cid);

      if (res.success && res.txHash) {
        const newRecord: PatientRecord = {
          patientId: uploadPatientId,
          patientName: uploadPatientName,
          category: uploadCategory,
          ipfsCid: cid,
          owningHospitalName: user.hospitalName || 'Hospital Node',
          owningHospitalWallet: wallet.address,
          uploadedAt: Date.now(),
          txHash: res.txHash,
          fileData: fileData || undefined,
        };

        setPatientRecords((prev) => [newRecord, ...prev]);
        setUploadPatientId('');
        setUploadPatientName('');
        setUploadFindings('');
        setUploadVitals('');
        setFileData(null);
        setLiveHash('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Upload Error', err);
    }
  };

  // Action: Request Access
  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.isConnected || !wallet.address) {
      openWalletModal();
      return;
    }
    if (!reqPatientId || !reqReason) return;

    const targetWallet =
      patientRecords.find((r) => r.patientId === reqPatientId)?.owningHospitalWallet || wallet.address;

    const res = await requestAccess(wallet.address, targetWallet, reqPatientId, reqReason);

    if (res.success && res.txHash) {
      const newReq: AccessRequest = {
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        requestingHospitalName: user.hospitalName || 'Hospital Node',
        requestingHospitalWallet: wallet.address,
        targetHospitalName: 'Target Hospital Node',
        targetHospitalWallet: targetWallet,
        patientId: reqPatientId,
        patientName: 'Patient ' + reqPatientId,
        clinicalReason: reqReason,
        status: 'Pending',
        requestedAt: Date.now(),
        requestTxHash: res.txHash,
      };

      setAccessRequests((prev) => [newReq, ...prev]);
      setReqPatientId('');
      setReqReason('');
    }
  };

  // Action: Approve Access
  const handleApproveAccess = async (request: AccessRequest) => {
    if (!wallet.address) return;

    const res = await approveAccess(wallet.address, request.requestingHospitalWallet, request.patientId);

    if (res.success && res.txHash) {
      setAccessRequests((prev) =>
        prev.map((r) =>
          r.id === request.id
            ? { ...r, status: 'Approved', grantedAt: Date.now(), grantTxHash: res.txHash }
            : r
        )
      );
    }
  };

  // Action: Reject Access
  const handleRejectAccess = async (request: AccessRequest) => {
    if (!wallet.address) return;

    const res = await rejectAccess(wallet.address, request.requestingHospitalWallet, request.patientId);

    if (res.success) {
      setAccessRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status: 'Rejected' } : r))
      );
    }
  };

  // Action: View Record
  const handleViewRecord = async (request: AccessRequest) => {
    if (!wallet.address) return;

    setFetchingCid(request.patientId);

    try {
      const res = await viewRecord(wallet.address, request.patientId);

      if (res.success && res.returnValue) {
        const cid = res.returnValue;
        const lookupKey = cid || request.patientId;

        const ipfsData = await simulateIPFSFetch(lookupKey);
        const fallback = !ipfsData ? getRecordByCidOrPatientId(request.patientId) : null;
        const finalReport = ipfsData || fallback;

        if (finalReport) {
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
        }
      }
    } catch (err) {
      console.error('View record error', err);
    } finally {
      setFetchingCid(null);
    }
  };

  // Role Guarding: Require Hospital Node authentication
  if (user.role !== 'hospital') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-[#070D1F]">
        <div className="max-w-md space-y-4 glass-panel bg-[#0B132B] p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[#0F172A] border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Hospital Node Access Required</h2>
          <p className="text-xs text-slate-400">
            You must be logged in as a verified Healthcare Institution Node to access patient records and request controls.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all w-full"
          >
            <UserCheck className="w-4 h-4" />
            <span>Go to Portal Login</span>
          </Link>
        </div>
      </div>
    );
  }

  const pendingRequests = accessRequests.filter((r) => r.status === 'Pending');
  const approvedRequests = accessRequests.filter((r) => r.status === 'Approved');

  return (
    <div className="min-h-screen flex flex-col bg-[#070D1F] text-slate-100 font-sans">
      {/* Background glow */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* SUB-HEADER */}
      <div className="bg-[#0B132B] border-b border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-cyan-300">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">Node: {user.hospitalName || user.username}</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-[11px] text-slate-400">Core Contract: {CORE_CONTRACT_ID.slice(0, 12)}...</span>
          </div>

          <Link href="/transactions" className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]">
            <span>Activity Log</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">

        {/* TABS */}
        <div className="flex border-b border-slate-800 gap-4 sm:gap-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'upload' ? 'text-cyan-400 border-cyan-400' : 'text-slate-400 border-transparent'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Record &amp; File Hash
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'requests' ? 'text-cyan-400 border-cyan-400' : 'text-slate-400 border-transparent'
            }`}
          >
            <Share2 className="w-4 h-4" />
            Action Center (Requests Queue)
            {pendingRequests.length > 0 && (
              <span className="bg-cyan-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'approved' ? 'text-cyan-400 border-cyan-400' : 'text-slate-400 border-transparent'
            }`}
          >
            <Eye className="w-4 h-4" />
            Request Data &amp; Approved Files
          </button>
        </div>

        {/* TAB 1: UPLOAD RECORD */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form */}
            <div className="lg:col-span-5 glass-panel bg-[#0B132B] p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-cyan-400" />
                  Upload &amp; Hash Medical Report
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  WebCrypto computes binary SHA-256 hash. Cross-contract call verifies Govt Registry whitelist before committing on-chain.
                </p>
              </div>

              <form onSubmit={handleUploadRecord} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Medical Report File (PDF / Image)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                      fileData ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-slate-800 bg-[#0F172A]'
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
                      className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
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
                      className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Blood Diagnostics">Blood Diagnostics (Haematology)</option>
                    <option value="Cardiology ECG">Cardiology ECG / Echo</option>
                    <option value="Radiology MRI/CT">Radiology MRI / CT Scan</option>
                    <option value="Oncology Consult">Oncology Report</option>
                    <option value="General Clinical">General Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">Report Summary</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Hemoglobin 14.2 g/dL, Platelets 250,000/mcL."
                    value={uploadFindings}
                    onChange={(e) => setUploadFindings(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                {liveHash && (
                  <div className="p-3 bg-[#0F172A] border border-slate-800 rounded-xl space-y-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Native WebCrypto SHA-256 Hash</span>
                      <span className="text-cyan-400 font-mono">256-bit</span>
                    </p>
                    <p className="font-mono text-[10px] text-cyan-300 break-all bg-slate-950 p-1.5 rounded border border-slate-800">
                      {liveHash}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isExecuting}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 disabled:from-slate-700 disabled:to-slate-700 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 disabled:shadow-none transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing Transaction...</span>
                    </>
                  ) : !wallet.isConnected ? (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Connect Wallet First</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Commit Record Hash On-Chain</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  On-Chain Record Hashes
                </h2>
                <span className="text-xs text-slate-400 font-mono">{patientRecords.length} Records</span>
              </div>

              {patientRecords.length === 0 ? (
                <div className="glass-panel bg-[#0B132B] p-10 rounded-3xl border border-slate-800 text-center space-y-2">
                  <Database className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    No medical records uploaded yet for this node session. Upload a PDF/Image report to anchor its hash on-chain.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patientRecords.map((rec, i) => (
                    <div key={i} className="glass-panel bg-[#0B132B] p-5 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-cyan-300">{rec.patientId}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-sm font-bold text-white">{rec.patientName}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{rec.category}</p>
                        </div>

                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          CID Hash On-Chain
                        </span>
                      </div>

                      <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono text-xs">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-sans">IPFS CID Hash:</p>
                        <p className="text-cyan-300 text-[11px] break-all">{rec.ipfsCid}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                        <span>Uploaded: {new Date(rec.uploadedAt).toLocaleDateString()}</span>
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${rec.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <span>Tx: {rec.txHash.slice(0, 10)}...</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: REQUESTS QUEUE */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-cyan-400" />
                  Access Request Queue
                </h2>
                <p className="text-xs text-slate-400">
                  Review &amp; approve/reject inter-hospital sharing requests logged on Soroban.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">{accessRequests.length} Total Requests</span>
            </div>

            {accessRequests.length === 0 ? (
              <div className="glass-panel bg-[#0B132B] p-12 rounded-3xl border border-slate-800 text-center space-y-3">
                <Share2 className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Access Requests in Queue</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  When another authorized hospital node requests access to a patient record, it will appear here for on-chain approval.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {accessRequests.map((req) => (
                  <div key={req.id} className="glass-panel bg-[#0B132B] p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{req.requestingHospitalName}</span>
                          <span className="text-xs text-slate-400">requested record</span>
                          <span className="font-mono text-xs font-bold text-cyan-300">{req.patientId}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Clinical Reason: <strong className="text-slate-200 font-normal">"{req.clinicalReason}"</strong>
                        </p>
                      </div>

                      <span
                        className={`
                          px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5
                          ${
                            req.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : req.status === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                          }
                        `}
                      >
                        {req.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {req.status === 'Rejected' && <Ban className="w-3.5 h-3.5 text-rose-400" />}
                        {req.status === 'Pending' && <Clock className="w-3.5 h-3.5 text-cyan-400" />}
                        {req.status}
                      </span>
                    </div>

                    {req.status === 'Pending' && (
                      <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => handleApproveAccess(req)}
                          disabled={isExecuting}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve Access On-Chain</span>
                        </button>
                        <button
                          onClick={() => handleRejectAccess(req)}
                          disabled={isExecuting}
                          className="px-4 py-2 bg-[#0F172A] hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/40 text-rose-400 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                        >
                          <Ban className="w-4 h-4" />
                          <span>Reject Request</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: APPROVED DATA & VIEWER */}
        {activeTab === 'approved' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Request Form */}
            <div className="lg:col-span-5 glass-panel bg-[#0B132B] p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-cyan-400" />
                  Request Patient Record Access
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submit an inter-hospital request to access records owned by another node.
                </p>
              </div>

              <form onSubmit={handleRequestAccess} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Target Patient ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="PAT-001-BLR"
                    value={reqPatientId}
                    onChange={(e) => setReqPatientId(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Clinical Reason
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Urgent cardiology consult for transferred patient."
                    value={reqReason}
                    onChange={(e) => setReqReason(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isExecuting}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 disabled:from-slate-700 disabled:to-slate-700 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 disabled:shadow-none transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : !wallet.isConnected ? (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Connect Wallet First</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Submit Access Request</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Approved Viewer */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-cyan-400" />
                  View Record (RBAC Verified)
                </h2>
                <span className="text-xs text-slate-400 font-mono">On-Chain Controlled</span>
              </div>

              {approvedRequests.length === 0 ? (
                <div className="glass-panel bg-[#0B132B] p-8 rounded-3xl border border-slate-800 text-center space-y-2">
                  <Lock className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    No approved access grants yet. Submit an access request or approve one in the Action Center.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedRequests.map((req) => {
                    const data = fetchedData[req.patientId];
                    const isFetching = fetchingCid === req.patientId;

                    return (
                      <div key={req.id} className="glass-panel bg-[#0B132B] p-5 rounded-2xl border border-emerald-500/30 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono text-xs font-bold text-emerald-400">{req.patientId}</span>
                            <p className="text-xs text-slate-300 font-semibold">{req.patientName}</p>
                          </div>

                          <button
                            onClick={() => handleViewRecord(req)}
                            disabled={isFetching}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                          >
                            {isFetching ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Verifying RBAC...</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Fetch &amp; Decrypt Record</span>
                              </>
                            )}
                          </button>
                        </div>

                        {data && (
                          <div className="p-4 bg-[#0F172A] rounded-xl border border-slate-800 space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="text-xs font-bold text-white">{data.category}</span>
                              <span className="text-[10px] font-mono text-cyan-400">{data.physician}</span>
                            </div>

                            <p className="text-xs text-slate-300">{data.findings}</p>

                            {data.fileData && (
                              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <FileCheck className="w-4 h-4 text-emerald-400" />
                                  <div>
                                    <p className="font-bold text-white text-xs">{data.fileData.fileName}</p>
                                    <p className="text-[10px] text-slate-400">{formatBytes(data.fileData.fileSize)}</p>
                                  </div>
                                </div>
                                {data.fileData.dataUrl && (
                                  <a
                                    href={data.fileData.dataUrl}
                                    download={data.fileData.fileName}
                                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                                  >
                                    Download Attachment
                                  </a>
                                )}
                              </div>
                            )}

                            <div className="font-mono text-[10px] text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800 break-all">
                              IPFS CID: {data.cid}
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
