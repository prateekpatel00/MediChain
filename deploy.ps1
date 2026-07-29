# ================================================================
# MediChain — Production Deployment Script (PowerShell)
# ================================================================
# Deploys dual Soroban smart contracts (Registry & Core) to Stellar
# Testnet. Gas is paid by funded CLI Friendbot account, while the
# Government Super Admin owner is set directly to the user's
# Freighter wallet public key:
# GCVGEHLD34OAWVIQYWYNLEU2YFOXINO4FEXLGPV6DBHFIFDQFCWQJDI5
#
# Automatically updates frontend\.env.local with real C... contract IDs.
# ================================================================

$ErrorActionPreference = "Continue"

$NETWORK = "testnet"
$RPC_URL = "https://soroban-testnet.stellar.org"
$PASSPHRASE = "Test SDF Network ; September 2015"
$DEPLOYER = "govt_admin"

# ABSOLUTE OWNER (User's Freighter Wallet Public Key)
$ADMIN_ADDRESS = "GCVGEHLD34OAWVIQYWYNLEU2YFOXINO4FEXLGPV6DBHFIFDQFCWQJDI5"

$STELLAR = "$env:USERPROFILE\.cargo\bin\stellar.exe"
$ENV_FILE = Join-Path $PSScriptRoot "frontend\.env.local"
$CONTRACTS_DIR = Join-Path $PSScriptRoot "contracts"

$REGISTRY_WASM = Join-Path $CONTRACTS_DIR "target\wasm32v1-none\release\medichain_registry.wasm"
$CORE_WASM     = Join-Path $CONTRACTS_DIR "target\wasm32v1-none\release\medichain_core.wasm"

Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "  STEP 0 - Preflight and Identity Checks" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

if (-not (Test-Path $STELLAR)) {
    Write-Error "stellar.exe not found at $STELLAR"
    exit 1
}

$deployerAddr = & $STELLAR keys address $DEPLOYER
Write-Host "  CLI Gas Paymaster : $DEPLOYER ($deployerAddr)" -ForegroundColor Green
Write-Host "  Super Admin Owner  : $ADMIN_ADDRESS (User Freighter Key)" -ForegroundColor Green

# ----------------------------------------------------------------
# STEP 1 — Build Soroban Contracts
# ----------------------------------------------------------------
Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "  STEP 1 - Building Registry and Core Contracts (stellar contract build)" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

Set-Location $CONTRACTS_DIR

& $STELLAR contract build

if (-not (Test-Path $REGISTRY_WASM)) { Write-Error "Registry WASM not found!"; exit 1 }
Write-Host "  Registry WASM built: $REGISTRY_WASM" -ForegroundColor Green

if (-not (Test-Path $CORE_WASM)) { Write-Error "Core WASM not found!"; exit 1 }
Write-Host "  Core WASM built: $CORE_WASM" -ForegroundColor Green

# ----------------------------------------------------------------
# STEP 2 — Deploy Registry Contract
# ----------------------------------------------------------------
Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "  STEP 2 - Deploying Registry Contract" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$regOutput = & $STELLAR contract deploy `
    --wasm $REGISTRY_WASM `
    --source $DEPLOYER `
    --network $NETWORK `
    --rpc-url $RPC_URL `
    --network-passphrase $PASSPHRASE 2>&1 | Out-String

$REGISTRY_CONTRACT_ID = ($regOutput | Select-String -Pattern 'C[A-Z0-9]{55}' -CaseSensitive).Matches.Value | Select-Object -Last 1

if (-not $REGISTRY_CONTRACT_ID) {
    Write-Host "Failed to deploy Registry Contract: $regOutput" -ForegroundColor Red
    exit 1
}
Write-Host "  Registry Contract ID: $REGISTRY_CONTRACT_ID" -ForegroundColor Green

# ----------------------------------------------------------------
# STEP 3 — Deploy Core Contract
# ----------------------------------------------------------------
Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "  STEP 3 - Deploying Core Contract" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$coreOutput = & $STELLAR contract deploy `
    --wasm $CORE_WASM `
    --source $DEPLOYER `
    --network $NETWORK `
    --rpc-url $RPC_URL `
    --network-passphrase $PASSPHRASE 2>&1 | Out-String

