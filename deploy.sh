#!/usr/bin/env bash
# ================================================================
# MediChain — Automated Deployment Script
# ================================================================
# Builds both Soroban smart contracts, deploys them to the Stellar
# Testnet in the correct order, initializes them, and updates the
# frontend/.env.local file with both contract IDs.
#
# Prerequisites:
#   - Stellar CLI  : cargo install --locked stellar-cli
#   - wasm32 target: rustup target add wasm32-unknown-unknown
#   - Rust 1.74+
#   - A funded Stellar Testnet identity named "govt_admin"
#       stellar keys generate govt_admin --network testnet
#       stellar keys fund    govt_admin --network testnet
#
# Windows users: Run this script in Git Bash or WSL.
#
# Usage:
#   bash deploy.sh                         # uses "govt_admin" identity
#   DEPLOYER=my_key bash deploy.sh         # custom identity
# ================================================================

set -euo pipefail   # exit immediately on any error

# ----------------------------------------------------------------
# CONFIGURATION
# ----------------------------------------------------------------
NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
PASSPHRASE="Test SDF Network ; September 2015"
DEPLOYER="${DEPLOYER:-govt_admin}"                     # Stellar CLI identity name
ENV_FILE="$(dirname "$0")/frontend/.env.local"         # Path to frontend env file
CONTRACTS_DIR="$(dirname "$0")/contracts"              # Contracts workspace root

REGISTRY_WASM="target/wasm32-unknown-unknown/release/medichain_registry.wasm"
CORE_WASM="target/wasm32-unknown-unknown/release/medichain_core.wasm"

# ----------------------------------------------------------------
# HELPERS
# ----------------------------------------------------------------
log_step() { echo ""; echo "═══════════════════════════════════════"; echo "  $1"; echo "═══════════════════════════════════════"; }
log_ok()   { echo "  ✅ $1"; }
log_warn() { echo "  ⚠️  $1"; }

# ----------------------------------------------------------------
# STEP 0 — Preflight Checks
# ----------------------------------------------------------------
log_step "STEP 0 — Preflight Checks"

command -v stellar >/dev/null 2>&1 || {
    echo "❌ stellar CLI not found. Install with: cargo install --locked stellar-cli"; exit 1;
}
command -v cargo   >/dev/null 2>&1 || { echo "❌ cargo not found."; exit 1; }

DEPLOYER_ADDR=$(stellar keys address "$DEPLOYER" 2>/dev/null) || {
    echo "❌ Stellar identity '$DEPLOYER' not found."
    echo "   Run: stellar keys generate $DEPLOYER --network $NETWORK"
    echo "        stellar keys fund    $DEPLOYER --network $NETWORK"
    exit 1
}
log_ok "Deployer identity : $DEPLOYER"
log_ok "Deployer address  : $DEPLOYER_ADDR"

# ----------------------------------------------------------------
# STEP 1 — Build Both Contracts (wasm32-unknown-unknown)
# ----------------------------------------------------------------
log_step "STEP 1 — Building Registry Contract"

cd "$CONTRACTS_DIR"

# Build Registry first (Core import needs its WASM)
cargo build \
    --package medichain-registry \
    --target wasm32-unknown-unknown \
    --release

if [ ! -f "$REGISTRY_WASM" ]; then
    echo "❌ Registry WASM not found at $REGISTRY_WASM"; exit 1;
fi
log_ok "Registry WASM built: $REGISTRY_WASM"

log_step "STEP 1b — Building Core Contract"

cargo build \
    --package medichain-core \
    --target wasm32-unknown-unknown \
    --release

if [ ! -f "$CORE_WASM" ]; then
    echo "❌ Core WASM not found at $CORE_WASM"; exit 1;
fi
log_ok "Core WASM built: $CORE_WASM"

# ----------------------------------------------------------------
# STEP 2 — Deploy Registry Contract
# ----------------------------------------------------------------
log_step "STEP 2 — Deploying Registry Contract"

REGISTRY_CONTRACT_ID=$(stellar contract deploy \
    --wasm "$REGISTRY_WASM" \
    --source "$DEPLOYER" \
    --network "$NETWORK" \
    --rpc-url "$RPC_URL" \
    --network-passphrase "$PASSPHRASE" \
    2>&1 | grep -E '^[A-Z0-9]{56}$' | tail -n1)

if [ -z "$REGISTRY_CONTRACT_ID" ]; then
    echo "❌ Failed to capture Registry Contract ID."; exit 1;
