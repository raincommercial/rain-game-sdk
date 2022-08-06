import { BigNumber, BigNumberish } from 'ethers';

/**
 * enum for type of payment currency
 */
export enum CurrencyType {
  /**
   * for native token
   */
  NATIVE,
  /**
   * for ERC20 TOkens
   */
  ERC20,
  /**
   * for ERC1155  Tokens
   */
  ERC1155,
}

/**
 * Type for token used in price type
 */
export type token = {
  tokenType: number;
  tokenAddress: string;
  tokenId?: BigNumberish;
};

/**
 * Type for price as a result of Rain1155 contract call
 */
export type price = {
  token: token;
  units: BigNumber;
};

/**
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
