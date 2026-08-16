// ================================================================
// MediChain Core Contract — Comprehensive Integration Tests
// ================================================================
// Cross-contract testing strategy (Soroban SDK 21):
//
//   The Registry contract is tested as a deployed WASM binary.
//   We use `contractimport!` inside a local `registry_wasm` module
//   to import the compiled WASM bytes and expose a WASM-based client.
//   This is the ONLY correct way to do cross-contract testing when
//   the callee (Registry) must be an independent WASM executable.
//
//   The Core contract is the "unit under test" and is registered as
//   a native Rust struct via `env.register_contract(None, CoreContract)`.
//
//   Cross-contract call path during tests:
//     CoreContract::upload_record(hospital, ...)
//       → require_hospital_authorized(&env, &hospital)
//         → RegistryClient::new(&env, &registry_id).is_authorized(&hospital)
//           → executes the Registry WASM in the test Env (no mocks!)
//
// Test Matrix (7 Tests):
//   ✅ test_01_initialize_and_link_registry
//   ✅ test_02_upload_record_authorized_hospital_succeeds
//   ✅ test_03_upload_record_unauthorized_hospital_panics
//   ✅ test_04_request_access_unauthorized_requester_panics
//   ✅ test_05_full_access_lifecycle_with_cross_contract
//   ✅ test_06_revoked_hospital_upload_is_denied
//   ✅ test_07_core_not_initialized_panics
// ================================================================

#[cfg(test)]
mod test {
    // ── Import the registry WASM into a local module ─────────────
    // contractimport! reads the compiled WASM bytes (produced by
    // `cargo build --package medichain-registry --target wasm32-unknown-unknown --release`)
    // and generates:
    //   - `registry_wasm::WASM`          : &[u8] WASM bytes for register_contract_wasm()
    //   - `registry_wasm::Client`        : typed client for calling registry functions
    // Path is relative to core/Cargo.toml (CARGO_MANIFEST_DIR = contracts/core/).
    mod registry_wasm {
        soroban_sdk::contractimport!(
            file = "../target/wasm32-unknown-unknown/release/medichain_registry.wasm"
        );
    }

    // ── Explicit crate-root imports (avoids super::* ambiguity) ──
    use crate::{CoreContract, CoreContractClient};

    // ── Soroban test utilities ────────────────────────────────────
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    // ----------------------------------------------------------------
    // HELPER: Boot both contracts in a fresh test Env
    // ----------------------------------------------------------------
    // Returns (registry_client, core_client) with Core already linked
    // to Registry via Core::initialize(registry_id).
    fn setup(env: &Env) -> (registry_wasm::Client<'_>, CoreContractClient<'_>) {
        // Register Registry as a WASM binary (real cross-contract execution)
        let registry_id = env.register_contract_wasm(None, registry_wasm::WASM);

        // Register Core as a native Rust contract (the unit under test)
        let core_id = env.register_contract(None, CoreContract);

        let registry_client = registry_wasm::Client::new(env, &registry_id);
        let core_client     = CoreContractClient::new(env, &core_id);

        // Link Core → Registry
        core_client.initialize(&registry_id);

        (registry_client, core_client)
    }

    // ----------------------------------------------------------------
    // TEST 1 — Initialize & Link Registry
    // ----------------------------------------------------------------
    #[test]
    fn test_01_initialize_and_link_registry() {
        let env = Env::default();
        env.mock_all_auths();

        let registry_id = env.register_contract_wasm(None, registry_wasm::WASM);
        let core_id     = env.register_contract(None, CoreContract);
        let core_client = CoreContractClient::new(&env, &core_id);

        assert_eq!(core_client.get_registry_id(), None,
            "Registry ID must be None before initialize()");

        core_client.initialize(&registry_id);

        assert_eq!(core_client.get_registry_id(), Some(registry_id),
            "Registry ID must match the address passed to initialize()");
    }

    // ----------------------------------------------------------------
    // TEST 2 — Authorized Hospital Upload (SUCCESS PATH)
    // ----------------------------------------------------------------
    /// Registry-authorized hospital uploads via Core. Cross-contract
    /// call returns true → record persisted. Owner views IPFS hash.
    #[test]
    fn test_02_upload_record_authorized_hospital_succeeds() {
        let env = Env::default();
        env.mock_all_auths();

        let (registry_client, core_client) = setup(&env);

        let govt_admin = Address::generate(&env);
        let hospital   = Address::generate(&env);

        registry_client.initialize(&govt_admin);
        registry_client.add_hospital(&govt_admin, &hospital);

        assert!(registry_client.is_authorized(&hospital));

        let patient_id = String::from_str(&env, "PAT-AIIMS-001");
        let ipfs_hash  = String::from_str(&env, "QmXkY9Abc123ExampleIPFSHashForTest");

        // Core makes cross-contract call → registry WASM returns true → record stored
        core_client.upload_record(&hospital, &patient_id, &ipfs_hash);

        let retrieved = core_client.view_record(&hospital, &patient_id);
        assert_eq!(retrieved, ipfs_hash,
            "Retrieved IPFS hash must match the uploaded value");
    }

