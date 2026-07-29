#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, Address, BytesN, Env,
    Symbol,
};

const VERSION: u32 = 1;
const MAX_PRICE: i128 = 1_000_000_000_000_000_000;
const TTL_THRESHOLD: u32 = 14 * 17_280;
const TTL_EXTEND_TO: u32 = 90 * 17_280;

#[contract]
pub struct ApiMarketplaceRegistry;

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Config,
    Provider(Address),
    Api(Symbol),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PlatformConfig {
    pub admin: Address,
    pub accepted_asset: Address,
    pub paused: bool,
    pub version: u32,
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
    pub metadata_hash: BytesN<32>,
    pub price: i128,
    pub recipient: Address,
    pub active: bool,
}

#[contractevent]
pub struct ProviderRegistered {
    #[topic]
    pub provider: Address,
    pub metadata_hash: BytesN<32>,
}

#[contractevent]
pub struct ProviderUpdated {
    #[topic]
    pub provider: Address,
    pub metadata_hash: BytesN<32>,
}

#[contractevent]
pub struct ApiRegistered {
    #[topic]
    pub api_id: Symbol,
    pub provider: Address,
    pub metadata_hash: BytesN<32>,
    pub price: i128,
    pub recipient: Address,
}

#[contractevent]
pub struct ApiPriceUpdated {
    #[topic]
    pub api_id: Symbol,
    pub price: i128,
}

#[contractevent]
pub struct ApiStatusChanged {
    #[topic]
    pub api_id: Symbol,
    pub active: bool,
}

#[contractevent]
pub struct PlatformPaused {
    #[topic]
    pub admin: Address,
}

#[contractevent]
pub struct PlatformUnpaused {
    #[topic]
    pub admin: Address,
}

#[contractevent]
pub struct ContractUpgraded {
    #[topic]
    pub admin: Address,
    pub wasm_hash: BytesN<32>,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum ContractError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    ProviderAlreadyExists = 3,
    ApiAlreadyExists = 4,
    ProviderNotFound = 5,
    ApiNotFound = 6,
    UnauthorizedAdmin = 7,
    UnauthorizedProvider = 8,
    InvalidPrice = 9,
    PlatformPaused = 10,
}

fn config(env: &Env) -> Result<PlatformConfig, ContractError> {
    env.storage()
        .instance()
        .get(&DataKey::Config)
        .ok_or(ContractError::NotInitialized)
}

fn write_config(env: &Env, value: &PlatformConfig) {
    env.storage().instance().set(&DataKey::Config, value);
    env.storage()
        .instance()
        .extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);
}

fn require_running(env: &Env) -> Result<PlatformConfig, ContractError> {
    let value = config(env)?;
    if value.paused {
        return Err(ContractError::PlatformPaused);
    }
    Ok(value)
}

fn validate_price(price: i128) -> Result<(), ContractError> {
    if price <= 0 || price > MAX_PRICE {
        return Err(ContractError::InvalidPrice);
    }
    Ok(())
}

fn read_provider(env: &Env, owner: &Address) -> Result<ProviderProfile, ContractError> {
    let key = DataKey::Provider(owner.clone());
    let value = env
        .storage()
        .persistent()
        .get(&key)
        .ok_or(ContractError::ProviderNotFound)?;
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
    Ok(value)
}

fn read_api(env: &Env, api_id: &Symbol) -> Result<ApiProduct, ContractError> {
    let key = DataKey::Api(api_id.clone());
    let value = env
        .storage()
        .persistent()
        .get(&key)
        .ok_or(ContractError::ApiNotFound)?;
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
    Ok(value)
}

#[contractimpl]
impl ApiMarketplaceRegistry {
    pub fn initialize(
        env: Env,
        admin: Address,
        accepted_asset: Address,
    ) -> Result<(), ContractError> {
        if env.storage().instance().has(&DataKey::Config) {
            return Err(ContractError::AlreadyInitialized);
        }
        admin.require_auth();
        write_config(
            &env,
            &PlatformConfig {
                admin,
                accepted_asset,
                paused: false,
                version: VERSION,
            },
        );
        Ok(())
    }

