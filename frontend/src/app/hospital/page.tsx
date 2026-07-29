'use client';

// ============================================================
// MediChain Hospital Action Center (/hospital) — Dashboard Layout
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

  const handleRejectAccess = async (request: AccessRequest) => {
    if (!wallet.address) return;

    const res = await rejectAccess(wallet.address, request.requestingHospitalWallet, request.patientId);

    if (res.success) {
      setAccessRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status: 'Rejected' } : r))
      );
    }
  };

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
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-[#F8FAFC] md:ml-64">
        <div className="max-w-md space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/80">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Hospital Node Access Required</h2>
          <p className="text-xs text-slate-600 font-medium">
            You must be logged in as a verified Healthcare Institution Node to access patient records and request controls.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-lg shadow-slate-900/10 transition-all w-full"
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans md:ml-64">
      
      {/* SUB-HEADER */}
      <div className="bg-white border-b border-slate-200/80 shadow-sm px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Node: {user.hospitalName || user.username}</span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-[11px] text-slate-500 font-normal">Core Contract: {CORE_CONTRACT_ID.slice(0, 14)}...</span>
          </div>

          <Link href="/transactions" className="text-teal-600 hover:underline flex items-center gap-1 font-bold text-xs">
            <span>Activity Log</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">

        {/* TABS */}
        <div className="flex border-b border-slate-200 gap-4 sm:gap-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'upload' ? 'text-teal-600 border-teal-600' : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Record &amp; File Hash
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'requests' ? 'text-teal-600 border-teal-600' : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <Share2 className="w-4 h-4" />
            Action Center (Requests Queue)
            {pendingRequests.length > 0 && (
              <span className="bg-teal-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`pb-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'approved' ? 'text-teal-600 border-teal-600' : 'text-slate-500 border-transparent hover:text-slate-800'
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
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-teal-600" />
                  Upload &amp; Hash Medical Report
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  WebCrypto computes binary SHA-256 hash. Cross-contract call verifies Govt Registry whitelist before committing on-chain.
                </p>
              </div>

              <form onSubmit={handleUploadRecord} className="space-y-4">
                
                {/* PROMINENT DRAG-AND-DROP FILE UPLOAD ZONE (Dashed Mint Border) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Medical Report File (PDF / Image)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      fileData
                        ? 'border-emerald-400 bg-emerald-50/60 shadow-sm'
                        : 'border-emerald-400/80 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60 shadow-sm'
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
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
                        <p className="text-xs text-teal-700 font-extrabold">Computing SHA-256 binary hash…</p>
                      </div>
                    ) : fileData ? (
                      <div className="flex items-center justify-between text-left">
                        <div className="flex items-center gap-3">
                          <FileCheck className="w-6 h-6 text-emerald-600" />
                          <div>
                            <p className="text-xs font-extrabold text-slate-900 truncate max-w-[180px]">{fileData.fileName}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{formatBytes(fileData.fileSize)}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 font-bold">
                          ✓ SHA-256 Hashed
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="w-10 h-10 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-600">
                          <FileUp className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-extrabold text-slate-900">Drag &amp; drop medical report here or click to browse</p>
                        <p className="text-[10px] text-slate-500 font-medium">Supports PDF, PNG, JPG up to 25MB (Auto SHA-256 Hashed)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Patient ID</label>
                    <input
                      type="text"
                      required
                      placeholder="PAT-001-BLR"
                      value={uploadPatientId}
                      onChange={(e) => setUploadPatientId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Patient Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Arjun Mehta"
                      value={uploadPatientName}
                      onChange={(e) => setUploadPatientName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white font-medium"
                  >
                    <option value="Blood Diagnostics">Blood Diagnostics (Haematology)</option>
                    <option value="Cardiology ECG">Cardiology ECG / Echo</option>
                    <option value="Radiology MRI/CT">Radiology MRI / CT Scan</option>
                    <option value="Oncology Consult">Oncology Report</option>
                    <option value="General Clinical">General Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Report Summary</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Hemoglobin 14.2 g/dL, Platelets 250,000/mcL."
                    value={uploadFindings}
                    onChange={(e) => setUploadFindings(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white resize-none font-medium"
                  />
                </div>

                {liveHash && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Native WebCrypto SHA-256 Hash</span>
                      <span className="text-teal-700 font-mono">256-bit</span>
                    </p>
                    <p className="font-mono text-[10px] text-teal-800 break-all bg-white p-1.5 rounded border border-slate-200 font-semibold">
                      {liveHash}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isExecuting}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 disabled:from-slate-300 disabled:to-slate-300 text-white font-extrabold rounded-xl shadow-lg shadow-teal-500/25 disabled:shadow-none transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
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
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-teal-600" />
                  On-Chain Record Hashes
                </h2>
                <span className="text-xs text-slate-500 font-mono font-bold">{patientRecords.length} Records</span>
              </div>

              {patientRecords.length === 0 ? (
                <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/50 text-center space-y-2">
                  <Database className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">
                    No medical records uploaded yet for this node session. Upload a PDF/Image report to anchor its hash on-chain.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patientRecords.map((rec, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md shadow-slate-200/40 space-y-3">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-teal-700">{rec.patientId}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-sm font-extrabold text-slate-900">{rec.patientName}</span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{rec.category}</p>
                        </div>

                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3 text-teal-600" />
                          CID Hash On-Chain
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 font-mono text-xs">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-sans font-bold">IPFS CID Hash:</p>
                        <p className="text-teal-800 text-[11px] break-all font-semibold">{rec.ipfsCid}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                        <span>Uploaded: {new Date(rec.uploadedAt).toLocaleDateString()}</span>
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${rec.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:underline flex items-center gap-1 font-bold"
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
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-teal-600" />
                  Access Request Queue
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Review &amp; approve/reject inter-hospital sharing requests logged on Soroban.
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono font-bold">{accessRequests.length} Total Requests</span>
            </div>

            {accessRequests.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/50 text-center space-y-3">
                <Share2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Access Requests in Queue</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                  When another authorized hospital node requests access to a patient record, it will appear here for on-chain approval.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {accessRequests.map((req) => (
                  <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md shadow-slate-200/40 space-y-4">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{req.requestingHospitalName}</span>
                          <span className="text-xs text-slate-500 font-medium">requested record</span>
                          <span className="font-mono text-xs font-bold text-teal-700">{req.patientId}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                          Clinical Reason: <strong className="text-slate-900 font-semibold">"{req.clinicalReason}"</strong>
                        </p>
                      </div>

                      <span
                        className={`
                          px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5
                          ${
                            req.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : req.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }
                        `}
                      >
                        {req.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {req.status === 'Rejected' && <Ban className="w-3.5 h-3.5 text-rose-600" />}
                        {req.status === 'Pending' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                        {req.status}
                      </span>
                    </div>

                    {req.status === 'Pending' && (
                      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleApproveAccess(req)}
                          disabled={isExecuting}
                          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-teal-500/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve Access On-Chain</span>
                        </button>
                        <button
                          onClick={() => handleRejectAccess(req)}
                          disabled={isExecuting}
                          className="px-4 py-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-rose-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm"
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
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-teal-600" />
                  Request Patient Record Access
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Submit an inter-hospital request to access records owned by another node.
                </p>
              </div>

              <form onSubmit={handleRequestAccess} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Target Patient ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="PAT-001-BLR"
                    value={reqPatientId}
                    onChange={(e) => setReqPatientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Clinical Reason
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Urgent cardiology consult for transferred patient."
                    value={reqReason}
                    onChange={(e) => setReqReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white resize-none font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isExecuting}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 disabled:from-slate-300 disabled:to-slate-300 text-white font-extrabold rounded-xl shadow-lg shadow-teal-500/20 disabled:shadow-none transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
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
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-teal-600" />
                  View Record (RBAC Verified)
                </h2>
                <span className="text-xs text-slate-500 font-mono font-bold">On-Chain Controlled</span>
              </div>

              {approvedRequests.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/50 text-center space-y-2">
                  <Lock className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">
                    No approved access grants yet. Submit an access request or approve one in the Action Center.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedRequests.map((req) => {
                    const data = fetchedData[req.patientId];
                    const isFetching = fetchingCid === req.patientId;

                    return (
                      <div key={req.id} className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-md shadow-emerald-500/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono text-xs font-bold text-emerald-700">{req.patientId}</span>
                            <p className="text-xs text-slate-900 font-extrabold">{req.patientName}</p>
                          </div>

                          <button
                            onClick={() => handleViewRecord(req)}
                            disabled={isFetching}
                            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-teal-500/20"
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
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <span className="text-xs font-bold text-slate-900">{data.category}</span>
                              <span className="text-[10px] font-mono text-teal-700 font-bold">{data.physician}</span>
                            </div>

                            <p className="text-xs text-slate-700 font-medium">{data.findings}</p>

                            {data.fileData && (
                              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-sm">
                                <div className="flex items-center gap-2.5">
                                  <FileCheck className="w-4 h-4 text-emerald-600" />
                                  <div>
                                    <p className="font-bold text-slate-900 text-xs">{data.fileData.fileName}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{formatBytes(data.fileData.fileSize)}</p>
                                  </div>
                                </div>
                                {data.fileData.dataUrl && (
                                  <a
                                    href={data.fileData.dataUrl}
                                    download={data.fileData.fileName}
                                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                                  >
                                    Download Attachment
                                  </a>
                                )}
                              </div>
                            )}

                            <div className="font-mono text-[10px] text-teal-800 bg-white p-2 rounded border border-slate-200 break-all font-semibold">
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
