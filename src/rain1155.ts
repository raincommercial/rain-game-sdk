/* eslint-disable prettier/prettier */
import {
  Signer,
  BytesLike,
  BigNumber,
  BigNumberish,
  ContractTransaction,
  ethers,
} from 'ethers';
import { TxOverrides, ReadTxOverrides, RainContract, ERC721, ERC20, ERC1155 } from 'rain-sdk';

import { Rain1155__factory } from './typechain';
import { AddressBook } from './addresses';
import { StateConfigStruct } from './typechain/Rain1155';
import {
  concat,
  op,
  Opcode,
  VMState,
  getCanMintConfig
} from './utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

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
 * // To connect to an existing Rain1155 just pass the address and an ethers.js Signer.
 * const existing Rain1155 = new Rain1155(address, signer)
 *
 * // Once you have a Rain1155, you can call the smart contract methods:
 * ```
 *
 */

/**
 * Custom error class
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

export enum Type {
  ERC20,
  ERC1155
}

export enum Conditions {
  NONE,
  BLOCK_NUMBER,
  BALANCE_TIER,
  ERC20BALANCE,
  ERC721BALANCE,
  ERC1155BALANCE,
}

/**
 * 
 * @param prices Array of type price
 * @returns VMState: StateConfig, string[]: array of token addresses.
 */
const generatePriceScript = (prices: price[]): [VMState, string[]] => {
  let error = new ScriptError('Invalid Script parameters.');
  let pos = -1; // setting pos(position) variable tp -1
  let currencies: string[] = [];
  let sources: BytesLike[] = [];
  let constants: BigNumberish[] = [];
  let i;
  if (prices.length === 0) {// If empty config received return source with one opcode and empty currencies arary.
    let state: VMState = {
      sources: [concat([op(Opcode.SKIP)])],
      constants: constants,
      stackLength: 1,
      argumentsLength: 0,
    };
    return [state, currencies];
  }
  for (i = 0; i < prices.length; i++) { // else loop over the prices array
    let obj = prices[i];
    if (obj.currency.type === Type.ERC1155) { // check price type
      sources.push(
        concat([
          op(Opcode.VAL, ++pos),
          op(Opcode.VAL, ++pos),
          op(Opcode.VAL, ++pos),
          op(Opcode.CURRENT_UNITS),
          op(Opcode.MUL, 2)
        ])
      ); // pushed 3 items in constants so used ++pos 3 times, then (Opcode.VAL, pos) will point to correct constant
      constants.push(obj.currency.type); // push currency type in constants
      if (obj.currency.tokenId) {
        constants.push(obj.currency.tokenId); // push tokenId in constants
      } else throw error.error('ERC1155', 'currency.tokenId');
      constants.push(obj.amount); // push amount in constants
    } else { // ERC20 type 
      sources.push(
        concat([
          op(Opcode.VAL, ++pos),
          op(Opcode.VAL, ++pos),
          op(Opcode.CURRENT_UNITS),
          op(Opcode.MUL, 2)
        ])
      ); // pushed 2 items in constants so used ++pos 2 times, then (Opcode.VAL, pos) will point to correct constant
      constants.push(obj.currency.type); // push currency type in constants
      constants.push(obj.amount); // push amount in constants
    }
    currencies.push(obj.currency.address);
  }
  let state: VMState = {
    sources: sources,
    constants: constants,
    stackLength: 5,
    argumentsLength: 0,
  };
  return [state, currencies]; // return the stateConfig and currencies[]
};

/**
 * 
 * @param priceScritp StateConfig generated by generatePriceScript()
 * @param currencies array of token addresses
 * @returns array of priceConfig
 */
const generatePriceConfig = (
  priceScritp: VMState,
  currencies: string[]
): price[] => {

  let prices: price[] = [];
  let pos = -1;
  for (let i = 0; i < priceScritp.sources.length; i++) {
    let source: BytesLike = ethers.utils.arrayify(priceScritp.sources[i]); // Convert the bytesArray to Uint8Array
    if (source.length === 4) { // ERC20 price
      prices.push({
        currency: {
          type: Number(priceScritp.constants[++pos]),
          address: currencies[i],
        },
        amount: BigNumber.from(priceScritp.constants[++pos]),
      });
    } else if (source.length === 6) { // ERC1155 price
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


/**
 * 
 * @param conditions array of conditions
 * @returns StateConfig for canMint
 */
const generateCanMintScript = (conditionsGroup: condition[][]): VMState => {
  let error = new ScriptError('Invalid Script parameters.');
  let pos = -1;
  let sources: Uint8Array[] = [];
  let constants: BigNumberish[] = [];
  let i;
  let stackLenght = 3; // minimum stackLenght required for one binary opration in VM
  let outerArrIterator;
  let totalStackLength = 0;
  for (outerArrIterator = 0; outerArrIterator < conditionsGroup.length; outerArrIterator++) {
    const conditions = conditionsGroup[outerArrIterator];
    for (i = 0; i < conditions.length; i++) { // Loop over conditions
      let condition = conditions[i];
      if (condition.type === Conditions.NONE) { // No condition
        constants.push(1); // push 1 in constants, will return true for Every OP in the end
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
    sources.push(op(Opcode.EVERY, conditions.length)); // EVERY opcode to check  all conditions within this group are true
    totalStackLength += conditions.length;
  }
  sources.push(op(Opcode.ANY, conditionsGroup.length)); // Last OP as ANY to check any of the above condition group is true
  // console.log("SOURCES = ", sources);
  let state: VMState = {
    sources: [concat(sources)],
    constants: constants,

    stackLength: stackLenght + totalStackLength,
    argumentsLength: 0,
  };
  // console.log("STATE = ", state);
  return state;
};

/**
 * 
 * @param canMintScript StateConfig generated by generateCanMintScript
 * @returns array of conditions
 */
 const generateCanMintConfig = (canMintScript: VMState): condition[][] => {
  let conditions: condition[][] = [];
  let sources = ethers.utils.arrayify(canMintScript.sources[0]); // Convert from BytesArray to Uint8Array
  let constants = canMintScript.constants;
  let opcodes: number[][] = [[]];
  let opcodeCounter = 0;
  for (let i = 0; i < sources.length - 2; i++) { // convert Uint8Array to number[]
    let op = parseInt(sources[i].toString());
    if (!(i % 2)) {
      if (op == Opcode.EVERY) { // If EVERY opcode found, split the current opcode array and increment the index of sources by 1
        conditions.push(getCanMintConfig(opcodes[opcodeCounter], constants));
        opcodes[++opcodeCounter] = [];      
        i++;
        continue;
      }
    }    
    // If a normal opcode, then push it directly.
    opcodes[opcodeCounter].push(op);        
  }
  return conditions;
};


const isERC721 = async (address: string, signer: SignerWithAddress): Promise<boolean> => {
  let erc721 = new ERC721(address, signer);
  return await erc721.supportsInterface("0x80ac58cd");
}

const isERC1155 = async (address: string, signer: SignerWithAddress): Promise<boolean> => {
  let erc1155 = new ERC1155(address, signer);
  return await erc1155.supportsInterface("0xd9b67a26");
}

const isERC20 = async (address: string, signer: SignerWithAddress): Promise<boolean> => {
  let erc20 = new ERC20(address, signer);
  let balance;

  try {
    let name = await erc20.name()
    let symbol = await erc20.symbol()
    let decimals = await erc20.decimals()
    balance = await erc20.balanceOf(signer.address);
  } catch (error) {
    return Promise.resolve(false);
  }
  if (!balance) {
    return Promise.resolve(false);
  }
  return Promise.resolve(true);
}
export class Rain1155 extends RainContract {
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

  public static readonly isERC20 = isERC20;
  public static readonly isERC721 = isERC721;
  public static readonly isERC1155 = isERC1155;

  public static readonly generatePriceScript = generatePriceScript;
  public static readonly generatePriceConfig = generatePriceConfig;

  public static readonly generateCanMintScript = generateCanMintScript;
  public static readonly generateCanMintConfig = generateCanMintConfig;

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
  priceScript: State;
  canMintScript: State;
  recipient: string;
  tokenURI: string;
};

export type AssetConfig = {
  name: string;
  description: string;
  lootBoxId: BigNumber;
  priceScript: StateConfigStruct;
  canMintScript: StateConfigStruct;
  currencies: string[];
  recipient: string;
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
