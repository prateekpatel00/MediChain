#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short,
    Address, Env, String, panic_with_error,
};

// ============================================================
// ERROR CODES
// ============================================================
#[contracterror]
#[derive(Clone, Copy, Debug, PartialEq)]
#[repr(u32)]
pub enum MediChainError {
    NotInitialized         = 1,
    AlreadyInitialized      = 2,
    HospitalNotAuthorized  = 3,
    RecordNotFound         = 4,
    Unauthorized           = 5,
    RequestNotFound        = 6,
}

// ============================================================
// STORAGE DATA TYPES
// ============================================================

/// On-chain patient record metadata – stores ONLY the IPFS CID/Hash
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct RecordMeta {
    pub patient_id: String,
    pub ipfs_hash: String,
    pub owning_hospital: Address,
    pub created_at: u64,
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
    pub target_hospital: Address,
    pub patient_id: String,
    pub reason: String,
    pub status: AccessStatus,
    pub requested_at: u64,
    pub updated_at: u64,
}

// ============================================================
// STORAGE KEYS
// ============================================================
#[contracttype]
pub enum DataKey {
    /// Super Admin (Govt of India) address
    GovtAdmin,
    /// Authorized hospital bit keyed by hospital Address
    HospitalAuth(Address),
    /// Record metadata keyed by patient_id String
    Record(String),
    /// Access request keyed by (requesting_hospital, patient_id)
    AccessReq(Address, String),
    /// Explicit grant bit keyed by (requesting_hospital, patient_id)
    AccessGrant(Address, String),
}

// ============================================================
// CONTRACT IMPLEMENTATION
// ============================================================
#[contract]
pub struct MediChainContract;

#[contractimpl]
impl MediChainContract {

    // ----------------------------------------------------------
    // 1. INITIALIZE CONTRACT (Sets Govt Admin)
    // ----------------------------------------------------------
    /// Sets the Super Admin (Government of India authority address).
    /// Can only be called once.
    pub fn initialize(env: Env, govt_admin: Address) {
        let admin_key = DataKey::GovtAdmin;
        if env.storage().instance().has(&admin_key) {
            panic_with_error!(&env, MediChainError::AlreadyInitialized);
        }

        govt_admin.require_auth();
        env.storage().instance().set(&admin_key, &govt_admin);

        env.events().publish(
            (symbol_short!("init"), govt_admin),
            symbol_short!("success"),
        );
    }

    // ----------------------------------------------------------
    // 2. GRANT HOSPITAL RIGHTS (Govt Only)
    // ----------------------------------------------------------
    /// Government Super Admin authorizes a hospital wallet to publish/upload records.
    /// Requires govt_admin signature.
    pub fn grant_hospital_rights(env: Env, govt_admin: Address, hospital: Address) {
        govt_admin.require_auth();

        // Verify govt_admin matches stored admin (or if uninitialized, set it)
        let admin_key = DataKey::GovtAdmin;
        if let Some(stored_admin) = env.storage().instance().get::<DataKey, Address>(&admin_key) {
            if stored_admin != govt_admin {
                panic_with_error!(&env, MediChainError::Unauthorized);
            }
        } else {
            // Self-initialize if first call
            env.storage().instance().set(&admin_key, &govt_admin);
        }

        let auth_key = DataKey::HospitalAuth(hospital.clone());
        env.storage().persistent().set(&auth_key, &true);

        env.events().publish(
            (symbol_short!("grant_hsp"), govt_admin),
            hospital,
        );
    }

    // ----------------------------------------------------------
    // 3. UPLOAD RECORD (Govt-Authorized Hospitals Only)
    // ----------------------------------------------------------
    /// Uploads record IPFS hash to the blockchain.
    /// MUST FAIL with HospitalNotAuthorized if the hospital was not authorized by Govt.
    pub fn upload_record(
        env: Env,
        hospital: Address,
        patient_id: String,
        ipfs_hash: String,
    ) {
        hospital.require_auth();

        // Enforce 3-Tier RBAC: Hospital MUST be authorized by Govt Admin
        let auth_key = DataKey::HospitalAuth(hospital.clone());
        let is_auth = env
            .storage()
            .persistent()
            .get::<DataKey, bool>(&auth_key)
            .unwrap_or(false);

        if !is_auth {
            panic_with_error!(&env, MediChainError::HospitalNotAuthorized);
        }

        let record_key = DataKey::Record(patient_id.clone());
        let record = RecordMeta {
            patient_id: patient_id.clone(),
            ipfs_hash: ipfs_hash.clone(),
            owning_hospital: hospital.clone(),
            created_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&record_key, &record);

        env.events().publish(
            (symbol_short!("upload"), hospital),
            patient_id,
        );
    }

