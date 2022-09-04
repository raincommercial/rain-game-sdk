import { BigNumber, BigNumberish } from 'ethers';

/**
 * @public
 * enum for type of payment currency
 */
export enum CurrencyType {
  /**
   * for native token
   */
  NATIVE,
  /**
   * for ERC20 tokens
   */
  ERC20,
  /**
   * for ERC721 tokens
   */
  ERC721,
  /**
   * for ERC1155 tokens
   */
  ERC1155,
}

/**
 * @public
 * Type for token used in price type
 */
export type token = {
  tokenType: number;
  tokenAddress: string;
  tokenId?: BigNumberish;
};

/**
 * @public
 * Type for price as a result of Rain1155 contract call
 */
export type price = {
  token: token;
  units: BigNumber;
};

/**
 * @public
 * Type for allowence
 */
export type allowance = {
  type: number;
  address: string;
  allowed: boolean;
  amount?: BigNumber;
  tokenId?: BigNumberish;
  tokenURI?: string;
  name?: string;
  symbol?: string;
};
