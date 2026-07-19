#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

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
