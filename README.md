# MediChain | Decentralized Inter-Hospital Health Exchange

<div align="center">

[![Stellar Soroban](https://img.shields.io/badge/Stellar-Soroban%20Smart%20Contracts-00F2FE?style=for-the-badge&logo=stellar)](https://stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-14%20App%20Router-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Rust](https://img.shields.io/badge/Rust-Soroban%20SDK%2021.0-black?style=for-the-badge&logo=rust)](https://rust-lang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**A production-grade Web3 healthcare ecosystem built on the Stellar Testnet using Soroban Smart Contracts.**

[View Live Contract on Stellar Expert](#-live-deployment) • [Frontend Setup](#-running-locally) • [Contract Docs](#-smart-contract-functions)

</div>

---

## 🏥 Overview

MediChain solves a critical real-world healthcare problem: **when a patient switches cities or hospitals, they are forced to redo expensive medical tests** because records are siloed across different hospital systems.

MediChain provides a **secure, decentralized 3-Tier Role-Based Access Control (RBAC)** platform where Patient Health Information (PHI) is **hashed locally in the browser** and **authorized on-chain** — ensuring strict privacy and HIPAA-like compliance. No actual medical data ever touches the blockchain.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏛️ **3-Tier RBAC System** | Distinct roles for Government (Super Admin), Data Custodians (hospitals), and Requesters |
| ⛓️ **On-Chain Authorization** | Only Govt-approved hospitals can publish record hashes to Stellar |
| 🔐 **Native WebCrypto Hashing** | Medical PDFs/Images are SHA-256 hashed in the browser; only the CID is stored on-chain |
| 🏨 **Hospital Action Center** | Hospitals can receive access requests, view emergency reasons, and Approve/Reject sharing |
| 🎨 **Premium Multi-Page UI** | Startup-grade Landing Page with dedicated `/govt` and `/hospital` portals |
| 🌑 **Dark Glassmorphism UI** | Modern dark-mode glassmorphism design with smooth animations |
| 🔑 **Freighter Wallet Integration** | 100% on-chain interactions requiring live wallet signatures for all state changes |

---

## 🛠️ Tech Stack

### Backend (Smart Contract)

| Technology | Version | Purpose |
|---|---|---|
| Rust | 1.74+ | Smart contract language |
| Soroban SDK | 21.0.0 | Stellar smart contract framework |
| Stellar CLI | Latest | Contract compilation & deployment |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.1.0 | React framework with App Router |
| TypeScript | 5.3.3 | Type-safe JavaScript |
| Tailwind CSS | 3.4.1 | Utility-first styling |
| Lucide React | 0.344.0 | Icon library |
| @stellar/stellar-sdk | 11.3.0 | Stellar blockchain SDK |
| @stellar/freighter-api | 2.0.0 | Freighter wallet integration |

### Blockchain

| Property | Value |
|---|---|
| Network | Stellar Testnet |
| RPC URL | `https://soroban-testnet.stellar.org` |
| Network Passphrase | `Test SDF Network ; September 2015` |

---

## 🚀 Live Deployment

> **The MediChain smart contract is live and deployed on the Stellar Testnet.**

| Property | Value |
|---|---|
| 📋 **Contract ID** | `CAMBP7LO53Z3CYLFXEY4LTL6EWFG2FOC5ZPP7QO35JPMIMRVFBXAZOOF` |
| 🌐 **Network** | Stellar Testnet |
| 🔗 **Explorer** | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CAMBP7LO53Z3CYLFXEY4LTL6EWFG2FOC5ZPP7QO35JPMIMRVFBXAZOOF) |
| 📦 **Contract Name** | `medichain-contract` v0.1.0 |

---

## 📂 Project Structure

```
MediChain/
├── contracts/              # Soroban Smart Contract (Rust)
│   ├── src/
│   │   ├── lib.rs          # Main contract logic (RBAC, record management)
│   │   └── test.rs         # Contract unit tests
│   ├── Cargo.toml          # Rust dependencies & build config
│   └── Cargo.lock
│
├── frontend/               # Next.js Frontend (TypeScript)
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   │   ├── page.tsx    # Landing Page
│   │   │   ├── govt/       # Government Admin Portal
│   │   │   └── hospital/   # Hospital Action Center
│   │   ├── components/     # Reusable UI components
│   │   └── utils/
│   │       └── stellar.ts  # Stellar SDK & contract interaction helpers
│   ├── package.json
│   ├── tailwind.config.ts
│   └── .env.local          # Environment variables (not committed)
│
├── .gitignore
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites

- **Node.js** v18 or higher → [Download](https://nodejs.org)
- **Rust & Cargo** v1.74+ → [Install Rustup](https://rustup.rs)
- **Stellar CLI** → `cargo install --locked stellar-cli`
- **wasm32 target** → `rustup target add wasm32-unknown-unknown`
- **Freighter Wallet** → [Chrome Extension](https://www.freighter.app/)

---

## 🔐 Environment Variables

Create a `.env.local` file inside the `/frontend` directory:

```env
NEXT_PUBLIC_CONTRACT_ID=CAMBP7LO53Z3CYLFXEY4LTL6EWFG2FOC5ZPP7QO35JPMIMRVFBXAZOOF
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

> ⚠️ This file is listed in `.gitignore` and will **never** be committed to the repository.

---

## 👛 Wallet Setup

1. Install the **[Freighter Wallet](https://www.freighter.app/)** browser extension.
2. Create a new wallet and **securely back up your seed phrase**.
3. Open the extension → **Settings (Gear) Icon** → **Network** → Select **Testnet**.
4. Fund your testnet address using the in-app **Friendbot** feature (~1 XLM is sufficient).

---

## 🏗️ Contract Deployment

To build and deploy the smart contract to the Stellar Testnet from the `/contracts` directory:

```bash
# Step 1: Add WASM compile target
rustup target add wasm32-unknown-unknown

# Step 2: Compile the contract to WASM
cargo build --target wasm32-unknown-unknown --release

# Step 3: Generate the Government Admin identity
stellar keys generate govt_admin --network testnet
stellar keys fund govt_admin --network testnet

# Step 4: Deploy the contract
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/medichain_contract.wasm \
  --source govt_admin \
  --network testnet
```

> ✅ **Already deployed!** Contract is live at:
> `CAMBP7LO53Z3CYLFXEY4LTL6EWFG2FOC5ZPP7QO35JPMIMRVFBXAZOOF`
>
> After deployment, call the `initialize` function to register the Government Admin as Super Admin.

---

## 💻 Running Locally

Navigate into the `/frontend` directory and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

| Route | Description |
|---|---|
| `/` | Main Landing Page |
| `/govt` | Government Super Admin Portal |
| `/hospital` | Hospital Action Center |

---

## 📜 Smart Contract Functions

The `MediChainContract` exposes the following on-chain functions:

### 🔧 State-Changing Functions

| Function | Parameters | Role Required | Description |
|---|---|---|---|
| `initialize` | `govt_admin: Address` | — | Sets the Government Super Admin (one-time only) |
| `grant_hospital_rights` | `govt_admin: Address, hospital: Address` | Government Admin | Authorizes a hospital wallet to upload records |
| `upload_record` | `hospital: Address, patient_id: String, ipfs_hash: String` | Authorized Hospital | Stores a patient's record SHA-256 hash on-chain |
| `request_access` | `requester: Address, target_hospital: Address, patient_id: String, reason: String` | Any Hospital | Sends an inter-hospital data access request |
| `approve_access` | `target_hospital: Address, requester: Address, patient_id: String` | Record-Owning Hospital | Approves a pending access request |
| `reject_access` | `target_hospital: Address, requester: Address, patient_id: String` | Record-Owning Hospital | Rejects a pending access request |

### 📖 Read-Only Functions

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `view_record` | `viewer: Address, patient_id: String` | `String` (IPFS hash) | Returns IPFS hash if caller is owner or has approved access |
| `is_hospital_authorized` | `hospital: Address` | `bool` | Checks if a hospital is Govt-authorized |
| `get_govt_admin` | — | `Option<Address>` | Returns the stored Government Admin address |
| `check_access` | `requester: Address, patient_id: String` | `bool` | Checks if a requester has an approved access grant |

### ⚠️ Error Codes

| Code | Name | Description |
|---|---|---|
| 1 | `NotInitialized` | Contract not initialized yet |
| 2 | `AlreadyInitialized` | Contract already initialized |
| 3 | `HospitalNotAuthorized` | Hospital not authorized by Government Admin |
| 4 | `RecordNotFound` | Patient record does not exist on-chain |
| 5 | `Unauthorized` | Caller lacks permission for this action |
| 6 | `RequestNotFound` | Access request does not exist |

---

## 🔄 RBAC Architecture

```
┌──────────────────────────────────────────┐
│         GOVERNMENT SUPER ADMIN            │
│  (Stellar Wallet — Freighter)             │
│                                           │
│  • initialize()                           │
│  • grant_hospital_rights()                │
└────────────────────┬──────────────────────┘
                     │ Authorizes
                     ▼
┌──────────────────────────────────────────┐
│        DATA CUSTODIAN (Hospital A)        │
│  (e.g., Apollo Hospital, Delhi)           │
│                                           │
│  • upload_record()                        │
│  • approve_access()                       │
│  • reject_access()                        │
└────────────────────┬──────────────────────┘
                     │ Access Request
                     ▼
┌──────────────────────────────────────────┐
│         REQUESTER (Hospital B)            │
│  (e.g., Jabalpur Hospital)                │
│                                           │
│  • request_access()                       │
│  • view_record() (if approved)            │
└──────────────────────────────────────────┘
```

---

## ☁️ Frontend Deployment (Vercel)

1. Push your code to [GitHub](https://github.com/prateekpatel00/MediChain).
2. Log in to [Vercel](https://vercel.com) → **Add New Project**.
3. Import the `prateekpatel00/MediChain` repository.
4. Set the **Root Directory** to `frontend`.
5. Ensure the **Framework Preset** is detected as **Next.js**.
6. Add Environment Variables in the Vercel dashboard:
   - `NEXT_PUBLIC_CONTRACT_ID` → `CAMBP7LO53Z3CYLFXEY4LTL6EWFG2FOC5ZPP7QO35JPMIMRVFBXAZOOF`
   - `NEXT_PUBLIC_SOROBAN_RPC_URL` → `https://soroban-testnet.stellar.org`
   - `NEXT_PUBLIC_NETWORK_PASSPHRASE` → `Test SDF Network ; September 2015`
7. Click **Deploy**.

---

## 🔒 Security & Privacy

- **No PHI on-chain**: Only the SHA-256 hash (IPFS CID) of medical documents is stored. Actual medical data is **never uploaded to the blockchain**.
- **Browser-side hashing**: WebCrypto API generates hashes locally before any on-chain interaction.
- **Signature-gated state changes**: Every write operation requires a valid Freighter wallet signature.
- **Strict RBAC**: Unauthorized hospitals cannot upload records; unauthorized requesters cannot view hashes.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

**Built with ❤️ on Stellar Testnet**

[GitHub](https://github.com/prateekpatel00/MediChain) • [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CAMBP7LO53Z3CYLFXEY4LTL6EWFG2FOC5ZPP7QO35JPMIMRVFBXAZOOF)

</div>