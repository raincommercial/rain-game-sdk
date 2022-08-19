const addressBook = [
  {
    /**
     * Mumbai chain
     */
    chainId: 80001,
    addresses: {
      rain1155: '0xb800313e8dAf245FAD28743590C7016a25248A90',
    },
  },
  {
    /**
     * Hardhat netwrok (for test purposes)
     */
    chainId: 31337,
    addresses: {
      rain1155: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    },
  },
];

const subgraphBook: Record<number, string> = {
  /**
   * Mumbai subgraph endpoint
   */
  8001: 'https://api.thegraph.com/subgraphs/name/rouzwelt/rain1155',
};

/**
 * @public
 * Type for all the addresses stored in the Book
 */
export type Addresses = {
  [key: string]: string;
  rain1155: string;
};

/**
 *  @public
 * Class related to handle and obtain all the addresses and tools (like Subgraph) deployed by chain and stored in the SDK.
 *
 * @remarks
 * It will get all the addresses deployed and added at the time of the current version. If the class and methods are used directly, the chain ID should
 * be provided directly too.
 */
export class AddressBook {
  /**
   * Obtain all the addresses deployed in a specific network with a chain ID.
   *
   * @param chainId - The chain ID to get all the adddresses deployed in that network.
   * @returns All the addresses for the network provided.
   */
  public static getAddressesForChainId = (chainId: number): Addresses => {
    const network = addressBook.find(n => n.chainId === chainId);
    if (!network?.addresses) {
      throw new Error('No deployed contracts for this chain.');
    }
    return network.addresses;
  };

  /**
   * Obtain the latest subgraph endpoint related to the version that use the SDK.
   *
   * @remarks
   * The reason of get just one endpoint by version is correctly match with the contract addresses provided by the SDK.
   *
   * You can search all the rain protocol subgraphs deployed using the search bar in https://thegraph.com/hosted-service/. Remember
   * to look by subgraph deployed by beehive-innovation or trusted deployers.
   *
   * @param chainId - The chain ID related to the Subgraph.
   * @returns The subgraph URL API endpoint.
   */
  public static getSubgraphEndpoint = (chainId: number): string => {
    const endpoint = subgraphBook[chainId];
    if (!endpoint) {
      throw new Error('No subgraph endpoint found for this chain.');
    }

    return endpoint;
  };
}
