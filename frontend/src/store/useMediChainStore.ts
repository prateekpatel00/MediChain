import { create } from 'zustand';

export interface ActivityEvent {
  id: string;
  type: 'upload' | 'req_acc' | 'appr_acc' | 'rej_acc' | 'hosp_add' | 'hosp_rem' | 'upgraded';
  title: string;
  description: string;
  contract: string;
  timestamp: number;
  txHash?: string;
  actor: string;
  status: 'confirmed' | 'pending' | 'failed';
}

export interface MetricSummary {
  totalRecords: number;
  authorizedHospitals: number;
  pendingRequests: number;
  approvedTransfers: number;
  securityScore: number;
}

interface MediChainState {
  events: ActivityEvent[];
  metrics: MetricSummary;
  activeFilter: string;
  isLiveStreaming: boolean;
  addEvent: (event: ActivityEvent) => void;
  setEvents: (events: ActivityEvent[]) => void;
  setActiveFilter: (filter: string) => void;
  toggleLiveStreaming: () => void;
  updateMetrics: (metrics: Partial<MetricSummary>) => void;
}

export const useMediChainStore = create<MediChainState>((set) => ({
  events: [
    {
      id: 'evt-001',
      type: 'hosp_add',
      title: 'Hospital Node Whitelisted',
      description: 'Super Admin authorized Apollo Hospital (GDSK...82K) on Registry Contract.',
      contract: 'CDD5BMSSEQSLBFQCZYYGFUNWJ5BH243YE7NHZSZJCZAICMRYXI7RCMJS',
      timestamp: Date.now() - 1000 * 60 * 180,
      txHash: 'a89f3...b912c',
      actor: 'GCVGEHLD34OAWVIQYWYNLEU2YFOXINO4FEXLGPV6DBHFIFDQFCWQJDI5',
      status: 'confirmed',
    },
    {
      id: 'evt-002',
      type: 'upload',
      title: 'Medical Record Hash Anchored',
      description: 'Apollo Hospital uploaded record hash QmXkY9...315 for Patient PAT-1092.',
      contract: 'CD4AOWVNSBCQPVMSNCSYKA5RI3Z24RH6UNXS3KTVQQW3ZDQJOJPFL4HB',
      timestamp: Date.now() - 1000 * 60 * 120,
      txHash: '7c4e2...f901a',
      actor: 'GDSK8...W982K',
      status: 'confirmed',
    },
    {
      id: 'evt-003',
      type: 'req_acc',
      title: 'Inter-Hospital Access Requested',
      description: 'Fortis Healthcare requested access to PAT-1092 diagnostic records.',
      contract: 'CD4AOWVNSBCQPVMSNCSYKA5RI3Z24RH6UNXS3KTVQQW3ZDQJOJPFL4HB',
      timestamp: Date.now() - 1000 * 60 * 45,
      txHash: '3b1d9...a881e',
      actor: 'GB7R5...Q229L',
      status: 'confirmed',
    },
    {
      id: 'evt-004',
      type: 'appr_acc',
      title: 'Access Permission Approved',
      description: 'Apollo Hospital granted explicit access permission for PAT-1092 to Fortis Healthcare.',
      contract: 'CD4AOWVNSBCQPVMSNCSYKA5RI3Z24RH6UNXS3KTVQQW3ZDQJOJPFL4HB',
      timestamp: Date.now() - 1000 * 60 * 12,
      txHash: 'e9921...c440b',
      actor: 'GDSK8...W982K',
      status: 'confirmed',
    },
  ],
  metrics: {
    totalRecords: 142,
    authorizedHospitals: 8,
    pendingRequests: 3,
    approvedTransfers: 98,
    securityScore: 99.8,
  },
  activeFilter: 'all',
  isLiveStreaming: true,
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events.filter((e) => e.id !== event.id)],
    })),
  setEvents: (events) => set({ events }),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  toggleLiveStreaming: () =>
    set((state) => ({ isLiveStreaming: !state.isLiveStreaming })),
  updateMetrics: (newMetrics) =>
    set((state) => ({ metrics: { ...state.metrics, ...newMetrics } })),
}));