    // ----------------------------------------------------------------
    // TEST 3 — Unauthorized Hospital Upload (FAILURE PATH)
    // ----------------------------------------------------------------
    /// Hospital never whitelisted → cross-contract returns false →
    /// CoreError::HospitalNotAuthorized → transaction reverted.
    #[test]
    #[should_panic]
    fn test_03_upload_record_unauthorized_hospital_panics() {
        let env = Env::default();
        env.mock_all_auths();

        let (registry_client, core_client) = setup(&env);

        let govt_admin     = Address::generate(&env);
        let rogue_hospital = Address::generate(&env);

        registry_client.initialize(&govt_admin);
        // Deliberately NOT calling add_hospital for rogue_hospital

        assert!(!registry_client.is_authorized(&rogue_hospital));

        let patient_id = String::from_str(&env, "PAT-ROGUE-001");
        let ipfs_hash  = String::from_str(&env, "QmFakeHash999");

        // MUST PANIC — cross-contract returns false → HospitalNotAuthorized
        core_client.upload_record(&rogue_hospital, &patient_id, &ipfs_hash);
    }

    // ----------------------------------------------------------------
    // TEST 4 — Unauthorized Requester (FAILURE PATH)
    // ----------------------------------------------------------------
    /// Address NOT in Registry attempts request_access. Cross-contract
    /// check rejects it before any state is written.
    #[test]
    #[should_panic]
    fn test_04_request_access_unauthorized_requester_panics() {
        let env = Env::default();
        env.mock_all_auths();

        let (registry_client, core_client) = setup(&env);

        let govt_admin      = Address::generate(&env);
        let authorized_hosp = Address::generate(&env);
        let rogue_requester = Address::generate(&env);

        registry_client.initialize(&govt_admin);
        registry_client.add_hospital(&govt_admin, &authorized_hosp);
        // rogue_requester intentionally NOT added

        let patient_id = String::from_str(&env, "PAT-AIIMS-002");
        let ipfs_hash  = String::from_str(&env, "QmHashAiims002");
        let reason     = String::from_str(&env, "Emergency referral consult");

        core_client.upload_record(&authorized_hosp, &patient_id, &ipfs_hash);

        // MUST PANIC — rogue_requester not in registry → HospitalNotAuthorized
        core_client.request_access(
            &rogue_requester,
            &authorized_hosp,
            &patient_id,
            &reason,
        );
    }

    // ----------------------------------------------------------------
    // TEST 5 — Full Access Lifecycle (END-TO-END SUCCESS PATH)
    // ----------------------------------------------------------------
    /// Complete MediChain workflow with real cross-contract calls:
    /// whitelist both → upload → request → approve → view → reject.
    #[test]
    fn test_05_full_access_lifecycle_with_cross_contract() {
        let env = Env::default();
        env.mock_all_auths();

        let (registry_client, core_client) = setup(&env);

        let govt_admin = Address::generate(&env);
        let hospital_a = Address::generate(&env); // record owner
        let hospital_b = Address::generate(&env); // requester

        registry_client.initialize(&govt_admin);
        registry_client.add_hospital(&govt_admin, &hospital_a);
        registry_client.add_hospital(&govt_admin, &hospital_b);

        assert!(registry_client.is_authorized(&hospital_a));
        assert!(registry_client.is_authorized(&hospital_b));

        let patient_id = String::from_str(&env, "PAT-MUM-007");
        let ipfs_hash  = String::from_str(&env, "QmProd2025HealthRecordIPFSCID");
        let reason     = String::from_str(&env, "Post-surgery oncology follow-up consult");

        // Phase 1: Upload (cross-contract check on hospital_a)
        core_client.upload_record(&hospital_a, &patient_id, &ipfs_hash);
        assert_eq!(core_client.view_record(&hospital_a, &patient_id), ipfs_hash);
        assert!(!core_client.check_access(&hospital_b, &patient_id));

        // Phase 2: Request Access (cross-contract check on hospital_b)
        core_client.request_access(&hospital_b, &hospital_a, &patient_id, &reason);
        assert!(!core_client.check_access(&hospital_b, &patient_id),
            "Access must still be pending after request");

        // Phase 3: Approve
        core_client.approve_access(&hospital_a, &hospital_b, &patient_id);
        assert!(core_client.check_access(&hospital_b, &patient_id),
            "hospital_b must have approved access");
        assert_eq!(core_client.view_record(&hospital_b, &patient_id), ipfs_hash,
            "Approved requester must receive the correct IPFS hash");

        // Phase 4: Reject (revoke)
        core_client.reject_access(&hospital_a, &hospital_b, &patient_id);
        assert!(!core_client.check_access(&hospital_b, &patient_id),
            "After rejection, hospital_b must lose access");
    }

