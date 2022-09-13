/* eslint-disable prettier/prettier */
import { AddressBook } from '../addresses';
import { Rain1155__factory, Rain1155 as Rain1155Contract } from '../typechain';
import {
  CurrencyType,
  price,
  allowance
} from './types';
import {
  Signer,
  BytesLike,
  BigNumber,
  BigNumberish,
  ContractTransaction
} from 'ethers';
import {
  TxOverrides,
  ReadTxOverrides,
  RainContract,
  ERC20,
  ERC1155,
  StateConfig,
  RuleBuilder,
  Currency,
  Condition,
  ConditionGroup,
  Quantity,
  Price
} from 'rain-sdk';

/**
 * @public
 * Class to interact with Rain1155 contract methods and crreate assets with rules
 * 
 * ```typescript
 * // To instantiate a Rain1155 contract:
 * import { Rain1155 } from 'rain-game-sdk';
 * const newRain1155contract = new Rain1155(signer [, address])
 * 
 * // To get the price of minting for a currency:
 * const price = await Rain1155.getPrice(assetId, paymentTokenAddress, buyerAddress, targetUnits)
 * 
 * // To get an Asset's asset details:
 * const assetDetails = await Rain1155.assets(assetId)
 * 
 * // To generate the vm StateConfig from an array of Currency object(s):
 * const vmStateConfig = Rain1155.getStateConfig([currency1, currency2, ...])
 * ```
 */
export class Rain1155 extends RainContract {
  protected static readonly nameBookReference = 'Rain1155';

  /**
   * Constructs a new Rain1155 from a known address.
   *
   * @param signer - An ethers.js Signer
   * @param address - (optional) The address of the Rain1155 contract, originally is 
   * fetched from the addressbook, but if passed it will ignore the addressbook
   * @returns A new Rain1155 instance
   *
   */
  constructor(signer: Signer, address?: string) {
    if (address === undefined) {
      (async () => {
        address = AddressBook.getAddressesForChainId(
          await signer.getChainId()
        ).rain1155
      })()
    }

    super(address!, signer);
    const _rain1155 = Rain1155__factory.connect(address!, signer);

    this.assets = _rain1155.assets;
    this.balanceOf = _rain1155.balanceOf;
    this.balanceOfBatch = _rain1155.balanceOfBatch;
    this.getAssetMaxUnits = _rain1155.getAssetMaxUnits;
    this.createNewAsset = _rain1155.createNewAsset;
    this.getCurrencyPrice = _rain1155.getCurrencyPrice;
    this.getAssetCost = _rain1155.getAssetCost;
    this.isApprovedForAll = _rain1155.isApprovedForAll;
    this.mintAssets = _rain1155.mintAssets;
    this.safeBatchTransferFrom = _rain1155.safeBatchTransferFrom;
    this.safeTransferFrom = _rain1155.safeTransferFrom;
    this.setApprovalForAll = _rain1155.setApprovalForAll;
    this.supportsInterface = _rain1155.supportsInterface;
    this.totalAssets = _rain1155.totalAssets;
    this.uri = _rain1155.uri;
    this.contract = _rain1155;
  }

  public readonly connect = (signer: Signer): Rain1155 => {
    return new Rain1155(signer, this.address);
  };

  public static getBookAddress(chainId: number): string {
    return AddressBook.getAddressesForChainId(chainId)[this.nameBookReference];
  }

  public static readonly subgraph =
    'https://api.thegraph.com/subgraphs/name/beehive-innovation/vapour-game-1155';


  public static readonly generateStateConfig = (
    currencies: Currency[]
  ): RuleBuilder => {
    return new RuleBuilder(currencies);
  };

  public static readonly getConditionGroupConfig = (
    conditionGroup: ConditionGroup
  ): StateConfig => {
    return RuleBuilder.getConditionGroupConfig(conditionGroup);
  }

  public static readonly getConditionConfig = (
    condition: Condition
  ): StateConfig => {
    return RuleBuilder.getConditionConfig(condition);
  }

  public static readonly getQuantityConfig = (
    quantity: Quantity
  ): StateConfig => {
    return RuleBuilder.getQPConfig(quantity);
  }

  public static readonly getPriceConfig = (
    price: Price
  ): StateConfig => {
    return RuleBuilder.getQPConfig(price);
  }

