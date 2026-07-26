// ============================================================
// MediChain Stellar Integration — STRICTLY ON-CHAIN
// NO mock fallbacks. Every action triggers Freighter wallet.
// ============================================================

import {
  isConnected,
  isAllowed,
  setAllowed,
  getPublicKey,
  signTransaction,
  getNetworkDetails,
} from '@stellar/freighter-api';

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
} from '@stellar/stellar-sdk';

// ============================================================
// NETWORK CONFIG — Stellar Testnet
// ============================================================
export const STELLAR_TESTNET_RPC = 'https://soroban-testnet.stellar.org';
export const STELLAR_PASSPHRASE = Networks.TESTNET;

export const CONTRACT_ID =
  process.env.NEXT_PUBLIC_CONTRACT_ID ||
  'CAMBP7LO53Z3CYLFXEY4LTL6EWFG2FOC5ZPP7QO35JPMIMRVFBXAZOOF';

// ============================================================
// RESULT TYPES
// ============================================================
export interface SorobanCallResult {
  success: boolean;
  txHash?: string;
  returnValue?: string;
  error?: string;
}

export interface WalletInfo {
  address: string;
  network: string;
}

// ============================================================
// FREIGHTER WALLET UTILITIES
// ============================================================

export async function checkFreighterInstalled(): Promise<boolean> {
  try {
    const res: any = await isConnected();
    return typeof res === 'boolean' ? res : !!res?.isConnected;
  } catch {
    return false;
  }
}

export async function connectFreighter(): Promise<WalletInfo> {
  const installed = await checkFreighterInstalled();
  if (!installed) {
    throw new Error(
      'Freighter wallet extension is not installed. Please install it from https://freighter.app and reload the page.'
    );
  }

  const allowed: any = await isAllowed();
  const isAllowedBool = typeof allowed === 'boolean' ? allowed : !!allowed?.isAllowed;
  if (!isAllowedBool) {
    await setAllowed();
  }

  const keyResult: any = await getPublicKey();
  const address = typeof keyResult === 'string' ? keyResult : keyResult?.publicKey || keyResult?.address;
  if (!address || keyResult?.error) {
    throw new Error(`Freighter error: ${keyResult?.error || 'Failed to get public key'}`);
  }

  const networkResult: any = await getNetworkDetails();
  const networkPassphrase = typeof networkResult === 'string' ? networkResult : networkResult?.networkPassphrase;
  const networkName = networkPassphrase?.includes('Test')
    ? 'Stellar Testnet'
    : (typeof networkResult === 'object' ? networkResult?.network : networkResult) || 'Stellar Testnet';

  return {
    address,
    network: networkName,
  };
}

// ============================================================
// SOROBAN TRANSACTION BUILDER + SUBMITTER
// ============================================================

export async function invokeSorobanContract(
  methodName:
    | 'initialize'
    | 'grant_hospital_rights'
    | 'upload_record'
    | 'request_access'
    | 'approve_access'
    | 'reject_access'
    | 'view_record',
  scArgs: xdr.ScVal[],
  callerPublicKey: string
): Promise<SorobanCallResult> {
  const server = new SorobanRpc.Server(STELLAR_TESTNET_RPC, { allowHttp: false });
  const contract = new Contract(CONTRACT_ID);

  try {
    // 1. Load account from Stellar Testnet
    const account = await server.getAccount(callerPublicKey);

    // 2. Build transaction
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: STELLAR_PASSPHRASE,
    })
      .addOperation(contract.call(methodName, ...scArgs))
      .setTimeout(180)
      .build();

    // 3. Simulate transaction to calculate fees and footprint
    const simResult = await server.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationError(simResult)) {
      throw new Error(`Simulation failed: ${simResult.error}`);
    }

    // 4. Assemble transaction
    const preparedTx = SorobanRpc.assembleTransaction(tx, simResult).build();

    // 5. Serialize XDR & sign with Freighter
    const txXDR = preparedTx.toXDR();

    const signResult: any = await signTransaction(txXDR, {
      network: 'TESTNET',
      networkPassphrase: STELLAR_PASSPHRASE,
      accountToSign: callerPublicKey,
    });

    if (signResult?.error) {
      throw new Error(`Freighter signing failed: ${signResult.error}`);
    }

    const signedTxXdr = typeof signResult === 'string' ? signResult : signResult?.signedTxXdr || signResult;
    if (!signedTxXdr || typeof signedTxXdr !== 'string') {
      throw new Error('Freighter returned invalid signed transaction XDR');
    }

    // 6. Submit to Soroban RPC
    const signedTx = TransactionBuilder.fromXDR(signedTxXdr, STELLAR_PASSPHRASE);
    const sendResult = await server.sendTransaction(signedTx);

    if (sendResult.status === 'ERROR') {
      throw new Error(
        `Transaction submission failed: ${sendResult.errorResult?.toXDR('base64') || 'Unknown error'}`
      );
    }

    const txHash = sendResult.hash;

    // 7. Poll for confirmation
    let getResult = await server.getTransaction(txHash);
    let attempts = 0;
    const MAX_ATTEMPTS = 30;

    while (
      getResult.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND &&
      attempts < MAX_ATTEMPTS
    ) {
      await sleep(3000);
      getResult = await server.getTransaction(txHash);
      attempts++;
    }

    if (getResult.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
      throw new Error('Transaction not confirmed within timeout.');
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
      error: err.message || 'Unknown Soroban error',
    };
  }
}

// ============================================================
// SOROBAN ScVal HELPERS
// ============================================================

export function addressToScVal(address: string): xdr.ScVal {
  return new Address(address).toScVal();
}

export function stringToScVal(value: string): xdr.ScVal {
  return nativeToScVal(value, { type: 'string' });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
