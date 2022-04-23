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
  State as StateConfig,
} from 'rain-sdk';

import { GameAssets__factory, GameAssetsFactory__factory } from './typechain';
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

    this.Admin2 = _gameAssets.functions.Admin;

    this.Admin = _gameAssets.Admin;
    this.RemoveCreator = _gameAssets.RemoveCreator;
    this.addCreator = _gameAssets.addCreator;
    this.assets = _gameAssets.assets;
    this.balanceOf = _gameAssets.balanceOf;
    this.balanceOfBatch = _gameAssets.balanceOfBatch;
    this.createClass = _gameAssets.createClass;
    this.createNewAsset = _gameAssets.createNewAsset;
    this.getAssetPrice = _gameAssets.getAssetPrice;
    this.getClasses = _gameAssets.getClasses;
    this.getCreators = _gameAssets.getCreators;
    this.isApprovedForAll = _gameAssets.isApprovedForAll;
    this.mintAssets = _gameAssets.mintAssets;
    this.onERC1155BatchReceived = _gameAssets.onERC1155BatchReceived;
    this.onERC1155Received = _gameAssets.onERC1155Received;
    this.owner = _gameAssets.owner;
    this.renounceOwnership = _gameAssets.renounceOwnership;
    this.safeBatchTransferFrom = _gameAssets.safeBatchTransferFrom;
    this.safeTransferFrom = _gameAssets.safeTransferFrom;
    this.setAdmin = _gameAssets.setAdmin;
    this.setApprovalForAll = _gameAssets.setApprovalForAll;
    this.setBaseURI = _gameAssets.setBaseURI;
    this.supportsInterface = _gameAssets.supportsInterface;
    this.totalAssets = _gameAssets.totalAssets;
    this.transferOwnership = _gameAssets.transferOwnership;
    this.updateAsset = _gameAssets.updateAsset;
    this.uri = _gameAssets.uri;
    this.withdraw = _gameAssets.withdraw;
    this.withdrawERC1155 = _gameAssets.withdrawERC1155;
  }

  /**
   * Deploys a new GameAssets.
   *
   * @param signer - An ethers.js Signer
   * @param args - Arguments for deploying a GameAssets @see GameAssetsDeployArgs
   * @param overrides - Specific transaction values to send it (e.g gasLimit, nonce or gasPrice)
   * @returns A new GameAssets instance
   *
   */
  public static deploy = async (
    signer: Signer,
    args: GameAssetsDeployArgs,
    overrides: TxOverrides = {}
  ): Promise<GameAssets> => {
    const gameAssetsFactory = GameAssetsFactory__factory.connect(
      this.getBookAddress(await this.getChainId(signer)),
      signer
    );

    const tx = await gameAssetsFactory.createChildTyped(args, overrides);
    const receipt = await tx.wait();
    const address = this.getNewChildFromReceipt(receipt, gameAssetsFactory);
    return new GameAssets(address, signer);
  };

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

  public static getBookAddress(chainId: number): string {
    return AddressBook.getAddressesForChainId(chainId)[this.nameBookReference];
  }

  public readonly Admin: (overrides?: ReadTxOverrides) => Promise<string>;
  public readonly Admin2: (overrides?: ReadTxOverrides) => Promise<[string]>;

  public readonly RemoveCreator: (
    _creator: string,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly addCreator: (
    _creator: string,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

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

  public readonly createClass: (
    _name: string,
    _description: string,
    _attributes: string[],
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

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

  public readonly getClasses: (
    overrides?: ReadTxOverrides
  ) => Promise<BigNumber[]>;

  public readonly getCreators: (
    overrides?: ReadTxOverrides
  ) => Promise<string[]>;

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

  public readonly onERC1155BatchReceived: (
    arg0: string,
    arg1: string,
    arg2: BigNumberish[],
    arg3: BigNumberish[],
    arg4: BytesLike,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly onERC1155Received: (
    arg0: string,
    arg1: string,
    arg2: BigNumberish,
    arg3: BigNumberish,
    arg4: BytesLike,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly owner: (overrides?: ReadTxOverrides) => Promise<string>;

  public readonly renounceOwnership: (
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

  public readonly setAdmin: (
    _admin: string,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly setApprovalForAll: (
    operator: string,
    approved: boolean,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly setBaseURI: (
    _baseURI: string,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly supportsInterface: (
    interfaceId: BytesLike,
    overrides?: ReadTxOverrides
  ) => Promise<boolean>;

  public readonly totalAssets: (
    overrides?: ReadTxOverrides
  ) => Promise<BigNumber>;

  public readonly transferOwnership: (
    newOwner: string,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly updateAsset: (
    _assetId: BigNumberish,
    _lootBoxId: BigNumberish,
    _canMintConfig: StateConfig,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly uri: (
    _tokenId: BigNumberish,
    overrides?: ReadTxOverrides
  ) => Promise<string>;

  public readonly withdraw: (
    _tokenAddresses: string[],
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly withdrawERC1155: (
    _tokenAddresses: string[],
    _ids: BigNumberish[],
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;
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
  assetClass: BigNumber;
  rarity: number;
  creator: string;
};

export type AssetConfig = {
  name: string;
  description: string;
  lootBoxId: BigNumberish;
  priceConfig: StateConfig;
  canMintConfig: StateConfig;
  currencies: string[];
  assetClass: BigNumberish;
  rarity: BigNumberish;
};

// TODO: Update the rain-sdk to use the correctState
export type State = {
  stackIndex: BigNumber;
  stack: BigNumber[];
  sources: string[];
  constants: BigNumber[];
  arguments: BigNumber[];
};
