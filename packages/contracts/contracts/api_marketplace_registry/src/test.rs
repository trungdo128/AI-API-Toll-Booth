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
    client.register_api(
        &provider,
        &api_id,
        &BytesN::from_array(&env, &[8; 32]),
        &250_000i128,
        &provider,
    );

    let product = client.api(&api_id);
    assert_eq!(product.provider, provider);
    assert_eq!(product.metadata_hash, BytesN::from_array(&env, &[8; 32]));
    assert_eq!(product.price, 250_000i128);
    assert_eq!(product.recipient, provider);
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
    client.register_api(
        &provider,
        &api_id,
        &BytesN::from_array(&env, &[8; 32]),
        &250_000i128,
        &provider,
    );
    client.update_api_price(&provider, &api_id, &300_000i128);

    assert_eq!(client.api(&api_id).price, 300_000i128);
}

#[test]
fn lets_the_product_provider_disable_its_api() {
    let env = Env::default();
    let contract_id = env.register(ApiMarketplaceRegistry, ());
    let client = ApiMarketplaceRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let provider = Address::generate(&env);
    let api_id = Symbol::new(&env, "summary");

    env.mock_all_auths();
    client.initialize(&admin, &Address::generate(&env));
    client.register_provider(&provider, &BytesN::from_array(&env, &[7; 32]));
    client.register_api(
        &provider,
        &api_id,
        &BytesN::from_array(&env, &[8; 32]),
        &250_000i128,
        &provider,
    );
    client.set_api_active(&provider, &api_id, &false);

    assert!(!client.api(&api_id).active);
}

#[test]
fn rejects_duplicate_initialization() {
    let env = Env::default();
    let contract_id = env.register(ApiMarketplaceRegistry, ());
    let client = ApiMarketplaceRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);

    env.mock_all_auths();
    client.initialize(&admin, &Address::generate(&env));
    assert!(client
        .try_initialize(&admin, &Address::generate(&env))
        .is_err());
}

#[test]
fn provider_updates_only_its_own_metadata() {
    let env = Env::default();
    let contract_id = env.register(ApiMarketplaceRegistry, ());
    let client = ApiMarketplaceRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let provider = Address::generate(&env);
    let other = Address::generate(&env);

    env.mock_all_auths();
    client.initialize(&admin, &Address::generate(&env));
    client.register_provider(&provider, &BytesN::from_array(&env, &[1; 32]));
    client.update_provider_metadata(&provider, &BytesN::from_array(&env, &[2; 32]));

    assert_eq!(
        client.get_provider(&provider).metadata_hash,
        BytesN::from_array(&env, &[2; 32])
    );
    assert!(client
        .try_update_provider_metadata(&other, &BytesN::from_array(&env, &[3; 32]))
        .is_err());
}

#[test]
fn rejects_non_positive_and_excessive_prices() {
    let env = Env::default();
    let contract_id = env.register(ApiMarketplaceRegistry, ());
    let client = ApiMarketplaceRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let provider = Address::generate(&env);

    env.mock_all_auths();
    client.initialize(&admin, &Address::generate(&env));
    client.register_provider(&provider, &BytesN::from_array(&env, &[1; 32]));

    assert!(client
        .try_register_api(
            &provider,
            &Symbol::new(&env, "zero"),
            &BytesN::from_array(&env, &[2; 32]),
            &0,
            &provider,
        )
        .is_err());
    assert!(client
        .try_register_api(
            &provider,
            &Symbol::new(&env, "huge"),
            &BytesN::from_array(&env, &[2; 32]),
            &(MAX_PRICE + 1),
            &provider,
        )
        .is_err());
}

#[test]
fn rejects_duplicate_api_ids() {
    let env = Env::default();
    let contract_id = env.register(ApiMarketplaceRegistry, ());
    let client = ApiMarketplaceRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let provider = Address::generate(&env);
    let api_id = Symbol::new(&env, "unique");

    env.mock_all_auths();
    client.initialize(&admin, &Address::generate(&env));
    client.register_provider(&provider, &BytesN::from_array(&env, &[1; 32]));
    client.register_api(
        &provider,
        &api_id,
        &BytesN::from_array(&env, &[2; 32]),
        &1,
        &provider,
    );
    assert!(client
        .try_register_api(
            &provider,
            &api_id,
            &BytesN::from_array(&env, &[3; 32]),
            &2,
            &provider,
        )
        .is_err());
}

#[test]
fn another_provider_cannot_update_an_api() {
    let env = Env::default();
    let contract_id = env.register(ApiMarketplaceRegistry, ());
    let client = ApiMarketplaceRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let provider = Address::generate(&env);
    let other = Address::generate(&env);
    let api_id = Symbol::new(&env, "owned");

    env.mock_all_auths();
    client.initialize(&admin, &Address::generate(&env));
    client.register_provider(&provider, &BytesN::from_array(&env, &[1; 32]));
    client.register_provider(&other, &BytesN::from_array(&env, &[2; 32]));
    client.register_api(
        &provider,
        &api_id,
        &BytesN::from_array(&env, &[3; 32]),
        &10,
        &provider,
    );

    assert!(client.try_update_api_price(&other, &api_id, &20).is_err());
    assert!(client.try_set_api_status(&other, &api_id, &false).is_err());
}

#[test]
fn pause_blocks_mutations_until_admin_unpauses() {
    let env = Env::default();
    let contract_id = env.register(ApiMarketplaceRegistry, ());
    let client = ApiMarketplaceRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let provider = Address::generate(&env);

    env.mock_all_auths();
    client.initialize(&admin, &Address::generate(&env));
    client.pause_platform(&admin);
    assert!(client
        .try_register_provider(&provider, &BytesN::from_array(&env, &[1; 32]))
        .is_err());
    client.unpause_platform(&admin);
    client.register_provider(&provider, &BytesN::from_array(&env, &[1; 32]));
    assert!(client.get_provider(&provider).active);
}

#[test]
fn non_admin_cannot_pause() {
    let env = Env::default();
    let contract_id = env.register(ApiMarketplaceRegistry, ());
    let client = ApiMarketplaceRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let other = Address::generate(&env);

    env.mock_all_auths();
    client.initialize(&admin, &Address::generate(&env));
    assert!(client.try_pause_platform(&other).is_err());
}

#[test]
fn exposes_versioned_platform_configuration() {
    let env = Env::default();
    let contract_id = env.register(ApiMarketplaceRegistry, ());
    let client = ApiMarketplaceRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let asset = Address::generate(&env);

    env.mock_all_auths();
    client.initialize(&admin, &asset);
    let config = client.get_platform_config();
    assert_eq!(config.admin, admin);
    assert_eq!(config.accepted_asset, asset);
    assert_eq!(config.version, VERSION);
    assert!(!config.paused);
}
