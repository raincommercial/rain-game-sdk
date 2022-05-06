import {
  Signer,
  BytesLike,
  BigNumber,
  BigNumberish,
  ContractTransaction,
} from 'ethers';
import { TxOverrides, ReadTxOverrides, FactoryContract } from 'rain-sdk';

import { Rain1155__factory } from './typechain';
import { AddressBook } from './addresses';
import { StateConfigStruct } from './typechain/Rain1155';
import {
  concat,
  Conditions,
  getCondition,
  matchPattern,
  op,
  Opcode,
  patternLengths,
  Type,
  VMState,
} from './utils';

/**
 * @public
 * A class for deploying and calling methods in Rain1155 contract.
 *
 *
 * @remarks
 *   This class provides an easy way to deploy and interact with Rain1155 contracts
 *
 * @example
 * ```typescript
 * import { Rain1155 } from 'rain-sdk'
 *
 * // To deploy a new Rain1155, pass an ethers.js Signerand the config for the Rain1155.
 * const new Rain1155 = await Rain1155.deploy(signer, args)
 *
 * // To connect to an existing Rain1155 just pass the address and an ethers.js Signer.
 * const existing Rain1155 = new Rain1155(address, signer)
 *
 * // Once you have a Rain1155, you can call the smart contract methods:
 * ```
 *
 */

class ScriptError extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ScriptError.prototype);
  }

  error(type: string, attribute: string) {
    return `ScriptError: type "${type}" is missing "${attribute}".`;
  }
}

const generatePriceScript = (prices: price[]): [VMState, string[]] => {
  let error = new ScriptError('Invalid Script parameters.');
  let pos = -1;
  let currencies: string[] = [];
  let sources: BytesLike[] = [];
  let constants: BigNumberish[] = [];
  let i;
  if (prices.length === 0) {
    let state: VMState = {
      sources: [concat([op(Opcode.SKIP)])],
      constants: constants,
      stackLength: 1,
      argumentsLength: 0,
    };
    return [state, currencies];
  }
  for (i = 0; i < prices.length; i++) {
    let obj = prices[i];
    if (obj.currency.type === Type.ERC1155) {
      sources.push(
        concat([
          op(Opcode.VAL, ++pos),
          op(Opcode.VAL, ++pos),
          op(Opcode.VAL, ++pos),
        ])
      );
      constants.push(obj.currency.type);
      if (obj.currency.tokenId) {
        constants.push(obj.currency.tokenId);
      } else throw error.error('ERC1155', 'currency.tokenId');
      constants.push(obj.amount);
    } else {
      sources.push(concat([op(Opcode.VAL, ++pos), op(Opcode.VAL, ++pos)]));
      constants.push(obj.currency.type);
      constants.push(obj.amount);
    }
    currencies.push(obj.currency.address);
  }
  let state: VMState = {
    sources: sources,
    constants: constants,
    stackLength: 3,
    argumentsLength: 0,
  };
  return [state, currencies];
};

const generatePriceConfig = (
  priceScritp: VMState,
  currencies: string[]
): price[] => {
  let prices: price[] = [];
  let pos = -1;
  for (let i = 0; i < priceScritp.sources.length; i++) {
    let source: BytesLike = priceScritp.sources[i];
    if (source.length === 4) {
      prices.push({
        currency: {
          type: Number(priceScritp.constants[++pos]),
          address: currencies[i],
        },
        amount: BigNumber.from(priceScritp.constants[++pos]),
      });
    } else if (source.length === 6) {
      prices.push({
        currency: {
          type: Number(priceScritp.constants[++pos]),
          address: currencies[i],
          tokenId: priceScritp.constants[++pos],
        },
        amount: BigNumber.from(priceScritp.constants[++pos]),
      });
    }
  }
  return prices;
};

