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
import { FunctionFragment, Result } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export type StateConfigStruct = {
  sources: BytesLike[];
  constants: BigNumberish[];
};

export type StateConfigStructOutput = [string[], BigNumber[]] & {
  sources: string[];
  constants: BigNumber[];
};

export type BoundsStruct = {
  entrypoint: BigNumberish;
  minFinalStackIndex: BigNumberish;
  stackIndex: BigNumberish;
  stackLength: BigNumberish;
  argumentsLength: BigNumberish;
  storageLength: BigNumberish;
  opcodesLength: BigNumberish;
};

export type BoundsStructOutput = [
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber
] & {
  entrypoint: BigNumber;
  minFinalStackIndex: BigNumber;
  stackIndex: BigNumber;
  stackLength: BigNumber;
  argumentsLength: BigNumber;
  storageLength: BigNumber;
  opcodesLength: BigNumber;
};

export interface AllStandardOpsStateBuilderInterface extends utils.Interface {
  functions: {
    "buildState(address,(bytes[],uint256[]),(uint256,uint256,uint256,uint256,uint256,uint256,uint256)[])": FunctionFragment;
    "ensureIntegrity((bytes[],uint256[]),(uint256,uint256,uint256,uint256,uint256,uint256,uint256))": FunctionFragment;
    "ptrSource(bytes,bytes)": FunctionFragment;
    "stackPopsFnPtrs()": FunctionFragment;
    "stackPushesFnPtrs()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "buildState",
    values: [string, StateConfigStruct, BoundsStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "ensureIntegrity",
    values: [StateConfigStruct, BoundsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "ptrSource",
    values: [BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "stackPopsFnPtrs",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "stackPushesFnPtrs",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "buildState", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "ensureIntegrity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "ptrSource", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "stackPopsFnPtrs",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "stackPushesFnPtrs",
    data: BytesLike
  ): Result;

  events: {};
}

export interface AllStandardOpsStateBuilder extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: AllStandardOpsStateBuilderInterface;

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
    buildState(
      vm_: string,
      config_: StateConfigStruct,
      boundss_: BoundsStruct[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    ensureIntegrity(
      stateConfig_: StateConfigStruct,
      bounds_: BoundsStruct,
      overrides?: CallOverrides
    ): Promise<[void]>;

    ptrSource(
      packedFnPtrs_: BytesLike,
      source_: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string]>;

    stackPopsFnPtrs(overrides?: CallOverrides): Promise<[string]>;

    stackPushesFnPtrs(overrides?: CallOverrides): Promise<[string]>;
  };

  buildState(
    vm_: string,
    config_: StateConfigStruct,
    boundss_: BoundsStruct[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  ensureIntegrity(
    stateConfig_: StateConfigStruct,
    bounds_: BoundsStruct,
    overrides?: CallOverrides
  ): Promise<void>;

  ptrSource(
    packedFnPtrs_: BytesLike,
    source_: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  stackPopsFnPtrs(overrides?: CallOverrides): Promise<string>;

  stackPushesFnPtrs(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    buildState(
      vm_: string,
      config_: StateConfigStruct,
      boundss_: BoundsStruct[],
      overrides?: CallOverrides
    ): Promise<string>;

    ensureIntegrity(
      stateConfig_: StateConfigStruct,
      bounds_: BoundsStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    ptrSource(
      packedFnPtrs_: BytesLike,
      source_: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    stackPopsFnPtrs(overrides?: CallOverrides): Promise<string>;

    stackPushesFnPtrs(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    buildState(
      vm_: string,
      config_: StateConfigStruct,
      boundss_: BoundsStruct[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    ensureIntegrity(
      stateConfig_: StateConfigStruct,
      bounds_: BoundsStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    ptrSource(
      packedFnPtrs_: BytesLike,
      source_: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    stackPopsFnPtrs(overrides?: CallOverrides): Promise<BigNumber>;

    stackPushesFnPtrs(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    buildState(
      vm_: string,
      config_: StateConfigStruct,
      boundss_: BoundsStruct[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    ensureIntegrity(
      stateConfig_: StateConfigStruct,
      bounds_: BoundsStruct,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    ptrSource(
      packedFnPtrs_: BytesLike,
      source_: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    stackPopsFnPtrs(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    stackPushesFnPtrs(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
