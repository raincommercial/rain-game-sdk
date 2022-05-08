import { ethers } from 'hardhat';
import { BigNumberish } from 'ethers';
import { assert } from 'chai';

import {
  ReserveToken,
  ReserveTokenERC1155,
  ReserveTokenERC721,
} from '../typechain';

export const eighteenZeros = '000000000000000000';

/**
 * Hardhat network chainID
 */
export const chainId = 31337;

/**
 * Enum for each Tier
 */
export enum Tier {
  ZERO,
  ONE,
  TWO,
  THREE,
  FOUR,
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
}

/**
 * Return the Levels tier used by default. LEVELS always will be an array with 8 elements to
 * correspond to the 8 TierLevels
 */
export const TierLevels: BigNumberish[] = Array.from(
  Array(8).keys()
).map(value => ethers.BigNumber.from(++value + eighteenZeros)); // [1,2,3,4,5,6,7,8]

/**
 * Addresses saved that are in SDK BookAddresses deployed to Hardhat network.
 * **These addresses are deterministically generated with the HH signers.**
 */
export interface Addresses {
  GameAssetsFactory?: string;
  Rain1155: string;
}

export async function deployErc20(): Promise<ReserveToken> {
  const TokenFactory = await ethers.getContractFactory('ReserveTokenTest');
  return (await TokenFactory.deploy()) as ReserveToken;
}

export async function deployErc721(): Promise<ReserveTokenERC721> {
  const TokenFactory = await ethers.getContractFactory('ReserveTokenERC721');
  return (await TokenFactory.deploy(
    'TestToken721',
    'TT721'
  )) as ReserveTokenERC721;
}

export async function deployErc1155(): Promise<ReserveTokenERC1155> {
  const TokenFactory = await ethers.getContractFactory('ReserveTokenERC1155');
  return (await TokenFactory.deploy()) as ReserveTokenERC1155;
}

/**
 * Expect that a async function/Promise throw an Error. Should be use only for
 * JS errors. To catch error in EVM, should use the ethereum-waffle library.
 *
 * @param cb - async functon or Promise (same)
 * @param errorMsg - (optional) Error message that is expected
 */
export async function expectAsyncError(
  cb: Promise<unknown>,
  errorMsg?: string
): Promise<void> {
  try {
    await cb;
    assert(false, 'no error was throw');
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown Error';

    if (message === 'no error was throw') {
      if (errorMsg) {
        assert(false, `Expected an error with "${errorMsg}" but ${message}`);
      }
      assert(false, message);
    }

    if (!errorMsg) {
      return;
    }

    if (errorMsg === message) {
      return;
    } else {
      assert(
        false,
        `Expected an error with "${errorMsg}" but got "${message}"`
      );
    }
  }
}

export const mockSubgraphReceipt = () => {};
