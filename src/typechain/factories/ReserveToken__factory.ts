/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ReserveToken, ReserveTokenInterface } from "../ReserveToken";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "DECIMALS",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "TOTAL_SUPPLY",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account_",
        type: "address",
      },
    ],
    name: "addFreezable",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burnFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "freezables",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "mintTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b50604080518082018252600b81526a55534420436c617373696360a81b602080830191825283518085019094526005845264555344434360d81b908401528151919291620000629160039162000081565b5080516200007890600490602084019062000081565b50505062000164565b8280546200008f9062000127565b90600052602060002090601f016020900481019282620000b35760008555620000fe565b82601f10620000ce57805160ff1916838001178555620000fe565b82800160010185558215620000fe579182015b82811115620000fe578251825591602001919060010190620000e1565b506200010c92915062000110565b5090565b5b808211156200010c576000815560010162000111565b600181811c908216806200013c57607f821691505b602082108114156200015e57634e487b7160e01b600052602260045260246000fd5b50919050565b61125e80620001746000396000f3fe608060405234801561001057600080fd5b50600436106101365760003560e01c80635bb9058b116100b257806395d89b4111610081578063a457c2d711610066578063a457c2d7146102cc578063a9059cbb146102df578063dd62ed3e146102f257600080fd5b806395d89b41146102b157806397304ced146102b957600080fd5b80635bb9058b1461020357806370a082311461026057806379cc679014610296578063902d55a5146102a957600080fd5b80632e0f26251161010957806339509351116100ee57806339509351146101b857806342966c68146101cb57806348422faa146101e057600080fd5b80632e0f2625146101a1578063313ce567146101a957600080fd5b806306fdde031461013b578063095ea7b31461015957806318160ddd1461017c57806323b872dd1461018e575b600080fd5b610143610338565b6040516101509190610e9d565b60405180910390f35b61016c610167366004610f39565b6103ca565b6040519015158152602001610150565b6002545b604051908152602001610150565b61016c61019c366004610f63565b6103e4565b610180600681565b60405160068152602001610150565b61016c6101c6366004610f39565b610408565b6101de6101d9366004610f9f565b610454565b005b61016c6101ee366004610fb8565b60056020526000908152604090205460ff1681565b6101de610211366004610fb8565b73ffffffffffffffffffffffffffffffffffffffff16600090815260056020526040902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00166001179055565b61018061026e366004610fb8565b73ffffffffffffffffffffffffffffffffffffffff1660009081526020819052604090205490565b6101de6102a4366004610f39565b610461565b61018061047a565b610143610494565b6101de6102c7366004610f9f565b6104a3565b61016c6102da366004610f39565b6104be565b61016c6102ed366004610f39565b610594565b610180610300366004610fda565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260016020908152604080832093909416825291909152205490565b6060600380546103479061100d565b80601f01602080910402602001604051908101604052809291908181526020018280546103739061100d565b80156103c05780601f10610395576101008083540402835291602001916103c0565b820191906000526020600020905b8154815290600101906020018083116103a357829003601f168201915b5050505050905090565b6000336103d88185856105a2565b60019150505b92915050565b6000336103f2858285610756565b6103fd85858561082d565b506001949350505050565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff871684529091528120549091906103d8908290869061044f908790611090565b6105a2565b61045e3382610aeb565b50565b61046c823383610756565b6104768282610aeb565b5050565b61048660066009611090565b61049190600a6111c8565b81565b6060600480546103479061100d565b61045e336104b983670de0b6b3a76400006111d4565b610ce1565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff8716845290915281205490919083811015610587576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760448201527f207a65726f00000000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b6103fd82868684036105a2565b6000336103d881858561082d565b73ffffffffffffffffffffffffffffffffffffffff8316610644576040517f08c379a0000000000000000000000000000000000000000000000000000000008152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460448201527f7265737300000000000000000000000000000000000000000000000000000000606482015260840161057e565b73ffffffffffffffffffffffffffffffffffffffff82166106e7576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f20616464726560448201527f7373000000000000000000000000000000000000000000000000000000000000606482015260840161057e565b73ffffffffffffffffffffffffffffffffffffffff83811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591015b60405180910390a3505050565b73ffffffffffffffffffffffffffffffffffffffff8381166000908152600160209081526040808320938616835292905220547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8114610827578181101561081a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e6365000000604482015260640161057e565b61082784848484036105a2565b50505050565b73ffffffffffffffffffffffffffffffffffffffff83166108d0576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f20616460448201527f6472657373000000000000000000000000000000000000000000000000000000606482015260840161057e565b73ffffffffffffffffffffffffffffffffffffffff8216610973576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201527f6573730000000000000000000000000000000000000000000000000000000000606482015260840161057e565b61097e838383610e0d565b73ffffffffffffffffffffffffffffffffffffffff831660009081526020819052604090205481811015610a34576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e742065786365656473206260448201527f616c616e63650000000000000000000000000000000000000000000000000000606482015260840161057e565b73ffffffffffffffffffffffffffffffffffffffff808516600090815260208190526040808220858503905591851681529081208054849290610a78908490611090565b925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610ade91815260200190565b60405180910390a3610827565b73ffffffffffffffffffffffffffffffffffffffff8216610b8e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f2061646472657360448201527f7300000000000000000000000000000000000000000000000000000000000000606482015260840161057e565b610b9a82600083610e0d565b73ffffffffffffffffffffffffffffffffffffffff821660009081526020819052604090205481811015610c50576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e60448201527f6365000000000000000000000000000000000000000000000000000000000000606482015260840161057e565b73ffffffffffffffffffffffffffffffffffffffff83166000908152602081905260408120838303905560028054849290610c8c908490611211565b909155505060405182815260009073ffffffffffffffffffffffffffffffffffffffff8516907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef90602001610749565b505050565b73ffffffffffffffffffffffffffffffffffffffff8216610d5e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604482015260640161057e565b610d6a60008383610e0d565b8060026000828254610d7c9190611090565b909155505073ffffffffffffffffffffffffffffffffffffffff821660009081526020819052604081208054839290610db6908490611090565b909155505060405181815273ffffffffffffffffffffffffffffffffffffffff8316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b73ffffffffffffffffffffffffffffffffffffffff821660009081526005602052604090205460ff1615610cdc576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600660248201527f46524f5a454e0000000000000000000000000000000000000000000000000000604482015260640161057e565b600060208083528351808285015260005b81811015610eca57858101830151858201604001528201610eae565b81811115610edc576000604083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016929092016040019392505050565b803573ffffffffffffffffffffffffffffffffffffffff81168114610f3457600080fd5b919050565b60008060408385031215610f4c57600080fd5b610f5583610f10565b946020939093013593505050565b600080600060608486031215610f7857600080fd5b610f8184610f10565b9250610f8f60208501610f10565b9150604084013590509250925092565b600060208284031215610fb157600080fd5b5035919050565b600060208284031215610fca57600080fd5b610fd382610f10565b9392505050565b60008060408385031215610fed57600080fd5b610ff683610f10565b915061100460208401610f10565b90509250929050565b600181811c9082168061102157607f821691505b6020821081141561105b577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600082198211156110a3576110a3611061565b500190565b600181815b8085111561110157817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff048211156110e7576110e7611061565b808516156110f457918102915b93841c93908002906110ad565b509250929050565b600082611118575060016103de565b81611125575060006103de565b816001811461113b576002811461114557611161565b60019150506103de565b60ff84111561115657611156611061565b50506001821b6103de565b5060208310610133831016604e8410600b8410161715611184575081810a6103de565b61118e83836110a8565b807fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff048211156111c0576111c0611061565b029392505050565b6000610fd38383611109565b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff048311821515161561120c5761120c611061565b500290565b60008282101561122357611223611061565b50039056fea26469706673582212200e3c341726c0be1b9831448cd27ce3a3b253dd0c3aa16b71bafa21c2cb888d4a64736f6c634300080a0033";

type ReserveTokenConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ReserveTokenConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ReserveToken__factory extends ContractFactory {
  constructor(...args: ReserveTokenConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ReserveToken> {
    return super.deploy(overrides || {}) as Promise<ReserveToken>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): ReserveToken {
    return super.attach(address) as ReserveToken;
  }
  connect(signer: Signer): ReserveToken__factory {
    return super.connect(signer) as ReserveToken__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ReserveTokenInterface {
    return new utils.Interface(_abi) as ReserveTokenInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ReserveToken {
    return new Contract(address, _abi, signerOrProvider) as ReserveToken;
  }
}
