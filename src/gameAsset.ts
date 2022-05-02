import {
  Signer,
  BytesLike,
  BigNumber,
  BigNumberish,
  ContractTransaction,
} from 'ethers';
import { TxOverrides, ReadTxOverrides, FactoryContract } from 'rain-sdk';

import { GameAssets__factory } from './typechain';
import { AddressBook } from './addresses';
import { StateConfigStruct } from './typechain/GameAssets';
import { concat, Conditions, op, Opcode, Type, VMState } from './utils';

/**
 * @public
 * A class for deploying and calling methods in GameAssets contract.
 *
 *
 * @remarks
 *   This class provides an easy way to deploy and interact with GameAsset contracts
 *
 * @example
 * ```typescript
 * import { GameAssets } from 'rain-sdk'
 *
 * // To deploy a new GameAssets, pass an ethers.js Signerand the config for the GameAsset.
 * const newGameAssets = await GameAssets.deploy(signer, args)
 *
 * // To connect to an existing GameAssets just pass the address and an ethers.js Signer.
 * const existingGameAssets = new GameAssets(address, signer)
 *
 * // Once you have a GameAssets, you can call the smart contract methods:
 * ```
 *
 */

const generatePriceScript = (prices: price[]): [VMState, string[]] => {
  let pos = -1;
  let currencies: string[] = [];
  let sources: BytesLike[] = [];
  let constants: BigNumberish[] = [];
  let i;
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
      if (obj.currency.tokenId) constants.push(obj.currency.tokenId);
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

const generateCanMintScript = (conditions: condition[]): VMState => {
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
      if (condition.blockNumber) constants.push(condition.blockNumber);
      sources.push(op(Opcode.BLOCK_NUMBER));
      sources.push(op(Opcode.VAL, ++pos));
      sources.push(op(Opcode.GREATER_THAN));
    } else if (condition.type === Conditions.BALANCE_TIER) {
      if (condition.tierAddress) constants.push(condition.tierAddress);
      if (condition.tierCondition) constants.push(condition.tierCondition);
      sources.push(op(Opcode.VAL, ++pos));
      sources.push(op(Opcode.SENDER));
      sources.push(op(Opcode.REPORT));
      sources.push(op(Opcode.BLOCK_NUMBER));
      sources.push(op(Opcode.REPORT_AT_BLOCK));
      sources.push(op(Opcode.VAL, ++pos));
      sources.push(op(Opcode.GREATER_THAN));
    } else if (condition.type === Conditions.ERC20BALANCE) {
      if (condition.address) constants.push(condition.address);
      if (condition.balance) constants.push(condition.balance);
      sources.push(op(Opcode.VAL, ++pos));
      sources.push(op(Opcode.SENDER));
      sources.push(op(Opcode.IERC20_BALANCE_OF));
      sources.push(op(Opcode.VAL, ++pos));
      sources.push(op(Opcode.GREATER_THAN));
    } else if (condition.type === Conditions.ERC721BALANCE) {
      if (condition.address) constants.push(condition.address);
      if (condition.balance) constants.push(condition.balance);
      sources.push(op(Opcode.VAL, ++pos));
      sources.push(op(Opcode.SENDER));
      sources.push(op(Opcode.IERC721_BALANCE_OF));
      sources.push(op(Opcode.VAL, ++pos));
      sources.push(op(Opcode.GREATER_THAN));
    } else if (condition.type === Conditions.ERC1155BALANCE) {
      if (condition.address) constants.push(condition.address);
      if (condition.id) constants.push(condition.id);
      if (condition.balance) constants.push(condition.balance);
      sources.push(op(Opcode.VAL, ++pos));
      sources.push(op(Opcode.SENDER));
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
export class GameAssets extends FactoryContract {
  protected static readonly nameBookReference = 'gameAssets';

  /**
   * Constructs a new GameAssets from a known address.
   *
   * @param address - The address of the GameAssets contract
   * @param signer - An ethers.js Signer
   * @returns A new GameAssets instance
   *
   */
  constructor(address: string, signer: Signer) {
    super(address, signer);
    const _gameAssets = GameAssets__factory.connect(address, signer);

    this.assets = _gameAssets.assets;
    this.balanceOf = _gameAssets.balanceOf;
    this.balanceOfBatch = _gameAssets.balanceOfBatch;
    this.createNewAsset = _gameAssets.createNewAsset;
    this.getAssetPrice = _gameAssets.getAssetPrice;
    this.isApprovedForAll = _gameAssets.isApprovedForAll;
    this.mintAssets = _gameAssets.mintAssets;
    this.safeBatchTransferFrom = _gameAssets.safeBatchTransferFrom;
    this.safeTransferFrom = _gameAssets.safeTransferFrom;
    this.setApprovalForAll = _gameAssets.setApprovalForAll;
    this.supportsInterface = _gameAssets.supportsInterface;
    this.totalAssets = _gameAssets.totalAssets;
    this.uri = _gameAssets.uri;
  }

  public readonly connect = (signer: Signer): GameAssets => {
    return new GameAssets(this.address, signer);
  };
  public static getBookAddress(chainId: number): string {
    return AddressBook.getAddressesForChainId(chainId)[this.nameBookReference];
  }

  public readonly generatePriceScript = generatePriceScript;
  public readonly generateCanMintScript = generateCanMintScript;

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
