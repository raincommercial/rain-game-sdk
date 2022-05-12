import { ethers } from 'hardhat';
import { BigNumberish, Contract, ContractTransaction } from 'ethers';
import { assert } from 'chai';
import fs from 'fs';
import {
  ReserveToken,
  ReserveTokenERC1155,
  ReserveTokenERC721,
} from '../typechain';
import { Result } from 'ethers/lib/utils';
import path from 'path';
import { execSync } from 'child_process';
import { ApolloFetch, createApolloFetch } from 'apollo-fetch';

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

export const getEventArgs = async (
  tx: ContractTransaction,
  eventName: string,
  contract: Contract,
  contractAddressOverride: string = ''
): Promise<Result> => {
  const address = contractAddressOverride
    ? contractAddressOverride
    : contract.address;

  const eventObj = (await tx.wait()).events?.find(
    x =>
      x.topics[0] == contract.filters[eventName]().topics?.[0] &&
      x.address == address
  );

  if (!eventObj) {
    throw new Error(`Could not find event ${eventName} at address ${address}`);
  }

  return contract.interface.decodeEventLog(eventName, eventObj.data);
};

export const fetchFile = (_path: string): string => {
  try {
    return fs.readFileSync(_path).toString();
  } catch (error) {
    console.log(error);
    return '';
  }
};

export const writeFile = (_path: string, file: any): void => {
  try {
    fs.writeFileSync(_path, file);
  } catch (error) {
    console.log(error);
  }
};

export const exec = (cmd: string): string | Buffer => {
  const srcDir = path.join(__dirname, '..');
  try {
    return execSync(cmd, { cwd: srcDir, stdio: 'inherit' });
  } catch (e) {
    throw new Error(`Failed to run command \`${cmd}\``);
  }
};

interface SyncedSubgraphType {
  synced: boolean;
}

/**
 * Create a promise to wait a determinated `ms`
 * @param ms Amount of time to wait in miliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait for the synchronization of the subgraph when it is delayed with respect to the chain. It must be used
 * after a transaction and want to be query the result immediately after that
 * @param wait Amount of time in seconds to wait before ask to the subgraph about synchronization
 * @param timeDelay Amount of time in seconds to wait between queries
 * @param seconds Max time in seconds to wait by synchronization
 * @returns Subgraph Synchronized
 */
export const waitForSubgraphToBeSynced = async (
  wait = 0,
  timeDelay = 1,
  seconds = 60,
  subgraphName = 'vishalkale151071/blocks'
): Promise<SyncedSubgraphType> => {
  if (wait > 0) {
    await delay(wait);
  }
  /**
   * Waiting for 60s by default
   * Does not care about waiting the 60s -  the function already try to handle if does not receive
   * a response. If the subgraph need to wait for a big number of blocks, would be good increse
   * the seconds to wait by sync.
   */
  const deadline = Date.now() + seconds * 1000;
  const currentBlock = await ethers.provider.getBlockNumber();

  const resp = new Promise<SyncedSubgraphType>((resolve, reject) => {
    // Function to check if the subgraph is synced asking to the GraphNode
    const checkSubgraphSynced = async () => {
      try {
        const result = await fetchSubgraphs({
          query: `
            {
              indexingStatusForCurrentVersion(subgraphName: "${subgraphName}") {
                synced
                health
                fatalError{
                  message
                  handler
                }
                chains {
                  chainHeadBlock {
                    number
                  }
                  latestBlock {
                    number
                  }
                }
              } 
            } 
          `,
        });
        const data = result.data.indexingStatusForCurrentVersion;

        if (
          data.synced === true &&
          data.chains[0].latestBlock.number == currentBlock
        ) {
          resolve({ synced: true });
        } else if (data.health === 'failed') {
          reject(new Error(`Subgraph fatalError - ${data.fatalError.message}`));
        } else {
          throw new Error(`subgraph is not sync`);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown Error';
        if (message.includes('connect ECONNREFUSED')) {
          reject(new Error(`Unable to connect to Subgraph node: ${message}`));
        }

        if (message == 'Unknown Error') {
          reject(new Error(`${message} - ${e}`));
        }

        if (!currentBlock) {
          reject(new Error(`current block is undefined`));
        }

        if (e instanceof TypeError) {
          reject(
            new Error(
              `${e.message} - Check that the subgraphName provided is correct.`
            )
          );
        }

        if (Date.now() > deadline) {
          reject(new Error(`Timed out waiting for the subgraph to sync`));
        } else {
          setTimeout(checkSubgraphSynced, timeDelay * 1000);
        }
      }
    };

    checkSubgraphSynced();
  });

  return resp;
};

// Subgraph Management
export const fetchSubgraphs = createApolloFetch({
  uri: 'http://localhost:8030/graphql',
});

export const fetchSubgraph = (subgraphName: string): ApolloFetch => {
  return createApolloFetch({
    uri: `http://localhost:8000/subgraphs/name/${subgraphName}`,
  });
};
