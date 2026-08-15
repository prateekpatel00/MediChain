// ============================================================
// MediChain Stellar & Soroban Service — Level 3 Dual Contract Architecture
// ============================================================
// Manages Soroban RPC simulation, transaction assembly, signing via
// StellarWalletsKit, submission, and confirmation polling.
// ============================================================

import {
  Contract,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  Address,
  xdr,
  SorobanRpc,
  scValToNative,
  StrKey,
} from '@stellar/stellar-sdk';

// ============================================================
// NETWORK & CONTRACT CONFIG
// ============================================================
export const STELLAR_TESTNET_RPC =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';

export const STELLAR_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || Networks.TESTNET;

export const REGISTRY_CONTRACT_ID =
  process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ID ||
  'REPLACE_WITH_REGISTRY_CONTRACT_ID';

export const CORE_CONTRACT_ID =
  process.env.NEXT_PUBLIC_CORE_CONTRACT_ID ||
  process.env.NEXT_PUBLIC_CONTRACT_ID ||
  'CAMBP7LO53Z3CYLFXEY4LTL6EWFG2FOC5ZPP7QO35JPMIMRVFBXAZOOF';

export interface SorobanCallResult {
  success: boolean;
  txHash?: string;
  returnValue?: string;
  error?: string;
}

export type SorobanMethod =
  | 'initialize'
  | 'add_hospital'
  | 'remove_hospital'
  | 'upload_record'
  | 'request_access'
  | 'approve_access'
  | 'reject_access'
  | 'view_record';

/**
 * Human-readable error translation for clean UI toast messages
 */
export function formatHumanError(rawError: string): string {
  if (!rawError) return 'An unknown error occurred.';
  const lower = rawError.toLowerCase();

  if (
    lower.includes('bad union switch') ||
    lower.includes('unsupported address type') ||
    lower.includes('invalid xdr')
  ) {
    return 'Invalid Stellar Address or XDR argument format. Please ensure all addresses are valid 56-character public keys starting with G.';
  }
  if (lower.includes('user declined') || lower.includes('rejected') || lower.includes('cancel')) {
    return 'Transaction rejected in wallet by user.';
  }
  if (lower.includes('hospitalnotauthorized')) {
    return 'HospitalNotAuthorized: This hospital address is not whitelisted in the Government Registry Contract.';
  }
  if (lower.includes('recordnotfound')) {
    return 'RecordNotFound: The requested patient record hash does not exist on-chain.';
  }
  if (lower.includes('alreadyinitialized')) {
    return 'AlreadyInitialized: Contract setup has already been completed.';
  }
  if (lower.includes('unauthorized')) {
    return 'Unauthorized: Your connected wallet lacks permission for this action.';
  }
  if (lower.includes('insufficient') || lower.includes('balance')) {
    return 'Insufficient XLM balance for transaction fee on Testnet.';
  }
  if (lower.includes('timeout')) {
    return 'Transaction timed out while awaiting ledger confirmation.';
  }
  return rawError;
}

// ============================================================
// SOROBAN TRANSACTION EXECUTOR
// ============================================================

export async function invokeSorobanMethod(
  targetContractId: string,
  methodName: SorobanMethod,
  scArgs: xdr.ScVal[],
  callerPublicKey: string,
  signTransactionFn: (txXdr: string) => Promise<{ signedTxXdr: string }>
): Promise<SorobanCallResult> {
  const server = new SorobanRpc.Server(STELLAR_TESTNET_RPC, { allowHttp: false });
  const contract = new Contract(targetContractId);

  try {
    // 1. Fetch caller account sequence
    const account = await server.getAccount(callerPublicKey);

    // 2. Build initial transaction
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: STELLAR_PASSPHRASE,
    })
      .addOperation(contract.call(methodName, ...scArgs))
      .setTimeout(180)
      .build();

    // 3. Simulate transaction to obtain footprint & fees
    const simResult = await server.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationError(simResult)) {
      throw new Error(formatHumanError(`Simulation error: ${simResult.error}`));
    }

    // 4. Assemble transaction with simulation footprint
    const preparedTx = SorobanRpc.assembleTransaction(tx, simResult).build();

    // 5. Convert to XDR and sign via StellarWalletsKit / Wallet Context
    const txXDR = preparedTx.toXDR();
    const { signedTxXdr } = await signTransactionFn(txXDR);

    if (!signedTxXdr || typeof signedTxXdr !== 'string') {
      throw new Error('Wallet returned invalid or empty signed transaction XDR');
    }

    // 6. Submit signed transaction to Stellar Testnet RPC
    const signedTx = TransactionBuilder.fromXDR(signedTxXdr, STELLAR_PASSPHRASE);
    const sendResult = await server.sendTransaction(signedTx);

    if (sendResult.status === 'ERROR') {
      throw new Error(
        formatHumanError(`Submission failed: ${sendResult.errorResult?.toXDR('base64') || 'Unknown error'}`)
      );
    }

    const txHash = sendResult.hash;

    // 7. Poll for ledger confirmation
    let getResult = await server.getTransaction(txHash);
    let attempts = 0;
    const MAX_ATTEMPTS = 30;

    while (
      getResult.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND &&
      attempts < MAX_ATTEMPTS
    ) {
      await sleep(2000);
      getResult = await server.getTransaction(txHash);
      attempts++;
    }

    if (getResult.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
      throw new Error('Transaction pending: timeout waiting for confirmation.');
    }

    if (getResult.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Transaction failed on-chain. TxHash: ${txHash}`);
    }

    let returnValue: string | undefined;
    if (
      getResult.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS &&
      getResult.returnValue
    ) {
      try {
        const native = scValToNative(getResult.returnValue);
        returnValue = typeof native === 'string' ? native : JSON.stringify(native);
      } catch {}
    }

    return {
      success: true,
      txHash,
      returnValue,
    };
  } catch (err: any) {
    return {
      success: false,
      error: formatHumanError(err.message || 'Unknown Soroban transaction error'),
    };
  }
}

// ============================================================
// ScVal CONVERTERS
// ============================================================

export function addressToScVal(address: string): xdr.ScVal {
  console.log('addressToScVal input:', address);
  if (!address || typeof address !== 'string') {
    throw new Error('Stellar address string is required.');
  }
  const cleanAddr = address.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  const isValidPublicKey = StrKey.isValidEd25519PublicKey(cleanAddr);
  const isValidContractId = cleanAddr.startsWith('C') && cleanAddr.length === 56;

  if (!isValidPublicKey && !isValidContractId) {
    throw new Error(
      `Invalid Stellar Address "${cleanAddr}". Expected a valid 56-character public key starting with 'G' or contract ID starting with 'C'.`
    );
  }
  return Address.fromString(cleanAddr).toScVal();
}

export function stringToScVal(value: string): xdr.ScVal {
  return nativeToScVal(String(value ?? ''), { type: 'string' });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