    pub fn get_platform_config(env: Env) -> Result<PlatformConfig, ContractError> {
        let value = config(&env)?;
        env.storage()
            .instance()
            .extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);
        Ok(value)
    }

    pub fn admin(env: Env) -> Result<Address, ContractError> {
        Ok(config(&env)?.admin)
    }

    pub fn payment_asset(env: Env) -> Result<Address, ContractError> {
        Ok(config(&env)?.accepted_asset)
    }

    pub fn paused(env: Env) -> Result<bool, ContractError> {
        Ok(config(&env)?.paused)
    }

    pub fn register_provider(
        env: Env,
        provider: Address,
        metadata_hash: BytesN<32>,
    ) -> Result<(), ContractError> {
        require_running(&env)?;
        let key = DataKey::Provider(provider.clone());
        if env.storage().persistent().has(&key) {
            return Err(ContractError::ProviderAlreadyExists);
        }
        provider.require_auth();
        env.storage().persistent().set(
            &key,
            &ProviderProfile {
                owner: provider.clone(),
                metadata_hash: metadata_hash.clone(),
                active: true,
            },
        );
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
        ProviderRegistered {
            provider,
            metadata_hash,
        }
        .publish(&env);
        Ok(())
    }

    pub fn update_provider_metadata(
        env: Env,
        provider: Address,
        metadata_hash: BytesN<32>,
    ) -> Result<(), ContractError> {
        require_running(&env)?;
        let key = DataKey::Provider(provider.clone());
        let mut profile = read_provider(&env, &provider)?;
        provider.require_auth();
        profile.metadata_hash = metadata_hash.clone();
        env.storage().persistent().set(&key, &profile);
        ProviderUpdated {
            provider,
            metadata_hash,
        }
        .publish(&env);
        Ok(())
    }

    pub fn get_provider(env: Env, provider: Address) -> Result<ProviderProfile, ContractError> {
        read_provider(&env, &provider)
    }

    pub fn provider(env: Env, provider: Address) -> Result<ProviderProfile, ContractError> {
        read_provider(&env, &provider)
    }

    pub fn register_api(
        env: Env,
        provider: Address,
        api_id: Symbol,
        metadata_hash: BytesN<32>,
        price: i128,
        recipient: Address,
    ) -> Result<(), ContractError> {
        require_running(&env)?;
        validate_price(price)?;
        read_provider(&env, &provider)?;
        let key = DataKey::Api(api_id.clone());
        if env.storage().persistent().has(&key) {
            return Err(ContractError::ApiAlreadyExists);
        }
        provider.require_auth();
        env.storage().persistent().set(
            &key,
            &ApiProduct {
                provider: provider.clone(),
                metadata_hash: metadata_hash.clone(),
                price,
                recipient: recipient.clone(),
                active: true,
            },
        );
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
        ApiRegistered {
            api_id,
            provider,
            metadata_hash,
            price,
            recipient,
        }
        .publish(&env);
        Ok(())
    }

    pub fn get_api(env: Env, api_id: Symbol) -> Result<ApiProduct, ContractError> {
        read_api(&env, &api_id)
    }

    pub fn api(env: Env, api_id: Symbol) -> Result<ApiProduct, ContractError> {
        read_api(&env, &api_id)
    }

    pub fn update_api_price(
        env: Env,
        provider: Address,
        api_id: Symbol,
        new_price: i128,
    ) -> Result<(), ContractError> {
        require_running(&env)?;
        validate_price(new_price)?;
        let key = DataKey::Api(api_id.clone());
        let mut product = read_api(&env, &api_id)?;
        if product.provider != provider {
            return Err(ContractError::UnauthorizedProvider);
        }
        provider.require_auth();
        product.price = new_price;
        env.storage().persistent().set(&key, &product);
        ApiPriceUpdated {
            api_id,
            price: new_price,
        }
        .publish(&env);
        Ok(())
    }

    pub fn set_api_status(
        env: Env,
        provider: Address,
        api_id: Symbol,
        active: bool,
    ) -> Result<(), ContractError> {
        require_running(&env)?;
        let key = DataKey::Api(api_id.clone());
        let mut product = read_api(&env, &api_id)?;
        if product.provider != provider {
            return Err(ContractError::UnauthorizedProvider);
        }
        provider.require_auth();
        product.active = active;
        env.storage().persistent().set(&key, &product);
        ApiStatusChanged { api_id, active }.publish(&env);
        Ok(())
    }

    pub fn set_api_active(
        env: Env,
        provider: Address,
        api_id: Symbol,
        active: bool,
    ) -> Result<(), ContractError> {
        Self::set_api_status(env, provider, api_id, active)
    }

    pub fn pause_platform(env: Env, admin: Address) -> Result<(), ContractError> {
        let mut value = config(&env)?;
        if value.admin != admin {
            return Err(ContractError::UnauthorizedAdmin);
        }
        admin.require_auth();
        value.paused = true;
        write_config(&env, &value);
        PlatformPaused { admin }.publish(&env);
        Ok(())
    }

    pub fn unpause_platform(env: Env, admin: Address) -> Result<(), ContractError> {
        let mut value = config(&env)?;
        if value.admin != admin {
            return Err(ContractError::UnauthorizedAdmin);
        }
        admin.require_auth();
        value.paused = false;
        write_config(&env, &value);
        PlatformUnpaused { admin }.publish(&env);
        Ok(())
    }

    pub fn set_paused(env: Env, admin: Address, paused: bool) -> Result<(), ContractError> {
        if paused {
            Self::pause_platform(env, admin)
        } else {
            Self::unpause_platform(env, admin)
        }
    }

    pub fn upgrade_contract(
        env: Env,
        admin: Address,
        wasm_hash: BytesN<32>,
    ) -> Result<(), ContractError> {
        let value = config(&env)?;
        if value.admin != admin {
            return Err(ContractError::UnauthorizedAdmin);
        }
        admin.require_auth();
        ContractUpgraded {
            admin,
            wasm_hash: wasm_hash.clone(),
        }
        .publish(&env);
        env.deployer().update_current_contract_wasm(wasm_hash);
        Ok(())
    }
}

mod test;
