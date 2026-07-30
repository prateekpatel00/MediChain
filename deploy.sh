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
export PATH="/mnt/c/Users/PRATEEK/.cargo/bin:/c/Users/PRATEEK/.cargo/bin:$HOME/.cargo/bin:C:/Users/PRATEEK/.cargo/bin:$PATH"

STELLAR_BIN=$(command -v stellar 2>/dev/null || command -v stellar.exe 2>/dev/null || echo "stellar.exe")

# ----------------------------------------------------------------
# CONFIGURATION
# ----------------------------------------------------------------
NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
PASSPHRASE="Test SDF Network ; September 2015"
DEPLOYER="${DEPLOYER:-govt_admin}"

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

if ! $STELLAR_BIN --version >/dev/null 2>&1; then
    echo "❌ stellar CLI not found ($STELLAR_BIN). Install with: cargo install --locked stellar-cli"; exit 1;
fi

DEPLOYER_ADDR=$($STELLAR_BIN keys address "$DEPLOYER" 2>/dev/null || echo "")
if [ -z "$DEPLOYER_ADDR" ]; then
    echo "Creating and funding CLI deployment identity: $DEPLOYER..."
    $STELLAR_BIN keys generate "$DEPLOYER" --network "$NETWORK" || true
    $STELLAR_BIN keys fund    "$DEPLOYER" --network "$NETWORK" || true
    DEPLOYER_ADDR=$($STELLAR_BIN keys address "$DEPLOYER")
fi

# ABSOLUTE OWNER (User's Freighter Wallet Public Key)
ADMIN_ADDRESS="${ADMIN_ADDRESS:-GCVGEHLD34OAWVIQYWYNLEU2YFOXINO4FEXLGPV6DBHFIFDQFCWQJDI5}"

log_ok "CLI Gas Paymaster : $DEPLOYER ($DEPLOYER_ADDR)"
log_ok "Super Admin Owner  : $ADMIN_ADDRESS"

CARGO_BIN=$(command -v cargo 2>/dev/null || command -v cargo.exe 2>/dev/null || echo "cargo.exe")

# ----------------------------------------------------------------
# STEP 1 — Build Contracts (wasm32-unknown-unknown)
# ----------------------------------------------------------------
log_step "STEP 1 — Building Registry Contract"

cd "$CONTRACTS_DIR"

$CARGO_BIN build \
    --package medichain-registry \
    --target wasm32-unknown-unknown \
    --release

$STELLAR_BIN contract optimize --wasm "$REGISTRY_WASM" || true
if [ -f "target/wasm32-unknown-unknown/release/medichain_registry.optimized.wasm" ]; then
    REGISTRY_WASM="target/wasm32-unknown-unknown/release/medichain_registry.optimized.wasm"
fi

if [ ! -f "$REGISTRY_WASM" ]; then
    echo "❌ Registry WASM not found at $REGISTRY_WASM"; exit 1;
fi
log_ok "Registry WASM built & optimized: $REGISTRY_WASM"

log_step "STEP 1b — Building & Optimizing Core Contract"

$CARGO_BIN build \
    --package medichain-core \
    --target wasm32-unknown-unknown \
    --release

$STELLAR_BIN contract optimize --wasm "$CORE_WASM" || true
if [ -f "target/wasm32-unknown-unknown/release/medichain_core.optimized.wasm" ]; then
    CORE_WASM="target/wasm32-unknown-unknown/release/medichain_core.optimized.wasm"
fi

if [ ! -f "$CORE_WASM" ]; then
    echo "❌ Core WASM not found at $CORE_WASM"; exit 1;
fi
log_ok "Core WASM built & optimized: $CORE_WASM"

deploy_contract() {
    local WASM_PATH="$1"
    local CID=""
    for attempt in 1 2 3; do
        local OUT
        OUT=$($STELLAR_BIN contract deploy \
            --wasm "$WASM_PATH" \
            --source "$DEPLOYER" \
            --network "$NETWORK" \
            --rpc-url "$RPC_URL" \
            --network-passphrase "$PASSPHRASE" 2>&1 || true)
        CID=$(echo "$OUT" | grep -oE 'C[A-Z0-9]{55}' | tail -n1 || echo "")
        if [ -n "$CID" ]; then
            echo "$CID"
            return 0
        fi
        log_warn "Attempt $attempt failed: $OUT" >&2
        sleep 3
    done
    echo ""
    return 1
}

# ----------------------------------------------------------------
# STEP 2 — Deploy Registry Contract
# ----------------------------------------------------------------
log_step "STEP 2 — Deploying Registry Contract to Stellar Testnet"

REGISTRY_CONTRACT_ID=$(deploy_contract "$REGISTRY_WASM")

if [ -z "$REGISTRY_CONTRACT_ID" ]; then
    echo "❌ Failed to deploy Registry Contract after retries."; exit 1;
fi
log_ok "Registry Contract ID: $REGISTRY_CONTRACT_ID"

# ----------------------------------------------------------------
# STEP 3 — Deploy Core Contract
# ----------------------------------------------------------------
log_step "STEP 3 — Deploying Core Contract to Stellar Testnet"

CORE_CONTRACT_ID=$(deploy_contract "$CORE_WASM")

if [ -z "$CORE_CONTRACT_ID" ]; then
    echo "❌ Failed to deploy Core Contract after retries."; exit 1;
fi
log_ok "Core Contract ID: $CORE_CONTRACT_ID"

# ----------------------------------------------------------------
# STEP 4 — Initialize Registry (Set Admin = User Freighter Key)
# ----------------------------------------------------------------
log_step "STEP 4 — Initializing Registry (Owner: $ADMIN_ADDRESS)"

$STELLAR_BIN contract invoke \
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

$STELLAR_BIN contract invoke \
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

cd ..

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