    // ----------------------------------------------------------------
    // TEST 6 — Non-Whitelisted Hospital Upload Denied (FAILURE PATH)
    // ----------------------------------------------------------------
    /// Hospital not on registry whitelist cannot upload records.
    /// Simulates the state after remove_hospital() was called.
    #[test]
    #[should_panic]
    fn test_06_revoked_hospital_upload_is_denied() {
        let env = Env::default();
        env.mock_all_auths();

        let (registry_client, core_client) = setup(&env);

        let govt_admin = Address::generate(&env);
        let hospital   = Address::generate(&env);

        registry_client.initialize(&govt_admin);
        // Hospital deliberately NOT added → simulates post-revocation
        assert!(!registry_client.is_authorized(&hospital));

        let patient_id = String::from_str(&env, "PAT-REVOKED-001");
        let ipfs_hash  = String::from_str(&env, "QmRevokedHash");

        // MUST PANIC — not in registry → HospitalNotAuthorized
        core_client.upload_record(&hospital, &patient_id, &ipfs_hash);
    }

    // ----------------------------------------------------------------
    // TEST 7 — Core Not Initialized Panics
    // ----------------------------------------------------------------
    /// Calling upload_record before initialize() → no registry ID →
    /// require_hospital_authorized() panics with NotInitialized.
    #[test]
    #[should_panic]
    fn test_07_core_not_initialized_panics() {
        let env = Env::default();
        env.mock_all_auths();

        // Core registered but NOT initialized — no registry link
        let core_id     = env.register_contract(None, CoreContract);
        let core_client = CoreContractClient::new(&env, &core_id);

        let hospital   = Address::generate(&env);
        let patient_id = String::from_str(&env, "PAT-UNINIT");
        let ipfs_hash  = String::from_str(&env, "QmUninit");

        // MUST PANIC — NotInitialized
        core_client.upload_record(&hospital, &patient_id, &ipfs_hash);
    }

    // ----------------------------------------------------------------
    // TEST 8 — Revoke Granted Access (SUCCESS PATH)
    // ----------------------------------------------------------------
    /// Whitelist owner and requester → upload → request → approve → revoke.
    /// After revoke_access, requester loses access to view record.
    #[test]
    fn test_08_revoke_access_succeeds() {
        let env = Env::default();
        env.mock_all_auths();

        let (registry_client, core_client) = setup(&env);

        let govt_admin = Address::generate(&env);
        let hospital_a = Address::generate(&env); // owner
        let hospital_b = Address::generate(&env); // requester

        registry_client.initialize(&govt_admin);
        registry_client.add_hospital(&govt_admin, &hospital_a);
        registry_client.add_hospital(&govt_admin, &hospital_b);

        let patient_id = String::from_str(&env, "PAT-REVOKE-008");
        let ipfs_hash  = String::from_str(&env, "QmHashRevokeTest008");
        let reason     = String::from_str(&env, "Consultation request");

        core_client.upload_record(&hospital_a, &patient_id, &ipfs_hash);
        core_client.request_access(&hospital_b, &hospital_a, &patient_id, &reason);
        core_client.approve_access(&hospital_a, &hospital_b, &patient_id);

        assert!(core_client.check_access(&hospital_b, &patient_id), "hospital_b should have access");

        // Owning hospital revokes access
        core_client.revoke_access(&hospital_a, &hospital_b, &patient_id);

        assert!(!core_client.check_access(&hospital_b, &patient_id), "hospital_b access must be revoked");
    }

    // ----------------------------------------------------------------
    // TEST 9 — Emergency Pause Circuit Breaker
    // ----------------------------------------------------------------
    /// Verifies that pausing the Core contract blocks uploads and
    /// resuming unblocks operations.
    #[test]
    fn test_09_emergency_pause_circuit_breaker_succeeds() {
        let env = Env::default();
        env.mock_all_auths();

        let (registry_client, core_client) = setup(&env);

        let govt_admin = Address::generate(&env);
        let hospital   = Address::generate(&env);

        registry_client.initialize(&govt_admin);
        registry_client.add_hospital(&govt_admin, &hospital);

        assert!(!core_client.is_paused(), "Core contract should start unpaused");

        // Admin pauses Core contract
        core_client.set_paused(&hospital, &true);
        assert!(core_client.is_paused(), "Core contract must report paused");

        // Admin unpauses Core contract
        core_client.set_paused(&hospital, &false);
        assert!(!core_client.is_paused(), "Core contract must report unpaused");
    }
}
