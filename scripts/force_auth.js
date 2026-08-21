#!/usr/bin/env node
// =============================================================
// MediChain — Force Authorize Hospital (scripts/force_auth.js)
// =============================================================
// Bypasses the frontend UI entirely.
// Directly submits an add_hospital() call to the Registry
// Contract using the admin's secret key.
//
// USAGE — run from the 'frontend' directory so @stellar/stellar-sdk
//         resolves from its node_modules:
//
//   cd "c:\Users\PRATEEK\OneDrive\Desktop\medical app\frontend"
//
//   Option 1 — environment variable (PowerShell):
//     $env:ADMIN_SECRET_KEY="S...your56charkey..."
//     node ..\scripts\force_auth.js
//
//   Option 2 — CLI argument:
//     node ..\scripts\force_auth.js S...your56charkey...
// =============================================================

'use strict';

const {
  Keypair,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  Contract,
  Address,
  rpc,
} = require('@stellar/stellar-sdk');

// ── CONFIG ────────────────────────────────────────────────────
const REGISTRY_CONTRACT_ID = 'CDD5BMSSEQSLBFQCZYYGFUNWJ5BH243YE7NHZSZJCZAICMRYXI7RCMJS';
const HOSPITAL_ADDRESS     = 'GC4X3CF6OKJON3UX465RH5QTTIQHGNVFWFLE6UYHZULA7XNEXGIBAV5P';
const RPC_URL              = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE   = Networks.TESTNET;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  // Read secret key: env var takes priority, then CLI arg
  const adminSecretKey = process.env.ADMIN_SECRET_KEY || process.argv[2];

  if (!adminSecretKey) {
    console.error('\nERROR: Admin secret key not provided.\n');
    console.error('  PowerShell env var:');
    console.error('    $env:ADMIN_SECRET_KEY="S...key..."');
    console.error('    node ..\\scripts\\force_auth.js\n');
    console.error('  CLI argument:');
    console.error('    node ..\\scripts\\force_auth.js S...key...\n');
    process.exit(1);
  }

  if (!adminSecretKey.startsWith('S') || adminSecretKey.length !== 56) {
    console.error(`\nERROR: Invalid secret key.`);
    console.error(`  Expected: 56-char string starting with 'S'`);
    console.error(`  Got: "${adminSecretKey.slice(0, 8)}..." (length ${adminSecretKey.length})\n`);
    process.exit(1);
  }

  const adminKeypair   = Keypair.fromSecret(adminSecretKey);
  const adminPublicKey = adminKeypair.publicKey();

  console.log('\n=== MediChain Force Hospital Authorization ===');
  console.log('  Admin public key :', adminPublicKey);
  console.log('  Hospital address :', HOSPITAL_ADDRESS);
  console.log('  Registry contract:', REGISTRY_CONTRACT_ID);
  console.log('  Network          : Stellar Testnet\n');

  const server   = new rpc.Server(RPC_URL, { allowHttp: false });
  const contract = new Contract(REGISTRY_CONTRACT_ID);

  const adminScVal    = Address.fromString(adminPublicKey).toScVal();
  const hospitalScVal = Address.fromString(HOSPITAL_ADDRESS).toScVal();

  // 1. Load account
  console.log('[ 1/5 ] Loading admin account...');
  let account;
  try {
    account = await server.getAccount(adminPublicKey);
    console.log('        Sequence:', account.sequenceNumber());
  } catch {
    console.error('\nERROR: Account not found on Testnet. Fund it first:');
    console.error(`  https://friendbot.stellar.org?addr=${adminPublicKey}\n`);
    process.exit(1);
  }

  // 2. Build tx
  console.log('[ 2/5 ] Building transaction...');
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call('add_hospital', adminScVal, hospitalScVal))
    .setTimeout(180)
    .build();

  // 3. Simulate
  console.log('[ 3/5 ] Simulating transaction...');
  const simResult = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(simResult)) {
    console.error('\nERROR: Simulation failed:', simResult.error);
    console.error('\nCommon causes:');
    console.error('  - Registry not initialized (call initialize() first)');
    console.error('  - Admin public key does not match stored admin in Registry\n');
    process.exit(1);
  }

  // 4. Assemble + sign
  console.log('[ 4/5 ] Signing with admin keypair...');
  const preparedTx = rpc.assembleTransaction(tx, simResult).build();
  preparedTx.sign(adminKeypair);

  // 5. Submit
  console.log('[ 5/5 ] Submitting to Stellar Testnet...');
  const sendResult = await server.sendTransaction(preparedTx);

  if (sendResult.status === 'ERROR') {
    console.error('\nERROR: Transaction rejected:');
    console.error('  XDR:', sendResult.errorResult?.toXDR('base64') || 'unknown');
    process.exit(1);
  }

  const txHash = sendResult.hash;
  console.log('\n  TX submitted:', txHash);
  process.stdout.write('  Polling for confirmation');

  // 6. Poll
  let getResult;
  let attempts = 0;
  do {
    await sleep(2000);
    getResult = await server.getTransaction(txHash);
    attempts++;
    process.stdout.write('.');
  } while (
    getResult.status === rpc.Api.GetTransactionStatus.NOT_FOUND &&
    attempts < 30
  );

  console.log('');

  // 7. Result
  if (getResult.status === rpc.Api.GetTransactionStatus.SUCCESS) {
    console.log('\n SUCCESS — Hospital whitelisted on Registry Contract!');
    console.log('');
    console.log('  TX Hash  :', txHash);
    console.log('  Explorer :', `https://stellar.expert/explorer/testnet/tx/${txHash}`);
    console.log('');
    console.log('  The hospital can now call upload_record() and request_access()');
    console.log('  on the Core Contract. Cross-contract is_authorized() will return true.\n');
  } else if (getResult.status === rpc.Api.GetTransactionStatus.FAILED) {
    console.error('\nERROR: Transaction FAILED on-chain.');
    console.error('  TX Hash  :', txHash);
    console.error('  Explorer :', `https://stellar.expert/explorer/testnet/tx/${txHash}\n`);
    process.exit(1);
  } else {
    console.error('\nERROR: Timed out (NOT_FOUND after 60s).');
    console.error('  TX Hash  :', txHash);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\nFATAL:', err.message);
  if (err.message?.includes('Bad union switch') || err.message?.includes('bad union')) {
    console.error('  -> Contract may not be initialized. Call initialize() first.');
  }
  process.exit(1);
});