    // ----------------------------------------------------------
    // 4. REQUEST ACCESS
    // ----------------------------------------------------------
    /// A hospital requests access to a patient record owned by another hospital.
    pub fn request_access(
        env: Env,
        requester: Address,
        target_hospital: Address,
        patient_id: String,
        reason: String,
    ) {
        requester.require_auth();

        let req_key = DataKey::AccessReq(requester.clone(), patient_id.clone());
        let req = AccessRequest {
            requesting_hospital: requester.clone(),
            target_hospital,
            patient_id: patient_id.clone(),
            reason,
            status: AccessStatus::Pending,
            requested_at: env.ledger().timestamp(),
            updated_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&req_key, &req);

        env.events().publish(
            (symbol_short!("req_acc"), requester),
            patient_id,
        );
    }

    // ----------------------------------------------------------
    // 5. APPROVE ACCESS
    // ----------------------------------------------------------
    /// Owning hospital approves an access request.
    pub fn approve_access(
        env: Env,
        target_hospital: Address,
        requester: Address,
        patient_id: String,
    ) {
        target_hospital.require_auth();

        // Verify target_hospital owns the record
        let record_key = DataKey::Record(patient_id.clone());
        let record = env
            .storage()
            .persistent()
            .get::<DataKey, RecordMeta>(&record_key)
            .unwrap_or_else(|| panic_with_error!(&env, MediChainError::RecordNotFound));

        if record.owning_hospital != target_hospital {
            panic_with_error!(&env, MediChainError::Unauthorized);
        }

        // Update AccessRequest state → Approved
        let req_key = DataKey::AccessReq(requester.clone(), patient_id.clone());
        if let Some(mut req) = env.storage().persistent().get::<DataKey, AccessRequest>(&req_key) {
            req.status = AccessStatus::Approved;
            req.updated_at = env.ledger().timestamp();
            env.storage().persistent().set(&req_key, &req);
        }

        // Set explicit grant bit
        let grant_key = DataKey::AccessGrant(requester.clone(), patient_id.clone());
        env.storage().persistent().set(&grant_key, &true);

        env.events().publish(
            (symbol_short!("appr_acc"), target_hospital),
            requester,
        );
    }

    // ----------------------------------------------------------
    // 6. REJECT ACCESS
    // ----------------------------------------------------------
    /// Owning hospital rejects an access request.
    pub fn reject_access(
        env: Env,
        target_hospital: Address,
        requester: Address,
        patient_id: String,
    ) {
        target_hospital.require_auth();

        let req_key = DataKey::AccessReq(requester.clone(), patient_id.clone());
        if let Some(mut req) = env.storage().persistent().get::<DataKey, AccessRequest>(&req_key) {
            req.status = AccessStatus::Rejected;
            req.updated_at = env.ledger().timestamp();
            env.storage().persistent().set(&req_key, &req);
        }

        // Revoke grant bit if any
        let grant_key = DataKey::AccessGrant(requester, patient_id);
        env.storage().persistent().remove(&grant_key);

        env.events().publish(
            (symbol_short!("rej_acc"), target_hospital),
            symbol_short!("rejected"),
        );
    }

    // ----------------------------------------------------------
    // 7. VIEW RECORD (Returns IPFS Hash iff Authorized)
    // ----------------------------------------------------------
    /// Returns the IPFS hash for a record.
    /// Caller must be owner OR have an Approved access grant. Panics if unauthorized.
    pub fn view_record(env: Env, viewer: Address, patient_id: String) -> String {
        viewer.require_auth();

        let record_key = DataKey::Record(patient_id.clone());
        let record = env
            .storage()
            .persistent()
            .get::<DataKey, RecordMeta>(&record_key)
            .unwrap_or_else(|| panic_with_error!(&env, MediChainError::RecordNotFound));

        let is_owner = record.owning_hospital == viewer;
        let grant_key = DataKey::AccessGrant(viewer.clone(), patient_id.clone());
        let is_granted = env
            .storage()
            .persistent()
            .get::<DataKey, bool>(&grant_key)
            .unwrap_or(false);

        if !is_owner && !is_granted {
            panic_with_error!(&env, MediChainError::Unauthorized);
        }

        record.ipfs_hash
    }

    // ----------------------------------------------------------
    // READ HELPERS
    // ----------------------------------------------------------

    /// Checks if a hospital has been granted rights by Govt
    pub fn is_hospital_authorized(env: Env, hospital: Address) -> bool {
        let key = DataKey::HospitalAuth(hospital);
        env.storage().persistent().get::<DataKey, bool>(&key).unwrap_or(false)
    }

    /// Gets stored Govt Admin address
    pub fn get_govt_admin(env: Env) -> Option<Address> {
        let key = DataKey::GovtAdmin;
        env.storage().instance().get(&key)
    }

    /// Checks if a requester has access to a patient record
    pub fn check_access(env: Env, requester: Address, patient_id: String) -> bool {
        let grant_key = DataKey::AccessGrant(requester, patient_id);
        env.storage().persistent().get::<DataKey, bool>(&grant_key).unwrap_or(false)
    }
}

mod test;
