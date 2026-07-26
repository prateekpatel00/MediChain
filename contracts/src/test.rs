#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    fn create_env() -> Env {
        Env::default()
    }

    fn register_and_get_client(env: &Env) -> (MediChainContractClient, Address) {
        let contract_id = env.register(MediChainContract, ());
        let client = MediChainContractClient::new(env, &contract_id);
        (client, contract_id)
    }

    #[test]
    fn test_initialize_and_grant_hospital_rights() {
        let env = create_env();
        let (client, _) = register_and_get_client(&env);

        let govt = Address::generate(&env);
        let hospital = Address::generate(&env);

        env.mock_all_auths();

        client.initialize(&govt);
        assert_eq!(client.get_govt_admin(), Some(govt.clone()));

        // Confirm hospital is not authorized initially
        assert!(!client.is_hospital_authorized(&hospital));

        // Grant hospital rights
        client.grant_hospital_rights(&govt, &hospital);

        // Confirm hospital authorized
        assert!(client.is_hospital_authorized(&hospital));
    }

    #[test]
    fn test_upload_and_view_record() {
        let env = create_env();
        let (client, _) = register_and_get_client(&env);

        let govt = Address::generate(&env);
        let hospital = Address::generate(&env);
        let patient_id = String::from_str(&env, "PAT-001");
        let ipfs_hash = String::from_str(&env, "QmTestHash12345");

        env.mock_all_auths();

        client.initialize(&govt);
        client.grant_hospital_rights(&govt, &hospital);

        // Authorized hospital uploads record
        client.upload_record(&hospital, &patient_id, &ipfs_hash);

        // Owner can view
        let hash = client.view_record(&hospital, &patient_id);
        assert_eq!(hash, ipfs_hash);
    }

    #[test]
    #[should_panic]
    fn test_unauthorized_hospital_upload_panics() {
        let env = create_env();
        let (client, _) = register_and_get_client(&env);

        let unauth_hospital = Address::generate(&env);
        let patient_id = String::from_str(&env, "PAT-002");
        let ipfs_hash = String::from_str(&env, "QmTestHashUnauth");

        env.mock_all_auths();

        // Should panic because unauth_hospital was never granted rights by Govt
        client.upload_record(&unauth_hospital, &patient_id, &ipfs_hash);
    }

    #[test]
    fn test_access_request_approve_and_reject() {
        let env = create_env();
        let (client, _) = register_and_get_client(&env);

        let govt = Address::generate(&env);
        let owning_hospital = Address::generate(&env);
        let requesting_hospital = Address::generate(&env);
        let patient_id = String::from_str(&env, "PAT-003");
        let ipfs_hash = String::from_str(&env, "QmTestHashAccess");
        let reason = String::from_str(&env, "Patient transfer consult");

        env.mock_all_auths();

        client.initialize(&govt);
        client.grant_hospital_rights(&govt, &owning_hospital);
        client.grant_hospital_rights(&govt, &requesting_hospital);

        client.upload_record(&owning_hospital, &patient_id, &ipfs_hash);

        // Request access
        client.request_access(
            &requesting_hospital,
            &owning_hospital,
            &patient_id,
            &reason,
        );

        assert!(!client.check_access(&requesting_hospital, &patient_id));

        // Approve access
        client.approve_access(&owning_hospital, &requesting_hospital, &patient_id);

        assert!(client.check_access(&requesting_hospital, &patient_id));

        // Requester views record
        let hash = client.view_record(&requesting_hospital, &patient_id);
        assert_eq!(hash, ipfs_hash);

        // Test Rejecting access
        client.reject_access(&owning_hospital, &requesting_hospital, &patient_id);
        assert!(!client.check_access(&requesting_hospital, &patient_id));
    }
}
