// ================================================================
// MediChain — CORE LOGIC CONTRACT
// ================================================================
// Purpose : Handles medical record hashes (IPFS CIDs) and
//           inter-hospital access requests.
//
// CRITICAL: Before executing `upload_record` or `request_access`,
//           this contract makes a CROSS-CONTRACT CALL to the
//           Registry Contract to verify hospital authorization.
//           Unauthorized callers are rejected before any state
//           changes occur.
//
// Cross-Contract Flow:
//   upload_record(hospital, ...)
//     └─► registry.is_authorized(hospital)
//           ├─ true  → proceed, persist record
//           └─ false → panic(HospitalNotAuthorized)
//
//   request_access(requester, ...)
//     └─► registry.is_authorized(requester)
//           ├─ true  → proceed, persist request
//           └─ false → panic(HospitalNotAuthorized)
//
// Functions:
//   initialize(registry_contract_id)
//   upload_record(hospital, patient_id, ipfs_hash)
//   request_access(requester, target_hospital, patient_id, reason)
//   approve_access(target_hospital, requester, patient_id)
//   reject_access(target_hospital, requester, patient_id)
//   view_record(viewer, patient_id) -> String
//   check_access(requester, patient_id) -> bool
//   get_registry_id() -> Option<Address>
// ================================================================
#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    symbol_short, Address, BytesN, Env, String, panic_with_error,
};

// ----------------------------------------------------------------
// CROSS-CONTRACT CALL: Registry Interface
// ----------------------------------------------------------------
// We define the subset of the Registry contract's interface that
// the Core contract needs. The `contractclient!` macro generates a
// typed client (`RegistryClient`) that serializes calls to the
// deployed Registry contract via XDR, executing them atomically
// within the same ledger transaction.
//
// This is the canonical Soroban SDK 21 cross-contract pattern —
// no WASM file is required at compile time.
// ----------------------------------------------------------------

/// Minimal interface of the Registry contract exposed to Core.
/// Only the `is_authorized` read-only function is needed.
#[soroban_sdk::contractclient(name = "RegistryClient")]
pub trait RegistryInterface {
    /// Returns true if the given hospital address is on the
    /// government-approved whitelist.
    fn is_authorized(env: Env, hospital: Address) -> bool;
}

// ----------------------------------------------------------------
// ERROR CODES
// ----------------------------------------------------------------
#[contracterror]
#[derive(Clone, Copy, Debug, PartialEq)]
#[repr(u32)]
pub enum CoreError {
    /// Contract has not been initialized yet
    NotInitialized        = 1,
    /// Contract has already been initialized
    AlreadyInitialized    = 2,
    /// Hospital is not on the Registry whitelist
    HospitalNotAuthorized = 3,
    /// Patient record does not exist on-chain
    RecordNotFound        = 4,
    /// Caller lacks permission for this action
    Unauthorized          = 5,
    /// The referenced access request does not exist
    RequestNotFound       = 6,
}

// ----------------------------------------------------------------
// DATA TYPES
// ----------------------------------------------------------------

/// On-chain patient record — stores ONLY the IPFS CID/hash.
/// No actual PHI is ever written to the chain.
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct RecordMeta {
    pub patient_id:       String,
    pub ipfs_hash:        String,
    pub owning_hospital:  Address,
    pub created_at:       u64,
}

/// Status of an inter-hospital access request
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum AccessStatus {
    Pending,
    Approved,
    Rejected,
}

/// Inter-hospital data exchange request stored on-chain
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct AccessRequest {
    pub requesting_hospital: Address,
    pub target_hospital:     Address,
    pub patient_id:          String,
    pub reason:              String,
    pub status:              AccessStatus,
    pub requested_at:        u64,
    pub updated_at:          u64,
}

// ----------------------------------------------------------------
// STORAGE KEYS
// ----------------------------------------------------------------
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    /// Address of the Registry contract (instance storage)
    RegistryId,
    /// Record metadata keyed by patient_id
    Record(String),
    /// Access request keyed by (requesting_hospital, patient_id)
    AccessReq(Address, String),
    /// Approved access grant bit keyed by (requester, patient_id)
    AccessGrant(Address, String),
}

// ----------------------------------------------------------------
// INTERNAL HELPER: cross-contract authorization check
// ----------------------------------------------------------------
/// Calls the deployed Registry contract and panics with
/// `CoreError::HospitalNotAuthorized` if the hospital is not
/// on the whitelist. Panics with `CoreError::NotInitialized` if
/// the registry ID has not been set via `initialize()`.
fn require_hospital_authorized(env: &Env, hospital: &Address) {
    // Retrieve the stored Registry contract address
    let registry_id = env
        .storage()
        .instance()
        .get::<DataKey, Address>(&DataKey::RegistryId)
        .unwrap_or_else(|| panic_with_error!(env, CoreError::NotInitialized));

    // Make the cross-contract call via the generated RegistryClient
    let registry_client = RegistryClient::new(env, &registry_id);
    let is_auth: bool = registry_client.is_authorized(hospital);

    if !is_auth {
        panic_with_error!(env, CoreError::HospitalNotAuthorized);
    }
}

