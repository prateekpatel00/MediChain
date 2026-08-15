#!/usr/bin/env bgash
# ================================================================
# MediChain — Soroban Smart Contract Upgrade Script
# ================================================================
# Follows Stellar Soroban contract upgrade recommendations:
# 1. Compiles updated WASM binary for target contract.
# 2. Installs new WASM bytecode on-chain via Stellar CLI (`stellar contract install`).
# 3. Invokes contract `upgrade` method using Super-Admin authorization key.
# ================================================================

set -e

NETWORK=${1:-testnet}
TARGET_CONTRACT=${2:-registry}

echo "🚀 Starting Soroban Contract Upgrade workflow on Network: $NETWORK"
echo "Target Contract: $TARGET_CONTRACT"

# 1. Compile WASM binary
cd contracts
echo "📦 Compiling release WASM binaries..."
cargo build --target wasm32-unknown-unknown --release

WASM_PATH="target/wasm32-unknown-unknown/release/medichain_${TARGET_CONTRACT}.wasm"

if [ ! -f "$WASM_PATH" ]; then
    echo "❌ Error: WASM binary not found at $WASM_PATH"
    exit 1
fi

echo "✅ WASM compiled successfully: $WASM_PATH"

# 2. Install WASM and retrieve NEW_WASM_HASH
echo "⚡ Installing WASM bytecode on Stellar $NETWORK..."
NEW_WASM_HASH=$(stellar contract install \
    --wasm "$WASM_PATH" \
    --network "$NETWORK" \
    --source-account admin)

echo "✅ New WASM Hash installed on ledger: $NEW_WASM_HASH"

# 3. Invoke upgrade method on deployed contract
if [ "$TARGET_CONTRACT" = "registry" ]; then
    CONTRACT_ID=${REGISTRY_CONTRACT_ID:-CDD5BMSSEQSLBFQCZYYGFUNWJ5BH243YE7NHZSZJCZAICMRYXI7RCMJS}
else
    CONTRACT_ID=${CORE_CONTRACT_ID:-CD4AOWVNSBCQPVMSNCSYKA5RI3Z24RH6UNXS3KTVQQW3ZDQJOJPFL4HB}
fi

echo "🔄 Invoking upgrade() on Contract ID: $CONTRACT_ID..."
stellar contract invoke \
    --id "$CONTRACT_ID" \
    --network "$NETWORK" \
    --source-account admin \
    -- \
    upgrade \
    --admin GCVGEHLD34OAWVIQYWYNLEU2YFOXINO4FEXLGPV6DBHFIFDQFCWQJDI5 \
    --new_wasm_hash "$NEW_WASM_HASH"

echo "🎉 Contract upgrade completed successfully! New WASM Hash: $NEW_WASM_HASH"
