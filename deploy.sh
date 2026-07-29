#!/usr/bin/env bash
# ================================================================
# MediChain — Production Deployment Script
# ================================================================
# Deploys dual Soroban smart contracts (Registry & Core) to Stellar
# Testnet. Gas is paid by funded CLI Friendbot account, while the
# Government Super Admin owner is set directly to the user's
# Freighter wallet public key:
# GCVGEHLD34OAWVIQYWYNLEU2YFOXINO4FEXLGPV6DBHFIFDQFCWQJDI5
#
# Automatically updates frontend/.env.local with real C... contract IDs.
# ================================================================

set -euo pipefail

# Ensure Cargo bin is in PATH for stellar CLI across Windows / WSL / Git Bash
export PATH="/c/Users/PRATEEK/.cargo/bin:$HOME/.cargo/bin:$PATH"

# ----------------------------------------------------------------
# CONFIGURATION
# ----------------------------------------------------------------
NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
PASSPHRASE="Test SDF Network ; September 2015"
DEPLOYER="${DEPLOYER:-govt_admin}"

# ABSOLUTE OWNER (User's Freighter Wallet Public Key)
ADMIN_ADDRESS="GCVGEHLD34OAWVIQYWYNLEU2YFOXINO4FEXLGPV6DBHFIFDQFCWQJDI5"

ENV_FILE="$(dirname "$0")/frontend/.env.local"
CONTRACTS_DIR="$(dirname "$0")/contracts"

REGISTRY_WASM="target/wasm32-unknown-unknown/release/medichain_registry.wasm"
CORE_WASM="target/wasm32-unknown-unknown/release/medichain_core.wasm"

# ----------------------------------------------------------------
# HELPERS
# ----------------------------------------------------------------
log_step() { echo ""; echo "═══════════════════════════════════════"; echo "  $1"; echo "═══════════════════════════════════════"; }
log_ok()   { echo "  ✅ $1"; }
log_warn() { echo "  ⚠️  $1"; }

# ----------------------------------------------------------------
# STEP 0 — Preflight & Identity Checks
# ----------------------------------------------------------------
log_step "STEP 0 — Preflight & Identity Checks"

command -v stellar >/dev/null 2>&1 || {
    echo "❌ stellar CLI not found. Install with: cargo install --locked stellar-cli"; exit 1;
}
command -v cargo   >/dev/null 2>&1 || { echo "❌ cargo not found."; exit 1; }

DEPLOYER_ADDR=$(stellar keys address "$DEPLOYER" 2>/dev/null) || {
    echo "Creating and funding CLI deployment identity: $DEPLOYER..."
    stellar keys generate "$DEPLOYER" --network "$NETWORK" || true
    stellar keys fund    "$DEPLOYER" --network "$NETWORK" || true
    DEPLOYER_ADDR=$(stellar keys address "$DEPLOYER")
}

log_ok "CLI Gas Paymaster : $DEPLOYER ($DEPLOYER_ADDR)"
log_ok "Super Admin Owner  : $ADMIN_ADDRESS (User Freighter Key)"

# ----------------------------------------------------------------
# STEP 1 — Build Contracts (wasm32-unknown-unknown)
# ----------------------------------------------------------------
log_step "STEP 1 — Building Registry Contract"

cd "$CONTRACTS_DIR"

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
log_step "STEP 2 — Deploying Registry Contract to Stellar Testnet"

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
log_step "STEP 3 — Deploying Core Contract to Stellar Testnet"

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
# STEP 4 — Initialize Registry (Set Admin = User Freighter Key)
# ----------------------------------------------------------------
log_step "STEP 4 — Initializing Registry (Owner: $ADMIN_ADDRESS)"

stellar contract invoke \
    --id "$REGISTRY_CONTRACT_ID" \
    --source "$DEPLOYER" \
    --network "$NETWORK" \
    --rpc-url "$RPC_URL" \
    --network-passphrase "$PASSPHRASE" \
    -- initialize \
    --admin "$ADMIN_ADDRESS"

log_ok "Registry initialized! Super-Admin Owner set to: $ADMIN_ADDRESS"

# ----------------------------------------------------------------
# STEP 5 — Initialize Core Contract (Link to Registry)
# ----------------------------------------------------------------
log_step "STEP 5 — Initializing Core Contract (Linking to Registry)"

stellar contract invoke \
    --id "$CORE_CONTRACT_ID" \
    --source "$DEPLOYER" \
    --network "$NETWORK" \
    --rpc-url "$RPC_URL" \
    --network-passphrase "$PASSPHRASE" \
    -- initialize \
    --registry_id "$REGISTRY_CONTRACT_ID"

log_ok "Core initialized and linked to Registry Contract ID: $REGISTRY_CONTRACT_ID"

# ----------------------------------------------------------------
# STEP 6 — Write clean frontend/.env.local (No Placeholders)
# ----------------------------------------------------------------
log_step "STEP 6 — Updating frontend/.env.local"

cd "$(dirname "$0")"

cat > "$ENV_FILE" << EOF
# ── MediChain Production Environment Configuration ─────────────
# Deployed on Stellar Testnet

NEXT_PUBLIC_REGISTRY_CONTRACT_ID=$REGISTRY_CONTRACT_ID
NEXT_PUBLIC_CORE_CONTRACT_ID=$CORE_CONTRACT_ID
NEXT_PUBLIC_SOROBAN_RPC_URL=$RPC_URL
NEXT_PUBLIC_NETWORK_PASSPHRASE=$PASSPHRASE
EOF

log_ok "frontend/.env.local updated with live C... contract IDs!"

# ----------------------------------------------------------------
# SUMMARY
# ----------------------------------------------------------------
log_step "🚀 DEPLOYMENT & RBAC INITIALIZATION COMPLETE"
echo ""
echo "  Registry Contract ID : $REGISTRY_CONTRACT_ID"
echo "  Core Contract ID     : $CORE_CONTRACT_ID"
echo "  Super-Admin Owner    : $ADMIN_ADDRESS"
echo "  Gas Paymaster        : $DEPLOYER_ADDR"
echo "  Network              : $NETWORK"
echo ""
echo "  📋 Stellar Expert Explorer Links:"
echo "  Registry → https://stellar.expert/explorer/testnet/contract/$REGISTRY_CONTRACT_ID"
echo "  Core     → https://stellar.expert/explorer/testnet/contract/$CORE_CONTRACT_ID"
echo ""
echo "  ✅ frontend/.env.local written with clean production contract IDs."
echo ""