// ----------------------------------------------------------------
// CONTRACT
// ----------------------------------------------------------------
#[contract]
pub struct CoreContract;

#[contractimpl]
impl CoreContract {

    // ------------------------------------------------------------
    // 1. INITIALIZE
    // ------------------------------------------------------------
    /// Stores the Registry contract address so this contract knows
    /// where to make cross-contract authorization calls.
    /// **Can only be called once.**
    ///
    /// # Parameters
    /// - `registry_id` — The deployed Registry contract's Address.
    pub fn initialize(env: Env, registry_id: Address) {
        if env.storage().instance().has(&DataKey::RegistryId) {
            panic_with_error!(&env, CoreError::AlreadyInitialized);
        }

        env.storage()
            .instance()
            .set(&DataKey::RegistryId, &registry_id);

        env.events().publish(
            (symbol_short!("core_init"), registry_id),
            symbol_short!("ok"),
        );
    }

    // ------------------------------------------------------------
    // 2. UPLOAD RECORD  ← REQUIRES CROSS-CONTRACT REGISTRY CHECK
    // ------------------------------------------------------------
    /// Uploads a patient record IPFS hash to the blockchain.
    ///
    /// **CRITICAL**: Before persisting any state, this function
    /// makes a cross-contract call to the Registry contract to
    /// verify `hospital` is on the whitelist. If not, the entire
    /// transaction is reverted with `HospitalNotAuthorized`.
    ///
    /// # Authorization
    /// `hospital.require_auth()` — the hospital wallet must sign.
    pub fn upload_record(
        env: Env,
        hospital: Address,
        patient_id: String,
        ipfs_hash: String,
    ) {
        // 1. Require wallet signature from the hospital
        hospital.require_auth();

        // 2. CROSS-CONTRACT CALL: verify hospital is Registry-authorized
        require_hospital_authorized(&env, &hospital);

        // 3. Build and persist the record
        let record = RecordMeta {
            patient_id:      patient_id.clone(),
            ipfs_hash:       ipfs_hash.clone(),
            owning_hospital: hospital.clone(),
            created_at:      env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Record(patient_id.clone()), &record);

        env.events().publish(
            (symbol_short!("upload"), hospital),
            patient_id,
        );
    }

    // ------------------------------------------------------------
    // 3. REQUEST ACCESS  ← REQUIRES CROSS-CONTRACT REGISTRY CHECK
    // ------------------------------------------------------------
    /// A hospital requests access to a patient record owned by
    /// another hospital.
    ///
    /// **CRITICAL**: The requesting hospital's authorization is
    /// verified via cross-contract call to the Registry before the
    /// request is stored. Unauthorized hospitals cannot spam the
    /// request queue.
    ///
    /// # Authorization
    /// `requester.require_auth()` — requester must sign.
    pub fn request_access(
        env: Env,
        requester: Address,
        target_hospital: Address,
        patient_id: String,
        reason: String,
    ) {
        // 1. Require wallet signature
        requester.require_auth();

        // 2. CROSS-CONTRACT CALL: verify requester is Registry-authorized
        require_hospital_authorized(&env, &requester);

        // 3. Persist the access request
        let req = AccessRequest {
            requesting_hospital: requester.clone(),
            target_hospital,
            patient_id: patient_id.clone(),
            reason,
            status:       AccessStatus::Pending,
            requested_at: env.ledger().timestamp(),
            updated_at:   env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::AccessReq(requester.clone(), patient_id.clone()), &req);

        env.events().publish(
            (symbol_short!("req_acc"), requester),
            patient_id,
        );
    }

    // ------------------------------------------------------------
    // 4. APPROVE ACCESS
    // ------------------------------------------------------------
    /// The owning hospital approves a pending access request.
    /// Sets the explicit grant bit so the requester can call
    /// `view_record`.
    ///
    /// # Authorization
    /// `target_hospital.require_auth()` — owner must sign.
    pub fn approve_access(
        env: Env,
        target_hospital: Address,
        requester: Address,
        patient_id: String,
    ) {
        target_hospital.require_auth();

        // Verify target_hospital actually owns the record
        let record = env
            .storage()
            .persistent()
            .get::<DataKey, RecordMeta>(&DataKey::Record(patient_id.clone()))
            .unwrap_or_else(|| panic_with_error!(&env, CoreError::RecordNotFound));

        if record.owning_hospital != target_hospital {
            panic_with_error!(&env, CoreError::Unauthorized);
        }

        // Update request status → Approved
        let req_key = DataKey::AccessReq(requester.clone(), patient_id.clone());
        if let Some(mut req) = env
            .storage()
            .persistent()
            .get::<DataKey, AccessRequest>(&req_key)
        {
            req.status     = AccessStatus::Approved;
            req.updated_at = env.ledger().timestamp();
            env.storage().persistent().set(&req_key, &req);
        }

        // Persist explicit access grant
        env.storage()
            .persistent()
            .set(&DataKey::AccessGrant(requester.clone(), patient_id.clone()), &true);

        env.events().publish(
            (symbol_short!("appr_acc"), target_hospital),
            requester,
        );
    }

