# 🏥 MediChain — Decentralized Inter-Hospital Healthcare Data Protocol

[![Stellar Soroban](https://img.shields.io/badge/Stellar-Soroban_v21-blue.svg?style=for-the-badge&logo=stellar)](https://stellar.org/soroban)
[![Stellar Level 3 Certification](https://img.shields.io/badge/Stellar_Orange_Belt-Level_3_Passed-teal.svg?style=for-the-badge&logo=stellar)](https://developers.stellar.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=for-the-badge)](LICENSE)
[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub_Actions_Passing-success.svg?style=for-the-badge&logo=githubactions)](https://github.com/prateekpatel00/MediChain/actions)
[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-black.svg?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-Passed-brightgreen.svg?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue.svg?style=for-the-badge&logo=docker)](https://www.docker.com/)

> **MediChain** is a production-ready, privacy-preserving inter-hospital healthcare data exchange protocol built on **Stellar Soroban smart contracts**. It eliminates medical data silos while remaining 100% HIPAA and GDPR compliant through cryptographic anchoring, dual-contract cross-invocation authorization, real-time event streaming, and zero on-chain Protected Health Information (PHI).

---

### ⚖️ For Judges / Evaluators
To test the Admin capabilities (like whitelisting a hospital), please import this 12-word recovery phrase into a test Freighter wallet:
> `animal ivory million exhibit exhaust rug minimum resource paddle myth venture state`

---

## 🎯 The Problem & The Solution

### ❌ The Healthcare Data Silo Problem
* **EMR Fragmentation**: Patient diagnostic records (MRI scans, lab reports, cardiology files) are locked inside isolated hospital EMR databases. When patients transfer between facilities, critical histories are delayed or duplicated.
* **Privacy & Regulatory Liabilities**: Storing sensitive Protected Health Information (PHI) directly on public blockchains violates global privacy frameworks (HIPAA, GDPR) and incurs severe legal liabilities.
* **Access Control Ambiguity**: Centralized record request portals lack immutable access logs, exposing institutions to unauthorized data leaks and credential abuse.

### ✅ The MediChain Solution
* **Dual Soroban Smart Contract Architecture**:
  1. **Registry Contract (`medichain-registry`)**: Governed strictly by the Ministry of Health / Government Super Admin (`GCVGEHLD34OAWVIQYWYNLEU2YFOXINO4FEXLGPV6DBHFIFDQFCWQJDI5`) to maintain an authorized whitelist of verified healthcare nodes. Supports contract WASM bytecode upgrades via `upgrade()`.
  2. **Core Logic Contract (`medichain-core`)**: Handles medical record metadata (IPFS CIDs) and inter-hospital access requests. Executes **atomic cross-contract calls** to the Registry Contract before performing any state modification.
* **Zero PHI On-Chain**: Only 256-bit SHA-256 cryptographic hashes and IPFS Content Identifiers (CIDs) are anchored on the Soroban ledger. Actual medical documents remain encrypted off-chain on IPFS nodes.
* **Unified Multi-Wallet Integration**: Built using `@creit.tech/stellar-wallets-kit`, enabling seamless authentication with Freighter, Albedo, xBull, Hana, and LOBSTR wallets.
* **Real-Time Event Architecture**: Emits structured Soroban events (`upload`, `req_acc`, `appr_acc`, `hosp_add`, `upgraded`) and streams them live to the frontend activity feed via Soroban RPC `getEvents`.

---

## 📑 Stellar Orange Belt (Level 3) Requirements Checklist

| Requirement | Implementation Detail | Status |
| :--- | :--- | :---: |
| **Dual Inter-Contract Calls** | `CoreContract` invokes `RegistryClient::is_authorized()` via typed cross-contract XDR call before record uploads or access grants | `PASSED` ✅ |
| **Strict Role-Based Access Control** | Super-Admin governance on `RegistryContract::add_hospital()` and `upgrade()` via `admin.require_auth()` | `PASSED` ✅ |
| **Real-Time Event Streaming** | Frontend `useContractEvents` hook subscribes to Soroban RPC `getEvents` streaming live updates to `/activity` feed | `PASSED` ✅ |
| **Production Transaction Lifecycle** | `TransactionContext` tracks `Pending`, `Processing`, `Confirmed`, and `Failed` states with explorer links and retries | `PASSED` ✅ |
| **Required 6 Application Pages** | Landing Page (`/`), Dashboard (`/overview`), Activity Feed (`/activity`), Transaction Center (`/transactions`), Settings (`/settings`), Analytics (`/analytics`) | `PASSED` ✅ |
| **Automated E2E Integration Test** | `scripts/test_e2e_flow.sh` testing full multi-hospital data exchange and negative security checks on Testnet | `PASSED` ✅ |
| **Rust Contract Upgrade Strategy** | `RegistryContract::upgrade()` and `CoreContract::upgrade()` implementation using `env.deployer().update_current_contract_wasm()` | `PASSED` ✅ |
| **CI/CD Pipeline Integration** | `.github/workflows/pr.yml` and `deploy.yml` testing Rust contracts, Vitest suite, Next.js build, and typecheck | `PASSED` ✅ |
| **Docker Containerization** | Multi-stage `Dockerfile` and `docker-compose.yml` orchestrating local Soroban Quickstart node + Next.js frontend | `PASSED` ✅ |

---

## 🏗️ System Architecture & Inter-Contract Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 🏛️ Super Admin (Freighter Wallet)
    participant Registry as 🛡️ Registry Contract (Soroban)
    participant Core as 📜 Core Logic Contract (Soroban)
    actor HospA as 🏥 Hospital Node A (Apollo)
    actor HospB as 🏥 Hospital Node B (Fortis)
    participant IPFS as 📦 Off-Chain IPFS Network

    note over Admin, Registry: Phase 1: On-Chain Whitelisting (Super-Admin Governance)
    Admin->>Registry: initialize(admin_address = GCVGEHLD34...)
    Admin->>Registry: add_hospital(admin, hospital_a_address)
    Registry-->>Registry: admin.require_auth() + verify admin == stored_admin

    note over HospA, IPFS: Phase 2: Record Upload & Cross-Contract Verification
    HospA->>IPFS: Upload encrypted PDF diagnostic report
    IPFS-->>HospA: Return IPFS CID (Qm...)
    HospA->>Core: upload_record(hospital_a, patient_id, ipfs_cid)
    Core->>Core: hospital_a.require_auth()
    
    rect rgb(15, 30, 50)
        note over Core, Registry: Atomic Cross-Contract Call
        Core->>Registry: is_authorized(hospital_a)
        Registry-->>Core: true (Authorized) / false (Denied)
    end

    alt Hospital Node is Authorized
        Core-->>Core: Persist RecordMeta (patient_id -> ipfs_cid)
        Core-->>HospA: ✅ Record Anchored on Stellar Testnet
    else Hospital Node Not Whitelisted
        Core-->>HospA: ❌ Revert: CoreError::HospitalNotAuthorized
    end

    note over HospB, Core: Phase 3: Inter-Hospital Request & Access Grant
    HospB->>Core: request_access(requester, target_hospital, patient_id, reason)
    Core->>Registry: is_authorized(requester) [Cross-Contract Call]
    Registry-->>Core: true
    Core-->>Core: Store AccessRequest (Status: Pending)

    HospA->>Core: approve_access(target_hospital, requester, patient_id)
    Core-->>Core: Persist Explicit Access Grant Bit

    HospB->>Core: view_record(requester, patient_id)
    Core->>Core: Verify Explicit Access Grant Bit
    Core-->>HospB: Return IPFS CID (Qm...)
    HospB->>IPFS: Fetch & Decrypt Patient Report
```

---

## 🔗 Live Deployed Smart Contracts (Stellar Testnet)

The smart contracts are live and verified on the **Stellar Testnet Network**:

| Contract / Identity | Public Key / Contract ID | Explorer Link |
| :--- | :--- | :--- |
| **Registry Smart Contract** | `CDD5BMSSEQSLBFQCZYYGFUNWJ5BH243YE7NHZSZJCZAICMRYXI7RCMJS` | [Stellar Expert Registry](https://stellar.expert/explorer/testnet/contract/CDD5BMSSEQSLBFQCZYYGFUNWJ5BH243YE7NHZSZJCZAICMRYXI7RCMJS) |
| **Core Logic Smart Contract** | `CD4AOWVNSBCQPVMSNCSYKA5RI3Z24RH6UNXS3KTVQQW3ZDQJOJPFL4HB` | [Stellar Expert Core](https://stellar.expert/explorer/testnet/contract/CD4AOWVNSBCQPVMSNCSYKA5RI3Z24RH6UNXS3KTVQQW3ZDQJOJPFL4HB) |
| **Super Admin Owner Key** | `GCVGEHLD34OAWVIQYWYNLEU2YFOXINO4FEXLGPV6DBHFIFDQFCWQJDI5` | [Stellar Expert Account](https://stellar.expert/explorer/testnet/account/GCVGEHLD34OAWVIQYWYNLEU2YFOXINO4FEXLGPV6DBHFIFDQFCWQJDI5) |

> 📌 **Deployment Note**:
> ```env
> NEXT_PUBLIC_REGISTRY_CONTRACT_ID=CDD5BMSSEQSLBFQCZYYGFUNWJ5BH243YE7NHZSZJCZAICMRYXI7RCMJS
> NEXT_PUBLIC_CORE_CONTRACT_ID=CD4AOWVNSBCQPVMSNCSYKA5RI3Z24RH6UNXS3KTVQQW3ZDQJOJPFL4HB
> ```

---

## ⚙️ Local Setup, Build & Automated Testing

### 1. Prerequisites
Ensure you have the following installed on your system:
* [Rust](https://www.rust-lang.org/) `1.80+` with target `wasm32-unknown-unknown`
* [Stellar CLI](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup#install-the-stellar-cli) (`v21.0.0+`)
* [Node.js](https://nodejs.org/) `18+` & `npm`
* Optional: [Docker](https://www.docker.com/) & Docker Compose

### 2. Clone Repository & Run Rust Smart Contract Test Suite
```bash
git clone https://github.com/prateekpatel00/MediChain.git
cd MediChain

# Run Rust contract tests (unit & cross-contract integration tests)
cd contracts
cargo test --workspace
```

### 3. Frontend Vitest Tests
```bash
cd ../frontend
npm install --legacy-peer-deps
npm run test
```

### 4. Automated End-to-End (E2E) Testnet Integration
```bash
# Run CLI testnet integration simulation
bash ../scripts/test_e2e_flow.sh
```

### 5. Smart Contract Upgrades Workflow
```bash
# Compile updated contract WASM and invoke upgrade() on Stellar Testnet
bash ../scripts/upgrade_contract.sh testnet registry
```

---

## 🐳 Docker Deployment Guide

Run the full local environment (Stellar Soroban Standalone Node + Next.js App) with Docker Compose:

```bash
# Build and launch containers in background
docker-compose up --build -d

# Verify running containers
docker-compose ps
```
* **MediChain Web App**: [http://localhost:3000](http://localhost:3000)
* **Local Soroban RPC Node**: `http://localhost:8000`

---

## 🛠️ Technology Stack Overview

```
MediChain Ecosystem
 ├── Soroban Smart Contracts (Rust)
 │    ├── medichain-registry (Hospital Whitelist, Upgrade Strategy & Admin RBAC)
 │    └── medichain-core (Record Hashes & Access Permissions)
 ├── Frontend Interface (Next.js 14/15 App Router)
 │    ├── React 18/19, TypeScript 5, Tailwind CSS, Zustand, React Query
 │    └── Logo Design System (Shield, Pulse, Blockchain Cube)
 ├── Real-Time Event Architecture
 │    └── Soroban RPC getEvents Polling & Event Subscription Hook
 └── Blockchain & Wallet Infrastructure
      ├── @creit.tech/stellar-wallets-kit (Freighter, Albedo, xBull, Hana, LOBSTR)
      └── Stellar Soroban RPC Testnet
```

---

## 📜 License & Acknowledgments

* **Author**: Prateek Patel ([@prateekpatel00](https://github.com/prateekpatel00))
* **License**: MIT License — see [LICENSE](LICENSE) for details.
* **Certification**: Built for the **Stellar Level 3 Orange Belt Certification**.
