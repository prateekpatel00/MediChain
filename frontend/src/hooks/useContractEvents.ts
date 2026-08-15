'use client';

import { useEffect } from 'react';
import { SorobanRpc } from '@stellar/stellar-sdk';
import { useMediChainStore, ActivityEvent } from '../store/useMediChainStore';
import { logger } from '../utils/logger';

const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const CORE_CONTRACT_ID = process.env.NEXT_PUBLIC_CORE_CONTRACT_ID || 'CD4AOWVNSBCQPVMSNCSYKA5RI3Z24RH6UNXS3KTVQQW3ZDQJOJPFL4HB';
const REGISTRY_CONTRACT_ID = process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ID || 'CDD5BMSSEQSLBFQCZYYGFUNWJ5BH243YE7NHZSZJCZAICMRYXI7RCMJS';

export function useContractEvents() {
  const { addEvent, isLiveStreaming } = useMediChainStore();

  useEffect(() => {
    if (!isLiveStreaming) return;

    const server = new SorobanRpc.Server(RPC_URL);
    let isCancelled = false;

    const fetchEvents = async () => {
      try {
        const response = await server.getEvents({
          startLedger: 0,
          filters: [
            {
              type: 'contract',
              contractIds: [CORE_CONTRACT_ID, REGISTRY_CONTRACT_ID],
            },
          ],
          limit: 10,
        });

        if (isCancelled || !response.events) return;

        response.events.forEach((evt: SorobanRpc.Api.EventResponse, idx: number) => {
          const topicStr = evt.topic ? evt.topic.map((t: unknown) => String(t)).join('::') : 'event';
          const contractIdStr = evt.contractId ? evt.contractId.toString() : CORE_CONTRACT_ID;
          const isCore = contractIdStr === CORE_CONTRACT_ID;

          let type: ActivityEvent['type'] = 'upload';
          let title = 'Contract Event';

          if (topicStr.includes('upload')) {
            type = 'upload';
            title = 'Medical Record Hash Uploaded';
          } else if (topicStr.includes('req_acc')) {
            type = 'req_acc';
            title = 'Inter-Hospital Access Requested';
          } else if (topicStr.includes('appr_acc')) {
            type = 'appr_acc';
            title = 'Access Permission Approved';
          } else if (topicStr.includes('rej_acc')) {
            type = 'rej_acc';
            title = 'Access Request Rejected';
          } else if (topicStr.includes('hosp_add')) {
            type = 'hosp_add';
            title = 'Hospital Node Whitelisted';
          }

          const parsedEvent: ActivityEvent = {
            id: evt.id || `rpc-evt-${idx}-${Date.now()}`,
            type,
            title,
            description: `Event emitted by ${isCore ? 'Core Contract' : 'Registry Contract'} at ledger #${evt.ledger}`,
            contract: contractIdStr,
            timestamp: Date.now() - idx * 60000,
            actor: contractIdStr.slice(0, 5) + '...' + contractIdStr.slice(-4),
            status: 'confirmed',
          };

          addEvent(parsedEvent);
        });

        logger.info({
          category: 'event_stream',
          message: `Fetched ${response.events.length} Soroban contract events from RPC`,
        });
      } catch (err) {
        logger.warn({
          category: 'event_stream',
          message: 'Soroban RPC getEvents subscription polling fallback',
          data: err,
        });
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 12000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [addEvent, isLiveStreaming]);
}
