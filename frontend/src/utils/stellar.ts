// ============================================================
// DEPRECATED — utils/stellar.ts
// ============================================================
// This file is kept as a re-export barrel ONLY for backwards
// compatibility. Do NOT add new logic here.
//
// The single source of truth for all Stellar / Soroban helpers
// is: src/services/stellar.ts
//
// All imports in the codebase should be updated to point to:
//   import { ... } from '../services/stellar';
// ============================================================

export * from '../services/stellar';
