/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Bytecode, BytecodeInterface } from "../Bytecode";

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
];

const _bytecode =
  "0x60566037600b82828239805160001a607314602a57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea2646970667358221220fe4d91aea5f0bdf1697c40ea47b8540670e8d729e48a81806f77b0cfdd235ce464736f6c634300080a0033";

type BytecodeConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: BytecodeConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Bytecode__factory extends ContractFactory {
  constructor(...args: BytecodeConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Bytecode> {
    return super.deploy(overrides || {}) as Promise<Bytecode>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): Bytecode {
    return super.attach(address) as Bytecode;
  }
  connect(signer: Signer): Bytecode__factory {
    return super.connect(signer) as Bytecode__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BytecodeInterface {
    return new utils.Interface(_abi) as BytecodeInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Bytecode {
    return new Contract(address, _abi, signerOrProvider) as Bytecode;
  }
}