    // ------------------------------------------------------------
    // 5. REJECT ACCESS
    // ------------------------------------------------------------
    /// The owning hospital rejects a pending access request and
    /// clears any previously granted access.
    ///
    /// # Authorization
    /// `target_hospital.require_auth()` — owner must sign.
    pub fn reject_access(
        env: Env,
        target_hospital: Address,
        requester: Address,
        patient_id: String,
    ) {
        target_hospital.require_auth();

        let req_key = DataKey::AccessReq(requester.clone(), patient_id.clone());
        if let Some(mut req) = env
            .storage()
            .persistent()
            .get::<DataKey, AccessRequest>(&req_key)
        {
            req.status     = AccessStatus::Rejected;
            req.updated_at = env.ledger().timestamp();
            env.storage().persistent().set(&req_key, &req);
        }

        // Revoke any existing grant bit
        env.storage()
            .persistent()
            .remove(&DataKey::AccessGrant(requester, patient_id));

        env.events().publish(
            (symbol_short!("rej_acc"), target_hospital),
            symbol_short!("rejected"),
        );
    }

    // ------------------------------------------------------------
    // 5b. REVOKE ACCESS
    // ------------------------------------------------------------
    /// The owning hospital explicitly revokes previously granted
    /// access from a requesting hospital for a patient record.
    ///
    /// # Authorization
    /// `target_hospital.require_auth()` — owner must sign.
    pub fn revoke_access(
        env: Env,
        target_hospital: Address,
        requester: Address,
        patient_id: String,
    ) {
        target_hospital.require_auth();

        // 1. Verify target_hospital actually owns the record
        let record = env
            .storage()
            .persistent()
            .get::<DataKey, RecordMeta>(&DataKey::Record(patient_id.clone()))
            .unwrap_or_else(|| panic_with_error!(&env, CoreError::RecordNotFound));

        if record.owning_hospital != target_hospital {
            panic_with_error!(&env, CoreError::Unauthorized);
        }

        // 2. Update request status to Rejected if request exists
        let req_key = DataKey::AccessReq(requester.clone(), patient_id.clone());
        if let Some(mut req) = env
            .storage()
            .persistent()
            .get::<DataKey, AccessRequest>(&req_key)
        {
            req.status     = AccessStatus::Rejected;
            req.updated_at = env.ledger().timestamp();
            env.storage().persistent().set(&req_key, &req);
        }

        // 3. Remove explicit access grant bit
        env.storage()
            .persistent()
            .remove(&DataKey::AccessGrant(requester.clone(), patient_id.clone()));

        env.events().publish(
            (symbol_short!("rev_acc"), target_hospital),
            (requester, patient_id),
        );
    }

    // ------------------------------------------------------------
    // 6. VIEW RECORD  (read-only, access-controlled)
    // ------------------------------------------------------------
    /// Returns the IPFS hash for a patient record.
    /// Caller must be the record owner OR have an approved grant.
    ///
    /// # Authorization
    /// `viewer.require_auth()` — viewer must sign.
    pub fn view_record(env: Env, viewer: Address, patient_id: String) -> String {
        viewer.require_auth();

        let record = env
            .storage()
            .persistent()
            .get::<DataKey, RecordMeta>(&DataKey::Record(patient_id.clone()))
            .unwrap_or_else(|| panic_with_error!(&env, CoreError::RecordNotFound));

        let is_owner = record.owning_hospital == viewer;
        let is_granted = env
            .storage()
            .persistent()
            .get::<DataKey, bool>(&DataKey::AccessGrant(viewer.clone(), patient_id))
            .unwrap_or(false);

        if !is_owner && !is_granted {
            panic_with_error!(&env, CoreError::Unauthorized);
        }

        record.ipfs_hash
    }

    // ------------------------------------------------------------
    // READ HELPERS
    // ------------------------------------------------------------

    /// Returns `true` if the requester has an approved access grant
    /// for the given patient record.
    pub fn check_access(env: Env, requester: Address, patient_id: String) -> bool {
        env.storage()
            .persistent()
            .get::<DataKey, bool>(&DataKey::AccessGrant(requester, patient_id))
            .unwrap_or(false)
    }

    /// Returns the stored Registry contract address.
    pub fn get_registry_id(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::RegistryId)
    }

    // ------------------------------------------------------------
    // CONTRACT UPGRADE (Admin Only)
    // ------------------------------------------------------------
    /// Upgrades the Core contract WASM bytecode.
    /// Admin signature required.
    pub fn upgrade(env: Env, admin: Address, new_wasm_hash: BytesN<32>) {
        admin.require_auth();

        // Verify caller is authorized admin via Registry cross-contract call
        require_hospital_authorized(&env, &admin);

        env.deployer().update_current_contract_wasm(new_wasm_hash);

        env.events().publish(
            (symbol_short!("upgraded"), admin),
            symbol_short!("core"),
        );
    }
}

// ----------------------------------------------------------------
// TESTS
// ----------------------------------------------------------------
mod test;

