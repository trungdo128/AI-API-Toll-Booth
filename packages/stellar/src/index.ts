import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}





export interface ApiProduct {
  active: boolean;
  metadata_hash: Buffer;
  price: i128;
  provider: string;
  recipient: string;
}

export const ContractError = {
  1: {message:"AlreadyInitialized"},
  2: {message:"NotInitialized"},
  3: {message:"ProviderAlreadyExists"},
  4: {message:"ApiAlreadyExists"},
  5: {message:"ProviderNotFound"},
  6: {message:"ApiNotFound"},
  7: {message:"UnauthorizedAdmin"},
  8: {message:"UnauthorizedProvider"},
  9: {message:"InvalidPrice"},
  10: {message:"PlatformPaused"}
}



export interface PlatformConfig {
  accepted_asset: string;
  admin: string;
  paused: boolean;
  version: u32;
}



export interface ProviderProfile {
  active: boolean;
  metadata_hash: Buffer;
  owner: string;
}







export interface Client {
  /**
   * Construct and simulate a api transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  api: ({api_id}: {api_id: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<ApiProduct>>>

  /**
   * Construct and simulate a admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  admin: (options?: MethodOptions) => Promise<AssembledTransaction<Result<string>>>

  /**
   * Construct and simulate a paused transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  paused: (options?: MethodOptions) => Promise<AssembledTransaction<Result<boolean>>>

  /**
   * Construct and simulate a get_api transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_api: ({api_id}: {api_id: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<ApiProduct>>>

  /**
   * Construct and simulate a provider transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  provider: ({provider}: {provider: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<ProviderProfile>>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({admin, accepted_asset}: {admin: string, accepted_asset: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_paused transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_paused: ({admin, paused}: {admin: string, paused: boolean}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_provider transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_provider: ({provider}: {provider: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<ProviderProfile>>>

  /**
   * Construct and simulate a register_api transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  register_api: ({provider, api_id, metadata_hash, price, recipient}: {provider: string, api_id: string, metadata_hash: Buffer, price: i128, recipient: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a payment_asset transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  payment_asset: (options?: MethodOptions) => Promise<AssembledTransaction<Result<string>>>

  /**
   * Construct and simulate a pause_platform transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  pause_platform: ({admin}: {admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_api_active transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_api_active: ({provider, api_id, active}: {provider: string, api_id: string, active: boolean}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_api_status transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_api_status: ({provider, api_id, active}: {provider: string, api_id: string, active: boolean}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a unpause_platform transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  unpause_platform: ({admin}: {admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a update_api_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  update_api_price: ({provider, api_id, new_price}: {provider: string, api_id: string, new_price: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a upgrade_contract transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  upgrade_contract: ({admin, wasm_hash}: {admin: string, wasm_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a register_provider transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  register_provider: ({provider, metadata_hash}: {provider: string, metadata_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_platform_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_platform_config: (options?: MethodOptions) => Promise<AssembledTransaction<Result<PlatformConfig>>>

  /**
   * Construct and simulate a update_provider_metadata transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  update_provider_metadata: ({provider, metadata_hash}: {provider: string, metadata_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAACkFwaVByb2R1Y3QAAAAAAAUAAAAAAAAABmFjdGl2ZQAAAAAAAQAAAAAAAAANbWV0YWRhdGFfaGFzaAAAAAAAA+4AAAAgAAAAAAAAAAVwcmljZQAAAAAAAAsAAAAAAAAACHByb3ZpZGVyAAAAEwAAAAAAAAAJcmVjaXBpZW50AAAAAAAAEw==",
        "AAAABAAAAAAAAAAAAAAADUNvbnRyYWN0RXJyb3IAAAAAAAAKAAAAAAAAABJBbHJlYWR5SW5pdGlhbGl6ZWQAAAAAAAEAAAAAAAAADk5vdEluaXRpYWxpemVkAAAAAAACAAAAAAAAABVQcm92aWRlckFscmVhZHlFeGlzdHMAAAAAAAADAAAAAAAAABBBcGlBbHJlYWR5RXhpc3RzAAAABAAAAAAAAAAQUHJvdmlkZXJOb3RGb3VuZAAAAAUAAAAAAAAAC0FwaU5vdEZvdW5kAAAAAAYAAAAAAAAAEVVuYXV0aG9yaXplZEFkbWluAAAAAAAABwAAAAAAAAAUVW5hdXRob3JpemVkUHJvdmlkZXIAAAAIAAAAAAAAAAxJbnZhbGlkUHJpY2UAAAAJAAAAAAAAAA5QbGF0Zm9ybVBhdXNlZAAAAAAACg==",
        "AAAABQAAAAAAAAAAAAAADUFwaVJlZ2lzdGVyZWQAAAAAAAABAAAADmFwaV9yZWdpc3RlcmVkAAAAAAAFAAAAAAAAAAZhcGlfaWQAAAAAABEAAAABAAAAAAAAAAhwcm92aWRlcgAAABMAAAAAAAAAAAAAAA1tZXRhZGF0YV9oYXNoAAAAAAAD7gAAACAAAAAAAAAAAAAAAAVwcmljZQAAAAAAAAsAAAAAAAAAAAAAAAlyZWNpcGllbnQAAAAAAAATAAAAAAAAAAI=",
        "AAAAAQAAAAAAAAAAAAAADlBsYXRmb3JtQ29uZmlnAAAAAAAEAAAAAAAAAA5hY2NlcHRlZF9hc3NldAAAAAAAEwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAZwYXVzZWQAAAAAAAEAAAAAAAAAB3ZlcnNpb24AAAAABA==",
        "AAAABQAAAAAAAAAAAAAADlBsYXRmb3JtUGF1c2VkAAAAAAABAAAAD3BsYXRmb3JtX3BhdXNlZAAAAAABAAAAAAAAAAVhZG1pbgAAAAAAABMAAAABAAAAAg==",
        "AAAAAQAAAAAAAAAAAAAAD1Byb3ZpZGVyUHJvZmlsZQAAAAADAAAAAAAAAAZhY3RpdmUAAAAAAAEAAAAAAAAADW1ldGFkYXRhX2hhc2gAAAAAAAPuAAAAIAAAAAAAAAAFb3duZXIAAAAAAAAT",
        "AAAABQAAAAAAAAAAAAAAD0FwaVByaWNlVXBkYXRlZAAAAAABAAAAEWFwaV9wcmljZV91cGRhdGVkAAAAAAAAAgAAAAAAAAAGYXBpX2lkAAAAAAARAAAAAQAAAAAAAAAFcHJpY2UAAAAAAAALAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAAD1Byb3ZpZGVyVXBkYXRlZAAAAAABAAAAEHByb3ZpZGVyX3VwZGF0ZWQAAAACAAAAAAAAAAhwcm92aWRlcgAAABMAAAABAAAAAAAAAA1tZXRhZGF0YV9oYXNoAAAAAAAD7gAAACAAAAAAAAAAAg==",
        "AAAABQAAAAAAAAAAAAAAEEFwaVN0YXR1c0NoYW5nZWQAAAABAAAAEmFwaV9zdGF0dXNfY2hhbmdlZAAAAAAAAgAAAAAAAAAGYXBpX2lkAAAAAAARAAAAAQAAAAAAAAAGYWN0aXZlAAAAAAABAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAAEENvbnRyYWN0VXBncmFkZWQAAAABAAAAEWNvbnRyYWN0X3VwZ3JhZGVkAAAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAQAAAAAAAAAJd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAAAAAAAg==",
        "AAAABQAAAAAAAAAAAAAAEFBsYXRmb3JtVW5wYXVzZWQAAAABAAAAEXBsYXRmb3JtX3VucGF1c2VkAAAAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAQAAAAI=",
        "AAAAAAAAAAAAAAADYXBpAAAAAAEAAAAAAAAABmFwaV9pZAAAAAAAEQAAAAEAAAPpAAAH0AAAAApBcGlQcm9kdWN0AAAAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAABQAAAAAAAAAAAAAAElByb3ZpZGVyUmVnaXN0ZXJlZAAAAAAAAQAAABNwcm92aWRlcl9yZWdpc3RlcmVkAAAAAAIAAAAAAAAACHByb3ZpZGVyAAAAEwAAAAEAAAAAAAAADW1ldGFkYXRhX2hhc2gAAAAAAAPuAAAAIAAAAAAAAAAC",
        "AAAAAAAAAAAAAAAFYWRtaW4AAAAAAAAAAAAAAQAAA+kAAAATAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAAAAAAAGcGF1c2VkAAAAAAAAAAAAAQAAA+kAAAABAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAAAAAAAHZ2V0X2FwaQAAAAABAAAAAAAAAAZhcGlfaWQAAAAAABEAAAABAAAD6QAAB9AAAAAKQXBpUHJvZHVjdAAAAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAAAAAAAIcHJvdmlkZXIAAAABAAAAAAAAAAhwcm92aWRlcgAAABMAAAABAAAD6QAAB9AAAAAPUHJvdmlkZXJQcm9maWxlAAAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAA5hY2NlcHRlZF9hc3NldAAAAAAAEwAAAAEAAAPpAAAAAgAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==",
        "AAAAAAAAAAAAAAAKc2V0X3BhdXNlZAAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAZwYXVzZWQAAAAAAAEAAAABAAAD6QAAAAIAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAMZ2V0X3Byb3ZpZGVyAAAAAQAAAAAAAAAIcHJvdmlkZXIAAAATAAAAAQAAA+kAAAfQAAAAD1Byb3ZpZGVyUHJvZmlsZQAAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAMcmVnaXN0ZXJfYXBpAAAABQAAAAAAAAAIcHJvdmlkZXIAAAATAAAAAAAAAAZhcGlfaWQAAAAAABEAAAAAAAAADW1ldGFkYXRhX2hhc2gAAAAAAAPuAAAAIAAAAAAAAAAFcHJpY2UAAAAAAAALAAAAAAAAAAlyZWNpcGllbnQAAAAAAAATAAAAAQAAA+kAAAACAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAAAAAAANcGF5bWVudF9hc3NldAAAAAAAAAAAAAABAAAD6QAAABMAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAOcGF1c2VfcGxhdGZvcm0AAAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAEAAAPpAAAAAgAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==",
        "AAAAAAAAAAAAAAAOc2V0X2FwaV9hY3RpdmUAAAAAAAMAAAAAAAAACHByb3ZpZGVyAAAAEwAAAAAAAAAGYXBpX2lkAAAAAAARAAAAAAAAAAZhY3RpdmUAAAAAAAEAAAABAAAD6QAAAAIAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAOc2V0X2FwaV9zdGF0dXMAAAAAAAMAAAAAAAAACHByb3ZpZGVyAAAAEwAAAAAAAAAGYXBpX2lkAAAAAAARAAAAAAAAAAZhY3RpdmUAAAAAAAEAAAABAAAD6QAAAAIAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAQdW5wYXVzZV9wbGF0Zm9ybQAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAEAAAPpAAAAAgAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==",
        "AAAAAAAAAAAAAAAQdXBkYXRlX2FwaV9wcmljZQAAAAMAAAAAAAAACHByb3ZpZGVyAAAAEwAAAAAAAAAGYXBpX2lkAAAAAAARAAAAAAAAAAluZXdfcHJpY2UAAAAAAAALAAAAAQAAA+kAAAACAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAAAAAAAQdXBncmFkZV9jb250cmFjdAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAJd2FzbV9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAAAIAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAARcmVnaXN0ZXJfcHJvdmlkZXIAAAAAAAACAAAAAAAAAAhwcm92aWRlcgAAABMAAAAAAAAADW1ldGFkYXRhX2hhc2gAAAAAAAPuAAAAIAAAAAEAAAPpAAAAAgAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==",
        "AAAAAAAAAAAAAAATZ2V0X3BsYXRmb3JtX2NvbmZpZwAAAAAAAAAAAQAAA+kAAAfQAAAADlBsYXRmb3JtQ29uZmlnAAAAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAYdXBkYXRlX3Byb3ZpZGVyX21ldGFkYXRhAAAAAgAAAAAAAAAIcHJvdmlkZXIAAAATAAAAAAAAAA1tZXRhZGF0YV9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAAAIAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=" ]),
      options
    )
  }
  public readonly fromJSON = {
    api: this.txFromJSON<Result<ApiProduct>>,
        admin: this.txFromJSON<Result<string>>,
        paused: this.txFromJSON<Result<boolean>>,
        get_api: this.txFromJSON<Result<ApiProduct>>,
        provider: this.txFromJSON<Result<ProviderProfile>>,
        initialize: this.txFromJSON<Result<void>>,
        set_paused: this.txFromJSON<Result<void>>,
        get_provider: this.txFromJSON<Result<ProviderProfile>>,
        register_api: this.txFromJSON<Result<void>>,
        payment_asset: this.txFromJSON<Result<string>>,
        pause_platform: this.txFromJSON<Result<void>>,
        set_api_active: this.txFromJSON<Result<void>>,
        set_api_status: this.txFromJSON<Result<void>>,
        unpause_platform: this.txFromJSON<Result<void>>,
        update_api_price: this.txFromJSON<Result<void>>,
        upgrade_contract: this.txFromJSON<Result<void>>,
        register_provider: this.txFromJSON<Result<void>>,
        get_platform_config: this.txFromJSON<Result<PlatformConfig>>,
        update_provider_metadata: this.txFromJSON<Result<void>>
  }
}