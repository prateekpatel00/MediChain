#!/usr/bin/env node
'use strict';

const {
  Keypair,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  Contract,
  Address,
  SorobanRpc,
} = require('@stellar/stellar-sdk');

const REGISTRY_CONTRACT_ID = 'CDD5BMSSEQSLBFQCZYYGFUNWJ5BH243YE7NHZSZJCZAICMRYXI7RCMJS';
const RPC_URL              = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE   = Networks.TESTNET;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const adminSecretKey = process.argv[2];
  if (!adminSecretKey) process.exit(1);

  const adminKeypair   = Keypair.fromSecret(adminSecretKey);
  const adminPublicKey = adminKeypair.publicKey();
  
  const server   = new SorobanRpc.Server(RPC_URL, { allowHttp: false });
  const contract = new Contract(REGISTRY_CONTRACT_ID);
  const adminScVal = Address.fromString(adminPublicKey).toScVal();

  let account = await server.getAccount(adminPublicKey);
  
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(contract.call('initialize', adminScVal))
    .setTimeout(180)
    .build();

  const simResult = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(simResult)) {
    console.error('Sim error:', simResult.error);
    process.exit(1);
  }

  const preparedTx = SorobanRpc.assembleTransaction(tx, simResult).build();
  preparedTx.sign(adminKeypair);

  const sendResult = await server.sendTransaction(preparedTx);
  const txHash = sendResult.hash;
  console.log('Init TX:', txHash);
  
  let getResult;
  do {
    await sleep(2000);
    getResult = await server.getTransaction(txHash);
  } while (getResult.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND);
  
  console.log('Init Status:', getResult.status);
}

main().catch(err => console.error(err));