fi
log_ok "Registry Contract ID: $REGISTRY_CONTRACT_ID"

# ----------------------------------------------------------------
# STEP 3 — Deploy Core Contract
# ----------------------------------------------------------------
log_step "STEP 3 — Deploying Core Contract"

CORE_CONTRACT_ID=$(stellar contract deploy \
    --wasm "$CORE_WASM" \
    --source "$DEPLOYER" \
    --network "$NETWORK" \
    --rpc-url "$RPC_URL" \
    --network-passphrase "$PASSPHRASE" \
    2>&1 | grep -E '^[A-Z0-9]{56}$' | tail -n1)

if [ -z "$CORE_CONTRACT_ID" ]; then
    echo "❌ Failed to capture Core Contract ID."; exit 1;
fi
log_ok "Core Contract ID: $CORE_CONTRACT_ID"

# ----------------------------------------------------------------
# STEP 4 — Initialize Registry Contract
# ----------------------------------------------------------------
log_step "STEP 4 — Initializing Registry Contract"

stellar contract invoke \
    --id "$REGISTRY_CONTRACT_ID" \
    --source "$DEPLOYER" \
    --network "$NETWORK" \
    --rpc-url "$RPC_URL" \
    --network-passphrase "$PASSPHRASE" \
    -- initialize \
    --admin "$DEPLOYER_ADDR"

log_ok "Registry initialized with admin: $DEPLOYER_ADDR"

# ----------------------------------------------------------------
# STEP 5 — Initialize Core Contract (link to Registry)
# ----------------------------------------------------------------
log_step "STEP 5 — Initializing Core Contract (linking to Registry)"

stellar contract invoke \
    --id "$CORE_CONTRACT_ID" \
    --source "$DEPLOYER" \
    --network "$NETWORK" \
    --rpc-url "$RPC_URL" \
    --network-passphrase "$PASSPHRASE" \
    -- initialize \
    --registry_id "$REGISTRY_CONTRACT_ID"

log_ok "Core initialized with registry_id: $REGISTRY_CONTRACT_ID"

# ----------------------------------------------------------------
# STEP 6 — Update frontend/.env.local
# ----------------------------------------------------------------
log_step "STEP 6 — Updating frontend/.env.local"

cd "$(dirname "$0")"

# Preserve existing non-contract env vars, replace/add contract IDs
TMPFILE=$(mktemp)

# Write preserved non-contract-ID lines
grep -v "NEXT_PUBLIC_REGISTRY_CONTRACT_ID\|NEXT_PUBLIC_CORE_CONTRACT_ID\|NEXT_PUBLIC_CONTRACT_ID" \
    "$ENV_FILE" > "$TMPFILE" 2>/dev/null || true

# Append both new contract IDs
cat >> "$TMPFILE" << EOF

# ── MediChain v2 — Dual Contract Architecture ──────────────────
# Registry Contract: Hospital Authorization Whitelist
NEXT_PUBLIC_REGISTRY_CONTRACT_ID=$REGISTRY_CONTRACT_ID

# Core Logic Contract: Medical Records & Access Control
NEXT_PUBLIC_CORE_CONTRACT_ID=$CORE_CONTRACT_ID

# Network Configuration
NEXT_PUBLIC_SOROBAN_RPC_URL=$RPC_URL
NEXT_PUBLIC_NETWORK_PASSPHRASE=$PASSPHRASE
EOF

cp "$TMPFILE" "$ENV_FILE"
rm "$TMPFILE"

log_ok "frontend/.env.local updated!"

# ----------------------------------------------------------------
# SUMMARY
# ----------------------------------------------------------------
log_step "🚀 DEPLOYMENT COMPLETE"
echo ""
echo "  Registry Contract ID : $REGISTRY_CONTRACT_ID"
echo "  Core Contract ID     : $CORE_CONTRACT_ID"
echo "  Deployer Admin       : $DEPLOYER_ADDR"
echo "  Network              : $NETWORK"
echo ""
echo "  📋 Stellar Expert Links:"
echo "  Registry → https://stellar.expert/explorer/testnet/contract/$REGISTRY_CONTRACT_ID"
echo "  Core     → https://stellar.expert/explorer/testnet/contract/$CORE_CONTRACT_ID"
echo ""
echo "  ✅ frontend/.env.local has been updated."
echo "  ✅ Next step: Run 'cd frontend && npm run dev' to verify the UI."
echo ""
