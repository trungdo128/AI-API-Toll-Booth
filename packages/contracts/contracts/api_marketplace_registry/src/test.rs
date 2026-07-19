#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env};

#[test]
fn initializes_once_and_exposes_the_configured_asset() {
    let env = Env::default();
    let contract_id = env.register(ApiMarketplaceRegistry, ());
    let client = ApiMarketplaceRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let payment_asset = Address::generate(&env);

    env.mock_all_auths();
    client.initialize(&admin, &payment_asset);

    assert_eq!(client.admin(), admin);
    assert_eq!(client.payment_asset(), payment_asset);
}

#[test]
fn registers_a_provider_with_hashed_metadata() {
    let env = Env::default();
    let contract_id = env.register(ApiMarketplaceRegistry, ());
    let client = ApiMarketplaceRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let payment_asset = Address::generate(&env);
    let provider = Address::generate(&env);
    let metadata_hash = BytesN::from_array(&env, &[7; 32]);

    env.mock_all_auths();
    client.initialize(&admin, &payment_asset);
    client.register_provider(&provider, &metadata_hash);

    let record = client.provider(&provider);
    assert_eq!(record.owner, provider);
    assert_eq!(record.metadata_hash, metadata_hash);
    assert!(record.active);
}
