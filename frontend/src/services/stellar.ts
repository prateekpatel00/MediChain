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
  rpc,
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

// ── Deployed Testnet Contract IDs ────────────────────────────────
// Fallbacks use the live Testnet addresses so the app works even
// when NEXT_PUBLIC_* env vars are not loaded (e.g. in Storybook or
// test environments that skip .env.local).
export const REGISTRY_CONTRACT_ID =
  process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ID ||
  'CDD5BMSSEQSLBFQCZYYGFUNWJ5BH243YE7NHZSZJCZAICMRYXI7RCMJS';

export const CORE_CONTRACT_ID =
  process.env.NEXT_PUBLIC_CORE_CONTRACT_ID ||
  'CD4AOWVNSBCQPVMSNCSYKA5RI3Z24RH6UNXS3KTVQQW3ZDQJOJPFL4HB';

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
  const server = new rpc.Server(STELLAR_TESTNET_RPC, { allowHttp: false });
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
    if (rpc.Api.isSimulationError(simResult)) {
      throw new Error(formatHumanError(`Simulation error: ${simResult.error}`));
    }

    // 4. Assemble transaction with simulation footprint
    const preparedTx = rpc.assembleTransaction(tx, simResult).build();

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
      getResult.status === rpc.Api.GetTransactionStatus.NOT_FOUND &&
      attempts < MAX_ATTEMPTS
    ) {
      await sleep(2000);
      getResult = await server.getTransaction(txHash);
      attempts++;
    }

    if (getResult.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
      throw new Error('Transaction pending: timeout waiting for confirmation.');
    }

    if (getResult.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Transaction failed on-chain. TxHash: ${txHash}`);
    }

    let returnValue: string | undefined;
    if (
      getResult.status === rpc.Api.GetTransactionStatus.SUCCESS &&
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

// ============================================================
// addressToScVal — Hardened address converter
// ============================================================
// Strips zero-width Unicode characters (\u200B-\u200D, \uFEFF)
// that clipboard-pasting can silently introduce, then validates
// the resulting string before handing it to the Stellar SDK.
// Provides actionable error messages that name the exact problem.
// ============================================================
export function addressToScVal(address: string): xdr.ScVal {
  if (!address || typeof address !== 'string') {
    throw new Error(
      'addressToScVal: a non-empty Stellar address string is required.'
    );
  }

  // 1. Strip invisible Unicode characters that can come from copy-paste
  const cleanAddr = address
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '') // zero-width + non-breaking space
    .trim();

  if (!cleanAddr) {
    throw new Error(
      'addressToScVal: address is empty after stripping whitespace and invisible characters.'
    );
  }

  // 2. Validate: accept Stellar account keys (G...) or contract IDs (C...)
  const isValidPublicKey = StrKey.isValidEd25519PublicKey(cleanAddr);

  // StrKey.isValidContract exists at runtime but is not in the v11 type
  // declarations, so we perform the equivalent check manually.
  let isValidContractId = false;
  if (cleanAddr.startsWith('C') && cleanAddr.length === 56) {
    try {
      StrKey.decodeContract(cleanAddr);
      isValidContractId = true;
    } catch {
      isValidContractId = false;
    }
  }

  if (!isValidPublicKey && !isValidContractId) {
    const hint =
      cleanAddr.length !== 56
        ? `length is ${cleanAddr.length} (expected 56)`
        : `first character is '${cleanAddr[0]}' (expected 'G' for accounts or 'C' for contracts)`;

    throw new Error(
      `Invalid Stellar Address — ${hint}.\n` +
      `Received: "${cleanAddr}"\n` +
      `Expected: a valid Ed25519 public key (G...) or Soroban contract ID (C...).`
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
