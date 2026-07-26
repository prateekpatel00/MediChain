# MediChain | Decentralized Inter-Hospital Health Exchange

![Stellar Soroban](https://img.shields.io/badge/Stellar-Soroban%20Smart%20Contracts-00F2FE?style=for-the-badge&logo=stellar)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)
![Rust](https://img.shields.io/badge/Rust-Soroban%20SDK-black?style=for-the-badge&logo=rust)

## Overview
MediChain is a production-grade Web3 healthcare ecosystem built on the Stellar Testnet using Soroban Smart Contracts. It solves the critical real-world problem of inter-hospital patient record sharing. When a patient switches cities or hospitals, re-doing expensive medical tests is inefficient. MediChain provides a secure, decentralized 3-Tier Role-Based Access Control (RBAC) platform where Patient Health Information (PHI) is hashed locally and authorized on-chain, ensuring strict privacy and HIPAA-like compliance.

## Features
* **3-Tier RBAC System**: Distinct access levels for the Government (Super Admin), Data Custodians (e.g., Apollo Hospital), and Requesters (e.g., Jabalpur Hospital).
* **On-Chain Authorization**: Only hospitals authorized by the Government can publish record hashes to the Stellar blockchain.
* **Native WebCrypto Hashing**: Medical PDF/Image records are hashed securely in the browser; only the SHA-256 IPFS-style CID is stored on-chain.
* **Hospital Action Center**: A dedicated portal for hospitals to receive access requests, view emergency reasons, and securely 'Approve' or 'Reject' data sharing.
* **Premium Multi-Page UI**: Startup-grade Landing Page with dedicated routing (`/govt` and `/hospital`) featuring dark-mode glassmorphism.
* **Stellar Freighter Integration**: 100% on-chain interactions requiring live wallet signatures for state changes.

## Tech Stack
* **Smart Contract Engine**: Rust (Soroban SDK)
* **Blockchain Network**: Stellar Testnet (https://soroban-testnet.stellar.org)
* **Wallet Integration**: Freighter API (@stellar/freighter-api)
* **Blockchain SDK**: @stellar/stellar-sdk
* **Frontend Framework**: Next.js (App Router) + TypeScript
* **Styling**: Tailwind CSS + Framer Motion + Lucide Icons

## Setup Instructions
1. Clone the repository to your local machine.
2. Ensure you have Node.js (v18 or higher) and Rust & Cargo (v1.74+) installed.
3. Install the Stellar CLI (`cargo install --locked soroban-cli`) for contract compilation and deployment.
4. Add the wasm32 target: `rustup target add wasm32-unknown-unknown`.
5. You will need to compile the backend in the `/contracts` directory and run the frontend in the `/frontend` directory.

## Environment Variables
Create a `.env.local` file in the root of your `/frontend` directory and add the following required variables:

```env
NEXT_PUBLIC_CONTRACT_ID= CAMBP7LO53Z3CYLFXEY4LTL6EWFG2FOC5ZPP7QO35JPMIMRVFBXAZOOF
NEXT_PUBLIC_SOROBAN_RPC_URL=[https://soroban-testnet.stellar.org:443](https://soroban-testnet.stellar.org:443)
NEXT_PUBLIC_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
```

## Wallet Setup
1. Download and install the Freighter Wallet Browser Extension.
2. Create a new wallet and securely back up your seed phrase.
3. Open the extension, click the Settings (Gear) Icon -> Network -> Select Testnet.
4. Fund your testnet address using the in-app Friendbot feature to cover minimal gas fees.

## Contract Deployment
To build and deploy the smart contract to the Stellar Testnet, navigate into the `/contracts` directory and run:

```bash
# Compile the contract
cargo build --target wasm32-unknown-unknown --release

# Generate an admin identity (Government Super Admin)
stellar keys generate govt_admin --network testnet
stellar keys fund govt_admin --network testnet

# Deploy the contract
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/medichain_contract.wasm \
  --source govt_admin \
  --network testnet
```
*Note: Run the `initialize` function post-deployment to set the Government Admin address.*

## Running Locally
To start the Next.js UI, navigate into the `/frontend` directory and run:

```bash
npm install
npm run dev
```
Open http://localhost:3000 in your browser to view the Landing Page and access the specific portals.

## Deployment
To deploy the frontend application to Vercel:
1. Push your complete code to a GitHub repository.
2. Log in to Vercel and click Add New Project.
3. Import your GitHub repository and set the Root Directory to `frontend`.
4. Ensure the Framework Preset is detected as Next.js.
5. Add your Environment Variables in the Vercel dashboard.
6. Click Deploy.

## Contract Address Placeholder
CONTRACT_ADDRESS_HERE = CAMBP7LO53Z3CYLFXEY4LTL6EWFG2FOC5ZPP7QO35JPMIMRVFBXAZOOF

---
