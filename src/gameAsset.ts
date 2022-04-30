import {
  Signer,
  BytesLike,
  BigNumber,
  BigNumberish,
  ContractTransaction,
} from 'ethers';
import {
  TxOverrides,
  ReadTxOverrides,
  FactoryContract,
  State,
  StateConfig,
} from 'rain-sdk';

import { GameAssets__factory } from './typechain';
import { AddressBook } from './addresses';

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

export class GameAssets extends FactoryContract {
  protected static readonly nameBookReference = 'gameAssetsFactory';

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

  /**
   * Checks if address is registered as a child contract of this GameAssetsFactory on a specific network
   *
   * @param signer - An ethers.js Signer
   * @param maybeChild - Address to check registration for.
   * @returns `true` if address was deployed by this contract factory, otherwise `false`
   */
  public static isChild = async (
    signer: Signer,
    maybeChild: string
  ): Promise<boolean> => {
    return await this._isChild(signer, maybeChild);
  };

  public readonly connect = (signer: Signer): GameAssets => {
    return new GameAssets(this.address, signer);
  };
  public static getBookAddress(chainId: number): string {
    return AddressBook.getAddressesForChainId(chainId)[this.nameBookReference];
  }

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

export type GameAssetsDeployArgs = {
  _creator: string;
  _baseURI: string;
};

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
  priceConfig: StateConfig;
  canMintConfig: StateConfig;
  currencies: string[];
  recepient: string;
  tokenURI: string;
};
