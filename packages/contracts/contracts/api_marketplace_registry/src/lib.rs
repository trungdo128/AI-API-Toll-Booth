#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, BytesN, Env};

#[contract]
pub struct ApiMarketplaceRegistry;

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    PaymentAsset,
    Provider(Address),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ProviderProfile {
    pub owner: Address,
    pub metadata_hash: BytesN<32>,
    pub active: bool,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum ContractError {
    AlreadyInitialized = 1,
    ProviderAlreadyExists = 2,
}

#[contractimpl]
impl ApiMarketplaceRegistry {
    pub fn initialize(
        env: Env,
        admin: Address,
        payment_asset: Address,
    ) -> Result<(), ContractError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(ContractError::AlreadyInitialized);
        }

        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::PaymentAsset, &payment_asset);
        Ok(())
    }

    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    pub fn payment_asset(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::PaymentAsset)
            .unwrap()
    }

    pub fn register_provider(
        env: Env,
        provider: Address,
        metadata_hash: BytesN<32>,
    ) -> Result<(), ContractError> {
        let key = DataKey::Provider(provider.clone());
        if env.storage().persistent().has(&key) {
            return Err(ContractError::ProviderAlreadyExists);
        }

        provider.require_auth();
        env.storage().persistent().set(
            &key,
            &ProviderProfile {
                owner: provider,
                metadata_hash,
                active: true,
            },
        );
        Ok(())
    }

    pub fn provider(env: Env, provider: Address) -> ProviderProfile {
        env.storage()
            .persistent()
            .get(&DataKey::Provider(provider))
            .unwrap()
    }
}

mod test;