$CORE_CONTRACT_ID = ($coreOutput | Select-String -Pattern 'C[A-Z0-9]{55}' -CaseSensitive).Matches.Value | Select-Object -Last 1

if (-not $CORE_CONTRACT_ID) {
    Write-Host "Failed to deploy Core Contract: $coreOutput" -ForegroundColor Red
    exit 1
}
Write-Host "  Core Contract ID: $CORE_CONTRACT_ID" -ForegroundColor Green

# ----------------------------------------------------------------
# STEP 4 — Initialize Registry (Owner = $ADMIN_ADDRESS)
# ----------------------------------------------------------------
Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "  STEP 4 - Initializing Registry (Owner: $ADMIN_ADDRESS)" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

& $STELLAR contract invoke `
    --id $REGISTRY_CONTRACT_ID `
    --source $DEPLOYER `
    --network $NETWORK `
    --rpc-url $RPC_URL `
    --network-passphrase $PASSPHRASE `
    -- initialize `
    --admin $ADMIN_ADDRESS

Write-Host "  Registry Initialized! Super Admin set to: $ADMIN_ADDRESS" -ForegroundColor Green

# ----------------------------------------------------------------
# STEP 5 — Initialize Core (Link to Registry)
# ----------------------------------------------------------------
Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "  STEP 5 - Initializing Core (Linking to Registry)" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

& $STELLAR contract invoke `
    --id $CORE_CONTRACT_ID `
    --source $DEPLOYER `
    --network $NETWORK `
    --rpc-url $RPC_URL `
    --network-passphrase $PASSPHRASE `
    -- initialize `
    --registry_id $REGISTRY_CONTRACT_ID

Write-Host "  Core Initialized with registry_id: $REGISTRY_CONTRACT_ID" -ForegroundColor Green

# ----------------------------------------------------------------
# STEP 6 — Write clean frontend\.env.local (No Placeholders)
# ----------------------------------------------------------------
Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "  STEP 6 - Updating frontend\.env.local" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$envContent = @"
# ── MediChain Production Environment Configuration ─────────────
# Deployed on Stellar Testnet

NEXT_PUBLIC_REGISTRY_CONTRACT_ID=$REGISTRY_CONTRACT_ID
NEXT_PUBLIC_CORE_CONTRACT_ID=$CORE_CONTRACT_ID
NEXT_PUBLIC_SOROBAN_RPC_URL=$RPC_URL
NEXT_PUBLIC_NETWORK_PASSPHRASE=$PASSPHRASE
"@

Set-Content -Path $ENV_FILE -Value $envContent -Encoding utf8
Write-Host "  frontend\.env.local updated with clean C... contract IDs!" -ForegroundColor Green

# ----------------------------------------------------------------
# SUMMARY
# ----------------------------------------------------------------
Write-Host "`n=======================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT AND RBAC INITIALIZATION COMPLETE" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host "  Registry Contract ID : $REGISTRY_CONTRACT_ID"
Write-Host "  Core Contract ID     : $CORE_CONTRACT_ID"
Write-Host "  Super-Admin Owner    : $ADMIN_ADDRESS"
Write-Host "  Gas Paymaster        : $deployerAddr"
Write-Host "  Network              : $NETWORK"
Write-Host ""
Write-Host "  Stellar Expert Explorer Links:"
Write-Host "  Registry -> https://stellar.expert/explorer/testnet/contract/$REGISTRY_CONTRACT_ID"
Write-Host "  Core     -> https://stellar.expert/explorer/testnet/contract/$CORE_CONTRACT_ID"
Write-Host ""