  public readonly getPrice = async (
    _assetId: BigNumberish,
    _paymentTokenIndex: BigNumberish,
    _account: string,
    _units: BigNumberish
  ): Promise<price> => {
    let price = await this.getCurrencyPrice(
      _assetId,
      _paymentTokenIndex,
      _account,
      _units
    );

    let rawCurrencies = (await this.assets(_assetId)).currencies;
    let currencies = [];
    for (let i = 0; i < rawCurrencies.token.length; i++) {
      if (rawCurrencies.tokenType[i].eq(0)) {
        currencies[i] = {
          tokenType: CurrencyType.ERC20,
          tokenAddress: rawCurrencies.token[i],
          tokenId: rawCurrencies.tokenId[i],
          index: i,
        }
      } else if (rawCurrencies.tokenType[i].eq(1)) {
        currencies[i] = {
          tokenType: CurrencyType.ERC1155,
          tokenAddress: rawCurrencies.token[i],
          tokenId: rawCurrencies.tokenId[i],
          index: i,
        }
      } else {
        throw new Error("unknown token type")
      }
    }

    return {
      token: currencies[Number(_paymentTokenIndex)],
      units: price
    } as price
  };

  public readonly checkAllowance = async (
    assetId: BigNumberish,
    prices: price[],
    units: BigNumberish,
    rain1155Address: string,
    signer: string
  ): Promise<allowance[]> => {
    let allowances: allowance[] = [];
    for (let i = 0; i < prices.length; i++) {
      let price = prices[i];
      if (price.token.tokenType === CurrencyType.ERC20) {
        let ERC20Contract = new ERC20(price.token.tokenAddress, this.signer);
        let amount = (
          await this.getPrice(assetId, price.token.index, await this.signer.getAddress(), units)
        ).units;
        let allowed = await ERC20Contract.allowance(signer, rain1155Address);
        allowances.push({
          type: CurrencyType.ERC20,
          address: price.token.tokenAddress,
          allowed: allowed >= amount ? true : false,
          amount: allowed >= amount ? BigNumber.from(0) : amount.sub(allowed),
          name: await ERC20Contract.name(),
          symbol: await ERC20Contract.name(),
        });
      } else {
        let ERC1155Contract = new ERC1155(
          price.token.tokenAddress,
          this.signer
        );
        let erc1155Price = await this.getPrice(
          assetId,
          price.token.index,
          await this.signer.getAddress(),
          units
        );
        let allowed = await ERC1155Contract.isApprovedForAll(
          signer,
          rain1155Address
        );
        let tokenURI: string;
        try {
          tokenURI = erc1155Price.token.tokenId
            ? await ERC1155Contract.uri(erc1155Price.token.tokenId)
            : '';
        } catch (error) {
          tokenURI = `TokenID ${erc1155Price.token.tokenId} may not exist now`;
        }
        allowances.push({
          type: CurrencyType.ERC1155,
          address: price.token.tokenAddress,
          allowed: allowed,
          amount: allowed ? BigNumber.from(0) : erc1155Price.units,
          tokenId: erc1155Price.token.tokenId,
          tokenURI: tokenURI,
        });
      }
    }

    return allowances;
  };

  public readonly contract: Rain1155Contract

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

  public readonly getAssetMaxUnits: (
    _assetId: BigNumberish,
    _account: string,
    _units: BigNumberish,
    overrides?: ReadTxOverrides
  ) => Promise<BigNumber>;

  public readonly createNewAsset: (
    _config: AssetConfig,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly getCurrencyPrice: (
    _assetId: BigNumberish,
    _paymentToken: BigNumberish,
    _account: string,
    _units: BigNumberish,
    overrides?: ReadTxOverrides
  ) => Promise<BigNumber>;

  public readonly getAssetCost: (
    _assetId: BigNumberish,
    _account: string,
    _units: BigNumberish,
    overrides?: TxOverrides
  ) => Promise<[BigNumber, BigNumber[]]>;

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

/**
 * @public
 * Type for valid currencies config
 */
export type CurrencyConfig = {
  token: string[];
  tokenId: BigNumberish[];
  tokenType: BigNumberish[];
};

/**
 * @public
 * Type of output of Currencies
 */
export type CurrencyDetail = {
  token: string[];
  tokenType: BigNumber[];
  tokenId: BigNumber[] 
};

/**
 * @public
 * Type of asset details returned by Rain1155.assets method
 */
export type AssetDetails = {
  lootBoxId: BigNumber;
  id: BigNumber;
  vmStateConfig: StateConfig;
  vmStatePointer: string;
  currencies: CurrencyDetail;
  recipient: string;
  tokenURI: string;
};

/**
 * @public
 * Type of asset's config used for creating new assets
 */
export type AssetConfig = {
  name: string;
  description: string;
  lootBoxId: BigNumberish;
  vmStateConfig: StateConfig;
  currencies: CurrencyConfig;
  recipient: string;
  tokenURI: string;
};