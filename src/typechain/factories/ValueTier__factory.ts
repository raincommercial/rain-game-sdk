/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ValueTier, ValueTierInterface } from "../ValueTier";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_size",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_start",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_end",
        type: "uint256",
      },
    ],
    name: "InvalidCodeAtRange",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "pointer",
        type: "address",
      },
    ],
    name: "InitializeValueTier",
    type: "event",
  },
  {
    inputs: [],
    name: "tierValues",
    outputs: [
      {
        internalType: "uint256[8]",
        name: "tierValues_",
        type: "uint256[8]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506102de806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c806370230b3914610030575b600080fd5b61003861004e565b60405161004591906101d0565b60405180910390f35b6100566101b1565b6000546100789073ffffffffffffffffffffffffffffffffffffffff16610090565b80602001905181019061008b9190610202565b905090565b60606100be8260017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6100c4565b92915050565b6060833b806100e35750506040805160208101909152600081526101aa565b808411156101015750506040805160208101909152600081526101aa565b83831015610150576040517f2c4a89fa00000000000000000000000000000000000000000000000000000000815260048101829052602481018590526044810184905260640160405180910390fd5b83830384820360008282106101655782610167565b815b60408051603f83017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0168101909152818152955090508087602087018a3c505050505b9392505050565b6040518061010001604052806008906020820280368337509192915050565b6101008101818360005b60088110156101f95781518352602092830192909101906001016101da565b50505092915050565b600061010080838503121561021657600080fd5b83601f84011261022557600080fd5b60405181810181811067ffffffffffffffff8211171561026e577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b60405290830190808583111561028357600080fd5b845b8381101561029d578051825260209182019101610285565b50909594505050505056fea26469706673582212204e41ca5a54a678ea277c59789ee64d88176e6ffd2265250fa0d4aef884a21c7164736f6c634300080a0033";

type ValueTierConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ValueTierConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ValueTier__factory extends ContractFactory {
  constructor(...args: ValueTierConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ValueTier> {
    return super.deploy(overrides || {}) as Promise<ValueTier>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): ValueTier {
    return super.attach(address) as ValueTier;
  }
  connect(signer: Signer): ValueTier__factory {
    return super.connect(signer) as ValueTier__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ValueTierInterface {
    return new utils.Interface(_abi) as ValueTierInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ValueTier {
    return new Contract(address, _abi, signerOrProvider) as ValueTier;
  }
}
