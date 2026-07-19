#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, BytesN, Env, Symbol};

#[contract]
pub struct ApiMarketplaceRegistry;

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    PaymentAsset,
    Paused,
    Provider(Address),
    Api(Symbol),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ProviderProfile {
    pub owner: Address,
    pub metadata_hash: BytesN<32>,
    pub active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ApiProduct {
    pub provider: Address,
    pub price: i128,
    pub active: bool,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum ContractError {
    AlreadyInitialized = 1,
    ProviderAlreadyExists = 2,
    ApiAlreadyExists = 3,
    ProviderNotFound = 4,
    UnauthorizedAdmin = 5,
    UnauthorizedProvider = 6,
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
        env.storage().instance().set(&DataKey::Paused, &false);
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

    pub fn set_paused(env: Env, admin: Address, paused: bool) -> Result<(), ContractError> {
        let expected_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if admin != expected_admin {
            return Err(ContractError::UnauthorizedAdmin);
        }

        admin.require_auth();
        env.storage().instance().set(&DataKey::Paused, &paused);
        Ok(())
    }

    pub fn paused(env: Env) -> bool {
        env.storage().instance().get(&DataKey::Paused).unwrap_or(false)
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

    pub fn register_api(
        env: Env,
        provider: Address,
        api_id: Symbol,
        price: i128,
    ) -> Result<(), ContractError> {
        if !env
            .storage()
            .persistent()
            .has(&DataKey::Provider(provider.clone()))
        {
            return Err(ContractError::ProviderNotFound);
        }
        if env.storage().persistent().has(&DataKey::Api(api_id.clone())) {
            return Err(ContractError::ApiAlreadyExists);
        }

        provider.require_auth();
        env.storage().persistent().set(
            &DataKey::Api(api_id),
            &ApiProduct {
                provider,
                price,
                active: true,
            },
        );
        Ok(())
    }

    pub fn api(env: Env, api_id: Symbol) -> ApiProduct {
        env.storage()
            .persistent()
            .get(&DataKey::Api(api_id))
            .unwrap()
    }

    pub fn update_api_price(
        env: Env,
        provider: Address,
        api_id: Symbol,
        price: i128,
    ) -> Result<(), ContractError> {
        let key = DataKey::Api(api_id);
        let mut product: ApiProduct = env.storage().persistent().get(&key).unwrap();
        if product.provider != provider {
            return Err(ContractError::UnauthorizedProvider);
        }

        provider.require_auth();
        product.price = price;
        env.storage().persistent().set(&key, &product);
        Ok(())
    }
}

mod test;