const generateCanMintScript = (conditions: condition[]): VMState => {
  let error = new ScriptError('Invalid Script parameters.');
  let pos = -1;
  let sources: Uint8Array[] = [];
  let constants: BigNumberish[] = [];
  let i;
  let stackLenght = 3;

  for (i = 0; i < conditions.length; i++) {
    let condition = conditions[i];
    if (condition.type === Conditions.NONE) {
      constants.push(1);
      sources.push(op(Opcode.VAL, ++pos));
    } else if (condition.type === Conditions.BLOCK_NUMBER) {
      if (condition.blockNumber) {
        constants.push(condition.blockNumber);
      } else throw error.error('BLOCK_NUMBER', 'blockNumber');
      sources.push(op(Opcode.BLOCK_NUMBER));
      sources.push(op(Opcode.VAL, ++pos));
      sources.push(op(Opcode.GREATER_THAN));
    } else if (condition.type === Conditions.BALANCE_TIER) {
      if (condition.tierAddress) {
        constants.push(condition.tierAddress);
      } else throw error.error('BALANCE_TIER', 'tierAddress');
      if (condition.tierCondition) {
        constants.push(condition.tierCondition);
      } else throw error.error('BALANCE_TIER', 'tierCondition');
      sources.push(op(Opcode.VAL, ++pos));
      sources.push(op(Opcode.ACCOUNT));
      sources.push(op(Opcode.REPORT));
      sources.push(op(Opcode.BLOCK_NUMBER));
      sources.push(op(Opcode.REPORT_AT_BLOCK));
      sources.push(op(Opcode.VAL, ++pos));
      sources.push(op(Opcode.GREATER_THAN));
    } else if (condition.type === Conditions.ERC20BALANCE) {
      if (condition.address) {
        constants.push(condition.address);
      } else throw error.error('ERC20BALANCE', 'address');
      if (condition.balance) {
        constants.push(condition.balance);
      } else throw error.error('ERC20BALANCE', 'balance');
      sources.push(op(Opcode.VAL, ++pos));
      sources.push(op(Opcode.ACCOUNT));
      sources.push(op(Opcode.IERC20_BALANCE_OF));
      sources.push(op(Opcode.VAL, ++pos));
      sources.push(op(Opcode.GREATER_THAN));
    } else if (condition.type === Conditions.ERC721BALANCE) {
      if (condition.address) {
        constants.push(condition.address);
      } else throw error.error('ERC721BALANCE', 'address');
      if (condition.balance) {
        constants.push(condition.balance);
      } else throw error.error('ERC721BALANCE', 'balance');
      sources.push(op(Opcode.VAL, ++pos));
      sources.push(op(Opcode.ACCOUNT));
      sources.push(op(Opcode.IERC721_BALANCE_OF));
      sources.push(op(Opcode.VAL, ++pos));
      sources.push(op(Opcode.GREATER_THAN));
    } else if (condition.type === Conditions.ERC1155BALANCE) {
      if (condition.address) {
        constants.push(condition.address);
      } else throw error.error('ERC1155BALANCE', 'address');
      if (condition.id) {
        constants.push(condition.id);
      } else throw error.error('ERC1155BALANCE', 'id');
      if (condition.balance) {
        constants.push(condition.balance);
      } else throw error.error('ERC1155BALANCE', 'balance');
      sources.push(op(Opcode.VAL, ++pos));
      sources.push(op(Opcode.ACCOUNT));
      sources.push(op(Opcode.VAL, ++pos));
      sources.push(op(Opcode.IERC1155_BALANCE_OF));
      sources.push(op(Opcode.VAL, ++pos));
      sources.push(op(Opcode.GREATER_THAN));
    }
  }
  sources.push(op(Opcode.EVERY, conditions.length));

  let state: VMState = {
    sources: [concat(sources)],
    constants: constants,
    stackLength: stackLenght + conditions.length,
    argumentsLength: 0,
  };
  return state;
};

const generateCanMintConfig = (canMintScript: VMState): condition[] => {
  let conditions: condition[] = [];
  let sources = canMintScript.sources[0];
  let constants = canMintScript.constants;
  let opcodes: number[] = [];
  for (let i = 0; i < sources.length - 2; i++) {
    opcodes.push(parseInt(sources[i].toString()));
  }
  let len = opcodes.length;
  let start = 0;
  while (len > 0) {
    for (let j = patternLengths.length - 1; j >= 0; j--) {
      // console.log(opcodes.length);
      if (opcodes.length >= patternLengths[j]) {
        const [new_start, opcode] = matchPattern(
          opcodes,
          start,
          patternLengths[j]
        );
        if (new_start !== start) {
          conditions.push(
            getCondition(opcodes.slice(start, new_start), constants)
          );
          start = new_start;
          len = len - patternLengths[j];
          break;
        }
      }
    }
    // if (opcodes.length >= patternLengths[4]) {
    //   const [new_start, opcode] = matchPattern(
    //     opcodes,
    //     start,
    //     patternLengths[4]
    //   );
    //   if (new_start !== start) {
    //     start = new_start;
    //     console.log(opcode);
    //     len = len - patternLengths[4];
    //     continue;
    //   }
    // }
    // if (opcodes.length >= patternLengths[3]) {
    //   const [new_start, opcode] = matchPattern(
    //     opcodes,
    //     start,
    //     patternLengths[3]
    //   );
    //   if (new_start !== start) {
    //     start = new_start;
    //     console.log(opcode);
    //     len = len - patternLengths[3];
    //     continue;
    //   }
    // }
    // if (opcodes.length >= patternLengths[2]) {
    //   const [new_start, opcode] = matchPattern(
    //     opcodes,
    //     start,
    //     patternLengths[2]
    //   );
    //   if (new_start !== start) {
    //     start = new_start;
    //     console.log(opcode);
    //     len = len - patternLengths[2];
    //     continue;
    //   }
    // }
    // if (opcodes.length >= patternLengths[1]) {
    //   const [new_start, opcode] = matchPattern(
    //     opcodes,
    //     start,
    //     patternLengths[1]
    //   );
    //   if (new_start !== start) {
    //     start = new_start;
    //     console.log(opcode);
    //     len = len - patternLengths[1];
    //     continue;
    //   }
    // }
    // if (opcodes.length >= patternLengths[0]) {
    //   const [new_start, opcode] = matchPattern(
    //     opcodes,
    //     start,
    //     patternLengths[0]
    //   );
    //   if (new_start !== start) {
    //     start = new_start;
    //     console.log(opcode);
    //     len = len - patternLengths[0];
    //     continue;
    //   }
    // }
  }
  return conditions;
};
export class Rain1155 extends FactoryContract {
  protected static readonly nameBookReference = 'Rain1155';

