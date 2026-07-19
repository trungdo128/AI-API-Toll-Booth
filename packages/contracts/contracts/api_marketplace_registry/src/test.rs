#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env, Symbol};

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

#[test]
fn registers_an_active_api_product_with_a_price() {
    let env = Env::default();
    let contract_id = env.register(ApiMarketplaceRegistry, ());
    let client = ApiMarketplaceRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let payment_asset = Address::generate(&env);
    let provider = Address::generate(&env);
    let api_id = Symbol::new(&env, "summarize");

    env.mock_all_auths();
    client.initialize(&admin, &payment_asset);
    client.register_provider(&provider, &BytesN::from_array(&env, &[7; 32]));
    client.register_api(&provider, &api_id, &250_000i128);

    let product = client.api(&api_id);
    assert_eq!(product.provider, provider);
    assert_eq!(product.price, 250_000i128);
    assert!(product.active);
}

#[test]
fn lets_the_admin_pause_the_marketplace() {
    let env = Env::default();
    let contract_id = env.register(ApiMarketplaceRegistry, ());
    let client = ApiMarketplaceRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);

    env.mock_all_auths();
    client.initialize(&admin, &Address::generate(&env));
    client.set_paused(&admin, &true);

    assert!(client.paused());
}

#[test]
fn lets_the_product_provider_update_its_price() {
    let env = Env::default();
    let contract_id = env.register(ApiMarketplaceRegistry, ());
    let client = ApiMarketplaceRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let provider = Address::generate(&env);
    let api_id = Symbol::new(&env, "summary");

    env.mock_all_auths();
    client.initialize(&admin, &Address::generate(&env));
    client.register_provider(&provider, &BytesN::from_array(&env, &[7; 32]));
    client.register_api(&provider, &api_id, &250_000i128);
    client.update_api_price(&provider, &api_id, &300_000i128);

    assert_eq!(client.api(&api_id).price, 300_000i128);
}
