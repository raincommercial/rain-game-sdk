/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export type ERC20BalanceTierConfigStruct = {
  erc20: string;
  tierValues: BigNumberish[];
};

export type ERC20BalanceTierConfigStructOutput = [string, BigNumber[]] & {
  erc20: string;
  tierValues: BigNumber[];
};

export interface ERC20BalanceTierInterface extends utils.Interface {
  functions: {
    "initialize((address,uint256[8]))": FunctionFragment;
    "report(address)": FunctionFragment;
    "setTier(address,uint256,bytes)": FunctionFragment;
    "tierValues()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "initialize",
    values: [ERC20BalanceTierConfigStruct]
  ): string;
  encodeFunctionData(functionFragment: "report", values: [string]): string;
  encodeFunctionData(
    functionFragment: "setTier",
    values: [string, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "tierValues",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "report", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setTier", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "tierValues", data: BytesLike): Result;

  events: {
    "Initialize(address,address)": EventFragment;
    "InitializeValueTier(address,address)": EventFragment;
    "TierChange(address,address,uint256,uint256,bytes)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Initialize"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "InitializeValueTier"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TierChange"): EventFragment;
}

export type InitializeEvent = TypedEvent<
  [string, string],
  { sender: string; erc20: string }
>;

export type InitializeEventFilter = TypedEventFilter<InitializeEvent>;

export type InitializeValueTierEvent = TypedEvent<
  [string, string],
  { sender: string; pointer: string }
>;

export type InitializeValueTierEventFilter =
  TypedEventFilter<InitializeValueTierEvent>;

export type TierChangeEvent = TypedEvent<
  [string, string, BigNumber, BigNumber, string],
  {
    sender: string;
    account: string;
    startTier: BigNumber;
    endTier: BigNumber;
    data: string;
  }
>;

export type TierChangeEventFilter = TypedEventFilter<TierChangeEvent>;

export interface ERC20BalanceTier extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ERC20BalanceTierInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    initialize(
      config_: ERC20BalanceTierConfigStruct,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    report(account_: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    setTier(
      arg0: string,
      arg1: BigNumberish,
      arg2: BytesLike,
      overrides?: CallOverrides
    ): Promise<[void]>;

    tierValues(
      overrides?: CallOverrides
    ): Promise<[BigNumber[]] & { tierValues_: BigNumber[] }>;
  };

  initialize(
    config_: ERC20BalanceTierConfigStruct,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  report(account_: string, overrides?: CallOverrides): Promise<BigNumber>;

  setTier(
    arg0: string,
    arg1: BigNumberish,
    arg2: BytesLike,
    overrides?: CallOverrides
  ): Promise<void>;

  tierValues(overrides?: CallOverrides): Promise<BigNumber[]>;

  callStatic: {
    initialize(
      config_: ERC20BalanceTierConfigStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    report(account_: string, overrides?: CallOverrides): Promise<BigNumber>;

    setTier(
      arg0: string,
      arg1: BigNumberish,
      arg2: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    tierValues(overrides?: CallOverrides): Promise<BigNumber[]>;
  };

  filters: {
    "Initialize(address,address)"(
      sender?: null,
      erc20?: null
    ): InitializeEventFilter;
    Initialize(sender?: null, erc20?: null): InitializeEventFilter;

    "InitializeValueTier(address,address)"(
      sender?: null,
      pointer?: null
    ): InitializeValueTierEventFilter;
    InitializeValueTier(
      sender?: null,
      pointer?: null
    ): InitializeValueTierEventFilter;

    "TierChange(address,address,uint256,uint256,bytes)"(
      sender?: null,
      account?: null,
      startTier?: null,
      endTier?: null,
      data?: null
    ): TierChangeEventFilter;
    TierChange(
      sender?: null,
      account?: null,
      startTier?: null,
      endTier?: null,
      data?: null
    ): TierChangeEventFilter;
  };

  estimateGas: {
    initialize(
      config_: ERC20BalanceTierConfigStruct,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    report(account_: string, overrides?: CallOverrides): Promise<BigNumber>;

    setTier(
      arg0: string,
      arg1: BigNumberish,
      arg2: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tierValues(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    initialize(
      config_: ERC20BalanceTierConfigStruct,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    report(
      account_: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    setTier(
      arg0: string,
      arg1: BigNumberish,
      arg2: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tierValues(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