  /**
   * Constructs a new Rain1155 from a known address.
   *
   * @param address - The address of the Rain1155 contract
   * @param signer - An ethers.js Signer
   * @returns A new Rain1155 instance
   *
   */
  constructor(address: string, signer: Signer) {
    super(address, signer);
    const _rain1155 = Rain1155__factory.connect(address, signer);

    this.assets = _rain1155.assets;
    this.balanceOf = _rain1155.balanceOf;
    this.balanceOfBatch = _rain1155.balanceOfBatch;
    this.canMint = _rain1155.canMint;
    this.createNewAsset = _rain1155.createNewAsset;
    this.getAssetPrice = _rain1155.getAssetPrice;
    this.isApprovedForAll = _rain1155.isApprovedForAll;
    this.mintAssets = _rain1155.mintAssets;
    this.safeBatchTransferFrom = _rain1155.safeBatchTransferFrom;
    this.safeTransferFrom = _rain1155.safeTransferFrom;
    this.setApprovalForAll = _rain1155.setApprovalForAll;
    this.supportsInterface = _rain1155.supportsInterface;
    this.totalAssets = _rain1155.totalAssets;
    this.uri = _rain1155.uri;
  }

  public readonly connect = (signer: Signer): Rain1155 => {
    return new Rain1155(this.address, signer);
  };
  public static getBookAddress(chainId: number): string {
    return AddressBook.getAddressesForChainId(chainId)[this.nameBookReference];
  }

  public readonly generatePriceScript = generatePriceScript;
  public readonly generatePriceConfig = generatePriceConfig;

  public readonly generateCanMintScript = generateCanMintScript;
  public readonly generateCanMintConfig = generateCanMintConfig;

  public readonly assets: (
    arg0: BigNumberish,
    overrides?: ReadTxOverrides
  ) => Promise<AssetDetails>;

  public readonly balanceOf: (
    account: string,
    id: BigNumberish,
    overrides?: ReadTxOverrides
  ) => Promise<BigNumber>;

  public readonly balanceOfBatch: (
    accounts: string[],
    ids: BigNumberish[],
    overrides?: ReadTxOverrides
  ) => Promise<BigNumber[]>;

  public readonly canMint: (
    _assetId: BigNumberish,
    _account: string,
    overrides?: ReadTxOverrides
  ) => Promise<boolean>;

  public readonly createNewAsset: (
    _config: AssetConfig,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly getAssetPrice: (
    _assetId: BigNumberish,
    _paymentToken: string,
    _units: BigNumberish,
    overrides?: ReadTxOverrides
  ) => Promise<BigNumber[]>;

  public readonly isApprovedForAll: (
    account: string,
    operator: string,
    overrides?: ReadTxOverrides
  ) => Promise<boolean>;

  public readonly mintAssets: (
    _assetId: BigNumberish,
    _units: BigNumberish,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly safeBatchTransferFrom: (
    from: string,
    to: string,
    ids: BigNumberish[],
    amounts: BigNumberish[],
    data: BytesLike,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly safeTransferFrom: (
    from: string,
    to: string,
    id: BigNumberish,
    amount: BigNumberish,
    data: BytesLike,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly setApprovalForAll: (
    operator: string,
    approved: boolean,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly supportsInterface: (
    interfaceId: BytesLike,
    overrides?: ReadTxOverrides
  ) => Promise<boolean>;

  public readonly totalAssets: (
    overrides?: ReadTxOverrides
  ) => Promise<BigNumber>;

  public readonly uri: (
    _tokenId: BigNumberish,
    overrides?: ReadTxOverrides
  ) => Promise<string>;
}

export type AssetDetails = {
  lootBoxId: BigNumber;
  id: BigNumber;
  priceConfig: State;
  canMintConfig: State;
  recepient: string;
  tokenURI: string;
};

export type AssetConfig = {
  name: string;
  description: string;
  lootBoxId: BigNumber;
  priceConfig: StateConfigStruct;
  canMintConfig: StateConfigStruct;
  currencies: string[];
  recepient: string;
  tokenURI: string;
};

// TODO: Update the rain-sdk to use the correctState
export type State = {
  stackIndex: BigNumber;
  stack: BigNumber[];
  sources: string[];
  constants: BigNumber[];
  arguments: BigNumber[];
};

export type currency = {
  type: number;
  address: string;
  tokenId?: BigNumberish;
};

export type price = {
  currency: currency;
  amount: BigNumber;
};

export type condition = {
  type: number;
  blockNumber?: number;
  tierAddress?: string;
  tierCondition?: number;
  address?: string;
  balance?: BigNumber;
  id?: BigNumber;
};
