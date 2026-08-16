// ================================================================
// MediChain — REGISTRY CONTRACT (Strict RBAC Boundary)
// ================================================================
// Purpose : Manages the whitelist of authorized hospitals.
//           Acts as the single source of truth for hospital
//           authorization. All authorization checks by the Core
//           contract are delegated here via cross-contract call.
//
// Functions:
//   initialize(admin)                  → One-time setup; sets the
//                                        super-admin (Govt Authority).
//   add_hospital(admin, hospital_addr) → Admin-only; adds a hospital
//                                        address to the whitelist.
//   remove_hospital(admin, hospital)   → Admin-only; revokes rights.
//   is_authorized(hospital_addr)       → Read-only; returns bool.
//   get_admin()                        → Read-only; returns admin addr.
// ================================================================
#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    symbol_short, Address, BytesN, Env, panic_with_error,
};

// ----------------------------------------------------------------
// ERROR CODES
// ----------------------------------------------------------------
#[contracterror]
#[derive(Clone, Copy, Debug, PartialEq)]
#[repr(u32)]
pub enum RegistryError {
    /// Contract has not been initialized yet
    NotInitialized      = 1,
    /// Contract has already been initialized (idempotency guard)
    AlreadyInitialized  = 2,
    /// Caller is not the registered super-admin
    Unauthorized        = 3,
    /// Hospital address is already on the whitelist
    AlreadyAuthorized   = 4,
}

// ----------------------------------------------------------------
// STORAGE KEYS
// ----------------------------------------------------------------
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    /// Stores the super-admin (Govt Authority) Address — instance storage
    Admin,
    /// Stores the authorization flag for each hospital — persistent storage
    HospitalAuth(Address),
    /// Stores the total count of registered active hospitals — instance storage
    TotalHospitals,
}

// ----------------------------------------------------------------
// CONTRACT
// ----------------------------------------------------------------
#[contract]
pub struct RegistryContract;

#[contractimpl]
impl RegistryContract {

    // ------------------------------------------------------------
    // 1. INITIALIZE
    // ------------------------------------------------------------
    /// Sets the Government Super-Admin owner address.
    /// Can only be called once during deployment.
    pub fn initialize(env: Env, admin: Address) {
        // Idempotency guard — prevent re-initialization
        if env.storage().instance().has(&DataKey::Admin) {
            panic_with_error!(&env, RegistryError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);

        env.events().publish(
            (symbol_short!("reg_init"), admin),
            symbol_short!("ok"),
        );
    }

    // ------------------------------------------------------------
    // 2. ADD HOSPITAL (Strict Super-Admin RBAC)
    // ------------------------------------------------------------
    /// Adds a hospital address to the authorization whitelist.
    /// Only the registered super-admin can call this.
    ///
    /// # Authorization
    /// `admin.require_auth()` — the super-admin wallet MUST sign this transaction.
    ///
    /// # Errors
    /// - `NotInitialized` if `initialize()` has not been called yet.
    /// - `Unauthorized`   if `admin` does not match the stored super-admin.
    pub fn add_hospital(env: Env, admin: Address, hospital: Address) {
        // Require super-admin wallet signature first
        admin.require_auth();

        // Verify the caller IS the stored super-admin
        let stored_admin = env
            .storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, RegistryError::NotInitialized));

        if stored_admin != admin {
            panic_with_error!(&env, RegistryError::Unauthorized);
        }

        let is_already: bool = env
            .storage()
            .persistent()
            .get::<DataKey, bool>(&DataKey::HospitalAuth(hospital.clone()))
            .unwrap_or(false);

        // Persist the authorization flag in persistent storage
        env.storage()
            .persistent()
            .set(&DataKey::HospitalAuth(hospital.clone()), &true);

        if !is_already {
            let count: u32 = env
                .storage()
                .instance()
                .get::<DataKey, u32>(&DataKey::TotalHospitals)
                .unwrap_or(0);
            env.storage()
                .instance()
                .set(&DataKey::TotalHospitals, &(count + 1));
        }

        env.events().publish(
            (symbol_short!("hosp_add"), admin),
            hospital,
        );
    }

    // ------------------------------------------------------------
    // 3. REMOVE HOSPITAL
    // ------------------------------------------------------------
    /// Revokes a hospital's authorization from the whitelist.
    /// Only the registered super-admin can call this.
    ///
    /// # Authorization
    /// `admin.require_auth()` — super-admin must sign.
    pub fn remove_hospital(env: Env, admin: Address, hospital: Address) {
        admin.require_auth();

        let stored_admin = env
            .storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, RegistryError::NotInitialized));

        if stored_admin != admin {
            panic_with_error!(&env, RegistryError::Unauthorized);
        }

        let was_authorized: bool = env
            .storage()
            .persistent()
            .get::<DataKey, bool>(&DataKey::HospitalAuth(hospital.clone()))
            .unwrap_or(false);

        env.storage()
            .persistent()
            .remove(&DataKey::HospitalAuth(hospital.clone()));

        if was_authorized {
            let count: u32 = env
                .storage()
                .instance()
                .get::<DataKey, u32>(&DataKey::TotalHospitals)
                .unwrap_or(0);
            if count > 0 {
                env.storage()
                    .instance()
                    .set(&DataKey::TotalHospitals, &(count - 1));
            }
        }

        env.events().publish(
            (symbol_short!("hosp_rem"), admin),
            hospital,
        );
    }

    // ------------------------------------------------------------
    // 4. IS AUTHORIZED (read-only — called by Core contract)
    // ------------------------------------------------------------
    /// Returns `true` if the given hospital address is on the
    /// whitelist, `false` otherwise.
    pub fn is_authorized(env: Env, hospital: Address) -> bool {
        env.storage()
            .persistent()
            .get::<DataKey, bool>(&DataKey::HospitalAuth(hospital))
            .unwrap_or(false)
    }

    // ------------------------------------------------------------
    // 5. GET ADMIN & HOSPITAL COUNT (read-only helpers)
    // ------------------------------------------------------------
    /// Returns the stored super-admin address.
    pub fn get_admin(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::Admin)
    }

    /// Returns total active registered hospitals count.
    pub fn get_hospital_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get::<DataKey, u32>(&DataKey::TotalHospitals)
            .unwrap_or(0)
    }

    // ------------------------------------------------------------
    // 6. CONTRACT UPGRADE (Super-Admin Only)
    // ------------------------------------------------------------
    /// Upgrades the contract WASM bytecode to a new compiled WASM hash.
    /// Follows official Stellar Soroban upgrade patterns using `env.deployer()`.
    ///
    /// # Authorization
    /// `admin.require_auth()` — Only super-admin can upgrade contract bytecode.
    pub fn upgrade(env: Env, admin: Address, new_wasm_hash: BytesN<32>) {
        admin.require_auth();

        let stored_admin = env
            .storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, RegistryError::NotInitialized));

        if stored_admin != admin {
            panic_with_error!(&env, RegistryError::Unauthorized);
        }

        env.deployer().update_current_contract_wasm(new_wasm_hash);

        env.events().publish(
            (symbol_short!("upgraded"), admin),
            symbol_short!("registry"),
        );
    }
}

